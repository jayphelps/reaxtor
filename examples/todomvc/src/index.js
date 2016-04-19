/** @jsx hJSX */
import { reaxtor, hJSX, Model, Router } from './../../../';

import ASAPScheduler from 'falcor/lib/schedulers/ASAPScheduler';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/combineLatest';

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/mergeMapTo';
import 'rxjs/add/operator/debounceTime';

import snabbdom from 'snabbdom';
import sdClass from 'snabbdom/modules/class';
import sdProps from 'snabbdom/modules/props';
import sdStyle from 'snabbdom/modules/style';
import sdAttributes from 'snabbdom/modules/attributes';
import sdEventlisteners from 'snabbdom/modules/eventlisteners';

import { App } from './App';
import { Routes } from './Routes';

const patch = snabbdom.init([
    sdClass, sdProps, sdStyle,
    sdAttributes, sdEventlisteners
]);

const rootElement = document.body.appendChild(document.createElement('div'));

const modules = new BehaviorSubject({ App, Routes });

modules.switchMap(({ App, Routes }) => {

    // Read the cache from local storage if possible.
    let TodoCache = JSON.parse(localStorage.getItem('todos-reaxtor') || 'null');
    if (!TodoCache || !TodoCache.apiVersion || !TodoCache.apiVersion.value === 0) {
        TodoCache = null;
    }

    // Initialize the routes with the cache from local storage.
    const TodoRouter = Router.createClass(Routes(TodoCache || undefined));

    // Create root App Component (Observable)
    return reaxtor(App, new Model({
            materialized: true,
            treatErrorsAsValues: true,
            allowFromWhenceYouCame: true,
            scheduler: new ASAPScheduler(),
            source: new TodoRouter(),
            onChangesCompleted: function() {
                localStorage.setItem(
                    'todos-reaxtor', JSON.stringify(this.getCache())
                );
            }
        }));
    })
    .scan(patch, rootElement)
    .subscribe();

// If hot module replacement is enabled, listen for changes to App and Routes.
if (module.hot) {
    // We accept updates to the top component
    module.hot.accept([
        './App.js',
        './Controls.js',
        './Routes.js',
        './Task.js',
        './TaskInput.js',
        './Tasks.js'
    ], () => {
        // Dispatch the new modules to the modules Subject.
        modules.next({
            App: require('./App.js'),
            Controls: require('./Controls.js'),
            Routes: require('./Routes.js'),
            Task: require('./Task.js'),
            TaskInput: require('./TaskInput.js'),
            Tasks: require('./Tasks.js')
        });
    });
}
