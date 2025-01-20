import {Rational} from "./rational.js";
import {Equation} from "./equation.js";
import {Display} from "./display.js";
import {Editor} from "./editor.js";


const Problem = {
	loadProblem(e) {
		e.innerHTML = "";
		const problemText = document.createElement("div");
		problemText.classList.add("problem-text");
		Display.render(problemText, this.problemText);
		const equationEditor = Editor.createEditor(this.problemEquation, this.onSolve, this.varsUsed);
		e.append(problemText, equationEditor);
	}
};

const next_problem = () => {
	const next = currentProblemSet.next();
	if (next.done) return true;
	next.value.loadProblem(document.querySelector("#problem"));
	document.querySelector(".problem-editor").focus();
	return true;
};

const loadProblemSet = (problemSet) => {
	window.currentProblemSetName = problemSet.name;
	window.currentProblemSet = problemSet.problems.values();
	document.querySelector("#score").classList.replace("d-none", "d-flex");
	window.startTime = Date.now();
	window.timer = setInterval(() => {
		document.querySelector("#time").innerText = `Time: ${((Date.now() - window.startTime)/1000).toFixed(1)}s`;
	}, 1)
	window.stepCount = 0;
	document.querySelector("#problem-sets").classList.replace("d-flex", "d-none");
	next_problem();
}

const finishProblemSet = () => {
	if (window.currentProblemSetName) {
		const currentSaved = JSON.parse(localStorage.getItem(window.currentProblemSetName)) ?? {first: {time: Date.now() - window.startTime, steps: window.stepCount}, best: {time: Date.now() - window.startTime, steps: window.stepCount}}
		if (window.timer) clearInterval(window.timer);
		if (Date.now() - window.startTime < currentSaved.best.time) currentSaved.best.time = Date.now() - window.startTime;
		if (window.stepCount < currentSaved.best.steps) currentSaved.best.steps = window.stepCount;
		localStorage.setItem(window.currentProblemSetName, JSON.stringify(currentSaved));
	}
	window.currentProblemSet = null;
	window.currentProblemSetName = null;
	document.querySelector("#score").classList.replace("d-flex", "d-none");
	document.querySelector("#problem-sets").classList.replace("d-none", "d-flex");
	document.querySelector("#problem").innerHTML = ""
	document.querySelector("#problem-sets").innerHTML = "";
	for (const problemSet of problem_sets) {
		const column = document.createElement("div");
		column.classList.add("col-4", "my-2");
		const card = document.createElement("div");
		card.classList.add("card", "mx-2");
		const cardBody = document.createElement("div");
		cardBody.classList.add("card-body");
		const problemSetTitle = document.createElement("h2");
		problemSetTitle.classList.add("card-title", "fw-semibold", "mb-3");
		problemSetTitle.append(problemSet.name);
		const problemSetLength = document.createElement("p");
		problemSetLength.classList.add("card-text");
		problemSetLength.append(`Problems: ${problemSet.problems.length}`)
		const problemSetScores = document.createElement("table");
		problemSetScores.classList.add("table", "table-striped", "mx-auto");
		const scoreTableHead = document.createElement("thead");
		const scoreTableHeadRow = document.createElement("tr");
		const scoreTableHeadCells = [document.createElement("th"), document.createElement("th"), document.createElement("th")];
		scoreTableHeadCells[0].setAttribute("scope", "row");
		scoreTableHeadCells[0].append("Scores");
		scoreTableHeadCells[1].setAttribute("scope", "col");
		scoreTableHeadCells[1].append("First");
		scoreTableHeadCells[2].setAttribute("scope", "col");
		scoreTableHeadCells[2].append("Best");
		scoreTableHeadRow.append(...scoreTableHeadCells);
		scoreTableHead.append(scoreTableHeadRow);
		const scoreTableBody = document.createElement("tbody");
		const scoreTableTimeRow = document.createElement("tr");
		const scoreTableTimeCells = [document.createElement("th"), document.createElement("td"), document.createElement("td")];
		scoreTableTimeCells[0].setAttribute("scope", "row");
		scoreTableTimeCells[0].append("Time");
		scoreTableTimeCells[1].append(localStorage.getItem(problemSet.name) ? `${JSON.parse(localStorage.getItem(problemSet.name)).first.time.toFixed(1)}s` : "--");
		scoreTableTimeCells[2].append(localStorage.getItem(problemSet.name) ? `${JSON.parse(localStorage.getItem(problemSet.name)).best.time.toFixed(1)}s` : "--");
		scoreTableTimeRow.append(...scoreTableTimeCells);
		const scoreTableStepsRow = document.createElement("tr");
		const scoreTableStepsCells = [document.createElement("th"), document.createElement("td"), document.createElement("td")];
		scoreTableStepsCells[0].setAttribute("scope", "row");
		scoreTableStepsCells[0].append("Steps");
		scoreTableStepsCells[1].append(localStorage.getItem(problemSet.name) ? `${JSON.parse(localStorage.getItem(problemSet.name)).first.steps}` : "--");
		scoreTableStepsCells[2].append(localStorage.getItem(problemSet.name) ? `${JSON.parse(localStorage.getItem(problemSet.name)).best.steps}` : "--");
		scoreTableStepsRow.append(...scoreTableStepsCells);
		scoreTableBody.append(scoreTableTimeRow, scoreTableStepsRow);
		problemSetScores.append(scoreTableHead, scoreTableBody);
		const problemSetButton = document.createElement("a")
		problemSetButton.classList.add("d-block", "btn", "btn-success", "mx-auto");
		problemSetButton.onclick = () => {loadProblemSet(problemSet)};
		problemSetButton.append("Start");
		cardBody.append(problemSetTitle, problemSetLength, problemSetScores, problemSetButton);
		card.append(cardBody);
		column.append(card);
		document.querySelector("#problem-sets").append(column);
	}
}

