/** @jsx hJSX */
import { hJSX, Base } from './../../../';
import { Observable } from 'rxjs/Observable';
import { pathValue as $pv } from 'falcor-json-graph';

export class Task extends Base {
    loader([ model ]) {
        return model.get(`['id', 'content', 'completed']`);
    }
    events([ model, state ]) {
        return Observable.merge(

            this.listen('edit').map(() => ({ ...state, ...{ editing: true }})),
            this.listen('blur').map(() => ({ ...state, ...{ editing: false}})),

            this.listen('done')
                .map(({target}) => target.checked)
                .switchMap(
                    (completed) => model.call(['toggle'], [completed]),
                    (completed) => ({ ...state, ...{ completed, editing: false }})
                ),

            this.listen('commit')
                .filter((ev) => ev.keyIdentifier === 'Enter')
                .map(({target}) => target.value)
                .switchMap(
                    (content) => model.set({ json: { content }}),
                    (content) => ({ ...state, ...{ content, editing: false }})
                ),

            this.listen('destroy').switchMap(
                () => model.call([`remove`]),
                (ev) => ({ id: '', content: '', completed: '' })
            )
        )
        .map((newState) => [model, state = newState])
    }
    render([ model, { id, content, completed, editing = false } ]) {
        return (
            <li class={{ editing, completed: (completed && !editing) }}>
                <div class={{'view': true}}>
                    <input class={{'toggle': true}}
                        type='checkbox'
                        checked={completed && !editing}
                        compKey={this.key + 'toggle'}
                        on-click={this.dispatch('done')} />
                    <label compKey={this.key + 'toggle'}
                        on-dblclick={this.dispatch('edit')}>{
                            content
                    }</label>
                    <button class={{'destroy': true}}
                        compKey={this.key + 'toggle'}
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
