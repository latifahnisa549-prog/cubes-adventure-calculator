/* =========================================================
   CUBES ADVENTURE KNIGHT
   FULL FUNCTIONAL CALCULATOR
   BASIC + SCIENTIFIC + PROGRAMMER + CONVERTER
========================================================= */

"use strict";

/* =========================================================
   ELEMENTS
========================================================= */

const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");

const modeSelect = document.getElementById("modeSelect");

const scientificPanel = document.getElementById("scientificPanel");
const programmerPanel = document.getElementById("programmerPanel");
const converterPanel = document.getElementById("converterPanel");

const keypad = document.getElementById("keypad");

const memoryIndicator = document.getElementById("memoryIndicator");

const calcCountEl = document.getElementById("calcCount");
const achievementCountEl = document.getElementById("achievementCount");

const levelText = document.getElementById("levelText");
const levelName = document.getElementById("levelName");
const xpBar = document.getElementById("xpBar");
const xpText = document.getElementById("xpText");

const knightMessage = document.getElementById("knightMessage");

const programmerValue = document.getElementById("programmerValue");

const converterCategory = document.getElementById("converterCategory");
const converterInput = document.getElementById("converterInput");
const converterFrom = document.getElementById("converterFrom");
const converterTo = document.getElementById("converterTo");
const converterOutput = document.getElementById("converterOutput");

const toastContainer = document.getElementById("toastContainer");


/* =========================================================
   CALCULATOR STATE
========================================================= */

let currentValue = "0";
let previousValue = null;
let operator = null;
let waitingForOperand = false;

let expressionText = "0";

let memory = Number(localStorage.getItem("calculatorMemory")) || 0;

let calculationCount =
    Number(localStorage.getItem("calculationCount")) || 0;

let xp =
    Number(localStorage.getItem("calculatorXP")) || 0;

let history =
    JSON.parse(localStorage.getItem("calculatorHistory") || "[]");

let achievements =
    JSON.parse(localStorage.getItem("calculatorAchievements") || "[]");

let angleMode = localStorage.getItem("angleMode") || "DEG";

let programmerBase = 10;

let soundEnabled =
    localStorage.getItem("soundEnabled") === "true";

let darkMode =
    localStorage.getItem("darkMode") !== "false";

let animationEnabled =
    localStorage.getItem("animationEnabled") !== "false";

let decimalMode =
    localStorage.getItem("decimalMode") || "auto";


/* =========================================================
   FORMAT NUMBER
========================================================= */

function formatNumber(value) {

    if (!Number.isFinite(value)) {
        return "Error";
    }

    if (decimalMode !== "auto") {

        const places = Number(decimalMode);

        return Number(value.toFixed(places)).toLocaleString(
            "en-US",
            {
                maximumFractionDigits: places
            }
        );
    }

    if (Math.abs(value) >= 1e12 || Math.abs(value) < 1e-9 && value !== 0) {
        return value.toExponential(8);
    }

    return Number(value.toFixed(12)).toLocaleString(
        "en-US",
        {
            maximumFractionDigits: 12
        }
    );
}


/* =========================================================
   RAW NUMBER
========================================================= */

function rawNumber(text) {

    return Number(
        String(text)
            .replace(/,/g, "")
            .trim()
    );

}


/* =========================================================
   DISPLAY
========================================================= */

function updateDisplay() {

    expressionEl.textContent = expressionText || "0";

    resultEl.textContent = currentValue || "0";

    updateMemoryIndicator();

    updateProgrammerDisplay();
}


function updateMemoryIndicator() {

    if (memoryIndicator) {

        memoryIndicator.textContent =
            memory !== 0 ? "M" : "";

    }

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    if (!toastContainer) return;

    const toast = document.createElement("div");

    toast.className = "toast";

    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 2500);

}


/* =========================================================
   SOUND
========================================================= */

function beep() {

    if (!soundEnabled) return;

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) return;

        const audio = new AudioContext();

        const oscillator = audio.createOscillator();

        const gain = audio.createGain();

        oscillator.frequency.value = 500;

        gain.gain.value = 0.03;

        oscillator.connect(gain);

        gain.connect(audio.destination);

        oscillator.start();

        oscillator.stop(audio.currentTime + 0.06);

    } catch (error) {

        console.log("Sound unavailable");

    }

}


/* =========================================================
   INPUT DIGIT
========================================================= */

