var util = require('util')
  , Transform = require('stream').Transform

/**
 * Creates a minimum spanning tree and returns paths as a result, using the Connection Scan Algorithm (CSA).
 * It scans each connection and checks whether we can take this connection to get a path
 */
var ResultStream = function (query, footpathsTo) {
  Transform.call(this, {objectMode: true});
  //footpathsTo calculates all known footpaths from certain stops to a given stop
  this._footpathsTo = footpathsTo || function (stop) { return []; };
  //Contains for each stop an object of: arrival time and connection id
  this._earliestArrivalTimes = {};
  //check the fields of query and assign them to the object. Validate them against possible errors
  if (query) {
    this._latestArrivalTime = query.latestArrivalTime;
    this._departureStop = query.departureStop;
    this._arrivalStop = query.arrivalStop;
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
};

util.inherits(ResultStream, Transform);

/**
 * Users of this library should make sure the connections piped to this stream are ordered in time
 */
ResultStream.prototype._transform = function (connection, encoding, done) {
  this._count++;
  var departureStop = connection["departureStop"];
  var arrivalStop = connection["arrivalStop"];
  
  //If the connection we encounter is a departure stop that is reachable: we can proceed. We calculate the reachability in 2 ways:
  // * We check whether we have an earliest arrival time already at the departure stop
  // * We check whether we could have _walked_ here from another stop, or whether or not we should _change_ at this station. This will however raise the potential departure time
  
  //get a list of possible previous connections by: checking footpaths and adding changetimes if it's not from the same gtfs:trip
  
  // check whether it's from the same trip
  
  if (this._earliestArrivalTimes[departureStop] && this._earliestArrivalTimes[departureStop].arrivalTime < connection.departureTime) {
    
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
      this.emit("new_eat", connection);
      
      //3. check whether we've found a result and return it, otherwise, continue
      if (this._arrivalStop && arrivalStop === this._arrivalStop) {
        done(null, this._reconstructRoute());
      } else {
        done();
      }
    } else {
      done();
    }
  }
  
  //the departure stop is not reachable: skip this one
  else {
    done();
  }
};

ResultStream.prototype._reconstructRoute = function () {
  var path = [];
  var previous = this._minimumSpanningTree[this._earliestArrivalTimes[this._arrivalStop]["@id"]];
  while (previous) {
    path.unshift(previous);
    previous = this._minimumSpanningTree[previous.previous];
  }
  return path;
};

module.exports = ResultStream;
