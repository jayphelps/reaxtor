var toPaths = require('./lib/toPaths');
var toPathMap = require('./lib/toPathMap');
var range = { from: 10, to: 9 };
var inspect = require('util').inspect;

var filter = 'all';

console.log(toPaths`{
    input: { value },
    tasks: {
        filter, length,
        ['${filter}-todos']: {
            length
        }
    }
}`);

expect(getExpectedPaths(), toPaths`{
    genreLists: {
        length,
        [10..1]: {
            name,
            rating,
            titles: {
                length,
                [${range}]: {
                    name,
                    rating,
                    box-shot
                }
            }
        }
    }
}`);

expect(getExpectedPathMap(), toPathMap`{
    genreLists: {
        length,
        [10..1]: {
            name,
            rating,
            titles: {
                length,
                [${range}]: {
                    name,
                    rating,
                    box-shot
                }
            }
        }
    }
}`);

function expect(expected, actual) {
    if (JSON.stringify(expected) !== JSON.stringify(actual)) {
        throw new Error(`expected \n${
            inspect(actual, { depth: null })
        } \nto equal \n${
            inspect(expected, { depth: null })
        }`);
    } else {
        console.log(`success:\n${inspect(actual, { depth: null })}`);
    }
}

function getExpectedPaths() {
    return [
        ['genreLists', { from: 1, length: 10 }, 'titles', { from: 9, length: 2 }, ['name', 'rating', 'box-shot']],
        ['genreLists', { from: 1, length: 10 }, 'titles', 'length'],
        ['genreLists', { from: 1, length: 10 }, ['name', 'rating']],
        ['genreLists', 'length']
    ];
}

function getExpectedPathMap() {
    return {
        '0': {
            '1': {
                '2': {
                    '1': {
                        '$keys': ['name', 'rating', 'box-shot']
                    },
                    '$keys': ['length', {
                        from: 9,
                        length: 2
                    }]
                },
                '$keys': ['name', 'rating', 'titles']
            },
            '$keys': ['length', {
                from: 1,
                length: 10
            }]
        },
        '$keys': ['genreLists']
    };
}
