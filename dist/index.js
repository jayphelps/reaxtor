'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.reaxtor = exports.Container = exports.Component = exports.Router = exports.Event = exports.Model = exports.hJSX = undefined;

var _Subject = require('rxjs/Subject');

var _Observable = require('rxjs/Observable');

var _Subscriber = require('rxjs/Subscriber');

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

var _falcorRouter = require('falcor-router');

var _falcorRouter2 = _interopRequireDefault(_falcorRouter);

var _Model = require('./Model');

var _Event = require('./Event');

var _Component = require('./Component');

var _Container = require('./Container');

var _snabbdomJsx = require('snabbdom-jsx');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @jsx hJSX */

_Subscriber.Subscriber.prototype.onNext = _Subscriber.Subscriber.prototype.next;
_Subscriber.Subscriber.prototype.onError = _Subscriber.Subscriber.prototype.error;
_Subscriber.Subscriber.prototype.onCompleted = _Subscriber.Subscriber.prototype.complete;

_Subject.Subject.prototype.onNext = _Subject.Subject.prototype.next;
_Subject.Subject.prototype.onError = _Subject.Subject.prototype.error;
_Subject.Subject.prototype.onCompleted = _Subject.Subject.prototype.complete;

exports.hJSX = _snabbdomJsx.html;
exports.Model = _Model.Model;
exports.Event = _Event.Event;
exports.Router = _falcorRouter2.default;
exports.Component = _Component.Component;
exports.Container = _Container.Container;
exports.reaxtor = reaxtor;


function reaxtor(RootClass, model) {

    var working = false;
    var reenter = false;

    var models = new _BehaviorSubject.BehaviorSubject([model]);
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
            models.next([this]);
            // console.log('] <---- end top-down render\n');
        } while (reenter === true);
    };

    return new RootClass({ models: models }).do(function () {
        working = false;
    });
}
//# sourceMappingURL=index.js.map