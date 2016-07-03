/** @jsx hJSX */
import { hJSX, Component } from 'reaxtor';
import { Observable } from 'rxjs';
const  { fromEvent } = Observable;

import { Tasks } from './Tasks';
import { Controls } from './Controls';
import { TaskInput } from './TaskInput';

// require('./app.css');

export class App extends Component {
    loadProps(model) {
        return model.get(
            `input.value`,
            `tasks.length`,
            `tasks.filter`,
            `['apiVersion', 'globalTaskId']`
        );
    }
    loadState(model, props) {
        return fromEvent(window, 'hashchange')
            .map(() => (location.hash || '#/').slice(2) || 'all')
            .filter((filter) => filter !== props.tasks.filter)
            .switchMap(
                (filter) => model.set({
                    json: { tasks: { filter
                }}}),
                (filter, { json }) => json);
    }
    initialize(models, depth) {

        const input = new TaskInput({
            index: 0, depth: depth + 1,
            models: models.deref(`input`)
        });
        const tasks = new Tasks({
            index: 1, depth: depth + 1,
            models: models.deref(`tasks`)
        });
        const footer = new Controls({
            index: 2, depth: depth + 1,
            models: models.deref(`tasks`)
        });

        return models.switchMap((tuple) => Observable.combineLatest(
            input, tasks, footer, (...children) => [...tuple, ...children]
        ));
    }
    render(model, state, ...children) {
        return (
            <section class={{ 'todoapp': true }}>{
                children.filter(x => !!x)
            }</section>
        );
    }
}
