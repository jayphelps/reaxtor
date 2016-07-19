var isArray = Array.isArray;
var reaxtor = require('reaxtor');
var isClass = require('is-class');
var fnBind = Function.prototype.bind;
var arraySlice = Array.prototype.slice;

module.exports = exports.default = exports.html = rJSX(undefined);
module.exports.rJSX = exports.rJSX = rJSX;
module.exports.svg = exports.svg = rJSX('http://www.w3.org/2000/svg', 'attrs');

function rJSX(nsURI, defNS, modules) {
    defNS = defNS || 'props';
    modules = modules || ['on', 'hook', 'hero', 'attrs', 'class', 'style', 'props', 'dataset'];
    return function jsxWithCustomNS(tag, attrs, children) {
        if(arguments.length > 3 || !Array.isArray(children)) {
            children = flatten(arraySlice.call(arguments, 2));
        }
        return buildVnode(nsURI, defNS, modules, tag, attrs || {}, children || []);
    }
}

function buildVnode(nsURI, defNS, modules, tag, attrs, children) {
    if (typeof tag === 'string') {
        return buildFromStringTag(nsURI, defNS, modules, tag, attrs, children);
    } else {
        return buildFromComponent(nsURI, defNS, modules, tag, attrs, children);
    }
}

function buildFromStringTag(nsURI, defNS, modules, tag, attrs, children) {

    var data = normalizeAttrs(attrs, nsURI, defNS, modules);

    if (/^[A-Z]/.test(tag)) {
        var comp = new reaxtor.Component(data, children);
        comp.name = tag;
        return comp;
    }

    if (attrs.selector) {
        tag = tag + attrs.selector;
    }

    if (attrs.classNames) {
        var cns = attrs.classNames;
        tag = tag + '.' + (Array.isArray(cns) ?
            cns.join('.') :
            cns.replace(/\s+/g, '.')
        );
    }

    var text = children[0];

    if (children.length === 1 && isPrimitive(text)) {
        return { sel: tag, data: data, text: text, key: attrs.key };
    }

    return {
        sel: tag,
        data: data,
        key: attrs.key,
        children: children.map(function (c) {
            return isPrimitive(c) ? { text: c } : c;
        })
    };
}

function buildFromComponent(nsURI, defNS, modules, tag, attrs, children) {
    var res;
    if (isPrimitive(tag)) {
        throw "JSX tag must be either a class, string, function, or an object with 'view' or 'render' methods.";
    } else if (typeof tag === 'function') {
        if (!isClass(tag)) {
            res = tag(attrs, children);
        } else {
            res = new tag(attrs, children);
        }
    } else if (typeof tag.view === 'function') {
        res = tag.view(attrs, children);
    } else if (typeof tag.render === 'function') {
        res = tag.render(attrs, children);
    } else {
        throw "JSX tag must be either a class, string, function, or an object with 'view' or 'render' methods.";
    }
    res.key = attrs.key;
    return res;
}

function normalizeAttrs(attrs, nsURI, defNS, modules) {

    var map = { ns: nsURI };

    for (var i = 0, len = modules.length; i < len; i++) {
        var mod = modules[i];
        if (attrs[mod]) {
            map[mod] = attrs[mod];
        }
    }

    for (var key in attrs) {
        if (key !== 'key' && key !== 'classNames' && key !== 'selector') {
            (map[defNS] || (map[defNS] = {}))[key] = attrs[key];
        }
    }

    return map;
}

function isPrimitive(val) {
    if (val === null || val === undefined) {
        return true;
    }
    switch (typeof val) {
        case 'object':
        case 'function':
            return false;
        default:
            return true;
    }
    return true;
}

function flatten(xs) {
    return xs && isArray(xs) && flatMap(xs, flatten) || xs;
}

function flatMap(xs, sel) {
    var arr = [];
    var index = -1;
    var xen = xs.length;
    while (++index < xen) {
        var count = -1;
        var ys = sel(xs[index], index, xs);
        var yen = ys.length;
        while (++count < yen) {
            arr[index + count] = ys[count];
        }
    }
    return arr;
}
