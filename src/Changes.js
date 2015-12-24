import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
const  { isArray } = Array;

import { asap } from 'rxjs/scheduler/asap';
import { tryCatch } from 'rxjs/util/tryCatch';
import { Scheduler } from 'rxjs/Scheduler';
import { Subscriber } from 'rxjs/Subscriber';
import { errorObject } from 'rxjs/util/errorObject';

Observable.pairs = observablePairs;
Observable.prototype.inspectTime = inspectTime;
Observable.prototype.distinctUntilChanged = distinctUntilChanged;

export class Changes extends Observable {
    constructor(subscribe) {
        super(subscribe);
        this.subscribers = [];
        this.subscription = null;
    }
    static from(source) {
        const observable = new Changes();
        observable.source = source;
        return observable;
    }
    next(x) {
        const subscribers = this.subscribers.slice(0);
        const len = subscribers.length;
        let index = -1;
        while (++index < len) {
            subscribers[index].next(x);
        }
    }
    error(e) {
        const subscribers = this.subscribers.slice(0);
        this.subscribers = [];
        const len = subscribers.length;
        let index = -1;
        while (++index < len) {
            subscribers[index].error(e);
        }
    }
    complete() {
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
    deref(... keys) {
        return this.lift(new DerefOperator(isArray(keys[0]) ? keys[0] : keys));
    }
}

class DerefOperator {
    constructor(keys) {
        this.keys = keys;
    }
    call(subscriber) {
        return new DerefSubscriber(subscriber, this.keys);
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
        let { model, state } = update;

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

        super._next({ ... update, model, state });
    }
}

function observablePairs(obj) {
    return Observable.create(function subscribe(subscriber) {
        const arr = Array.isArray(obj);
        const keys = arr ? obj : Object.keys(obj);
        const count = keys.length;
        let index = -1;
        while (!subscriber.isUnsubscribed && ++index < count) {
            const key = arr ? index : keys[index];
            subscriber.next([key, obj[key]]);
        }
        subscriber.complete();
    });
}

function distinctUntilChanged(compare, keySelector) {
    return this.lift(new DistinctUntilChangedOperator(compare, keySelector));
}

class DistinctUntilChangedOperator {
    constructor(compare, keySelector) {
        this.compare = compare;
        this.keySelector = keySelector;
    }
    call(subscriber) {
        return new DistinctUntilChangedSubscriber(subscriber, this.compare, this.keySelector);
    }
}
class DistinctUntilChangedSubscriber extends Subscriber {
    constructor(destination, compare, keySelector) {
        super(destination);
        this.keySelector = keySelector;
        this.hasKey = false;
        if (typeof compare === 'function') {
            this.compare = compare;
        }
    }
    compare(x, y) {
        return x === y;
    }
    _next(value) {
        const keySelector = this.keySelector;
        let key = value;
        if (keySelector) {
            key = tryCatch(this.keySelector)(value);
            if (key === errorObject) {
                return this.destination.error(errorObject.e);
            }
        }
        let result = false;
        if (this.hasKey) {
            result = tryCatch(this.compare)(this.key, key);
            if (result === errorObject) {
                return this.destination.error(errorObject.e);
            }
        }
        else {
            this.hasKey = true;
        }
        if (Boolean(result) === false) {
            this.key = key;
            this.destination.next(value);
        }
    }
}

function inspectTime(delay, scheduler = asap) {
    return this.lift(new InspectTimeOperator(delay, scheduler));
}

class InspectTimeOperator {
    constructor(delay, scheduler) {
        this.delay = delay;
        this.scheduler = scheduler;
    }

    call(subscriber) {
        return new InspectTimeSubscriber(subscriber, this.delay, this.scheduler);
    }
}

class InspectTimeSubscriber extends Subscriber {

    constructor(destination, delay, scheduler) {
        super(destination);
        this.delay = delay;
        this.value = null;
        this.hasValue = false;
        this.scheduler = scheduler;
    }

    _next(value) {
        this.value = value;
        this.hasValue = true;
        if (!this.throttled) {
            this.add(this.throttled = this.scheduler.schedule(
                this.clearThrottle.bind(this), this.delay, this
            ));
        }
    }

    clearThrottle() {
        const { value, hasValue, throttled } = this;
        if (throttled) {
            throttled.unsubscribe();
            this.remove(throttled);
            this.throttled = null;
        }
        if (hasValue) {
            this.value = null;
            this.hasValue = false;
            this.destination.next(value);
        }
    }
}
