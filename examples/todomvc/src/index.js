/** @jsx hJSX */
import { Scheduler, BehaviorSubject } from 'rxjs';
import { reaxtor, hJSX, Model, Router } from 'reaxtor';

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
    if (!TodoCache || TodoCache.apiVersion !== 0) {
        TodoCache = null;
    }

    // Initialize the routes with the cache from local storage.
    const TodoRouter = Router.createClass(Routes(TodoCache || undefined));

    // Create root App Component (Observable)
    return reaxtor(App, new Model({
            materialized: true,
            treatErrorsAsValues: true,
            allowFromWhenceYouCame: true,
            source: new TodoRouter(),
            scheduler: Scheduler.asap,
            onChangesCompleted: function() {
                localStorage.setItem(
                    'todos-reaxtor', JSON.stringify(this.getCache())
                );
            }
        }));
    })
    .scan((currentRootDom, [rootModel, newRootVDom]) => {
        return patch(currentRootDom, newRootVDom);
    }, rootElement)
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
            App: require('./App.js').App,
            Controls: require('./Controls.js').Controls,
            Routes: require('./Routes.js').Routes,
            Task: require('./Task.js').Task,
            TaskInput: require('./TaskInput.js').TaskInput,
            Tasks: require('./Tasks.js').Tasks
        });
    });
}
