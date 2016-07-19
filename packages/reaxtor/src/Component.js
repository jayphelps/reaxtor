const  { isArray } = Array;
import _debug from 'debug';
import { inspect } from 'util';

import { Event } from './Event';
import { Changes } from './Changes';
import { Observable, BehaviorSubject } from 'rxjs';
import /*{ of } from*/ 'rxjs/add/observable/of';
import /*{ from } from*/ 'rxjs/add/observable/from';
import /*{ empty } from*/ 'rxjs/add/observable/empty';
import /*{ combineLatest } from*/ 'rxjs/add/observable/combineLatest';

import /*{ scan } from*/ 'rxjs/add/operator/scan';
import /*{ startWith } from*/ 'rxjs/add/operator/startWith';
import /*{ switchMap } from*/ 'rxjs/add/operator/switchMap';
import /*{ switchMapTo } from*/ 'rxjs/add/operator/switchMapTo';
import /*{ distinctUntilChanged } from*/ 'rxjs/add/operator/distinctUntilChanged';

export class Component extends Observable {
    constructor (data, children = []) {
        super();
        // If this Component was created via snabbdom JSX, aggregate
        // all the containers that can hold props data.
        const { dataset = {}, parent,
                depth = 0, index = 0,
                attrs = {}, props = {} } = data;
        delete data.attrs;
        delete data.props;
        delete data.depth;
        delete data.index;
        delete data.parent;
        delete data.dataset;
        if (typeof data.render === 'function') {
            this.render = data.render;
            delete data.render;
        }
        if (children.length === 1) {
            const head = children[0];
            if (typeof head === 'function') {
                this.render = children.pop();
            } else if (typeof head.item === 'function' && typeof head.render === 'function') {
                children.pop();
                this.item = head.item;
                this.render = head.render;
            }
        }
        this.depth = depth;
        this.index = index;
        this.parent = parent;
        this.props = { ...data, ...attrs, ...props, ...dataset };
        this.children = children;
    }
    observe(parent, depth = 0, index = 0) {

        const debug = _debug(`reaxtor:component`);
        const { props, props: { path = [] }, children } = this;
        const hasDynamicChildren = typeof this.item === 'function';

        let indent = '';
        if (debug.enabled) {
            let indentIdx = 0;
            while (++indentIdx <= depth) {
                indent += '    ';
            }
            indent += '|---';
        }

        const modelsAndState = Changes.from(parent, this, indent).deref(path);

        const distinctModelsAndState = modelsAndState.distinctUntilChanged(
            (currKey, nextKey) => !this.shouldComponentUpdate(currKey, nextKey),
            (modelsAndState) => {
                const nextKey = this.mapUpdate(modelsAndState[0], depth, index);
                if (debug.enabled) { debug(`     will update ${indent} ${nextKey}`); }
                return nextKey;
            }
        );

        const componentState = distinctModelsAndState.scan(
            (componentState, modelsAndState) => {
                componentState[0] = modelsAndState[0];
                componentState[1] = { ...modelsAndState[1], ...componentState[1] };
                return componentState;
            }, [null, props]
        );

        const modelAndRemoteState = componentState.switchMap(
            (componentState) => {
                if (debug.enabled) { debug(`get remote state ${indent} ${this.key}`); }
                return convertToObservable(this.getRemote(...componentState));
            },
            (componentState, newRemoteState = {}) => {
                if (newRemoteState.json) { newRemoteState = newRemoteState.json; };
                componentState[1] = this.mapRemoteState(componentState[1], newRemoteState);
                return componentState;
            }
        );

        const modelAndLocalState = modelAndRemoteState.switchMap(
            (componentState) => {
                if (debug.enabled) { debug(`get events state ${indent} ${this.key} ${serializeStateWithIndent(indent, componentState[1])}`); }
                return convertToObservable(this
                    .getEvents(...componentState), true)
                    .startWith(componentState[1])
            },
            (componentState, newLocalState = {}) => {
                if (newLocalState.json) { newLocalState = newLocalState.json };
                componentState[1] = this.mapEventsState(componentState[1], newLocalState);
                return componentState;
            }
        );

        const updateChildren = hasDynamicChildren ? (
            (subjects, children) => {
                return (componentState) => {
                    const active = this.deref(subjects, children, depth, ...componentState);
                    return (active.length === 0) ?
                        Observable.of(children = active) :
                        Observable.combineLatest(children = active);
                };
            })([], []) : (
            (children) => {
                return () => Observable.combineLatest(children);
            })(children.map((child, index) => (
                child.observe(modelAndLocalState, depth + 1, index))
            ));

        const childUpdates = modelAndLocalState.switchMap(updateChildren, (componentState, children) => [
            ...componentState, ...children
        ]);

        const vDOMs = childUpdates.switchMap((xs) => {
            if (debug.enabled) { debug(`     will render ${indent} ${this.key} ${serializeStateWithIndent(indent, xs[1])}`); }
            return convertToObservable(this.render(...xs.slice(1)));
        });

        return vDOMs;
    }
    shouldComponentUpdate(currKey, nextKey) {
        return currKey !== nextKey;
    }
    getRemote(model, props) {
        const { keys = null } = props;
        if (!keys) {
            return undefined;
        } else if (typeof keys === 'string') {
            return model.get(keys);
        } else if (isArray(keys)) {
            return model.get(...keys);
        }
        return undefined;
    }
    getEvents(model, props) {
        return undefined;
    }
    render(props, ...children) {
        return {
            sel: 'i', key: this.key,
            text: undefined, elm: undefined,
            data: undefined, children: children
        };
    }
    mapUpdate(model, depth, index) {
        return (this.key =
            `{d: ${depth}, i: ${index}} ${model.inspect()} ${this.name || this.constructor.name}`);
    }
    mapRemoteState(currState, nextState) {
        return Object.assign(currState, nextState);
    }
    mapEventsState(currState, nextState) {
        return Object.assign(currState, nextState);
    }
    deref(subjects, children, depth, _model, _state, ids = _state) {

        const isRange = !isArray(ids) && (('from' in ids) || ('to' in ids));
        const offset = isRange ? ids.from || 0 : 0;
        const to = isRange ? ids.to || (ids.length + 1) : ids.length || offset;

        let index = -1;
        let count = to - offset;

        while (++index <= count) {
            const key = isRange || index > to ?
                index + offset :
                ids !== _state && ids[index] || index;
            if (!subjects[index]) {
                children[index] = this
                    .item(_state[key], key, index)
                    .observe(
                        subjects[index] = new BehaviorSubject(),
                        depth + 1, index
                    );
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
            subjects[index].next([_model, _state]);
        }

        return children;
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

function serializeStateWithIndent(indent, state) {

    let result = inspect(state, { depth: null });

    // if ((/(\n|\r)/i).test(result)) {

        const spaces = '                     ';
        const indent2 = '       ';
        const indent3 = indent2 + indent.replace(/(\||\-)/ig, ' ');

        result = result.slice(1, -1);
        result = `\n${spaces}${indent2}{` +
        (`\n ${ result }`).replace(
            /(\n|\r)/ig,
            `\n${spaces}${indent3}`
        ) + `\n${spaces}${indent2}}\n`;
    // }

    return result;
}

import { isPromise } from 'rxjs/util/isPromise';
import { $$observable } from 'symbol-observable';

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
