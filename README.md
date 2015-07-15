# Connection Scan Algorithm for JavaScript
State: testing

The Connection Scan Algorithm (CSA) for Javascript takes a stream of "connections" and transforms it into a stream of solutions to get from a certain stop to a certain stop. The algorithm will find the earliest arrival times first, and will return alternatives as long as the stream runs.

## Use it

You can install the library using npm:

```bash
npm install csa
```

And include it in your nodejs application
```javascript
var Planner = require('csa');
```

Using browserify, you can also build this for the browser. Instructions coming soon.
