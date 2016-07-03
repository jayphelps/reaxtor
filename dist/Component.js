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


        delete props.index;
        delete props.depth;
        delete props.models;

        _this.props = props;

        var indent = '';
        if (debug.enabled) {
            var indentIdx = 0;
            while (++indentIdx <= depth) {
                indent += '    ';
            }
            indent += '|---';
        }

        var modelsAndStates = models.distinctUntilChanged(function () {
            return !_this.shouldComponentUpdate.apply(_this, arguments);
        }, function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            var nextKey = _this.mapUpdate.apply(_this, args.concat([depth, index]));
            if (debug.enabled) {
                debug('   update ' + indent + ' ' + nextKey);
            }
            return nextKey;
        }).switchMap(function (model) {
            if (debug.enabled) {
                debug('loadProps ' + indent + ' ' + _this.key);
            }
            return convertToObservable(_this.loadProps(model));
        }, function (model) {
            var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            var _ref$json = _ref.json;
            var state = _ref$json === undefined ? {} : _ref$json;

            var result = _this.mapProps(model, state);
            if (typeof result === 'undefined') {
                return [model, state];
            } else if (isArray(result)) {
                if (result[0] !== model) {
                    result = [model].concat(_toConsumableArray(result));
                }
                if (typeof result[1] === 'undefined') {
                    result[1] = state;
                }
                return result;
            } else {
                return [model, state];
            }
        }).switchMap(function (modelAndState) {
            if (debug.enabled) {
                debug('loadState ' + indent + ' ' + _this.key + ' ' + serializeStateWithIndent(indent, modelAndState[1]));
            }
            return convertToObservable(_this.loadState.apply(_this, _toConsumableArray(modelAndState)), true).startWith(modelAndState[1]);
        }, function (modelAndState, newState) {
            var result = _this.mapState(modelAndState[1], newState);
            if (typeof result === 'undefined') {
                result = _extends({}, modelAndState[1], newState);
            }
            modelAndState[1] = result;
            return modelAndState;
        });

        var modelAndStateChanges = _Changes.Changes.from(modelsAndStates, _this, indent);

        var vDOMs = convertToObservable(_this.initialize(modelAndStateChanges, depth) || modelAndStateChanges).switchMap(function (args) {
            if (debug.enabled) {
                debug('   render ' + indent + ' ' + _this.key + ' ' + serializeStateWithIndent(indent, args[1]));
            }
            return convertToObservable(_this.render.apply(_this, _toConsumableArray(args)));
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
        value: function loadProps(model) {}
    }, {
        key: 'mapProps',
        value: function mapProps(model, props) {}
    }, {
        key: 'loadState',
        value: function loadState(model, state) {}
    }, {
        key: 'mapState',
        value: function mapState(state, newState) {}
    }, {
        key: 'initialize',
        value: function initialize(changes, depth) {}
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

    if (/(\n|\r)/i.test(result)) {

        var spaces = '                     ';
        var indent2 = '       ';
        var indent3 = indent2 + indent.replace(/(\||\-)/ig, ' ');

        result = result.slice(1, -1);
        result = '\n' + spaces + indent2 + '{' + ('\n ' + result).replace(/(\n|\r)/ig, '\n' + spaces + indent3) + ('\n' + spaces + indent2 + '}\n');
    }

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