var zlib = require('zlib'),
    fs = require('fs'),
    should = require('should'),
    Planner = require('../lib/BasicCSA.js'),
    Deserialize = require('./data/Deserialize.js'),
    async = require('async'),
    Promise = require('promise');

describe('Test minimum transfer time', function () {
    var minimumTransferTime = 500;
    var queries = [
        {
            //Ghent -> Spa
            departureStop : "8892007",
            departureTime : new Date("2015-10-01T12:00:00.000Z"),
            "minimumTransferTime": minimumTransferTime,
            arrivalStop : "8844404"
        },
        {
            //Antwerp -> Brussels
            departureStop : "8821006",
            departureTime : new Date("2015-10-01T12:00:00.000Z"),
            "minimumTransferTime": minimumTransferTime,
            arrivalStop : "8813003"
        },
        {
            //Lichtervel -> Ghent
            departureStop : "8892205",
            departureTime : new Date("2015-10-01T12:00:00.000Z"),
            "minimumTransferTime": minimumTransferTime,
            arrivalStop : "8892007"
        }
    ];
    async.eachSeries(queries, function (query, doneEntry) {
        //let's create our route planner
        var planner = new Planner(query);
        var ending = "";
        if (query.arrivalStop) {
            ending += " to " + query.arrivalStop;
        }
        describe(query.departureStop + ending, function () {
            var readStream = fs.createReadStream('test/data/nmbs20151001_20151002.json.gz', {flags: 'r'});
            var result = readStream.pipe(zlib.createGunzip()).pipe(new Deserialize()).pipe(planner);
            it("should yield a result and respect minimum transfertimes", function (done) {
                var mst = {};
                result.on("data", function (data) {
                    //It should never give two times the same arrivalStop!
                    if (mst[data["departureStop"]]) {
                        if(!(mst[data["departureStop"]]["gtfs:trip"] == data["gtfs:trip"])) {
                            var transferTime = (data["arrivalTime"].getTime() - mst[data["departureStop"]]["arrivalTime"].getTime())/1000;
                            if(transferTime < minimumTransferTime) {
                                done('Minimum transfertime exceeded at transfer: ' + mst[data["departureStop"]].departureStop + " -> " + data.departureStop + " - " + transferTime);
                            }
                        }
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

describe('Test transfer time fetcher', function () {
    var queries = [
        {
            //Ghent -> Spa
            departureStop : "8892007",
            departureTime : new Date("2015-10-01T12:00:00.000Z"),
            arrivalStop : "8844404"
        },
        {
            //Antwerp -> Brussels
            departureStop : "8821006",
            departureTime : new Date("2015-10-01T12:00:00.000Z"),
            arrivalStop : "8813003"
        },
        {
            //Lichtervel -> Ghent
            departureStop : "8892205",
            departureTime : new Date("2015-10-01T12:00:00.000Z"),
            arrivalStop : "8892007"
        }
    ];
    var transferTimes = {
        "8819406->8819406": 5000,
        "8833001->8833001": 5000,
        "8844206->8844206": 5000
    }
    var getTransferTimes = function (previousConnection, connection) {
        var transferTime = transferTimes[connection["departureStop"] + "->" + connection["departureStop"]];
        if (!transferTime) {
            transfer_time = 0;
        }
        return transferTime;
    }
    var transferTimesFetcher = function() {};
    transferTimesFetcher.get = function (previousConnection, connection) {
        return new Promise(function (fulfill) {
            fulfill(getTransferTimes(previousConnection, connection))
        });
    };
    async.eachSeries(queries, function (query, doneEntry) {
        //let's create our route planner
        var planner = new Planner(query,transferTimesFetcher);
        var ending = "";
        if (query.arrivalStop) {
            ending += " to " + query.arrivalStop;
        }
        describe(query.departureStop + ending, function () {
            var readStream = fs.createReadStream('test/data/nmbs20151001_20151002.json.gz', {flags: 'r'});
            var result = readStream.pipe(zlib.createGunzip()).pipe(new Deserialize()).pipe(planner);
            it("should yield a result and respect transfertimes from fetcher", function (done) {
                var mst = {};
                result.on("data", function (data) {
                    //It should never give two times the same arrivalStop!
                    if (mst[data["departureStop"]]) {
                        if(!(mst[data["departureStop"]]["gtfs:trip"] == data["gtfs:trip"])) {
                            var transferTime = (data["arrivalTime"].getTime() - mst[data["departureStop"]]["arrivalTime"].getTime())/1000;
                            if(transferTime < getTransferTimes(mst[data["departureStop"]],data)) {
                                 done('Minimum transfertime exceeded at transfer: ' + mst[data["departureStop"]].departureStop + " -> " + data.departureStop + " - " + transferTime);
                            }
                        }
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
