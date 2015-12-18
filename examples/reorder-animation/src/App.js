require('insert-css')(require('./App.css'), { prepend: true });

/** @jsx hJSX */
import { Observable } from 'rxjs/Observable';
import { MovieList } from './movies/MovieList';
import { hJSX, Component } from './../../../';

export class App extends Component {
    initialize(models) {
        return models.combineLatest(
            new MovieList({ models: models.deref('movies') }));
    }
    paths() {
        return [
            ['movies', 'sortBy', 'length']
        ];
    }
    render([{ json }, movieList]) {
        return Observable.of(
            <div className="application">{[
                <h1>Top 10 movies</h1>,
                movieList
            ]}</div>
        );
    }
}
