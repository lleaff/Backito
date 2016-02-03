function asyncForEach(array, fn, callback) {
    var processedIndexes = [];
    array.map(function (val, i, arr) {
        fn(val, _ => processedIndexes[i] = true);
        if (array.all((_, i) => processedIndexes[i]))
            callback(newArr);
    });
}
