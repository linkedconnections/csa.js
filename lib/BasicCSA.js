/**
 * The Basic Connection Scan Algorithm transforms a stream of connections to a minimum spanning tree stream
 * © 2015 Pieter Colpaert -- UGent - MMLab -- iMinds
 */

var util = require('util'),
    Transform = require('stream').Transform,
    PriorityQueue = require('js-priority-queue'),
    Promise = require('promise'),
    browser = require('/home/dylan/Projects/ldtree-browser/src/index.js'),
    jsonld = require('jsonld'),
    treeClient = new browser.TreeClient(),
    stopsOostVlaanderen = require('../stops-oost-vlaanderen.json'),
    stopsWestVlaanderen = require('../stops-west-vlaanderen.json'),
    ldfetch = require('ldfetch');

// When actually implemented into the csa.js module, make this configurable (or even automatically discoverable when looping through the entrypoints)
const URI_STOPS = "https://belgium.linkedconnections.org/delijn/West-Vlaanderen/stops";

// Keeps track of the running TreeClient queries
var runningQuerys = [];

/*
 * Add the tree datasets to the TreeClient to make the stops discoverable
 */
async function init() {
    await treeClient.addCollection("https://dexagod.github.io/delijn/stoplocations.jsonld");
    await treeClient.addCollection("https://dexagod.github.io/delijn/delijnstops.jsonld");
}

/*
 * Get the nearest stops from the TreeClient using a given (latitude, longitude)
 */
async function getNearestStops(lat, long) {
    await init();
    await awaitRunningQuerys();
    console.log("KNN on:", lat, long)
    return new Promise(function (resolve, reject) {
        let query;
        query = new browser.KNNQuery(lat, long)
        session = treeClient.executeQuery(query);
        runningQuerys.push(session)
        resolve(session);
    });
}

/*
 * Calculate the distance in metres between 2 geographical coordinates and return it.
 * This function uses the Haversine formula to achieve it's goal.
 */
function getDistance(lat1, lon1, lat2, lon2) {
    var R = 6371e3; // Earth radius metres
    var φ1 = lat1 * 3.14 / 180.0;
    var φ2 = lat2 * 3.14 / 180.0;
    var Δφ = (lat2 - lat1) * 3.14 / 180.0;
    var Δλ = (lon2 - lon1) * 3.14 / 180.0;

    // Haversine formula
    var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    var distance = R * c;
    return distance;
}

/*
 * Calculates the walking time based on the distance.
 * Hard coded: 5.0 m/s should be configurable when it's actually implemented into csa.js
 */
function getWalkingTime(distance) {
    return distance / 5.0; // 5.0 m/s
}

/*
 * Wait until all previous querries are finished from the TreeClient.
 */
async function awaitRunningQuerys() {
    await Promise.all(runningQuerys)
    runningQuerys = [];
    return;
}

/*
 * Retrieve the stop data from the stop URI
 */
function getStopDataFromURI(uri) {
    let data;
    for (let stop of stopsWestVlaanderen["@graph"]) {
        if (stop["@id"] == uri) {
            data = stop;
            break;
        }
    }
    return data;
}

/*
 * Retrieve the stop URI from it's position.
 * A better way would be to include the ID of the stop in the geospatial tree too (this function becomes obselete in that case).
 */
function getStopURIFromPosition(latitude, longitude) {
    let data;
    for (let stop of stopsWestVlaanderen["@graph"]) {
        // We force the precision to a certain value for lose comparison.
        const PRECISION = 11;
        if (Number(stop["latitude"]).toPrecision(PRECISION) == latitude.toPrecision(PRECISION)
            && Number(stop["longitude"]).toPrecision(PRECISION) == longitude.toPrecision(PRECISION)) {
            data = stop;
            break;
        }
    }
    return data["@id"];
}

function generateBlanknodeID() {
    this._blankNodesCounter++;
    return "_:b" + this._blankNodesCounter
}

/**
 * Creates a minimum spanning tree and returns paths as a result, using the Connection Scan Algorithm (CSA).
 * It scans each connection and checks whether we can take this connection to get a path
 */
