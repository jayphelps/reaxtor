/** @jsx hJSX */
import { hJSX, Base } from './../../../';
import { Observable } from 'rxjs/Observable';

export class TaskInput extends Base {
    events({ model, state }) {
        return this
            .listen('keydown')
            .filter(({ target, keyIdentifier }) =>
                target.value && keyIdentifier === 'Enter')
            .switchMap(
                ({target: {value}}) => model.call(['add'], [value]),
                (ev, data) => ({ model, state: { ... state, ... { value: ev.target.value = '' }}})
            )
            .startWith({ model, state });
    }
    render({ model, state: { value = '' }}) {
        return (
            <header class={{'header': true}}>
                <h1>todos</h1>
                <input
                    class={{'new-todo': true}}
                    value={value}
                    attrs={{
                        autofocus: true,
                        placeholder: 'What needs to be done?'
                    }}
                    on-keydown={this.dispatch('keydown')} />
            </header>
        );
    }
}
