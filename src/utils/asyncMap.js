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
