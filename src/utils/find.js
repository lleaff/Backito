var fs = require('fs');
var path = require('path');

function flatten(arr) {
    return arr.reduce((prev, y) => prev.concat(y), []);
}

module.exports = function findSync(name, o) {
    if (o === undefined) { o = {}; }
    else {
        if (o.maxdepth !== undefined) { o.maxdepth -= 1; }
        if (o.predicate !== undefined && !predicate(name)) { return []; }
    }
    var includeDirs = (o.type == undefined) ? true : (o.type === 'd');
    var includeFiles = (o.type == undefined) ? true : (o.type === 'f');
    var max = o.maxdepth === undefined ? false : o.maxdepth < 0;

    if (fs.statSync(name).isDirectory() && !max) {
        var files = fs.readdirSync(name);
        return (includeDirs ? [name] : []).concat(
            flatten(files.map(
            file => findSync(''+path.join(name, file), o))));
    } else {
        return includeFiles ? [name] : [];
    }
};
