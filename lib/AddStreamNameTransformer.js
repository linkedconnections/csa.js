var Transform = require('stream').Transform,
    util = require('util');

/**
 * Add name of stream to connections
 */
function AddStreamNameTransformer (name) {
  Transform.call(this, {objectMode : true});
  this._name = name;
}

util.inherits(AddStreamNameTransformer, Transform);

AddStreamNameTransformer.prototype._transform = function (connection, encoding, done) {
  connection['streamName'] = this._name;
  this.push(connection);
  done();
};

module.exports = AddStreamNameTransformer;