'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Model = undefined;

var _falcor = require('falcor');

var _Observable2 = require('rxjs/Observable');

var _SymbolShim = require('rxjs/util/SymbolShim');

var _falcorPathSyntax = require('falcor-path-syntax');

var _falcorPathSyntax2 = _interopRequireDefault(_falcorPathSyntax);

var _ModelResponse = require('falcor/lib/response/ModelResponse');

var _ModelResponse2 = _interopRequireDefault(_ModelResponse);

var _InvalidateResponse = require('falcor/lib/response/InvalidateResponse');

var _InvalidateResponse2 = _interopRequireDefault(_InvalidateResponse);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

_ModelResponse2.default.prototype[_SymbolShim.SymbolShim.observable] = function () {
    return this;
};

var ObservableModelResponse = (function (_Observable) {
    _inherits(ObservableModelResponse, _Observable);

    function ObservableModelResponse(source) {
        _classCallCheck(this, ObservableModelResponse);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ObservableModelResponse).call(this));

        _this.source = source;
        return _this;
    }

    _createClass(ObservableModelResponse, [{
        key: 'lift',
        value: function lift(operator) {
            var response = new ObservableModelResponse(this);
            response.operator = operator;
            return response;
        }
    }, {
        key: '_toJSONG',
        value: function _toJSONG() {
            return new ObservableModelResponse(this.source._toJSONG());
        }
    }, {
        key: 'progressively',
        value: function progressively() {
            return new ObservableModelResponse(this.source.progressively());
        }
    }]);

    return ObservableModelResponse;
})(_Observable2.Observable);

var Model = exports.Model = (function (_FalcorModel) {
    _inherits(Model, _FalcorModel);

    function Model() {
        _classCallCheck(this, Model);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Model).apply(this, arguments));
    }

    _createClass(Model, [{
        key: 'inspect',

        /* implement inspect method for node's inspect utility */
        value: function inspect() {
            return '{ v' + this.getVersion() + ' ' + JSON.stringify(this.getPath()) + ' }';
        }
    }, {
        key: 'get',
        value: function get() {
            return new ObservableModelResponse(_get(Object.getPrototypeOf(Model.prototype), 'get', this).apply(this, arguments));
        }
    }, {
        key: 'set',
        value: function set() {
            return new ObservableModelResponse(_get(Object.getPrototypeOf(Model.prototype), 'set', this).apply(this, arguments));
        }
    }, {
        key: 'call',
        value: function call() {
            return new ObservableModelResponse(_get(Object.getPrototypeOf(Model.prototype), 'call', this).apply(this, arguments));
        }
    }, {
        key: 'invalidate2',
        value: function invalidate2() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return new ObservableModelResponse(new _InvalidateResponse2.default(this, args.map(function (path) {
                path = (0, _falcorPathSyntax2.default)(path);
                if (!Array.isArray(path)) {
                    throw new Error('Invalid argument: ' + path);
                }
                return path;
            })));
        }
    }, {
        key: 'preload',
        value: function preload() {
            return new ObservableModelResponse(_get(Object.getPrototypeOf(Model.prototype), 'preload', this).apply(this, arguments));
        }
    }, {
        key: 'getValue',
        value: function getValue() {
            return new ObservableModelResponse(_get(Object.getPrototypeOf(Model.prototype), 'getValue', this).apply(this, arguments));
        }
    }, {
        key: 'setValue',
        value: function setValue() {
            return new ObservableModelResponse(_get(Object.getPrototypeOf(Model.prototype), 'setValue', this).apply(this, arguments));
        }
    }, {
        key: '_clone',
        value: function _clone(opts) {
            var clone = new Model(this);
            for (var key in opts) {
                var value = opts[key];
                if (value === "delete") {
                    delete clone[key];
                } else {
                    clone[key] = value;
                }
            }
            if (clone._path.length > 0) {
                clone.setCache = void 0;
            }
            return clone;
        }
    }]);

    return Model;
})(_falcor.Model);
//# sourceMappingURL=Model.js.map