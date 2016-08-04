'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Model = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _falcor = require('falcor');

var _rxjs = require('rxjs');

var _InvalidateResponse = require('falcor/lib/response/InvalidateResponse');

var _InvalidateResponse2 = _interopRequireDefault(_InvalidateResponse);

var _reaxtorFalcorSyntaxPath = require('reaxtor-falcor-syntax-path');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Model = exports.Model = function (_FalcorModel) {
    _inherits(Model, _FalcorModel);

    function Model(options) {
        _classCallCheck(this, Model);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Model).call(this, options));

        _this.derefCount = 0;

        var _root = _this._root;


        if (!_root.changes) {
            (function () {
                var changes = new _rxjs.BehaviorSubject(_this);
                var onChangesCompleted = _root.onChangesCompleted;

                _root.onChangesCompleted = function () {
                    if (onChangesCompleted) {
                        onChangesCompleted.call(this);
                    }
                    changes.next(this);
                };
                _root.changes = changes;
            })();
        }
        if (!_root.branchSelector) {
            _root.branchSelector = rootBranchSelector;
        }
        return _this;
    }

    _createClass(Model, [{
        key: 'changes',
        value: function changes() {
            return this._root.changes;
        }
        /* implement inspect method for node's inspect utility */

    }, {
        key: 'inspect',
        value: function inspect() {
            return '{ v:' + this.getVersion() + ' p:[' + this._path.join(', ') + '] }';
            // return `{ c:${this.derefCount} v:${this.getVersion()} p:[${this._path.join(', ')}] }`;
        }
    }, {
        key: 'get',
        value: function get() {
            for (var _len = arguments.length, getArgs = Array(_len), _key = 0; _key < _len; _key++) {
                getArgs[_key] = arguments[_key];
            }

            return new ObservableModelResponse(_get(Object.getPrototypeOf(Model.prototype), 'get', this).apply(this, (0, _reaxtorFalcorSyntaxPath.fromPathsOrPathValues)(getArgs)));
        }
    }, {
        key: 'set',
        value: function set() {
            for (var _len2 = arguments.length, setArgs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                setArgs[_key2] = arguments[_key2];
            }

            return new ObservableModelResponse(_get(Object.getPrototypeOf(Model.prototype), 'set', this).apply(this, (0, _reaxtorFalcorSyntaxPath.fromPathsOrPathValues)(setArgs)));
        }
    }, {
        key: 'call',
        value: function call(fnPath, fnArgs, refPaths, thisPaths) {
            fnPath = (0, _reaxtorFalcorSyntaxPath.fromPath)(fnPath);
            refPaths = refPaths && (0, _reaxtorFalcorSyntaxPath.fromPathsOrPathValues)(refPaths) || [];
            thisPaths = thisPaths && (0, _reaxtorFalcorSyntaxPath.fromPathsOrPathValues)(thisPaths) || [];
            return new ObservableModelResponse(_get(Object.getPrototypeOf(Model.prototype), 'call', this).call(this, fnPath, fnArgs, refPaths, thisPaths));
        }
    }, {
        key: 'getItems',
        value: function getItems() {
            var _this2 = this;

            var thisPathsSelector = arguments.length <= 0 || arguments[0] === undefined ? function () {
                return [['length']];
            } : arguments[0];
            var restPathsSelector = arguments.length <= 1 || arguments[1] === undefined ? function (_ref) {
                var length = _ref.json.length;
                return [];
            } : arguments[1];


            var thisPaths = (0, _reaxtorFalcorSyntaxPath.fromPathsOrPathValues)([].concat(thisPathsSelector(this)));

            return thisPaths.length === 0 ? _rxjs.Observable.empty() : this.get.apply(this, _toConsumableArray(thisPaths)).mergeMap(function (result) {

                var restPaths = (0, _reaxtorFalcorSyntaxPath.fromPathsOrPathValues)([].concat(restPathsSelector(result)));

                return restPaths.length === 0 ? _rxjs.Observable.of(result) : _this2.get.apply(_this2, _toConsumableArray(thisPaths.concat(restPaths)));
            });
        }
    }, {
        key: 'invalidateAsync',
        value: function invalidateAsync() {
            for (var _len3 = arguments.length, invalidateArgs = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                invalidateArgs[_key3] = arguments[_key3];
            }

            return new ObservableModelResponse(new _InvalidateResponse2.default(this, (0, _reaxtorFalcorSyntaxPath.fromPathsOrPathValues)(invalidateArgs)));
        }
    }, {
        key: 'preload',
        value: function preload() {
            for (var _len4 = arguments.length, preloadArgs = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                preloadArgs[_key4] = arguments[_key4];
            }

            return new ObservableModelResponse(_get(Object.getPrototypeOf(Model.prototype), 'preload', this).apply(this, (0, _reaxtorFalcorSyntaxPath.fromPathsOrPathValues)(preloadArgs)));
        }
    }, {
        key: 'getValue',
        value: function getValue() {
            for (var _len5 = arguments.length, getValueArgs = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                getValueArgs[_key5] = arguments[_key5];
            }

            return new ObservableModelResponse(_get(Object.getPrototypeOf(Model.prototype), 'getValue', this).apply(this, (0, _reaxtorFalcorSyntaxPath.fromPathsOrPathValues)(getValueArgs)));
        }
    }, {
        key: 'setValue',
        value: function setValue() {
            for (var _len6 = arguments.length, setValueArgs = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                setValueArgs[_key6] = arguments[_key6];
            }

            return new ObservableModelResponse(_get(Object.getPrototypeOf(Model.prototype), 'setValue', this).apply(this, (0, _reaxtorFalcorSyntaxPath.fromPathsOrPathValues)(setValueArgs)));
        }
    }, {
        key: '_clone',
        value: function _clone(opts) {
            var clone = new Model(this);
            for (var key in opts) {
                var value = opts[key];
                if (value === "delete") {
                    delete clone[key];
                } else if (key === '_path') {
                    clone[key] = value;
                } else {
                    clone[key] = value;
                }
            }
            clone.derefCount = this.derefCount + 1;
            if (clone._path.length > 0) {
                clone.setCache = void 0;
            }
            return clone;
        }
    }]);

    return Model;
}(_falcor.Model);

