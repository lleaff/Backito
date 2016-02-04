/**
 * @param {Function} fn - Called on each item with the value, its index and
 *  the array.
 * @param {Function} callback - Called once every item in the array has been
 *  processed.
 */
module.exports = function asyncForEach(array, fn, callback) {
    var processedIndexes = [];
    array.forEach(function (val, i, arr) {
        fn(val, function() {
            processedIndexes[i] = true;
            if (array.every((_, i) => processedIndexes[i]))
                callback();
        });
    });
}
