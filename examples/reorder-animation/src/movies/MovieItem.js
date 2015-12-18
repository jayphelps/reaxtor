/** @jsx hJSX */
import { Observable } from 'rxjs/Observable';
import { hJSX, Event, Component } from './../../../../';

import jsong from 'falcor-json-graph';
const $ref = jsong.ref;
const $atom = jsong.atom;
const $pathValue = jsong.pathValue;

export class MovieItem extends Component {
    constructor(opts) {
        super(opts);
        this.remove = new Event();
    }
    paths() {
        return [ [['rank', 'desc', 'title']] ];
    }
    render({ model, index, json: { rank, desc, title }}) {

        const layout = this.layout;
        const remove = this.remove;
        const update = this.update;

        return (
            <div key={rank} className="row" style={{
                    opacity: '0',
                    // transform: 'translate(-200px)',
                    delayed: {
                        opacity: '1',
                        transform: `translateY(${layout.start(index)}px)`
                    },
                    remove: {
                        opacity: '0',
                        transform: `translateY(${layout.start(index)}px) translateX(200px)`
                    }
                }}>
                <div style={{fontWeight: 'bold'}}>{rank}</div>
                <div>{title}</div>
                <div>{desc}</div>
                <div class={{ btn: true, 'rm-btn': true }} on-click={remove.onNext}>x</div>
            </div>
        );
    }
}
