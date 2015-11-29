var Readable = require('stream').Readable,
    Transform = require('stream').Transform,
    util = require('util'),
    AddStreamNameTransformer = require('./AddStreamNameTransformer');

/** A merger returns connections from different endpoints while maintaining departure time ordered. */
var MergeStream = function(connectionsStreams, departureTimeSync) {
  Readable.call(this, {objectMode: true});
  var self = this;
  this._connectionsStreams = [];
  this._amountStreams = 0;
  this._connectionsStreamIndex = {}; // map connectionsStream name on index
  this._queues = []; // Every queue contains ordered connections
  this._departureTime = departureTimeSync; // Keeps track of departureTime that we return connections from
  this._maxInQueues = departureTimeSync; // Maximum departure time in queue
  this._amountConnectionsInQueues = {}; // Counts amount of connections inside queues per stream

  for (var k=0; k<connectionsStreams.length; k++) {
    var streamName = connectionsStreams[k][0];
    var connectionsStream = connectionsStreams[k][1];
    this.addConnectionsStream(streamName, connectionsStream);
  }
};

util.inherits(MergeStream, Readable);

/**
 * Adds a connections stream to the merger
 * connectionsStream is array of stream name and stream itself
 */
MergeStream.prototype.addConnectionsStream = function (streamName, connectionsStream) {
  var self = this;
  var index = this._connectionsStreams.length;
  this._connectionsStreamIndex[streamName] = index; // map name - index stream
  this._amountConnectionsInQueues[streamName] = 0;
  this._amountStreams++;

  this._connectionsStreams[index] = connectionsStream
                                    .pipe(new AddStreamNameTransformer(streamName));

  // Add event listener to stream
  this._connectionsStreams[index].on('data', function (connection) {
    // Don't process departed connection
    if (connection['departureTime'] >= self._departureTime) {
      // Count available connections per stream
      self._amountConnectionsInQueues[connection['streamName']]++;
      self._connectionListener(connection);
    }
  });

  this._connectionsStreams[index].on('end', function() {
    self._amountStreams--;
    var index = self._connectionsStreams.indexOf(this);
    self._connectionsStreams[index] = null;

    if (self._amountStreams == 0) {
      self.close();
    } else {
      self._read();
    }
  });
};

// Returns all connections that depart
MergeStream.prototype._read = function() {
  if (this._streamsPaused()) {
    if (this._allActiveStreamsAvailable()) {
      var connection = this._next();
      if (connection != null) {
        this.push(connection);
      } else {
        // _activeStreams is for some reason not always correct
        for (var k=0; k<this._connectionsStreams.length; k++) {
          if (this._connectionsStreams[k] != null) {
            this._connectionsStreams[k].resume();
          }
        }
      }
    } else {
      for (var k=0; k<this._connectionsStreams.length; k++) {
        if (this._connectionsStreams[k] != null) {
          this._connectionsStreams[k].resume();
        }
      }
    }
  }
};

// Returns minimum connection from queues
MergeStream.prototype._next = function() {
  var minimumTime = null;

  var i = 0;
  while (i <= this._queues.length) {
    if (this._queues[i] && this._queues[i].length > 0) {
      if (this._queues[i][0]['departureTime'] == this._departureTime) {
        var connection = this._queues[i].shift();
        this._amountConnectionsInQueues[connection['streamName']] -= 1;
          return connection;
      } else if (this._queues[i] && (minimumTime == null || this._queues[i][0]['departureTime'] < minimumTime)) {
        minimumTime = this._queues[i][0]['departureTime']; // New minimum departure time
      }
    }
    i++;
  }

  if (minimumTime != null || minimumTime > this._departureTime) {
    // Update departure time tracker
    this._departureTime = minimumTime;
    return this._next();
  } else {
    // Queues are empty
    return null;
  }
};

MergeStream.prototype.close = function () {
  // Flush queues
  var connection = this._next();
  while (connection != null) {
    this.push(connection);
    connection = this._next();
  }

  this._queues = [];

  this.push(null);
};

MergeStream.prototype._connectionListener = function(connection) {
  // Load connections until connection is bigger then latest departure time

  if (connection['departureTime'] > this._maxInQueues) {
    // Pause the stream
    var streamName = connection['streamName'];
    var streamIndex = this._connectionsStreamIndex[streamName];
    // If not ended
    if (this._connectionsStreams[streamIndex] != null) {
      this._connectionsStreams[streamIndex].pause();
    }

    this._read();
  }

  // Add connection to queues
  this._addConnection(connection);
};

// Adds connection to queues
MergeStream.prototype._addConnection = function (connection) {
  var added = false;

  var i = 0;
  while (!added && i<this._queues.length) {
    var length = this._queues[i].length;

    // If the queue is empty or connection departureTime is later then last connection in the queue
    if (length === 0 || this._queues[i][length - 1]['departureTime'] <= connection['departureTime']) {
      this._queues[i].push(connection);
      added = true;
    }
    i++;
  }

  if (!added) {
    // add new queue
    var newQueue = [ connection ];
    this._queues.push(newQueue);
  }

  // Update maximum departure time in queue
  if (connection['departureTime'] > this._maxInQueues) {
    this._maxInQueues = connection['departureTime'];
  }
};

MergeStream.prototype._streamsPaused = function() {
  for (var i=0; i<this._connectionsStreams.length; i++) {
    if (this._connectionsStreams[i] != null && this._amountStreams == this._amountConnectionsInQueues.length && !this._connectionsStreams[i].isPaused()) {
      return false;
    }
  }
  return true;
};

// Every active stream must have connections in the queues
MergeStream.prototype._allActiveStreamsAvailable = function() {
  for (var streamName in this._amountConnectionsInQueues) {
    var amountOfConnectionsInQueue = this._amountConnectionsInQueues[streamName];
    if (amountOfConnectionsInQueue == 0) {
      if (Object.keys(this._amountConnectionsInQueues).length == this._amountStreams) {
        return false;
      } else {
        // The stream has ended
        var removeStreamIndex = this._connectionsStreamIndex[streamName];
        this._connectionsStreams[removeStreamIndex] = null;
        delete this._amountConnectionsInQueues[streamName];
      }
    }
  }
  return true;
}

module.exports = MergeStream;