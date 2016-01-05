'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Base = undefined;

var _Event = require('./Event');

var _Changes = require('./Changes');

var _isPromise = require('rxjs/util/isPromise');

var _Observable2 = require('rxjs/Observable');

var _SymbolShim = require('rxjs/util/SymbolShim');

var _ReplaySubject = require('rxjs/subject/ReplaySubject');

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Array = Array;
var isArray = _Array.isArray;

var Base = exports.Base = (function (_Observable) {
    _inherits(Base, _Observable);

    function Base(attrs, createChild) {
        _classCallCheck(this, Base);

        if (typeof attrs === 'function') {
            var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Base).call(this, attrs));
        } else if (isObservable(attrs)) {
            var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Base).call(this));

            _this.models = attrs;
        } else {
            var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Base).call(this));

            if ((typeof attrs === 'undefined' ? 'undefined' : _typeof(attrs)) === 'object') {
                if (createChild && !_this.createChild) {
                    _this.createChild = createChild;
                }
                var models = attrs['models'];
                delete attrs['models'];
                for (var key in attrs) {
                    if (attrs.hasOwnProperty(key)) {
                        _this[key] = attrs[key];
                    }
                }
                if (isObservable(models)) {
                    _this.models = models;
                }
            }
        }
        return _possibleConstructorReturn(_this);
    }

    _createClass(Base, [{
        key: 'createChildren',
        value: function createChildren(updates) {
            return updates;
        }
    }, {
        key: 'loader',
        value: function loader(props) {
            return _Observable2.Observable.of({ json: {} });
        }
    }, {
        key: 'events',
        value: function events(props) {
            return _Observable2.Observable.of(props);
        }
    }, {
        key: 'render',
        value: function render(props) {
            return _Observable2.Observable.empty();
        }
    }, {
        key: 'mapModelToKey',
        value: function mapModelToKey(_ref) {
            var _ref2 = _slicedToArray(_ref, 1);

            var model = _ref2[0];

            return name + ' ' + model.inspect();
        }
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(currKey, nextKey) {
            return currKey !== nextKey;
        }
    }, {
        key: 'mapDataToProps',
        value: function mapDataToProps(_ref3, _ref4) {
            var _ref5 = _slicedToArray(_ref3, 1);

            var model = _ref5[0];
            var json = _ref4.json;

            return [model, json];
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
    }, {
        key: 'lift',
        value: function lift(operator) {
            var component = new Base();
            component.source = this;
            component.operator = operator;
            return component;
        }
    }, {
        key: 'models',
        set: function set(m) {
            var _this2 = this;

            if (this.source) {
                this.source.unsubscribe();
            }

            if (this.subscription) {
                this.subscription.unsubscribe();
            }

            var updates = _Changes.Changes.from(m.distinctUntilChanged(function () {
                return !_this2.shouldComponentUpdate.apply(_this2, arguments);
            }, function () {
                return _this2.key = _this2.mapModelToKey.apply(_this2, arguments);
            }).switchMap(function () {
                return _this2.loader.apply(_this2, arguments);
            }, function () {
                return _this2.mapDataToProps.apply(_this2, arguments);
            })
            // .do(() => console.log('updated', this.key))
            .switchMap(function (props) {
                return _this2.events(props).startWith(props);
            }));

            this.source = new _ReplaySubject.ReplaySubject(1);

            this.subscription = this.createChildren(updates).switchMap(function () {
                return toObservable(_this2.render.apply(_this2, arguments));
            }, false)
            // .do(() => console.log('rendered', this.key))
            .subscribe(this.source);
        }
    }]);

    return Base;
})(_Observable2.Observable);

function toObservable(ish, skipNull) {
    if (ish == null) {
        return skipNull ? _Observable2.Observable.empty() : _Observable2.Observable.of(ish);
    } else if (isArray(ish) || (0, _isPromise.isPromise)(ish) || isObservable(ish) || typeof ish[_SymbolShim.SymbolShim.observable] === 'function') {
        return ish;
    } else {
        return _Observable2.Observable.of(ish);
    }
}

function isObservable(ish) {
    if (ish && (typeof ish === 'undefined' ? 'undefined' : _typeof(ish)) === 'object') {
        return ish instanceof _Observable2.Observable;
    }
    return false;
}
//# sourceMappingURL=Base.js.map