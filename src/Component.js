import pad from 'left-pad';
import _debug from 'debug';
import { inspect } from 'util';
import { Event } from './Event';
import { Changes } from './Changes';
import { Observable, Subscriber, BehaviorSubject } from 'rxjs';

const  { isArray } = Array;
import { isPromise } from 'rxjs/util/isPromise';
import { $$observable } from 'symbol-observable';

export class Component extends Observable {
    constructor(props) {

        super();

        const debug = _debug(`reaxtor:component`);
        const { index = 0, depth = 0, models, path = '' } = props;

        const log = (message, ...values) => {
            if (debug.enabled) {
                message = `${pad(message, 10 + (depth * 4))} |--- ${values.reduce((s, x) => (
                    s + typeof x === 'object' ? '%o' : '%s'
                ))}`
                debug(message, ...values);
            }
            return values[values.length - 1];
        };

        delete props.path;
        delete props.index;
        delete props.depth;
        delete props.models;

        const distinctModels = models.deref(path).distinctUntilChanged(
            (curr, next) => !this.shouldComponentUpdate(curr, next),
            (modelAndState) => log('update', this.mapUpdate(modelAndState[0], depth, index))
        );

        const componentState = distinctModels.scan(
            (componentState, modelAndState) => {
                componentState[0] = modelAndState[0];
                componentState[1] = { ...modelAndState[1] || {}, ...componentState[1] };
                return componentState;
            }, [null, props]
        );

        const modelsAndRemoteStates = componentState.switchMap(
            (componentState) => {
                log('loadProps', this.key);
                return convertToObservable(this.loadProps(...componentState));
            },
            (componentState, newRemoteState = {}) => {
                if (newRemoteState.json) { newRemoteState = newRemoteState.json; };
                componentState[1] = this.mapProps(componentState[1], newRemoteState);
                return componentState;
            }
        );

        const modelsAndLocalStates = modelsAndRemoteStates.switchMap(
            (componentState) => {
                log('loadState', this.key, componentState[1]);
                return convertToObservable(this
                    .loadState(...componentState), true)
                    .startWith(componentState[1])
            },
            (componentState, newLocalState = {}) => {
                if (newLocalState.json) { newLocalState = newLocalState.json };
                componentState[1] = this.mapState(componentState[1], newLocalState);
                return componentState;
            }
        );

        const modelsAndStates = Changes.from(modelsAndLocalStates, this, depth);

        const children = this.observe(modelsAndStates, depth);
        let childUpdates;

        if (typeof children === 'function') {
            childUpdates = modelsAndStates.switchMap(
                ((create, subjects, children) => {
                    return (componentState) => {
                        const active = this.deref(create, subjects, children, depth, ...componentState);
                        return (active.length === 0) ?
                            Observable.of(children = active) :
                            Observable.combineLatest(children = active);
                    };
                })(children, [], []),
                (componentState, children) => [componentState[1], ...children]
            );
        } else if (children && children.length > 0) {
            childUpdates = modelsAndStates.switchMapTo(
                Observable.combineLatest(children),
                (componentState, children) => [componentState[1], ...children]
            )
        } else {
            childUpdates = modelsAndStates.map((componentState) => [componentState[1]]);
        }

        const vDOMs = childUpdates.switchMap((xs) => {
            log('render', this.key, xs[0]);
            return convertToObservable(this.render(...xs));
        });

        this.source = vDOMs;
    }
    shouldComponentUpdate(currKey, nextKey) {
        return currKey !== nextKey;
    }
    mapUpdate(model, depth, index) {
        return (this.key =
            `{d: ${depth}, i: ${index}} ${model.inspect()} ${this.constructor.name}`);
    }
    loadProps(model, state) {}
    loadState(model, state) {}
    mapProps(curr, next) { return Object.assign(curr, next); }
    mapState(curr, next) { return Object.assign(curr, next); }
    observe(changes, depth) {}
    render() {
        return {
            sel: 'i', key: this.key,
            text: undefined, elm: undefined,
            data: undefined, children: undefined
        };
    }
    listen(name) {
        const subjects = this.subjects || (this.subjects = {});
        const subject = subjects[name] || (subjects[name] = new Event());
        subject.eventName = name;
        return subject;
    }
    dispatch(name, ...values) {
        const handlers = this.handlers || (this.handlers = {});
        const responder = values.length > 0 ?
            (event) => this.trigger(name, [event, ...values]) :
            (handlers[name] || (handlers[name] = this.trigger.bind(this, name)));
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
    deref(create, subjects, children, depth, model, state, ids = state) {

        const isRange = !Array.isArray(ids) && (
            ('from' in ids) || ('to' in ids)
        );
        const offset = isRange ? ids.from || 0 : 0;
        const to = isRange ? ids.to || (ids.length + 1) : ids.length || offset;

        let index = -1;
        let count = to - offset;

        while (++index <= count) {
            const key = isRange || index > to ?
                index + offset : ids !== state && ids[index] || index;
            if (!subjects[index]) {
                subjects[index] = new BehaviorSubject();
                const changes = Changes.from(subjects[index], { key }, depth + 1);
                children[index] = changes.component =
                    create(changes, state[key], key, index);
            }
        }

        index = count - 1;
        children.length = count;
        count = subjects.length;
        while (++index < count) {
            subjects[index].complete();
        }

        index = -1;
        count = subjects.length = children.length;
        while (++index < count) {
            subjects[index].next([model, state]);
        }

        return children;
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
