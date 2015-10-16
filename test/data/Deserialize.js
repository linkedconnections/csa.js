var util = require('util')
  , Transform = require('stream').Transform

/**
 * Deserializes a connection file from the test/data folder
 */
var Deserialize = function () {
  Transform.call(this, {objectMode: true});
  this._remaining = "";
  this._count = 0;
};

util.inherits(Deserialize, Transform);

Deserialize.prototype._transform = function (data, encoding, done) {
  this._remaining += data;
  var index = this._remaining.indexOf('\n');
  while (index > -1) {
    var line = this._remaining.substring(0, index);
    this._remaining = this._remaining.substring(index + 1);
    this.push(this._jsonToConnection(line));
    index = this._remaining.indexOf('\n');
  }
  done();
}

Deserialize.prototype._jsonToConnection = function (json) {
  var object = JSON.parse(json);
  if (!object["@id"]) {
    object["@id"] = this._count;
    this._count ++;
  }
  if (object["st:departureTime"]) {
    object["departureTime"] = new Date(object["st:departureTime"]);
    object["arrivalTime"] = new Date(object["st:arrivalTime"]);
    object["departureStop"] = object["st:departureStop"];
    object["arrivalStop"] = object["st:arrivalStop"];
  } else {
    object["departureTime"] = new Date(object["departureTime"]);
    object["arrivalTime"] = new Date(object["arrivalTime"]);
  }
  delete object["st:departureTime"];
  delete object["st:arrivalTime"];
  delete object["st:departureStop"];
  delete object["st:arrivalStop"];
  return object;
}


Deserialize.prototype._flush = function (done) {
  if (this._remaining.length > 0) {
    this.push(this._jsonToConnection(this._remaining));
  }
  done();
};

module.exports = Deserialize;
