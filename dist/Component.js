'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Component = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Event = require('./Event');

var _Changes = require('./Changes');

var _Subscriber = require('rxjs/Subscriber');

var _Observable2 = require('rxjs/Observable');

var _BehaviorSubject = require('rxjs/BehaviorSubject');

var _isPromise = require('rxjs/util/isPromise');

var _symbolObservable = require('symbol-observable');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var isArray = Array.isArray;

var Component = exports.Component = function (_Observable) {
    _inherits(Component, _Observable);

    function Component(props, createChild) {
        _classCallCheck(this, Component);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Component).call(this));

        var index = props.index;
        var models = props.models;

        delete props.index;
        delete props.models;

        _this.index = index || 0;

        for (var key in props) {
            if (props.hasOwnProperty(key)) {
                _this[key] = props[key];
            }
        }

        if (createChild) {
            _this.createChild = createChild;
        }

        var modelsAndStates = models.distinctUntilChanged(function () {
            return !_this.shouldComponentUpdate.apply(_this, arguments);
        }, function () {
            return _this.mapUpdate.apply(_this, arguments);
        }).switchMap(function (model) {
            return convertToObservable(_this.loadProps(model) || { json: {} });
        }, function (model, props) {
            return _this.mapProps(model, props) || [model, props.json];
        }).switchMap(function (modelAndState) {
            return convertToObservable(_this.loadState.apply(_this, _toConsumableArray(modelAndState)), true).startWith(modelAndState[1]);
        }, function (modelAndState, newState) {
            return (modelAndState[1] = _this.mapState(modelAndState[1], newState) || _extends({}, modelAndState[1], newState)) && modelAndState || modelAndState;
        });

        var modelAndStateChanges = _Changes.Changes.from(modelsAndStates);

        var vDOMs = convertToObservable(_this.initialize(modelAndStateChanges) || modelAndStateChanges).switchMap(function (args) {
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
        value: function mapUpdate(model) {
            return this.key = this.constructor.name + ' ' + this.index + ' ' + model.inspect();
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
        value: function initialize(changes) {}
    }, {
        key: 'render',
        value: function render() {
            return _Observable2.Observable.empty();
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
}(_Observable2.Observable);

function convertToObservable(ish, skipNulls) {
    if (ish == null) {
        if (skipNulls) {
            return _Observable2.Observable.empty();
        }
        return _Observable2.Observable.of(ish);
    } else if (ish instanceof _Observable2.Observable || isArray(ish) || (0, _isPromise.isPromise)(ish)) {
        return ish;
    } else if (typeof ish[_symbolObservable.$$observable] === 'function') {
        return ish[_symbolObservable.$$observable]();
    } else {
        return _Observable2.Observable.of(ish);
    }
}
//# sourceMappingURL=Component.js.map