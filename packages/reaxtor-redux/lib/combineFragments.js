'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.combineFragments = combineFragments;

var _utils = require('./utils');

var _rxjs = require('rxjs');

function combineFragments(pendingContainer, resolveFragments) {
    if (resolveFragments && (typeof resolveFragments === 'undefined' ? 'undefined' : _typeof(resolveFragments)) === 'object') {
        resolveFragments = function (fragmentsTable) {
            return function (state, key, value) {
                return fragmentsTable[key];
            };
        }(resolveFragments);
    }
    return function partialCombinedFragment(falcorModels, fallbackPath) {
        var container = pendingContainer(falcorModels, fallbackPath);
        return function combinedFragment(action$, store) {
            var arrayWrapper = new Array(2);
            // Todo: Write a `differenceMap` merge strategy instead of
            // switchMap + combineLatest-ing to Subjects
            var groupIntoFragments = groupFragments(action$, resolveFragments);
            return container(action$, store).switchMap(groupIntoFragments, function (_ref, newState) {
                var _ref2 = _slicedToArray(_ref, 2);

                var model = _ref2[0];
                var state = _ref2[1];

                arrayWrapper[0] = model;
                arrayWrapper[1] = newState;
                return arrayWrapper;
            });
        };
    };
}

function groupFragments(action$, resolveFragments) {
    var epics = [];
    var fragments = {};
    var fragmentModels = {};
    return function groupIntoFragments(_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2);

        var model = _ref4[0];
        var state = _ref4[1];


        var index = 0,
            fragment = void 0,
            fragmentModel = void 0;

        for (var fragmentKey in state) {

            var fragmentValue = state[fragmentKey];

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
                fragmentModel = new _rxjs.BehaviorSubject();
                fragmentModels[fragmentKey] = fragmentModel;
                fragment = fragments[fragmentKey] = {
                    key: fragmentKey,
                    epic: fragment(_utils.Models.from(fragmentModel), fragmentKey)(action$, fragmentValue)
                };
            }

            epics[index++] = fragment;
            fragmentModel.next([model, state]);
        }

        while (epics.length > index) {
            var _epics$pop = epics.pop();

            var key = _epics$pop.key;

            var _fragmentModel = fragmentModels[key];
            delete fragments[key];
            delete fragmentModels[key];
            _fragmentModel.complete();
        }

        if (epics.length === 0) {
            return _rxjs.Observable.of(state);
        }

        return _rxjs.Observable.combineLatest(epics.map(function (_ref5) {
            var epic = _ref5.epic;
            var key = _ref5.key;

            return epic.map(function (_ref6) {
                var _ref7 = _slicedToArray(_ref6, 2);

                var model = _ref7[0];
                var newState = _ref7[1];

                state[key] = newState;
                return state;
            });
        }), function (state) {
            return state;
        });

        // Todo: shouldn't this work instead?
        // return Observable.from(epics).mergeScan((state, { epic, key }) => {
        //     return epic.map(([model, newState]) => {
        //         state[key] = newState;
        //         return state;
        //     })
        // }, state);
    };
}
//# sourceMappingURL=combineFragments.js.map