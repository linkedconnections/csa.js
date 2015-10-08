var zlib = require('zlib');
var fs = require('fs');
var Planner = require('../lib/BasicCSA.js');
var Deserialize = require('../test/data/Deserialize.js');
//let's create our route planner
try {
  //  var planner = new Planner("stops:32733",new Date("2013-12-16T00:02:00.000Z"), new Date("2013-12-17T12:00:00.000Z"),"stops:32383");
  /*var query = {
//    departureStop : "stops:32733",
    departureStop : "stops:32829",
    departureTime : new Date("2013-12-16T00:00:00.000Z"),
    latestArrivalTime : new Date("2013-12-17T12:00:00.000Z"),
    arrivalStop : "stops:32831"
  };*/

  var query = {
    departureStop : "stops:32829",
    departureTime : new Date("2013-12-16T00:00:00.000Z"),
    latestArrivalTime : new Date("2013-12-17T12:00:00.000Z"),
    arrivalStop : "stops:32831"//"stops:32842"//
  };
  var planner = new Planner(query);
  var stations = JSON.parse(fs.readFileSync('test/data/stations.json', 'utf8'));

  //open and pipe the stream of connections
  fs.createReadStream('test/data/test20131216.json.gz', {flags: 'r'}).pipe(zlib.createGunzip()).pipe(new Deserialize()).pipe(planner);

  planner.on("result", function (path) {
    if (path) {
      path.forEach(function (connection) {
        connection["departureStop"] = stations[connection["departureStop"]];
        connection["arrivalStop"] = stations[connection["arrivalStop"]];
      });
      console.log(JSON.stringify(path));
      process.exit();
    }
  });

  planner.on("stop_condition", function (count) {
    console.error("Reached stop condition after relaxing " + count + " connections.");
  });

  planner.on("end", function () {
    console.error("End of stream reached");
  });

} catch (e) {
  console.error(e);
}
