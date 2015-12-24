/** @jsx hJSX */
import { Observable } from 'rxjs/Observable';
import { hJSX, Base } from './../../../';
import { Tasks } from './Tasks';
import { TaskInput } from './TaskInput';
import { Controls } from './Controls';

export class App extends Base {
    create(models) {

        const tasks = new Tasks(models.deref('tasks'));
        const input = new TaskInput(models.deref('tasks'));
        const footer = new Controls(models.deref('tasks'));

        return models.switchMap((props) => Observable.combineLatest(
            input, tasks, footer, (... args) => [props, ... args]
        ));
    }
    loader({ model }) {
        return model.get(
            `tasks.length`,
            `tasks.view.length`,
            `tasks.where['completed=true'].length`
        );
    }
    render([{ model, state }, ...children]) {
        return (
            <section class={{ 'todoapp': true }}>{
                children.filter(x => !!x)
            }</section>
        );
    }
}
