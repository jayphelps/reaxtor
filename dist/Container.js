'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Container = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Subject = require('rxjs/Subject');

var _Component2 = require('./Component');

var _Observable = require('rxjs/Observable');

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
        key: 'createChildren',
        value: function createChildren(models) {
            var _this2 = this;

            var subjects = [];
            var children = [];
            return models.switchMap(function (tuple) {
                var kids = _this2.deref(subjects, children, tuple);
                if (kids.length === 0) {
                    return _Observable.Observable.of([tuple]);
                }
                return _Observable.Observable.combineLatest(children = kids, function () {
                    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                        args[_key] = arguments[_key];
                    }

                    return [tuple].concat(args);
                });
            });
        }
    }, {
        key: 'deref',
        value: function deref(subjects, children, _ref) {
            var _ref2 = _slicedToArray(_ref, 2);

            var _model = _ref2[0];
            var _state = _ref2[1];


            var index = -1;
            var count = _state.length;

            while (++index < count) {
                if (!subjects[index]) {
                    subjects[index] = new _Subject.Subject();
                    children[index] = this.createChild(subjects[index], _state[index], index);
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
                var state = _state[index];
                var model = _model.deref(state);
                subjects[index].next([model, state, index]);
            }

            return children;
        }
    }]);

    return Container;
}(_Component2.Component);
//# sourceMappingURL=Container.js.map