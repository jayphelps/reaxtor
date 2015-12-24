/** @jsx hJSX */
import { hJSX, Base } from './../../../';
import { Observable } from 'rxjs/Observable';

export class Controls extends Base {
    loader({ model }) {
        return model.get(
            `length`,
            `where['completed=true'].length`,
            `where['completed=false'].length`
        );
    }
    events({ model, state }) {
        return this.listen('clear').switchMap(
            (ev) => model.call(['where', 'completed=true', 'remove']),
            (ev, data) => ({
                model, state: { ... state,
                where: { 'completed=true': { length: 0 }}}})
        ).startWith({ model, state });
    }
    render({ model, state: { length, where } }) {

        if (length === 0) {
            return;
        }

        const done = where['completed=true'].length;
        const open = where['completed=false'].length;
        const suffix = open === 1 ? 'item left' : 'items left';
        const children = [
            <span class={{'todo-count': true}}>
                <strong>{open}</strong> {suffix}
            </span>,
            <ul class={{'filters': true}}>
                <li>
                    <a class={{'selected': true}} href='#/'>All</a>
                </li>
                <li>
                    <a href='#/active'>Active</a>
                </li>
                <li>
                    <a href='#/completed'>Completed</a>
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
