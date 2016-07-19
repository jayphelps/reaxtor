'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _reaxtorJsx = require('reaxtor-jsx');

var _reaxtorJsx2 = _interopRequireDefault(_reaxtorJsx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var models = Observable.of(new Model());

(0, _reaxtorJsx2.default)(
    'App',
    {
        attrs: { models: models, keys: ['id', 'url', 'title', 'total'] }
    },
    [].concat((0, _reaxtorJsx2.default)(
        'iFrame',
        {
            dataset: {
                values: 'foo'
            },
            attrs: { keys: ['url', 'total'] }
        },
        [].concat(function (_ref) {
            var url = _ref.url;
            var total = _ref.total;
            return (0, _reaxtorJsx2.default)('iframe', {
                attrs: { src: url + '?total=' + total }
            });
        })
    ), (0, _reaxtorJsx2.default)(
        'Table',
        {},
        [].concat((0, _reaxtorJsx2.default)(
            'List',
            {
                attrs: { id: 'foo', path: 'cols', keys: ['total', 'length'] }
            },
            [].concat(function (_ref2) {
                for (var _len = arguments.length, cells = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    cells[_key - 1] = arguments[_key];
                }

                var total = _ref2.total;
                var length = _ref2.length;
                return (0, _reaxtorJsx2.default)(
                    'thead',
                    {
                        class: _defineProperty({}, tableHeaderClassName, true)
                    },
                    [].concat((0, _reaxtorJsx2.default)(
                        'tr',
                        {},
                        [].concat(cells.concat((0, _reaxtorJsx2.default)(
                            'div',
                            {
                                class: _defineProperty({}, tableCellClassName, true)
                            },
                            [].concat((0, _reaxtorJsx2.default)(
                                'span',
                                {},
                                [].concat(total)
                            ), (0, _reaxtorJsx2.default)('i', {
                                on: {
                                    click: [undefined.onSpliceRow, undefined]
                                },
                                class: _defineProperty({}, spliceIconClassName, true)
                            }), (0, _reaxtorJsx2.default)('i', {
                                on: {
                                    click: [undefined.onInsertRow, undefined]
                                },
                                class: _defineProperty({}, insertIconClassName, true)
                            }))
                        )).map(function (cell) {
                            return (0, _reaxtorJsx2.default)(
                                'th',
                                {
                                    style: { width: Math.round(100 / (length + 1)) + '%' }
                                },
                                [].concat(cell)
                            );
                        }))
                    ))
                );
            }, function (props) {
                return (0, _reaxtorJsx2.default)(
                    'Cell',
                    _extends({ keys: ['name'] }, props),
                    [].concat(function (_ref7) {
                        var name = _ref7.name;
                        return (0, _reaxtorJsx2.default)(
                            'div',
                            {
                                class: _defineProperty({}, tableCellClassName, true)
                            },
                            [].concat((0, _reaxtorJsx2.default)('input', {
                                attrs: { type: 'text', readonly: 'true', disabled: 'true' },
                                props: { value: name }
                            }))
                        );
                    })
                );
            })
        ), (0, _reaxtorJsx2.default)(
            'List',
            {
                attrs: { path: 'rows', keys: ['length'] }
            },
            [].concat(function (state) {
                for (var _len2 = arguments.length, rows = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                    rows[_key2 - 1] = arguments[_key2];
                }

                return (0, _reaxtorJsx2.default)(
                    'tbody',
                    {
                        class: _defineProperty({}, tableBodyClassName, true)
                    },
                    [].concat(rows)
                );
            }, function (props) {
                return(
                    /* Table Rows */
                    (0, _reaxtorJsx2.default)(
                        'List',
                        _extends({ keys: ['id', 'total', 'length'] }, props),
                        [].concat(function (props) {
                            return(
                                /* Table Cells*/
                                (0, _reaxtorJsx2.default)(
                                    'Cell',
                                    _extends({ keys: ['value'] }, props),
                                    [].concat(function (_ref10) {
                                        var value = _ref10.value;
                                        return (0, _reaxtorJsx2.default)(
                                            'div',
                                            {
                                                class: _defineProperty({}, tableCellClassName, true)
                                            },
                                            [].concat((0, _reaxtorJsx2.default)('input', {
                                                attrs: { type: 'number' },
                                                props: { value: name }
                                            }))
                                        );
                                    })
                                )
                            );
                        }, function (_ref12) {
                            for (var _len3 = arguments.length, cells = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
                                cells[_key3 - 1] = arguments[_key3];
                            }

                            var id = _ref12.id;
                            var total = _ref12.total;
                            var length = _ref12.length;
                            return (0, _reaxtorJsx2.default)(
                                'tr',
                                {},
                                [].concat(cells.concat((0, _reaxtorJsx2.default)(
                                    'div',
                                    {
                                        class: _defineProperty({}, tableCellClassName, true)
                                    },
                                    [].concat((0, _reaxtorJsx2.default)(
                                        'span',
                                        {},
                                        [].concat(total)
                                    ), (0, _reaxtorJsx2.default)('i', {
                                        on: {
                                            click: [undefined.onSpliceRow, id]
                                        },
                                        class: _defineProperty({}, spliceIconClassName, true)
                                    }), (0, _reaxtorJsx2.default)('i', {
                                        on: {
                                            click: [undefined.onInsertRow, id]
                                        },
                                        class: _defineProperty({}, insertIconClassName, true)
                                    }))
                                )).map(function (cell) {
                                    return (0, _reaxtorJsx2.default)(
                                        'th',
                                        {
                                            style: { width: Math.round(100 / (length + 1)) + '%' }
                                        },
                                        [].concat(cell)
                                    );
                                }))
                            );
                        })
                    )
                );
            })
        ))
    ))
);