var ResultStream = function (query, transferTimesFetcher) { //TODO: , footpathsTo) {
    Transform.call(this, { objectMode: true });
    //TODO: handle footpaths

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

    // Contains for each stop an object of: arrival time and connection id
    this._earliestArrivalTimes = {};
    // Priority queue of pending earliest arrival times
    this._pending = new PriorityQueue({
        comparator: function (connectionA, connectionB) {
            return connectionA.arrivalTime - connectionB.arrivalTime;
        }
    });

    // check the fields of the query object and assign them to the object. Validate them against possible errors
    if (query) {
        this._latestArrivalTime = query.latestArrivalTime;
        this._departureStop = query.departureStop;
        this._arrivalStop = query.arrivalStop || "";
        if (this._departureStop === this._arrivalStop) {
            throw "You are already at this location";
        }
        this._minimumTransferTime = 0;
        if (query.minimumTransferTime) {
            this._minimumTransferTime = query.minimumTransferTime;
        }
        this._departureTime = query.departureTime;
        // We need the connection here at the stop which delivered the earliest arrival time
        this._earliestArrivalTimes[this._departureStop] = {
            "@id": null,
            arrivalTime: query.departureTime,
            "gtfs:trip": null
        };
        // A list of connections with links to the previous connection
        this._minimumSpanningTree = {};
    } else {
        throw "no query found";
    }

    // Handle initial footpaths
    // for all footpaths f from source stop do S[farr_stop] <- source time + f_dur
    this._footpaths = {}; // make the _footpaths variable available to the object
    this._ldfetch = new ldfetch({}); // init LDFetch

    let departureStopData = getStopDataFromURI(this._departureStop);
    let departureStopLocation = { "latitude": departureStopData.latitude, "longitude": departureStopData.longitude };
    console.log("Getting nearest stops")
    let session = getNearestStops(departureStopLocation.latitude, departureStopLocation.longitude);

    //Counts the number of relaxed connections
    this._count = 0;

    //Makes sure the result gets emitted only once when the stream stops
    this._hasEmitted = false;

    //Keeps track of the blank nodes
    this._blankNodesCounter = 0;

    // Return a Promise to await until walking trips are available
    let self = this; // allow access in the async scope below to 'this'
    return new Promise((resolve, reject) => {
        session.then(async function (session) {
            console.log("Session received");
            for (let i = 0; i < session.nodes.length; i++) {
                for (let member of await session.nodes[i].getMembers()) {
                    let ldobj = await jsonld.fromRDF(member);
                    ldobj = ldobj[0]
                    let street = ldobj["http://xmlns.com/foaf/0.1/name"][0]["@value"]
                    let longNear = Number(ldobj["http://www.w3.org/2003/01/geo/wgs84_pos#long"][0]["@value"])
                    let latNear = Number(ldobj["http://www.w3.org/2003/01/geo/wgs84_pos#lat"][0]["@value"])
                    let distance = getDistance(departureStopLocation.latitude, departureStopLocation.longitude, latNear, longNear);
                    let uriNear = getStopURIFromPosition(latNear, longNear);
                    if (uriNear != self._departureStop) { // The departure stop itself is already included above in the this._earliestArrivalTime
                        let connectionURI = generateBlanknodeID();
                        self._earliestArrivalTimes[uriNear] = {
                            "@id": connectionURI, // No connection ID available for walking
                            "arrivalTime": addSeconds(self._departureTime, getWalkingTime(distance)),
                            "gtfs:trip": "walking" // To spot easily the walking fragments (walking/from/to)
                        };
                        self._minimumSpanningTree[self._earliestArrivalTimes[uriNear]["@id"]] = {
                            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://semweb.mmlab.be/ns/linkedconnections#Connection",
                            "http://schema.org/areaServed": "https://data.delijn.be/entiteit/West-Vlaanderen",
                            "arrivalStop": uriNear,
                            "arrivalTime": addSeconds(self._departureTime, getWalkingTime(distance)),
                            "departureStop": self._departureStop,
                            "departureTime": self._departureTime,
                            "http://vocab.gtfs.org/terms#dropOffType": "http://vocab.gtfs.org/terms#Regular",
                            "http://vocab.gtfs.org/terms#headsign": "\"WALKING\"",
                            "http://vocab.gtfs.org/terms#pickupType": "http://vocab.gtfs.org/terms#Regular",
                            "http://vocab.gtfs.org/terms#route": "walking",
                            "gtfs:trip": "walking",
                            "@id": connectionURI,
                            "previous": null
                        }
                    }
                }
            }
            await awaitRunningQuerys();

            console.log(JSON.stringify(self._earliestArrivalTimes, null, 4));
            resolve(self)
        });
    })
};

