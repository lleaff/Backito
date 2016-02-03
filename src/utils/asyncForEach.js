module.exports = function asyncForEach(array, fn, callback) {
    var processedIndexes = [];
    array.map(function (val, i, arr) {
        fn(val, _ => processedIndexes[i] = true);
        if (array.every((_, i) => processedIndexes[i]))
            callback(newArr);
    });
}
