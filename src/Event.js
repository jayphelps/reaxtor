import { Subject } from 'rxjs/Subject';

export class Event extends Subject {

    constructor(destination, source) {
        super();
        this.source = source;
        this.destination = destination;
    }

    lift(operator) {
        const event = new Event(this.destination || this, this);
        event.operator = operator;
        return event;
    }

    next(value) {
        const { destination } = this;
        if (destination && destination.next) {
            destination.next(value);
        } else {
            super.next(value);
        }
    }

    error(err) {
        const { destination } = this;
        if (destination && destination.error) {
            this.destination.error(err);
        } else {
            super.error(err);
        }
    }

    complete() {
        const { destination } = this;
        if (destination && destination.complete) {
            this.destination.complete();
        } else {
            super.complete();
        }
    }

    unsubscribe() {
        this.source = null;
        this.observers = null;
        this.isStopped = true;
        this.destination = null;
        this.isUnsubscribed = true;
    }

    _subscribe(subscriber) {
        const { source } = this;
        return source ?
            source.subscribe(subscriber) :
            super._subscribe(subscriber) ;
    }

    stop() {
        return this.do((x) => x.stopPropagation());
    }

    clobber() {
        return this.do((x) => {
            x.preventDefault();
            x.stopPropagation();
        });
    }
}
