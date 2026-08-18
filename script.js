(() => {
    "use strict";

    let expression = "";
    let currentValue = "0";
    let memory = 0;
    let history = [];

    const display = document.getElementById("result");
    const expressionDisplay = document.getElementById("expression");

    function updateDisplay() {
        if (display) {
            display.textContent = currentValue;
        }

        if (expressionDisplay) {
            expressionDisplay.textContent = expression || "0";
        }
    }

    function inputNumber(value) {
        if (currentValue === "ERROR") {
            currentValue = "0";
            expression = "";
        }

        if (currentValue === "0" && value !== ".") {
            currentValue = value;
        } else {
            if (value === "." && currentValue.includes(".")) {
                return;
            }

            currentValue += value;
        }

        expression = currentValue;
        updateDisplay();
    }

    function inputOperator(operator) {
        if (currentValue === "ERROR") {
            clearCalculator();
        }

        if (expression === "") {
            expression = currentValue;
        }

        // Jangan izinkan operator dobel
        if (/[+\-*/]$/.test(expression)) {
            expression = expression.slice(0, -1);
        }

        expression += operator;
        currentValue = "0";

        updateDisplay();
    }

    function calculate() {
        if (!expression) {
            return;
        }

        let finalExpression = expression;

        // Kalau terakhir operator, hapus operatornya
        if (/[+\-*/]$/.test(finalExpression)) {
            finalExpression = finalExpression.slice(0, -1);
        }

        try {
            // Hanya izinkan karakter kalkulator
            if (!/^[0-9+\-*/().\s]+$/.test(finalExpression)) {
                throw new Error("Invalid");
            }

            const result = Function(
                '"use strict"; return (' + finalExpression + ')'
            )();

            if (!Number.isFinite(result)) {
                throw new Error("Invalid");
            }

            history.unshift({
                expression: finalExpression,
                result: result
            });

            if (history.length > 50) {
                history.pop();
            }

            currentValue = formatNumber(result);
            expression = finalExpression + " =";

            updateDisplay();
            saveHistory();

        } catch (error) {
            currentValue = "ERROR";
            expression = "Invalid calculation";
            updateDisplay();
        }
    }

    function formatNumber(number) {
        if (!Number.isFinite(number)) {
            return "ERROR";
        }

        // Membatasi angka desimal panjang
        const rounded = Number(number.toFixed(10));

        return String(rounded);
    }

    function clearCalculator() {
        expression = "";
        currentValue = "0";
        updateDisplay();
    }

    function backspace() {
        if (currentValue === "ERROR") {
            clearCalculator();
            return;
        }

        if (currentValue.length <= 1) {
            currentValue = "0";
        } else {
            currentValue = currentValue.slice(0, -1);
        }

        expression = currentValue;

        updateDisplay();
    }

    function percentage() {
        const number = Number(currentValue);

        if (!Number.isFinite(number)) {
            return;
        }

        currentValue = String(number / 100);
        expression = currentValue;

        updateDisplay();
    }

    function changeSign() {
        const number = Number(currentValue);

        if (!Number.isFinite(number)) {
            return;
        }

        currentValue = String(number * -1);
        expression = currentValue;

        updateDisplay();
    }

    // =========================
    // MEMORY
    // =========================

    function memoryClear() {
        memory = 0;
    }

    function memoryRecall() {
        currentValue = String(memory);
        expression = currentValue;
        updateDisplay();
    }

    function memoryAdd() {
        const number = Number(currentValue);

        if (Number.isFinite(number)) {
            memory += number;
        }
    }

    function memorySubtract() {
        const number = Number(currentValue);

        if (Number.isFinite(number)) {
            memory -= number;
        }
    }

    function memoryStore() {
        const number = Number(currentValue);

        if (Number.isFinite(number)) {
            memory = number;
        }
    }

    // =========================
    // SCIENTIFIC
    // =========================

    function scientific(type) {
        const number = Number(currentValue);

        if (!Number.isFinite(number)) {
            currentValue = "ERROR";
            updateDisplay();
            return;
        }

        let result;

        switch (type) {

            case "sin":
                result = Math.sin(number * Math.PI / 180);
                break;

            case "cos":
                result = Math.cos(number * Math.PI / 180);
                break;

            case "tan":
                result = Math.tan(number * Math.PI / 180);
                break;

            case "sqrt":
                result = Math.sqrt(number);
                break;

            case "square":
                result = number * number;
                break;

            case "inverse":
                if (number === 0) {
                    currentValue = "ERROR";
                    updateDisplay();
                    return;
                }

                result = 1 / number;
                break;

            case "log":
                result = Math.log10(number);
                break;

            case "ln":
                result = Math.log(number);
                break;

            case "abs":
                result = Math.abs(number);
                break;

            case "exp":
                result = Math.exp(number);
                break;

            case "factorial":
                result = factorial(number);
                break;

            case "pi":
                result = Math.PI;
                break;

            case "e":
                result = Math.E;
                break;

            default:
                return;
        }

        if (!Number.isFinite(result)) {
            currentValue = "ERROR";
        } else {
            currentValue = formatNumber(result);
        }

        expression = type.toUpperCase() + "(" + number + ")";

        updateDisplay();
    }

    function factorial(number) {
        if (
            number < 0 ||
            !Number.isInteger(number) ||
            number > 170
        ) {
            return NaN;
        }

        let result = 1;

        for (let i = 2; i <= number; i++) {
            result *= i;
        }

        return result;
    }

    // =========================
    // BUTTON BASIC CALCULATOR
    // =========================

    const keypad = document.getElementById("keypad");

    if (keypad) {

        keypad.addEventListener("click", function(event) {

            const button = event.target.closest("[data-key]");

            if (!button) {
                return;
            }

            const key = button.dataset.key;

            if (key === "AC") {
                clearCalculator();
                return;
            }

            if (key === "=") {
                calculate();
                return;
            }

            if (key === "%") {
                percentage();
                return;
            }

            if (key === "+/-") {
                changeSign();
                return;
            }

            if (
                key === "+" ||
                key === "-" ||
                key === "*" ||
                key === "/"
            ) {
                inputOperator(key);
                return;
            }

            inputNumber(key);
        });
    }

    // =========================
    // BACKSPACE
    // =========================

    const backspaceButton =
        document.getElementById("backspaceBtn");

    if (backspaceButton) {
        backspaceButton.addEventListener(
            "click",
            backspace
        );
    }

    // =========================
    // MEMORY BUTTON
    // =========================

    document.querySelectorAll("[data-action]").forEach(button => {

        button.addEventListener("click", function() {

            const action = button.dataset.action;

            switch (action) {

                case "mc":
                    memoryClear();
                    break;

                case "mr":
                    memoryRecall();
                    break;

                case "mplus":
                    memoryAdd();
                    break;

                case "mminus":
                    memorySubtract();
                    break;

                case "ms":
                    memoryStore();
                    break;
            }
        });
    });

    // =========================
    // SCIENTIFIC BUTTON
    // =========================

    document.querySelectorAll("[data-scientific]").forEach(button => {

        button.addEventListener("click", function() {

            scientific(
                button.dataset.scientific
            );

        });

    });

    // =========================
    // CONSTANT BUTTON
    // =========================

    document.querySelectorAll("[data-constant]").forEach(button => {

        button.addEventListener("click", function() {

            const constant = button.dataset.constant;

            if (constant === "pi") {
                currentValue = String(Math.PI);
            }

            if (constant === "e") {
                currentValue = String(Math.E);
            }

            expression = currentValue;

            updateDisplay();
        });

    });

    // =========================
    // KEYBOARD
    // =========================

    document.addEventListener("keydown", function(event) {

        const key = event.key;

        if (
            key >= "0" &&
            key <= "9"
        ) {
            inputNumber(key);
            return;
        }

        if (key === ".") {
            inputNumber(".");
            return;
        }

        if (
            key === "+" ||
            key === "-" ||
            key === "*" ||
            key === "/"
        ) {
            inputOperator(key);
            return;
        }

        if (
            key === "Enter" ||
            key === "="
        ) {
            calculate();
            return;
        }

        if (key === "Escape") {
            clearCalculator();
            return;
        }

        if (key === "Backspace") {
            backspace();
            return;
        }

        if (key === "%") {
            percentage();
        }

    });

    // =========================
    // HISTORY
    // =========================

    function saveHistory() {

        try {
            localStorage.setItem(
                "cubesCalculatorHistory",
                JSON.stringify(history)
            );
        } catch (error) {}
    }

    function loadHistory() {

        try {

            const saved =
                localStorage.getItem(
                    "cubesCalculatorHistory"
                );

            if (saved) {
                history = JSON.parse(saved);
            }

        } catch (error) {
            history = [];
        }
    }

    loadHistory();
    updateDisplay();

})();
