/** @jsx hJSX */
import { hJSX, Component } from 'reaxtor';
import { Observable } from 'rxjs/Observable';
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
    initialize(models) {

        const tasks = new Tasks({
            index: 0,
            models: models.deref(`tasks`)
        });
        const input = new TaskInput({
            index: 1,
            models: models.deref(`input`)
        });
        const footer = new Controls({
            index: 2,
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
