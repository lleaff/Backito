const ErrorUserInputName = 'ErrorUserInput';
function ErrorUserInput(message) {
    this.name = ErrorUserInputName;
    this.message = message || 'User input error';
    this.stack = (new Error()).stack;
}
ErrorUserInput.prototype = Object.create(Error.prototype);
ErrorUserInput.prototype.constructor = ErrorUserInput;
ErrorUserInput.name = ErrorUserInputName;

module.exports.userInput = ErrorUserInput;
