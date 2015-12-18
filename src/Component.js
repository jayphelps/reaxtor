import { Changes } from '../src/Changes';
import { isPromise } from 'rxjs/util/isPromise';
import { Observable } from 'rxjs/Observable';
import { SymbolShim } from 'rxjs/util/SymbolShim';

export class Component extends Observable {
    constructor(opts) {
        if (typeof opts === 'function') {
            super(opts);
        } else {
            super();
            if (typeof opts === 'object') {
                for (const key in opts) {
                    if (opts.hasOwnProperty(key)) {
                        this[key] = opts[key];
                    }
                }
            }
        }
    }
    operator() { return this; }
    lift(operator) {
        const component = new Component();
        component.source = this;
        component.operator = operator;
        return component;
    }
    get models() {
        return this.updates;
    }
    set models(updates) {
        this.updates = updates;
        this.changes = Changes.from(updates
            .distinctUntilChanged(
                (... args) => !this.shouldComponentUpdate(... args),
                (... args) => this.key = this.keySelector(... args)
            )
            .switchMap(
                (... args) => this.load(... args),
                (... args) => this.mapDataToState(... args)
            ));
        this.source  = this
            .initialize(this.changes)
            .map((... args) => this.render(... args))
            .switchMap(toObservable)
    }
    _subscribe(subscriber) {
        return this.source._subscribe(this.operator.call(subscriber));
    }
    initialize(changes) {
        return changes;
    }
    load(change) {
        const paths = this.paths(change);
        if (paths.length === 0) {
            return Observable.empty;
        }
        const { model } = change;
        return model.get(... paths);
    }
    render(change) {
        return Observable.empty;
    }
    paths(update) {
        return [];
    }
    mapDataToState({ model, index }, { json }) {
        return { model, index, json };
    }
    keySelector({ model }) {
        return model.getVersion() + ": " + JSON.stringify(model.getPath());
    }
    shouldComponentUpdate(currKey, nextKey) {
        return currKey !== nextKey;
    }
}

function toObservable(result) {
    if (result && typeof result === "object") {
        if (result instanceof Observable) {
            return result;
        } else if (isPromise(result)) {
            return result;
        } else if (typeof result[SymbolShim.observable] === 'function') {
            return result[SymbolShim.observable]();
        }
    }
    return Observable.of(result);
}
