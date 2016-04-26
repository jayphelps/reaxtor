import { Component } from './Component';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export class Container extends Component {
    initialize(models) {
        var subjects = [];
        var children = [];
        return models.switchMap((tuple) => {
            const active = this.deref(subjects, children, ...tuple);
            return (active.length === 0) ?
                Observable.of(tuple) :
                Observable.combineLatest(
                    children = active,
                    (...kids) => [...tuple, ...kids]
                );
        });
    }
    deref(subjects, children, _model, _state, range = {}) {

        const {
            from = 0,
            to = _state.length } = range;
        let index = -1;
        let count = to - from;

        while (++index <= count) {
            if (!subjects[index]) {
                subjects[index] = new BehaviorSubject();
                children[index] = this.createChild(
                    subjects[index], index, _state[index]
                );
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
            const state = _state[index + from];
            if (state && typeof state === 'object') {
                const model = _model.deref(state);
                subjects[index].next(model);
            }
        }

        return children;
    }
}
