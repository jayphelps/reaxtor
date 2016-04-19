import { Event } from './Event';
import { Changes } from './Changes';
import { isPromise } from 'rxjs/util/isPromise';
import { Observable } from 'rxjs/Observable';
import { $$observable } from 'rxjs/symbol/observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
const  { isArray } = Array;

export class Component extends Observable {
    constructor(attrs, createChild) {
        if (typeof attrs === 'function') {
            super(attrs);
        } else if(isObservable(attrs)) {
            super();
            this.models = attrs;
        } else {
            super();
            if (typeof attrs === 'object') {
                if (createChild && !this.createChild) {
                    this.createChild = createChild;
                }
                const models = attrs['models'];
                delete attrs['models'];
                for (const key in attrs) {
                    if (attrs.hasOwnProperty(key)) {
                        this[key] = attrs[key];
                    }
                }
                if (isObservable(models)) {
                    this.models = models;
                }
            }
        }
    }
    set models(m) {

        if (this.source) {
            this.source.unsubscribe();
        }

        if (this.subscription) {
            this.subscription.unsubscribe();
        }

        const updates = Changes.from(m
            .distinctUntilChanged(
                (...args) => !this.shouldComponentUpdate(...args),
                (...args) => this.key = this.mapModelToKey(...args)
            )
            .switchMap(
                (...args) => this.loader(...args),
                (...args) => this.mapDataToProps(...args)
            )
            // .do(() => console.log('updated', this.key))
            .switchMap((props) => this.events(props).startWith(props))
        );

        this.source = new ReplaySubject(1);

        this.subscription = this.createChildren(updates)
            .switchMap((...args) => toObservable(this.render(...args)), false)
            // .do(() => console.log('rendered', this.key))
            .subscribe(this.source);
    }
    createChildren(updates) {
        return updates;
    }
    loader(props) {
        return Observable.of({ json: {} });
    }
    events(props) {
        return Observable.of(props);
    }
    render(props) {
        return Observable.empty();
    }
    mapModelToKey([ model ]) {
        return `${name} ${model.inspect()}`;
    }
    shouldComponentUpdate(currKey, nextKey) {
        return currKey !== nextKey;
    }
    mapDataToProps([ model ], { json }) {
        return [ model, json ];
    }
    listen(name) {
        const subjects = this.subjects || (this.subjects = {});
        const subject = subjects[name] || (subjects[name] = new Event());
        subject.eventName = name;
        return subject;
    }
    dispatch(name) {
        const handlers = this.handlers || (this.handlers = {});
        const responder = handlers[name] || (handlers[name] = this.trigger.bind(this, name));
        responder.eventName = name;
        return responder;
    }
    trigger(name, value) {
        const subjects = this.subjects;
        if (subjects) {
            const subject = subjects[name];
            if (subject) {
                subject.next(value);
            }
        }
    }
    lift(operator) {
        const component = new Component();
        component.source = this;
        component.operator = operator;
        return component;
    }
}

function toObservable(ish, skipNull) {
    if (ish == null) {
        return skipNull ? Observable.empty() : Observable.of(ish);
    } else if(
        isArray(ish)      ||
        isPromise(ish)    ||
        isObservable(ish) ||
        typeof ish[$$observable] === 'function') {
        return ish;
    } else {
        return Observable.of(ish);
    }
}

function isObservable(ish) {
    if (ish && typeof ish === 'object') {
        return ish instanceof Observable;
    }
    return false;
}
