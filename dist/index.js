'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.reaxtor = exports.falcor = exports.Container = exports.Component = exports.Router = exports.Event = exports.Model = exports.hJSX = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /** @jsx hJSX */

var _debug2 = require('debug');

var _debug3 = _interopRequireDefault(_debug2);

var _falcor = require('falcor');

var _falcor2 = _interopRequireDefault(_falcor);

var _falcorRouter = require('falcor-router');

var _falcorRouter2 = _interopRequireDefault(_falcorRouter);

var _Model = require('./Model');

var _Event = require('./Event');

var _rxjs = require('rxjs');

var _Component = require('./Component');

var _Container = require('./Container');

var _snabbdomJsx = require('snabbdom-jsx');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.hJSX = _snabbdomJsx.html;
exports.Model = _Model.Model;
exports.Event = _Event.Event;
exports.Router = _falcorRouter2.default;
exports.Component = _Component.Component;
exports.Container = _Container.Container;
exports.falcor = _falcor2.default;
exports.reaxtor = reaxtor;


function reaxtor(RootClass, model) {
    var props = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];


    var working = false;
    var reenter = false;
    var debugEnd = (0, _debug3.default)('reaxtor:lifecycle');
    var debugStart = (0, _debug3.default)('reaxtor:lifecycle');
    var _model = model;
    var _root = _model._root;

    var array = new Array(2);
    var models = new _rxjs.BehaviorSubject(model);
    var previousOnChangesCompleted = _root.onChangesCompleted;

    _root.onChangesCompleted = function () {
        if (working) {
            return reenter = true;
        }
        working = true;
        do {
            reenter = false;

            var topLevelModelVersion = (model = this).getVersion();

            debugStart.color = debugEnd.color = _debug3.default.colors[(topLevelModelVersion + _debug3.default.colors.length) % _debug3.default.colors.length];

            debugStart('    start | v' + topLevelModelVersion);

            if (previousOnChangesCompleted) {
                previousOnChangesCompleted.call(this);
            }

            models.next(model);
        } while (reenter === true);
    };

    _root.onChangesCompleted.call(_root.topLevelModel);

    return new RootClass(_extends({}, props, { models: models })).map(function (rootVDom) {
        debugEnd('      end | v' + model.getVersion());
        working = false;
        array[0] = model;
        array[1] = rootVDom;
        return array;
    });
}
//# sourceMappingURL=index.js.map