function inputDigit(digit) {

    beep();

    if (waitingForOperand || currentValue === "Error") {

        currentValue = digit;

        waitingForOperand = false;

    } else {

        if (currentValue === "0") {

            currentValue = digit;

        } else {

            currentValue += digit;

        }

    }

    expressionText = currentValue;

    updateDisplay();

}


/* =========================================================
   DECIMAL
========================================================= */

function inputDecimal() {

    if (waitingForOperand) {

        currentValue = "0.";

        waitingForOperand = false;

    } else if (!currentValue.includes(".")) {

        currentValue += ".";

    }

    expressionText = currentValue;

    updateDisplay();

}


/* =========================================================
   CLEAR
========================================================= */

function clearCalculator() {

    currentValue = "0";

    previousValue = null;

    operator = null;

    waitingForOperand = false;

    expressionText = "0";

    updateDisplay();

    knightSpeak("Calculator cleared!");

}


/* =========================================================
   BACKSPACE
========================================================= */

function backspace() {

    if (
        waitingForOperand ||
        currentValue === "Error"
    ) return;

    if (currentValue.length <= 1) {

        currentValue = "0";

    } else {

        currentValue = currentValue.slice(0, -1);

    }

    expressionText = currentValue;

    updateDisplay();

}


/* =========================================================
   SIGN
========================================================= */

function toggleSign() {

    if (currentValue === "0") return;

    currentValue =
        currentValue.startsWith("-")
            ? currentValue.substring(1)
            : "-" + currentValue;

    expressionText = currentValue;

    updateDisplay();

}


/* =========================================================
   PERCENT
========================================================= */

function percentage() {

    const value = rawNumber(currentValue);

    currentValue = String(value / 100);

    expressionText = currentValue;

    updateDisplay();

}


/* =========================================================
   BASIC OPERATOR
========================================================= */

function performOperation(nextOperator) {

    const inputValue = rawNumber(currentValue);

    if (!Number.isFinite(inputValue)) {

        showToast("Angka tidak valid");

        return;

    }

    if (operator && previousValue !== null && !waitingForOperand) {

        const result = calculate(
            previousValue,
            inputValue,
            operator
        );

        if (result === null) {

            currentValue = "Error";

            expressionText = "Error";

            updateDisplay();

            return;

        }

        currentValue = String(result);

        previousValue = result;

    } else {

        previousValue = inputValue;

    }

    operator = nextOperator;

    waitingForOperand = true;

    expressionText =
        formatNumber(previousValue) +
        " " +
        operatorSymbol(nextOperator);

    updateDisplay();

}


/* =========================================================
   OPERATOR SYMBOL
========================================================= */

function operatorSymbol(op) {

    const symbols = {

        "+": "+",

        "-": "−",

        "*": "×",

        "/": "÷",

        "^": "^"

    };

    return symbols[op] || op;

}


/* =========================================================
   CALCULATE
========================================================= */

function calculate(a, b, op) {

    switch (op) {

        case "+":

            return a + b;

        case "-":

            return a - b;

        case "*":

            return a * b;

        case "/":

            if (b === 0) {

                showToast("Tidak bisa membagi dengan 0");

                return null;

            }

            return a / b;

        case "^":

            return Math.pow(a, b);

        default:

            return b;

    }

}


/* =========================================================
   EQUAL
========================================================= */

function equals() {

    if (
        previousValue === null ||
        operator === null
    ) {

        return;

    }

    const secondValue = rawNumber(currentValue);

    const result = calculate(
        previousValue,
        secondValue,
        operator
    );

    if (result === null) {

        currentValue = "Error";

        expressionText = "Error";

        updateDisplay();

        return;

    }

    const fullExpression =
        formatNumber(previousValue) +
        " " +
        operatorSymbol(operator) +
        " " +
        formatNumber(secondValue);

    currentValue = String(result);

    expressionText =
        fullExpression + " =";

    previousValue = null;

    operator = null;

    waitingForOperand = true;

    calculationCompleted(
        fullExpression,
        result
    );

    updateDisplay();

}


/* =========================================================
   CALCULATION COMPLETED
========================================================= */

function calculationCompleted(
    expression,
    result
) {

    calculationCount++;

    localStorage.setItem(
        "calculationCount",
        calculationCount
    );

    addHistory(
        expression,
        result
    );

    addXP(10);

    knightSpeak("Calculation completed!");

    updateStats();

    checkAchievements();

}


