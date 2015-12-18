import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

Observable.prototype.distinctUntilChanged = distinctUntilChanged;

export class Changes extends Observable {
    constructor(subscribe) {
        super(subscribe);
        this.value = null;
        this.hasValue = false;
        this.subscribers = [];
        this.subscription = null;
    }
    static from(source) {
        const observable = new Changes();
        observable.source = source;
        return observable;
    }
    next(x) {
        this.value = x;
        this.hasValue = true;
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

        // if (this.hasValue) {
        //     subscriber.next(this.value);
        // }

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
        if (Array.isArray(keys[0])) {
            keys = keys[0];
        }
        return this.map(function deref({ model, json }) {
            return keys.reduce(({ model, json }, key) => {
                return {
                    json: json[key],
                    model: model.deref(json[key])
                };
            }, { model, json });
        });
    }
}

import { Subscriber } from 'rxjs/Subscriber';
import { tryCatch } from 'rxjs/util/tryCatch';
import { errorObject } from 'rxjs/util/errorObject';

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
