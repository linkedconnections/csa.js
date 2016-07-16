# Connection Scan Algorithm for JavaScript
[![Build Status](https://travis-ci.org/linkedconnections/csa.js.svg)](https://travis-ci.org/linkedconnections/csa.js)

State: 

* basic csa without footpaths is functional

* merger that combines different streams of connections is functional

The Connection Scan Algorithm (CSA) for Javascript takes a stream of "connections" and transforms it into a stream of solutions to get from a certain stop to a certain stop. The algorithm will find the earliest arrival times first, and will return alternatives as long as the stream runs.

## Use it

You can install the library using npm:

```bash
npm install csa
```

And include it in your nodejs application
```javascript
var csa = require('csa');
var planner = new csa.BasicCSA({departureStop: "...", arrivalStop: "...",departureTime:new Date()});
connectionsReadStream.pipe(planner);
planner.on("result", function (result) {
    console.log("Path found:",result);
    connectionsReadStream.close();
});
planner.on("data", function (connection) {
    //Access to a minimum spanning tree of connections being built up
    //May be useful for e.g., creating isochrone maps
});
```

## Multiple connection streams

Instead of using one stream of connections, you can combine multiple streams as input by using `MergeStream`
```javascript
var connectionsStreams = [
	[ 'stream1', connectionsReadStream1 ],
	[ 'stream2', connectionsReadStream2 ],
	...
];

var connectionsReadStream = new csa.MergeStream(connectionsStreams, query.departureTime);
```

You can add streams by setting an eventlistener on the MergeStream instance.
To remove a stream, just end the stream itself.
```javascript
connectionsReadStream.on("data", function (connection) {
	connectionsReadStream.addConnectionsStream('newStream', newConnectionsReadStream);
});
```

## Transfer times (optionally)
To specify the minimum transfer time you should add the ''minimumTransferTime'' argument to the query:
```javascript
var query = {
	"arrivalStop":"..." , 
	"departureStop": "...", 
	"departureTime": "...",
	"minimumTransferTime": ...
}
var planner = new csa.BasicCSA(query);
```

To specify transfer times depending on the stops of the transfers you should create a transfer time fetcher:
```javascript
//Define a class
var transferTimesFetcher = function() {};
//Define the get function
transferTimesFetcher.get = function (previousConnection, connection) {
	return new Promise(function (fulfill) {
		var transferTime = ...
		fulfill(transferTime)
        });
};
var planner = new csa.BasicCSA(query,transferTimesFetcher);
```

_Protip: you can use browserify on this repo to use CSA in the browser_
