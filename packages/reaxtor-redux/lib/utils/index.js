'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Models = require('./Models');

Object.keys(_Models).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _Models[key];
    }
  });
});

var _mergeFalcorNodes = require('./mergeFalcorNodes');

Object.keys(_mergeFalcorNodes).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _mergeFalcorNodes[key];
    }
  });
});
//# sourceMappingURL=index.js.map