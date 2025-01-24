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
		const equationEditor = Editor.createEditor(this.problemEquation, this.onSolve, this.freeVars, this.boundVars);
		e.append(problemText, equationEditor);
	}
};

const next_problem = () => {
	const next = currentProblemSet.next();
	if (next.done) return true;
	window.currentProblemIndex = next.value[0];
	next.value[1].loadProblem(document.querySelector("#problem"));
	document.querySelector(".problem-editor").focus();
	return true;
};

const loadProblemSet = (problemSet) => {
	window.currentProblemSetName = problemSet.name;
	const currentSaved = JSON.parse(localStorage.getItem(window.currentProblemSetName)) ?? {};
	currentSaved.running ??= {};
	window.currentProblemSet = problemSet.problems.entries().drop(currentSaved.running.problemIndex ?? 0);
	document.querySelector("#score").classList.replace("d-none", "d-flex");
	window.startTime = Date.now() - (currentSaved.running.time ?? 0);
	window.timer = setInterval(() => {
		document.querySelector("#time").innerText = `Time: ${((Date.now() - window.startTime)/1000).toFixed(1)}s`;
	}, 1)
	window.stepCount = currentSaved.running.steps ?? 0;
	document.querySelector("#problem-sets").classList.replace("d-flex", "d-none");
	document.querySelector("#back").onclick = () => finishProblemSet(false);
	currentProblemSet;
	next_problem();
}

const finishProblemSet = (saveScore) => {
	if (saveScore && window.currentProblemSetName) {
		const currentSaved = JSON.parse(localStorage.getItem(window.currentProblemSetName)) ?? {};
		currentSaved.first ??= {time: Date.now() - window.startTime, steps: window.stepCount};
		currentSaved.best ??= {time: Date.now() - window.startTime, steps: window.stepCount};
		delete currentSaved.running;
		if (window.timer) clearInterval(window.timer);
		if (Date.now() - window.startTime < currentSaved.best.time) currentSaved.best.time = Date.now() - window.startTime;
		if (window.stepCount < currentSaved.best.steps) currentSaved.best.steps = window.stepCount;
		localStorage.setItem(window.currentProblemSetName, JSON.stringify(currentSaved));
	} else {
		const currentSaved = JSON.parse(localStorage.getItem(window.currentProblemSetName)) ?? {};
		if (window.timer) clearInterval(window.timer);
		currentSaved.running ??= {};
		currentSaved.running.problemIndex = window.currentProblemIndex;
		currentSaved.running.time = Date.now() - window.startTime;
		currentSaved.running.steps = window.stepCount;
		localStorage.setItem(window.currentProblemSetName, JSON.stringify(currentSaved));
	}
	window.currentProblemSet = null;
	window.currentProblemSetName = null;
	window.currentProblemIndex = null;
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
		scoreTableTimeCells[1].append(JSON.parse(localStorage.getItem(problemSet.name))?.first ? `${(JSON.parse(localStorage.getItem(problemSet.name)).first.time/1000).toFixed(1)}s` : "--");
		scoreTableTimeCells[2].append(JSON.parse(localStorage.getItem(problemSet.name))?.best ? `${(JSON.parse(localStorage.getItem(problemSet.name)).best.time/1000).toFixed(1)}s` : "--");
		scoreTableTimeRow.append(...scoreTableTimeCells);
		const scoreTableStepsRow = document.createElement("tr");
		const scoreTableStepsCells = [document.createElement("th"), document.createElement("td"), document.createElement("td")];
		scoreTableStepsCells[0].setAttribute("scope", "row");
		scoreTableStepsCells[0].append("Steps");
		scoreTableStepsCells[1].append(JSON.parse(localStorage.getItem(problemSet.name))?.first ? `${JSON.parse(localStorage.getItem(problemSet.name)).first.steps}` : "--");
		scoreTableStepsCells[2].append(JSON.parse(localStorage.getItem(problemSet.name))?.best ? `${JSON.parse(localStorage.getItem(problemSet.name)).best.steps}` : "--");
		scoreTableStepsRow.append(...scoreTableStepsCells);
		scoreTableBody.append(scoreTableTimeRow, scoreTableStepsRow);
		problemSetScores.append(scoreTableHead, scoreTableBody);
		const hasOngoing = JSON.parse(localStorage.getItem(problemSet.name))?.running;
		const problemSetButton = document.createElement("a")
		problemSetButton.classList.add("d-block", "btn", hasOngoing ? "btn-warning" : "btn-success", "mx-auto");
		problemSetButton.onclick = () => {loadProblemSet(problemSet)};
		problemSetButton.append(hasOngoing ? "Continue" : "Start");
		cardBody.append(problemSetTitle, problemSetLength, problemSetScores, problemSetButton);
		card.append(cardBody);
		column.append(card);
		document.querySelector("#problem-sets").append(column);
	}
}

