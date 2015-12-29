import { Model as FalcorModel } from 'falcor';
import { Observable } from 'rxjs/Observable';
import { SymbolShim } from 'rxjs/util/SymbolShim';
import parsePath from 'falcor-path-syntax';
import ModelResponse from 'falcor/lib/response/ModelResponse';
import InvalidateResponse from 'falcor/lib/response/InvalidateResponse';

ModelResponse.prototype[SymbolShim.observable] = function() {
    return this;
}

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
    get() {
        return new ObservableModelResponse(super.get.apply(this, arguments));
    }
    set() {
        return new ObservableModelResponse(super.set.apply(this, arguments));
    }
    call() {
        return new ObservableModelResponse(super.call.apply(this, arguments));
    }
    invalidate2(...args) {
        return new ObservableModelResponse(new InvalidateResponse(this, args.map((path) => {
            path = parsePath(path);
            if (!Array.isArray(path)) {
                throw new Error(`Invalid argument: ${path}`);
            }
            return path;
        })));
    }
    preload() {
        return new ObservableModelResponse(super.preload.apply(this, arguments));
    }
    getValue() {
        return new ObservableModelResponse(super.getValue.apply(this, arguments));
    }
    setValue() {
        return new ObservableModelResponse(super.setValue.apply(this, arguments));
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
