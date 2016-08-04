export function mergeFalcorNodes(target, source) {

    if (source === target) {
        return target;
    } else if (source === null || typeof source !== 'object' || source.$type) {
        return source;
    } else if (target === null || typeof target !== 'object') {
        target = Object.create(Array.prototype);
    }

    const sourceKey = source.$__key;
    const targetKey = target.$__key;

    const sourceVersion = source.$__version;
    const targetVersion = target.$__version;

    const sourceHashCode = sourceKey + '-v' + sourceVersion;
    const targetHashCode = targetKey + '-v' + targetVersion;

    if (typeof targetHashCode !== 'undefined' && targetHashCode === sourceHashCode) {
        return target;
    }

    for (const key in source) {
        const targetValue = target[key];
        const sourceValue = source[key];
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

    const $__path = source.$__path;

    if (!$__path) {
        return Object.defineProperties(target, rootBranchDescriptors);
    }

    branchPathDescriptor.value = $__path;

    const $__refPath = source.$__refPath;
    const $__toReference = source.$__toReference;

    if (!$__refPath && !$__toReference) {
        return Object.defineProperties(target, normalBranchDescriptors);
    }

    branchRefPathDescriptor.value = $__refPath;
    branchToReferenceDescriptor.value = $__toReference;

    return Object.defineProperties(target, refBranchDescriptors);
}

const branchKeyDescriptor = Object.create(null);
const branchPathDescriptor = Object.create(null);
const branchVersionDescriptor = Object.create(null);
const branchRefPathDescriptor = Object.create(null);
const branchToReferenceDescriptor = Object.create(null);

const refBranchDescriptors = Object.create(null);
const rootBranchDescriptors = Object.create(null);
const normalBranchDescriptors = Object.create(null);

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
