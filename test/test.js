var zlib = require('zlib'),
    fs = require('fs'),
    should = require('should'),
    Planner1 = require('../lib/SingleResultScanner.js'),
    Planner2 = require('../lib/ConnectionScanner.js'),
    Deserialize = require('./data/Deserialize.js'),
    async = require('async');

describe('Open the list of stations (test)', function () {
  //Read stations in memory
  var stations = JSON.parse(fs.readFileSync('test/data/stations.json', 'utf8'));
  it('should now have an object of stations', function () {
    stations.should.be.an.instanceOf(Object);
  });
  describe("We're going to fire a couple of queries", function () {
    async.each([
      "stops:32829","stops:32830","stops:32831","stops:32832","stops:32833","stops:32834","stops:32835","stops:32836","stops:32837","stops:32838","stops:32839","stops:32840","stops:32841","stops:32842","stops:32843","stops:32844","stops:32845","stops:32846"
    ], function (station1, done1) {
      async.each([
        "stops:32733","stops:32830"
      ], function (station2, done2) {
        //let's create our route planner
        if (station1 !== station2) {
          var query = {
            departureStop : station1,
            departureTime : new Date("2013-12-16T00:00:00.000Z"),
            latestArrivalTime : new Date("2013-12-17T12:00:00.000Z"),
            arrivalStop : station2
          };
          var planner = new Planner1(query);
          describe(station1 + " to " + station2, function () {
            var result = fs.createReadStream('test/data/test20131216.json.gz', {flags: 'r'}).pipe(zlib.createGunzip()).pipe(new Deserialize()).pipe(planner);
            it("should yield a result", function (done) {
              result.on("data", function (connection) {
                done();
                done2();
              });
              result.on("end", function () {
                done2();
                done("no path found");
              });
            });
          });
        } else {
          done2();
          //it("should not return anything because the stations are the same");
        }
      }, function (error) {
        done1();
      });
    }, function (error) {
      //nothing...
    });
  }) 
})
