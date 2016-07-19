import pad from 'left-pad';
import _debug from 'debug';
import { inspect } from 'util';
import { tryCatch } from 'rxjs/util/tryCatch';
import { errorObject } from 'rxjs/util/errorObject';
import { default as pathSyntax } from 'falcor-path-syntax';
import { Observable, Subscriber, Subscription } from 'rxjs';

const  { isArray } = Array;

export class Changes extends Observable {
    constructor(subscribe) {
        super(subscribe);
        this.nextVal = null;
        this.errorVal = null;
        this.hasValue = false;
        this.hasError = false;
        this.subscribers = [];
        this.subscription = null;
        this.hasCompleted = false;
    }
    static from(source, component, depth = 0) {
        const changes = new Changes();
        changes.debug = _debug(`reaxtor:changes`);
        changes.source = source;
        changes.depth = depth;
        changes.component = component;
        return changes;
    }
    // lift(operator) {
    //     const changes = new Changes();
    //     changes.source = this;
    //     changes.debug = this.debug;
    //     changes.operator = operator;
    //     changes.indent = this.indent;
    //     changes.component = this.component;
    //     return changes;
    // }
    next(x) {
        this.nextVal = x;
        this.hasValue = true;
        const subscribers = this.subscribers.slice(0);
        const len = subscribers.length;
        let index = -1;
        while (++index < len) {
            subscribers[index].next(x);
        }
    }
    error(e) {
        this.errorVal = e;
        this.hasError = true;
        const subscribers = this.subscribers.slice(0);
        this.subscribers = [];
        const len = subscribers.length;
        let index = -1;
        while (++index < len) {
            subscribers[index].error(e);
        }
    }
    complete() {
        this.hasCompleted = true;
        const subscribers = this.subscribers.slice(0);
        this.subscribers = [];
        const len = subscribers.length;
        let index = -1;
        while (++index < len) {
            subscribers[index].complete();
        }
    }
    _subscribe(subscriber) {

        const { subscribers } = this;

        subscribers.push(subscriber);

        if (subscribers.length === 1) {
            this.subscription = this.source.subscribe(this);
        } else if (this.hasError) {
            subscriber.error(this.errorVal);
        } else if (this.hasCompleted) {
            subscriber.complete();
        } else if (this.hasValue) {
            subscriber.next(this.nextVal);
        }

        return new Subscription(() => {
            const index = subscribers.indexOf(subscriber);
            if (~index) { subscribers.splice(index, 1); }
            if (subscribers.length === 0) {
                const subscription = this.subscription;
                this.subscription = null;
                subscription.unsubscribe();
            }
        });
    }
    deref(...keys) {
        if (keys.length === 1) {
            if (isArray(keys[0])) {
                keys = keys[0];
            } else if(typeof keys[0] === 'string') {
                keys = keys[0].length === 0 ? keys[0] : pathSyntax(keys[0]);
            }
        }
        return (keys.length === 0 ? this : this
            .lift(new DerefOperator(keys, this.debug, this.depth, this.component))
        );
    }
}

class DerefOperator {
    constructor(keys, debug, depth, component) {
        this.keys = keys;
        this.debug = debug;
        this.depth = depth;
        this.component = component;
    }
    call(subscriber, source) {
        return source._subscribe(new DerefSubscriber(subscriber,
                                                     this.keys, this.debug,
                                                     this.depth, this.component));
    }
}

class DerefSubscriber extends Subscriber {
    constructor(destination, keys, debug, depth, component) {
        super(destination);
        this.keys = keys;
        this.debug = debug;
        this.depth = depth;
        this.component = component;
    }
    warn(message, ...values) {
        const { depth, debug } = this;
        if (debug.enabled) {
            debug.color = 'black';
            debug.log = console.warn.bind(console);
            debug(`${pad(message, 10 + (depth * 4))} |---- ${values.join(' ')}`);
        }
        return values[values.length - 1];
    }
    _next(update) {

        const keys = this.keys;
        const count = keys.length - 1;
        let [ model, state ] = update;
        let keysIdx = -1;

        while (++keysIdx <= count) {

            const key = keys[keysIdx];

            if (state == null || typeof state !== 'object' || !state.hasOwnProperty(key)) {
                const _path = model._path.concat(keys.slice(keysIdx));
                this.warn(`cache miss`, this.component.key);
                if (model._path.length > 0) {
                    this.warn(`from`, JSON.stringify(model._path));
                }
                this.warn(`attempted`, JSON.stringify(_path));
                model = model._clone({ _path });
                break;
            }

            const tmpState = state[key];
            const tmpModel = tryCatch(model.deref).call(model, tmpState);
            if (tmpModel === errorObject) {
                this.warn('error', e && e.message || e);
                this.warn('component', this.component.key);
                if (model._path.length > 0) {
                    this.warn('from', JSON.stringify(model._path));
                }
                this.warn('attempted', JSON.stringify(model._path.concat(keys.slice(keysIdx))));
                this.warn('data', inspect(tmpState, { depth: null }));
                this.warn('parent', inspect(state, { depth: null }));
                this.warn('stack', e && e.stack || e);
                // if (debug.enabled) {
                //     debug.color = 'black';
                //     debug.log = console.warn.bind(console);
                //     const { e } = errorObject;
                //     const { indent } = this;
                //     debug(`      error ${indent} ${e && e.message || e}
                //                           component ${indent} ${this.component.key} ${(model._path.length > 0) ? `
                //                                from ${indent} ${JSON.stringify(model._path)}` : ''}
                //                           attempted ${indent} ${JSON.stringify(model._path.concat(keys.slice(keysIdx)))}
                //                                data ${indent} ${inspect(tmpState, { depth: null })}
                //                              parent ${indent} ${inspect(state, { depth: null })}\n`,
                //         e && e.stack || e
                //     );
                // }
                return this.destination.error(errorObject.e);
            }

            state = tmpState;
            model = tmpModel;
        }

        super._next([model, state]);
    }
}
