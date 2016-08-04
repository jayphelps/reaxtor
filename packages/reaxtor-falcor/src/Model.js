import { Model as FalcorModel } from 'falcor';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import InvalidateResponse from 'falcor/lib/response/InvalidateResponse';
import { fromPath, fromPathsOrPathValues } from 'reaxtor-falcor-syntax-path';

export class Model extends FalcorModel {
    constructor(options) {

        super(options);

        this.derefCount = 0;

        const { _root } = this;

        if (!_root.changes) {
            const changes = new BehaviorSubject(this);
            const { onChangesCompleted } = _root;
            _root.onChangesCompleted = function() {
                if (onChangesCompleted) {
                    onChangesCompleted.call(this);
                }
                changes.next(this);
            };
            _root.changes = changes;
        }
        if (!_root.branchSelector) {
            _root.branchSelector = rootBranchSelector;
        }
    }
    changes() {
        return this._root.changes;
    }
    /* implement inspect method for node's inspect utility */
    inspect() {
        return `{ v:${this.getVersion()} p:[${this._path.join(', ')}] }`;
        // return `{ c:${this.derefCount} v:${this.getVersion()} p:[${this._path.join(', ')}] }`;
    }
    get(...getArgs) {
        return new ObservableModelResponse(super.get.apply(
            this, fromPathsOrPathValues(getArgs)));
    }
    set(...setArgs) {
        return new ObservableModelResponse(super.set.apply(
            this, fromPathsOrPathValues(setArgs)));
    }
    call(fnPath, fnArgs, refPaths, thisPaths) {
        fnPath = fromPath(fnPath);
        refPaths = refPaths && fromPathsOrPathValues(refPaths) || [];
        thisPaths = thisPaths && fromPathsOrPathValues(thisPaths) || [];
        return new ObservableModelResponse(super.call.call(this,
            fnPath, fnArgs, refPaths, thisPaths
        ));
    }
    getItems(thisPathsSelector = () => [['length']],
             restPathsSelector = ({ json: { length }}) => []) {

        const thisPaths = fromPathsOrPathValues(
            [].concat(thisPathsSelector(this))
        );

        return (thisPaths.length === 0) ?
            Observable.empty() :
            this.get(...thisPaths).mergeMap((result) => {

                const restPaths = fromPathsOrPathValues(
                    [].concat(restPathsSelector(result))
                );

                return (restPaths.length === 0) ?
                    Observable.of(result) :
                    this.get(...thisPaths.concat(restPaths));
            });
    }
    invalidateAsync(...invalidateArgs) {
        return new ObservableModelResponse(new InvalidateResponse(
            this, fromPathsOrPathValues(invalidateArgs)
        ));
    }
    preload(...preloadArgs) {
        return new ObservableModelResponse(super.preload.apply(
            this, fromPathsOrPathValues(preloadArgs)));
    }
    getValue(...getValueArgs) {
        return new ObservableModelResponse(super.getValue.apply(
            this, fromPathsOrPathValues(getValueArgs)));
    }
    setValue(...setValueArgs) {
        return new ObservableModelResponse(super.setValue.apply(
            this, fromPathsOrPathValues(setValueArgs)));
    }
    _clone(opts) {
        const clone = new Model(this);
        for (let key in opts) {
            const value = opts[key];
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
}

class ObservableModelResponse extends Observable {
    constructor(source, operator) {
        if (typeof source !== 'function') {
            super();
            source && (this.source = source);
            operator && (this.operator = operator);
        } else {
            super(source);
        }
    }
    lift(operator) {
        return new ObservableModelResponse(this, operator);
    }
    _toJSONG() {
        return new ObservableModelResponse(this.source._toJSONG());
    }
    progressively() {
        return new ObservableModelResponse(this.source.progressively());
    }
}

const rootBranchSelector = (function() {

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
        const absPath = node && node.ツabsolutePath;
        if (!absPath) {
            branchKeyDescriptor.value = '[]';
            branchVersionDescriptor.value = -1;
            branchPathDescriptor.value = [];
        } else {
            const version = node.ツversion;
            branchVersionDescriptor.value = version;
            branchKeyDescriptor.value = `[${absPath.join(', ')}]`;
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
}());
