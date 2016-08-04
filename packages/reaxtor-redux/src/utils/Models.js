import { Observable, Subscriber } from 'rxjs';
import { tryCatch } from 'rxjs/util/tryCatch';
import { errorObject } from 'rxjs/util/errorObject';
import { default as pathSyntax } from 'reaxtor-falcor-syntax-path';

export class Models extends Observable {
    constructor(source, operator) {
        if (typeof source !== 'function') {
            super();
            source && (this.source = source);
            operator && (this.operator = operator);
        } else {
            super(source);
        }
    }
    static from(source) {
        return new Models(source);
    }
    lift(operator) {
        return new Models(this, operator);
    }
    deref(...keys) {
        if (keys.length === 1) {
            if (Array.isArray(keys[0])) {
                keys = keys[0];
            } else if(typeof keys[0] === 'string') {
                keys = keys[0];
                if (!isNaN(+keys)) {
                    keys = [keys];
                } else {
                    keys = pathSyntax(keys);
                }
            }
        }
        return (keys.length === 0 ? this : this.lift(new DerefOperator(keys)));
    }
}

class DerefOperator {
    constructor(keys) {
        this.keys = keys;
    }
    call(subscriber, source) {
        return source._subscribe(new DerefSubscriber(subscriber, this.keys));
    }
}

class DerefSubscriber extends Subscriber {
    constructor(destination, keys) {
        super(destination);
        this.keys = keys;
    }
    // warn(message, ...values) {
    //     const { depth, debug } = this;
    //     if (debug.enabled) {
    //         debug.color = 'black';
    //         debug.log = console.warn.bind(console);
    //         debug(`${pad(message, 10 + (depth * 4))} |---- ${values.join(' ')}`);
    //     }
    //     return values[values.length - 1];
    // }
    _next(arrayWrapper) {

        let keysIdx = -1;
        const { keys } = this;
        const count = keys.length - 1;
        let [model, props] = arrayWrapper;

        while (++keysIdx <= count) {

            const key = keys[keysIdx];

            if (props == null || typeof props !== 'object' || !props.hasOwnProperty(key)) {
                const _path = model._path.concat(keys.slice(keysIdx));
                // this.warn(`cache miss`, this.component.key);
                // if (model._path.length > 0) {
                //     this.warn(`from`, JSON.stringify(model._path));
                // }
                // this.warn(`attempted`, JSON.stringify(_path));
                props = undefined;
                model = model._clone({ _path });
                break;
            }

            const nextProps = props[key];
            const nextModel = tryCatch(model.deref).call(model, nextProps);
            if (nextModel === errorObject) {
                const { e } = errorObject;
                debugger;
                // this.warn('error', e && e.message || e);
                // this.warn('component', this.component.key);
                // if (model._path.length > 0) {
                //     this.warn('from', JSON.stringify(model._path));
                // }
                // this.warn('attempted', JSON.stringify(model._path.concat(keys.slice(keysIdx))));
                // this.warn('data', inspect(nextProps, { depth: null }));
                // this.warn('parent', inspect(props, { depth: null }));
                // this.warn('stack', e && e.stack || e);
                return this.destination.error(errorObject.e);
            }

            props = nextProps;
            model = nextModel;
        }

        super._next([model, props]);
    }
}
