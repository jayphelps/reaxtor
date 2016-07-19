/** @jsx hJSX */
import { Observable } from 'rxjs';
import { hJSX, Component } from 'reaxtor';

export class TaskInput extends Component {
    loadProps(model) {
        return model.get(`value`);
    }
    loadState(model, props) {

        const entered = this
            .listen('keydown')
            .filter(({ target, keyIdentifier }) =>
                target.value && keyIdentifier === 'Enter');

        return Observable.merge(
            this.listen('input')
                .debounceTime(250)
                .takeUntil(entered)
                .map(({ target }) => target),
            entered.switchMap(
                (ev) => model.call(`add`, [ev.target.value]),
                (ev) => ({ value: ev.target.value = '' }))
        );
    }
    render({ value }) {
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
                    on-input={this.dispatch('input')}
                    on-keydown={this.dispatch('keydown')} />
            </header>
        );
    }
}