/* =========================================================
   HISTORY
========================================================= */

function addHistory(
    expression,
    result
) {

    history.unshift({

        expression: expression,

        result: result,

        time: new Date().toLocaleString("id-ID")

    });

    history =
        history.slice(0, 50);

    localStorage.setItem(
        "calculatorHistory",
        JSON.stringify(history)
    );

}


/* =========================================================
   MEMORY
========================================================= */

function memoryClear() {

    memory = 0;

    saveMemory();

    showToast("Memory cleared");

    updateDisplay();

}


function memoryRecall() {

    currentValue = String(memory);

    waitingForOperand = false;

    expressionText = currentValue;

    updateDisplay();

}


function memoryPlus() {

    const value = rawNumber(currentValue);

    if (Number.isFinite(value)) {

        memory += value;

        saveMemory();

        showToast("Ditambahkan ke memory");

    }

    updateDisplay();

}


function memoryMinus() {

    const value = rawNumber(currentValue);

    if (Number.isFinite(value)) {

        memory -= value;

        saveMemory();

        showToast("Dikurangi dari memory");

    }

    updateDisplay();

}


function memoryStore() {

    const value = rawNumber(currentValue);

    if (Number.isFinite(value)) {

        memory = value;

        saveMemory();

        showToast("Disimpan ke memory");

    }

    updateDisplay();

}


function saveMemory() {

    localStorage.setItem(
        "calculatorMemory",
        memory
    );

}


/* =========================================================
   SCIENTIFIC
========================================================= */

function getAngleValue(value) {

    if (angleMode === "DEG") {

        return value * Math.PI / 180;

    }

    return value;

}


function scientificFunction(type) {

    let value = rawNumber(currentValue);

    if (!Number.isFinite(value)) {

        showToast("Input tidak valid");

        return;

    }

    let result;


    switch (type) {

        case "sin":

            result =
                Math.sin(
                    getAngleValue(value)
                );

            break;


        case "cos":

            result =
                Math.cos(
                    getAngleValue(value)
                );

            break;


        case "tan":

            result =
                Math.tan(
                    getAngleValue(value)
                );

            break;


        case "asin":

            result =
                angleMode === "DEG"
                    ? Math.asin(value) * 180 / Math.PI
                    : Math.asin(value);

            break;


        case "acos":

            result =
                angleMode === "DEG"
                    ? Math.acos(value) * 180 / Math.PI
                    : Math.acos(value);

            break;


        case "atan":

            result =
                angleMode === "DEG"
                    ? Math.atan(value) * 180 / Math.PI
                    : Math.atan(value);

            break;


        case "sqrt":

            if (value < 0) {

                showToast("√ angka negatif tidak valid");

                return;

            }

            result = Math.sqrt(value);

            break;


        case "square":

            result = value * value;

            break;


        case "inverse":

            if (value === 0) {

                showToast("Tidak bisa 1/0");

                return;

            }

            result = 1 / value;

            break;


        case "log":

            if (value <= 0) {

                showToast("Log hanya untuk angka > 0");

                return;

            }

            result = Math.log10(value);

            break;


        case "ln":

            if (value <= 0) {

                showToast("Ln hanya untuk angka > 0");

                return;

            }

            result = Math.log(value);

            break;


        case "exp":

            result = Math.exp(value);

            break;


        case "tenpow":

            result = Math.pow(10, value);

            break;


        case "factorial":

            result = factorial(value);

            break;


        case "abs":

            result = Math.abs(value);

            break;


        case "random":

            result = Math.random();

            break;


        default:

            return;

    }


    if (!Number.isFinite(result)) {

        currentValue = "Error";

        expressionText = "Error";

        updateDisplay();

        return;

    }


    const oldValue = currentValue;

    currentValue = String(result);

    expressionText =
        type + "(" + oldValue + ")";

    calculationCompleted(
        expressionText,
        result
    );

    waitingForOperand = true;

    updateDisplay();

}


/* =========================================================
   FACTORIAL
========================================================= */

function factorial(value) {

    if (
        value < 0 ||
        !Number.isInteger(value)
    ) {

        showToast(
            "Faktorial hanya untuk bilangan bulat positif"
        );

        return NaN;

    }

    if (value > 170) {

        showToast(
            "Angka terlalu besar"
        );

        return Infinity;

    }

    let result = 1;

    for (
        let i = 2;
        i <= value;
        i++
    ) {

        result *= i;

    }

    return result;

}


