import { Component } from './Component';
import { Observable, BehaviorSubject } from 'rxjs';

export class Container extends Component {
    initialize(models, depth) {
        var subjects = [];
        var children = [];
        return models.switchMap((tuple) => {
            const active = this.deref(subjects, children, depth, ...tuple);
            return (active.length === 0) ?
                Observable.of(tuple) :
                Observable.combineLatest(
                    children = active,
                    (...kids) => [...tuple, ...kids]
                );
        });
    }
    deref(subjects, children, depth, _model, _state, ids = _state) {

        const isRange = !Array.isArray(ids) && (
            ('from' in ids) || ('to' in ids)
        );
        const offset = isRange ? ids.from || 0 : 0;
        const to = isRange ? ids.to || (ids.length + 1) : ids.length || offset;

        let index = -1;
        let count = to - offset;

        while (++index <= count) {
            const key = isRange || index > to ?
                index + offset : ids !== _state && ids[index] || index;
            if (!subjects[index]) {
                subjects[index] = new BehaviorSubject();
                children[index] = this.createChild({
                    index, depth: depth + 1,
                    models: subjects[index],
                    ... _state[key]
                });
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
            const key = isRange || index > to ?
                index + offset : ids !== _state && ids[index] || index;
            const state = _state[key];
            if (state && typeof state === 'object') {
                const model = _model.deref(state);
                subjects[index].next(model);
            }
        }

        return children;
    }
}
