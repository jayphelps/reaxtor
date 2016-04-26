/** @jsx hJSX */

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

Subscriber.prototype.onNext = Subscriber.prototype.next;
Subscriber.prototype.onError = Subscriber.prototype.error;
Subscriber.prototype.onCompleted = Subscriber.prototype.complete;
Subscriber.prototype.dispose = Subscriber.prototype.unsubscribe;

Subject.prototype.onNext = Subject.prototype.next;
Subject.prototype.onError = Subject.prototype.error;
Subject.prototype.onCompleted = Subject.prototype.complete;
Subject.prototype.dispose = Subject.prototype.unsubscribe;

Subscription.prototype.dispose = Subscription.prototype.unsubscribe;

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/combineLatest';

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/distinctUntilChanged';

import falcor from 'falcor';
import Router from 'falcor-router';
import { Model } from './Model';
import { Event } from './Event';
import { Component } from './Component';
import { Container } from './Container';
import { html as hJSX } from 'snabbdom-jsx';

export { hJSX, Model, Event, Router, Component, Container, falcor, reaxtor };

function reaxtor(RootClass, model) {

    var working = false;
    var reenter = false;
    const array = new Array(2);
    const models = new BehaviorSubject(model);
    const previousOnChangesCompleted = model._root.onChangesCompleted;

    model._root.onChangesCompleted = function() {
        if (working) { return reenter = true; }
        working = true;
        do {
            reenter = false;
            // console.log('\nstart top-down render ----> [');
            if (previousOnChangesCompleted) {
                previousOnChangesCompleted.call(this);
            }
            models.next(model = this);
            // console.log('] <---- end top-down render\n');
        } while(reenter === true);
    };

    return new RootClass({ models }).map((rootVDom) => {
        working = false;
        array[0] = model;
        array[1] = rootVDom;
        return array;
    });
}
