/**
 * The Timespan Connection Scan Algorithm transforms a stream of connections to an array of minimum spanning tree streams
 * Based on basic csa: © 2015 Pieter Colpaert -- UGent - MMLab -- iMinds
 */
"use strict";

var util = require('util'),
  Transform = require('stream').Transform,
  PriorityQueue = require('js-priority-queue'),
  Promise = require('promise');

/**
 * Creates a minimum spanning tree and returns paths as a result, using the Connection Scan Algorithm (CSA).
 * It scans each connection and checks whether we can take this connection to get a path
 */
var ResultStream = function (query, transferTimesFetcher) { //TODO: , footpathsTo) {
  Transform.call(this, { objectMode: true });
  // TODO: handle footpaths

  if (transferTimesFetcher) {
    this._transferTimesFetcher = transferTimesFetcher;
  } else {
    //when no transfer time fetcher is defined => always return the minimum transfertime
    this._transferTimesFetcher = function () { };
    this._transferTimesFetcher.get = function () {
      return new Promise(function (fulfill) {
        fulfill(0)
      });
    };
  }

  // check the fields of the query object and assign them to the object. Validate them against possible errors
  if (query) {
    this._latestArrivalTime = query.latestArrivalTime;
    this._departureStop = query.departureStop;
    this._latestDepartTime = query.latestDepartTime;
    this._arrivalStop = query.arrivalStop || "";
    if (this._departureStop === this._arrivalStop) {
      throw "You are already at this location";
    }
    if (!this._latestDepartTime) {
      throw "Please fill in 'latestDepartTime'";
    }
    this._minimumTransferTime = 0;
    if (query.minimumTransferTime) {
      this._minimumTransferTime = query.minimumTransferTime;
    }
    this._departureTime = query.departureTime;
  } else {
    throw "no query found";
  }

  // this._earliestArrivalTimes keeps a spanning tree of connections untill it finds the fastest way to the arrival station
  this._earliestArrivalTimes = [];
  // this._hasEmitted keeps track if a route is already emitted to prevent double emitting and useless recalculations
  this._hasEmitted = [];
  // this._departureTimes keeps an object of all departureTimes to not emit duplicates
  this._departureTimes = {};
  // this._shortestTravelTime keeps track of the currently found shortest travel time (starting value: 1 day)
  this._shortestTravelTime = addSeconds(new Date(0), 24 * 60 * 60);
  // this._tolerance is the time window we take to allow slightly slower routes to be emitted (half an hour)
  this._tolerance = 30 * 60 * 1000;
  // this._lastDepart is the last emitted departuretime
  this._lastDepart = this._latestDepartTime;
  // this._departures is an array of all departuretimes corresponding to the _earliestArrivalTimes (equal indexes)
  this._departures = [];

  //Counts the number of relaxed connections
  this._count = 0;
};

util.inherits(ResultStream, Transform);
/**
 * Users of this library should make sure the connections piped to this stream are ordered in time
 */
