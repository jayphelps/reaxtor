import _debug from 'debug';
import falcor from 'falcor';
import Router from 'falcor-router';
import { BehaviorSubject } from 'rxjs';
import /*{ map } from*/ 'rxjs/add/operator/map';

export * from './Event';
export * from './Model';
export * from './Component';

export { falcor, Router, reaxtor };

function reaxtor(component, model, props = {}) {

    let working = false;
    let reenter = false;
    const debugEnd = _debug(`reaxtor:lifecycle`);
    const debugStart = _debug(`reaxtor:lifecycle`);
    const { _root } = model;
    const array = [model, component.props];
    const models = new BehaviorSubject(array);
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

            debugStart(`           start | v${topLevelModelVersion}`);

            if (previousOnChangesCompleted) {
                previousOnChangesCompleted.call(this);
            }

            array[0] = model;
            array[1] = component.props;

            models.next(array);
        } while(reenter === true);
    };

    _root.onChangesCompleted.call(_root.topLevelModel);

    return component.observe(models, 0, 0).map((vdom) => {
        debugEnd(`             end | v${model.getVersion()}`);
        working = false;
        array[0] = model;
        array[1] = vdom;
        return array;
    });
}
