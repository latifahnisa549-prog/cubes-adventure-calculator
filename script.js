(() => {
    "use strict";

    // =====================================================
    // STATE
    // =====================================================

    let currentInput = "0";
    let expression = "";
    let memory = 0;
    let history = [];
    let calculationCount = 0;
    let achievementCount = 0;
    let xp = 0;

    let justCalculated = false;
    let soundEnabled = false;
    let animationEnabled = true;
    let vibrationEnabled = false;
    let decimalPlaces = "auto";

    let programmerBase = 10;

    // =====================================================
    // ELEMENTS
    // =====================================================

    const result = document.getElementById("result");
    const expressionDisplay =
        document.getElementById("expression");

    const keypad =
        document.getElementById("keypad");

    const modeSelect =
        document.getElementById("modeSelect");

    const scientificPanel =
        document.getElementById("scientificPanel");

    const programmerPanel =
        document.getElementById("programmerPanel");

    const converterPanel =
        document.getElementById("converterPanel");

    const particles =
        document.getElementById("particles");

    // =====================================================
    // DISPLAY
    // =====================================================

    function updateDisplay() {

        if (result) {
            result.textContent = currentInput;
        }

        if (expressionDisplay) {
            expressionDisplay.textContent =
                expression || "0";
        }

        updateMemoryIndicator();
    }

    function updateMemoryIndicator() {

        const indicator =
            document.getElementById(
                "memoryIndicator"
            );

        if (!indicator) return;

        indicator.textContent =
            memory !== 0 ? "M" : "";
    }

    // =====================================================
    // FORMAT NUMBER
    // =====================================================

    function formatNumber(value) {

        if (!Number.isFinite(value)) {
            return "ERROR";
        }

        let number = value;

        if (decimalPlaces !== "auto") {

            const places =
                Number(decimalPlaces);

            number =
                Number(
                    value.toFixed(places)
                );
        }
        else {

            number =
                Number(
                    value.toFixed(10)
                );
        }

        return String(number);
    }

    // =====================================================
    // OPERATOR
    // =====================================================

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

    // =====================================================
    // INPUT NUMBER
    // =====================================================

    function inputNumber(value) {

        if (
            currentInput === "ERROR" ||
            justCalculated
        ) {
            currentInput = "0";
            expression = "";
            justCalculated = false;
        }

        // Decimal
        if (value === ".") {

            if (
                currentInput.includes(".")
            ) {
                return;
            }

            currentInput += ".";

        }

        // Number
        else {

            if (
                currentInput === "0"
            ) {
                currentInput = value;
            }
            else {
                currentInput += value;
            }
        }

        // Masukkan angka ke expression
        if (expression) {

            const lastChar =
                expression.slice(-1);

            // Jika setelah operator
            if (
                ["+", "-", "*", "/"]
                    .includes(lastChar)
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

            expression =
                currentInput;
        }

        updateDisplay();
    }

    // =====================================================
    // INPUT OPERATOR
    // =====================================================

    function inputOperator(operator) {

        operator =
            normalizeOperator(operator);

        if (
            !["+","-","*","/"]
                .includes(operator)
        ) {
            return;
        }

        if (
            currentInput === "ERROR"
        ) {
            clearCalculator();
        }

        justCalculated = false;

        if (!expression) {
            expression =
                currentInput;
        }

        // Ganti operator jika ditekan 2x
        if (
            /[+\-*/]$/.test(expression)
        ) {

            expression =
                expression.slice(0, -1) +
                operator;
        }

        else {

            expression += operator;
        }

        currentInput = "0";

        updateDisplay();
        playClick();
    }

    // =====================================================
    // CALCULATOR ENGINE
    // =====================================================

    function tokenize(input) {

        const tokens = [];
        let i = 0;

        while (
            i < input.length
        ) {

            const char =
                input[i];

            if (
                /\s/.test(char)
            ) {
                i++;
                continue;
            }

            // NUMBER
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

            // OPERATOR
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

            // LEFT BRACKET
            if (char === "(") {

                tokens.push({
                    type: "left"
                });

                i++;
                continue;
            }

            // RIGHT BRACKET
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
                position >=
                tokens.length
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

            // NUMBER
            if (
                token.type === "number"
            ) {

                position++;

                return token.value;
            }

            // BRACKET
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

        const answer =
            parseExpression();

        if (
            position !==
            tokens.length
        ) {
            throw new Error(
                "Invalid expression"
            );
        }

        if (
            !Number.isFinite(answer)
        ) {
            throw new Error(
                "Invalid result"
            );
        }

        return answer;
    }

    // =====================================================
    // CALCULATE
    // =====================================================

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

            const answer =
                evaluateExpression(
                    finalExpression
                );

            const formatted =
                formatNumber(answer);

            // HISTORY
            history.unshift({
                expression:
                    finalExpression,
                result:
                    formatted,
                time:
                    new Date().toLocaleString(
                        "id-ID"
                    )
            });

            if (
                history.length > 100
            ) {
                history.pop();
            }

            currentInput =
                formatted;

            expression =
                finalExpression + " =";

            justCalculated = true;

            calculationCount++;

            addXP(10);

            saveData();
            updateStats();
            renderHistory();
            checkAchievements();

            updateDisplay();
            showToast(
                "Calculation completed!"
            );

            playClick();

        }
        catch (error) {

            currentInput =
                "ERROR";

            expression =
                "Invalid calculation";

            justCalculated =
                true;

            updateDisplay();

            showToast(
                "Perhitungan tidak valid!"
            );
        }
    }

    // =====================================================
    // CLEAR
    // =====================================================

    function clearCalculator() {

        currentInput = "0";
        expression = "";
        justCalculated = false;

        updateDisplay();
        playClick();
    }

    // =====================================================
    // BACKSPACE
    // =====================================================

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
                currentInput.slice(
                    0,
                    -1
                );
        }

        expression =
            expression.replace(
                /(-?\d*\.?\d+)$/,
                currentInput
            );

        updateDisplay();
    }

    // =====================================================
    // PERCENT
    // =====================================================

    function percentage() {

        const number =
            Number(currentInput);

        if (
            !Number.isFinite(number)
        ) {
            return;
        }

        currentInput =
            formatNumber(
                number / 100
            );

        expression =
            currentInput;

        justCalculated = false;

        updateDisplay();
    }

    // =====================================================
    // PLUS / MINUS
    // =====================================================

    function changeSign() {

        const number =
            Number(currentInput);

        if (
            !Number.isFinite(number)
        ) {
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

    // =====================================================
    // MEMORY
    // =====================================================

    function memoryClear() {

        memory = 0;

        updateMemoryIndicator();

        showToast(
            "Memory cleared"
        );
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

        if (
            Number.isFinite(number)
        ) {

            memory += number;

            updateMemoryIndicator();

            showToast(
                "Added to memory"
            );
        }
    }

    function memorySubtract() {

        const number =
            Number(currentInput);

        if (
            Number.isFinite(number)
        ) {

            memory -= number;

            updateMemoryIndicator();

            showToast(
                "Subtracted from memory"
            );
        }
    }

    function memoryStore() {

        const number =
            Number(currentInput);

        if (
            Number.isFinite(number)
        ) {

            memory = number;

            updateMemoryIndicator();

            showToast(
                "Saved to memory"
            );
        }
    }

    // =====================================================
    // SCIENTIFIC
    // =====================================================

    function scientific(type) {

        const number =
            Number(currentInput);

        if (
            !Number.isFinite(number)
        ) {
            return;
        }

        let answer;

        try {

            switch (type) {

                case "sin":
                    answer =
                        Math.sin(
                            number *
                            Math.PI /
                            180
                        );
                    break;

                case "cos":
                    answer =
                        Math.cos(
                            number *
                            Math.PI /
                            180
                        );
                    break;

                case "tan":
                    answer =
                        Math.tan(
                            number *
                            Math.PI /
                            180
                        );
                    break;

                case "asin":
                    answer =
                        Math.asin(number) *
                        180 /
                        Math.PI;
                    break;

                case "acos":
                    answer =
                        Math.acos(number) *
                        180 /
                        Math.PI;
                    break;

                case "atan":
                    answer =
                        Math.atan(number) *
                        180 /
                        Math.PI;
                    break;

                case "sqrt":

                    if (number < 0) {
                        throw new Error();
                    }

                    answer =
                        Math.sqrt(number);

                    break;

                case "square":
                    answer =
                        number * number;
                    break;

                case "power":

                    answer =
                        Math.pow(
                            number,
                            2
                        );

                    break;

                case "inverse":

                    if (number === 0) {
                        throw new Error();
                    }

                    answer =
                        1 / number;

                    break;

                case "log":

                    if (number <= 0) {
                        throw new Error();
                    }

                    answer =
                        Math.log10(number);

                    break;

                case "ln":

                    if (number <= 0) {
                        throw new Error();
                    }

                    answer =
                        Math.log(number);

                    break;

                case "exp":
                    answer =
                        Math.exp(number);
                    break;

                case "tenpow":
                    answer =
                        Math.pow(
                            10,
                            number
                        );
                    break;

                case "factorial":

                    if (
                        number < 0 ||
                        !Number.isInteger(
                            number
                        ) ||
                        number > 170
                    ) {
                        throw new Error();
                    }

                    answer = 1;

                    for (
                        let i = 2;
                        i <= number;
                        i++
                    ) {
                        answer *= i;
                    }

                    break;

                case "abs":
                    answer =
                        Math.abs(number);
                    break;

                case "random":
                    answer =
                        Math.random();
                    break;

                default:
                    return;
            }

            if (
                !Number.isFinite(answer)
            ) {
                throw new Error();
            }

            currentInput =
                formatNumber(answer);

            expression =
                type.toUpperCase() +
                "(" +
                number +
                ")";

            justCalculated = true;

            updateDisplay();

            addXP(5);

        }
        catch (error) {

            currentInput =
                "ERROR";

            expression =
                "Invalid calculation";

            updateDisplay();

            showToast(
                "Operasi scientific tidak valid"
            );
        }
    }

    // =====================================================
    // CONSTANTS
    // =====================================================

    document
        .querySelectorAll(
            "[data-constant]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const type =
                        button.dataset
                            .constant;

                    let value;

                    if (
                        type === "pi"
                    ) {
                        value =
                            Math.PI;
                    }

                    else if (
                        type === "e"
                    ) {
                        value =
                            Math.E;
                    }

                    else if (
                        type === "phi"
                    ) {
                        value =
                            (1 +
                            Math.sqrt(5)) /
                            2;
                    }

                    else {
                        return;
                    }

                    currentInput =
                        formatNumber(value);

                    expression =
                        currentInput;

                    justCalculated =
                        false;

                    updateDisplay();
                }
            );
        });

    // =====================================================
    // KEYPAD
    // =====================================================

    if (keypad) {

        keypad.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-key]"
                    );

                if (!button) {
                    return;
                }

                let key =
                    button.dataset.key;

                if (
                    key === "AC"
                ) {
                    clearCalculator();
                    return;
                }

                if (
                    key === "="
                ) {
                    calculate();
                    return;
                }

                if (
                    key === "percent"
                ) {
                    percentage();
                    return;
                }

                if (
                    key === "sign"
                ) {
                    changeSign();
                    return;
                }

                key =
                    normalizeOperator(key);

                if (
                    ["+","-","*","/"]
                        .includes(key)
                ) {

                    inputOperator(key);
                    return;
                }

                if (
                    /^[0-9.]$/.test(key)
                ) {

                    inputNumber(key);
                }
            }
        );
    }

    // =====================================================
    // MEMORY BUTTON
    // =====================================================

    document
        .querySelectorAll(
            "[data-action]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

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

    // =====================================================
    // SCIENTIFIC BUTTON
    // =====================================================

    document
        .querySelectorAll(
            "[data-scientific]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    scientific(
                        button.dataset
                            .scientific
                    );
                }
            );
        });

    // =====================================================
    // BACKSPACE
    // =====================================================

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

    // =====================================================
    // MODE SELECT
    // =====================================================

    if (modeSelect) {

        modeSelect.addEventListener(
            "change",
            () => {

                const mode =
                    modeSelect.value;

                if (
                    scientificPanel
                ) {
                    scientificPanel
                        .classList.toggle(
                            "hidden",
                            mode !==
                                "scientific"
                        );
                }

                if (
                    programmerPanel
                ) {
                    programmerPanel
                        .classList.toggle(
                            "hidden",
                            mode !==
                                "programmer"
                        );
                }

                if (
                    converterPanel
                ) {
                    converterPanel
                        .classList.toggle(
                            "hidden",
                            mode !==
                                "converter"
                        );
                }

                showToast(
                    mode.toUpperCase() +
                    " MODE"
                );
            }
        );
    }

    // =====================================================
    // PROGRAMMER CALCULATOR
    // =====================================================

    document
        .querySelectorAll(
            "[data-base]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    programmerBase =
                        Number(
                            button.dataset.base
                        );

                    document
                        .querySelectorAll(
                            "[data-base]"
                        )
                        .forEach(btn => {
                            btn.classList.remove(
                                "active"
                            );
                        });

                    button.classList.add(
                        "active"
                    );

                    updateProgrammer();
                }
            );
        });

    document
        .querySelectorAll(
            "[data-bit]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const operation =
                        button.dataset.bit;

                    programmerOperation(
                        operation
                    );
                }
            );
        });

    function updateProgrammer() {

        const element =
            document.getElementById(
                "programmerValue"
            );

        if (!element) return;

        const number =
            parseInt(
                currentInput,
                10
            );

        if (
            Number.isNaN(number)
        ) {
            element.textContent = "0";
            return;
        }

        element.textContent =
            number.toString(
                programmerBase
            ).toUpperCase();
    }

    function programmerOperation(
        operation
    ) {

        let value =
            parseInt(
                currentInput,
                programmerBase
            );

        if (
            Number.isNaN(value)
        ) {
            value = 0;
        }

        if (
            operation === "not"
        ) {
            value = ~value;
        }

        else if (
            operation === "shl"
        ) {
            value = value << 1;
        }

        else if (
            operation === "shr"
        ) {
            value = value >> 1;
        }

        else {
            showToast(
                operation.toUpperCase() +
                " siap digunakan dengan operand"
            );

            return;
        }

        currentInput =
            String(value);

        expression =
            operation.toUpperCase() +
            "(" +
            value +
            ")";

        updateDisplay();
        updateProgrammer();
    }

    // =====================================================
    // CONVERTER
    // =====================================================

    const converterCategory =
        document.getElementById(
            "converterCategory"
        );

    const converterInput =
        document.getElementById(
            "converterInput"
        );

    const converterFrom =
        document.getElementById(
            "converterFrom"
        );

    const converterTo =
        document.getElementById(
            "converterTo"
        );

    const converterOutput =
        document.getElementById(
            "converterOutput"
        );

    const units = {

        length: {
            meter: 1,
            kilometer: 1000,
            centimeter: 0.01,
            millimeter: 0.001,
            mile: 1609.344,
            yard: 0.9144,
            foot: 0.3048,
            inch: 0.0254
        },

        weight: {
            kilogram: 1,
            gram: 0.001,
            milligram: 0.000001,
            pound: 0.45359237,
            ounce: 0.0283495
        },

        area: {
            sqm: 1,
            sqkm: 1000000,
            sqcm: 0.0001,
            sqft: 0.092903
        },

        volume: {
            liter: 1,
            milliliter: 0.001,
            cubicmeter: 1000,
            gallon: 3.78541
        },

        time: {
            second: 1,
            minute: 60,
            hour: 3600,
            day: 86400
        },

        speed: {
            ms: 1,
            kmh: 0.277778,
            mph: 0.44704
        },

        data: {
            byte: 1,
            kilobyte: 1024,
            megabyte: 1048576,
            gigabyte: 1073741824
        },

        energy: {
            joule: 1,
            kilojoule: 1000,
            calorie: 4.184,
            kilocalorie: 4184
        }
    };

    const unitNames = {

        length: {
            meter: "Meter",
            kilometer: "Kilometer",
            centimeter: "Centimeter",
            millimeter: "Millimeter",
            mile: "Mile",
            yard: "Yard",
            foot: "Foot",
            inch: "Inch"
        },

        weight: {
            kilogram: "Kilogram",
            gram: "Gram",
            milligram: "Milligram",
            pound: "Pound",
            ounce: "Ounce"
        },

        area: {
            sqm: "m²",
            sqkm: "km²",
            sqcm: "cm²",
            sqft: "ft²"
        },

        volume: {
            liter: "Liter",
            milliliter: "Milliliter",
            cubicmeter: "m³",
            gallon: "Gallon"
        },

        time: {
            second: "Second",
            minute: "Minute",
            hour: "Hour",
            day: "Day"
        },

        speed: {
            ms: "m/s",
            kmh: "km/h",
            mph: "mph"
        },

        data: {
            byte: "Byte",
            kilobyte: "KB",
            megabyte: "MB",
            gigabyte: "GB"
        },

        energy: {
            joule: "Joule",
            kilojoule: "Kilojoule",
            calorie: "Calorie",
            kilocalorie: "Kilocalorie"
        }
    };

    function populateUnits() {

        if (
            !converterCategory ||
            !converterFrom ||
            !converterTo
        ) {
            return;
        }

        const category =
            converterCategory.value;

        converterFrom.innerHTML = "";
        converterTo.innerHTML = "";

        if (
            category ===
            "temperature"
        ) {

            addOption(
                converterFrom,
                "celsius",
                "Celsius"
            );

            addOption(
                converterFrom,
                "fahrenheit",
                "Fahrenheit"
            );

            addOption(
                converterFrom,
                "kelvin",
                "Kelvin"
            );

            addOption(
                converterTo,
                "celsius",
                "Celsius"
            );

            addOption(
                converterTo,
                "fahrenheit",
                "Fahrenheit"
            );

            addOption(
                converterTo,
                "kelvin",
                "Kelvin"
            );

        }
        else {

            const data =
                units[category];

            if (!data) return;

            Object.keys(data)
                .forEach(unit => {

                    addOption(
                        converterFrom,
                        unit,
                        unitNames[
                            category
                        ][unit]
                    );

                    addOption(
                        converterTo,
                        unit,
                        unitNames[
                            category
                        ][unit]
                    );
                });
        }

        convertValue();
    }

    function addOption(
        select,
        value,
        text
    ) {

        const option =
            document.createElement(
                "option"
            );

        option.value = value;
        option.textContent = text;

        select.appendChild(
            option
        );
    }

    function convertValue() {

        if (
            !converterInput ||
            !converterOutput ||
            !converterFrom ||
            !converterTo
        ) {
            return;
        }

        const value =
            Number(
                converterInput.value
            );

        if (
            Number.isNaN(value)
        ) {
            converterOutput.textContent =
                "0";

            return;
        }

        const category =
            converterCategory.value;

        const from =
            converterFrom.value;

        const to =
            converterTo.value;

        let answer;

        if (
            category ===
            "temperature"
        ) {

            answer =
                convertTemperature(
                    value,
                    from,
                    to
                );
        }

        else {

            const data =
                units[category];

            if (!data) return;

            answer =
                value *
                data[from] /
                data[to];
        }

        converterOutput.textContent =
            formatNumber(answer);
    }

    function convertTemperature(
        value,
        from,
        to
    ) {

        let celsius;

        if (
            from === "celsius"
        ) {
            celsius = value;
        }

        else if (
            from === "fahrenheit"
        ) {
            celsius =
                (value - 32) *
                5 / 9;
        }

        else {
            celsius =
                value - 273.15;
        }

        if (
            to === "celsius"
        ) {
            return celsius;
        }

        if (
            to === "fahrenheit"
        ) {
            return (
                celsius *
                9 / 5
            ) + 32;
        }

        return (
            celsius +
            273.15
        );
    }

    if (
        converterCategory
    ) {

        converterCategory.addEventListener(
            "change",
            populateUnits
        );
    }

    if (
        converterInput
    ) {

        converterInput.addEventListener(
            "input",
            convertValue
        );
    }

    if (
        converterFrom
    ) {

        converterFrom.addEventListener(
            "change",
            convertValue
        );
    }

    if (
        converterTo
    ) {

        converterTo.addEventListener(
            "change",
            convertValue
        );
    }

    // =====================================================
    // HISTORY
    // =====================================================

    function saveData() {

        localStorage.setItem(
            "cubesCalculatorHistory",
            JSON.stringify(history)
        );

        localStorage.setItem(
            "cubesCalculatorCount",
            String(calculationCount)
        );

        localStorage.setItem(
            "cubesCalculatorXP",
            String(xp)
        );
    }

    function loadData() {

        try {

            const savedHistory =
                localStorage.getItem(
                    "cubesCalculatorHistory"
                );

            if (savedHistory) {

                const parsed =
                    JSON.parse(
                        savedHistory
                    );

                if (
                    Array.isArray(parsed)
                ) {
                    history = parsed;
                }
            }

            calculationCount =
                Number(
                    localStorage.getItem(
                        "cubesCalculatorCount"
                    )
                ) || 0;

            xp =
                Number(
                    localStorage.getItem(
                        "cubesCalculatorXP"
                    )
                ) || 0;

        }
        catch (error) {

            history = [];
            calculationCount = 0;
            xp = 0;
        }
    }

    function renderHistory() {

        const list =
            document.getElementById(
                "historyList"
            );

        if (!list) return;

        if (
            history.length === 0
        ) {

            list.innerHTML =
                "<p>Belum ada riwayat.</p>";

            return;
        }

        list.innerHTML =
            history.map(
                item => `
                    <div class="history-item">
                        <div>
                            <strong>
                                ${escapeHTML(
                                    item.expression
                                )}
                            </strong>
                            <span>
                                =
                                ${escapeHTML(
                                    item.result
                                )}
                            </span>
                        </div>
                        <small>
                            ${escapeHTML(
                                item.time || ""
                            )}
                        </small>
                    </div>
                `
            ).join("");
    }

    function escapeHTML(text) {

        return String(text)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }

    const historyBtn =
        document.getElementById(
            "historyBtn"
        );

    if (historyBtn) {

        historyBtn.addEventListener(
            "click",
            () => {

                openModal(
                    "historyModal"
                );

                renderHistory();
            }
        );
    }

    const clearHistory =
        document.getElementById(
            "clearHistory"
        );

    if (clearHistory) {

        clearHistory.addEventListener(
            "click",
            () => {

                history = [];

                saveData();
                renderHistory();

                showToast(
                    "History cleared"
                );
            }
        );
    }

    // =====================================================
    // ACHIEVEMENTS
    // =====================================================

    function addXP(amount) {

        xp += amount;

        saveData();
        updateLevel();
    }

    function updateLevel() {

        const level =
            Math.floor(
                xp / 100
            ) + 1;

        const levelText =
            document.getElementById(
                "levelText"
            );

        const levelName =
            document.getElementById(
                "levelName"
            );

        const xpBar =
            document.getElementById(
                "xpBar"
            );

        const xpText =
            document.getElementById(
                "xpText"
            );

        const names = [
            "Novice Knight",
            "Apprentice Knight",
            "Knight",
            "Elite Knight",
            "Master Knight",
            "Legendary Knight"
        ];

        if (levelText) {

            levelText.textContent =
                "LEVEL " +
                String(level)
                    .padStart(
                        2,
                        "0"
                    );
        }

        if (levelName) {

            levelName.textContent =
                names[
                    Math.min(
                        level - 1,
                        names.length - 1
                    )
                ];
        }

        const currentXP =
            xp % 100;

        if (xpBar) {

            xpBar.style.width =
                currentXP + "%";
        }

        if (xpText) {

            xpText.textContent =
                currentXP +
                " / 100 XP";
        }
    }

    function updateStats() {

        const calcCount =
            document.getElementById(
                "calcCount"
            );

        const achievement =
            document.getElementById(
                "achievementCount"
            );

        if (calcCount) {

            calcCount.textContent =
                calculationCount;
        }

        if (achievement) {

            achievement.textContent =
                achievementCount;
        }
    }

    function checkAchievements() {

        let count = 0;

        if (
            calculationCount >= 1
        ) {
            count++;
        }

        if (
            calculationCount >= 10
        ) {
            count++;
        }

        if (
            calculationCount >= 50
        ) {
            count++;
        }

        if (
            calculationCount >= 100
        ) {
            count++;
        }

        achievementCount =
            count;

        updateStats();
    }

    const achievementBtn =
        document.getElementById(
            "achievementBtn"
        );

    if (achievementBtn) {

        achievementBtn.addEventListener(
            "click",
            () => {

                openModal(
                    "achievementModal"
                );

                renderAchievements();
            }
        );
    }

    function renderAchievements() {

        const list =
            document.getElementById(
                "achievementList"
            );

        if (!list) return;

        const achievements = [

            {
                title:
                    "First Calculation",
                condition:
                    calculationCount >= 1
            },

            {
                title:
                    "10 Calculations",
                condition:
                    calculationCount >= 10
            },

            {
                title:
                    "50 Calculations",
                condition:
                    calculationCount >= 50
            },

            {
                title:
                    "100 Calculations",
                condition:
                    calculationCount >= 100
            }
        ];

        list.innerHTML =
            achievements.map(
                item => `
                    <div class="achievement-item">
                        <span>
                            ${item.condition
                                ? "🏆"
                                : "🔒"}
                        </span>
                        <strong>
                            ${item.title}
                        </strong>
                    </div>
                `
            ).join("");
    }

    // =====================================================
    // MODAL
    // =====================================================

    function openModal(id) {

        const modal =
            document.getElementById(id);

        if (modal) {
            modal.classList.add(
                "show"
            );
        }
    }

    function closeModal(id) {

        const modal =
            document.getElementById(id);

        if (modal) {
            modal.classList.remove(
                "show"
            );
        }
    }

    document
        .querySelectorAll(
            "[data-close]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    closeModal(
                        button.dataset.close
                    );
                }
            );
        });

    document
        .querySelectorAll(".modal")
        .forEach(modal => {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target === modal
                    ) {

                        modal.classList.remove(
                            "show"
                        );
                    }
                }
            );
        });

    // =====================================================
    // SETTINGS
    // =====================================================

    const settingsBtn =
        document.getElementById(
            "settingsBtn"
        );

    if (settingsBtn) {

        settingsBtn.addEventListener(
            "click",
            () => {

                openModal(
                    "settingsModal"
                );
            }
        );
    }

    // =====================================================
    // THEME
    // =====================================================

    function toggleTheme() {

        document.body.classList.toggle(
            "light-theme"
        );

        const light =
            document.body.classList.contains(
                "light-theme"
            );

        localStorage.setItem(
            "calculatorTheme",
            light
                ? "light"
                : "dark"
        );

        updateThemeButton();
    }

    function updateThemeButton() {

        const themeBtn =
            document.getElementById(
                "themeBtn"
            );

        const themeSetting =
            document.getElementById(
                "themeSetting"
            );

        const light =
            document.body.classList.contains(
                "light-theme"
            );

        if (themeBtn) {

            themeBtn.textContent =
                light
                    ? "☀️"
                    : "🌙";
        }

        if (themeSetting) {

            themeSetting.textContent =
                light
                    ? "Light"
                    : "Dark";
        }
    }

    const themeBtn =
        document.getElementById(
            "themeBtn"
        );

    if (themeBtn) {

        themeBtn.addEventListener(
            "click",
            toggleTheme
        );
    }

    const themeSetting =
        document.getElementById(
            "themeSetting"
        );

    if (themeSetting) {

        themeSetting.addEventListener(
            "click",
            toggleTheme
        );
    }

    // =====================================================
    // SOUND
    // =====================================================

    function playClick() {

        if (!soundEnabled) {
            return;
        }

        try {

            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContext) {
                return;
            }

            const audio =
                new AudioContext();

            const oscillator =
                audio.createOscillator();

            const gain =
                audio.createGain();

            oscillator.frequency.value =
                500;

            gain.gain.value =
                0.04;

            oscillator.connect(gain);
            gain.connect(
                audio.destination
            );

            oscillator.start();

            oscillator.stop(
                audio.currentTime +
                0.05
            );

        }
        catch (error) {}
    }

    function updateSoundButton() {

        const soundBtn =
            document.getElementById(
                "soundBtn"
            );

        const soundSetting =
            document.getElementById(
                "soundSetting"
            );

        if (soundBtn) {

            soundBtn.textContent =
                soundEnabled
                    ? "🔊"
                    : "🔇";
        }

        if (soundSetting) {

            soundSetting.textContent =
                soundEnabled
                    ? "ON"
                    : "OFF";
        }
    }

    const soundBtn =
        document.getElementById(
            "soundBtn"
        );

    if (soundBtn) {

        soundBtn.addEventListener(
            "click",
            () => {

                soundEnabled =
                    !soundEnabled;

                updateSoundButton();
            }
        );
    }

    const soundSetting =
        document.getElementById(
            "soundSetting"
        );

    if (soundSetting) {

        soundSetting.addEventListener(
            "click",
            () => {

                soundEnabled =
                    !soundEnabled;

                updateSoundButton();
            }
        );
    }

    // =====================================================
    // ANIMATION
    // =====================================================

    const animationSetting =
        document.getElementById(
            "animationSetting"
        );

    if (animationSetting) {

        animationSetting.addEventListener(
            "click",
            () => {

                animationEnabled =
                    !animationEnabled;

                document.body.classList.toggle(
                    "no-animation",
                    !animationEnabled
                );

                animationSetting.textContent =
                    animationEnabled
                        ? "ON"
                        : "OFF";
            }
        );
    }

    // =====================================================
    // VIBRATION
    // =====================================================

    const vibrationSetting =
        document.getElementById(
            "vibrationSetting"
        );

    if (vibrationSetting) {

        vibrationSetting.addEventListener(
            "click",
            () => {

                vibrationEnabled =
                    !vibrationEnabled;

                vibrationSetting.textContent =
                    vibrationEnabled
                        ? "ON"
                        : "OFF";

                if (
                    vibrationEnabled &&
                    navigator.vibrate
                ) {

                    navigator.vibrate(50);
                }
            }
        );
    }

    // =====================================================
    // DECIMAL
    // =====================================================

    const decimalSetting =
        document.getElementById(
            "decimalSetting"
        );

    if (decimalSetting) {

        decimalSetting.addEventListener(
            "change",
            () => {

                decimalPlaces =
                    decimalSetting.value;

                updateDisplay();
            }
        );
    }

    // =====================================================
    // RESET DATA
    // =====================================================

    const resetData =
        document.getElementById(
            "resetData"
        );

    if (resetData) {

        resetData.addEventListener(
            "click",
            () => {

                const confirmed =
                    confirm(
                        "Reset semua data kalkulator?"
                    );

                if (!confirmed) {
                    return;
                }

                localStorage.clear();

                history = [];
                calculationCount = 0;
                achievementCount = 0;
                xp = 0;
                memory = 0;

                currentInput = "0";
                expression = "";

                updateDisplay();
                updateStats();
                updateLevel();
                renderHistory();

                showToast(
                    "Semua data berhasil direset"
                );
            }
        );
    }

    // =====================================================
    // TOAST
    // =====================================================

    function showToast(message) {

        const container =
            document.getElementById(
                "toastContainer"
            );

        if (!container) {
            return;
        }

        const toast =
            document.createElement(
                "div"
            );

        toast.className =
            "toast";

        toast.textContent =
            message;

        container.appendChild(
            toast
        );

        setTimeout(
            () => {

                toast.remove();

            },
            2500
        );
    }

    // =====================================================
    // PARTICLES
    // =====================================================

    function createParticles() {

        if (!particles) {
            return;
        }

        particles.innerHTML = "";

        for (
            let i = 0;
            i < 25;
            i++
        ) {

            const particle =
                document.createElement(
                    "span"
                );

            particle.style.left =
                Math.random() * 100 +
                "%";

            particle.style.top =
                Math.random() * 100 +
                "%";

            particle.style.animationDelay =
                Math.random() * 5 +
                "s";

            particles.appendChild(
                particle
            );
        }
    }

    // =====================================================
    // KEYBOARD
    // =====================================================

    document.addEventListener(
        "keydown",
        event => {

            const key =
                event.key;

            if (
                /^[0-9]$/.test(key)
            ) {

                inputNumber(key);
                return;
            }

            if (
                key === "."
            ) {

                inputNumber(".");
                return;
            }

            if (
                ["+","-","*","/"]
                    .includes(key)
            ) {

                inputOperator(key);
                return;
            }

            if (
                key === "Enter" ||
                key === "="
            ) {

                event.preventDefault();

                calculate();
                return;
            }

            if (
                key === "Escape"
            ) {

                clearCalculator();
                return;
            }

            if (
                key === "Backspace"
            ) {

                backspace();
                return;
            }

            if (
                key === "%"
            ) {

                percentage();
            }
        }
    );

    // =====================================================
    // INITIALIZE
    // =====================================================

    loadData();

    renderHistory();

    updateDisplay();

    updateStats();

    updateLevel();

    updateThemeButton();

    updateSoundButton();

    populateUnits();

    createParticles();

})();
