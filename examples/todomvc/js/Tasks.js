/** @jsx hJSX */
import { Task } from './Task';
import { hJSX, List } from './../../../';
import { Observable } from 'rxjs/Observable';
import { pathValue as $pv } from 'falcor-json-graph';

export class Tasks extends List {
    loader({ model }) {
        return model
            .get(`length`, `view.length`, `where['completed=true'].length`)
            .mergeMap((... args) => {
                const { json: { view: { length }}} = args[0];
                if (length === 0) {
                    return Observable.of(args[0]);
                }
                return model.get(
                    `length`, `view.length`,
                    `where['completed=true'].length`,
                    `view[0...${length}]['id', 'content', 'completed']`
                );
            });
    }
    deref(subjects, children, props) {
        return super.deref(subjects, children, {
            model: props.model,
            state: props.state.view
        });
    }
    children(updates) {
        return new Task(updates);
    }
    events([{ model, state }, ... items]) {
        const { view, where, length } = state;
        return this.listen('toggleAll')
            .map(({target}) => target.checked)
            .switchMap((bool) => {
                    const invObs = model.invalidate2(`where`);
                    const setObs = model.set($pv(`view[0...${view.length}].completed`, bool));
                    return setObs.merge(invObs);
                }, (bool) => [{ model, state: { ... state, view: {
                    length: bool ? length : 0 }}
                }, ... items]
            )
            .startWith([{ model, state }, ... items]);
    }
    render([{ state: { view, where, length }}, ... items]) {

        if (length === 0) {
            return;
        }

        const done = where['completed=true'].length;
        const completed = done >= length;

        return (
            <section class={{'main': true}}>
                <input type='checkbox'
                    checked={completed}
                    class={{'toggle-all': true}}
                    on-click={this.dispatch('toggleAll')}/>
                <label attrs={{'for': 'toggle-all'}}>Mark all as complete</label>
                <ul class={{'todo-list': true}}>{
                    items
                }</ul>
            </section>
        );
    }
}
