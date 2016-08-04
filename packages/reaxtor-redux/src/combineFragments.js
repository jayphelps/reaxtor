import { Models } from './utils';
import { Observable, BehaviorSubject } from 'rxjs';

export function combineFragments(pendingContainer, resolveFragments) {
    if (resolveFragments && typeof resolveFragments === 'object') {
        resolveFragments = (function(fragmentsTable) {
            return function(state, key, value) {
                return fragmentsTable[key];
            }
        }(resolveFragments));
    }
    return function partialCombinedFragment(falcorModels, fallbackPath) {
        const container = pendingContainer(falcorModels, fallbackPath);
        return function combinedFragment(action$, store) {
            const arrayWrapper = new Array(2);
            // Todo: Write a `differenceMap` merge strategy instead of
            // switchMap + combineLatest-ing to Subjects
            const groupIntoFragments = groupFragments(action$, resolveFragments);
            return container(action$, store).switchMap(
                groupIntoFragments,
                ([model, state], newState) => {
                    arrayWrapper[0] = model;
                    arrayWrapper[1] = newState;
                    return arrayWrapper;
                }
            );
        }
    }
}

function groupFragments(action$, resolveFragments) {
    const epics = [];
    const fragments = {};
    const fragmentModels = {};
    return function groupIntoFragments([model, state]) {

        let index = 0, fragment, fragmentModel;

        for (const fragmentKey in state) {

            const fragmentValue = state[fragmentKey];

            if ((fragment = fragments[fragmentKey]) === undefined) {
                fragment = resolveFragments(state, fragmentKey, fragmentValue);
                if (typeof fragment !== 'function') {
                    fragment = fragments[fragmentKey] = false;
                }
            }

            if (fragment === false) {
                continue;
            }

            if (!(fragmentModel = fragmentModels[fragmentKey])) {
                fragmentModel = new BehaviorSubject();
                fragmentModels[fragmentKey] = fragmentModel;
                fragment = fragments[fragmentKey] = {
                    key: fragmentKey,
                    epic: fragment(
                        Models.from(fragmentModel),
                        fragmentKey
                    )(action$, fragmentValue)
                };
            }

            epics[index++] = fragment;
            fragmentModel.next([model, state]);
        }

        while (epics.length > index) {
            const { key } = epics.pop();
            const fragmentModel = fragmentModels[key];
            delete fragments[key];
            delete fragmentModels[key];
            fragmentModel.complete();
        }

        if (epics.length === 0) {
            return Observable.of(state);
        }

        return Observable.combineLatest(epics.map(({ epic, key }) => {
            return epic.map(([model, newState]) => {
                state[key] = newState;
                return state;
            });
        }), (state) => state);

        // Todo: shouldn't this work instead?
        // return Observable.from(epics).mergeScan((state, { epic, key }) => {
        //     return epic.map(([model, newState]) => {
        //         state[key] = newState;
        //         return state;
        //     })
        // }, state);
    }
}
