function asyncMap(array, fn, callback) {
    var newArr = [];
    var processedIndexes = [];
    array.map(function (val, i, arr) {
        newArr[i] = fn(val, _ => processedIndexes[i] = true);
        if (array.all((_, i) => processedIndexes[i]))
            callback(newArr);
    });
}