var ObservableModelResponse = function (_Observable) {
    _inherits(ObservableModelResponse, _Observable);

    function ObservableModelResponse(source, operator) {
        _classCallCheck(this, ObservableModelResponse);

        if (typeof source !== 'function') {
            var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(ObservableModelResponse).call(this));

            source && (_this3.source = source);
            operator && (_this3.operator = operator);
        } else {
            var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(ObservableModelResponse).call(this, source));
        }
        return _possibleConstructorReturn(_this3);
    }

    _createClass(ObservableModelResponse, [{
        key: 'lift',
        value: function lift(operator) {
            return new ObservableModelResponse(this, operator);
        }
    }, {
        key: '_toJSONG',
        value: function _toJSONG() {
            return new ObservableModelResponse(this.source._toJSONG());
        }
    }, {
        key: 'progressively',
        value: function progressively() {
            return new ObservableModelResponse(this.source.progressively());
        }
    }]);

    return ObservableModelResponse;
}(_rxjs.Observable);

var rootBranchSelector = function () {

    var branchKeyDescriptor = Object.create(null);
    var branchPathDescriptor = Object.create(null);
    var branchVersionDescriptor = Object.create(null);
    var branchRefPathDescriptor = Object.create(null);
    var branchToReferenceDescriptor = Object.create(null);

    var refBranchDescriptors = Object.create(null);
    var normalBranchDescriptors = Object.create(null);

    branchKeyDescriptor.configurable = true;
    branchPathDescriptor.configurable = true;
    branchVersionDescriptor.configurable = true;
    branchRefPathDescriptor.configurable = true;
    branchToReferenceDescriptor.configurable = true;

    normalBranchDescriptors.$__key = branchKeyDescriptor;
    normalBranchDescriptors.$__path = branchPathDescriptor;
    normalBranchDescriptors.$__version = branchVersionDescriptor;

    refBranchDescriptors.$__key = branchKeyDescriptor;
    refBranchDescriptors.$__path = branchPathDescriptor;
    refBranchDescriptors.$__version = branchVersionDescriptor;
    refBranchDescriptors.$__refPath = branchRefPathDescriptor;
    refBranchDescriptors.$__toReference = branchToReferenceDescriptor;

    return branchSelector;

    function branchSelector(node, ref) {
        var absPath = node && node.ツabsolutePath;
        if (!absPath) {
            branchKeyDescriptor.value = '[]';
            branchVersionDescriptor.value = -1;
            branchPathDescriptor.value = [];
        } else {
            var version = node.ツversion;
            branchVersionDescriptor.value = version;
            branchKeyDescriptor.value = '[' + absPath.join(', ') + ']';
            branchPathDescriptor.value = absPath;
        }
        if (!ref) {
            return Object.create(Array.prototype, normalBranchDescriptors);
        }
        branchRefPathDescriptor.value = ref.value;
        branchToReferenceDescriptor.value = ref.ツabsolutePath;
        return Object.create(Array.prototype, refBranchDescriptors);
    }

    function getHashCode(key) {
        var code = 5381;
        var index = -1;
        var count = key.length;
        while (++index < count) {
            code = (code << 5) + code + key.charCodeAt(index);
        }
        return String(code);
    }
}();
//# sourceMappingURL=data:application/json;base64,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LE9BQU8sTUFBUCxDQUFjLE1BQU0sU0FBcEIsRUFBK0Isb0JBQS9CLENBQVA7QUFDSDs7QUFFRCxhQUFTLFdBQVQsQ0FBcUIsR0FBckIsRUFBMEI7QUFDdEIsWUFBSSxPQUFPLElBQVg7QUFDQSxZQUFJLFFBQVEsQ0FBQyxDQUFiO0FBQ0EsWUFBSSxRQUFRLElBQUksTUFBaEI7QUFDQSxlQUFPLEVBQUUsS0FBRixHQUFVLEtBQWpCLEVBQXdCO0FBQ3BCLG1CQUFPLENBQUMsUUFBUSxDQUFULElBQWMsSUFBZCxHQUFxQixJQUFJLFVBQUosQ0FBZSxLQUFmLENBQTVCO0FBQ0g7QUFDRCxlQUFPLE9BQU8sSUFBUCxDQUFQO0FBQ0g7QUFDSixDQTFEMkIsRUFBNUIiLCJmaWxlIjoiTW9kZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNb2RlbCBhcyBGYWxjb3JNb2RlbCB9IGZyb20gJ2ZhbGNvcic7XG5pbXBvcnQgeyBTdWJqZWN0LCBPYnNlcnZhYmxlLCBCZWhhdmlvclN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCBJbnZhbGlkYXRlUmVzcG9uc2UgZnJvbSAnZmFsY29yL2xpYi9yZXNwb25zZS9JbnZhbGlkYXRlUmVzcG9uc2UnO1xuaW1wb3J0IHsgZnJvbVBhdGgsIGZyb21QYXRoc09yUGF0aFZhbHVlcyB9IGZyb20gJ3JlYXh0b3ItZmFsY29yLXN5bnRheC1wYXRoJztcblxuZXhwb3J0IGNsYXNzIE1vZGVsIGV4dGVuZHMgRmFsY29yTW9kZWwge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcblxuICAgICAgICBzdXBlcihvcHRpb25zKTtcblxuICAgICAgICB0aGlzLmRlcmVmQ291bnQgPSAwO1xuXG4gICAgICAgIGNvbnN0IHsgX3Jvb3QgfSA9IHRoaXM7XG5cbiAgICAgICAgaWYgKCFfcm9vdC5jaGFuZ2VzKSB7XG4gICAgICAgICAgICBjb25zdCBjaGFuZ2VzID0gbmV3IEJlaGF2aW9yU3ViamVjdCh0aGlzKTtcbiAgICAgICAgICAgIGNvbnN0IHsgb25DaGFuZ2VzQ29tcGxldGVkIH0gPSBfcm9vdDtcbiAgICAgICAgICAgIF9yb290Lm9uQ2hhbmdlc0NvbXBsZXRlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChvbkNoYW5nZXNDb21wbGV0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2VzQ29tcGxldGVkLmNhbGwodGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNoYW5nZXMubmV4dCh0aGlzKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBfcm9vdC5jaGFuZ2VzID0gY2hhbmdlcztcbiAgICAgICAgfVxuICAgICAgICBpZiAoIV9yb290LmJyYW5jaFNlbGVjdG9yKSB7XG4gICAgICAgICAgICBfcm9vdC5icmFuY2hTZWxlY3RvciA9IHJvb3RCcmFuY2hTZWxlY3RvcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjaGFuZ2VzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcm9vdC5jaGFuZ2VzO1xuICAgIH1cbiAgICAvKiBpbXBsZW1lbnQgaW5zcGVjdCBtZXRob2QgZm9yIG5vZGUncyBpbnNwZWN0IHV0aWxpdHkgKi9cbiAgICBpbnNwZWN0KCkge1xuICAgICAgICByZXR1cm4gYHsgdjoke3RoaXMuZ2V0VmVyc2lvbigpfSBwOlske3RoaXMuX3BhdGguam9pbignLCAnKX1dIH1gO1xuICAgICAgICAvLyByZXR1cm4gYHsgYzoke3RoaXMuZGVyZWZDb3VudH0gdjoke3RoaXMuZ2V0VmVyc2lvbigpfSBwOlske3RoaXMuX3BhdGguam9pbignLCAnKX1dIH1gO1xuICAgIH1cbiAgICBnZXQoLi4uZ2V0QXJncykge1xuICAgICAgICByZXR1cm4gbmV3IE9ic2VydmFibGVNb2RlbFJlc3BvbnNlKHN1cGVyLmdldC5hcHBseShcbiAgICAgICAgICAgIHRoaXMsIGZyb21QYXRoc09yUGF0aFZhbHVlcyhnZXRBcmdzKSkpO1xuICAgIH1cbiAgICBzZXQoLi4uc2V0QXJncykge1xuICAgICAgICByZXR1cm4gbmV3IE9ic2VydmFibGVNb2RlbFJlc3BvbnNlKHN1cGVyLnNldC5hcHBseShcbiAgICAgICAgICAgIHRoaXMsIGZyb21QYXRoc09yUGF0aFZhbHVlcyhzZXRBcmdzKSkpO1xuICAgIH1cbiAgICBjYWxsKGZuUGF0aCwgZm5BcmdzLCByZWZQYXRocywgdGhpc1BhdGhzKSB7XG4gICAgICAgIGZuUGF0aCA9IGZyb21QYXRoKGZuUGF0aCk7XG4gICAgICAgIHJlZlBhdGhzID0gcmVmUGF0aHMgJiYgZnJvbVBhdGhzT3JQYXRoVmFsdWVzKHJlZlBhdGhzKSB8fCBbXTtcbiAgICAgICAgdGhpc1BhdGhzID0gdGhpc1BhdGhzICYmIGZyb21QYXRoc09yUGF0aFZhbHVlcyh0aGlzUGF0aHMpIHx8IFtdO1xuICAgICAgICByZXR1cm4gbmV3IE9ic2VydmFibGVNb2RlbFJlc3BvbnNlKHN1cGVyLmNhbGwuY2FsbCh0aGlzLFxuICAgICAgICAgICAgZm5QYXRoLCBmbkFyZ3MsIHJlZlBhdGhzLCB0aGlzUGF0aHNcbiAgICAgICAgKSk7XG4gICAgfVxuICAgIGdldEl0ZW1zKHRoaXNQYXRoc1NlbGVjdG9yID0gKCkgPT4gW1snbGVuZ3RoJ11dLFxuICAgICAgICAgICAgIHJlc3RQYXRoc1NlbGVjdG9yID0gKHsganNvbjogeyBsZW5ndGggfX0pID0+IFtdKSB7XG5cbiAgICAgICAgY29uc3QgdGhpc1BhdGhzID0gZnJvbVBhdGhzT3JQYXRoVmFsdWVzKFxuICAgICAgICAgICAgW10uY29uY2F0KHRoaXNQYXRoc1NlbGVjdG9yKHRoaXMpKVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiAodGhpc1BhdGhzLmxlbmd0aCA9PT0gMCkgP1xuICAgICAgICAgICAgT2JzZXJ2YWJsZS5lbXB0eSgpIDpcbiAgICAgICAgICAgIHRoaXMuZ2V0KC4uLnRoaXNQYXRocykubWVyZ2VNYXAoKHJlc3VsdCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdFBhdGhzID0gZnJvbVBhdGhzT3JQYXRoVmFsdWVzKFxuICAgICAgICAgICAgICAgICAgICBbXS5jb25jYXQocmVzdFBhdGhzU2VsZWN0b3IocmVzdWx0KSlcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIChyZXN0UGF0aHMubGVuZ3RoID09PSAwKSA/XG4gICAgICAgICAgICAgICAgICAgIE9ic2VydmFibGUub2YocmVzdWx0KSA6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0KC4uLnRoaXNQYXRocy5jb25jYXQocmVzdFBhdGhzKSk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgaW52YWxpZGF0ZUFzeW5jKC4uLmludmFsaWRhdGVBcmdzKSB7XG4gICAgICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZU1vZGVsUmVzcG9uc2UobmV3IEludmFsaWRhdGVSZXNwb25zZShcbiAgICAgICAgICAgIHRoaXMsIGZyb21QYXRoc09yUGF0aFZhbHVlcyhpbnZhbGlkYXRlQXJncylcbiAgICAgICAgKSk7XG4gICAgfVxuICAgIHByZWxvYWQoLi4ucHJlbG9hZEFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlTW9kZWxSZXNwb25zZShzdXBlci5wcmVsb2FkLmFwcGx5KFxuICAgICAgICAgICAgdGhpcywgZnJvbVBhdGhzT3JQYXRoVmFsdWVzKHByZWxvYWRBcmdzKSkpO1xuICAgIH1cbiAgICBnZXRWYWx1ZSguLi5nZXRWYWx1ZUFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlTW9kZWxSZXNwb25zZShzdXBlci5nZXRWYWx1ZS5hcHBseShcbiAgICAgICAgICAgIHRoaXMsIGZyb21QYXRoc09yUGF0aFZhbHVlcyhnZXRWYWx1ZUFyZ3MpKSk7XG4gICAgfVxuICAgIHNldFZhbHVlKC4uLnNldFZhbHVlQXJncykge1xuICAgICAgICByZXR1cm4gbmV3IE9ic2VydmFibGVNb2RlbFJlc3BvbnNlKHN1cGVyLnNldFZhbHVlLmFwcGx5KFxuICAgICAgICAgICAgdGhpcywgZnJvbVBhdGhzT3JQYXRoVmFsdWVzKHNldFZhbHVlQXJncykpKTtcbiAgICB9XG4gICAgX2Nsb25lKG9wdHMpIHtcbiAgICAgICAgY29uc3QgY2xvbmUgPSBuZXcgTW9kZWwodGhpcyk7XG4gICAgICAgIGZvciAobGV0IGtleSBpbiBvcHRzKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IG9wdHNba2V5XTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gXCJkZWxldGVcIikge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBjbG9uZVtrZXldO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdfcGF0aCcpIHtcbiAgICAgICAgICAgICAgICBjbG9uZVtrZXldID0gdmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNsb25lW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjbG9uZS5kZXJlZkNvdW50ID0gdGhpcy5kZXJlZkNvdW50ICsgMTtcbiAgICAgICAgaWYgKGNsb25lLl9wYXRoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNsb25lLnNldENhY2hlID0gdm9pZCAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjbG9uZTtcbiAgICB9XG59XG5cbmNsYXNzIE9ic2VydmFibGVNb2RlbFJlc3BvbnNlIGV4dGVuZHMgT2JzZXJ2YWJsZSB7XG4gICAgY29uc3RydWN0b3Ioc291cmNlLCBvcGVyYXRvcikge1xuICAgICAgICBpZiAodHlwZW9mIHNvdXJjZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgICAgIHNvdXJjZSAmJiAodGhpcy5zb3VyY2UgPSBzb3VyY2UpO1xuICAgICAgICAgICAgb3BlcmF0b3IgJiYgKHRoaXMub3BlcmF0b3IgPSBvcGVyYXRvcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlcihzb3VyY2UpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGxpZnQob3BlcmF0b3IpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlTW9kZWxSZXNwb25zZSh0aGlzLCBvcGVyYXRvcik7XG4gICAgfVxuICAgIF90b0pTT05HKCkge1xuICAgICAgICByZXR1cm4gbmV3IE9ic2VydmFibGVNb2RlbFJlc3BvbnNlKHRoaXMuc291cmNlLl90b0pTT05HKCkpO1xuICAgIH1cbiAgICBwcm9ncmVzc2l2ZWx5KCkge1xuICAgICAgICByZXR1cm4gbmV3IE9ic2VydmFibGVNb2RlbFJlc3BvbnNlKHRoaXMuc291cmNlLnByb2dyZXNzaXZlbHkoKSk7XG4gICAgfVxufVxuXG5jb25zdCByb290QnJhbmNoU2VsZWN0b3IgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgYnJhbmNoS2V5RGVzY3JpcHRvciA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgdmFyIGJyYW5jaFBhdGhEZXNjcmlwdG9yID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB2YXIgYnJhbmNoVmVyc2lvbkRlc2NyaXB0b3IgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIHZhciBicmFuY2hSZWZQYXRoRGVzY3JpcHRvciA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgdmFyIGJyYW5jaFRvUmVmZXJlbmNlRGVzY3JpcHRvciA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgICB2YXIgcmVmQnJhbmNoRGVzY3JpcHRvcnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIHZhciBub3JtYWxCcmFuY2hEZXNjcmlwdG9ycyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgICBicmFuY2hLZXlEZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgYnJhbmNoUGF0aERlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICBicmFuY2hWZXJzaW9uRGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlO1xuICAgIGJyYW5jaFJlZlBhdGhEZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgYnJhbmNoVG9SZWZlcmVuY2VEZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG5cbiAgICBub3JtYWxCcmFuY2hEZXNjcmlwdG9ycy4kX19rZXkgPSBicmFuY2hLZXlEZXNjcmlwdG9yO1xuICAgIG5vcm1hbEJyYW5jaERlc2NyaXB0b3JzLiRfX3BhdGggPSBicmFuY2hQYXRoRGVzY3JpcHRvcjtcbiAgICBub3JtYWxCcmFuY2hEZXNjcmlwdG9ycy4kX192ZXJzaW9uID0gYnJhbmNoVmVyc2lvbkRlc2NyaXB0b3I7XG5cbiAgICByZWZCcmFuY2hEZXNjcmlwdG9ycy4kX19rZXkgPSBicmFuY2hLZXlEZXNjcmlwdG9yO1xuICAgIHJlZkJyYW5jaERlc2NyaXB0b3JzLiRfX3BhdGggPSBicmFuY2hQYXRoRGVzY3JpcHRvcjtcbiAgICByZWZCcmFuY2hEZXNjcmlwdG9ycy4kX192ZXJzaW9uID0gYnJhbmNoVmVyc2lvbkRlc2NyaXB0b3I7XG4gICAgcmVmQnJhbmNoRGVzY3JpcHRvcnMuJF9fcmVmUGF0aCA9IGJyYW5jaFJlZlBhdGhEZXNjcmlwdG9yO1xuICAgIHJlZkJyYW5jaERlc2NyaXB0b3JzLiRfX3RvUmVmZXJlbmNlID0gYnJhbmNoVG9SZWZlcmVuY2VEZXNjcmlwdG9yO1xuXG4gICAgcmV0dXJuIGJyYW5jaFNlbGVjdG9yO1xuXG4gICAgZnVuY3Rpb24gYnJhbmNoU2VsZWN0b3Iobm9kZSwgcmVmKSB7XG4gICAgICAgIGNvbnN0IGFic1BhdGggPSBub2RlICYmIG5vZGUu44OEYWJzb2x1dGVQYXRoO1xuICAgICAgICBpZiAoIWFic1BhdGgpIHtcbiAgICAgICAgICAgIGJyYW5jaEtleURlc2NyaXB0b3IudmFsdWUgPSAnW10nO1xuICAgICAgICAgICAgYnJhbmNoVmVyc2lvbkRlc2NyaXB0b3IudmFsdWUgPSAtMTtcbiAgICAgICAgICAgIGJyYW5jaFBhdGhEZXNjcmlwdG9yLnZhbHVlID0gW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB2ZXJzaW9uID0gbm9kZS7jg4R2ZXJzaW9uO1xuICAgICAgICAgICAgYnJhbmNoVmVyc2lvbkRlc2NyaXB0b3IudmFsdWUgPSB2ZXJzaW9uO1xuICAgICAgICAgICAgYnJhbmNoS2V5RGVzY3JpcHRvci52YWx1ZSA9IGBbJHthYnNQYXRoLmpvaW4oJywgJyl9XWA7XG4gICAgICAgICAgICBicmFuY2hQYXRoRGVzY3JpcHRvci52YWx1ZSA9IGFic1BhdGg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFyZWYpIHtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3QuY3JlYXRlKEFycmF5LnByb3RvdHlwZSwgbm9ybWFsQnJhbmNoRGVzY3JpcHRvcnMpO1xuICAgICAgICB9XG4gICAgICAgIGJyYW5jaFJlZlBhdGhEZXNjcmlwdG9yLnZhbHVlID0gcmVmLnZhbHVlO1xuICAgICAgICBicmFuY2hUb1JlZmVyZW5jZURlc2NyaXB0b3IudmFsdWUgPSByZWYu44OEYWJzb2x1dGVQYXRoO1xuICAgICAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZShBcnJheS5wcm90b3R5cGUsIHJlZkJyYW5jaERlc2NyaXB0b3JzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRIYXNoQ29kZShrZXkpIHtcbiAgICAgICAgdmFyIGNvZGUgPSA1MzgxO1xuICAgICAgICB2YXIgaW5kZXggPSAtMTtcbiAgICAgICAgdmFyIGNvdW50ID0ga2V5Lmxlbmd0aDtcbiAgICAgICAgd2hpbGUgKCsraW5kZXggPCBjb3VudCkge1xuICAgICAgICAgICAgY29kZSA9IChjb2RlIDw8IDUpICsgY29kZSArIGtleS5jaGFyQ29kZUF0KGluZGV4KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gU3RyaW5nKGNvZGUpO1xuICAgIH1cbn0oKSk7XG4iXX0=