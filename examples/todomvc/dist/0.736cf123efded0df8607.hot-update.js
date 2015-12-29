webpackHotUpdate(0,{

/***/ 76:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(77);
	
	var _falcorRouter = __webpack_require__(320);
	
	var _falcorRouter2 = _interopRequireDefault(_falcorRouter);
	
	var _ASAPScheduler = __webpack_require__(297);
	
	var _ASAPScheduler2 = _interopRequireDefault(_ASAPScheduler);
	
	var _BehaviorSubject = __webpack_require__(95);
	
	__webpack_require__(414);
	
	__webpack_require__(115);
	
	__webpack_require__(416);
	
	__webpack_require__(419);
	
	__webpack_require__(422);
	
	__webpack_require__(425);
	
	__webpack_require__(427);
	
	__webpack_require__(429);
	
	__webpack_require__(432);
	
	__webpack_require__(435);
	
	__webpack_require__(437);
	
	__webpack_require__(440);
	
	__webpack_require__(441);
	
	var _snabbdom = __webpack_require__(158);
	
	var _snabbdom2 = _interopRequireDefault(_snabbdom);
	
	var _class = __webpack_require__(161);
	
	var _class2 = _interopRequireDefault(_class);
	
	var _props = __webpack_require__(162);
	
	var _props2 = _interopRequireDefault(_props);
	
	var _style = __webpack_require__(163);
	
	var _style2 = _interopRequireDefault(_style);
	
	var _attributes = __webpack_require__(164);
	
	var _attributes2 = _interopRequireDefault(_attributes);
	
	var _eventlisteners = __webpack_require__(165);
	
	var _eventlisteners2 = _interopRequireDefault(_eventlisteners);
	
	var _App = __webpack_require__(443);
	
	var _Routes = __webpack_require__(472);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var patch = _snabbdom2.default.init([_class2.default, _props2.default, _style2.default, _attributes2.default, _eventlisteners2.default]); /** @jsx hJSX */
	
	var rootElement = document.body.appendChild(document.createElement('div'));
	
	var modules = new _BehaviorSubject.BehaviorSubject({ App: _App.App, Routes: _Routes.Routes });
	
	modules.switchMap(function (_ref) {
	    var App = _ref.App;
	    var Routes = _ref.Routes;
	
	    // Read the cache from local storage if possible.
	    var TodoCache = JSON.parse(localStorage.getItem('todos-reaxtor') || 'null');
	    if (!TodoCache || !TodoCache.apiVersion || !TodoCache.apiVersion.value === 0) {
	        TodoCache = null;
	    }
	
	    // Initialize the routes with the cache from local storage.
	    var TodoRouter = _falcorRouter2.default.createClass(Routes(TodoCache || undefined));
	
	    // Create root App Component (Observable)
	    return (0, _.reaxtor)(App, new _.Model({
	        materialized: true,
	        treatErrorsAsValues: true,
	        allowFromWhenceYouCame: true,
	        scheduler: new _ASAPScheduler2.default(),
	        source: new TodoRouter(),
	        onChangesCompleted: function onChangesCompleted() {
	            localStorage.setItem('todos-reaxtor', JSON.stringify(this.getCache()));
	        }
	    }));
	}).scan(patch, rootElement).subscribe();
	
	// If hot module replacement is enabled, listen for changes to App and Routes.
	if (true) {
	    // We accept updates to the top component
	    module.hot.accept([443, 470, 472, 458, 471, 444], function () {
	        // Dispatch the new modules to the modules Subject.
	        modules.next({
	            App: __webpack_require__(443),
	            Controls: __webpack_require__(470),
	            Routes: __webpack_require__(472),
	            Task: __webpack_require__(458),
	            TaskInput: __webpack_require__(471),
	            Tasks: __webpack_require__(444)
	        });
	    });
	}

/***/ }

})
//# sourceMappingURL=0.736cf123efded0df8607.hot-update.js.map