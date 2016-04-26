/** @jsx hJSX */
import _filter from 'lodash.filter';
import { Task } from './Task';
import { hJSX, Container } from './../../../';
import { Observable } from 'rxjs/Observable';
import { pathValue as $pv } from 'falcor-json-graph';

export class Tasks extends Container {
    deref(subjects, children, model, state, range) {
        const { filter } = state;

        if (filter === 'completed') {
            state = _filter(state, ({completed}) => completed);
        } else if (filter === 'active') {
            state = _filter(state, ({completed}) => !completed);
        }

        state.filter = filter;

        return super.deref(subjects, children, model, state, range);
    }
    createChild(models, index, state) {
        return new Task({ index, models, ...state });
    }
    loadProps(model) {
        return model.getItems(
            function getTasksPaths() {
                return [['length']];
            },
            function getTaskPaths({ json: { length }}) {
                return length === 0 ?
                    [['filter']] :
                    [['filter'], [{length}, 'completed']];
            }
        );
    }
    loadState(model, props) {
        return this
            .listen('toggleAll')
            .map(({ target: { checked }}) => checked)
            .switchMap(
                (bool) => model.set(
                    $pv(`length`, props.length),
                    $pv(`[0...${props.length}].completed`, bool)
                ),
                (bool, { json }) => json);
    }
    render(model, state, ...taskVDoms) {

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
