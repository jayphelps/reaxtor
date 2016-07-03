/** @jsx hJSX */

import _debug from 'debug';
import falcor from 'falcor';
import Router from 'falcor-router';
import { Model } from './Model';
import { Event } from './Event';
import { BehaviorSubject } from 'rxjs';
import { Component } from './Component';
import { Container } from './Container';
import { html as hJSX } from 'snabbdom-jsx';

export { hJSX, Model, Event, Router, Component, Container, falcor, reaxtor };

function reaxtor(RootClass, model, props = {}) {

    let working = false;
    let reenter = false;
    const debugEnd = _debug(`reaxtor:lifecycle`);
    const debugStart = _debug(`reaxtor:lifecycle`);
    const { _root } = model;
    const array = new Array(2);
    const models = new BehaviorSubject(model);
    const previousOnChangesCompleted = _root.onChangesCompleted;

    _root.onChangesCompleted = function() {
        if (working) { return reenter = true; }
        working = true;
        do {
            reenter = false;

            const topLevelModelVersion = (model = this).getVersion();

            debugStart.color = debugEnd.color = _debug.colors[
                (topLevelModelVersion + _debug.colors.length) % _debug.colors.length
            ];

            debugStart(`    start | v${topLevelModelVersion}`);

            if (previousOnChangesCompleted) {
                previousOnChangesCompleted.call(this);
            }

            models.next(model);
        } while(reenter === true);
    };

    _root.onChangesCompleted.call(_root.topLevelModel);

    return new RootClass({ ...props, models }).map((rootVDom) => {
        debugEnd(`      end | v${model.getVersion()}`);
        working = false;
        array[0] = model;
        array[1] = rootVDom;
        return array;
    });
}
