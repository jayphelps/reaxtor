/** @jsx hJSX */
import _filter from 'lodash.filter';
import { hJSX, Base, List } from './../../../';
import { Observable } from 'rxjs/Observable';
import { ref as $ref } from 'falcor-json-graph';
const  { fromEvent } = Observable;

const loadTasks = List.listItemLoader(
    function lengthPath() { return `length`; },
    function resultPath({ json: { length }}) {
        return `['length', 'filter']`;
    },
    function suffixPath({ json: { length }}) {
        return `[0...${length}].completed`;
    }
);

export class Controls extends Base {
    loader(...args) {
        return loadTasks(...args);
    }
    events([ model, state ]) {
        return this.listen('clear').switchMap(
            (ev) => model.call(`completed.remove`),
            (ev, { json }) => ({ ...state, ...json })
        )
        .map((newState) => [model, state = newState])
    }
    render([ model, state ]) {

        const { length } = state;

        if (length === 0) {
            return;
        }

        const { filter } = state;
        const done = _filter(state, ({completed}) => completed).length;
        const open = length - done;
        const suffix = open === 1 ? 'item left' : 'items left';

        const children = [
            <span class={{'todo-count': true}}>
                <strong>{open}</strong> {suffix}
            </span>,
            <ul class={{'filters': true}}>
                <li>
                    <a class-selected={filter === 'all'} href='#/'>All</a>
                </li>
                <li>
                    <a class-selected={filter === 'active'} href='#/active'>Active</a>
                </li>
                <li>
                    <a class-selected={filter === 'completed'} href='#/completed'>Completed</a>
                </li>
            </ul>
        ];
        if (done > 0) {
            children.push(
                <button class={{'clear-completed': true}}
                    on-click={this.dispatch('clear')}>
                        Clear completed
                </button>
            );
        }
        return (
            <footer class={{'footer': true}}>{
                children
            }</footer>
        );
    }
}