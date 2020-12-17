const Calculator = require('./calculator.js');
var expect = require('chai').expect;

var calculator;
calculator = new Calculator();

it('Can add 2 numbers', () => {
    var answer = calculator.addNumbers(2, 2);
    expect(answer).to.equal(4);
});

it('Can subtract 2 numbers', () => {
    var answer = calculator.subtractNumbers(15, 5);
    expect(answer).to.equal(10);
});

it('Can multiply 2 numbers', () => {
    var answer = calculator.multiplyNumbers(4, 2);
    expect(answer).to.equal(8);
})

it('Can divide 2 numbers', () => {
    var answer = calculator.divideNumbers(10, 2);
    expect(answer).to.equal(5);
})

it('Can square a number', () => {
    var answer = calculator.squareNumber(10);
    expect(answer).to.equal(100);
})

it('Can raise num1 to power of num2', () => {
    var answer = calculator.powerNumber(4, 3);
    expect(answer).to.equal(64);
})