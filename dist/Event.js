'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Event = undefined;

var _Subject2 = require('rxjs/Subject');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Event = exports.Event = (function (_Subject) {
    _inherits(Event, _Subject);

    function Event() {
        _classCallCheck(this, Event);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Event).apply(this, arguments));
    }

    _createClass(Event, [{
        key: 'lift',
        value: function lift(operator) {
            var event = new Event(this, this.destination || this);
            event.operator = operator;
            return event;
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
})(_Subject2.Subject);
//# sourceMappingURL=Event.js.map