util.inherits(ResultStream, Transform);

/**
 * Users of this library should make sure the connections piped to this stream are ordered in time
 */
ResultStream.prototype._transform = function (connection, encoding, done) {
    var self = this;
    this._count++;
    var departureStop = connection["departureStop"];
    var arrivalStop = connection["arrivalStop"];

    // Check the pending queue first for connections that can be officially added to the MST
    while (this._pending.length > 0 && this._pending.peek().arrivalTime <= connection.departureTime) {
        var pendingConnection = this._pending.dequeue();
        // test whether we still have a match, otherwise, just throw it away
        if (this._earliestArrivalTimes[pendingConnection.arrivalStop]['@id'] == pendingConnection['@id']) {
            this.push(pendingConnection);
        }
    }

    // TODO:
    // If the connection we encounter is a departure stop that is reachable: we can proceed. We calculate the reachability in 2 ways:
    // * We check whether we have an earliest arrival time already at the departure stop
    // * We check whether we could have _walked_ here from another stop, or whether or not we should _change_ at this station.
    // This will however raise the potential departure time

    // When a connection is found whose departure time exceeds the target stop's earliest arrival time, we have found a result
    // if S[t] <= C_deptime
    if (!this._hasEmitted && this._earliestArrivalTimes[this._arrivalStop] &&
        this._earliestArrivalTimes[this._arrivalStop].arrivalTime <= connection.departureTime) {
        console.log("Results available due S[t] <= C_deptime")
        this.emit("result", this._reconstructRoute());
        this._hasEmitted = true;
        return done();
    }

    // get transfer time
    var previousConnection = this._earliestArrivalTimes[connection["departureStop"]];
    this._transferTimesFetcher.get(previousConnection, connection).then(function (transferTime) {
        if (previousConnection && previousConnection["gtfs:trip"] && connection["gtfs:trip"] &&
            previousConnection["gtfs:trip"] !== connection["gtfs:trip"]) {
            transferTime = Math.max(transferTime, self._minimumTransferTime);
        } else {
            // no transfer
            transferTime = 0;
        }

        // if T[C_trip] is set or S[C_depstop] <= C_deptime then
        if (self._earliestArrivalTimes[departureStop] &&
            addSeconds(self._earliestArrivalTimes[departureStop].arrivalTime, transferTime).valueOf() <= connection.departureTime.valueOf()) {
            // If the arrival stop isn't in the earliest arrival times list, or if 
            // it is and the current time is earlier than the existing arrival time, then add a new 
            // earliest arrival time for self arrivalStop
            if (!self._earliestArrivalTimes[arrivalStop] ||
                self._earliestArrivalTimes[arrivalStop].arrivalTime > connection["arrivalTime"]) {

                // Raise T[c_trip]
                self._earliestArrivalTimes[arrivalStop] = {
                    arrivalTime: connection["arrivalTime"],
                    "@id": connection["@id"],
                    "gtfs:trip": connection["gtfs:trip"]
                };

                // 2. find a previous connection from which self connection can be reached in the list of connections
                connection.previous = self._earliestArrivalTimes[departureStop]["@id"];
                self._minimumSpanningTree[connection["@id"]] = connection;
                self._pending.queue(connection);
            }

            // Do here some footpath implementation
            // if c_arrtime < S[C_arrstop] then
            if (new Date(connection["arrivalTime"]).getTime() < new Date(self._earliestArrivalTimes[connection["arrivalStop"]]["arrivalTime"]).getTime()) {
                console.debug("Processing footpaths for connection:" + connection["@id"])
                console.debug("c_arrtime: " + new Date(connection["arrivalTime"]).getTime())
                console.debug("earliestArrivalTimes: " + new Date(self._earliestArrivalTimes[connection["arrivalStop"]]["arrivalTime"]).getTime())
                let stopData = getStopDataFromURI(connection["arrivalStop"]);
                let stopLocation = { "latitude": stopData.latitude, "longitude": stopData.longitude };
                let session = getNearestStops(stopLocation.latitude, stopLocation.longitude);

                Promise.all( // Ensure that all promises are resolved before we continue
                    session.then(async function (session) {
                        console.log("Session connection received");
                        for (let i = 0; i < session.nodes.length; i++) {
                            for (let member of await session.nodes[i].getMembers()) {
                                let ldobj = await jsonld.fromRDF(member);
                                ldobj = ldobj[0]
                                let street = ldobj["http://xmlns.com/foaf/0.1/name"][0]["@value"]
                                let longNear = Number(ldobj["http://www.w3.org/2003/01/geo/wgs84_pos#long"][0]["@value"])
                                let latNear = Number(ldobj["http://www.w3.org/2003/01/geo/wgs84_pos#lat"][0]["@value"])
                                let distance = getDistance(stopLocation.latitude, stopLocation.longitude, latNear, longNear);
                                let uriNear = getStopURIFromPosition(latNear, longNear);
                                if (uriNear != connection["arrivalStop"]) { // The stop itself is already included above in the this._earliestArrivalTime
                                    let connectionURI = generateBlanknodeID();
                                    self._earliestArrivalTimes[uriNear] = {
                                        "@id": connectionURI, // No connection ID available for walking
                                        "arrivalTime": addSeconds(self._departureTime, getWalkingTime(distance)),
                                        "gtfs:trip": "walking" // To spot easily the walking fragments (walking/from/to)
                                    };
                                    self._minimumSpanningTree[self._earliestArrivalTimes[uriNear]["@id"]] = {
                                        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://semweb.mmlab.be/ns/linkedconnections#Connection",
                                        "http://schema.org/areaServed": "https://data.delijn.be/entiteit/West-Vlaanderen",
                                        "arrivalStop": uriNear,
                                        "arrivalTime": addSeconds(self._departureTime, getWalkingTime(distance)),
                                        "departureStop": connection["arrivalStop"],
                                        "departureTime": connection["arrivalTime"],
                                        "http://vocab.gtfs.org/terms#dropOffType": "http://vocab.gtfs.org/terms#Regular",
                                        "http://vocab.gtfs.org/terms#headsign": "\"Footpath\"",
                                        "http://vocab.gtfs.org/terms#pickupType": "http://vocab.gtfs.org/terms#Regular",
                                        "http://vocab.gtfs.org/terms#route": "walking",
                                        "gtfs:trip": "walking",
                                        "@id": connectionURI,
                                        "previous": connection["previous"]
                                    }
                                }
                            }
                        }
                        await awaitRunningQuerys();

                        console.log(JSON.stringify(self._earliestArrivalTimes, null, 4));
                    }).resolve(() => { console.log("Resolving connection footpaths OK") })
                )
            }
        }

        // else, the departure stop is not reachable: skip this one
        return done();
    });
};

ResultStream.prototype._reconstructRoute = function () {
    var path = [];
    var previous = this._minimumSpanningTree[this._earliestArrivalTimes[this._arrivalStop]["@id"]];
    console.log(JSON.stringify(this._minimumSpanningTree, null, 4))
    // Detect inf loops
    var loop = false;
    var minTime = this._earliestArrivalTimes[this._arrivalStop].arrivalTime;
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

function addSeconds(date, seconds) {
    return new Date(date.valueOf() + seconds * 1000);
}

module.exports = ResultStream;
