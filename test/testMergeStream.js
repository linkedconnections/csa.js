var assert = require("assert"),
  fs = require('fs'),
  Deserialize = require('./data/Deserialize.js'),
  MergeStream = require('../lib/csa.js').MergeStream,
  Planner = require('../lib/csa.js').BasicCSA;

describe('connectionsStream', function () {
  it('should return connections ordered by their departure time', function (done) {
    var self = this;
    var count = 0;

    var connectionsStream = fs.createReadStream('test/data/connections-nmbs.jsonldstream', { flags: 'r' }).pipe(new Deserialize());
    connectionsStream.on('data', function (connection) {
      // Check if connections are ordered
      if (!self._departureTime) {
        self._departureTime = connection['departureTime']; // First connection departure time is minimum
      } else if (connection['departureTime'] >= self._departureTime) {
        // Update time tracker
        self._departureTime = connection['departureTime'];
      } else {
        throw new Error("Connections are not ordered by their departure time");
      }
      count++;
    });

    connectionsStream.on('end', function () {
      assert.equal(count, 74);
      done();
    });
  });
});

describe('MergeStream', function () {
  // ConnectionsStreams are supposed to be ordered already
  var connectionsStreams = [
    ['NS', fs.createReadStream('test/data/connections-ns.jsonldstream', { flags: 'r' }).pipe(new Deserialize())],
    ['NMBS', fs.createReadStream('test/data/connections-nmbs.jsonldstream', { flags: 'r' }).pipe(new Deserialize())]
  ];

  describe('#read()', function () {
    it('should return connections ordered by departure time', function (done) {
      var self = this;
      var count = 0;

      this._departureTime = new Date("2015-10-10T09:00:00.000Z"); // Should come from query
      this._mergeStream = new MergeStream(connectionsStreams, this._departureTime);

      this._mergeStream.on('data', function (connection) {
        // console.error(connection);
        if (connection['departureTime'] >= self._departureTime) {
          // Update time tracker
          self._departureTime = connection['departureTime'];
          count++;
        } else {
          count++;
          throw new Error("Merged connections are not ordered by their departure time");
        }
      });

      this._mergeStream.on('end', function () {
        assert.equal(count, 72);
        done();
      });
    });
  });
});

describe('CSA', function () {
  // ConnectionsStreams are supposed to be ordered already
  var connectionsStreams = [
    ['NS', fs.createReadStream('test/data/connections-ns.jsonldstream', { flags: 'r' }).pipe(new Deserialize())],
    ['NMBS', fs.createReadStream('test/data/connections-nmbs.jsonldstream', { flags: 'r' }).pipe(new Deserialize())]
  ];

  var query = {
    // Intermodal route
    departureStop: "8814159", // Bruxelles-Midi
    departureTime: new Date("2015-10-10T00:00:00.000Z"),
    latestArrivalTime: new Date("2015-10-11T07:10:00.000Z"),
    arrivalStop: "asd" // Amsterdam
  };

  it('should return an intermodal route', function (done) {
    var mergeStream = new MergeStream(connectionsStreams, query.departureTime);
    let walkingSpeed = 5.0;
    let stopsData = [];
    new Planner(query, undefined, walkingSpeed, stopsData).then((instance) => {
      var planner = instance;
      var result = mergeStream.pipe(planner);

      result.on("data", function (data) {
        //without something that's reading the data, the stream won't start
      });
      result.on("result", function (path) {
        mergeStream.close();
        done();
        doneEntry();
      });
      result.on("error", function (error) {
        done("error encountered" + error);
        doneEntry();
      });
      result.on("end", function () {
        done("no path found");
        doneEntry();
      });
    });
  });
});

describe('Mergestream', function () {
  // ConnectionsStreams are supposed to be ordered already
  var connectionsStreams = [
    ['NMBS', fs.createReadStream('test/data/connections-nmbs.jsonldstream', { flags: 'r' }).pipe(new Deserialize())]
  ];

  var connectionsStreamNS = fs.createReadStream('test/data/connections-ns.jsonldstream', { flags: 'r' }).pipe(new Deserialize());

  var query = {
    // Intermodal route
    departureStop: "8814159", // Bruxelles-Midi
    departureTime: new Date("2015-10-10T00:00:00.000Z"),
    latestArrivalTime: new Date("2015-10-11T07:10:00.000Z"),
    arrivalStop: "asd" // Amsterdam
  };

  it('should read NMBS first and after time treshold also NS', function (done) {
    // MergeStream is paused by default so you can add/remove streams like you wish first
    var mergeStream = new MergeStream(connectionsStreams, query.departureTime);

    var threshold = new Date("2015-10-10T07:00:00.000Z");
    let walkingSpeed = 5.0;
    let stopsData = [];
    new Planner(query, undefined, walkingSpeed, stopsData).then((instance) => {
      var planner = instance;
      var result = mergeStream.pipe(planner);
      var added = false;

      mergeStream.on("data", function (connection) {
        // Start merging NS
        if (!added && connection['departureTime'] >= threshold) {
          mergeStream.addConnectionsStream('NS', connectionsStreamNS);
          added = true;
        }
      });

      result.on("data", function (connection) {
        //without something that's reading the data, the stream won't start
      });
      result.on("result", function (path) {
        mergeStream.close();
        done();
        doneEntry();
      });
      result.on("error", function (error) {
        done("error encountered" + error);
        doneEntry();
      });
      result.on("end", function () {
        done("no path found");
        doneEntry();
      });
    });
  });
});

describe('Mergestream', function () {
  // ConnectionsStreams are supposed to be ordered already
  var connectionsStreams = [
    ['NMBS', fs.createReadStream('test/data/connections-nmbs.jsonldstream', { flags: 'r' }).pipe(new Deserialize())]
  ];

  var connectionsStreamNS = fs.createReadStream('test/data/connections-ns.jsonldstream', { flags: 'r' }).pipe(new Deserialize());

  var query = {
    // Intermodal route
    departureStop: "8814159", // Bruxelles-Midi
    departureTime: new Date("2015-10-10T00:00:00.000Z"),
    latestArrivalTime: new Date("2015-10-11T07:10:00.000Z"),
    arrivalStop: "asd" // Amsterdam
  };

  it('should read NMBS first, but after treshold: add NS and remove NMBS', function (done) {
    var mergeStream = new MergeStream(connectionsStreams, query.departureTime);

    var threshold = new Date("2015-10-10T07:00:00.000Z");
    let walkingSpeed = 5.0;
    let stopsData = [];
    new Planner(query, undefined, walkingSpeed, stopsData).then((instance) => {
      var planner = instance;
      var result = mergeStream.pipe(planner);
      var added = false;

      mergeStream.on("data", function (connection) {
        // Start merging NS
        if (!added && connection['departureTime'] >= threshold) {
          mergeStream.addConnectionsStream('NS', connectionsStreamNS);
          // Stop stream NMBS
          connectionsStreams[0][1].end();
          added = true;
        }
      });

      result.on("data", function (connection) {
        //without something that's reading the data, the stream won't start
      });
      result.on("result", function (path) {
        mergeStream.close();
        done();
        doneEntry();
      });
      result.on("error", function (error) {
        done("error encountered" + error);
        doneEntry();
      });
      result.on("end", function () {
        done("no path found");
        doneEntry();
      });
    });
  });
});