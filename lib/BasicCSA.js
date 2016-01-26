/**
 * The Basic Connection Scan Algorithm transforms a stream of connections to a minimum spanning tree stream
 * © 2015 Pieter Colpaert -- UGent - MMLab -- iMinds
 */

var util = require('util'),
    Transform = require('stream').Transform,
    PriorityQueue = require('js-priority-queue');

/**
 * Creates a minimum spanning tree and returns paths as a result, using the Connection Scan Algorithm (CSA).
 * It scans each connection and checks whether we can take this connection to get a path
 */
var ResultStream = function (query) { //TODO: , footpathsTo) {
  Transform.call(this, {objectMode: true});
  //TODO: handle footpaths
  
  //Contains for each stop an object of: arrival time and connection id
  this._earliestArrivalTimes = {};
  // Priority queue of pending earliest arrival times
  this._pending = new PriorityQueue({ comparator: function(connectionA, connectionB) {
    return connectionA.arrivalTime - connectionB.arrivalTime;
  }});
  
  //check the fields of the query object and assign them to the object. Validate them against possible errors
  if (query) {
    this._latestArrivalTime = query.latestArrivalTime;
    this._departureStop = query.departureStop;
    this._arrivalStop = query.arrivalStop || "";
    if (this._departureStop === this._arrivalStop) {
      throw "You are already at this location";
    }
    this._departureTime = query.departureTime;
    //We need the connection here at the stop which delivered the earliest arrival time
    this._earliestArrivalTimes[this._departureStop] = { "@id" : null , arrivalTime : query.departureTime };
    //A list of connections with links to the previous connection
    this._minimumSpanningTree = {};
  } else {
    throw "no query found";
  }

  //Counts the number of relaxed connections
  this._count = 0;

  //Makes sure the result gets emitted only once when the stream stops
  this._hasEmitted = false;
};

util.inherits(ResultStream, Transform);

/**
 * Users of this library should make sure the connections piped to this stream are ordered in time
 */
ResultStream.prototype._transform = function (connection, encoding, done) {
  this._count++;
  var departureStop = connection["departureStop"];
  var arrivalStop = connection["arrivalStop"];

  //Check the pending queue first for connections that can be officially added to the MST
  while (this._pending.length > 0 && this._pending.peek().arrivalTime <= connection.departureTime) {
    var pendingConnection = this._pending.dequeue();
    //test whether we still have a match, otherwise, just throw it away
    if (this._earliestArrivalTimes[pendingConnection.arrivalStop]['@id'] == pendingConnection['@id']) {
      this.push(pendingConnection);
    }
  }
  
  //TODO:
  //If the connection we encounter is a departure stop that is reachable: we can proceed. We calculate the reachability in 2 ways:
  // * We check whether we have an earliest arrival time already at the departure stop
  // * We check whether we could have _walked_ here from another stop, or whether or not we should _change_ at this station. This will however raise the potential departure time

  // TODO: get a list of possible previous connections by: checking footpaths and adding changetimes if it's not from the same gtfs:trip
  // TODO: check whether it's from the same trip or route; If it isn't: add some minutes

  // When a connection is found whose departure time exceeds the target stop's earliest arrival time, we have found a result
  if (!this._hasEmitted && this._earliestArrivalTimes[this._arrivalStop] && connection.departureTime > this._earliestArrivalTimes[this._arrivalStop].arrivalTime) {
    this.emit("result", this._reconstructRoute());
    this._hasEmitted = true;
  }
  
  if (this._earliestArrivalTimes[departureStop] && this._earliestArrivalTimes[departureStop].arrivalTime <= connection.departureTime) {
    //If the arrival stop isn't in the earliest arrival times list, or if it is and the current time is earlier than the existing arrival time, then add a new earliest arrival time for this arrivalStop
    if (!this._earliestArrivalTimes[arrivalStop] || this._earliestArrivalTimes[arrivalStop].arrivalTime > connection["arrivalTime"]) {
      this._minimumSpanningTree[connection["@id"]] = connection;
      
      this._earliestArrivalTimes[arrivalStop] = {
        arrivalTime : connection["arrivalTime"],
        "@id" : connection["@id"]
      };

      //2. find a previous connection from which this connection can be reached in the list of connections
      connection.previous = this._earliestArrivalTimes[departureStop]["@id"];
      this._minimumSpanningTree[connection["@id"]] = connection;
      this._pending.queue(connection);
    }
  }
  //else, the departure stop is not reachable: skip this one
  
  done();
};

ResultStream.prototype._reconstructRoute = function () {
  var path = [];
  var previous = this._minimumSpanningTree[this._earliestArrivalTimes[this._arrivalStop]["@id"]];
  //Detect inf loops
  var loop = false;
  var minTime = this._earliestArrivalTimes[this._arrivalStop].arrivalTime ;
  while (previous && !loop) {
    path.unshift(previous);
    previous = this._minimumSpanningTree[previous.previous];
    if (previous && minTime >= previous.arrivalTime) {
      minTime = previous.arrivalTime;
    } else if (previous) {
      path.unshift(previous);
      console.error("Illegal minimum spanning tree found with an infinite loop (may occur due to bad data) with @id: ", previous["@id"]);
      loop = true;
    }
  }
  return path;
};


ResultStream.prototype._flush = function (done) {
  // If there was no connection with departure time exceeding earliest arrival time
  if (!this._hasEmitted && this._earliestArrivalTimes[this._arrivalStop]) {
    this.emit("result", this._reconstructRoute());
    this._hasEmitted = true;
  }
  done();
};

module.exports = ResultStream;
