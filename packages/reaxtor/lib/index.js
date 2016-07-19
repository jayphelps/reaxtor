'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.reaxtor = exports.Router = exports.falcor = undefined;

var _Event = require('./Event');

Object.keys(_Event).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function get() {
            return _Event[key];
        }
    });
});

var _Model = require('./Model');

Object.keys(_Model).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function get() {
            return _Model[key];
        }
    });
});

var _Component = require('./Component');

Object.keys(_Component).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function get() {
            return _Component[key];
        }
    });
});

var _debug2 = require('debug');

var _debug3 = _interopRequireDefault(_debug2);

var _falcor = require('falcor');

var _falcor2 = _interopRequireDefault(_falcor);

var _falcorRouter = require('falcor-router');

var _falcorRouter2 = _interopRequireDefault(_falcorRouter);

var _rxjs = require('rxjs');

require('rxjs/add/operator/map');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.falcor = _falcor2.default;
exports.Router = _falcorRouter2.default;
exports.reaxtor = reaxtor;


function reaxtor(component, model) {
    var props = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];


    var working = false;
    var reenter = false;
    var debugEnd = (0, _debug3.default)('reaxtor:lifecycle');
    var debugStart = (0, _debug3.default)('reaxtor:lifecycle');
    var _model = model;
    var _root = _model._root;

    var array = [model, component.props];
    var models = new _rxjs.BehaviorSubject(array);
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

            debugStart('           start | v' + topLevelModelVersion);

            if (previousOnChangesCompleted) {
                previousOnChangesCompleted.call(this);
            }

            array[0] = model;
            array[1] = component.props;

            models.next(array);
        } while (reenter === true);
    };

    _root.onChangesCompleted.call(_root.topLevelModel);

    return component.observe(models, 0, 0).map(function (vdom) {
        debugEnd('             end | v' + model.getVersion());
        working = false;
        array[0] = model;
        array[1] = vdom;
        return array;
    });
}
//# sourceMappingURL=index.js.map