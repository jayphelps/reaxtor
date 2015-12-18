import jsong from 'falcor-json-graph';

const $ref = jsong.ref;
const $atom = jsong.atom;
const $pathValue = jsong.pathValue;
const $pathInvalidation = jsong.pathInvalidation;

export function MovieRoutes() {
    const moviesList = getMovies();
    let moviesSortKey = $ref(['movies', 'rank']);
    const moviesAndRefs = moviesList.map((movie, index) => {
        return { movie, ref: $ref(['moviesByIndex', index]) };
    });
    return [{
        route: `movies.length`,
        get() {
            return [$pathValue(['movies', 'length'], $atom(moviesList.length))];
        }
    }, {
        route: `movies.sortBy`,
        get() {
            return [$pathValue(['movies', 'sortBy'], moviesSortKey)];
        },
        set({ movies: { sortBy }}) {
            return [$pathValue(['movies', 'sortBy'], moviesSortKey = $ref(sortBy.value))];
        }
    }, {
        route: `movies[{keys:sortKeys}].length`,
        get({ sortKeys }) {
            return sortKeys.map((sortBy) => {
                return $pathValue(['movies', sortBy, 'length'], $atom(moviesList.length));
            });
        }
    }, {
        route: `movies[{keys:sortKeys}][{integers:movieIndexes}]`,
        get({ sortKeys, movieIndexes }) {
            return sortKeys.reduce((pathValues, sortBy) => {
                const movies = moviesAndRefs.concat().sort((a, b) => {
                    a = a.movie;
                    b = b.movie;
                    if (a[sortBy] > b[sortBy]) { return 1; }
                    if (a[sortBy] < b[sortBy]) { return -1; }
                    return 0;
                });
                return pathValues.concat(movieIndexes.map((index) => {
                    return $pathValue(['movies', sortBy, index], movies[index].ref);
                }));
            }, []);
        }
    }, {
        route: `moviesByIndex[{integers:movieIndexes}][{keys:movieKeys}]`,
        get({ movieIndexes, movieKeys }) {
            return movieIndexes.reduce((pathValues, movieIndex) => {
                const movie = moviesList[movieIndex];
                return movieKeys.reduce((pathValues, movieKey) => {
                    return pathValues.concat($pathValue(
                        ['moviesByIndex', movieIndex, movieKey],
                        movie[movieKey]
                    ));
                }, pathValues);
            }, []);
        },
        set(jsonGraph) {
            const pathValues = [];
            const { moviesByIndex } = jsonGraph;
            for (const movieIndex in moviesByIndex) {
                const movie = moviesList[movieIndex];
                const jsongMovie = moviesByIndex[movieIndex];
                for (const movieKey in jsongMovie) {
                    pathValues.push($pathValue(
                        ['moviesByIndex', movieIndex, movieKey],
                        movie[movieKey] = jsongMovie[movieKey]
                    ));
                }
            }
            return pathValues;
        },
        call({ movieIndexes, movieKeys }) {
            const index = movieIndexes[0];
            moviesList.splice(index, 1);
            moviesAndRefs.splice(index, 1);
            return [
                $pathInvalidation(['movies', 'sortBy']),
                $pathValue(['movies', 'length'], moviesList.length)
            ];
        }
    }];
}

function getMovies() {
    return [
        { rank: 1,  title: 'The Shawshank Redemption',                      desc: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.' },
        { rank: 2,  title: 'The Godfather',                                 desc: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.' },
        { rank: 3,  title: 'The Godfather: Part II',                        desc: 'The early life and career of Vito Corleone in 1920s New York is portrayed while his son, Michael, expands and tightens his grip on his crime syndicate stretching from Lake Tahoe, Nevada to pre-revolution 1958 Cuba.' },
        { rank: 4,  title: 'The Dark Knight',                               desc: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, the caped crusader must come to terms with one of the greatest psychological tests of his ability to fight injustice.' },
        { rank: 5,  title: 'Pulp Fiction',                                  desc: 'The lives of two mob hit men, a boxer, a gangster\'s wife, and a pair of diner bandits intertwine in four tales of violence and redemption.' },
        { rank: 6,  title: 'Schindler\'s List',                             desc: 'In Poland during World War II, Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.' },
        { rank: 7,  title: '12 Angry Men',                                  desc: 'A dissenting juror in a murder trial slowly manages to convince the others that the case is not as obviously clear as it seemed in court.' },
        { rank: 8,  title: 'The Good, the Bad and the Ugly',                desc: 'A bounty hunting scam joins two men in an uneasy alliance against a third in a race to find a fortune in gold buried in a remote cemetery.' },
        { rank: 9,  title: 'The Lord of the Rings: The Return of the King', desc: 'Gandalf and Aragorn lead the World of Men against Sauron\'s army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.' },
        { rank: 10, title: 'Fight Club',                                    desc: 'An insomniac office worker looking for a way to change his life crosses paths with a devil-may-care soap maker and they form an underground fight club that evolves into something much, much more...' },
    ];
}
