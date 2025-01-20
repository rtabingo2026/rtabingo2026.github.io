const Rational = {
	constructor: function (numerator, denominator=1n) {
		if (Rational.isPrototypeOf(numerator)) {
			return numerator
		}
		this.numerator = numerator;
		this.denominator = denominator;
		this.simplify();
	},
	simplify() {
		if (this.isNaN()) return;
		let a = this.numerator, b = this.denominator;
		while (b !== 0n) [a, b] = [b, a % b];
		this.numerator /= a < 0n ? -a : a;
		this.denominator /= a < 0n ? -a : a;
	},

	add(other) {
		return new Rational.constructor((this.numerator * other.denominator + other.numerator * this.denominator), this.denominator * other.denominator);
	},
	subtract(other) {
		return new Rational.constructor((this.numerator * other.denominator - other.numerator * this.denominator), this.denominator * other.denominator);
	},
	multiply(other) {
		return new Rational.constructor(this.numerator * other.numerator, this.denominator * other.denominator);
	},
	divide(other) {
		return new Rational.constructor(this.numerator * other.denominator, this.denominator * other.numerator);
	},
	power(other) {
		other.simplify();
		if (other.denominator !== 1n) throw new Error("Non-integer power given.");
		let power = 0n;
		let result = new Rational.constructor(1n);
		while (power !== other.numerator) {
			if (other.numerator > 0n) {
				result = result.multiply(this); power++
			} else {
				result = result.divide(this); power--
			}
		}
		return result;
	},
	
	negate() {
		return new Rational.constructor(-this.numerator, this.denominator);
	},

	isNaN() {
		return (this.denominator === 0n);
	},
	equals(other) {
		this.simplify();
		other.simplify();
		return this.numerator === other.numerator && this.denominator === other.denominator;
	}
};

Rational.constructor.prototype = Rational; // Other programmers might take this as a sign to not use prototypes here
Rational.nan = new Rational.constructor(0n, 0n);

export { Rational };