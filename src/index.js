/** @jsx hJSX */

import _debug from 'debug';
import falcor from 'falcor';
import Router from 'falcor-router';
import { Model } from './Model';
import { Event } from './Event';
import { Changes } from './Changes';
import { BehaviorSubject } from 'rxjs';
import { Component } from './Component';
import { html as hJSX } from 'snabbdom-jsx';

export { hJSX, Model, Event, Router, Component, falcor, reaxtor };

function reaxtor(RootClass, model, props = {}) {

    let debug;
    let working = false;
    let reenter = false;
    const { _root } = model;
    const array = [model, props];
    const models = new BehaviorSubject(array);
    const changes = Changes.from(models, { key: '' });
    const previousOnChangesCompleted = _root.onChangesCompleted;

    _root.onChangesCompleted = function() {
        if (working) { return reenter = true; }
        working = true;
        do {
            reenter = false;

            const topLevelModelVersion = (model = this).getVersion();

            debug = _debug(`reaxtor:lifecycle`);
            debug.color = _debug.colors[
                (topLevelModelVersion + _debug.colors.length) % _debug.colors.length
            ];

            debug(`- start ---| v${topLevelModelVersion}`);

            if (previousOnChangesCompleted) {
                previousOnChangesCompleted.call(this);
            }

            array[0] = model;
            array[1] = props;

            models.next(array);
        } while(reenter === true);
    };

    _root.onChangesCompleted.call(_root.topLevelModel);

    return new RootClass({ ...props, models: changes }).map((rootVDom) => {
        debug(`- end -----| v${model.getVersion()}`);
        working = false;
        array[0] = model;
        array[1] = rootVDom;
        return array;
    });
}
