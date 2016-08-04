'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.createFragmentMiddleware = createFragmentMiddleware;

var _utils = require('./utils');

var _reaxtorFalcor = require('reaxtor-falcor');

var _rxjs = require('rxjs');

var _reduxObservable = require('redux-observable');

function createFragmentMiddleware(rootModel, rootFragment) {

    var working = false;
    var reenter = false;

    var rootState = {};
    var arrayWrapper = new Array(2);
    var _root = rootModel._root;
    var onChangesCompleted = _root.onChangesCompleted;

    var changes = new _rxjs.BehaviorSubject(arrayWrapper);

    arrayWrapper[0] = rootModel;
    arrayWrapper[1] = rootState;

    _root.onChangesCompleted = function () {
        if (working) {
            return reenter = true;
        }
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
        } while (false && reenter === true);
    };

    rootFragment = rootFragment(_utils.Models.from(changes));

    return (0, _reduxObservable.createEpicMiddleware)(function (action$, store) {
        return rootFragment(action$, store).do(function () {
            return working = false;
        }).map(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2);

            var model = _ref2[0];
            var state = _ref2[1];
            return {
                data: state, type: 'falcor'
            };
        });
    });
}
//# sourceMappingURL=createFragmentMiddleware.js.map