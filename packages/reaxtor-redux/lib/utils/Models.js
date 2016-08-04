'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Models = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _rxjs = require('rxjs');

var _tryCatch = require('rxjs/util/tryCatch');

var _errorObject = require('rxjs/util/errorObject');

var _reaxtorFalcorSyntaxPath = require('reaxtor-falcor-syntax-path');

var _reaxtorFalcorSyntaxPath2 = _interopRequireDefault(_reaxtorFalcorSyntaxPath);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Models = exports.Models = function (_Observable) {
    _inherits(Models, _Observable);

    function Models(source, operator) {
        _classCallCheck(this, Models);

        if (typeof source !== 'function') {
            var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Models).call(this));

            source && (_this.source = source);
            operator && (_this.operator = operator);
        } else {
            var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Models).call(this, source));
        }
        return _possibleConstructorReturn(_this);
    }

    _createClass(Models, [{
        key: 'lift',
        value: function lift(operator) {
            return new Models(this, operator);
        }
    }, {
        key: 'deref',
        value: function deref() {
            for (var _len = arguments.length, keys = Array(_len), _key = 0; _key < _len; _key++) {
                keys[_key] = arguments[_key];
            }

            if (keys.length === 1) {
                if (Array.isArray(keys[0])) {
                    keys = keys[0];
                } else if (typeof keys[0] === 'string') {
                    keys = keys[0];
                    if (!isNaN(+keys)) {
                        keys = [keys];
                    } else {
                        keys = (0, _reaxtorFalcorSyntaxPath2.default)(keys);
                    }
                }
            }
            return keys.length === 0 ? this : this.lift(new DerefOperator(keys));
        }
    }], [{
        key: 'from',
        value: function from(source) {
            return new Models(source);
        }
    }]);

    return Models;
}(_rxjs.Observable);

var DerefOperator = function () {
    function DerefOperator(keys) {
        _classCallCheck(this, DerefOperator);

        this.keys = keys;
    }

    _createClass(DerefOperator, [{
        key: 'call',
        value: function call(subscriber, source) {
            return source._subscribe(new DerefSubscriber(subscriber, this.keys));
        }
    }]);

    return DerefOperator;
}();

var DerefSubscriber = function (_Subscriber) {
    _inherits(DerefSubscriber, _Subscriber);

    function DerefSubscriber(destination, keys) {
        _classCallCheck(this, DerefSubscriber);

        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(DerefSubscriber).call(this, destination));

        _this2.keys = keys;
        return _this2;
    }
    // warn(message, ...values) {
    //     const { depth, debug } = this;
    //     if (debug.enabled) {
    //         debug.color = 'black';
    //         debug.log = console.warn.bind(console);
    //         debug(`${pad(message, 10 + (depth * 4))} |---- ${values.join(' ')}`);
    //     }
    //     return values[values.length - 1];
    // }


    _createClass(DerefSubscriber, [{
        key: '_next',
        value: function _next(arrayWrapper) {

            var keysIdx = -1;
            var keys = this.keys;

            var count = keys.length - 1;

            var _arrayWrapper = _slicedToArray(arrayWrapper, 2);

            var model = _arrayWrapper[0];
            var props = _arrayWrapper[1];


            while (++keysIdx <= count) {

                var key = keys[keysIdx];

                if (props == null || (typeof props === 'undefined' ? 'undefined' : _typeof(props)) !== 'object' || !props.hasOwnProperty(key)) {
                    var _path = model._path.concat(keys.slice(keysIdx));
                    // this.warn(`cache miss`, this.component.key);
                    // if (model._path.length > 0) {
                    //     this.warn(`from`, JSON.stringify(model._path));
                    // }
                    // this.warn(`attempted`, JSON.stringify(_path));
                    props = undefined;
                    model = model._clone({ _path: _path });
                    break;
                }

                var nextProps = props[key];
                var nextModel = (0, _tryCatch.tryCatch)(model.deref).call(model, nextProps);
                if (nextModel === _errorObject.errorObject) {
                    var e = _errorObject.errorObject.e;

                    debugger;
                    // this.warn('error', e && e.message || e);
                    // this.warn('component', this.component.key);
                    // if (model._path.length > 0) {
                    //     this.warn('from', JSON.stringify(model._path));
                    // }
                    // this.warn('attempted', JSON.stringify(model._path.concat(keys.slice(keysIdx))));
                    // this.warn('data', inspect(nextProps, { depth: null }));
                    // this.warn('parent', inspect(props, { depth: null }));
                    // this.warn('stack', e && e.stack || e);
                    return this.destination.error(_errorObject.errorObject.e);
                }

                props = nextProps;
                model = nextModel;
            }

            _get(Object.getPrototypeOf(DerefSubscriber.prototype), '_next', this).call(this, [model, props]);
        }
    }]);

    return DerefSubscriber;
}(_rxjs.Subscriber);
//# sourceMappingURL=Models.js.map