/* =========================================================
   SCIENTIFIC POWER
========================================================= */

function scientificPower() {

    performOperation("^");

}


/* =========================================================
   CONSTANT
========================================================= */

function insertConstant(type) {

    let value;

    switch (type) {

        case "pi":

            value = Math.PI;

            break;

        case "e":

            value = Math.E;

            break;

        case "phi":

            value =
                (1 + Math.sqrt(5)) / 2;

            break;

        default:

            return;

    }

    currentValue = String(value);

    waitingForOperand = false;

    expressionText = type;

    updateDisplay();

}


/* =========================================================
   MODE SWITCH
========================================================= */

function changeMode(mode) {

    scientificPanel.classList.add("hidden");

    programmerPanel.classList.add("hidden");

    converterPanel.classList.add("hidden");

    keypad.style.display = "grid";


    if (mode === "scientific") {

        scientificPanel.classList.remove("hidden");

        knightSpeak("Scientific mode activated!");

    }


    else if (mode === "programmer") {

        programmerPanel.classList.remove("hidden");

        knightSpeak("Programmer mode activated!");

    }


    else if (mode === "converter") {

        converterPanel.classList.remove("hidden");

        keypad.style.display = "none";

        knightSpeak("Converter mode activated!");

        setupConverter();

    }


    else {

        knightSpeak("Basic mode activated!");

    }


    updateDisplay();

}


/* =========================================================
   PROGRAMMER MODE
========================================================= */

function updateProgrammerDisplay() {

    if (!programmerValue) return;

    const value = parseInt(
        rawNumber(currentValue) || 0,
        10
    );

    let output = "0";

    if (programmerBase === 2) {

        output = value.toString(2);

    }

    else if (programmerBase === 8) {

        output = value.toString(8);

    }

    else if (programmerBase === 16) {

        output =
            value.toString(16).toUpperCase();

    }

    else {

        output = String(value);

    }

    programmerValue.textContent =
        output;

}


function changeProgrammerBase(base) {

    programmerBase = Number(base);

    document
        .querySelectorAll("[data-base]")
        .forEach(button => {

            button.classList.toggle(
                "active",
                Number(button.dataset.base) ===
                programmerBase
            );

        });

    updateProgrammerDisplay();

}


/* =========================================================
   PROGRAMMER OPERATIONS
========================================================= */

function programmerOperation(type) {

    let a = parseInt(
        rawNumber(currentValue) || 0,
        10
    );

    let b;

    if (
        type !== "not"
    ) {

        const input =
            prompt(
                "Masukkan angka kedua:"
            );

        if (input === null) return;

        b = parseInt(
            input,
            programmerBase
        );

        if (Number.isNaN(b)) {

            showToast(
                "Angka kedua tidak valid"
            );

            return;

        }

    }


    let result;


    switch (type) {

        case "and":

            result = a & b;

            break;

        case "or":

            result = a | b;

            break;

        case "xor":

            result = a ^ b;

            break;

        case "not":

            result = ~a;

            break;

        case "shl":

            result = a << b;

            break;

        case "shr":

            result = a >> b;

            break;

        default:

            return;

    }


    currentValue = String(result);

    expressionText =
        type.toUpperCase() +
        "(" +
        a +
        (b !== undefined
            ? ", " + b
            : "") +
        ")";

    calculationCompleted(
        expressionText,
        result
    );

    waitingForOperand = true;

    updateDisplay();

}


/* =========================================================
   CONVERTER DATA
========================================================= */

