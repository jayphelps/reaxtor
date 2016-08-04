var parser = require('./parser');
var template = require('./template');

module.exports = toPathMap;

function toPathMap() {
    return parser.parse(template.apply(null, arguments));
}
