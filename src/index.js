/** @jsx hJSX */

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';

Subscriber.prototype.onNext = Subscriber.prototype.next;
Subscriber.prototype.onError = Subscriber.prototype.error;
Subscriber.prototype.onCompleted = Subscriber.prototype.complete;

Subject.prototype.onNext = Subject.prototype.next;
Subject.prototype.onError = Subject.prototype.error;
Subject.prototype.onCompleted = Subject.prototype.complete;

import 'rxjs/add/observable/from';
import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/fromArray';

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/zip';
import 'rxjs/add/operator/last';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/groupBy';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeScan';
import 'rxjs/add/operator/zip-static';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/combineLatest-static';

import { html as hJSX } from 'snabbdom-jsx';
import snabbdom from 'snabbdom';
import sdClass from 'snabbdom/modules/class';
import sdProps from 'snabbdom/modules/props';
import sdStyle from 'snabbdom/modules/style';
import sdAttributes from 'snabbdom/modules/attributes';
import sdEventlisteners from 'snabbdom/modules/eventlisteners';
const patch = snabbdom.init([ sdClass, sdProps, sdStyle, sdAttributes, sdEventlisteners ]);

import { Base } from './Base';
import { List } from './List';
import { Model } from './Model';
import { Event } from './Event';

export { hJSX, Base, List, Event, Model, reaxtor };

function reaxtor(RootClass, model, node, selector) {

    let reenter = false;
    let working = false;

    const models = new BehaviorSubject({ model });
    const previousOnChange = model._root.onChange;

    if (previousOnChange) {
        model._root.onChange = function() {
            if (working) { return reenter = true; }
            working = true;
            do {
                reenter = false;
                previousOnChange();
                models.next({ model, index: 0 });
            } while(reenter);
            working = false;
        };
    } else {
        model._root.onChange = function() {
            if (working) { return reenter = true; }
            working = true;
            do {
                reenter = false;
                models.next({ model, index: 0 });
            } while(reenter);
            working = false;
        };
    }

    return new RootClass({ models }).scan(selector, node);
}
