'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.reaxtor = exports.Event = exports.Model = exports.List = exports.Base = exports.hJSX = undefined;

var _Subject = require('rxjs/Subject');

var _Observable = require('rxjs/Observable');

var _Subscriber = require('rxjs/Subscriber');

var _BehaviorSubject = require('rxjs/subject/BehaviorSubject');

require('rxjs/add/observable/from');

require('rxjs/add/observable/defer');

require('rxjs/add/observable/empty');

require('rxjs/add/observable/fromArray');

require('rxjs/add/operator/do');

require('rxjs/add/operator/map');

require('rxjs/add/operator/zip');

require('rxjs/add/operator/last');

require('rxjs/add/operator/scan');

require('rxjs/add/operator/first');

require('rxjs/add/operator/filter');

require('rxjs/add/operator/concat');

require('rxjs/add/operator/groupBy');

require('rxjs/add/operator/mergeMap');

require('rxjs/add/operator/switchMap');

require('rxjs/add/operator/zip-static');

require('rxjs/add/operator/combineLatest');

require('rxjs/add/operator/withLatestFrom');

require('rxjs/add/operator/distinctUntilChanged');

require('rxjs/add/operator/combineLatest-static');

var _snabbdomJsx = require('snabbdom-jsx');

var _snabbdom = require('snabbdom');

var _snabbdom2 = _interopRequireDefault(_snabbdom);

var _class = require('snabbdom/modules/class');

var _class2 = _interopRequireDefault(_class);

var _props = require('snabbdom/modules/props');

var _props2 = _interopRequireDefault(_props);

var _style = require('snabbdom/modules/style');

var _style2 = _interopRequireDefault(_style);

var _attributes = require('snabbdom/modules/attributes');

var _attributes2 = _interopRequireDefault(_attributes);

var _eventlisteners = require('snabbdom/modules/eventlisteners');

var _eventlisteners2 = _interopRequireDefault(_eventlisteners);

var _Base = require('./Base');

var _List = require('./List');

var _Model = require('./Model');

var _Event = require('./Event');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @jsx hJSX */

_Subscriber.Subscriber.prototype.onNext = _Subscriber.Subscriber.prototype.next;
_Subscriber.Subscriber.prototype.onError = _Subscriber.Subscriber.prototype.error;
_Subscriber.Subscriber.prototype.onCompleted = _Subscriber.Subscriber.prototype.complete;

_Subject.Subject.prototype.onNext = _Subject.Subject.prototype.next;
_Subject.Subject.prototype.onError = _Subject.Subject.prototype.error;
_Subject.Subject.prototype.onCompleted = _Subject.Subject.prototype.complete;

var patch = _snabbdom2.default.init([_class2.default, _props2.default, _style2.default, _attributes2.default, _eventlisteners2.default]);

exports.hJSX = _snabbdomJsx.html;
exports.Base = _Base.Base;
exports.List = _List.List;
exports.Model = _Model.Model;
exports.Event = _Event.Event;
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
        working = false;
    };

    return new RootClass({ models: models });
}
//# sourceMappingURL=index.js.map