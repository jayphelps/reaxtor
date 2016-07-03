'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Container = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Component2 = require('./Component');

var _Observable = require('rxjs/Observable');

var _BehaviorSubject = require('rxjs/BehaviorSubject');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Container = exports.Container = function (_Component) {
    _inherits(Container, _Component);

    function Container() {
        _classCallCheck(this, Container);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Container).apply(this, arguments));
    }

    _createClass(Container, [{
        key: 'initialize',
        value: function initialize(models) {
            var _this2 = this;

            var subjects = [];
            var children = [];
            return models.switchMap(function (tuple) {
                var active = _this2.deref.apply(_this2, [subjects, children].concat(_toConsumableArray(tuple)));
                return active.length === 0 ? _Observable.Observable.of(tuple) : _Observable.Observable.combineLatest(children = active, function () {
                    for (var _len = arguments.length, kids = Array(_len), _key = 0; _key < _len; _key++) {
                        kids[_key] = arguments[_key];
                    }

                    return [].concat(_toConsumableArray(tuple), kids);
                });
            });
        }
    }, {
        key: 'deref',
        value: function deref(subjects, children, _model, _state) {
            var ids = arguments.length <= 4 || arguments[4] === undefined ? _state : arguments[4];


            var isRange = !Array.isArray(ids) && ('from' in ids || 'to' in ids);
            var offset = isRange ? ids.from || 0 : 0;
            var to = isRange ? ids.to || ids.length + 1 : ids.length || offset;

            var index = -1;
            var count = to - offset;

            while (++index <= count) {
                var key = isRange || index > to ? index + offset : ids !== _state && ids[index] || index;
                if (!subjects[index]) {
                    subjects[index] = new _BehaviorSubject.BehaviorSubject();
                    children[index] = this.createChild(subjects[index], index, key, _state[key]);
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
                var _key2 = isRange || index > to ? index + offset : ids !== _state && ids[index] || index;
                var state = _state[_key2];
                if (state && (typeof state === 'undefined' ? 'undefined' : _typeof(state)) === 'object') {
                    var model = _model.deref(state);
                    subjects[index].next(model);
                }
            }

            return children;
        }
    }]);

    return Container;
}(_Component2.Component);
//# sourceMappingURL=Container.js.map