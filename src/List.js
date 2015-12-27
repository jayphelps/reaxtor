import { Base } from './Base';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

export class List extends Base {
    create(models) {
        var subjects = [];
        var children = [];
        return models.switchMap((tuple) => {
            const kids = this.deref(subjects, children, tuple);
            if (kids.length === 0) {
                return Observable.of([tuple]);
            }
            return Observable.combineLatest(
                children = kids, (...args) => [tuple, ...args]
            );
        });
    }
    deref(subjects, children, [ _model, _state ]) {

        let index = -1;
        let count = _state.length;

        while (++index < count) {
            if (!subjects[index]) {
                subjects[index] = new Subject();
                children[index] = this.createChild(subjects[index], index);
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
            subjects[index].next([model, state, index]);
        }

        return children;
    }
}
