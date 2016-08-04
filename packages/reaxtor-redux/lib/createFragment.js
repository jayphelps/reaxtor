'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.createFragment = createFragment;

var _utils = require('./utils');

var _rxjs = require('rxjs');

function getState(store) {
    return !store || typeof store.getState !== 'function' ? store : store.getState();
}

function createFragment(resolver, actionResolver, specifiedPath) {

    if (actionResolver) {
        var actionResolverType = typeof actionResolver === 'undefined' ? 'undefined' : _typeof(actionResolver);
        if (actionResolverType !== 'function') {
            if (!specifiedPath) {
                if (Array.isArray(actionResolver) || actionResolverType === 'string') {
                    specifiedPath = actionResolver;
                    actionResolver = undefined;
                }
            }
            if (actionResolverType === 'object') {
                actionResolver = function (resolverTable) {
                    return function actionResolver(action) {
                        if (action && action.type in resolverTable) {
                            return resolverTable[action.type];
                        }
                    };
                }(actionResolver);
            }
        }
    }

    return function partialFragment(falcorModels, fallbackPath) {

        var boundPath = specifiedPath || fallbackPath;

        if (boundPath) {
            falcorModels = falcorModels.deref(boundPath);
        }

        falcorModels = falcorModels.distinctUntilChanged(function (currKey, nextKey) {
            return currKey === nextKey;
        }, function (_ref) {
            var _ref2 = _slicedToArray(_ref, 1);

            var model = _ref2[0];
            return model.$__key = model.inspect();
        });

        return function fragmentMiddleware(action$, store) {

            var arrayWrapper = new Array(3);

            var latestModelAndState = falcorModels.mergeMap(function (_ref3) {
                var _ref4 = _slicedToArray(_ref3, 2);

                var model = _ref4[0];
                var state = _ref4[1];
                return resolver(model, state);
            }, function (_ref5, _ref6) {
                var _ref7 = _slicedToArray(_ref5, 2);

                var model = _ref7[0];
                var state = _ref7[1];
                var json = _ref6.json;

                arrayWrapper[0] = model;
                // arrayWrapper[1] = mergeFalcorNodes(state, json);
                arrayWrapper[1] = json;
                arrayWrapper[2] = undefined;
                return arrayWrapper;
            });

            if (!actionResolver) {
                return latestModelAndState;
            }

            return latestModelAndState.multicast(function () {
                return new Subject();
            }, function (latestModelAndState) {
                return _rxjs.Observable.merge(latestModelAndState, action$.withLatestFrom(latestModelAndState, function (action, _ref8) {
                    var _ref9 = _slicedToArray(_ref8, 2);

                    var model = _ref9[0];
                    var state = _ref9[1];

                    arrayWrapper[0] = model;
                    arrayWrapper[1] = state;
                    arrayWrapper[2] = actionResolver(action);
                    return arrayWrapper;
                }).filter(function (arrayWrapper) {
                    return !!arrayWrapper[2];
                }).mergeMap(function (_ref10) {
                    var _ref11 = _slicedToArray(_ref10, 3);

                    var model = _ref11[0];
                    var state = _ref11[1];
                    var resolver = _ref11[2];
                    return resolver(model, state);
                }, function (_ref12, _ref13) {
                    var _ref14 = _slicedToArray(_ref12, 2);

                    var model = _ref14[0];
                    var state = _ref14[1];
                    var json = _ref13.json;

                    arrayWrapper[0] = model;
                    // arrayWrapper[1] = mergeFalcorNodes(state, json);
                    arrayWrapper[1] = json;
                    arrayWrapper[2] = undefined;
                    return arrayWrapper;
                }));
            });
        };
    };
}
//# sourceMappingURL=createFragment.js.map