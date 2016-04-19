import { Model as FalcorModel } from 'falcor';
import { Observable } from 'rxjs/Observable';
import parsePath from 'falcor-path-syntax';
import { fromPath, fromPathsOrPathValues } from 'falcor-path-syntax';
import InvalidateResponse from 'falcor/lib/response/InvalidateResponse';

class ObservableModelResponse extends Observable {
    constructor(source) {
        super();
        this.source = source;
    }
    lift(operator) {
        const response = new ObservableModelResponse(this);
        response.operator = operator;
        return response;
    }
    _toJSONG() {
        return new ObservableModelResponse(this.source._toJSONG());
    }
    progressively() {
        return new ObservableModelResponse(this.source.progressively());
    }
}

export class Model extends FalcorModel {
    /* implement inspect method for node's inspect utility */
    inspect() {
        return `{ v${this.getVersion()} ${JSON.stringify(this.getPath())} }`;
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
            } else {
                clone[key] = value;
            }
        }
        if (clone._path.length > 0) {
            clone.setCache = void 0;
        }
        return clone;
    }
}
