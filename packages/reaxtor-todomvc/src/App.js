import _filter from 'lodash.filter';

import { Observable } from 'rxjs';
import { Component } from 'reaxtor';

export class TaskInput extends Component {
    getEvents(model, state) {

        const entered = this
            .listen('keydown')
            .filter(({ target, keyIdentifier }) =>
                target.value && keyIdentifier === 'Enter');

        const addTaskOnEnter = entered.switchMap(
            ({ target }) => model.call(`add`, [ev.target.value]),
            ({ target }) => ({ value: '' })
        );

        const writeValueOnInput = this.listen('input')
            .debounceTime(250)
            .takeUntil(entered)
            .switchMap(({ target }) => model.set({ json: {
                value: target.value
            }}));

        return addTaskOnEnter.merge(writeValueOnInput);
    }
    render({ value }) {
        return (
            <header className='header'>
                <h1>todos</h1>
                <input
                    value={value}
                    autofocus='true'
                    className='new-todo'
                    placeholder='What needs to be done?'
                    on-input={function() { this.trigger('input') }}
                    on-keydown={function() { this.trigger('keydown') }} />
            </header>
        );
    }
}

export class Controls extends Component {
    getRemote(model) {
        return model.getItems(
            function getTasksPaths() {
                return [['length', 'filter']];
            },
            function getTaskPaths({ json: { length }}) {
                return length === 0 ? [] : [
                    [{length}, 'completed']
                ];
            }
        );
    }
    getEvents(model, props) {
        return this.listen('clear').switchMap(
            (ev) => model.call(`completed.remove`),
            (ev, { json }) => json);
    }
    render({ length = 0, filter }) {

        if (length === 0) {
            return;
        }

        const completed = _filter(state, ({ completed }) => completed).length;
        const todosLeft = length - completed;
        const itemsSuffix = todosLeft === 1 ? 'item left' : 'items left';

        const children = [
            <span class={{'todo-count': true}}>
                <strong>{todosLeft}</strong> {itemsSuffix}
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
        if (completed > 0) {
            children.push(
                <button class={{'clear-completed': true}} on-click={this.dispatch('clear')}>
                    Clear completed
                </button>
            );
        }
        return (
            <footer class={{'footer': true}}>
                {children}
            </footer>
        );
    }
}

export class TasksList extends Component {
    getRemote(model) {
        return model.getItems(
            function getTasksPaths() {
                return [['length', 'filter']];
            },
            function getTaskPaths({ json: { length }}) {
                return length === 0 ? [] : [
                    [{length}, 'completed']
                ];
            }
        );
    }
    item(data, key, index) {
        return <Task {...data} path={key} keys={['id', 'content', 'completed']}/>;
    }
    deref(subjects, children, depth, model, state, ids) {
        const { filter } = state;
        if (filter === 'completed') {
            state = _filter(state, ({completed}) => completed);
        } else if (filter === 'active') {
            state = _filter(state, ({completed}) => !completed);
        }
        state.filter = filter;
        return super.deref(subjects, children, depth, model, state, ids);
    }
    render(state, ...tasks) {

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
                <ul class={{'todo-list': true}}>
                    {tasks}
                </ul>
            );
        }

        return (
            <section class={{'main': true}}>{
                children
            }</section>
        );
    }
}

class Task extends Component {
    getEvents(model, state) {

        const startEditing = this.listen('edit').mapTo({ editing: true });
        const stopEditing  = this.listen('done')
            .map(({target}) => target.checked)
            .switchMap(
                (completed) => model.call(['toggle'], [completed]),
                (completed) => ({ completed, editing: false })
            );

        const blur = this.listen('blur');
        const entered = this.listen('commit').filter((ev) => ev.keyIdentifier === 'Enter');
        const writeValueOnExit = blur
            .merge(entered)
            .map(({target}) => target.value)
            .switchMap(
                (content) => model.set({ json: { content }}),
                (content) => ({ content, editing: false })
            );

        const removeTaskOnDestroy = this.listen('destroy').switchMap(
            () => model.call([`remove`]),
            () => ({ id: '', content: '', completed: '' })
        );

        return startEditing
            .merge(stopEditing)
            .merge(writeValueOnExit)
            .merge(removeTaskOnDestroy);
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
