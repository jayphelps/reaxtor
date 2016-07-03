/** @jsx hJSX */
import { hJSX, Component } from 'reaxtor';
import { Observable } from 'rxjs/Observable';

export class Task extends Component {
    loadProps(model) {
        return model.get(`['id', 'content', 'completed']`);
    }
    loadState(model, props) {
        return Observable.merge(

            this.listen('edit').mapTo({ editing: true }),

            this.listen('done')
                .map(({target}) => target.checked)
                .switchMap(
                    (completed) => model.call(['toggle'], [completed]),
                    (completed) => ({ completed, editing: false })
                ),

            Observable.merge(
                this.listen('blur'),
                this.listen('commit').filter((ev) => ev.keyIdentifier === 'Enter')
            )
            .map(({target}) => target.value)
            .switchMap(
                (content) => model.set({ json: { content }}),
                (content) => ({ content, editing: false })
            ),

            this.listen('destroy').switchMap(
                () => model.call([`remove`]),
                () => ({ id: '', content: '', completed: '' })
            )
        );
    }
    render(model, { id, content, completed, editing = false }) {
        return (
            <li class={{ editing, completed: (completed && !editing) }}>
                <div class={{'view': true}}>
                    <input class={{'toggle': true}}
                        type='checkbox'
                        checked={completed && !editing}
                        on-click={this.dispatch('done')} />
                    <label on-dblclick={this.dispatch('edit')}>{
                        content
                    }</label>
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
