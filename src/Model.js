import falcor from 'falcor';
import { Observable } from 'rxjs/Observable';
import parsePath from 'falcor-path-syntax';
import InvalidateResponse from 'falcor/lib/response/InvalidateResponse';


class ReaxtorModel extends falcor.Model {
    /* implement inspect method for node's inspect utility */
    inspect() {
        return '{' + this.getPath() + '}';
    }
    get() {
        return Observable.defer(_ => super.get.apply(this, arguments));
    }
    set() {
        return Observable.defer(_ => super.set.apply(this, arguments));
    }
    call() {
        return Observable.defer(_ => super.call.apply(this, arguments));
    }
    invalidate2(...args) {
        return Observable.defer(_ => new InvalidateResponse(this, args.map((path) => {
            path = parsePath(path);
            if (!Array.isArray(path)) {
                throw new Error(`Invalid argument: ${path}`);
            }
            return path;
        })));
    }
    preload() {
        return Observable.defer(_ => super.preload.apply(this, arguments));
    }
    getValue() {
        return Observable.defer(_ => super.getValue.apply(this, arguments));
    }
    setValue() {
        return Observable.defer(_ => super.setValue.apply(this, arguments));
    }
    _clone(opts) {
        const clone = new ReaxtorModel(this);
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

export function Model(opts) {
    return new ReaxtorModel(opts);
}
