const Display = {
	render(e, content) {
		e.append(...content);
		return e;
	},
	equation(content) {
		const equationElement = document.createElement("span");
		equationElement.append(...content);
		equationElement.setAttribute("class", "equation");
		return equationElement;
	},
	superscript(content) {
		const sup = document.createElement("sup");
		return Display.render(sup, content);
	},
	fraction(numerator, denominator) {
		const fraction = document.createElement("div");
		fraction.setAttribute("class", "fraction");

		const fractionNumerator = Display.render(document.createElement("div"), numerator);
		fractionNumerator.setAttribute("class", "fraction-numerator");
		const fractionDenominator = Display.render(document.createElement("div"), denominator);
		fractionDenominator.setAttribute("class", "fraction-denominator");

		fraction.append(fractionNumerator, fractionDenominator);
		return fraction;
	},
	newline() {
		return document.createElement("br");
	},
	selected(content) {
		const selectionSpan = document.createElement("span");
		selectionSpan.classList.add("bg-success-subtle", "d-inline-block", "lh-base");
		return Display.render(selectionSpan, content);
	}
};

export { Display };