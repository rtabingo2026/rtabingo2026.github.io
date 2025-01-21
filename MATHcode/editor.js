import {Display} from "./display.js";
import {Equation} from "./equation.js";

window.Display = Display;

const blankEquation = () => {return {__proto__: Equation.placeholder, parent: null, selected: true}};
const Editor = {
	createEditor(equation, onSolve, freeVars, boundVars) {
		const editorElement = document.createElement("div");
		editorElement.classList.add("problem-editor");
		editorElement.tabIndex = -1;
		window.selectedInEquation = blankEquation();
		window.editorEquations = [equation, selectedInEquation];
		window.freeVars = freeVars;
		editorElement.addEventListener("keydown", (event) => {
			if (event.defaultPrevented) {
				return;
			}
			if (event.repeat) {
				return;
			}
			switch (event.key) {
				case "0":
				case "1":
				case "2":
				case "3":
				case "4":
				case "5":
				case "6":
				case "7":
				case "8":
				case "9":
					if (Equation.placeholder.isPrototypeOf(selectedInEquation)) {
						Object.setPrototypeOf(selectedInEquation, Equation.literal);
						selectedInEquation.literal = BigInt(event.key);
					} else if (Equation.literal.isPrototypeOf(selectedInEquation)) {
						selectedInEquation.literal = selectedInEquation.literal * 10n + BigInt(event.key);
					}
					break;
				case "A":
				case "B":
				case "C":
				case "D":
				case "E":
				case "F":
				case "G":
				case "H":
				case "I":
				case "J":
				case "K":
				case "L":
				case "M":
				case "N":
				case "O":
				case "P":
				case "Q":
				case "R":
				case "S":
				case "T":
				case "U":
				case "V":
				case "W":
				case "X":
				case "Y":
				case "Z":
				case "a":
				case "b":
				case "c":
				case "d":
				case "e":
				case "f":
				case "g":
				case "h":
				case "i":
				case "j":
				case "k":
				case "l":
				case "m":
				case "n":
				case "o":
				case "p":
				case "q":
				case "r":
				case "s":
				case "t":
				case "u":
				case "v":
				case "w":
				case "x":
				case "y":
				case "z":
					if (Equation.placeholder.isPrototypeOf(selectedInEquation)) {
						Object.setPrototypeOf(selectedInEquation, Equation.variable);
						selectedInEquation.name = event.key;
					} else if (Equation.variable.isPrototypeOf(selectedInEquation) || Equation.literal.isPrototypeOf(selectedInEquation)) {
						const newOperation = {__proto__: Equation.multiplication, left: selectedInEquation, right: {name: event.key, __proto__: Equation.variable}, parent: selectedInEquation.parent};
						if (selectedInEquation.parent) {
							newOperation.role = selectedInEquation.role;
							newOperation.parent[newOperation.role] = newOperation;
						} else {
							editorEquations.splice(-1, 1, newOperation);
						}
						newOperation.left.parent = newOperation.right.parent = newOperation;
						[newOperation.left.role, newOperation.right.role] = ["left", "right"];
						if (Equation.placeholder.isPrototypeOf(selectedInEquation)) break;
						delete selectedInEquation.selected;
						newOperation.selected = true;
						selectedInEquation = newOperation;
						break;
					}
					break;
				case "+": {
					const newOperation = {__proto__: Equation.addition, left: selectedInEquation, right: {__proto__: Equation.placeholder}, parent: selectedInEquation.parent};
					if (selectedInEquation.parent) {
						newOperation.role = selectedInEquation.role;
						newOperation.parent[newOperation.role] = newOperation;
					} else {
						editorEquations.splice(-1, 1, newOperation);
					}
					newOperation.left.parent = newOperation.right.parent = newOperation;
					[newOperation.left.role, newOperation.right.role] = ["left", "right"];
					if (Equation.placeholder.isPrototypeOf(selectedInEquation)) break;
					delete selectedInEquation.selected;
					newOperation.right.selected = true;
					selectedInEquation = newOperation.right;
					break;
				}
				case "-": {
					if (Equation.placeholder.isPrototypeOf(selectedInEquation)) {
						const newOperation = {__proto__: Equation.negate, inside: selectedInEquation, parent: selectedInEquation.parent};
						if (selectedInEquation.parent) {
							newOperation.role = selectedInEquation.role;
							newOperation.parent[newOperation.role] = newOperation;
						} else {
							editorEquations.splice(-1, 1, newOperation);
						}
						newOperation.inside.parent = newOperation;
						newOperation.inside.role = "inside";
						break;
					}
					const newOperation = {__proto__: Equation.subtraction, left: selectedInEquation, right: {__proto__: Equation.placeholder}, parent: selectedInEquation.parent};
					if (selectedInEquation.parent) {
						newOperation.role = selectedInEquation.role;
						newOperation.parent[newOperation.role] = newOperation;
					} else {
						editorEquations.splice(-1, 1, newOperation);
					}
					newOperation.left.parent = newOperation.right.parent = newOperation;
					[newOperation.left.role, newOperation.right.role] = ["left", "right"];
					delete selectedInEquation.selected;
					newOperation.right.selected = true;
					selectedInEquation = newOperation.right;
					break;
				}
				case "*": {
					const newOperation = {__proto__: Equation.multiplication, left: selectedInEquation, right: {__proto__: Equation.placeholder}, parent: selectedInEquation.parent};
					if (selectedInEquation.parent) {
						newOperation.role = selectedInEquation.role;
						newOperation.parent[newOperation.role] = newOperation;
					} else {
						editorEquations.splice(-1, 1, newOperation);
					}
					newOperation.left.parent = newOperation.right.parent = newOperation;
					[newOperation.left.role, newOperation.right.role] = ["left", "right"];
					if (Equation.placeholder.isPrototypeOf(selectedInEquation)) break;
					delete selectedInEquation.selected;
					newOperation.right.selected = true;
					selectedInEquation = newOperation.right;
					break;
				}
				case "/": {
					const newOperation = {__proto__: Equation.division, left: selectedInEquation, right: {__proto__: Equation.placeholder}, parent: selectedInEquation.parent};
					if (selectedInEquation.parent) {
						newOperation.role = selectedInEquation.role;
						newOperation.parent[newOperation.role] = newOperation;
					} else {
						editorEquations.splice(-1, 1, newOperation);
					}
					newOperation.left.parent = newOperation.right.parent = newOperation;
					[newOperation.left.role, newOperation.right.role] = ["left", "right"];
					if (Equation.placeholder.isPrototypeOf(selectedInEquation)) break;
					delete selectedInEquation.selected;
					newOperation.right.selected = true;
					selectedInEquation = newOperation.right;
					break;
				}
				case "^": {
					const newOperation = {__proto__: Equation.exp, base: selectedInEquation, power: {__proto__: Equation.placeholder}, parent: selectedInEquation.parent};
					if (selectedInEquation.parent) {
						newOperation.role = selectedInEquation.role;
						newOperation.parent[newOperation.role] = newOperation;
					} else {
						editorEquations.splice(-1, 1, newOperation);
					}
					newOperation.base.parent = newOperation.power.parent = newOperation;
					[newOperation.base.role, newOperation.power.role] = ["base", "power"];
					if (Equation.placeholder.isPrototypeOf(selectedInEquation)) break;
					delete selectedInEquation.selected;
					newOperation.power.selected = true;
					selectedInEquation = newOperation.power;
					break;
				}
				case "Backspace":
					if (Equation.literal.isPrototypeOf(selectedInEquation)) {
						selectedInEquation.literal = selectedInEquation.literal / 10n;
						if (selectedInEquation.literal === 0n) {
							Object.setPrototypeOf(selectedInEquation, Equation.placeholder);
							delete selectedInEquation.literal;
						}
					} else if (Equation.variable.isPrototypeOf(selectedInEquation)) {
						selectedInEquation.name = selectedInEquation.name.slice(0, -1);
						if (selectedInEquation.name === "") {
							Object.setPrototypeOf(selectedInEquation, Equation.placeholder);
							delete selectedInEquation.name;
						}
					} else if (Equation.placeholder.isPrototypeOf(selectedInEquation)) {
						if (selectedInEquation.parent === null) {
							break;
						}
						if ((selectedInEquation.parent.right ?? selectedInEquation.parent.power ?? selectedInEquation.parent.inside) !== selectedInEquation) {
							break;
						}
						delete selectedInEquation.selected;
						selectedInEquation = selectedInEquation.parent.left ?? selectedInEquation.parent.base ?? selectedInEquation.parent.inside;
						selectedInEquation.selected = true;
						if (selectedInEquation.parent.parent) {
							[selectedInEquation.parent, selectedInEquation.role] = [selectedInEquation.parent.parent, selectedInEquation.parent.role];
							selectedInEquation.parent[selectedInEquation.role] = selectedInEquation;
						} else {
							selectedInEquation.parent = null;
							editorEquations.splice(-1, 1, selectedInEquation);
						}
					} else if (Equation.parens.isPrototypeOf(selectedInEquation) || Equation.division.isPrototypeOf(selectedInEquation)) {
						Object.setPrototypeOf(selectedInEquation, Equation.placeholder);
						delete selectedInEquation.inside;
						delete selectedInEquation.left;
						delete selectedInEquation.right;
					} else if (Equation.multiplication.isPrototypeOf(selectedInEquation) && Equation.variable.isPrototypeOf(selectedInEquation.right)) {
						selectedInEquation.left.parent = selectedInEquation.parent;
						if (selectedInEquation.parent) {
							selectedInEquation.left.role = selectedInEquation.role;
							selectedInEquation.left.parent[selectedInEquation.left.role] = selectedInEquation.left;
						} else {
							editorEquations.splice(-1, 1, selectedInEquation.left);
						}
						selectedInEquation = selectedInEquation.left;
						selectedInEquation.selected = true;
					}
					break;
				case "ArrowLeft":
					delete selectedInEquation.selected;
					let rightmost;
					if (Equation.addition.isPrototypeOf(selectedInEquation) || Equation.subtraction.isPrototypeOf(selectedInEquation) || Equation.multiplication.isPrototypeOf(selectedInEquation) || Equation.division.isPrototypeOf(selectedInEquation)) {
						selectedInEquation = selectedInEquation.left;
						while (rightmost = selectedInEquation.right ?? selectedInEquation.power ?? selectedInEquation.inside) selectedInEquation = rightmost;
					} else if (Equation.exp.isPrototypeOf(selectedInEquation)) {
						selectedInEquation = selectedInEquation.base;
						while (rightmost = selectedInEquation.right ?? selectedInEquation.power ?? selectedInEquation.inside) selectedInEquation = rightmost;
					} else switch (selectedInEquation.role) {
						case null:
							break;
						case "left":
						case "base": {
							let rightSide = selectedInEquation;
							while (rightSide.role === "left" || rightSide.role === "base") rightSide = rightSide.parent;
							if (rightSide.parent === null) break;
							selectedInEquation = rightSide.parent;
							break;
						}
						case "right":
						case "power":
						case "inside":
							selectedInEquation = selectedInEquation.parent;
							break;
					}
					selectedInEquation.selected = true;
					break;
				case "ArrowRight":
					delete selectedInEquation.selected;
					let leftmost;
					if (Equation.addition.isPrototypeOf(selectedInEquation) || Equation.subtraction.isPrototypeOf(selectedInEquation) || Equation.multiplication.isPrototypeOf(selectedInEquation) || Equation.division.isPrototypeOf(selectedInEquation)) {
						selectedInEquation = selectedInEquation.right;
						while (leftmost = selectedInEquation.left ?? selectedInEquation.base) selectedInEquation = leftmost;
					} else if (Equation.exp.isPrototypeOf(selectedInEquation)) {
						selectedInEquation = selectedInEquation.power;
						while (leftmost = selectedInEquation.left ?? selectedInEquation.base) selectedInEquation = leftmost;
					} else if (Equation.parens.isPrototypeOf(selectedInEquation) || Equation.negate.isPrototypeOf(selectedInEquation)) {
						selectedInEquation = selectedInEquation.inside;
						while (leftmost = selectedInEquation.left ?? selectedInEquation.base) selectedInEquation = leftmost;
					} else switch (selectedInEquation.role) {
						case null:
							break;
						case "left":
						case "base":
							selectedInEquation = selectedInEquation.parent;
							break;
						case "right":
						case "power":
						case "inside": {
							let leftSide = selectedInEquation;
							while (leftSide.role === "right" || leftSide.role === "power" || leftSide.role === "inside") leftSide = leftSide.parent;
							if (leftSide.parent === null) break;
							selectedInEquation = leftSide.parent;
							break;
						}
					}
					selectedInEquation.selected = true;
					break;
				case "(":
					const newOperation = {__proto__: Equation.parens, inside: selectedInEquation, parent: selectedInEquation.parent};
					if (selectedInEquation.parent) {
						newOperation.role = selectedInEquation.role;
						newOperation.parent[newOperation.role] = newOperation;
					} else {
						editorEquations.splice(-1, 1, newOperation);
					}
					newOperation.inside.parent = newOperation;
					newOperation.inside.role = "inside";
					break;
				case "Enter":
				case "=": 
					const vars = new Map();
					freeVars.forEach((varName) => vars.set(varName, BigInt(Math.random() * 2**53)));
					Object.entries(boundVars).forEach((varPair) => vars.set(varPair[0], varPair[1]));
					if (editorEquations.at(-2).evaluate(vars).equals(editorEquations.at(-1).evaluate(vars)) && (document.querySelector("#steps").innerText = `Steps: ${++window.stepCount}`) && !onSolve(editorEquations.at(-1))) {
						delete selectedInEquation.selected;
						selectedInEquation = blankEquation();
						editorEquations.push(selectedInEquation);
					}
				default:
					// do nothing
			}
			editorElement.innerHTML = "";
			Display.render(editorElement, editorEquations.reduce((a, equation) => a.concat("=", ...equation.display(), Display.newline()), []));
			event.preventDefault();
		});
		Display.render(editorElement, editorEquations.reduce((a, equation) => a.concat("=", ...equation.display(), Display.newline()), []));
		return editorElement;
	}
};

export { Editor };