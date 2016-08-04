var falcor = require('falcor');
var Model = require('./lib/Model').Model;
var QL = require('reaxtor-falcor-syntax-pathmap');
var jsonGraph = require('reaxtor-falcor-json-graph');

Model.prototype.QL = QL;

Model.QL = QL;
Model.ref = jsonGraph.ref;
Model.atom = jsonGraph.atom;
Model.error = jsonGraph.error;
Model.value = jsonGraph.pathValue;
Model.pathValue = jsonGraph.pathValue;
Model.invalidation = jsonGraph.pathInvalidation;
Model.pathInvalidation = jsonGraph.pathInvalidation;

falcor.QL = QL;
falcor.Model = Model;
falcor.ref = jsonGraph.ref;
falcor.atom = jsonGraph.atom;
falcor.error = jsonGraph.error;
falcor.value = jsonGraph.pathValue;
falcor.pathValue = jsonGraph.pathValue;
falcor.invalidation = jsonGraph.pathInvalidation;
falcor.pathInvalidation = jsonGraph.pathInvalidation;

module.exports = exports = falcor;
