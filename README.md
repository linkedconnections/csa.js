# Connection Scan Algorithm for JavaScript
[![Build Status](https://travis-ci.org/linkedconnections/csa.js.svg)](https://travis-ci.org/linkedconnections/csa.js)

State: basic csa without footpaths is functional

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

_Protip: you can use browserify on this repo to use CSA in the browser_
