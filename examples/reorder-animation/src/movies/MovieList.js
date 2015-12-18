/** @jsx hJSX */
import { Observable } from 'rxjs/Observable';
import { MovieItem } from './MovieItem';
import { hJSX, List, Event } from './../../../../';

import jsong from 'falcor-json-graph';
const $ref = jsong.ref;
const $pathValue = jsong.pathValue;

export class MovieList extends List {
    constructor(opts) {
        super(opts);
        this.sortBy = 'rank';
        this.updates = new Event();
        this.addMovie = new Event();
        this.layout.setGap(8);
    }
    itemRenderer() {
        return MovieItem;
    }
    suffixes(update, length) {
        return [ ['sortBy', { length }, ['rank', 'desc', 'title']] ];
    }
    derefItem({ model, index, json }) {
        json = json.sortBy[index];
        return { index, json, listModel: model, model: model.deref(json) };
    }
    render([{ json, model }, movieItems]) {

        const layout = this.layout;
        const updates = this.updates.switchMap(
            (sortBy) => model.set($pathValue(['sortBy'], $ref(['movies', sortBy]))),
            (sortBy, { json }) => sortBy
        );

        return Observable
            .of(this.sortBy)
            .merge(updates)
            .map((sortBy) => {
                const totalHeight = layout.end(layout.getLength() - 1);
                return (
                    <div className="movies">
                        <a class-btn={true} class-add={true}>Add</a>
                        <span class-btn-group={true}>
                            <a  on-click={() => updates.onNext(this.sortBy = 'rank') }
                                class={{ btn: true, rank: true, active: sortBy === 'rank' }}
                                >Rank</a>
                            <a  on-click={() => updates.onNext(this.sortBy = 'title') }
                                class={{ btn: true, title: true, active: sortBy === 'title' }}
                                >Title</a>
                            <a  on-click={() => updates.onNext(this.sortBy = 'desc') }
                                class={{ btn: true, desc: true, active: sortBy === 'desc' }}
                                >Description</a>
                        </span>
                        <div className="list" style={{ height: totalHeight+'px' }}>{
                            movieItems
                        }</div>
                    </div>
                );
            });
    }
}
