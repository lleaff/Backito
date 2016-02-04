/**
 * @param {Function} fn - Called on each item with the value, its index and
 *  the array.
 * @param {Function} callback - Called when every item in the array has been
 *  processed with the resulting array.
 */
module.exports = function asyncMap(array, fn, callback) {
    var newArr = [];
    var processedIndexes = [];
    array.forEach(function (val, i, arr) {
        fn(val, function(res) {
            newArr[i] = res;
            processedIndexes[i] = true;
            if (array.every((_, i) => processedIndexes[i]))
                callback(newArr);
        });
    });
}
