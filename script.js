(() => {
    "use strict";

    // ==========================================
    // STATE
    // ==========================================

    let currentInput = "0";
    let expression = "";
    let memory = 0;
    let history = [];
    let justCalculated = false;

    // ==========================================
    // ELEMENT
    // ==========================================

    const display = document.getElementById("result");
    const expressionDisplay =
        document.getElementById("expression");

    // ==========================================
    // DISPLAY
    // ==========================================

    function updateDisplay() {
        if (display) {
            display.textContent = currentInput;
        }

        if (expressionDisplay) {
            expressionDisplay.textContent =
                expression || "0";
        }
    }

    // ==========================================
    // FORMAT ANGKA
    // ==========================================

    function formatNumber(number) {

        if (!Number.isFinite(number)) {
            return "ERROR";
        }

        const rounded =
            Number(number.toFixed(10));

        return String(rounded);
    }

    // ==========================================
    // NORMALISASI OPERATOR
    // ==========================================

    function normalizeOperator(operator) {

        if (
            operator === "×" ||
            operator === "x" ||
            operator === "X"
        ) {
            return "*";
        }

        if (
            operator === "÷" ||
            operator === ":"
        ) {
            return "/";
        }

        if (
            operator === "−" ||
            operator === "–"
        ) {
            return "-";
        }

        return operator;
    }

    // ==========================================
    // INPUT ANGKA
    // ==========================================

    function inputNumber(value) {

        if (
            currentInput === "ERROR" ||
            justCalculated
        ) {
            currentInput = "0";
            expression = "";
            justCalculated = false;
        }

        // Angka 0 di awal
        if (
            currentInput === "0" &&
            value !== "."
        ) {
            currentInput = value;
        }

        // Titik desimal
        else if (
            value === "." &&
            currentInput.includes(".")
        ) {
            return;
        }

        else {
            currentInput += value;
        }

        // Jika sedang memasukkan angka setelah operator
        if (expression) {

            const lastChar =
                expression.slice(-1);

            if (
                "+-*/".includes(lastChar)
            ) {
                expression += currentInput;
            }
            else {
                expression =
                    expression.replace(
                        /(-?\d*\.?\d+)$/,
                        currentInput
                    );
            }
        }
        else {
            expression = currentInput;
        }

        updateDisplay();
    }

    // ==========================================
    // OPERATOR
    // ==========================================

    function inputOperator(operator) {

        operator =
            normalizeOperator(operator);

        if (
            !["+","-","*","/"].includes(operator)
        ) {
            return;
        }

        if (currentInput === "ERROR") {
            clearCalculator();
        }

        justCalculated = false;

        // Kalau belum ada expression
        if (!expression) {
            expression = currentInput;
        }

        // Kalau expression diakhiri operator,
        // ganti operator lama
        if (
            /[+\-*/]$/.test(expression)
        ) {
            expression =
                expression.slice(0, -1) +
                operator;
        }

        else {

            // Pastikan angka terakhir masuk
            if (
                !expression.endsWith(
                    currentInput
                )
            ) {
                expression += currentInput;
            }

            expression += operator;
        }

        currentInput = "0";

        updateDisplay();
    }

    // ==========================================
    // TOKENIZER
    // ==========================================

    function tokenize(input) {

        const tokens = [];

        let i = 0;

        while (i < input.length) {

            const char = input[i];

            // Spasi
            if (/\s/.test(char)) {
                i++;
                continue;
            }

            // Angka
            if (
                /[0-9.]/.test(char)
            ) {

                let number = "";

                while (
                    i < input.length &&
                    /[0-9.]/.test(input[i])
                ) {
                    number += input[i];
                    i++;
                }

                if (
                    (number.match(/\./g) || [])
                        .length > 1
                ) {
                    throw new Error(
                        "Invalid number"
                    );
                }

                tokens.push({
                    type: "number",
                    value: Number(number)
                });

                continue;
            }

            // Operator
            if (
                "+-*/".includes(char)
            ) {

                tokens.push({
                    type: "operator",
                    value: char
                });

                i++;
                continue;
            }

            // Kurung
            if (char === "(") {

                tokens.push({
                    type: "left"
                });

                i++;
                continue;
            }

            if (char === ")") {

                tokens.push({
                    type: "right"
                });

                i++;
                continue;
            }

            throw new Error(
                "Invalid character"
            );
        }

        return tokens;
    }

    // ==========================================
    // PARSER
    // Mendukung:
    // 7+8
    // 5+3*2
    // (5+3)*2
    // -5+10
    // ==========================================

    function evaluateExpression(input) {

        const tokens =
            tokenize(input);

        let position = 0;

        function parseExpression() {

            let value =
                parseTerm();

            while (
                position < tokens.length &&
                tokens[position].type ===
                    "operator" &&
                (
                    tokens[position].value === "+" ||
                    tokens[position].value === "-"
                )
            ) {

                const operator =
                    tokens[position].value;

                position++;

                const right =
                    parseTerm();

                if (operator === "+") {
                    value += right;
                }
                else {
                    value -= right;
                }
            }

            return value;
        }

        function parseTerm() {

            let value =
                parseFactor();

            while (
                position < tokens.length &&
                tokens[position].type ===
                    "operator" &&
                (
                    tokens[position].value === "*" ||
                    tokens[position].value === "/"
                )
            ) {

                const operator =
                    tokens[position].value;

                position++;

                const right =
                    parseFactor();

                if (
                    operator === "/" &&
                    right === 0
                ) {
                    throw new Error(
                        "Division by zero"
                    );
                }

                if (operator === "*") {
                    value *= right;
                }
                else {
                    value /= right;
                }
            }

            return value;
        }

        function parseFactor() {

            if (
                position >= tokens.length
            ) {
                throw new Error(
                    "Invalid expression"
                );
            }

            const token =
                tokens[position];

            // Unary minus
            if (
                token.type === "operator" &&
                token.value === "-"
            ) {

                position++;

                return -parseFactor();
            }

            // Unary plus
            if (
                token.type === "operator" &&
                token.value === "+"
            ) {

                position++;

                return parseFactor();
            }

            // Angka
            if (
                token.type === "number"
            ) {

                position++;

                return token.value;
            }

            // Kurung
            if (
                token.type === "left"
            ) {

                position++;

                const value =
                    parseExpression();

                if (
                    position >=
                    tokens.length ||
                    tokens[position].type !==
                        "right"
                ) {
                    throw new Error(
                        "Missing bracket"
                    );
                }

                position++;

                return value;
            }

            throw new Error(
                "Invalid expression"
            );
        }

        const result =
            parseExpression();

        if (
            position !== tokens.length
        ) {
            throw new Error(
                "Invalid expression"
            );
        }

        if (!Number.isFinite(result)) {
            throw new Error(
                "Invalid result"
            );
        }

        return result;
    }

    // ==========================================
    // CALCULATE
    // ==========================================

    function calculate() {

        if (!expression) {
            return;
        }

        let finalExpression =
            expression;

        // Hapus operator terakhir
        finalExpression =
            finalExpression.replace(
                /[+\-*/]+$/,
                ""
            );

        if (!finalExpression) {
            return;
        }

        try {

            const result =
                evaluateExpression(
                    finalExpression
                );

            const formatted =
                formatNumber(result);

            history.unshift({
                expression:
                    finalExpression,
                result: formatted,
                time:
                    new Date().toLocaleString(
                        "id-ID"
                    )
            });

            if (history.length > 50) {
                history.pop();
            }

            currentInput =
                formatted;

            expression =
                finalExpression + " =";

            justCalculated = true;

            saveHistory();
            updateDisplay();

        }
        catch (error) {

            currentInput = "ERROR";

            expression =
                "Invalid calculation";

            justCalculated = true;

            updateDisplay();
        }
    }

    // ==========================================
    // CLEAR
    // ==========================================

    function clearCalculator() {

        currentInput = "0";
        expression = "";
        justCalculated = false;

        updateDisplay();
    }

    // ==========================================
    // BACKSPACE
    // ==========================================

    function backspace() {

        if (
            currentInput === "ERROR" ||
            justCalculated
        ) {
            clearCalculator();
            return;
        }

        if (
            currentInput.length <= 1
        ) {
            currentInput = "0";
        }
        else {
            currentInput =
                currentInput.slice(0, -1);
        }

        // Update angka terakhir pada expression
        expression =
            expression.replace(
                /(\d*\.?\d+)$/,
                currentInput
            );

        updateDisplay();
    }

    // ==========================================
    // PERCENT
    // ==========================================

    function percentage() {

        const number =
            Number(currentInput);

        if (!Number.isFinite(number)) {
            return;
        }

        currentInput =
            formatNumber(
                number / 100
            );

        expression =
            currentInput;

        updateDisplay();
    }

    // ==========================================
    // PLUS MINUS
    // ==========================================

    function changeSign() {

        const number =
            Number(currentInput);

        if (!Number.isFinite(number)) {
            return;
        }

        currentInput =
            formatNumber(
                number * -1
            );

        expression =
            currentInput;

        updateDisplay();
    }

    // ==========================================
    // MEMORY
    // ==========================================

    function memoryClear() {
        memory = 0;
    }

    function memoryRecall() {

        currentInput =
            formatNumber(memory);

        expression =
            currentInput;

        justCalculated = false;

        updateDisplay();
    }

    function memoryAdd() {

        const number =
            Number(currentInput);

        if (Number.isFinite(number)) {
            memory += number;
        }
    }

    function memorySubtract() {

        const number =
            Number(currentInput);

        if (Number.isFinite(number)) {
            memory -= number;
        }
    }

    function memoryStore() {

        const number =
            Number(currentInput);

        if (Number.isFinite(number)) {
            memory = number;
        }
    }

    // ==========================================
    // SCIENTIFIC
    // ==========================================

    function scientific(type) {

        const number =
            Number(currentInput);

        if (!Number.isFinite(number)) {
            return;
        }

        let result;

        try {

            switch (type) {

                case "sin":
                    result =
                        Math.sin(
                            number *
                            Math.PI /
                            180
                        );
                    break;

                case "cos":
                    result =
                        Math.cos(
                            number *
                            Math.PI /
                            180
                        );
                    break;

                case "tan":
                    result =
                        Math.tan(
                            number *
                            Math.PI /
                            180
                        );
                    break;

                case "sqrt":
                    result =
                        Math.sqrt(number);
                    break;

                case "square":
                    result =
                        number * number;
                    break;

                case "inverse":

                    if (number === 0) {
                        throw new Error(
                            "Division by zero"
                        );
                    }

                    result =
                        1 / number;

                    break;

                case "log":
                    result =
                        Math.log10(number);
                    break;

                case "ln":
                    result =
                        Math.log(number);
                    break;

                case "abs":
                    result =
                        Math.abs(number);
                    break;

                case "exp":
                    result =
                        Math.exp(number);
                    break;

                case "factorial":

                    if (
                        number < 0 ||
                        !Number.isInteger(
                            number
                        ) ||
                        number > 170
                    ) {
                        throw new Error(
                            "Invalid factorial"
                        );
                    }

                    result = 1;

                    for (
                        let i = 2;
                        i <= number;
                        i++
                    ) {
                        result *= i;
                    }

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
                throw new Error(
                    "Invalid result"
                );
            }

            currentInput =
                formatNumber(result);

            expression =
                type.toUpperCase() +
                "(" +
                number +
                ")";

            justCalculated = true;

            updateDisplay();

        }
        catch (error) {

            currentInput =
                "ERROR";

            expression =
                "Invalid calculation";

            updateDisplay();
        }
    }

    // ==========================================
    // KEYPAD
    // ==========================================

    const keypad =
        document.getElementById(
            "keypad"
        );

    if (keypad) {

        keypad.addEventListener(
            "click",
            function(event) {

                const button =
                    event.target.closest(
                        "[data-key]"
                    );

                if (!button) {
                    return;
                }

                let key =
                    button.dataset.key;

                // AC
                if (
                    key === "AC" ||
                    key === "C"
                ) {
                    clearCalculator();
                    return;
                }

                // Equal
                if (
                    key === "="
                ) {
                    calculate();
                    return;
                }

                // Percent
                if (
                    key === "%" ||
                    key === "percent"
                ) {
                    percentage();
                    return;
                }

                // Plus minus
                if (
                    key === "+/-" ||
                    key === "±" ||
                    key === "sign"
                ) {
                    changeSign();
                    return;
                }

                key =
                    normalizeOperator(key);

                // Operator
                if (
                    ["+","-","*","/"]
                        .includes(key)
                ) {
                    inputOperator(key);
                    return;
                }

                // Number
                if (
                    /^[0-9.]$/.test(key)
                ) {
                    inputNumber(key);
                }
            }
        );
    }

    // ==========================================
    // BACKSPACE BUTTON
    // ==========================================

    const backspaceButton =
        document.getElementById(
            "backspaceBtn"
        );

    if (backspaceButton) {

        backspaceButton.addEventListener(
            "click",
            backspace
        );
    }

    // ==========================================
    // MEMORY BUTTON
    // ==========================================

    document
        .querySelectorAll(
            "[data-action]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                function() {

                    const action =
                        button.dataset.action;

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
                }
            );
        });

    // ==========================================
    // SCIENTIFIC BUTTON
    // ==========================================

    document
        .querySelectorAll(
            "[data-scientific]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                function() {

                    scientific(
                        button.dataset
                            .scientific
                    );
                }
            );
        });

    // ==========================================
    // CONSTANT
    // ==========================================

    document
        .querySelectorAll(
            "[data-constant]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                function() {

                    const value =
                        button.dataset
                            .constant;

                    if (value === "pi") {

                        currentInput =
                            String(
                                Math.PI
                            );
                    }

                    else if (
                        value === "e"
                    ) {

                        currentInput =
                            String(
                                Math.E
                            );
                    }

                    expression =
                        currentInput;

                    justCalculated =
                        false;

                    updateDisplay();
                }
            );
        });

    // ==========================================
    // KEYBOARD
    // ==========================================

    document.addEventListener(
        "keydown",
        function(event) {

            const key =
                event.key;

            // Angka
            if (
                /^[0-9]$/.test(key)
            ) {

                inputNumber(key);
                return;
            }

            // Decimal
            if (
                key === "."
            ) {

                inputNumber(".");
                return;
            }

            // Operator
            if (
                ["+","-","*","/"]
                    .includes(key)
            ) {

                inputOperator(key);
                return;
            }

            // Enter
            if (
                key === "Enter" ||
                key === "="
            ) {

                calculate();
                return;
            }

            // Escape
            if (
                key === "Escape"
            ) {

                clearCalculator();
                return;
            }

            // Backspace
            if (
                key === "Backspace"
            ) {

                backspace();
                return;
            }

            // Percent
            if (
                key === "%"
            ) {

                percentage();
            }
        }
    );

    // ==========================================
    // HISTORY
    // ==========================================

    function saveHistory() {

        try {

            localStorage.setItem(
                "cubesCalculatorHistory",
                JSON.stringify(history)
            );

        }
        catch (error) {}
    }

    function loadHistory() {

        try {

            const saved =
                localStorage.getItem(
                    "cubesCalculatorHistory"
                );

            if (saved) {

                const parsed =
                    JSON.parse(saved);

                if (
                    Array.isArray(parsed)
                ) {
                    history = parsed;
                }
            }

        }
        catch (error) {

            history = [];
        }
    }

    loadHistory();

    updateDisplay();

})();
