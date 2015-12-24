/** @jsx hJSX */
import { reaxtor, hJSX, Model, onChange } from './../../../';

import FalcorRouter from 'falcor-router';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/multicast';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/merge-static';

import snabbdom from 'snabbdom';
import sdClass from 'snabbdom/modules/class';
import sdProps from 'snabbdom/modules/props';
import sdStyle from 'snabbdom/modules/style';
import sdAttributes from 'snabbdom/modules/attributes';
import sdEventlisteners from 'snabbdom/modules/eventlisteners';

import { App } from './App';
import { Routes } from './Routes';

reaxtor(App,
    new Model({
        source: new (FalcorRouter.createClass(Routes()))()
    }).batch()._materialize().treatErrorsAsValues(),
    document.body.appendChild(document.createElement('div')),
    snabbdom.init([ sdClass, sdProps, sdStyle, sdAttributes, sdEventlisteners ])
)
.subscribe();
