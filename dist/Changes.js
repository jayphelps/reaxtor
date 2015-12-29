'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Changes = undefined;

var _Observable2 = require('rxjs/Observable');

var _Subscription = require('rxjs/Subscription');

var _asap = require('rxjs/scheduler/asap');

var _tryCatch = require('rxjs/util/tryCatch');

var _Scheduler = require('rxjs/Scheduler');

var _Subscriber4 = require('rxjs/Subscriber');

var _errorObject = require('rxjs/util/errorObject');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Array = Array;
var isArray = _Array.isArray;

_Observable2.Observable.pairs = observablePairs;
_Observable2.Observable.prototype.inspectTime = inspectTime;
_Observable2.Observable.prototype.distinctUntilChanged = distinctUntilChanged;

var Changes = exports.Changes = (function (_Observable) {
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

            return new _Subscription.Subscription(function () {
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

            return this.lift(new DerefOperator(isArray(keys[0]) ? keys[0] : keys));
        }
    }], [{
        key: 'from',
        value: function from(source) {
            var observable = new Changes();
            observable.source = source;
            return observable;
        }
    }]);

    return Changes;
})(_Observable2.Observable);

var DerefOperator = (function () {
    function DerefOperator(keys) {
        _classCallCheck(this, DerefOperator);

        this.keys = keys;
    }

    _createClass(DerefOperator, [{
        key: 'call',
        value: function call(subscriber) {
            return new DerefSubscriber(subscriber, this.keys);
        }
    }]);

    return DerefOperator;
})();

var DerefSubscriber = (function (_Subscriber) {
    _inherits(DerefSubscriber, _Subscriber);

    function DerefSubscriber(destination, keys) {
        _classCallCheck(this, DerefSubscriber);

        var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(DerefSubscriber).call(this, destination));

        _this3.keys = keys;
        return _this3;
    }

    _createClass(DerefSubscriber, [{
        key: '_next',
        value: function _next(update) {

            var keys = this.keys;
            var count = keys.length;
            var keysIdx = -1;
            var _update = update;

            var _update2 = _slicedToArray(_update, 2);

            var model = _update2[0];
            var state = _update2[1];

            while (++keysIdx < count) {
                var key = keys[keysIdx];
                if (!state.hasOwnProperty(key)) {
                    return;
                }
                model = (0, _tryCatch.tryCatch)(model.deref).call(model, state = state[key]);
                if (model === _errorObject.errorObject) {
                    return this.destination.error(_errorObject.errorObject.e);
                }
            }

            update = update.slice(0);
            update[0] = model;
            update[1] = state;

            _get(Object.getPrototypeOf(DerefSubscriber.prototype), '_next', this).call(this, update);
        }
    }]);

    return DerefSubscriber;
})(_Subscriber4.Subscriber);

function observablePairs(obj) {
    return _Observable2.Observable.create(function subscribe(subscriber) {
        var arr = Array.isArray(obj);
        var keys = arr ? obj : Object.keys(obj);
        var count = keys.length;
        var index = -1;
        while (!subscriber.isUnsubscribed && ++index < count) {
            var key = arr ? index : keys[index];
            subscriber.next([key, obj[key]]);
        }
        subscriber.complete();
    });
}

function distinctUntilChanged(compare, keySelector) {
    return this.lift(new DistinctUntilChangedOperator(compare, keySelector));
}

var DistinctUntilChangedOperator = (function () {
    function DistinctUntilChangedOperator(compare, keySelector) {
        _classCallCheck(this, DistinctUntilChangedOperator);

        this.compare = compare;
        this.keySelector = keySelector;
    }

    _createClass(DistinctUntilChangedOperator, [{
        key: 'call',
        value: function call(subscriber) {
            return new DistinctUntilChangedSubscriber(subscriber, this.compare, this.keySelector);
        }
    }]);

    return DistinctUntilChangedOperator;
})();

var DistinctUntilChangedSubscriber = (function (_Subscriber2) {
    _inherits(DistinctUntilChangedSubscriber, _Subscriber2);

    function DistinctUntilChangedSubscriber(destination, compare, keySelector) {
        _classCallCheck(this, DistinctUntilChangedSubscriber);

        var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(DistinctUntilChangedSubscriber).call(this, destination));

        _this4.keySelector = keySelector;
        _this4.hasKey = false;
        if (typeof compare === 'function') {
            _this4.compare = compare;
        }
        return _this4;
    }

    _createClass(DistinctUntilChangedSubscriber, [{
        key: 'compare',
        value: function compare(x, y) {
            return x === y;
        }
    }, {
        key: '_next',
        value: function _next(value) {
            var keySelector = this.keySelector;
            var key = value;
            if (keySelector) {
                key = (0, _tryCatch.tryCatch)(this.keySelector)(value);
                if (key === _errorObject.errorObject) {
                    return this.destination.error(_errorObject.errorObject.e);
                }
            }
            var result = false;
            if (this.hasKey) {
                result = (0, _tryCatch.tryCatch)(this.compare)(this.key, key);
                if (result === _errorObject.errorObject) {
                    return this.destination.error(_errorObject.errorObject.e);
                }
            } else {
                this.hasKey = true;
            }
            if (Boolean(result) === false) {
                this.key = key;
                this.destination.next(value);
            }
        }
    }]);

    return DistinctUntilChangedSubscriber;
})(_Subscriber4.Subscriber);

function inspectTime(delay) {
    var scheduler = arguments.length <= 1 || arguments[1] === undefined ? _asap.asap : arguments[1];

    return this.lift(new InspectTimeOperator(delay, scheduler));
}

var InspectTimeOperator = (function () {
    function InspectTimeOperator(delay, scheduler) {
        _classCallCheck(this, InspectTimeOperator);

        this.delay = delay;
        this.scheduler = scheduler;
    }

    _createClass(InspectTimeOperator, [{
        key: 'call',
        value: function call(subscriber) {
            return new InspectTimeSubscriber(subscriber, this.delay, this.scheduler);
        }
    }]);

    return InspectTimeOperator;
})();

var InspectTimeSubscriber = (function (_Subscriber3) {
    _inherits(InspectTimeSubscriber, _Subscriber3);

    function InspectTimeSubscriber(destination, delay, scheduler) {
        _classCallCheck(this, InspectTimeSubscriber);

        var _this5 = _possibleConstructorReturn(this, Object.getPrototypeOf(InspectTimeSubscriber).call(this, destination));

        _this5.delay = delay;
        _this5.value = null;
        _this5.hasValue = false;
        _this5.scheduler = scheduler;
        return _this5;
    }

    _createClass(InspectTimeSubscriber, [{
        key: '_next',
        value: function _next(value) {
            this.value = value;
            this.hasValue = true;
            if (!this.throttled) {
                this.add(this.throttled = this.scheduler.schedule(this.clearThrottle.bind(this), this.delay, this));
            }
        }
    }, {
        key: 'clearThrottle',
        value: function clearThrottle() {
            var value = this.value;
            var hasValue = this.hasValue;
            var throttled = this.throttled;

            if (throttled) {
                throttled.unsubscribe();
                this.remove(throttled);
                this.throttled = null;
            }
            if (hasValue) {
                this.value = null;
                this.hasValue = false;
                this.destination.next(value);
            }
        }
    }]);

    return InspectTimeSubscriber;
})(_Subscriber4.Subscriber);
//# sourceMappingURL=Changes.js.map