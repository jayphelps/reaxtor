import { Event } from './Event';
import { Changes } from './Changes';
import { isPromise } from 'rxjs/util/isPromise';
import { Observable } from 'rxjs/Observable';
import { SymbolShim } from 'rxjs/util/SymbolShim';
import { ReplaySubject } from 'rxjs/subject/ReplaySubject';
const  { isArray } = Array;

export class Base extends Observable {
    constructor(attrs, children) {
        if (typeof attrs === 'function') {
            super(attrs);
        } else if(isObservable(attrs)) {
            super();
            this.models = attrs;
        } else {
            super();
            if (typeof attrs === 'object') {
                if (children && !this.children) {
                    this.children = children;
                }
                const models = attrs[models];
                delete attrs[models];
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

        if (this.subscription) {
            this.source = null;
            this.subscription.unsubscribe();
        }

        const updates = Changes.from(m
            .distinctUntilChanged(
                (... args) => !this.shouldComponentUpdate(... args),
                (... args) => this.key = this.selectKey(... args)
            )
            .switchMap(
                (... args) => this.loader(... args),
                (... args) => this.dataToProps(... args)
            )
        );

        this.source = new ReplaySubject(1);

        this.subscription = this.create(updates)
            .switchMap((... args) => this.events(... args))
            .switchMap((... args) => toObservable(this.render(... args)), false)
            .subscribe(this.source);
    }
    create(updates) {
        return updates;
    }
    loader(props) {
        return [props];
    }
    events(props) {
        return [props];
    }
    render(props) {
        return [];
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
    selectKey({ model }) {
        const path = model.getPath();
        const {name} = this.constructor;
        if (path.length === 0) {
            return `${name} v${model.getVersion()}`;
        }
        return `${name} [${path.join(', ')}] v${model.getVersion()}`;
    }
    shouldComponentUpdate(currKey, nextKey) {
        return currKey !== nextKey;
    }
    dataToProps(props, { json }) {
        return { ... props, state: { ... props.state, ... json }};
    }
    lift(operator) {
        const component = new Base();
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
        typeof ish[SymbolShim.observable] === 'function') {
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
