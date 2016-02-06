module.exports = function ifElseErr(callback, errCallback) {
    return function (err) {
        if (err && errCallback) { errCallback.apply(this, arguments); }
        else { callback && callback.apply(this, arguments); }
    };
};
