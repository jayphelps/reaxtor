webpackHotUpdate(0,{

/***/ 458:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Task = undefined;
	
	var _ = __webpack_require__(77);
	
	var _Observable = __webpack_require__(79);
	
	var _falcorJsonGraph = __webpack_require__(459);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /** @jsx hJSX */
	
	var Task = exports.Task = (function (_Base) {
	    _inherits(Task, _Base);
	
	    function Task() {
	        _classCallCheck(this, Task);
	
	        return _possibleConstructorReturn(this, Object.getPrototypeOf(Task).apply(this, arguments));
	    }
	
	    _createClass(Task, [{
	        key: 'loader',
	        value: function loader(_ref) {
	            var _ref2 = _slicedToArray(_ref, 1);
	
	            var model = _ref2[0];
	
	            return model.get('[\'id\', \'content\', \'completed\']');
	        }
	    }, {
	        key: 'events',
	        value: function events(_ref3) {
	            var _ref4 = _slicedToArray(_ref3, 2);
	
	            var model = _ref4[0];
	            var state = _ref4[1];
	
	            return _Observable.Observable.merge(this.listen('edit').map(function () {
	                return _extends({}, state, { editing: true });
	            }), this.listen('done').map(function (_ref5) {
	                var target = _ref5.target;
	                return target.checked;
	            }).switchMap(function (completed) {
	                return model.call(['toggle'], [completed]);
	            }, function (completed) {
	                return _extends({}, state, { completed: completed, editing: false });
	            }), this.listen('blur').merge(this.listen('commit').filter(function (ev) {
	                return ev.keyIdentifier === 'Enter';
	            })).map(function (_ref6) {
	                var target = _ref6.target;
	                return target.value;
	            }).switchMap(function (content) {
	                return model.set({ json: { content: content } });
	            }, function (content) {
	                return _extends({}, state, { content: content, editing: false });
	            }), this.listen('destroy').switchMap(function () {
	                return model.call(['remove']);
	            }, function (ev) {
	                return { id: '', content: '', completed: '' };
	            })).map(function (newState) {
	                return [model, state = newState];
	            });
	        }
	    }, {
	        key: 'render',
	        value: function render(_ref7) {
	            var _ref8 = _slicedToArray(_ref7, 2);
	
	            var model = _ref8[0];
	            var _ref8$ = _ref8[1];
	            var id = _ref8$.id;
	            var content = _ref8$.content;
	            var completed = _ref8$.completed;
	            var _ref8$$editing = _ref8$.editing;
	            var editing = _ref8$$editing === undefined ? false : _ref8$$editing;
	
	            return (0, _.hJSX)(
	                'li',
	                { 'class': { editing: editing, completed: completed && !editing } },
	                (0, _.hJSX)(
	                    'div',
	                    { 'class': { 'view': true } },
	                    (0, _.hJSX)('input', { 'class': { 'toggle': true },
	                        type: 'checkbox',
	                        checked: completed && !editing,
	                        'on-click': this.dispatch('done') }),
	                    (0, _.hJSX)(
	                        'label',
	                        {
	                            style: { color: 'red' },
	                            'on-dblclick': this.dispatch('edit') },
	                        content
	                    ),
	                    (0, _.hJSX)('button', { 'class': { 'destroy': true },
	                        'on-click': this.dispatch('destroy') })
	                ),
	                (0, _.hJSX)('input', { 'class': { 'edit': true },
	                    value: content,
	                    'on-blur': this.dispatch('blur'),
	                    'on-keydown': this.dispatch('commit'),
	                    hook: {
	                        postpatch: function postpatch(old, _ref9) {
	                            var elm = _ref9.elm;
	
	                            if (editing) {
	                                elm.focus();
	                            }
	                        }
	                    } })
	            );
	        }
	    }]);
	
	    return Task;
	})(_.Base);

/***/ }

})
//# sourceMappingURL=0.ec31dd3d5c5948e5c660.hot-update.js.map