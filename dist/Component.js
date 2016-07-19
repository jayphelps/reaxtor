'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Component = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _leftPad = require('left-pad');

var _leftPad2 = _interopRequireDefault(_leftPad);

var _debug2 = require('debug');

var _debug3 = _interopRequireDefault(_debug2);

var _util = require('util');

var _Event = require('./Event');

var _Changes = require('./Changes');

var _rxjs = require('rxjs');

var _isPromise = require('rxjs/util/isPromise');

var _symbolObservable = require('symbol-observable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var isArray = Array.isArray;

var Component = exports.Component = function (_Observable) {
    _inherits(Component, _Observable);

    function Component(props) {
        _classCallCheck(this, Component);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Component).call(this));

        var debug = (0, _debug3.default)('reaxtor:component');
        var _props$index = props.index;
        var index = _props$index === undefined ? 0 : _props$index;
        var _props$depth = props.depth;
        var depth = _props$depth === undefined ? 0 : _props$depth;
        var models = props.models;
        var _props$path = props.path;
        var path = _props$path === undefined ? '' : _props$path;


        var log = function log(message) {
            for (var _len = arguments.length, values = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                values[_key - 1] = arguments[_key];
            }

            if (debug.enabled) {
                message = (0, _leftPad2.default)(message, 10 + depth * 4) + ' |--- ' + values.reduce(function (s, x) {
                    return s + (typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object' ? '%o' : '%s';
                });
                debug.apply(undefined, [message].concat(values));
            }
            return values[values.length - 1];
        };

        delete props.path;
        delete props.index;
        delete props.depth;
        delete props.models;

        var distinctModels = models.deref(path).distinctUntilChanged(function (curr, next) {
            return !_this.shouldComponentUpdate(curr, next);
        }, function (modelAndState) {
            return log('update', _this.mapUpdate(modelAndState[0], depth, index));
        });

        var componentState = distinctModels.scan(function (componentState, modelAndState) {
            componentState[0] = modelAndState[0];
            componentState[1] = _extends({}, modelAndState[1] || {}, componentState[1]);
            return componentState;
        }, [null, props]);

        var modelsAndRemoteStates = componentState.switchMap(function (componentState) {
            log('loadProps', _this.key);
            return convertToObservable(_this.loadProps.apply(_this, _toConsumableArray(componentState)));
        }, function (componentState) {
            var newRemoteState = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            if (newRemoteState.json) {
                newRemoteState = newRemoteState.json;
            };
            componentState[1] = _this.mapProps(componentState[1], newRemoteState);
            return componentState;
        });

        var modelsAndLocalStates = modelsAndRemoteStates.switchMap(function (componentState) {
            log('loadState', _this.key, componentState[1]);
            return convertToObservable(_this.loadState.apply(_this, _toConsumableArray(componentState)), true).startWith(componentState[1]);
        }, function (componentState) {
            var newLocalState = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            if (newLocalState.json) {
                newLocalState = newLocalState.json;
            };
            componentState[1] = _this.mapState(componentState[1], newLocalState);
            return componentState;
        });

        var modelsAndStates = _Changes.Changes.from(modelsAndLocalStates, _this, depth);

        var children = _this.observe(modelsAndStates, depth);
        var childUpdates = void 0;

        if (typeof children === 'function') {
            childUpdates = modelsAndStates.switchMap(function (create, subjects, children) {
                return function (componentState) {
                    var active = _this.deref.apply(_this, [create, subjects, children, depth].concat(_toConsumableArray(componentState)));
                    return active.length === 0 ? _rxjs.Observable.of(children = active) : _rxjs.Observable.combineLatest(children = active);
                };
            }(children, [], []), function (componentState, children) {
                return [componentState[1]].concat(_toConsumableArray(children));
            });
        } else if (children && children.length > 0) {
            childUpdates = modelsAndStates.switchMapTo(_rxjs.Observable.combineLatest(children), function (componentState, children) {
                return [componentState[1]].concat(_toConsumableArray(children));
            });
        } else {
            childUpdates = modelsAndStates.map(function (componentState) {
                return [componentState[1]];
            });
        }

        var vDOMs = childUpdates.switchMap(function (xs) {
            log('render', _this.key, xs[0]);
            return convertToObservable(_this.render.apply(_this, _toConsumableArray(xs)));
        });

        _this.source = vDOMs;
        return _this;
    }

    _createClass(Component, [{
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(currKey, nextKey) {
            return currKey !== nextKey;
        }
    }, {
        key: 'mapUpdate',
        value: function mapUpdate(model, depth, index) {
            return this.key = '{d: ' + depth + ', i: ' + index + '} ' + model.inspect() + ' ' + this.constructor.name;
        }
    }, {
        key: 'loadProps',
        value: function loadProps(model, state) {}
    }, {
        key: 'loadState',
        value: function loadState(model, state) {}
    }, {
        key: 'mapProps',
        value: function mapProps(curr, next) {
            return Object.assign(curr, next);
        }
    }, {
        key: 'mapState',
        value: function mapState(curr, next) {
            return Object.assign(curr, next);
        }
    }, {
        key: 'observe',
        value: function observe(changes, depth) {}
    }, {
        key: 'render',
        value: function render() {
            return {
                sel: 'i', key: this.key,
                text: undefined, elm: undefined,
                data: undefined, children: undefined
            };
        }
    }, {
        key: 'listen',
        value: function listen(name) {
            var subjects = this.subjects || (this.subjects = {});
            var subject = subjects[name] || (subjects[name] = new _Event.Event());
            subject.eventName = name;
            return subject;
        }
    }, {
        key: 'dispatch',
        value: function dispatch(name) {
            var _this2 = this;

            for (var _len2 = arguments.length, values = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                values[_key2 - 1] = arguments[_key2];
            }

            var handlers = this.handlers || (this.handlers = {});
            var responder = values.length > 0 ? function (event) {
                return _this2.trigger(name, [event].concat(values));
            } : handlers[name] || (handlers[name] = this.trigger.bind(this, name));
            responder.eventName = name;
            return responder;
        }
    }, {
        key: 'trigger',
        value: function trigger(name, value) {
            var subjects = this.subjects;
            if (subjects) {
                var subject = subjects[name];
                if (subject) {
                    subject.next(value);
                }
            }
        }
    }, {
        key: 'deref',
        value: function deref(create, subjects, children, depth, model, state) {
            var ids = arguments.length <= 6 || arguments[6] === undefined ? state : arguments[6];


            var isRange = !Array.isArray(ids) && ('from' in ids || 'to' in ids);
            var offset = isRange ? ids.from || 0 : 0;
            var to = isRange ? ids.to || ids.length + 1 : ids.length || offset;

            var index = -1;
            var count = to - offset;

            while (++index <= count) {
                var key = isRange || index > to ? index + offset : ids !== state && ids[index] || index;
                if (!subjects[index]) {
                    subjects[index] = new _rxjs.BehaviorSubject();
                    var changes = _Changes.Changes.from(subjects[index], { key: key }, depth + 1);
                    children[index] = changes.component = create(changes, state[key], key, index);
                }
            }

            index = count - 1;
            children.length = count;
            count = subjects.length;
            while (++index < count) {
                subjects[index].complete();
            }

            index = -1;
            count = subjects.length = children.length;
            while (++index < count) {
                subjects[index].next([model, state]);
            }

            return children;
        }
    }]);

    return Component;
}(_rxjs.Observable);

function convertToObservable(ish, skipNulls) {
    if (ish == null) {
        if (skipNulls) {
            return _rxjs.Observable.empty();
        }
        return _rxjs.Observable.of(ish);
    } else if (ish instanceof _rxjs.Observable || isArray(ish) || (0, _isPromise.isPromise)(ish)) {
        return ish;
    } else if (typeof ish[_symbolObservable.$$observable] === 'function') {
        return ish[_symbolObservable.$$observable]();
    } else if (typeof ish.subscribe === 'function') {
        return _rxjs.Observable.from(ish);
    } else {
        return _rxjs.Observable.of(ish);
    }
}
//# sourceMappingURL=Component.js.map