'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.reaxtor = exports.falcor = exports.Container = exports.Component = exports.Router = exports.Event = exports.Model = exports.hJSX = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /** @jsx hJSX */

var _Subject = require('rxjs/Subject');

var _Observable = require('rxjs/Observable');

var _Subscriber = require('rxjs/Subscriber');

var _Subscription = require('rxjs/Subscription');

var _BehaviorSubject = require('rxjs/BehaviorSubject');

require('rxjs/add/observable/of');

require('rxjs/add/observable/from');

require('rxjs/add/observable/defer');

require('rxjs/add/observable/empty');

require('rxjs/add/observable/combineLatest');

require('rxjs/add/operator/do');

require('rxjs/add/operator/map');

require('rxjs/add/operator/scan');

require('rxjs/add/operator/mergeMap');

require('rxjs/add/operator/startWith');

require('rxjs/add/operator/switchMap');

require('rxjs/add/operator/distinctUntilChanged');

var _falcor = require('falcor');

var _falcor2 = _interopRequireDefault(_falcor);

var _falcorRouter = require('falcor-router');

var _falcorRouter2 = _interopRequireDefault(_falcorRouter);

var _Model = require('./Model');

var _Event = require('./Event');

var _Component = require('./Component');

var _Container = require('./Container');

var _snabbdomJsx = require('snabbdom-jsx');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_Subscriber.Subscriber.prototype.onNext = _Subscriber.Subscriber.prototype.next;
_Subscriber.Subscriber.prototype.onError = _Subscriber.Subscriber.prototype.error;
_Subscriber.Subscriber.prototype.onCompleted = _Subscriber.Subscriber.prototype.complete;
_Subscriber.Subscriber.prototype.dispose = _Subscriber.Subscriber.prototype.unsubscribe;

_Subject.Subject.prototype.onNext = _Subject.Subject.prototype.next;
_Subject.Subject.prototype.onError = _Subject.Subject.prototype.error;
_Subject.Subject.prototype.onCompleted = _Subject.Subject.prototype.complete;
_Subject.Subject.prototype.dispose = _Subject.Subject.prototype.unsubscribe;

_Subscription.Subscription.prototype.dispose = _Subscription.Subscription.prototype.unsubscribe;

exports.hJSX = _snabbdomJsx.html;
exports.Model = _Model.Model;
exports.Event = _Event.Event;
exports.Router = _falcorRouter2.default;
exports.Component = _Component.Component;
exports.Container = _Container.Container;
exports.falcor = _falcor2.default;
exports.reaxtor = reaxtor;


function reaxtor(RootClass, model) {
    var props = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];


    var working = false;
    var reenter = false;
    var array = new Array(2);
    var models = new _BehaviorSubject.BehaviorSubject(model);
    var previousOnChangesCompleted = model._root.onChangesCompleted;

    model._root.onChangesCompleted = function () {
        if (working) {
            return reenter = true;
        }
        working = true;
        do {
            reenter = false;
            // console.log('\nstart top-down render ----> [');
            if (previousOnChangesCompleted) {
                previousOnChangesCompleted.call(this);
            }
            models.next(model = this);
            // console.log('] <---- end top-down render\n');
        } while (reenter === true);
    };

    return new RootClass(_extends({}, props, { models: models })).map(function (rootVDom) {
        working = false;
        array[0] = model;
        array[1] = rootVDom;
        return array;
    });
}
//# sourceMappingURL=index.js.map