const converterUnits = {

    length: {

        units: {

            Meter: 1,

            Kilometer: 1000,

            Centimeter: 0.01,

            Millimeter: 0.001,

            Mile: 1609.344,

            Yard: 0.9144,

            Foot: 0.3048,

            Inch: 0.0254

        }

    },


    weight: {

        units: {

            Kilogram: 1,

            Gram: 0.001,

            Milligram: 0.000001,

            Ton: 1000,

            Pound: 0.45359237,

            Ounce: 0.0283495231

        }

    },


    temperature: {

        units: {

            Celsius: "C",

            Fahrenheit: "F",

            Kelvin: "K"

        }

    },


    area: {

        units: {

            "Square Meter": 1,

            "Square Kilometer": 1000000,

            "Square Centimeter": 0.0001,

            Hectare: 10000,

            Acre: 4046.8564224

        }

    },


    volume: {

        units: {

            Liter: 1,

            Milliliter: 0.001,

            "Cubic Meter": 1000,

            "Cubic Centimeter": 0.001,

            Gallon: 3.785411784,

            Cup: 0.2365882365

        }

    },


    time: {

        units: {

            Second: 1,

            Minute: 60,

            Hour: 3600,

            Day: 86400,

            Week: 604800

        }

    },


    speed: {

        units: {

            "Meter/Second": 1,

            "Kilometer/Hour": 0.2777777778,

            "Mile/Hour": 0.44704,

            Knot: 0.5144444444

        }

    },


    data: {

        units: {

            Bit: 1,

            Byte: 8,

            KB: 8000,

            MB: 8000000,

            GB: 8000000000,

            TB: 8000000000000

        }

    },


    energy: {

        units: {

            Joule: 1,

            Kilojoule: 1000,

            Calorie: 4.184,

            Kilocalorie: 4184,

            "Watt Hour": 3600,

            "Kilowatt Hour": 3600000

        }

    }

};


/* =========================================================
   SETUP CONVERTER
========================================================= */

function setupConverter() {

    if (!converterCategory) return;

    const category =
        converterCategory.value;

    const data =
        converterUnits[category];

    converterFrom.innerHTML = "";

    converterTo.innerHTML = "";


    Object.keys(data.units)
        .forEach(unit => {

            const option1 =
                document.createElement("option");

            option1.value = unit;

            option1.textContent = unit;

            converterFrom.appendChild(
                option1
            );


            const option2 =
                document.createElement("option");

            option2.value = unit;

            option2.textContent = unit;

            converterTo.appendChild(
                option2
            );

        });


    if (
        converterTo.options.length > 1
    ) {

        converterTo.selectedIndex = 1;

    }


    convertValue();

}


/* =========================================================
   CONVERT VALUE
========================================================= */

function convertValue() {

    if (
        !converterCategory ||
        !converterFrom ||
        !converterTo
    ) return;


    const category =
        converterCategory.value;

    const value =
        Number(converterInput.value);


    if (!Number.isFinite(value)) {

        converterOutput.value = "Error";

        converterOutput.textContent = "Error";

        return;

    }


    let result;


    /* TEMPERATURE */

    if (category === "temperature") {

        result =
            convertTemperature(
                value,
                converterFrom.value,
                converterTo.value
            );

    }

    /* OTHER UNITS */

    else {

        const units =
            converterUnits[category].units;

        const baseValue =
            value * units[converterFrom.value];

        result =
            baseValue /
            units[converterTo.value];

    }


    const formatted =
        formatNumber(result);


    if ("value" in converterOutput) {

        converterOutput.value =
            formatted;

    }

    converterOutput.textContent =
        formatted;

}


/* =========================================================
   TEMPERATURE CONVERTER
========================================================= */

function convertTemperature(
    value,
    from,
    to
) {

    let celsius;


    if (from === "C") {

        celsius = value;

    }

    else if (from === "F") {

        celsius =
            (value - 32) * 5 / 9;

    }

    else {

        celsius =
            value - 273.15;

    }


    if (to === "C") {

        return celsius;

    }


    if (to === "F") {

        return (
            celsius * 9 / 5
        ) + 32;

    }


    return celsius + 273.15;

}


/* =========================================================
   HISTORY MODAL
========================================================= */

