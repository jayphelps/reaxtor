/** @jsx hJSX */
import { hJSX, Base } from './../../../';
import { Observable } from 'rxjs/Observable';
import { pathValue as $pv } from 'falcor-json-graph';

export class Task extends Base {
    loader({ model }) {
        return model.get(`['id', 'content', 'completed']`);
    }
    events({ model, state }) {
        return Observable.merge(

            this.listen('blur').map(() => ({ model, state: {
                ... state, ... { editing: false }
            }})),

            this.listen('edit').map(() => ({ model, state: {
                ... state, ... { editing: true }
            }})),

            this.listen('done')
                .map(({target}) => target.checked)
                .switchMap(
                    (completed) => model.call(['toggle'], [completed]),
                    (completed) => {
                        state.completed = completed;
                        return { model, state };
                    }
                ),

            this.listen('commit')
                .filter((ev) => ev.keyIdentifier === 'Enter')
                .map(({target}) => target.value)
                .switchMap(
                    (content) => model.set({json: {content}}),
                    (content) => {
                        state.content = content;
                        return { model, state };
                    }
                ),

            this.listen('destroy').switchMap(
                () => model.call([`remove`]),
                (ev, data) => ({ model, state }))
        )
        .startWith({ model, state });
    }
    render({ model, state: { id, content, completed, editing = false }}) {
        return (
            <li key={id}
                class={{ editing, completed: (completed && !editing) }}>
                <div class={{'view': true}}>
                    <input class={{'toggle': true}}
                        type='checkbox'
                        checked={completed && !editing}
                        on-click={this.dispatch('done')} />
                    <label on-dblclick={this.dispatch('edit')}>{ content }</label>
                    <button class={{'destroy': true}}
                        on-click={this.dispatch('destroy')}></button>
                </div>
                <input class={{'edit': true}}
                    value={content}
                    on-blur={this.dispatch('blur')}
                    on-keydown={this.dispatch('commit')}
                    hook={{ postpatch(old, { elm }) {
                        if (editing) {
                            elm.focus();
                        }
                    }}}/>
            </li>
        );
    }
}
