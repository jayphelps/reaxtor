/** @jsx hJSX */
import { hJSX, Base } from './../../../';
import { Observable } from 'rxjs/Observable';
const  { fromEvent } = Observable;

import { Tasks } from './Tasks';
import { Controls } from './Controls';
import { TaskInput } from './TaskInput';

export class App extends Base {
    create(models) {

        const tasks = new Tasks(models.deref('tasks'));
        const input = new TaskInput(models.deref('input'));
        const footer = new Controls(models.deref('tasks'));

        return models.switchMap((tuple) => Observable.combineLatest(
            input, tasks, footer, (...children) => [tuple, ...children]
        ));
    }
    loader([model]) {
        return model.get(
            `input.value`,
            `tasks.length`,
            `tasks.filter`
        );
    }
    events([model, state]) {
        return fromEvent(window, 'hashchange')//.startWith(0)
            .map(() => (location.hash || '#/').slice(2) || 'all')
            .filter((filter) => filter !== state.tasks.filter)
            .switchMap(
                (filter) => model.set({ json: { tasks: { filter }}}),
                (filter, { json }) => ({ ...state, ...json })
            )
            .map((newState) => [model, state = newState]);
    }
    render([[model, state], ...children]) {
        return (
            <section class={{ 'todoapp': true }}>{
                children.filter(x => !!x)
            }</section>
        );
    }
}