function openHistory() {

    const modal =
        document.getElementById(
            "historyModal"
        );

    const list =
        document.getElementById(
            "historyList"
        );

    list.innerHTML = "";


    if (history.length === 0) {

        list.innerHTML =
            "<p>Belum ada riwayat perhitungan.</p>";

    }

    else {

        history.forEach(item => {

            const div =
                document.createElement("div");

            div.className =
                "history-item";

            div.innerHTML = `
                <strong>${escapeHTML(item.expression)}</strong>
                <span>= ${escapeHTML(String(item.result))}</span>
                <small>${escapeHTML(item.time)}</small>
            `;

            list.appendChild(div);

        });

    }


    modal.classList.add("show");

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* =========================================================
   ACHIEVEMENTS
========================================================= */

const achievementData = [

    {
        id: "first",
        name: "First Calculation",
        description: "Selesaikan 1 perhitungan."
    },

    {
        id: "ten",
        name: "Knight Calculator",
        description: "Selesaikan 10 perhitungan."
    },

    {
        id: "fifty",
        name: "Master Knight",
        description: "Selesaikan 50 perhitungan."
    },

    {
        id: "scientific",
        name: "Science Knight",
        description: "Gunakan fitur scientific."
    },

    {
        id: "programmer",
        name: "Code Knight",
        description: "Gunakan fitur programmer."
    },

    {
        id: "converter",
        name: "Converter Knight",
        description: "Gunakan fitur converter."
    }

];


function checkAchievements() {

    const unlock = id => {

        if (!achievements.includes(id)) {

            achievements.push(id);

            localStorage.setItem(
                "calculatorAchievements",
                JSON.stringify(achievements)
            );

            showToast(
                "🏆 Achievement Unlocked!"
            );

        }

    };


    if (calculationCount >= 1) {

        unlock("first");

    }


    if (calculationCount >= 10) {

        unlock("ten");

    }


    if (calculationCount >= 50) {

        unlock("fifty");

    }


    updateStats();

}


/* =========================================================
   ACHIEVEMENT MODAL
========================================================= */

function openAchievements() {

    const modal =
        document.getElementById(
            "achievementModal"
        );

    const list =
        document.getElementById(
            "achievementList"
        );

    list.innerHTML = "";


    achievementData.forEach(item => {

        const unlocked =
            achievements.includes(item.id);

        const div =
            document.createElement("div");

        div.className =
            "achievement-item";


        div.innerHTML = `
            <strong>
                ${unlocked ? "🏆" : "🔒"}
                ${item.name}
            </strong>
            <p>${item.description}</p>
        `;


        list.appendChild(div);

    });


    modal.classList.add("show");

}


/* =========================================================
   XP
========================================================= */

function addXP(amount) {

    xp += amount;

    let level =
        Math.floor(xp / 100) + 1;


    if (level > 99) {

        level = 99;

    }


    localStorage.setItem(
        "calculatorXP",
        xp
    );


    updateLevel();

}


function updateLevel() {

    const level =
        Math.min(
            99,
            Math.floor(xp / 100) + 1
        );


    const currentXP =
        xp % 100;


    levelText.textContent =
        "LEVEL " +
        String(level).padStart(2, "0");


    const names = [

        "Novice Knight",

        "Apprentice Knight",

        "Skilled Knight",

        "Elite Knight",

        "Master Knight",

        "Legendary Knight"

    ];


    const nameIndex =
        Math.min(
            names.length - 1,
            Math.floor(level / 5)
        );


    levelName.textContent =
        names[nameIndex];


    xpBar.style.width =
        currentXP + "%";


    xpText.textContent =
        currentXP +
        " / 100 XP";

}


/* =========================================================
   STATS
========================================================= */

function updateStats() {

    calcCountEl.textContent =
        calculationCount;

    achievementCountEl.textContent =
        achievements.length;

    updateLevel();

}


/* =========================================================
   KNIGHT MESSAGE
========================================================= */

function knightSpeak(message) {

    if (!knightMessage) return;

    knightMessage.textContent =
        message;

}


/* =========================================================
   MODAL CLOSE
========================================================= */

document
    .querySelectorAll("[data-close]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const id =
                    button.dataset.close;

                document
                    .getElementById(id)
                    .classList.remove("show");

            }
        );

    });


/* =========================================================
   KEYPAD CLICK
========================================================= */

document
    .querySelectorAll("[data-key]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const key =
                    button.dataset.key;

                if (/^\d$/.test(key)) {

                    inputDigit(key);

                    return;

                }


                switch (key) {

                    case ".":

                        inputDecimal();

                        break;


                    case "AC":

                        clearCalculator();

                        break;


                    case "percent":

                        percentage();

                        break;


                    case "sign":

                        toggleSign();

                        break;


                    case "+":

                    case "-":

                    case "*":

                    case "/":

                        performOperation(key);

                        break;


                    case "=":

                        equals();

                        break;

                }

            }
        );

    });


/* =========================================================
   MEMORY BUTTONS
========================================================= */

