import { Base } from './Base';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

export class List extends Base {
    create(models) {
        var subjects = [];
        var children = [];
        return models.switchMap((props) => {
            const kids = this.deref(subjects, children, props);
            if (kids.length === 0) {
                return Observable.of([props]);
            }
            return Observable.combineLatest(
                children = kids,
                (... args) => [props, ... args]
            );
        });
    }
    deref(subjects, children, props) {

        const _model = props.model;
        const _state = props.state;
        let index = -1;
        let count = _state.length;

        if (count <= 0) {
            return [];
        }

        while (++index < count) {
            if (!subjects[index]) {
                subjects[index] = new Subject();
                children[index] = this.children(subjects[index]);
            }
        }

        index = count - 1;
        children.length = count;
        count = subjects.length;
        while (++index < count) {
            subjects[index].complete();
        }

        index = -1;
        count = subjects.length = children.length;
        while (++index < count) {
            const state = _state[index];
            const model = _model.deref(state);
            subjects[index].next({ index, model, state });
        }

        return children;
    }
}
