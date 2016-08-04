'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.mergeFalcorNodes = mergeFalcorNodes;
function mergeFalcorNodes(target, source) {

    if (source === target) {
        return target;
    } else if (source === null || (typeof source === 'undefined' ? 'undefined' : _typeof(source)) !== 'object' || source.$type) {
        return source;
    } else if (target === null || (typeof target === 'undefined' ? 'undefined' : _typeof(target)) !== 'object') {
        target = Object.create(Array.prototype);
    }

    var sourceKey = source.$__key;
    var targetKey = target.$__key;

    var sourceVersion = source.$__version;
    var targetVersion = target.$__version;

    var sourceHashCode = sourceKey + '-v' + sourceVersion;
    var targetHashCode = targetKey + '-v' + targetVersion;

    if (typeof targetHashCode !== 'undefined' && targetHashCode === sourceHashCode) {
        return target;
    }

    for (var key in source) {
        var targetValue = target[key];
        var sourceValue = source[key];
        if (targetValue === undefined) {
            target[key] = sourceValue;
        } else {
            target[key] = mergeFalcorNodes(targetValue, sourceValue);
        }
    }

    if (typeof sourceHashCode === 'undefined') {
        return target;
    }

    branchKeyDescriptor.value = sourceKey;
    branchVersionDescriptor.value = sourceVersion;

    var $__path = source.$__path;

    if (!$__path) {
        return Object.defineProperties(target, rootBranchDescriptors);
    }

    branchPathDescriptor.value = $__path;

    var $__refPath = source.$__refPath;
    var $__toReference = source.$__toReference;

    if (!$__refPath && !$__toReference) {
        return Object.defineProperties(target, normalBranchDescriptors);
    }

    branchRefPathDescriptor.value = $__refPath;
    branchToReferenceDescriptor.value = $__toReference;

    return Object.defineProperties(target, refBranchDescriptors);
}

var branchKeyDescriptor = Object.create(null);
var branchPathDescriptor = Object.create(null);
var branchVersionDescriptor = Object.create(null);
var branchRefPathDescriptor = Object.create(null);
var branchToReferenceDescriptor = Object.create(null);

var refBranchDescriptors = Object.create(null);
var rootBranchDescriptors = Object.create(null);
var normalBranchDescriptors = Object.create(null);

branchKeyDescriptor.configurable = true;
branchPathDescriptor.configurable = true;
branchVersionDescriptor.configurable = true;
branchRefPathDescriptor.configurable = true;
branchToReferenceDescriptor.configurable = true;

rootBranchDescriptors.$__key = branchKeyDescriptor;
rootBranchDescriptors.$__version = branchVersionDescriptor;

normalBranchDescriptors.$__key = branchKeyDescriptor;
normalBranchDescriptors.$__path = branchPathDescriptor;
normalBranchDescriptors.$__version = branchVersionDescriptor;

refBranchDescriptors.$__key = branchKeyDescriptor;
refBranchDescriptors.$__path = branchPathDescriptor;
refBranchDescriptors.$__version = branchVersionDescriptor;
refBranchDescriptors.$__refPath = branchRefPathDescriptor;
refBranchDescriptors.$__toReference = branchToReferenceDescriptor;
//# sourceMappingURL=mergeFalcorNodes.js.map