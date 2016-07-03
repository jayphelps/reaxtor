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
        let { index = 0, depth = 0, models } = props;

        delete props.index;
        delete props.depth;
        delete props.models;

        this.props = props;

        let indent = '';
        if (debug.enabled) {
            let indentIdx = 0;
            while (++indentIdx <= depth) {
                indent += '    ';
            }
            indent += '|---';
        }

        const modelsAndStates = models
            .distinctUntilChanged(
                (...args) => !this.shouldComponentUpdate(...args),
                (...args) => {
                    const nextKey = this.mapUpdate(...args, depth, index);
                    if (debug.enabled) {
                        debug(`   update ${indent} ${nextKey}`);
                    }
                    return nextKey;
                }
            )
            .switchMap(
                (model) => {
                    if (debug.enabled) {
                        debug(`loadProps ${indent} ${this.key}`);
                    }
                    return convertToObservable(this.loadProps(model));
                },
                (model, { json: state = {} } = {}) => {
                    let result = this.mapProps(model, state);
                    if (typeof result === 'undefined') {
                        return [model, state];
                    } else if (isArray(result)) {
                        if (result[0] !== model) {
                            result = [model, ...result];
                        }
                        if (typeof result[1] === 'undefined') {
                            result[1] = state;
                        }
                        return result;
                    } else {
                        return [model, state];
                    }
                }
            )
            .switchMap(
                (modelAndState) => {
                    if (debug.enabled) {
                        debug(`loadState ${indent} ${this.key} ${serializeStateWithIndent(indent, modelAndState[1])}`);
                    }
                    return convertToObservable(this
                        .loadState(...modelAndState), true)
                        .startWith(modelAndState[1]);
                },
                (modelAndState, newState) => {
                    let result = this.mapState(modelAndState[1], newState);
                    if (typeof result === 'undefined') {
                        result = { ...modelAndState[1], ...newState };
                    }
                    modelAndState[1] = result;
                    return modelAndState;
                }
            );

        const modelAndStateChanges = Changes.from(modelsAndStates, this, indent);

        const vDOMs = (convertToObservable(this
            .initialize(modelAndStateChanges, depth) || modelAndStateChanges))
            .switchMap((args) => {
                if (debug.enabled) {
                    debug(`   render ${indent} ${this.key} ${serializeStateWithIndent(indent, args[1])}`);
                }
                return convertToObservable(this.render(...args));
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
    loadProps(model) {}
    mapProps(model, props) {}
    loadState(model, state) {}
    mapState(state, newState) {}
    initialize(changes, depth) {}
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

    if ((/(\n|\r)/i).test(result)) {

        const spaces = '                     ';
        const indent2 = '       ';
        const indent3 = indent2 + indent.replace(/(\||\-)/ig, ' ');

        result = result.slice(1, -1);
        result = `\n${spaces}${indent2}{` +
        (`\n ${ result }`).replace(
            /(\n|\r)/ig,
            `\n${spaces}${indent3}`
        ) + `\n${spaces}${indent2}}\n`;
    }

    return result;
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
