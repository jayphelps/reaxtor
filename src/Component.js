import { Event } from './Event';
import { Changes } from './Changes';
import { Subscriber } from 'rxjs/Subscriber';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

const  { isArray } = Array;
import { isPromise } from 'rxjs/util/isPromise';
import { $$observable } from 'symbol-observable';

export class Component extends Observable {
    constructor(props, createChild) {

        super();

        let { index, models } = props;
        delete props.index;
        delete props.models;

        this.index = index || 0;

        for (const key in props) {
            if (props.hasOwnProperty(key)) {
                this[key] = props[key];
            }
        }

        if (createChild) {
            this.createChild = createChild;
        }

        const modelsAndStates = models
            .distinctUntilChanged(
                (...args) => !this.shouldComponentUpdate(...args),
                (...args) => this.mapUpdate(...args)
            )
            .switchMap(
                (model) => convertToObservable(
                    this.loadProps(model) || { json: { }}),
                (model, props) => (
                    this.mapProps(model, props) || [model, props.json])
            )
            .switchMap(
                (modelAndState) => convertToObservable(this
                    .loadState(...modelAndState), true)
                    .startWith(modelAndState[1]),
                (modelAndState, newState) => ((modelAndState[1] =
                    this.mapState(modelAndState[1], newState) || {
                    ...modelAndState[1], ...newState
                }) && modelAndState || modelAndState)
            );

        const modelAndStateChanges = Changes.from(modelsAndStates);

        const vDOMs = (convertToObservable(this
            .initialize(modelAndStateChanges) || modelAndStateChanges))
            .switchMap((args) => convertToObservable(
                this.render(...args)));

        this.source = vDOMs;
    }
    shouldComponentUpdate(currKey, nextKey) {
        return currKey !== nextKey;
    }
    mapUpdate(model) {
        return (this.key =
            `${this.constructor.name} ${this.index} ${model.inspect()}`);
    }
    loadProps(model) {
    }
    mapProps(model, props) {
    }
    loadState(model, state) {
    }
    mapState(state, newState) {
    }
    initialize(changes) {
    }
    render() {
        return Observable.empty();
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
}

function convertToObservable(ish, skipNulls) {
    if (ish == null) {
        if (skipNulls) {
            return Observable.empty();
        }
        return Observable.of(ish);
    } else if (ish instanceof Observable ||
        isArray(ish) || isPromise(ish)) {
        return ish;
    } else if (typeof ish[$$observable] === 'function') {
        return ish[$$observable]();
    } else if (typeof ish.subscribe === 'function') {
        return Observable.from(ish);
    } else {
        return Observable.of(ish);
    }
}
