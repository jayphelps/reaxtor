'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Component = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug2 = require('debug');

var _debug3 = _interopRequireDefault(_debug2);

var _util = require('util');

var _Event = require('./Event');

var _Changes = require('./Changes');

var _rxjs = require('rxjs');

require('rxjs/add/observable/of');

require('rxjs/add/observable/from');

require('rxjs/add/observable/empty');

require('rxjs/add/observable/combineLatest');

require('rxjs/add/operator/scan');

require('rxjs/add/operator/startWith');

require('rxjs/add/operator/switchMap');

require('rxjs/add/operator/switchMapTo');

require('rxjs/add/operator/distinctUntilChanged');

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

    function Component(data) {
        var children = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

        _classCallCheck(this, Component);

        // If this Component was created via snabbdom JSX, aggregate
        // all the containers that can hold props data.

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Component).call(this));

        var _data$dataset = data.dataset;
        var dataset = _data$dataset === undefined ? {} : _data$dataset;
        var parent = data.parent;
        var _data$depth = data.depth;
        var depth = _data$depth === undefined ? 0 : _data$depth;
        var _data$index = data.index;
        var index = _data$index === undefined ? 0 : _data$index;
        var _data$attrs = data.attrs;
        var attrs = _data$attrs === undefined ? {} : _data$attrs;
        var _data$props = data.props;
        var props = _data$props === undefined ? {} : _data$props;

        delete data.attrs;
        delete data.props;
        delete data.depth;
        delete data.index;
        delete data.parent;
        delete data.dataset;
        if (typeof data.render === 'function') {
            _this.render = data.render;
            delete data.render;
        }
        if (children.length === 1) {
            var head = children[0];
            if (typeof head === 'function') {
                _this.render = children.pop();
            } else if (typeof head.item === 'function' && typeof head.render === 'function') {
                children.pop();
                _this.item = head.item;
                _this.render = head.render;
            }
        }
        _this.depth = depth;
        _this.index = index;
        _this.parent = parent;
        _this.props = _extends({}, data, attrs, props, dataset);
        _this.children = children;
        return _this;
    }

    _createClass(Component, [{
        key: 'observe',
        value: function observe(parent) {
            var _this2 = this;

            var depth = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
            var index = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];


            var debug = (0, _debug3.default)('reaxtor:component');
            var props = this.props;
            var _props$path = this.props.path;
            var path = _props$path === undefined ? [] : _props$path;
            var children = this.children;

            var hasDynamicChildren = typeof this.item === 'function';

            var indent = '';
            if (debug.enabled) {
                var indentIdx = 0;
                while (++indentIdx <= depth) {
                    indent += '    ';
                }
                indent += '|---';
            }

            var modelsAndState = _Changes.Changes.from(parent, this, indent).deref(path);

            var distinctModelsAndState = modelsAndState.distinctUntilChanged(function (currKey, nextKey) {
                return !_this2.shouldComponentUpdate(currKey, nextKey);
            }, function (modelsAndState) {
                var nextKey = _this2.mapUpdate(modelsAndState[0], depth, index);
                if (debug.enabled) {
                    debug('     will update ' + indent + ' ' + nextKey);
                }
                return nextKey;
            });

            var componentState = distinctModelsAndState.scan(function (componentState, modelsAndState) {
                componentState[0] = modelsAndState[0];
                componentState[1] = _extends({}, modelsAndState[1], componentState[1]);
                return componentState;
            }, [null, props]);

            var modelAndRemoteState = componentState.switchMap(function (componentState) {
                if (debug.enabled) {
                    debug('get remote state ' + indent + ' ' + _this2.key);
                }
                return convertToObservable(_this2.getRemote.apply(_this2, _toConsumableArray(componentState)));
            }, function (componentState) {
                var newRemoteState = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

                if (newRemoteState.json) {
                    newRemoteState = newRemoteState.json;
                };
                componentState[1] = _this2.mapRemoteState(componentState[1], newRemoteState);
                return componentState;
            });

            var modelAndLocalState = modelAndRemoteState.switchMap(function (componentState) {
                if (debug.enabled) {
                    debug('get events state ' + indent + ' ' + _this2.key + ' ' + serializeStateWithIndent(indent, componentState[1]));
                }
                return convertToObservable(_this2.getEvents.apply(_this2, _toConsumableArray(componentState)), true).startWith(componentState[1]);
            }, function (componentState) {
                var newLocalState = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

                if (newLocalState.json) {
                    newLocalState = newLocalState.json;
                };
                componentState[1] = _this2.mapEventsState(componentState[1], newLocalState);
                return componentState;
            });

            var updateChildren = hasDynamicChildren ? function (subjects, children) {
                return function (componentState) {
                    var active = _this2.deref.apply(_this2, [subjects, children, depth].concat(_toConsumableArray(componentState)));
                    return active.length === 0 ? _rxjs.Observable.of(children = active) : _rxjs.Observable.combineLatest(children = active);
                };
            }([], []) : function (children) {
                return function () {
                    return _rxjs.Observable.combineLatest(children);
                };
            }(children.map(function (child, index) {
                return child.observe(modelAndLocalState, depth + 1, index);
            }));

            var childUpdates = modelAndLocalState.switchMap(updateChildren, function (componentState, children) {
                return [].concat(_toConsumableArray(componentState), _toConsumableArray(children));
            });

            var vDOMs = childUpdates.switchMap(function (xs) {
                if (debug.enabled) {
                    debug('     will render ' + indent + ' ' + _this2.key + ' ' + serializeStateWithIndent(indent, xs[1]));
                }
                return convertToObservable(_this2.render.apply(_this2, _toConsumableArray(xs.slice(1))));
            });

            return vDOMs;
        }
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(currKey, nextKey) {
            return currKey !== nextKey;
        }
    }, {
        key: 'getRemote',
        value: function getRemote(model, props) {
            var _props$keys = props.keys;
            var keys = _props$keys === undefined ? null : _props$keys;

            if (!keys) {
                return undefined;
            } else if (typeof keys === 'string') {
                return model.get(keys);
            } else if (isArray(keys)) {
                return model.get.apply(model, _toConsumableArray(keys));
            }
            return undefined;
        }
    }, {
        key: 'getEvents',
        value: function getEvents(model, props) {
            return undefined;
        }
    }, {
        key: 'render',
        value: function render(props) {
            for (var _len = arguments.length, children = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                children[_key - 1] = arguments[_key];
            }

            return {
                sel: 'i', key: this.key,
                text: undefined, elm: undefined,
                data: undefined, children: children
            };
        }
    }, {
        key: 'mapUpdate',
        value: function mapUpdate(model, depth, index) {
            return this.key = '{d: ' + depth + ', i: ' + index + '} ' + model.inspect() + ' ' + (this.name || this.constructor.name);
        }
    }, {
        key: 'mapRemoteState',
        value: function mapRemoteState(currState, nextState) {
            return Object.assign(currState, nextState);
        }
    }, {
        key: 'mapEventsState',
        value: function mapEventsState(currState, nextState) {
            return Object.assign(currState, nextState);
        }
    }, {
        key: 'deref',
        value: function deref(subjects, children, depth, _model, _state) {
            var ids = arguments.length <= 5 || arguments[5] === undefined ? _state : arguments[5];


            var isRange = !isArray(ids) && ('from' in ids || 'to' in ids);
            var offset = isRange ? ids.from || 0 : 0;
            var to = isRange ? ids.to || ids.length + 1 : ids.length || offset;

            var index = -1;
            var count = to - offset;

            while (++index <= count) {
                var key = isRange || index > to ? index + offset : ids !== _state && ids[index] || index;
                if (!subjects[index]) {
                    children[index] = this.item(_state[key], key, index).observe(subjects[index] = new _rxjs.BehaviorSubject(), depth + 1, index);
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
                subjects[index].next([_model, _state]);
            }

            return children;
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
            var handlers = this.handlers || (this.handlers = {});
            var responder = handlers[name] || (handlers[name] = this.trigger.bind(this, name));
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
    }]);

    return Component;
}(_rxjs.Observable);

function serializeStateWithIndent(indent, state) {

    var result = (0, _util.inspect)(state, { depth: null });

    // if ((/(\n|\r)/i).test(result)) {

    var spaces = '                     ';
    var indent2 = '       ';
    var indent3 = indent2 + indent.replace(/(\||\-)/ig, ' ');

    result = result.slice(1, -1);
    result = '\n' + spaces + indent2 + '{' + ('\n ' + result).replace(/(\n|\r)/ig, '\n' + spaces + indent3) + ('\n' + spaces + indent2 + '}\n');
    // }

    return result;
}

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