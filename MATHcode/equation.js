import {Rational} from "./rational.js";

const Equation = {
	literal: {
		evaluate(vars) {
			return new Rational.constructor(this.literal);
		},
		display(considerParenthesizing) {
			const defaultDisplay = Rational.isPrototypeOf(this.literal) ? [Display.fraction([this.literal.numerator], [this.literal.denominator])] : [String(this.literal)]
			return this.selected ? [Display.selected(defaultDisplay)] : defaultDisplay;
		}
	},
	variable: {
		evaluate(vars) {
			return new Rational.constructor(vars.get(this.name) ?? Rational.nan);
		},
		display(considerParenthesizing) {
			const defaultDisplay = [String(this.name)];
			return this.selected ? [Display.selected(defaultDisplay)] : defaultDisplay;
		}
	},
	placeholder: {
		evaluate(vars) {
			return Rational.nan;
		},
		display(considerParenthesizing) {
			const defaultDisplay = ["..."];
			return this.selected ? [Display.selected(defaultDisplay)] : defaultDisplay;
		}
	},
	concealed: {
		evaluate(vars) {
			return this.inside.evaluate();
		},
		dispay(considerParenthesizing) {
			return ["???"];
		}
	},

	addition: {
		evaluate(vars) {
			return this.left.evaluate(vars).add(this.right.evaluate(vars));
		},
		display(considerParenthesizing) {
			const defaultDisplay = [...(considerParenthesizing ? ["("] : []), ...this.left.display(true), "+", ...this.right.display(true), ...(considerParenthesizing ? [")"] : [])];
			return this.selected ? [Display.selected(defaultDisplay)] : defaultDisplay;
		}
	},
	subtraction: {
		evaluate(vars) {
			return this.left.evaluate(vars).subtract(this.right.evaluate(vars));
		},
		display(considerParenthesizing) {
			const defaultDisplay = [...(considerParenthesizing ? ["("] : []), ...this.left.display(true), "-", ...this.right.display(true), ...(considerParenthesizing ? [")"] : [])];
			return this.selected ? [Display.selected(defaultDisplay)] : defaultDisplay;
		}
	},
	multiplication: {
		evaluate(vars) {
			return this.left.evaluate(vars).multiply(this.right.evaluate(vars));
		},
		display(considerParenthesizing) {
			const defaultDisplay = Equation.variable.isPrototypeOf(this.right) && !Equation.variable.isPrototypeOf(this.left) ?
				[...(Equation.exp.isPrototypeOf(this.parent) ? ["("] : []), ...this.left.display(true), ...this.right.display(), ...(Equation.exp.isPrototypeOf(this.parent) ? [")"] : [])]
			:
				[...(considerParenthesizing ? ["("] : []), ...this.left.display(true), "\u00b7", ...this.right.display(true), ...(considerParenthesizing ? [")"] : [])];
			return this.selected ? [Display.selected(defaultDisplay)] : defaultDisplay;
		}
	},
	division: {
		evaluate(vars) {
			return this.left.evaluate(vars).divide(this.right.evaluate(vars));
		},
		display(considerParenthesizing) {
			const defaultDisplay = [Display.fraction(this.left.display(), this.right.display())];
			return this.selected ? [Display.selected(defaultDisplay)] : defaultDisplay;
		}
	},
	exp: {
		evaluate(vars) {
			return this.base.evaluate(vars).power(this.power.evaluate(vars));
		},
		display(considerParenthesizing) {
			const defaultDisplay = [...this.base.display(true), Display.superscript(this.power.display(true))];
			return this.selected ? [Display.selected(defaultDisplay)] : defaultDisplay;
		}
	},

	parens: {
		evaluate(vars) {
			return this.inside.evaluate(vars);
		},
		display(considerParenthesizing) {
			const defaultDisplay = ["(", ...this.inside.display(), ")"];
			return this.selected ? [Display.selected(defaultDisplay)] : defaultDisplay;
		}
	},
	negate: {
		evaluate(vars) {
			return this.inside.evaluate(vars).negate();
		},
		display(considerParenthesizing) {
			const defaultDisplay = [...(considerParenthesizing ? ["("] : []), "-", ...this.inside.display(true), ...(considerParenthesizing ? [")"] : [])];
			return this.selected ? [Display.selected(defaultDisplay)] : defaultDisplay;
		}
	},

	equal: {
		validate(vars) {
			return this.left.evaluate(vars).equals(this.right.evaluate(vars));
		},
		display() {
			return [...this.left.display(), "=", ...this.right.display()];
		}
	}
};

export { Equation };