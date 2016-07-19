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
    observe(models, depth) {

        const input = new TaskInput({
            models, path: 'input',
            index: 0, depth: depth + 1
        });
        const tasks = new Tasks({
            models, path: 'tasks',
            index: 1, depth: depth + 1
        });
        const footer = new Controls({
            models, path: 'tasks',
            index: 2, depth: depth + 1
        });

        return [input, tasks, footer];
    }
    render(state, ...children) {
        return (
            <section class={{ 'todoapp': true }}>{
                children.filter(x => !!x)
            }</section>
        );
    }
}
