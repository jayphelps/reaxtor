'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Model = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _falcor = require('falcor');

var _Observable2 = require('rxjs/Observable');

var _falcorPathSyntax = require('falcor-path-syntax');

var _InvalidateResponse = require('falcor/lib/response/InvalidateResponse');

var _InvalidateResponse2 = _interopRequireDefault(_InvalidateResponse);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ObservableModelResponse = function (_Observable) {
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
}(_Observable2.Observable);

var Model = exports.Model = function (_FalcorModel) {
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
            for (var _len = arguments.length, getArgs = Array(_len), _key = 0; _key < _len; _key++) {
                getArgs[_key] = arguments[_key];
            }

            return new ObservableModelResponse(_get(Object.getPrototypeOf(Model.prototype), 'get', this).apply(this, (0, _falcorPathSyntax.fromPathsOrPathValues)(getArgs)));
        }
    }, {
        key: 'set',
        value: function set() {
            for (var _len2 = arguments.length, setArgs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                setArgs[_key2] = arguments[_key2];
            }

            return new ObservableModelResponse(_get(Object.getPrototypeOf(Model.prototype), 'set', this).apply(this, (0, _falcorPathSyntax.fromPathsOrPathValues)(setArgs)));
        }
    }, {
        key: 'call',
        value: function call(fnPath, fnArgs, refPaths, thisPaths) {
            fnPath = (0, _falcorPathSyntax.fromPath)(fnPath);
            refPaths = refPaths && (0, _falcorPathSyntax.fromPathsOrPathValues)(refPaths) || [];
            thisPaths = thisPaths && (0, _falcorPathSyntax.fromPathsOrPathValues)(thisPaths) || [];
            return new ObservableModelResponse(_get(Object.getPrototypeOf(Model.prototype), 'call', this).call(this, fnPath, fnArgs, refPaths, thisPaths));
        }
    }, {
        key: 'getItems',
        value: function getItems() {
            var _this3 = this;

            var thisPathsSelector = arguments.length <= 0 || arguments[0] === undefined ? function () {
                return [['length']];
            } : arguments[0];
            var restPathsSelector = arguments.length <= 1 || arguments[1] === undefined ? function (_ref) {
                var length = _ref.json.length;
                return [];
            } : arguments[1];


            var thisPaths = (0, _falcorPathSyntax.fromPathsOrPathValues)([].concat(thisPathsSelector(this)));

            return thisPaths.length === 0 ? _Observable2.Observable.empty() : this.get.apply(this, _toConsumableArray(thisPaths)).mergeMap(function (result) {

                var restPaths = (0, _falcorPathSyntax.fromPathsOrPathValues)([].concat(restPathsSelector(result)));

                return restPaths.length === 0 ? _Observable2.Observable.of(result) : _this3.get.apply(_this3, _toConsumableArray(thisPaths.concat(restPaths)));
            });
        }
    }, {
        key: 'invalidateAsync',
        value: function invalidateAsync() {
            for (var _len3 = arguments.length, invalidateArgs = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                invalidateArgs[_key3] = arguments[_key3];
            }

            return new ObservableModelResponse(new _InvalidateResponse2.default(this, (0, _falcorPathSyntax.fromPathsOrPathValues)(invalidateArgs)));
        }
    }, {
        key: 'preload',
        value: function preload() {
            for (var _len4 = arguments.length, preloadArgs = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                preloadArgs[_key4] = arguments[_key4];
            }

            return new ObservableModelResponse(_get(Object.getPrototypeOf(Model.prototype), 'preload', this).apply(this, (0, _falcorPathSyntax.fromPathsOrPathValues)(preloadArgs)));
        }
    }, {
        key: 'getValue',
        value: function getValue() {
            for (var _len5 = arguments.length, getValueArgs = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                getValueArgs[_key5] = arguments[_key5];
            }

            return new ObservableModelResponse(_get(Object.getPrototypeOf(Model.prototype), 'getValue', this).apply(this, (0, _falcorPathSyntax.fromPathsOrPathValues)(getValueArgs)));
        }
    }, {
        key: 'setValue',
        value: function setValue() {
            for (var _len6 = arguments.length, setValueArgs = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                setValueArgs[_key6] = arguments[_key6];
            }

            return new ObservableModelResponse(_get(Object.getPrototypeOf(Model.prototype), 'setValue', this).apply(this, (0, _falcorPathSyntax.fromPathsOrPathValues)(setValueArgs)));
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
}(_falcor.Model);
//# sourceMappingURL=Model.js.map