document
    .querySelectorAll("[data-action]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                switch (
                    button.dataset.action
                ) {

                    case "mc":

                        memoryClear();

                        break;

                    case "mr":

                        memoryRecall();

                        break;

                    case "mplus":

                        memoryPlus();

                        break;

                    case "mminus":

                        memoryMinus();

                        break;

                    case "ms":

                        memoryStore();

                        break;

                }

            }
        );

    });


/* =========================================================
   BACKSPACE
========================================================= */

document
    .getElementById("backspaceBtn")
    .addEventListener(
        "click",
        backspace
    );


/* =========================================================
   SCIENTIFIC BUTTONS
========================================================= */

document
    .querySelectorAll("[data-scientific]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const type =
                    button.dataset.scientific;

                if (type === "power") {

                    scientificPower();

                }

                else {

                    scientificFunction(type);

                }


                if (
                    !achievements.includes(
                        "scientific"
                    )
                ) {

                    achievements.push(
                        "scientific"
                    );

                    localStorage.setItem(
                        "calculatorAchievements",
                        JSON.stringify(
                            achievements
                        )
                    );

                }

                updateStats();

            }
        );

    });


/* =========================================================
   CONSTANT BUTTONS
========================================================= */

document
    .querySelectorAll("[data-constant]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                insertConstant(
                    button.dataset.constant
                );

            }
        );

    });


/* =========================================================
   PROGRAMMER BASE
========================================================= */

document
    .querySelectorAll("[data-base]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                changeProgrammerBase(
                    button.dataset.base
                );

            }
        );

    });


/* =========================================================
   PROGRAMMER BIT
========================================================= */

document
    .querySelectorAll("[data-bit]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                programmerOperation(
                    button.dataset.bit
                );


                if (
                    !achievements.includes(
                        "programmer"
                    )
                ) {

                    achievements.push(
                        "programmer"
                    );

                    localStorage.setItem(
                        "calculatorAchievements",
                        JSON.stringify(
                            achievements
                        )
                    );

                }

                updateStats();

            }
        );

    });


/* =========================================================
   MODE SELECT
========================================================= */

modeSelect.addEventListener(
    "change",
    () => {

        changeMode(
            modeSelect.value
        );

    }
);


/* =========================================================
   CONVERTER
========================================================= */

converterCategory.addEventListener(
    "change",
    () => {

        setupConverter();

        unlockConverterAchievement();

    }
);


converterInput.addEventListener(
    "input",
    convertValue
);


converterFrom.addEventListener(
    "change",
    convertValue
);


converterTo.addEventListener(
    "change",
    convertValue
);


function unlockConverterAchievement() {

    if (
        !achievements.includes(
            "converter"
        )
    ) {

        achievements.push(
            "converter"
        );

        localStorage.setItem(
            "calculatorAchievements",
            JSON.stringify(
                achievements
            )
        );

        updateStats();

        showToast(
            "🏆 Converter Knight unlocked!"
        );

    }

}


/* =========================================================
   HISTORY BUTTON
========================================================= */

document
    .getElementById("historyBtn")
    .addEventListener(
        "click",
        openHistory
    );


/* =========================================================
   ACHIEVEMENT BUTTON
========================================================= */

document
    .getElementById("achievementBtn")
    .addEventListener(
        "click",
        openAchievements
    );


/* =========================================================
   CLEAR HISTORY
========================================================= */

document
    .getElementById("clearHistory")
    .addEventListener(
        "click",
        () => {

            history = [];

            localStorage.removeItem(
                "calculatorHistory"
            );

            openHistory();

            showToast(
                "History berhasil dihapus"
            );

        }
    );


/* =========================================================
   THEME
========================================================= */

const themeBtn =
    document.getElementById("themeBtn");

themeBtn.addEventListener(
    "click",
    toggleTheme
);


function toggleTheme() {

    darkMode = !darkMode;

    document.body.classList.toggle(
        "light-mode",
        !darkMode
    );

    localStorage.setItem(
        "darkMode",
        darkMode
    );

    themeBtn.textContent =
        darkMode ? "🌙" : "☀️";

}


/* =========================================================
   SOUND BUTTON
========================================================= */

const soundBtn =
    document.getElementById("soundBtn");

soundBtn.addEventListener(
    "click",
    () => {

        soundEnabled =
            !soundEnabled;

        localStorage.setItem(
            "soundEnabled",
            soundEnabled
        );

        soundBtn.textContent =
            soundEnabled
                ? "🔊"
                : "🔇";

        showToast(
            soundEnabled
                ? "Sound ON"
                : "Sound OFF"
        );

    }
);