const isInteger = (eq) => Equation.literal.isPrototypeOf(eq) || Equation.negate.isPrototypeOf(eq) && Equation.literal.isPrototypeOf(eq.inside);
const isRational = (eq) => isInteger(eq) || Equation.division.isPrototypeOf(eq) && isInteger(eq.left) && isInteger(eq.right) || Equation.negate.isPrototypeOf(eq) && Equation.division.isPrototypeOf(eq.inside) && isInteger(eq.inside.left) && isInteger(eq.inside.right);
const countVariable = (eq, variable) => Equation.variable.isPrototypeOf(eq) ? Number(eq.name === variable) :
	Equation.addition.isPrototypeOf(eq) || Equation.subtraction.isPrototypeOf(eq) || Equation.multiplication.isPrototypeOf(eq) || Equation.division.isPrototypeOf(eq) ? countVariable(eq.left, variable) + countVariable(eq.right, variable) :
	Equation.exp.isPrototypeOf(eq) ? countVariable(eq.base, variable) + countVariable(eq.power, variable) :
	Equation.parens.isPrototypeOf(eq) || Equation.negate.isPrototypeOf(eq) ? countVariable(eq.inside, variable) : 0

const problem_sets = [
	{
		name: "Trial",
		problems: [
			{
				__proto__: Problem,
				problemText: ["Simplify: (1 + 1) \u00b7 (1 + 1)"],
				problemEquation: {left: {left: {literal: 1n, __proto__: Equation.literal}, right: {literal: 1n, __proto__: Equation.literal}, __proto__: Equation.addition}, right: {left: {literal: 1n, __proto__: Equation.literal}, right: {literal: 1n, __proto__: Equation.literal}, __proto__: Equation.addition}, __proto__: Equation.multiplication},
				freeVars: [],
				boundVars: {},
				onSolve: (eq) => (isInteger(eq) && next_problem())
			},
			{
				__proto__: Problem,
				problemText: ["Simplify: ", Display.fraction(["x", Display.superscript("2"), " - 1"], ["x - 1"])],
				problemEquation: {left: {left: {base: {name: "x", __proto__: Equation.variable}, power: {literal: 2n, __proto__: Equation.literal}, __proto__: Equation.exp}, right: {literal: 1n, __proto__: Equation.literal}, __proto__: Equation.subtraction}, right: {left: {name: "x", __proto__: Equation.variable}, right: {literal: 1n, __proto__: Equation.literal}, __proto__: Equation.subtraction}, __proto__: Equation.division},
				freeVars: ["x"],
				boundVars: {},
				onSolve: (eq) => (countVariable(eq, "x") === 1 && finishProblemSet(true))
			}
		]
	},
	{
		name: "MTAP Training 2016",
		problems: [
			{
				__proto__: Problem,
				problemText: ["Simplify: ", Display.equation(["6(2)", Display.superscript("2"), "-(4-5)", Display.superscript("3")])],
				problemEquation: {left: {left: {literal: 6n, __proto__: Equation.literal}, right: {base: {literal: 2n, __proto__: Equation.literal}, power: {literal: 2n, __proto__: Equation.literal}, __proto__: Equation.exp}, __proto__: Equation.multiplication}, right: {base: {left: {literal: 4n, __proto__: Equation.literal}, right: {literal: 5n, __proto__: Equation.literal}, __proto__: Equation.subtraction}, power: {literal: 3n, __proto__: Equation.literal}, __proto__: Equation.exp}, __proto__: Equation.subtraction},
				freeVars: [],
				boundVars: {},
				onSolve: (eq) => (isRational(eq) && next_problem())
			},
			{
				__proto__: Problem,
				problemText: ["By how much is 3 - ", Display.fraction(["1"], ["3"]), " greater than ", Display.fraction(["1"], ["2"]), " - 2?"],
				problemEquation: {left: {left: {literal: 3n, __proto__: Equation.literal}, right: {literal: new Rational.constructor(1n, 3n), __proto__: Equation.literal}, __proto__: Equation.subtraction}, right: {left: {literal: new Rational.constructor(1n, 2n), __proto__: Equation.literal}, right: {literal: 2n, __proto__: Equation.literal}, __proto__: Equation.subtraction}, __proto__: Equation.subtraction},
				freeVars: [],
				boundVars: {},
				onSolve: (eq) => (isRational(eq) && next_problem())
			},
			{
				__proto__: Problem,
				problemText: ["What number is midway between 3 + ", Display.fraction(["1"], ["3"]), " and 2 - ", Display.fraction(["1"], ["3"]), "?"],
				problemEquation: {left: {left: {left: {literal: 3n, __proto__: Equation.literal}, right: {literal: new Rational.constructor(1n, 3n), __proto__: Equation.literal}, __proto__: Equation.addition}, right: {left: {literal: 2n, __proto__: Equation.literal}, right: {literal: new Rational.constructor(1n, 3n), __proto__: Equation.literal}, __proto__: Equation.subtraction}, __proto__: Equation.addition}, right: {literal: 2n, __proto__: Equation.literal}, __proto__: Equation.division},
				freeVars: [],
				boundVars: {},
				onSolve: (eq) => (isRational(eq) && next_problem())
			},
			{
				__proto__: Problem,
				problemText: ["Simplify: (2 - 5) \u00b7 (-", Display.fraction(["9"], ["8"]), ")-", Display.fraction(["3"], ["4"]), "(-2)"], // ??? why would you write a problem like that
				problemEquation: {left: {left: {left: {literal: 2n, __proto__: Equation.literal}, right: {literal: 5n, __proto__: Equation.literal}, __proto__: Equation.subtraction}, right: {inside: {literal: new Rational.constructor(9n, 8n), __proto__: Equation.literal}, __proto__: Equation.negate}, __proto__: Equation.multiplication}, right: {left: {literal: new Rational.constructor(3n, 4n), __proto__: Equation.literal}, right: {literal: -2n, __proto__: Equation.literal}, __proto__: Equation.multiplication}, __proto__: Equation.subtraction},
				freeVars: [],
				boundVars: {},
				onSolve: (eq) => (isRational(eq) && next_problem())
			},
			{
				__proto__: Problem,
				problemText: ["Simplify: (", Display.fraction(["7"], ["2"]), "+", Display.fraction(["5"], ["6"]), ")", Display.superscript("2"), " - (", Display.fraction(["7"], ["2"]), "-", Display.fraction(["5"], ["6"]), ")", Display.superscript("2")],
				problemEquation: {left: {base: {left: {literal: new Rational.constructor(7n, 2n), __proto__: Equation.literal}, right: {literal: new Rational.constructor(5n, 6n), __proto__: Equation.literal}, __proto__: Equation.addition}, power: {literal: 2n, __proto__: Equation.literal}, __proto__: Equation.exp}, right: {base: {left: {literal: new Rational.constructor(7n, 2n), __proto__: Equation.literal}, right: {literal: new Rational.constructor(5n, 6n), __proto__: Equation.literal}, __proto__: Equation.subtraction}, power: {literal: 2n, __proto__: Equation.literal}, __proto__: Equation.exp}, __proto__: Equation.subtraction},
				freeVars: [],
				boundVars: {},
				onSolve: (eq) => (isRational(eq) && next_problem())
			},
			{
				__proto__: Problem,
				problemText: ["Compute 24 \u00f7 ", Display.fraction(["1 + ", Display.fraction(["1"], ["5"])], ["2 - ", Display.fraction(["1"], ["3"])]), "."],
				problemEquation: {left: {literal: 24n, __proto__: Equation.literal}, right: {left: {left: {literal: 1n, __proto__: Equation.literal}, right: {literal: new Rational.constructor(1n, 5n), __proto__: Equation.literal}, __proto__: Equation.addition}, right: {left: {literal: 2n, __proto__: Equation.literal}, right: {literal: new Rational.constructor(1n, 3n), __proto__: Equation.literal}, __proto__: Equation.subtraction}, __proto__: Equation.division}, __proto__: Equation.division},
				freeVars: [],
				boundVars: {},
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
				freeVars: ["a", "b", "c"],
				boundVars: {},
				onSolve: (eq) => (countVariable(eq, "a") === 1 && countVariable(eq, "b") === 1 && countVariable(eq, "c") === 0 && next_problem())
			},
			{
				__proto__: Problem,
				problemText: ["Three two-digit numbers have consecutive tens digits and have units digit all equal to 5. If the tens digit of the smallest number is n, what is the sum of the three numbers?"],
				problemEquation: {left: {left: {left: {literal: 10n, __proto__: Equation.literal}, right: {name: "n", __proto__: Equation.variable}, __proto__: Equation.multiplication}, right: {literal: 5n, __proto__: Equation.literal}, __proto__: Equation.addition}, right: {left: {left: {left: {literal: 10n, __proto__: Equation.literal}, right: {left: {name: "n", __proto__: Equation.variable}, right: {literal: 1n, __proto__: Equation.literal}, __proto__: Equation.addition}, __proto__: Equation.multiplication}, right: {literal: 5n, __proto__: Equation.literal}, __proto__: Equation.addition}, right: {left: {left: {literal: 10n, __proto__: Equation.literal}, right: {left: {name: "n", __proto__: Equation.variable}, right: {literal: 2n, __proto__: Equation.literal}, __proto__: Equation.addition}, __proto__: Equation.multiplication}, right: {literal: 5n, __proto__: Equation.literal}, __proto__: Equation.addition}, __proto__: Equation.addition}, __proto__: Equation.addition},
				freeVars: ["n"],
				boundVars: {},
				onSolve: (eq) => (countVariable(eq, "n") === 1 && next_problem())
			},
			{
				__proto__: Problem,
				problemText: ["Evaluate: 236 \u00b7 542 + 458 \u00b7 764 + 542 \u00b7 764 + 236 \u00b7 458."],
				problemEquation: {left: {left: {left: {literal: 236n, __proto__: Equation.literal}, right: {literal: 542n, __proto__: Equation.literal}, __proto__: Equation.multiplication}, right: {left: {literal: 458n, __proto__: Equation.literal}, right: {literal: 764n, __proto__: Equation.literal}, __proto__: Equation.multiplication}, __proto__: Equation.addition}, right: {left: {left: {literal: 542n, __proto__: Equation.literal}, right: {literal: 764n, __proto__: Equation.literal}, __proto__: Equation.multiplication}, right: {left: {literal: 236n, __proto__: Equation.literal}, right: {literal: 458n, __proto__: Equation.literal}, __proto__: Equation.multiplication}, __proto__: Equation.addition}, __proto__: Equation.addition},
				freeVars: [],
				boundVars: {},
				onSolve: (eq) => (isInteger(eq) && next_problem())
			},
			{
				__proto__: Problem,
				problemText: ["Simplify: ", Display.fraction(["(x - 2)(x + 2)"], ["x", Display.superscript("3"), " - 4x"])],
				problemEquation: {left: {left: {left: {name: "x", __proto__: Equation.variable}, right: {literal: 2n, __proto__: Equation.literal}, __proto__: Equation.subtraction}, right: {left: {name: "x", __proto__: Equation.variable}, right: {literal: 2n, __proto__: Equation.literal}, __proto__: Equation.addition}, __proto__: Equation.multiplication}, right: {left: {base: {name: "x", __proto__: Equation.variable}, power: {literal: 3n, __proto__: Equation.literal}, __proto__: Equation.exp}, right: {left: {literal: 4n, __proto__: Equation.literal}, right: {name: "x", __proto__: Equation.variable}, __proto__: Equation.multiplication}, __proto__: Equation.subtraction}, __proto__: Equation.division},
				freeVars: ["x"],
				boundVars: {},
				onSolve: (eq) => (countVariable(eq, "x") === 1 && next_problem())
			},
			{
				__proto__: Problem,
				problemText: ["By how much is (3x − 5) (x + 2) greater than (x + 4) (2x − 1)?"],
				problemEquation: {left: {left: {left: {left: {literal: 3n, __proto__: Equation.literal}, right: {name: "x", __proto__: Equation.variable}, __proto__: Equation.multiplication}, right: {literal: 5n, __proto__: Equation.literal}, __proto__: Equation.subtraction}, right: {left: {name: "x", __proto__: Equation.variable}, right: {literal: 2n, __proto__: Equation.literal}, __proto__: Equation.addition}, __proto__: Equation.multiplication}, right: {left: {left: {name: "x", __proto__: Equation.variable}, right: {literal: 4n, __proto__: Equation.literal}, __proto__: Equation.addition}, right: {left: {left: {literal: 2n, __proto__: Equation.literal}, right: {name: "x", __proto__: Equation.variable}, __proto__: Equation.multiplication}, right: {literal: 1n, __proto__: Equation.literal}, __proto__: Equation.subtraction}, __proto__: Equation.multiplication}, __proto__: Equation.subtraction},
				freeVars: ["x"],
				boundVars: {},
				onSolve: (eq) => (countVariable(eq, "x") === 2 && finishProblemSet(true))
			}
		]
	},
	{
		name: "MTAP Training 2017",
		problems: [
			{
				__proto__: Problem,
				problemText: ["Give the rational number that is midway between −", Display.fraction(["3"], ["4"]), " and ", Display.fraction(["7"], ["8"]), "."],
				problemEquation: {left: {left: {inside: {literal: new Rational.constructor(3n, 4n), __proto__: Equation.literal}, __proto__: Equation.negate}, right: {literal: new Rational.constructor(7n, 8n), __proto__: Equation.literal}, __proto__: Equation.addition}, right: {literal: 2n, __proto__: Equation.literal}, __proto__: Equation.division},
				freeVars: [],
				boundVars: {},
				onSolve: (eq) => (isRational(eq) && next_problem())
			},
			{
				__proto__: Problem,
				problemText: ["Ana walks ", Display.fraction(["2"], ["3"]), " km due west, then turns back and walks ", Display.fraction(["10"], ["7"]), " km due east. How far is Ana from her starting point?"],
				problemEquation: {left: {inside: {literal: new Rational.constructor(2n, 3n), __proto__: Equation.literal}, __proto__: Equation.negate}, right: {literal: new Rational.constructor(10n, 7n), __proto__: Equation.literal}, __proto__: Equation.addition},
				freeVars: [],
				boundVars: {},
				onSolve: (eq) => (isRational(eq) && next_problem())
			},
			{
				__proto__: Problem,
				problemText: ["Write the answer as a decimal: ", Display.fraction(["5"], ["13"]), " \u00f7 ", Display.fraction(["−4"], ["39"])],
				problemEquation: {left: {literal: new Rational.constructor(5n, 13n), __proto__: Equation.literal}, right: {literal: new Rational.constructor(-4n, 39n), __proto__: Equation.literal}, __proto__: Equation.division},
				freeVars: [],
				boundVars: {},
				onSolve: (eq) => (isRational(eq) && next_problem())
			},
			{
				__proto__: Problem,
				problemText: ["If a = 21, b = −16, find 2a − (−b)."],
				problemEquation: {left: {left: {literal: 2n, __proto__: Equation.literal}, right: {name: "a", __proto__: Equation.variable}, __proto__: Equation.multiplication}, right: {inside: {name: "b", __proto__: Equation.variable}, __proto__: Equation.negate}, __proto__: Equation.subtraction},
				freeVars: [],
				boundVars: {a: 21n, b: -16n},
				onSolve: (eq) => (isInteger(eq) && finishProblemSet(true))
			},
		]
	},
	{
		name: "MTAP Training 2018",
		problems: [
			{
				__proto__: Problem,
				problemText: ["In a class of 40 students, 23 are studying Japanese, 18 are studying Korean and 10 are studying both Japanese and Korean. How many students are not taking any foreign languages?", Display.newline(), "(S = 40, J = 23, K = 18, B = 10)"],
				problemEquation: {inside: {literal: 9n, __proto__: Equation.literal}, __proto__: Equation.concealed},
				freeVars: [],
				boundVars: {"S": 40, "J": 23, "K": 18, "B": 10},
				onSolve: (eq) => (isInteger(eq) && next_problem())
			},
			// In a Senior high school, 35% of the students are girls. If there are 300 fewer girls than boys, find the total number of students in the school.
			{
				__proto__: Problem,
				problemText: ["If the length of a rectangle is increased by 30% and the width is decreased by 20%, find the percentage by which its area changes."],
				problemEquation: {left: {left: {left: {left: {left: {name: "L", __proto__: Equation.variable}, right: {left: {literal: new Rational.constructor(30n, 100n), __proto__: Equation.literal}, right: {name: "L", __proto__: Equation.variable}, __proto__: Equation.multiplication}, __proto__: Equation.addition}, right: {left: {name: "W", __proto__: Equation.variable}, right: {left: {literal: new Rational.constructor(20n, 100n), __proto__: Equation.literal}, right: {name: "W", __proto__: Equation.variable}, __proto__: Equation.multiplication}, __proto__: Equation.subtraction}, __proto__: Equation.multiplication}, right: {left: {name: "L", __proto__: Equation.variable}, right: {name: "W", __proto__: Equation.variable}, __proto__: Equation.multiplication}, __proto__: Equation.subtraction}, right: {left: {name: "L", __proto__: Equation.variable}, right: {name: "W", __proto__: Equation.variable}, __proto__: Equation.multiplication}, __proto__: Equation.division}, right: {literal: 100n, __proto__: Equation.literal}, __proto__: Equation.multiplication},
				freeVars: ["L", "W"],
				boundVars: {},
				onSolve: (eq) => (isInteger(eq) && next_problem())
			},
			{
				__proto__: Problem,
				problemText: ["What number is halfway between 3 - ", Display.fraction(["1"], ["3"]), " and 2 + ", Display.fraction(["4"], ["7"]), "?"],
				problemEquation: {left: {left: {left: {literal: 3n, __proto__: Equation.literal}, right: {literal: new Rational.constructor(1n, 3n), __proto__: Equation.literal}, __proto__: Equation.subtraction}, right: {left: {literal: 2n, __proto__: Equation.literal}, right: {literal: new Rational.constructor(4n, 7n), __proto__: Equation.literal}, __proto__: Equation.addition}, __proto__: Equation.addition}, right: {literal: 2n, __proto__: Equation.literal}, __proto__: Equation.division},
				freeVars: [],
				boundVars: {},
				onSolve: (eq) => (isRational(eq) && finishProblemSet(true))
			}
		]
	},
	{
		name: "MTAP Training 2019",
		problems: [
			{
				__proto__: Problem,
				problemText: ["Evaluate 3x", Display.superscript("2"), " − 2y", Display.superscript("3"), " when x = 2 and y = −1."],
				problemEquation: {left: {left: {literal: 3n, __proto__: Equation.literal}, right: {base: {name: "x", __proto__: Equation.variable}, power: {literal: 2n, __proto__: Equation.literal}, __proto__: Equation.exp}, __proto__: Equation.multiplication}, right: {left: {literal: 2n, __proto__: Equation.literal}, right: {base: {name: "y", __proto__: Equation.variable}, power: {literal: 3n, __proto__: Equation.literal}, __proto__: Equation.exp}, __proto__: Equation.multiplication}, __proto__: Equation.subtraction},
				freeVars: [],
				boundVars: {x: 2n, y: -1n},
				onSolve: (eq) => (isInteger(eq) && next_problem())
			},
			{
				__proto__: Problem,
				problemText: ["Evaluate (2", Display.superscript("3"), ")", Display.superscript("2"), " − 2", Display.superscript("3"), "3", Display.superscript("2"), "."],
				problemEquation: {left: {base: {inside: {base: {literal: 2n, __proto__: Equation.literal}, power: {literal: 3n, __proto__: Equation.literal}, __proto__: Equation.exp}, __proto__: Equation.parens}, power: {literal: 2n, __proto__: Equation.literal}, __proto__: Equation.exp}, right: {left: {base: {literal: 2n, __proto__: Equation.literal}, power: {literal: 3n, __proto__: Equation.literal}, __proto__: Equation.exp}, right: {base: {literal: 3n, __proto__: Equation.literal}, power: {literal: 2n, __proto__: Equation.literal}, __proto__: Equation.exp}, __proto__: Equation.multiplication}, __proto__: Equation.subtraction},
				freeVars: [],
				boundVars: {},
				onSolve: (eq) => (isInteger(eq) && next_problem())
			},
			// Simplify (1/2−1/3)/(1/4).
			// Subtract 3(−x^2 + 6xy − 4) − 2y^2 + 9 from 12 − 2y(y − 9x) + x^2.
			{
				__proto__: Problem,
				problemText: ["If x + y = 7 and xy = 10, what is the value of x", Display.superscript("2"), " + y", Display.superscript("2"), "?"],
				problemEquation: {left: {base: {name: "x", __proto__: Equation.variable}, power: {literal: 2n, __proto__: Equation.literal}, __proto__: Equation.exp}, right: {base: {name: "y", __proto__: Equation.variable}, power: {literal: 2n, __proto__: Equation.literal}, __proto__: Equation.exp}, __proto__: Equation.addition},
				freeVars: [],
				boundVars: {x: 2n, y: 5n},
				onSolve: (eq) => (isInteger(eq) && next_problem())
			},
			// What is the value of x^2 − x + 1/x if x = 1/2?
			{
				__proto__: Problem,
				problemText: ["Assume x ≠ 0 and x ≠ −1, simplify (x", Display.superscript("3"), " + 1)", Display.superscript("−1"), " + (x", Display.superscript("−3"), " + 1)", Display.superscript("−1"), "."],
				problemEquation: {left: {base: {left: {base: {name: "x", __proto__: Equation.variable}, power: {literal: 3n, __proto__: Equation.literal}, __proto__: Equation.exp}, right: {literal: 1n, __proto__: Equation.literal}, __proto__: Equation.addition}, power: {literal: -1n, __proto__: Equation.literal}, __proto__: Equation.exp}, right: {base: {left: {base: {name: "x", __proto__: Equation.variable}, power: {literal: -3n, __proto__: Equation.literal}, __proto__: Equation.exp}, right: {literal: 1n, __proto__: Equation.literal}, __proto__: Equation.addition}, power: {literal: -1n, __proto__: Equation.literal}, __proto__: Equation.exp}, __proto__: Equation.addition},
				freeVars: ["x"],
				boundVars: {},
				onSolve: (eq) => (isInteger(eq) && finishProblemSet(true))
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