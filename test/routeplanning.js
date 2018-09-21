var zlib = require('zlib'),
  fs = require('fs'),
  should = require('should'),
  Planner = require('../lib/BasicCSA.js'),
  Deserialize = require('./data/Deserialize.js'),
  async = require('async');

describe('Route planning queries', function () {
  //Read stations in memory
  var stations = JSON.parse(fs.readFileSync('test/data/stations.json', 'utf8'));
  var queries = [
    {
      //Short travel: should only contain 2 stops
      departureStop: "stops:32829",
      departureTime: new Date("2013-12-16T00:00:00.000Z"),
      latestArrivalTime: new Date("2013-12-17T12:00:00.000Z"),
      arrivalStop: "stops:32830"
    },
    {
      //Short travel: should only contain 2 stops
      departureStop: "stops:32830",
      departureTime: new Date("2013-12-16T00:00:00.000Z"),
      latestArrivalTime: new Date("2013-12-17T12:00:00.000Z"),
      arrivalStop: "stops:32829"
    },
    {
      //Long travel: should contain multiple stops
      departureStop: "stops:32829",
      departureTime: new Date("2013-12-16T00:00:00.000Z"),
      latestArrivalTime: new Date("2013-12-17T12:00:00.000Z"),
      arrivalStop: "stops:32831"//"stops:32842"//
    },
    {
      //Minimum Spanning Tree
      departureStop: "stops:32830",
      departureTime: new Date("2013-12-16T00:00:00.000Z")
    }//,"stops:32830","stops:32831","stops:32832","stops:32833","stops:32834","stops:32835","stops:32836","stops:32837","stops:32838","stops:32839","stops:32840","stops:32841","stops:32842","stops:32843","stops:32844","stops:32845","stops:32846"
  ];
  async.eachSeries(queries, function (query, doneEntry) {
    //let's create our route planner
    let walkingSpeed = 5.0;
    let stopsData = [];
    new Planner(query, undefined, walkingSpeed, stopsData).then((instance) => {
      var ending = "";
      if (query.arrivalStop) {
        ending += "to " + stations[query.arrivalStop].name + " (" + query.arrivalStop + ")";
      }
      describe(stations[query.departureStop].name + " (" + query.departureStop + ") " + ending, function () {
        var readStream = fs.createReadStream('test/data/test20131216.json.gz', { flags: 'r' });
        var result = readStream.pipe(zlib.createGunzip()).pipe(new Deserialize()).pipe(planner);
        it("should yield a result", function (done) {
          var mst = {};
          result.on("data", function (data) {
            //It should never give two times the same arrivalStop!
            if (mst[data.arrivalStop]) {
              done('Received two times a connection with arrival stop: ' + stations[data.arrivalStop].name + " - " + data.arrivalStop);
            }
            mst[data.arrivalStop] = data;
          });
          result.on("result", function (path) {
            done();
            doneEntry();
            readStream.destroy();
            result.destroy();
          });
          result.on("error", function (error) {
            done("error encountered" + error);
            doneEntry();
          });
          result.on("end", function () {
            if (query.arrivalStop) {
              done("no path found");
            } else {
              done();
            }
            doneEntry();
          });
        });
      });
    });
  });
});