/* =========================================================
   SETTINGS
========================================================= */

document
    .getElementById("settingsBtn")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "settingsModal"
                )
                .classList.add("show");

        }
    );


const themeSetting =
    document.getElementById(
        "themeSetting"
    );


themeSetting.addEventListener(
    "click",
    () => {

        toggleTheme();

        themeSetting.textContent =
            darkMode ? "Dark" : "Light";

    }
);


const soundSetting =
    document.getElementById(
        "soundSetting"
    );


soundSetting.addEventListener(
    "click",
    () => {

        soundEnabled =
            !soundEnabled;

        localStorage.setItem(
            "soundEnabled",
            soundEnabled
        );

        soundSetting.textContent =
            soundEnabled
                ? "ON"
                : "OFF";

        soundBtn.textContent =
            soundEnabled
                ? "🔊"
                : "🔇";

    }
);


/* =========================================================
   DECIMAL SETTINGS
========================================================= */

document
    .getElementById("decimalSetting")
    .addEventListener(
        "change",
        event => {

            decimalMode =
                event.target.value;

            localStorage.setItem(
                "decimalMode",
                decimalMode
            );

            updateDisplay();

        }
    );


/* =========================================================
   ANIMATION
========================================================= */

const animationSetting =
    document.getElementById(
        "animationSetting"
    );


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

        localStorage.setItem(
            "animationEnabled",
            animationEnabled
        );

    }
);


/* =========================================================
   VIBRATION
========================================================= */

const vibrationSetting =
    document.getElementById(
        "vibrationSetting"
    );


let vibrationEnabled = false;


vibrationSetting.addEventListener(
    "click",
    () => {

        vibrationEnabled =
            !vibrationEnabled;

        vibrationSetting.textContent =
            vibrationEnabled
                ? "ON"
                : "OFF";

    }
);


/* =========================================================
   RESET DATA
========================================================= */

document
    .getElementById("resetData")
    .addEventListener(
        "click",
        () => {

            const confirmReset =
                confirm(
                    "Yakin ingin menghapus semua data calculator?"
                );

            if (!confirmReset) return;


            localStorage.removeItem(
                "calculatorMemory"
            );

            localStorage.removeItem(
                "calculationCount"
            );

            localStorage.removeItem(
                "calculatorXP"
            );

            localStorage.removeItem(
                "calculatorHistory"
            );

            localStorage.removeItem(
                "calculatorAchievements"
            );

            location.reload();

        }
    );


/* =========================================================
   KEYBOARD SUPPORT
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        const key = event.key;


        if (/^\d$/.test(key)) {

            inputDigit(key);

            return;

        }


        if (key === ".") {

            inputDecimal();

            return;

        }


        if (
            ["+", "-", "*", "/"].includes(key)
        ) {

            performOperation(key);

            return;

        }


        if (key === "Enter" || key === "=") {

            event.preventDefault();

            equals();

            return;

        }


        if (key === "Backspace") {

            backspace();

            return;

        }


        if (
            key === "Escape" ||
            key.toLowerCase() === "c"
        ) {

            clearCalculator();

        }

    }
);


/* =========================================================
   INIT THEME
========================================================= */

document.body.classList.toggle(
    "light-mode",
    !darkMode
);

themeBtn.textContent =
    darkMode ? "🌙" : "☀️";


/* =========================================================
   INIT SOUND
========================================================= */

soundBtn.textContent =
    soundEnabled
        ? "🔊"
        : "🔇";


/* =========================================================
   INIT SETTINGS
========================================================= */

document
    .getElementById("decimalSetting")
    .value =
    decimalMode;


document
    .getElementById("animationSetting")
    .textContent =
    animationEnabled
        ? "ON"
        : "OFF";


document
    .getElementById("soundSetting")
    .textContent =
    soundEnabled
        ? "ON"
        : "OFF";


document
    .getElementById("themeSetting")
    .textContent =
    darkMode
        ? "Dark"
        : "Light";


/* =========================================================
   INIT
========================================================= */

setupConverter();

updateStats();

updateDisplay();

changeMode("basic");


/* =========================================================
   START MESSAGE
========================================================= */

setTimeout(() => {

    knightSpeak(
        "Choose your calculator mode!"
    );

}, 500);
