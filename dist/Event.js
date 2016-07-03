'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Event = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _rxjs = require('rxjs');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Event = exports.Event = function (_Subject) {
    _inherits(Event, _Subject);

    function Event(destination, source) {
        _classCallCheck(this, Event);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Event).call(this));

        _this.source = source;
        _this.destination = destination;
        return _this;
    }

    _createClass(Event, [{
        key: 'lift',
        value: function lift(operator) {
            var event = new Event(this.destination || this, this);
            event.operator = operator;
            return event;
        }
    }, {
        key: 'next',
        value: function next(value) {
            var destination = this.destination;

            if (destination && destination.next) {
                destination.next(value);
            } else {
                _get(Object.getPrototypeOf(Event.prototype), 'next', this).call(this, value);
            }
        }
    }, {
        key: 'error',
        value: function error(err) {
            var destination = this.destination;

            if (destination && destination.error) {
                this.destination.error(err);
            } else {
                _get(Object.getPrototypeOf(Event.prototype), 'error', this).call(this, err);
            }
        }
    }, {
        key: 'complete',
        value: function complete() {
            var destination = this.destination;

            if (destination && destination.complete) {
                this.destination.complete();
            } else {
                _get(Object.getPrototypeOf(Event.prototype), 'complete', this).call(this);
            }
        }
    }, {
        key: 'unsubscribe',
        value: function unsubscribe() {
            this.source = null;
            this.observers = null;
            this.isStopped = true;
            this.destination = null;
            this.isUnsubscribed = true;
        }
    }, {
        key: '_subscribe',
        value: function _subscribe(subscriber) {
            var source = this.source;

            return source ? source.subscribe(subscriber) : _get(Object.getPrototypeOf(Event.prototype), '_subscribe', this).call(this, subscriber);
        }
    }, {
        key: 'stop',
        value: function stop() {
            return this.do(function (x) {
                return x.stopPropagation();
            });
        }
    }, {
        key: 'clobber',
        value: function clobber() {
            return this.do(function (x) {
                x.preventDefault();
                x.stopPropagation();
            });
        }
    }]);

    return Event;
}(_rxjs.Subject);
//# sourceMappingURL=Event.js.map