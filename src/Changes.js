const  { isArray } = Array;

import { asap } from 'rxjs/scheduler/asap';
import { tryCatch } from 'rxjs/util/tryCatch';
import { Scheduler } from 'rxjs/Scheduler';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { errorObject } from 'rxjs/util/errorObject';
import { Subscription } from 'rxjs/Subscription';

import { default as pathSyntax } from 'falcor-path-syntax';

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
    static from(source) {
        const observable = new Changes();
        observable.source = source;
        return observable;
    }
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
                keys = pathSyntax(keys[0]);
            }
        }
        return this.lift(new DerefOperator(keys));
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
    _next(update) {

        const keys = this.keys;
        const count = keys.length;
        let keysIdx = -1;
        let [ model, state ] = update;

        while (++keysIdx < count) {
            const key = keys[keysIdx];
            if (!state.hasOwnProperty(key)) {
                return;
            }
            model = tryCatch(model.deref).call(model, state = state[key]);
            if (model === errorObject) {
                return this.destination.error(errorObject.e);
            }
        }

        update = update.slice(0);
        update[0] = model;
        update[1] = state;

        super._next(update);
    }
}
