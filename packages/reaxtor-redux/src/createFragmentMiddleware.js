import { Models } from './utils';
import { Model } from 'reaxtor-falcor';
import { BehaviorSubject } from 'rxjs';
import { createEpicMiddleware } from 'redux-observable';

export function createFragmentMiddleware(rootModel, rootFragment) {

    let working = false;
    let reenter = false;

    const rootState = {};
    const arrayWrapper = new Array(2);
    const { _root } = rootModel;
    const { onChangesCompleted } = _root;
    const changes = new BehaviorSubject(arrayWrapper);

    arrayWrapper[0] = rootModel;
    arrayWrapper[1] = rootState;

    _root.onChangesCompleted = function() {
        if (working) { return reenter = true; }
        working = true;
        do {
            reenter = false;
            if (onChangesCompleted) {
                onChangesCompleted.call(this);
            }
            arrayWrapper[0] = this;
            arrayWrapper[1] = rootState;
            rootModel.derefCount++;
            changes.next(arrayWrapper);
        } while(false && reenter === true);
    }

    rootFragment = rootFragment(Models.from(changes));

    return createEpicMiddleware(function(action$, store) {
        return rootFragment(action$, store)
            .do(() => working = false)
            .map(([model, state]) => ({
                data: state, type: 'falcor'
            }));
    });
}

