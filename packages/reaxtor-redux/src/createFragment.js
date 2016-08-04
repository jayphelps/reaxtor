import { mergeFalcorNodes } from './utils';
import { Observable, ReplaySubject } from 'rxjs';

function getState(store) {
    return (!store || typeof store.getState !== 'function') ?
        store : store.getState();
}

export function createFragment(resolver, actionResolver, specifiedPath) {

    if (actionResolver) {
        const actionResolverType = typeof actionResolver;
        if (actionResolverType !== 'function') {
            if (!specifiedPath) {
                if (Array.isArray(actionResolver) || actionResolverType === 'string') {
                    specifiedPath = actionResolver;
                    actionResolver = undefined;
                }
            }
            if (actionResolverType === 'object') {
                actionResolver = (function(resolverTable) {
                    return function actionResolver(action) {
                        if (action && action.type in resolverTable) {
                            return resolverTable[action.type];
                        }
                    }
                }(actionResolver));
            }
        }
    }

    return function partialFragment(falcorModels, fallbackPath) {

        const boundPath = specifiedPath || fallbackPath;

        if (boundPath) {
            falcorModels = falcorModels.deref(boundPath);
        }

        falcorModels = falcorModels.distinctUntilChanged(
            (currKey, nextKey) => currKey === nextKey,
            ([model]) => model.$__key = model.inspect()
        );

        return function fragmentMiddleware(action$, store) {

            const arrayWrapper = new Array(3);

            const latestModelAndState = falcorModels.mergeMap(
                ([model, state]) => resolver(model, state),
                ([model, state], { json }) => {
                    arrayWrapper[0] = model;
                    // arrayWrapper[1] = mergeFalcorNodes(state, json);
                    arrayWrapper[1] = json;
                    arrayWrapper[2] = undefined;
                    return arrayWrapper;
                }
            );

            if (!actionResolver) {
                return latestModelAndState;
            }

            return latestModelAndState.multicast(
                () => new Subject(),
                (latestModelAndState) => Observable.merge(
                    latestModelAndState,
                    action$.withLatestFrom(latestModelAndState, (action, [model, state]) => {
                        arrayWrapper[0] = model;
                        arrayWrapper[1] = state;
                        arrayWrapper[2] = actionResolver(action);
                        return arrayWrapper;
                    })
                    .filter((arrayWrapper) => !!arrayWrapper[2])
                    .mergeMap(
                        ([model, state, resolver]) => resolver(model, state),
                        ([model, state], { json }) => {
                            arrayWrapper[0] = model;
                            // arrayWrapper[1] = mergeFalcorNodes(state, json);
                            arrayWrapper[1] = json;
                            arrayWrapper[2] = undefined;
                            return arrayWrapper;
                        }
                    )
                )
            );
        }
    }
}
