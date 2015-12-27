/** @jsx hJSX */
import { reaxtor, hJSX, Model, onChange } from './../../../';

import FalcorRouter from 'falcor-router';
import ASAPScheduler from 'falcor/lib/schedulers/ASAPScheduler';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/multicast';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/mergeMapTo';
import 'rxjs/add/operator/merge-static';
import 'rxjs/add/operator/debounceTime';

import snabbdom from 'snabbdom';
import sdClass from 'snabbdom/modules/class';
import sdProps from 'snabbdom/modules/props';
import sdStyle from 'snabbdom/modules/style';
import sdAttributes from 'snabbdom/modules/attributes';
import sdEventlisteners from 'snabbdom/modules/eventlisteners';

import { App } from './App';
import { Routes } from './Routes';

reaxtor(App, new Model({
        materialized: true,
        treatErrorsAsValues: true,
        allowFromWhenceYouCame: true,
        scheduler: new ASAPScheduler(),
        source: new (FalcorRouter.createClass(Routes()))(),
        // cache: JSON.parse(localStorage.getItem('todos-reaxtor') || '{}'),
        // onChangesCompleted: function() {
        //     localStorage.setItem(
        //         'todos-reaxtor', JSON.stringify(this.getCache())
        //     );
        // },
    }),
    document.body.appendChild(document.createElement('div')),
    snabbdom.init([ sdClass, sdProps, sdStyle, sdAttributes, sdEventlisteners ])
).subscribe();

/*
store: function (namespace, data) {
    if (arguments.length > 1) {
        return localStorage.setItem(namespace, JSON.stringify(data));
    } else {
        var store = localStorage.getItem(namespace);
        return (store && JSON.parse(store)) || [];
    }
}
*/
