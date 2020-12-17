module.exports = class Calculator{
    constructor() {
        this.prices = new Object();
        this.items = new Object();
        this.discounts = new Object();
    }

    addNumbers(num1, num2) {
        return num1 + num2;
    }

    subtractNumbers(num1, num2) {
        return num1 - num2;
    }

    multiplyNumbers(num1, num2) {
        return num1 * num2;
    }

    divideNumbers(num1, num2) {
        return num1 / num2;
    }

    squareNumber(num1) {
        return Math.pow(num1, 2);
    }

    powerNumber(num1, num2) {
        return Math.pow(num1, num2);
    }
}