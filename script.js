"use strict";

/* =========================================================
   CUBES ADVENTURE KNIGHT
   FULL FUNCTIONAL CALCULATOR
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENT
       ===================================================== */

    const resultEl = document.getElementById("result");
    const expressionEl = document.getElementById("expression");
    const memoryIndicator = document.getElementById("memoryIndicator");

    const modeSelect = document.getElementById("modeSelect");

    const scientificPanel =
        document.getElementById("scientificPanel");

    const programmerPanel =
        document.getElementById("programmerPanel");

    const converterPanel =
        document.getElementById("converterPanel");

    const keypad =
        document.getElementById("keypad");

    const calcCountEl =
        document.getElementById("calcCount");

    const achievementCountEl =
        document.getElementById("achievementCount");

    const levelTextEl =
        document.getElementById("levelText");

    const levelNameEl =
        document.getElementById("levelName");

    const xpBarEl =
        document.getElementById("xpBar");

    const xpTextEl =
        document.getElementById("xpText");

    const knightMessage =
        document.getElementById("knightMessage");

    const programmerValue =
        document.getElementById("programmerValue");

    /* =====================================================
       STATE
       ===================================================== */

    let currentValue = "0";
    let expression = "";

    let firstNumber = null;
    let pendingOperator = null;
    let waitingForSecond = false;

    let memory = 0;

    let history = loadJSON(
        "cubesKnightHistory",
        []
    );

    let totalCalculations =
        Number(
            localStorage.getItem(
                "cubesKnightCalculations"
            )
        ) || 0;

    let xp =
        Number(
            localStorage.getItem(
                "cubesKnightXP"
            )
        ) || 0;

    let achievements =
        loadJSON(
            "cubesKnightAchievements",
            []
        );

    let soundEnabled =
        localStorage.getItem(
            "cubesKnightSound"
        ) === "true";

    let animationEnabled =
        localStorage.getItem(
            "cubesKnightAnimation"
        ) !== "false";

    let vibrationEnabled =
        localStorage.getItem(
            "cubesKnightVibration"
        ) === "true";

    let decimalPlaces =
        localStorage.getItem(
            "cubesKnightDecimal"
        ) || "auto";

    let programmerBase = 10;

    /* =====================================================
       LEVEL SYSTEM
       ===================================================== */

    const levels = [
        {
            level: 1,
            name: "Novice Knight",
            xp: 100
        },
        {
            level: 2,
            name: "Cube Apprentice",
            xp: 250
        },
        {
            level: 3,
            name: "Cube Warrior",
            xp: 500
        },
        {
            level: 4,
            name: "Crystal Knight",
            xp: 800
        },
        {
            level: 5,
            name: "Shadow Knight",
            xp: 1200
        },
        {
            level: 6,
            name: "Royal Knight",
            xp: 1700
        },
        {
            level: 7,
            name: "Legendary Cube Knight",
            xp: 2300
        },
        {
            level: 8,
            name: "Master of Numbers",
            xp: 3000
        }
    ];

    /* =====================================================
       BASIC DISPLAY
       ===================================================== */

    function updateDisplay() {

        if (resultEl) {
            resultEl.textContent =
                currentValue;
        }

        if (expressionEl) {
            expressionEl.textContent =
                expression || "0";
        }

        updateMemoryIndicator();
        updateProgrammerDisplay();
    }

    function formatNumber(number) {

        if (!Number.isFinite(number)) {
            return "ERROR";
        }

        if (decimalPlaces === "auto") {

            return Number(
                number.toPrecision(12)
            ).toString();

        }

        const places =
            Number(decimalPlaces);

        return Number(
            number.toFixed(places)
        ).toString();
    }

    function cleanNumber(number) {

        if (
            Object.is(number, -0)
        ) {
            return 0;
        }

        return number;
    }

    /* =====================================================
       BASIC INPUT
       ===================================================== */

    function inputDigit(digit) {

        if (
            currentValue === "ERROR" ||
            waitingForSecond
        ) {

            currentValue = digit;
            waitingForSecond = false;

        } else {

            if (
                currentValue === "0"
            ) {

                currentValue = digit;

            } else {

                currentValue += digit;
            }
        }

        updateDisplay();
        clickSound();
    }

    function inputDecimal() {

        if (
            currentValue === "ERROR" ||
            waitingForSecond
        ) {

            currentValue = "0.";
            waitingForSecond = false;

        } else if (
            !currentValue.includes(".")
        ) {

            currentValue += ".";
        }

        updateDisplay();
        clickSound();
    }

    function inputOperator(operator) {

        const value =
            Number(currentValue);

        if (
            !Number.isFinite(value)
        ) {
            showError(
                "Invalid number"
            );
            return;
        }

        if (
            pendingOperator &&
            !waitingForSecond
        ) {

            const calculated =
                performCalculation(
                    firstNumber,
                    value,
                    pendingOperator
                );

            if (
                calculated === null
            ) {
                return;
            }

            firstNumber =
                calculated;

            currentValue =
                formatNumber(calculated);

        } else {

            firstNumber =
                value;
        }

        pendingOperator =
            operator;

        waitingForSecond = true;

        expression =
            `${formatNumber(firstNumber)} ${operatorSymbol(operator)}`;

        updateDisplay();
        clickSound();
    }

    function calculate() {

        if (
            pendingOperator === null ||
            firstNumber === null
        ) {
            return;
        }

        const secondNumber =
            Number(currentValue);

        if (
            !Number.isFinite(secondNumber)
        ) {
            showError(
                "Invalid number"
            );
            return;
        }

        const oldExpression =
            `${formatNumber(firstNumber)} ${operatorSymbol(pendingOperator)} ${formatNumber(secondNumber)}`;

        const answer =
            performCalculation(
                firstNumber,
                secondNumber,
                pendingOperator
            );

        if (
            answer === null
        ) {
            return;
        }

        currentValue =
            formatNumber(answer);

        expression =
            `${oldExpression} =`;

        firstNumber =
            answer;

        pendingOperator = null;
        waitingForSecond = true;

        calculationComplete(
            oldExpression,
            currentValue
        );

        updateDisplay();

        equalSound();
    }

    function performCalculation(
        a,
        b,
        operator
    ) {

        let answer;

        switch (operator) {

            case "+":
                answer = a + b;
                break;

            case "-":
                answer = a - b;
                break;

            case "*":
                answer = a * b;
                break;

            case "/":

                if (b === 0) {

                    showError(
                        "Impossible move! Tidak bisa dibagi 0."
                    );

                    return null;
                }

                answer = a / b;
                break;

            case "%":
                answer = a % b;
                break;

            default:
                return null;
        }

        if (
            !Number.isFinite(answer)
        ) {

            showError(
                "Hasil terlalu besar."
            );

            return null;
        }

        return cleanNumber(answer);
    }

    function operatorSymbol(operator) {

        const symbols = {
            "+": "+",
            "-": "−",
            "*": "×",
            "/": "÷",
            "%": "mod"
        };

        return symbols[operator] || operator;
    }

    /* =====================================================
       AC / DELETE / PERCENT / SIGN
       ===================================================== */

    function clearAll() {

        currentValue = "0";
        expression = "";

        firstNumber = null;
        pendingOperator = null;
        waitingForSecond = false;

        updateDisplay();
        clickSound();
    }

    function backspace() {

        if (
            currentValue === "ERROR" ||
            waitingForSecond
        ) {
            currentValue = "0";
            updateDisplay();
            return;
        }

        if (
            currentValue.length <= 1
        ) {

            currentValue = "0";

        } else {

            currentValue =
                currentValue.slice(
                    0,
                    -1
                );
        }

        updateDisplay();
    }

    function percentage() {

        const number =
            Number(currentValue);

        if (
            !Number.isFinite(number)
        ) {
            return;
        }

        currentValue =
            formatNumber(
                number / 100
            );

        updateDisplay();
    }

    function toggleSign() {

        const number =
            Number(currentValue);

        if (
            !Number.isFinite(number) ||
            number === 0
        ) {
            return;
        }

        currentValue =
            formatNumber(
                number * -1
            );

        updateDisplay();
    }

    /* =====================================================
       KEYPAD CLICK
       ===================================================== */

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

                const key =
                    button.dataset.key;

                if (
                    /^[0-9]$/.test(key)
                ) {

                    inputDigit(key);
                    return;
                }

                if (
                    key === "."
                ) {

                    inputDecimal();
                    return;
                }

                if (
                    key === "AC"
                ) {

                    clearAll();
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

                    toggleSign();
                    return;
                }

                if (
                    key === "="
                ) {

                    calculate();
                    return;
                }

                if (
                    ["+", "-", "*", "/"]
                        .includes(key)
                ) {

                    inputOperator(key);
                }
            }
        );
    }

    /* =====================================================
       BACKSPACE
       ===================================================== */

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

    /* =====================================================
       MEMORY
       ===================================================== */

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

                    const value =
                        Number(currentValue);

                    switch (action) {

                        case "mc":

                            memory = 0;

                            showToast(
                                "Memory cleared"
                            );

                            break;

                        case "mr":

                            currentValue =
                                formatNumber(
                                    memory
                                );

                            waitingForSecond =
                                false;

                            showToast(
                                "Memory recalled"
                            );

                            break;

                        case "mplus":

                            if (
                                Number.isFinite(value)
                            ) {

                                memory += value;

                                showToast(
                                    "Memory + " +
                                    formatNumber(value)
                                );
                            }

                            break;

                        case "mminus":

                            if (
                                Number.isFinite(value)
                            ) {

                                memory -= value;

                                showToast(
                                    "Memory − " +
                                    formatNumber(value)
                                );
                            }

                            break;

                        case "ms":

                            if (
                                Number.isFinite(value)
                            ) {

                                memory = value;

                                showToast(
                                    "Memory saved"
                                );
                            }

                            break;
                    }

                    updateDisplay();
                }
            );
        });

    function updateMemoryIndicator() {

        if (!memoryIndicator) {
            return;
        }

        if (memory !== 0) {

            memoryIndicator.textContent =
                `MEMORY: ${formatNumber(memory)}`;

        } else {

            memoryIndicator.textContent =
                "";
        }
    }

    /* =====================================================
       SCIENTIFIC
       ===================================================== */

    document
        .querySelectorAll(
            "[data-scientific]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const operation =
                        button.dataset.scientific;

                    scientificOperation(
                        operation
                    );
                }
            );
        });

    document
        .querySelectorAll(
            "[data-constant]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const constant =
                        button.dataset.constant;

                    let value = 0;

                    if (
                        constant === "pi"
                    ) {
                        value = Math.PI;
                    }

                    if (
                        constant === "e"
                    ) {
                        value = Math.E;
                    }

                    if (
                        constant === "phi"
                    ) {
                        value =
                            (1 + Math.sqrt(5)) /
                            2;
                    }

                    currentValue =
                        formatNumber(value);

                    expression =
                        constant.toUpperCase();

                    waitingForSecond = true;

                    updateDisplay();

                    unlockAchievement(
                        "science"
                    );
                }
            );
        });

    function scientificOperation(
        operation
    ) {

        const value =
            Number(currentValue);

        if (
            !Number.isFinite(value)
        ) {
            showError(
                "Invalid number"
            );
            return;
        }

        let answer;

        try {

            switch (operation) {

                case "sqrt":

                    if (value < 0) {
                        throw new Error(
                            "Square root negatif"
                        );
                    }

                    answer =
                        Math.sqrt(value);

                    break;

                case "square":

                    answer =
                        value * value;

                    break;

                case "inverse":

                    if (value === 0) {
                        throw new Error(
                            "Cannot divide by zero"
                        );
                    }

                    answer =
                        1 / value;

                    break;

                case "sin":

                    answer =
                        Math.sin(
                            value *
                            Math.PI /
                            180
                        );

                    break;

                case "cos":

                    answer =
                        Math.cos(
                            value *
                            Math.PI /
                            180
                        );

                    break;

                case "tan":

                    answer =
                        Math.tan(
                            value *
                            Math.PI /
                            180
                        );

                    break;

                case "asin":

                    if (
                        value < -1 ||
                        value > 1
                    ) {
                        throw new Error();
                    }

                    answer =
                        Math.asin(value) *
                        180 /
                        Math.PI;

                    break;

                case "acos":

                    if (
                        value < -1 ||
                        value > 1
                    ) {
                        throw new Error();
                    }

                    answer =
                        Math.acos(value) *
                        180 /
                        Math.PI;

                    break;

                case "atan":

                    answer =
                        Math.atan(value) *
                        180 /
                        Math.PI;

                    break;

                case "log":

                    if (value <= 0) {
                        throw new Error();
                    }

                    answer =
                        Math.log10(value);

                    break;

                case "ln":

                    if (value <= 0) {
                        throw new Error();
                    }

                    answer =
                        Math.log(value);

                    break;

                case "exp":

                    answer =
                        Math.exp(value);

                    break;

                case "tenpow":

                    answer =
                        Math.pow(10, value);

                    break;

                case "factorial":

                    answer =
                        factorial(value);

                    break;

                case "abs":

                    answer =
                        Math.abs(value);

                    break;

                case "random":

                    answer =
                        Math.random();

                    break;

                case "power":

                    /*
                     * xʸ:
                     * tekan xʸ → masukkan pangkat → =
                     */

                    firstNumber =
                        value;

                    pendingOperator =
                        "power";

                    waitingForSecond =
                        true;

                    expression =
                        `${formatNumber(value)} ^`;

                    updateDisplay();

                    return;

                case "mod":

                    firstNumber =
                        value;

                    pendingOperator =
                        "%";

                    waitingForSecond =
                        true;

                    expression =
                        `${formatNumber(value)} mod`;

                    updateDisplay();

                    return;

                default:
                    return;
            }

            if (
                !Number.isFinite(answer)
            ) {

                throw new Error();
            }

            const oldValue =
                currentValue;

            currentValue =
                formatNumber(answer);

            expression =
                `${operation.toUpperCase()}(${oldValue}) =`;

            waitingForSecond =
                true;

            totalCalculations++;

            addXP(10);

            unlockAchievement(
                "science"
            );

            saveAll();
            updateLevel();
            updateStats();
            updateDisplay();

            showToast(
                "⚔ Calculation Complete! +10 XP"
            );

        }
        catch (error) {

            showError(
                "Oops! Check your equation."
            );
        }
    }

    function factorial(number) {

        if (
            number < 0 ||
            !Number.isInteger(number)
        ) {
            throw new Error();
        }

        if (
            number > 170
        ) {
            throw new Error();
        }

        let answer = 1;

        for (
            let i = 2;
            i <= number;
            i++
        ) {

            answer *= i;
        }

        return answer;
    }

    /* =====================================================
       POWER SUPPORT
       ===================================================== */

    const originalCalculate =
        calculate;

    function calculatePowerIfNeeded() {

        if (
            pendingOperator !== "power"
        ) {
            return false;
        }

        const second =
            Number(currentValue);

        if (
            !Number.isFinite(second)
        ) {
            showError(
                "Invalid exponent"
            );

            return true;
        }

        const answer =
            Math.pow(
                firstNumber,
                second
            );

        if (
            !Number.isFinite(answer)
        ) {

            showError(
                "Hasil terlalu besar"
            );

            return true;
        }

        const oldExpression =
            `${formatNumber(firstNumber)} ^ ${formatNumber(second)}`;

        currentValue =
            formatNumber(answer);

        expression =
            `${oldExpression} =`;

        firstNumber =
            answer;

        pendingOperator = null;
        waitingForSecond = true;

        calculationComplete(
            oldExpression,
            currentValue
        );

        return true;
    }

    /*
     * Override calculate supaya xʸ ikut bekerja.
     */
    function calculateFinal() {

        if (
            pendingOperator === "power"
        ) {

            calculatePowerIfNeeded();

            updateDisplay();

            return;
        }

        originalCalculate();
    }

    /*
     * Ganti event tombol "="
     */
    if (keypad) {

        keypad.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        '[data-key="="]'
                    );

                if (!button) {
                    return;
                }

                /*
                 * event listener pertama sudah
                 * menjalankan calculate().
                 *
                 * Jika power, koreksi hasilnya.
                 */
                if (
                    pendingOperator ===
                    "power"
                ) {

                    calculatePowerIfNeeded();
                    updateDisplay();
                }
            }
        );
    }

    /* =====================================================
       MODE
       ===================================================== */

    if (modeSelect) {

        modeSelect.addEventListener(
            "change",
            () => {

                const mode =
                    modeSelect.value;

                scientificPanel
                    ?.classList.toggle(
                        "hidden",
                        mode !==
                        "scientific"
                    );

                programmerPanel
                    ?.classList.toggle(
                        "hidden",
                        mode !==
                        "programmer"
                    );

                converterPanel
                    ?.classList.toggle(
                        "hidden",
                        mode !==
                        "converter"
                    );

                if (
                    mode === "scientific"
                ) {

                    unlockAchievement(
                        "science"
                    );
                }

                if (
                    mode === "programmer"
                ) {

                    updateProgrammerDisplay();
                }

                showToast(
                    mode.toUpperCase() +
                    " MODE"
                );
            }
        );
    }

    /* =====================================================
       PROGRAMMER
       ===================================================== */

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
                        .forEach(
                            btn =>
                                btn.classList.remove(
                                    "active"
                                )
                        );

                    button.classList.add(
                        "active"
                    );

                    updateProgrammerDisplay();
                }
            );
        });

    function getProgrammerNumber() {

        let text =
            String(currentValue)
                .replace(
                    /[^0-9A-Fa-f-]/g,
                    ""
                );

        if (!text) {
            return 0;
        }

        const number =
            parseInt(
                text,
                programmerBase
            );

        return Number.isNaN(number)
            ? 0
            : number;
    }

    function updateProgrammerDisplay() {

        if (!programmerValue) {
            return;
        }

        const number =
            getProgrammerNumber();

        programmerValue.textContent =
            number
                .toString(
                    programmerBase
                )
                .toUpperCase();
    }

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

    function programmerOperation(
        operation
    ) {

        let a =
            getProgrammerNumber();

        let b;

        if (
            operation === "not"
        ) {

            a = ~a;

        } else if (
            operation === "shl"
        ) {

            a = a << 1;

        } else if (
            operation === "shr"
        ) {

            a = a >> 1;

        } else {

            const input =
                prompt(
                    `Masukkan angka kedua untuk ${operation.toUpperCase()}:`
                );

            if (
                input === null
            ) {
                return;
            }

            b =
                parseInt(
                    input,
                    programmerBase
                );

            if (
                Number.isNaN(b)
            ) {

                showError(
                    "Angka programmer tidak valid."
                );

                return;
            }

            if (
                operation === "and"
            ) {
                a = a & b;
            }

            else if (
                operation === "or"
            ) {
                a = a | b;
            }

            else if (
                operation === "xor"
            ) {
                a = a ^ b;
            }
        }

        currentValue =
            a.toString(
                programmerBase
            ).toUpperCase();

        expression =
            `${operation.toUpperCase()} =`;

        updateProgrammerDisplay();
        updateDisplay();

        showToast(
            `Result: ${currentValue}`
        );
    }

    /* =====================================================
       CONVERTER
       ===================================================== */

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

    const conversionData = {

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
            ounce: 0.028349523125
        },

        area: {
            sqm: 1,
            sqkm: 1000000,
            sqcm: 0.0001,
            sqft: 0.09290304
        },

        volume: {
            liter: 1,
            milliliter: 0.001,
            cubicmeter: 1000,
            gallon: 3.785411784
        },

        time: {
            second: 1,
            minute: 60,
            hour: 3600,
            day: 86400
        },

        speed: {
            ms: 1,
            kmh: 0.2777777778,
            mph: 0.44704
        },

        data: {
            byte: 1,
            kilobyte: 1024,
            megabyte: 1024 ** 2,
            gigabyte: 1024 ** 3
        },

        energy: {
            joule: 1,
            kilojoule: 1000,
            calorie: 4.184,
            kilocalorie: 4184
        }
    };

    const unitLabels = {

        meter: "Meter",
        kilometer: "Kilometer",
        centimeter: "Centimeter",
        millimeter: "Millimeter",
        mile: "Mile",
        yard: "Yard",
        foot: "Foot",
        inch: "Inch",

        kilogram: "Kilogram",
        gram: "Gram",
        milligram: "Milligram",
        pound: "Pound",
        ounce: "Ounce",

        sqm: "m²",
        sqkm: "km²",
        sqcm: "cm²",
        sqft: "ft²",

        liter: "Liter",
        milliliter: "Milliliter",
        cubicmeter: "m³",
        gallon: "Gallon",

        second: "Second",
        minute: "Minute",
        hour: "Hour",
        day: "Day",

        ms: "m/s",
        kmh: "km/h",
        mph: "mph",

        byte: "Byte",
        kilobyte: "KB",
        megabyte: "MB",
        gigabyte: "GB",

        joule: "Joule",
        kilojoule: "Kilojoule",
        calorie: "Calorie",
        kilocalorie: "Kilocalorie"
    };

    function populateConverterUnits() {

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

            addUnit(
                converterFrom,
                "celsius",
                "Celsius"
            );

            addUnit(
                converterFrom,
                "fahrenheit",
                "Fahrenheit"
            );

            addUnit(
                converterFrom,
                "kelvin",
                "Kelvin"
            );

            addUnit(
                converterTo,
                "celsius",
                "Celsius"
            );

            addUnit(
                converterTo,
                "fahrenheit",
                "Fahrenheit"
            );

            addUnit(
                converterTo,
                "kelvin",
                "Kelvin"
            );

        } else {

            const units =
                conversionData[
                    category
                ];

            if (!units) {
                return;
            }

            Object.keys(units)
                .forEach(unit => {

                    addUnit(
                        converterFrom,
                        unit,
                        unitLabels[unit]
                    );

                    addUnit(
                        converterTo,
                        unit,
                        unitLabels[unit]
                    );
                });
        }

        convert();
    }

    function addUnit(
        select,
        value,
        label
    ) {

        const option =
            document.createElement(
                "option"
            );

        option.value = value;
        option.textContent = label;

        select.appendChild(
            option
        );
    }

    function convert() {

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

            converterOutput.value = "";
            converterOutput.textContent =
                "Invalid";

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

        } else {

            const data =
                conversionData[
                    category
                ];

            answer =
                value *
                data[from] /
                data[to];
        }

        const formatted =
            formatNumber(answer);

        converterOutput.value =
            formatted;

        converterOutput.textContent =
            formatted;
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

        } else if (
            from === "fahrenheit"
        ) {

            celsius =
                (value - 32) *
                5 / 9;

        } else {

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

        return celsius + 273.15;
    }

    converterCategory?.addEventListener(
        "change",
        populateConverterUnits
    );

    converterInput?.addEventListener(
        "input",
        convert
    );

    converterFrom?.addEventListener(
        "change",
        convert
    );

    converterTo?.addEventListener(
        "change",
        convert
    );

    /* =====================================================
       HISTORY
       ===================================================== */

    function calculationComplete(
        expressionText,
        resultText
    ) {

        totalCalculations++;

        addXP(10);

        history.unshift({
            expression:
                expressionText,
            result:
                resultText,
            timestamp:
                new Date().toLocaleString(
                    "id-ID"
                )
        });

        if (
            history.length > 100
        ) {

            history =
                history.slice(
                    0,
                    100
                );
        }

        saveAll();

        updateStats();
        updateLevel();

        unlockAchievement(
            "first"
        );

        if (
            totalCalculations >= 10
        ) {

            unlockAchievement(
                "speed"
            );
        }

        if (
            totalCalculations >= 100
        ) {

            unlockAchievement(
                "warrior"
            );
        }

        showKnightMessage(
            "⚔ Calculation Complete! +10 XP"
        );
    }

    function renderHistory() {

        const list =
            document.getElementById(
                "historyList"
            );

        if (!list) {
            return;
        }

        if (
            history.length === 0
        ) {

            list.innerHTML =
                `<p>Belum ada riwayat perhitungan.</p>`;

            return;
        }

        list.innerHTML =
            history
                .map(
                    (item, index) => `
                    <div class="history-item"
                         data-history-index="${index}">
                        <div>
                            <strong>
                                ${escapeHTML(
                                    item.expression
                                )}
                            </strong>
                            <span>
                                = ${escapeHTML(
                                    item.result
                                )}
                            </span>
                            <small>
                                ${escapeHTML(
                                    item.timestamp || ""
                                )}
                            </small>
                        </div>

                        <button
                            class="history-use"
                            data-history-use="${index}">
                            USE
                        </button>

                        <button
                            class="history-delete"
                            data-history-delete="${index}">
                            ×
                        </button>
                    </div>
                `
                )
                .join("");

        list
            .querySelectorAll(
                "[data-history-use]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        const index =
                            Number(
                                button.dataset
                                    .historyUse
                            );

                        const item =
                            history[index];

                        if (!item) {
                            return;
                        }

                        currentValue =
                            item.result;

                        expression =
                            item.expression;

                        waitingForSecond =
                            false;

                        updateDisplay();

                        closeModal(
                            "historyModal"
                        );
                    }
                );
            });

        list
            .querySelectorAll(
                "[data-history-delete]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        const index =
                            Number(
                                button.dataset
                                    .historyDelete
                            );

                        history.splice(
                            index,
                            1
                        );

                        saveAll();

                        renderHistory();
                    }
                );
            });
    }

    const historyBtn =
        document.getElementById(
            "historyBtn"
        );

    historyBtn?.addEventListener(
        "click",
        () => {

            renderHistory();

            openModal(
                "historyModal"
            );
        }
    );

    const clearHistory =
        document.getElementById(
            "clearHistory"
        );

    clearHistory?.addEventListener(
        "click",
        () => {

            history = [];

            saveAll();

            renderHistory();

            showToast(
                "History cleared"
            );
        }
    );

    /* =====================================================
       ACHIEVEMENT
       ===================================================== */

    const achievementDefinitions = {

        first: {
            title:
                "FIRST CALCULATION",
            description:
                "Melakukan perhitungan pertama."
        },

        speed: {
            title:
                "SPEED KNIGHT",
            description:
                "Melakukan 10 perhitungan."
        },

        warrior: {
            title:
                "MATH WARRIOR",
            description:
                "Melakukan 100 perhitungan."
        },

        science: {
            title:
                "SCIENCE KNIGHT",
            description:
                "Menggunakan scientific calculator."
        },

        cube: {
            title:
                "CUBE MASTER",
            description:
                "Mencapai Level 10."
        }
    };

    function unlockAchievement(id) {

        if (
            !achievementDefinitions[id]
        ) {
            return;
        }

        if (
            achievements.includes(id)
        ) {
            return;
        }

        achievements.push(id);

        saveAll();

        showToast(
            "🏆 ACHIEVEMENT UNLOCKED!"
        );

        updateStats();

        renderAchievements();
    }

    function renderAchievements() {

        const list =
            document.getElementById(
                "achievementList"
            );

        if (!list) {
            return;
        }

        list.innerHTML =
            Object.keys(
                achievementDefinitions
            )
            .map(id => {

                const item =
                    achievementDefinitions[id];

                const unlocked =
                    achievements.includes(
                        id
                    );

                return `
                    <div class="achievement-item">
                        <strong>
                            ${unlocked ? "🏆" : "🔒"}
                            ${item.title}
                        </strong>
                        <span>
                            ${item.description}
                        </span>
                    </div>
                `;

            })
            .join("");

        updateStats();
    }

    const achievementBtn =
        document.getElementById(
            "achievementBtn"
        );

    achievementBtn?.addEventListener(
        "click",
        () => {

            renderAchievements();

            openModal(
                "achievementModal"
            );
        }
    );

    /* =====================================================
       XP / LEVEL
       ===================================================== */

    function addXP(amount) {

        const oldLevel =
            getCurrentLevel();

        xp += amount;

        localStorage.setItem(
            "cubesKnightXP",
            String(xp)
        );

        const newLevel =
            getCurrentLevel();

        if (
            newLevel.level >
            oldLevel.level
        ) {

            showKnightMessage(
                "⚔ LEVEL UP!"
            );

            showToast(
                "⚔ LEVEL UP! " +
                newLevel.name
            );

            if (
                newLevel.level >= 10
            ) {

                unlockAchievement(
                    "cube"
                );
            }
        }

        updateLevel();
    }

    function getCurrentLevel() {

        let current =
            levels[0];

        for (
            const level of levels
        ) {

            if (
                xp >= level.xp
            ) {

                current = level;
            }
        }

        return current;
    }

    function updateLevel() {

        const current =
            getCurrentLevel();

        const previousXP =
            current === levels[0]
                ? 0
                : levels[
                    current.level - 2
                  ].xp;

        const nextXP =
            current.xp;

        const progress =
            Math.max(
                0,
                xp - previousXP
            );

        const needed =
            Math.max(
                1,
                nextXP - previousXP
            );

        const percent =
            Math.min(
                100,
                (progress / needed) *
                100
            );

        if (levelTextEl) {

            levelTextEl.textContent =
                `LEVEL ${String(
                    current.level
                ).padStart(2, "0")}`;
        }

        if (levelNameEl) {

            levelNameEl.textContent =
                current.name;
        }

        if (xpBarEl) {

            xpBarEl.style.width =
                `${percent}%`;
        }

        if (xpTextEl) {

            xpTextEl.textContent =
                `${progress} / ${needed} XP`;
        }
    }

    function updateStats() {

        if (calcCountEl) {

            calcCountEl.textContent =
                totalCalculations;
        }

        if (achievementCountEl) {

            achievementCountEl.textContent =
                achievements.length;
        }
    }

    /* =====================================================
       MODAL
       ===================================================== */

    function openModal(id) {

        const modal =
            document.getElementById(id);

        if (modal) {

            modal.classList.add(
                "show"
            );

            modal.style.display =
                "flex";
        }
    }

    function closeModal(id) {

        const modal =
            document.getElementById(id);

        if (modal) {

            modal.classList.remove(
                "show"
            );

            modal.style.display =
                "";
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
        .querySelectorAll(
            ".modal"
        )
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

                        modal.style.display =
                            "";
                    }
                }
            );
        });

    /* =====================================================
       THEME
       ===================================================== */

    const themeBtn =
        document.getElementById(
            "themeBtn"
        );

    const themeSetting =
        document.getElementById(
            "themeSetting"
        );

    function toggleTheme() {

        const light =
            document.body.classList.toggle(
                "light-theme"
            );

        localStorage.setItem(
            "cubesKnightTheme",
            light
                ? "light"
                : "dark"
        );

        updateThemeUI();
    }

    function updateThemeUI() {

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

    themeBtn?.addEventListener(
        "click",
        toggleTheme
    );

    themeSetting?.addEventListener(
        "click",
        toggleTheme
    );

    /* =====================================================
       SOUND
       ===================================================== */

    const soundBtn =
        document.getElementById(
            "soundBtn"
        );

    const soundSetting =
        document.getElementById(
            "soundSetting"
        );

    function updateSoundUI() {

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

    function createTone(
        frequency,
        duration
    ) {

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
                frequency;

            oscillator.type =
                "sine";

            gain.gain.setValueAtTime(
                0.04,
                audio.currentTime
            );

            oscillator.connect(gain);
            gain.connect(
                audio.destination
            );

            oscillator.start();

            oscillator.stop(
                audio.currentTime +
                duration
            );

        } catch (error) {}
    }

    function clickSound() {
        createTone(450, 0.04);
    }

    function equalSound() {
        createTone(800, 0.12);
    }

    soundBtn?.addEventListener(
        "click",
        () => {

            soundEnabled =
                !soundEnabled;

            localStorage.setItem(
                "cubesKnightSound",
                String(soundEnabled)
            );

            updateSoundUI();

            if (soundEnabled) {
                createTone(700, 0.08);
            }
        }
    );

    soundSetting?.addEventListener(
        "click",
        () => {

            soundEnabled =
                !soundEnabled;

            localStorage.setItem(
                "cubesKnightSound",
                String(soundEnabled)
            );

            updateSoundUI();
        }
    );

    /* =====================================================
       SETTINGS
       ===================================================== */

    const settingsBtn =
        document.getElementById(
            "settingsBtn"
        );

    settingsBtn?.addEventListener(
        "click",
        () => {

            openModal(
                "settingsModal"
            );
        }
    );

    const animationSetting =
        document.getElementById(
            "animationSetting"
        );

    animationSetting?.addEventListener(
        "click",
        () => {

            animationEnabled =
                !animationEnabled;

            localStorage.setItem(
                "cubesKnightAnimation",
                String(animationEnabled)
            );

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

    const vibrationSetting =
        document.getElementById(
            "vibrationSetting"
        );

    vibrationSetting?.addEventListener(
        "click",
        () => {

            vibrationEnabled =
                !vibrationEnabled;

            localStorage.setItem(
                "cubesKnightVibration",
                String(vibrationEnabled)
            );

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

    const decimalSetting =
        document.getElementById(
            "decimalSetting"
        );

    decimalSetting?.addEventListener(
        "change",
        () => {

            decimalPlaces =
                decimalSetting.value;

            localStorage.setItem(
                "cubesKnightDecimal",
                decimalPlaces
            );

            updateDisplay();
        }
    );

    const resetData =
        document.getElementById(
            "resetData"
        );

    resetData?.addEventListener(
        "click",
        () => {

            if (
                !confirm(
                    "Reset semua data kalkulator?"
                )
            ) {
                return;
            }

            localStorage.removeItem(
                "cubesKnightHistory"
            );

            localStorage.removeItem(
                "cubesKnightCalculations"
            );

            localStorage.removeItem(
                "cubesKnightXP"
            );

            localStorage.removeItem(
                "cubesKnightAchievements"
            );

            history = [];
            totalCalculations = 0;
            xp = 0;
            achievements = [];
            memory = 0;

            clearAll();

            renderHistory();
            renderAchievements();
            updateStats();
            updateLevel();

            showToast(
                "Semua data berhasil direset."
            );
        }
    );

    /* =====================================================
       KEYBOARD
       ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            const key =
                event.key;

            if (
                /^[0-9]$/.test(key)
            ) {

                inputDigit(key);
                return;
            }

            if (
                key === "."
            ) {

                inputDecimal();
                return;
            }

            if (
                ["+", "-", "*", "/"]
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
                key === "Backspace"
            ) {

                event.preventDefault();

                backspace();
                return;
            }

            if (
                key === "Escape"
            ) {

                clearAll();
                return;
            }

            if (
                key === "%"
            ) {

                percentage();
            }
        }
    );

    /* =====================================================
       KNIGHT MESSAGE
       ===================================================== */

    function showKnightMessage(
        message
    ) {

        if (!knightMessage) {
            return;
        }

        knightMessage.textContent =
            message;

        if (
            animationEnabled
        ) {

            knightMessage.classList.add(
                "pulse"
            );

            setTimeout(
                () => {

                    knightMessage.classList.remove(
                        "pulse"
                    );

                },
                500
            );
        }
    }

    function showError(message) {

        currentValue =
            "ERROR";

        expression =
            "⚠ INVALID MOVE";

        pendingOperator = null;
        firstNumber = null;
        waitingForSecond = true;

        showKnightMessage(
            "Oops! Check your equation."
        );

        showToast(
            message
        );

        updateDisplay();
    }

    /* =====================================================
       TOAST
       ===================================================== */

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

    /* =====================================================
       STORAGE
       ===================================================== */

    function loadJSON(
        key,
        fallback
    ) {

        try {

            const data =
                localStorage.getItem(key);

            return data
                ? JSON.parse(data)
                : fallback;

        } catch (error) {

            return fallback;
        }
    }

    function saveAll() {

        localStorage.setItem(
            "cubesKnightHistory",
            JSON.stringify(history)
        );

        localStorage.setItem(
            "cubesKnightCalculations",
            String(totalCalculations)
        );

        localStorage.setItem(
            "cubesKnightXP",
            String(xp)
        );

        localStorage.setItem(
            "cubesKnightAchievements",
            JSON.stringify(achievements)
        );
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

    /* =====================================================
       INITIALIZE
       ===================================================== */

    const savedTheme =
        localStorage.getItem(
            "cubesKnightTheme"
        );

    if (
        savedTheme === "light"
    ) {

        document.body.classList.add(
            "light-theme"
        );
    }

    if (!animationEnabled) {

        document.body.classList.add(
            "no-animation"
        );
    }

    if (decimalSetting) {

        decimalSetting.value =
            decimalPlaces;
    }

    if (animationSetting) {

        animationSetting.textContent =
            animationEnabled
                ? "ON"
                : "OFF";
    }

    if (vibrationSetting) {

        vibrationSetting.textContent =
            vibrationEnabled
                ? "ON"
                : "OFF";
    }

    populateConverterUnits();

    updateThemeUI();
    updateSoundUI();

    updateDisplay();
    updateStats();
    updateLevel();

    renderHistory();
    renderAchievements();

});
