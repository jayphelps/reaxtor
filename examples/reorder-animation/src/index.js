/** @jsx hJSX */
import FalcorRouter from 'falcor-router';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/multicast';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/merge-static';
import 'rxjs/add/operator/throttleTime';

import { App } from './App';
import { MovieRoutes } from './movies/MovieRoutes';
import { reaxtor, hJSX, Model, Delegator } from './../../../';

const Router = FalcorRouter.createClass([]
    .concat(MovieRoutes())
);

const rootModel = new Model({
        source: new Router(),
        _allowFromWhenceYouCame: true
    })
    .batch()
    ._materialize()
    .treatErrorsAsValues();

const rootNode = document.body.appendChild(document.createElement('div'));

reaxtor(rootModel, App, rootNode)
    .do(console.log.bind(console, 'app next:'),
        console.error.bind(console, "app root error:"),
        console.log.bind(console, "app root completed.")
    )
    .multicast(new Subject())
    .connect();
