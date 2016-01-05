/** @jsx hJSX */
import _filter from 'lodash.filter';
import { Task } from './Task';
import { hJSX, List } from './../../../';
import { Observable } from 'rxjs/Observable';
import { pathValue as $pv } from 'falcor-json-graph';

const loadTasks = List.listItemLoader(
    function lengthPath() { return `length`; },
    function resultPath({ json: { length }}) {
        return `['length', 'filter']`;
    },
    function suffixPath({ json: { length }}) {
        return `[0...${length}].completed`;
    }
);

export class Tasks extends List {
    loader(...args) {
        return loadTasks(...args);
    }
    deref(subjects, children, [ model, state ]) {
        const { filter } = state;

        if (filter === 'completed') {
            state = _filter(state, ({completed}) => completed);
        } else if (filter === 'active') {
            state = _filter(state, ({completed}) => !completed);
        }

        state.filter = filter;

        return super.deref(subjects, children, [model, state]);
    }
    createChild(childUpdates, childState, childIndex) {
        return new Task(childUpdates);
    }
    events([ model, state ]) {
        return this.listen('toggleAll')
            .map(({target}) => target.checked)
            .switchMap(
                (bool) => model.set(
                    $pv(`length`, state.length),
                    $pv(`[0...${state.length}].completed`, bool)
                ),
                (bool, { json }) => json
            )
            .map((newState) => [ model, state = newState ])
    }
    render([[ model, state ], ...taskVDoms]) {

        const children = [];
        const { length } = state;

        if (length > 0) {
            const completed = length === _filter(state, ({completed}) => completed).length;
            children.push(
                <input type='checkbox'
                    checked={completed}
                    class={{'toggle-all': true}}
                    on-click={this.dispatch('toggleAll')}/>
            );
            children.push(
                <label attrs={{'for': 'toggle-all'}}>Mark all as complete</label>
            );
            children.push(
                <ul class={{'todo-list': true}}>{
                    taskVDoms
                }</ul>
            );
        }

        return (
            <section class={{'main': true}}>{
                children
            }</section>
        );
    }
}
