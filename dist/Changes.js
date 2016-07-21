'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Changes = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _leftPad = require('left-pad');

var _leftPad2 = _interopRequireDefault(_leftPad);

var _debug2 = require('debug');

var _debug3 = _interopRequireDefault(_debug2);

var _util = require('util');

var _tryCatch = require('rxjs/util/tryCatch');

var _errorObject = require('rxjs/util/errorObject');

var _falcorPathSyntax = require('falcor-path-syntax');

var _falcorPathSyntax2 = _interopRequireDefault(_falcorPathSyntax);

var _rxjs = require('rxjs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var isArray = Array.isArray;

var Changes = exports.Changes = function (_Observable) {
    _inherits(Changes, _Observable);

    function Changes(subscribe) {
        _classCallCheck(this, Changes);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Changes).call(this, subscribe));

        _this.nextVal = null;
        _this.errorVal = null;
        _this.hasValue = false;
        _this.hasError = false;
        _this.subscribers = [];
        _this.subscription = null;
        _this.hasCompleted = false;
        return _this;
    }

    _createClass(Changes, [{
        key: 'next',
        value: function next(x) {
            this.nextVal = x;
            this.hasValue = true;
            var subscribers = this.subscribers.slice(0);
            var len = subscribers.length;
            var index = -1;
            while (++index < len) {
                subscribers[index].next(x);
            }
        }
    }, {
        key: 'error',
        value: function error(e) {
            this.errorVal = e;
            this.hasError = true;
            var subscribers = this.subscribers.slice(0);
            this.subscribers = [];
            var len = subscribers.length;
            var index = -1;
            while (++index < len) {
                subscribers[index].error(e);
            }
        }
    }, {
        key: 'complete',
        value: function complete() {
            this.hasCompleted = true;
            var subscribers = this.subscribers.slice(0);
            this.subscribers = [];
            var len = subscribers.length;
            var index = -1;
            while (++index < len) {
                subscribers[index].complete();
            }
        }
    }, {
        key: '_subscribe',
        value: function _subscribe(subscriber) {
            var _this2 = this;

            var subscribers = this.subscribers;


            subscribers.push(subscriber);

            if (subscribers.length === 1) {
                this.subscription = this.source.subscribe(this);
            } else if (this.hasError) {
                subscriber.error(this.errorVal);
            } else if (this.hasCompleted) {
                subscriber.complete();
            } else if (this.hasValue) {
                subscriber.next(this.nextVal);
            }

            return new _rxjs.Subscription(function () {
                var index = subscribers.indexOf(subscriber);
                if (~index) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    var subscription = _this2.subscription;
                    _this2.subscription = null;
                    subscription.unsubscribe();
                }
            });
        }
    }, {
        key: 'deref',
        value: function deref() {
            for (var _len = arguments.length, keys = Array(_len), _key = 0; _key < _len; _key++) {
                keys[_key] = arguments[_key];
            }

            if (keys.length === 1) {
                if (isArray(keys[0])) {
                    keys = keys[0];
                } else if (typeof keys[0] === 'string') {
                    keys = keys[0].length === 0 ? keys[0] : (0, _falcorPathSyntax2.default)(keys[0]);
                }
            }
            return keys.length === 0 ? this : this.lift(new DerefOperator(keys, this.debug, this.depth, this.component));
        }
    }], [{
        key: 'from',
        value: function from(source, component) {
            var depth = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

            var changes = new Changes();
            changes.debug = (0, _debug3.default)('reaxtor:changes');
            changes.source = source;
            changes.depth = depth;
            changes.component = component;
            return changes;
        }
    }]);

    return Changes;
}(_rxjs.Observable);

var DerefOperator = function () {
    function DerefOperator(keys, debug, depth, component) {
        _classCallCheck(this, DerefOperator);

        this.keys = keys;
        this.debug = debug;
        this.depth = depth;
        this.component = component;
    }

    _createClass(DerefOperator, [{
        key: 'call',
        value: function call(subscriber, source) {
            return source._subscribe(new DerefSubscriber(subscriber, this.keys, this.debug, this.depth, this.component));
        }
    }]);

    return DerefOperator;
}();

var DerefSubscriber = function (_Subscriber) {
    _inherits(DerefSubscriber, _Subscriber);

    function DerefSubscriber(destination, keys, debug, depth, component) {
        _classCallCheck(this, DerefSubscriber);

        var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(DerefSubscriber).call(this, destination));

        _this3.keys = keys;
        _this3.debug = debug;
        _this3.depth = depth;
        _this3.component = component;
        return _this3;
    }

    _createClass(DerefSubscriber, [{
        key: 'warn',
        value: function warn(message) {
            var depth = this.depth;
            var debug = this.debug;

            for (var _len2 = arguments.length, values = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                values[_key2 - 1] = arguments[_key2];
            }

            if (debug.enabled) {
                debug.color = 'black';
                debug.log = console.warn.bind(console);
                debug((0, _leftPad2.default)(message, 10 + depth * 4) + ' |---- ' + values.join(' '));
            }
            return values[values.length - 1];
        }
    }, {
        key: '_next',
        value: function _next(update) {

            var keys = this.keys;
            var count = keys.length - 1;

            var _update = _slicedToArray(update, 2);

            var model = _update[0];
            var state = _update[1];

            var keysIdx = -1;

            while (++keysIdx <= count) {

                var key = keys[keysIdx];

                if (state == null || (typeof state === 'undefined' ? 'undefined' : _typeof(state)) !== 'object' || !state.hasOwnProperty(key)) {
                    var _path = model._path.concat(keys.slice(keysIdx));
                    this.warn('cache miss', this.component.key);
                    if (model._path.length > 0) {
                        this.warn('from', JSON.stringify(model._path));
                    }
                    this.warn('attempted', JSON.stringify(_path));
                    model = model._clone({ _path: _path });
                    break;
                }

                var tmpState = state[key];
                var tmpModel = (0, _tryCatch.tryCatch)(model.deref).call(model, tmpState);
                if (tmpModel === _errorObject.errorObject) {
                    var e = _errorObject.errorObject.e;

                    this.warn('error', e && e.message || e);
                    this.warn('component', this.component.key);
                    if (model._path.length > 0) {
                        this.warn('from', JSON.stringify(model._path));
                    }
                    this.warn('attempted', JSON.stringify(model._path.concat(keys.slice(keysIdx))));
                    this.warn('data', (0, _util.inspect)(tmpState, { depth: null }));
                    this.warn('parent', (0, _util.inspect)(state, { depth: null }));
                    this.warn('stack', e && e.stack || e);
                    return this.destination.error(_errorObject.errorObject.e);
                }

                state = tmpState;
                model = tmpModel;
            }

            _get(Object.getPrototypeOf(DerefSubscriber.prototype), '_next', this).call(this, [model, state]);
        }
    }]);

    return DerefSubscriber;
}(_rxjs.Subscriber);
//# sourceMappingURL=Changes.js.map