const isInteger = (eq) => Equation.literal.isPrototypeOf(eq) || Equation.negate.isPrototypeOf(eq) && Equation.literal.isPrototypeOf(eq.inside);
const isRational = (eq) => isInteger(eq) || Equation.division.isPrototypeOf(eq) && isInteger(eq.left) && isInteger(eq.right);
const countVariable = (eq, variable) => Equation.variable.isPrototypeOf(eq) ? Number(eq.name === variable) :
	Equation.addition.isPrototypeOf(eq) || Equation.subtraction.isPrototypeOf(eq) || Equation.multiplication.isPrototypeOf(eq) || Equation.division.isPrototypeOf(eq) ? countVariable(eq.left, variable) + countVariable(eq.right, variable) :
	Equation.exp.isPrototypeOf(eq) ? countVariable(eq.base, variable) + countVariable(eq.power, variable) :
	Equation.parens.isPrototypeOf(eq) || Equation.negate.isPrototypeOf(eq) ? countVariable(eq.inside, variable) : 0

const problem_sets = [
	{
		name: "MTAP 2016",
		problems: [
			{
				__proto__: Problem,
				problemText: ["Simplify: ", Display.equation(["6(2)", Display.superscript("2"), "-(4-5)", Display.superscript("3")])],
				problemEquation: {left: {left: {literal: 6n, __proto__: Equation.literal}, right: {base: {literal: 2n, __proto__: Equation.literal}, power: {literal: 2n, __proto__: Equation.literal}, __proto__: Equation.exp}, __proto__: Equation.multiplication}, right: {base: {left: {literal: 4n, __proto__: Equation.literal}, right: {literal: 5n, __proto__: Equation.literal}, __proto__: Equation.subtraction}, power: {literal: 3n, __proto__: Equation.literal}, __proto__: Equation.exp}, __proto__: Equation.subtraction},
				varsUsed: [],
				onSolve: (eq) => (isRational(eq) && next_problem())
			},
			{
				__proto__: Problem,
				problemText: ["By how much is 3 - ", Display.fraction(["1"], ["3"]), " greater than ", Display.fraction(["1"], ["2"]), " - 2?"],
				problemEquation: {left: {left: {literal: 3n, __proto__: Equation.literal}, right: {literal: new Rational.constructor(1n, 3n), __proto__: Equation.literal}, __proto__: Equation.subtraction}, right: {left: {literal: new Rational.constructor(1n, 2n), __proto__: Equation.literal}, right: {literal: 2n, __proto__: Equation.literal}, __proto__: Equation.subtraction}, __proto__: Equation.subtraction},
				varsUsed: [],
				onSolve: (eq) => (isRational(eq) && next_problem())
			},
			{
				__proto__: Problem,
				problemText: ["What number is midway between 3 + ", Display.fraction(["1"], ["3"]), " and 2 - ", Display.fraction(["1"], ["3"]), "?"],
				problemEquation: {left: {left: {left: {literal: 3n, __proto__: Equation.literal}, right: {literal: new Rational.constructor(1n, 3n), __proto__: Equation.literal}, __proto__: Equation.addition}, right: {left: {literal: 2n, __proto__: Equation.literal}, right: {literal: new Rational.constructor(1n, 3n), __proto__: Equation.literal}, __proto__: Equation.subtraction}, __proto__: Equation.addition}, right: {literal: 2n, __proto__: Equation.literal}, __proto__: Equation.division},
				varsUsed: [],
				onSolve: (eq) => (isRational(eq) && next_problem())
			},
			{
				__proto__: Problem,
				problemText: ["Simplify: (2 - 5) \u00b7 (-", Display.fraction(["9"], ["8"]), ")-", Display.fraction(["3"], ["4"]), "(-2)"], // ??? why would you write a problem like that
				problemEquation: {left: {left: {left: {literal: 2n, __proto__: Equation.literal}, right: {literal: 5n, __proto__: Equation.literal}, __proto__: Equation.subtraction}, right: {inside: {literal: new Rational.constructor(9n, 8n), __proto__: Equation.literal}, __proto__: Equation.negate}, __proto__: Equation.multiplication}, right: {left: {literal: new Rational.constructor(3n, 4n), __proto__: Equation.literal}, right: {literal: -2n, __proto__: Equation.literal}, __proto__: Equation.multiplication}, __proto__: Equation.subtraction},
				varsUsed: [],
				onSolve: (eq) => (isRational(eq) && next_problem())
			},
			{
				__proto__: Problem,
				problemText: ["Simplify: (", Display.fraction(["7"], ["2"]), "+", Display.fraction(["5"], ["6"]), ")", Display.superscript("2"), " - (", Display.fraction(["7"], ["2"]), "-", Display.fraction(["5"], ["6"]), ")", Display.superscript("2")],
				problemEquation: {left: {base: {left: {literal: new Rational.constructor(7n, 2n), __proto__: Equation.literal}, right: {literal: new Rational.constructor(5n, 6n), __proto__: Equation.literal}, __proto__: Equation.addition}, power: {literal: 2n, __proto__: Equation.literal}, __proto__: Equation.exp}, right: {base: {left: {literal: new Rational.constructor(7n, 2n), __proto__: Equation.literal}, right: {literal: new Rational.constructor(5n, 6n), __proto__: Equation.literal}, __proto__: Equation.subtraction}, power: {literal: 2n, __proto__: Equation.literal}, __proto__: Equation.exp}, __proto__: Equation.subtraction},
				varsUsed: [],
				onSolve: (eq) => (isRational(eq) && next_problem())
			},
			{
				__proto__: Problem,
				problemText: ["Compute 24 \u00f7 ", Display.fraction(["1 + ", Display.fraction(["1"], ["5"])], ["2 - ", Display.fraction(["1"], ["3"])]), "."],
				problemEquation: {left: {literal: 24n, __proto__: Equation.literal}, right: {left: {left: {literal: 1n, __proto__: Equation.literal}, right: {literal: new Rational.constructor(1n, 5n), __proto__: Equation.literal}, __proto__: Equation.addition}, right: {left: {literal: 2n, __proto__: Equation.literal}, right: {literal: new Rational.constructor(1n, 3n), __proto__: Equation.literal}, __proto__: Equation.subtraction}, __proto__: Equation.division}, __proto__: Equation.division},
				varsUsed: [],
				onSolve: (eq) => (isRational(eq) && next_problem())
			},
			{
				__proto__: Problem,
				problemText: ["Subtract 5a − 2b + c from the sum of 3a + b − 2c and a − b + 3c."],
				problemEquation: {
					left: {
						left:
							{left: {left: {left: {literal: 3n, __proto__: Equation.literal}, right: {name: "a", __proto__: Equation.variable}, __proto__: Equation.multiplication}, right: {name: "b", __proto__: Equation.variable}, __proto__: Equation.addition}, right: {left: {literal: 2n, __proto__: Equation.literal}, right: {name: "c", __proto__: Equation.variable}, __proto__: Equation.multiplication}, __proto__: Equation.subtraction},
						right:
							{left: {left: {name: "a", __proto__: Equation.variable}, right: {name: "b", __proto__: Equation.variable}, __proto__: Equation.subtraction}, right: {left: {literal: 3n, __proto__: Equation.literal}, right: {name: "c", __proto__: Equation.variable}, __proto__: Equation.multiplication}, __proto__: Equation.addition},
						__proto__: Equation.addition
					},
					right:
						{left: {left: {left: {literal: 5n, __proto__: Equation.literal}, right: {name: "a", __proto__: Equation.variable}, __proto__: Equation.multiplication}, right: {left: {literal: 2n, __proto__: Equation.literal}, right: {name: "b", __proto__: Equation.variable}, __proto__: Equation.multiplication}, __proto__: Equation.subtraction}, right: {name: "c", __proto__: Equation.variable}, __proto__: Equation.addition},
					__proto__: Equation.subtraction
				},
				varsUsed: ["a", "b", "c"],
				onSolve: (eq) => (countVariable(eq, "a") === 1 && countVariable(eq, "b") === 1 && countVariable(eq, "c") === 0 && next_problem())
			},
			{
				__proto__: Problem,
				problemText: ["Three two-digit numbers have consecutive tens digits and have units digit all equal to 5. If the tens digit of the smallest number is n, what is the sum of the three numbers?"],
				problemEquation: {left: {left: {left: {literal: 10n, __proto__: Equation.literal}, right: {name: "n", __proto__: Equation.variable}, __proto__: Equation.multiplication}, right: {literal: 5n, __proto__: Equation.literal}, __proto__: Equation.addition}, right: {left: {left: {left: {literal: 10n, __proto__: Equation.literal}, right: {left: {name: "n", __proto__: Equation.variable}, right: {literal: 1n, __proto__: Equation.literal}, __proto__: Equation.addition}, __proto__: Equation.multiplication}, right: {literal: 5n, __proto__: Equation.literal}, __proto__: Equation.addition}, right: {left: {left: {literal: 10n, __proto__: Equation.literal}, right: {left: {name: "n", __proto__: Equation.variable}, right: {literal: 2n, __proto__: Equation.literal}, __proto__: Equation.addition}, __proto__: Equation.multiplication}, right: {literal: 5n, __proto__: Equation.literal}, __proto__: Equation.addition}, __proto__: Equation.addition}, __proto__: Equation.addition},
				varsUsed: ["n"],
				onSolve: (eq) => (countVariable(eq, "n") === 1 && next_problem())
			},
			{
				__proto__: Problem,
				problemText: ["Evaluate: 236 \u00b7 542 + 458 \u00b7 764 + 542 \u00b7 764 + 236 \u00b7 458."],
				problemEquation: {left: {left: {left: {literal: 236n, __proto__: Equation.literal}, right: {literal: 542n, __proto__: Equation.literal}, __proto__: Equation.multiplication}, right: {left: {literal: 458n, __proto__: Equation.literal}, right: {literal: 764n, __proto__: Equation.literal}, __proto__: Equation.multiplication}, __proto__: Equation.addition}, right: {left: {left: {literal: 542n, __proto__: Equation.literal}, right: {literal: 764n, __proto__: Equation.literal}, __proto__: Equation.multiplication}, right: {left: {literal: 236n, __proto__: Equation.literal}, right: {literal: 458n, __proto__: Equation.literal}, __proto__: Equation.multiplication}, __proto__: Equation.addition}, __proto__: Equation.addition},
				varsUsed: [],
				onSolve: (eq) => (isInteger(eq) && next_problem())
			},
			{
				__proto__: Problem,
				problemText: ["Simplify: ", Display.fraction(["(x - 2)(x + 2)"], ["x", Display.superscript("3"), " - 4x"])],
				problemEquation: {left: {left: {left: {name: "x", __proto__: Equation.variable}, right: {literal: 2n, __proto__: Equation.literal}, __proto__: Equation.subtraction}, right: {left: {name: "x", __proto__: Equation.variable}, right: {literal: 2n, __proto__: Equation.literal}, __proto__: Equation.addition}, __proto__: Equation.multiplication}, right: {left: {base: {name: "x", __proto__: Equation.variable}, power: {literal: 3n, __proto__: Equation.literal}, __proto__: Equation.exp}, right: {left: {literal: 4n, __proto__: Equation.literal}, right: {name: "x", __proto__: Equation.variable}, __proto__: Equation.multiplication}, __proto__: Equation.subtraction}, __proto__: Equation.division},
				varsUsed: ["x"],
				onSolve: (eq) => (countVariable(eq, "x") === 1 && next_problem())
			},
			{
				__proto__: Problem,
				problemText: ["By how much is (3x − 5) (x + 2) greater than (x + 4) (2x − 1)?"],
				problemEquation: {left: {left: {left: {left: {literal: 3n, __proto__: Equation.literal}, right: {name: "x", __proto__: Equation.variable}, __proto__: Equation.multiplication}, right: {literal: 5n, __proto__: Equation.literal}, __proto__: Equation.subtraction}, right: {left: {name: "x", __proto__: Equation.variable}, right: {literal: 2n, __proto__: Equation.literal}, __proto__: Equation.addition}, __proto__: Equation.multiplication}, right: {left: {left: {name: "x", __proto__: Equation.variable}, right: {literal: 4n, __proto__: Equation.literal}, __proto__: Equation.addition}, right: {left: {left: {literal: 2n, __proto__: Equation.literal}, right: {name: "x", __proto__: Equation.variable}, __proto__: Equation.multiplication}, right: {literal: 1n, __proto__: Equation.literal}, __proto__: Equation.subtraction}, __proto__: Equation.multiplication}, __proto__: Equation.subtraction},
				varsUsed: ["x"],
				onSolve: (eq) => (countVariable(eq, "x") === 2 && finishProblemSet())
			}
		]
	}
];

window.problem_sets = problem_sets;
window.next_problem = next_problem;
window.loadProblemSet = loadProblemSet;
window.finishProblemSet = finishProblemSet;
window.classes = {Display, Editor, Equation, Rational};

finishProblemSet();