ResultStream.prototype._transform = function (connection, encoding, done) {
  var self = this;
  self._count++;
  let departureStop = connection["departureStop"];
  let arrivalStop = connection["arrivalStop"];
  let departureTime = new Date(connection["departureTime"]);
  let arrivalTime = new Date(connection["arrivalTime"]);

  // Check if this is a departure station within defined timespan
  // Start a new spanning tree if this is within timespan and departing at defined departure station
  if (departureStop === self._departureStop && departureTime.valueOf() >= self._departureTime.valueOf() &&
    departureTime.valueOf() <= new Date(self._latestDepartTime).valueOf()) {
    let index = self._earliestArrivalTimes.length;
    // Initiate spanning tree
    self._earliestArrivalTimes[index] = {};
    // Add the departure station to the spanning tree
    self._earliestArrivalTimes[index][arrivalStop] = connection;
    // Flag this as non-skippable
    self._hasEmitted[index] = false;
    // This triggers the data event
    self.push(connection);
    // Add the departure time to the array with all possible departures
    self._departures[index] = departureTime;
    // This is a departure so no use to see if this links to any spanning tree
    // Go to next connection
    return done();
  }

  // Kills instance once the depart is passed the possibly latest arrival
  // or once the last path has emitted and we past the latestdeparttime
  if (departureTime.valueOf() >
    new Date(self._latestDepartTime.valueOf() + self._tolerance + self._shortestTravelTime.valueOf()).valueOf() ||
    (departureTime.valueOf() > self._latestDepartTime.valueOf() &&
      self._hasEmitted[self._hasEmitted.length - 1])) {
    return self.emit("end", self._count);
  }

  // Skip if arrivalstop equals the user defined departure stop than go to the next connection
  // No need to return back to our startingpoint
  if (arrivalStop === self._departureStop) {
    return done();
  }

  // Loop through all possible spanning tree's
  for (let i = 0; i < self._earliestArrivalTimes.length; i++) {
    // If this has emitted skip it
    if (self._hasEmitted[i]) {
      continue;
    }

    // Check if we found a result for this one and if it really is the fastest way
    if (self._earliestArrivalTimes[i][self._arrivalStop] &&
      departureTime.valueOf() > new Date(self._earliestArrivalTimes[i][self._arrivalStop]["arrivalTime"]).valueOf()) {
      // Construct route out of spanning tree, emit result, flag spanning tree for garbage collection
      self._reconstructRoute(i);
      // Flag possibility as skippable
      self._hasEmitted[i] = true;
      // Continue to next item of array
      continue;
    }

    // check if this connection isn't a long way around, also improves performance on crowded stations/over long journeys
    if (departureTime.valueOf() >
      new Date(self._departures[i].valueOf() + self._tolerance + self._shortestTravelTime.valueOf()).valueOf()) {
      // Clear spanning tree
      self._earliestArrivalTimes[i] = null;
      // Flag this spanning tree as skippable
      self._hasEmitted[i] = true;
      // Continue to next item of array
      continue;
    }

    // Check if we can reach this connection and add it if we can
    let previousConnection = self._earliestArrivalTimes[i][connection["departureStop"]];

    // If no previousconnection is found than this conn has nothing to do with our trip...
    if (previousConnection) {
      // TODO: Fix async transfertimesfetcher
      // self._transferTimesFetcher.get(previousConnection, connection).then(function (transferTime) {

      // Calculate transfertime
      let transferTime = 0;
      // If trip uri is not equal to the one of previous connection than transfertime is user defined transfertime
      if (previousConnection["gtfs:trip"] && previousConnection["gtfs:trip"] !== connection["gtfs:trip"]) {
        transferTime = self._minimumTransferTime;
      }

      // Check if we can reach this connection
      if (self._earliestArrivalTimes[i][departureStop] &&
        addSeconds(self._earliestArrivalTimes[i][departureStop].arrivalTime, transferTime).valueOf() <= departureTime.valueOf()) {
        // If the arrival stop isn't in the earliest arrival times list, or if
        // it is and the current time is earlier than the existing arrival time, then add a new
        // earliest arrival time for self arrivalStop
        if (!self._earliestArrivalTimes[i][arrivalStop] ||
          new Date(self._earliestArrivalTimes[i][arrivalStop]["arrivalTime"]).valueOf() > arrivalTime.valueOf()) {
          // Add a connection to the spanning tree
          self._earliestArrivalTimes[i][arrivalStop] = connection;
          // This triggers the data event
          self.push(connection);
        }
      }
      // });
    }
  }

  // Continue to next connection
  return done();
};

ResultStream.prototype._reconstructRoute = function (i) {
  let path = [];
  let previous = this._earliestArrivalTimes[i][this._arrivalStop];
  while (previous) {
    path.push(previous);
    previous = this._earliestArrivalTimes[i][previous["departureStop"]];
  }
  // Reverse path because we reconstruct it from arrival to depart
  path = path.reverse();
  // Emit the result if we have,'t emitted any depart at same time
  // Validate trip & see if the traveltime is not way longer than the shortest solutions
  let travelTime = calcTravelTime(path[0], path[path.length - 1]);
  if (!this._departureTimes[new Date(path[0]["departureTime"]).toTimeString()]) {
    // Update lastdepart with this route
    this._lastDepart = new Date(path[0]["departureTime"]);
    // Emit the found route as a result
    this.emit("result", path);
    // Flag this departuretime as emitted
    this._departureTimes[this._lastDepart.toTimeString()] = true;
  }
  // If this traveltime is shorter than shortest than we found an even shorter one! Replace it.
  if (travelTime.valueOf() < this._shortestTravelTime.valueOf()) {
    this._shortestTravelTime = travelTime;
  }
  // Flag spanning tree for garbage collection
  this._earliestArrivalTimes[i] = null;
};


ResultStream.prototype._flush = function (done) {
  // If there was no connection with departure time exceeding earliest arrival time
  for (let i = 0; i < this._earliestArrivalTimes.length; i++) {
    if (!this._hasEmitted[i] && this._earliestArrivalTimes[i][this._arrivalStop]) {
      this._reconstructRoute(i);
      this._hasEmitted[i] = true;
    }
  }
  done();
};

function calcTravelTime(departConn, arrivalConn) {
  let departure = new Date(departConn["departureTime"]);
  let arrival = new Date(arrivalConn["arrivalTime"]);

  return new Date(arrival.valueOf() - departure.valueOf());
}

function addSeconds(date, seconds) {
  return new Date(date.valueOf() + seconds * 1000);
}

module.exports = ResultStream;