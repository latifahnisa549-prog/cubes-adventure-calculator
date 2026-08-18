/* =========================================================
   CUBES ADVENTURE KNIGHT
   FULL FUNCTIONAL CALCULATOR
   ========================================================= */

"use strict";

/* =========================================================
   ELEMENTS
   ========================================================= */

const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const memoryIndicator = document.getElementById("memoryIndicator");

const keypad = document.getElementById("keypad");
const modeSelect = document.getElementById("modeSelect");

const scientificPanel = document.getElementById("scientificPanel");
const programmerPanel = document.getElementById("programmerPanel");
const converterPanel = document.getElementById("converterPanel");

const programmerValue = document.getElementById("programmerValue");

const converterCategory = document.getElementById("converterCategory");
const converterInput = document.getElementById("converterInput");
const converterFrom = document.getElementById("converterFrom");
const converterTo = document.getElementById("converterTo");
const converterOutput = document.getElementById("converterOutput");

const knightMessage = document.getElementById("knightMessage");
const levelText = document.getElementById("levelText");
const levelName = document.getElementById("levelName");
const xpBar = document.getElementById("xpBar");
const xpText = document.getElementById("xpText");

const calcCount = document.getElementById("calcCount");
const achievementCount = document.getElementById("achievementCount");

const toastContainer = document.getElementById("toastContainer");

const historyModal = document.getElementById("historyModal");
const achievementModal = document.getElementById("achievementModal");
const settingsModal = document.getElementById("settingsModal");

const historyList = document.getElementById("historyList");
const achievementList = document.getElementById("achievementList");

const themeBtn = document.getElementById("themeBtn");
const soundBtn = document.getElementById("soundBtn");
const settingsBtn = document.getElementById("settingsBtn");

const themeSetting = document.getElementById("themeSetting");
const soundSetting = document.getElementById("soundSetting");
const animationSetting = document.getElementById("animationSetting");
const vibrationSetting = document.getElementById("vibrationSetting");
const decimalSetting = document.getElementById("decimalSetting");

const historyBtn = document.getElementById("historyBtn");
const achievementBtn = document.getElementById("achievementBtn");

const clearHistory = document.getElementById("clearHistory");
const resetData = document.getElementById("resetData");

const backspaceBtn = document.getElementById("backspaceBtn");


/* =========================================================
   STATE
   ========================================================= */

let expression = "";
let currentResult = "0";

let memory = Number(localStorage.getItem("knightMemory")) || 0;

let calculations =
    Number(localStorage.getItem("knightCalculations")) || 0;

let xp =
    Number(localStorage.getItem("knightXP")) || 0;

let history =
    JSON.parse(localStorage.getItem("knightHistory") || "[]");

let achievements =
    JSON.parse(localStorage.getItem("knightAchievements") || "[]");

let settings =
    JSON.parse(
        localStorage.getItem("knightSettings") ||
        JSON.stringify({
            theme: "dark",
            sound: false,
            animation: true,
            vibration: false,
            decimals: "auto"
        })
    );

let programmerBase = 10;


/* =========================================================
   ACHIEVEMENTS
   ========================================================= */

const achievementData = [
    {
        id: "first",
        name: "First Calculation",
        description: "Selesaikan perhitungan pertama",
        icon: "⚔"
    },
    {
        id: "ten",
        name: "Knight Calculator",
        description: "Selesaikan 10 perhitungan",
        icon: "🛡"
    },
    {
        id: "fifty",
        name: "Master Knight",
        description: "Selesaikan 50 perhitungan",
        icon: "👑"
    },
    {
        id: "scientific",
        name: "Science Knight",
        description: "Gunakan mode scientific",
        icon: "🔬"
    },
    {
        id: "memory",
        name: "Memory Keeper",
        description: "Gunakan fitur memory",
        icon: "🧠"
    },
    {
        id: "programmer",
        name: "Code Knight",
        description: "Gunakan mode programmer",
        icon: "💻"
    },
    {
        id: "converter",
        name: "World Explorer",
        description: "Gunakan converter",
        icon: "🌍"
    },
    {
        id: "history",
        name: "Historian",
        description: "Simpan 5 riwayat",
        icon: "📜"
    }
];


/* =========================================================
   INIT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    applySettings();

    updateDisplay();

    updateStats();

    updateLevel();

    renderHistory();

    renderAchievements();

    setupConverter();

    updateConverter();

    knightSpeak("Calculation ready!");

});


/* =========================================================
   DISPLAY
   ========================================================= */

function updateDisplay() {

    expressionEl.textContent =
        expression || "0";

    resultEl.textContent =
        formatNumber(currentResult);

    updateMemoryIndicator();

    updateProgrammerDisplay();

}


function formatNumber(value) {

    if (value === null || value === undefined) {
        return "0";
    }

    if (typeof value === "number") {

        if (!Number.isFinite(value)) {
            return "Error";
        }

        if (settings.decimals === "auto") {

            if (Math.abs(value) >= 1e12 ||
                (Math.abs(value) > 0 && Math.abs(value) < 1e-8)) {

                return value.toExponential(6);
            }

            return Number(value.toFixed(10)).toString();
        }

        return Number(
            value.toFixed(Number(settings.decimals))
        ).toString();

    }

    return String(value);

}


/* =========================================================
   CALCULATOR INPUT
   ========================================================= */

keypad.addEventListener("click", (event) => {

    const button =
        event.target.closest("button");

    if (!button) return;

    const key =
        button.dataset.key;

    if (!key) return;

    playSound();

    handleKey(key);

});


function handleKey(key) {

    if (key === "AC") {

        clearCalculator();

        return;
    }

    if (key === "=") {

        calculate();

        return;
    }

    if (key === "percent") {

        percentage();

        return;
    }

    if (key === "sign") {

        toggleSign();

        return;
    }

    if (/^[0-9.]$/.test(key)) {

        inputNumber(key);

        return;
    }

    if (["+", "-", "*", "/"].includes(key)) {

        inputOperator(key);

        return;
    }

}


/* =========================================================
   NUMBERS
   ========================================================= */

function inputNumber(number) {

    if (currentResult !== "0" &&
        expression === "" &&
        !expressionEl.textContent.includes("Error")) {

        currentResult = "0";
    }

    if (number === ".") {

        const parts =
            expression.split(/[+\-*/]/);

        const last =
            parts[parts.length - 1];

        if (last.includes(".")) {
            return;
        }

        if (
            last === "" ||
            last === undefined
        ) {

            expression += "0.";
            updateDisplay();
            return;
        }
    }

    expression += number;

    currentResult = expression;

    updateDisplay();

}


function inputOperator(operator) {

    if (!expression) {

        if (
            currentResult !== "0" &&
            !isNaN(Number(currentResult))
        ) {

            expression = currentResult;
        } else {

            return;
        }
    }

    if (/[+\-*/]$/.test(expression)) {

        expression =
            expression.slice(0, -1) + operator;

    } else {

        expression += operator;
    }

    currentResult = expression;

    updateDisplay();

}


/* =========================================================
   BASIC FUNCTIONS
   ========================================================= */

function clearCalculator() {

    expression = "";

    currentResult = "0";

    updateDisplay();

    knightSpeak("Calculator cleared!");

}


function backspace() {

    if (!expression) return;

    expression =
        expression.slice(0, -1);

    currentResult =
        expression || "0";

    updateDisplay();

}


function percentage() {

    if (!expression) return;

    try {

        const value =
            evaluateExpression(expression);

        expression =
            String(value / 100);

        currentResult =
            expression;

        updateDisplay();

    } catch {

        showError();
    }

}


function toggleSign() {

    if (!expression) {

        if (currentResult !== "0") {

            currentResult =
                String(-Number(currentResult));

            updateDisplay();
        }

        return;
    }

    try {

        const value =
            evaluateExpression(expression);

        expression =
            String(-value);

        currentResult =
            expression;

        updateDisplay();

    } catch {

        showError();

    }

}


/* =========================================================
   CALCULATION
   ========================================================= */

function calculate() {

    if (!expression) return;

    try {

        const original =
            expression;

        const value =
            evaluateExpression(expression);

        if (!Number.isFinite(value)) {

            throw new Error("Invalid result");
        }

        const formatted =
            formatNumber(value);

        expression =
            String(value);

        currentResult =
            String(value);

        calculations++;

        addXP(10);

        addHistory(
            original,
            formatted
        );

        checkAchievements();

        updateStats();

        updateDisplay();

        knightSpeak(randomMessage());

    } catch (error) {

        showError();

    }

}


function evaluateExpression(input) {

    let exp =
        String(input)
            .replace(/×/g, "*")
            .replace(/÷/g, "/")
            .replace(/−/g, "-")
            .replace(/π/g, "Math.PI")
            .replace(/\be\b/g, "Math.E");

    /*
       Hanya mengizinkan karakter matematika.
    */

    if (!/^[0-9+\-*/().\sA-Za-z_]+$/.test(exp)) {

        throw new Error("Invalid expression");
    }

    /*
       Function dipakai hanya untuk ekspresi
       yang dibuat dari tombol kalkulator.
    */

    const result =
        Function(
            `"use strict"; return (${exp})`
        )();

    if (typeof result !== "number" ||
        !Number.isFinite(result)) {

        throw new Error("Invalid result");
    }

    return result;

}


function showError() {

    currentResult = "Error";

    expression = "";

    updateDisplay();

    knightSpeak("Oops! Perhitungan tidak valid.");

}


/* =========================================================
   MEMORY
   ========================================================= */

document.querySelectorAll(
    '[data-action]'
).forEach(button => {

    button.addEventListener("click", () => {

        const action =
            button.dataset.action;

        const value =
            Number(currentResult);

        playSound();

        if (action === "mc") {

            memory = 0;

            knightSpeak("Memory cleared.");

        }

        if (action === "mr") {

            expression =
                String(memory);

            currentResult =
                String(memory);

            knightSpeak("Memory recalled.");

        }

        if (action === "mplus") {

            if (Number.isFinite(value)) {

                memory += value;

                knightSpeak("Memory added.");

            }
        }

        if (action === "mminus") {

            if (Number.isFinite(value)) {

                memory -= value;

                knightSpeak("Memory reduced.");

            }
        }

        if (action === "ms") {

            if (Number.isFinite(value)) {

                memory = value;

                unlockAchievement("memory");

                knightSpeak("Value saved to memory.");

            }
        }

        localStorage.setItem(
            "knightMemory",
            memory
        );

        updateMemoryIndicator();

        updateDisplay();

    });

});


function updateMemoryIndicator() {

    if (memory !== 0) {

        memoryIndicator.textContent =
            `M = ${formatNumber(memory)}`;

    } else {

        memoryIndicator.textContent = "";

    }

}


/* =========================================================
   SCIENTIFIC
   ========================================================= */

document.querySelectorAll(
    "[data-scientific]"
).forEach(button => {

    button.addEventListener("click", () => {

        const type =
            button.dataset.scientific;

        scientificCalculate(type);

        playSound();

    });

});


document.querySelectorAll(
    "[data-constant]"
).forEach(button => {

    button.addEventListener("click", () => {

        const constant =
            button.dataset.constant;

        if (constant === "pi") {

            expression += "Math.PI";

        }

        if (constant === "e") {

            expression += "Math.E";

        }

        if (constant === "phi") {

            expression +=
                "1.618033988749895";

        }

        currentResult = expression;

        updateDisplay();

        unlockAchievement("scientific");

    });

});


function scientificCalculate(type) {

    let value;

    try {

        value =
            expression
                ? evaluateExpression(expression)
                : Number(currentResult);

        let result;

        switch (type) {

            case "sin":
                result =
                    Math.sin(value * Math.PI / 180);
                break;

            case "cos":
                result =
                    Math.cos(value * Math.PI / 180);
                break;

            case "tan":
                result =
                    Math.tan(value * Math.PI / 180);
                break;

            case "asin":
                result =
                    Math.asin(value) * 180 / Math.PI;
                break;

            case "acos":
                result =
                    Math.acos(value) * 180 / Math.PI;
                break;

            case "atan":
                result =
                    Math.atan(value) * 180 / Math.PI;
                break;

            case "sqrt":
                result =
                    Math.sqrt(value);
                break;

            case "square":
                result =
                    Math.pow(value, 2);
                break;

            case "inverse":
                result =
                    1 / value;
                break;

            case "log":
                result =
                    Math.log10(value);
                break;

            case "ln":
                result =
                    Math.log(value);
                break;

            case "exp":
                result =
                    Math.exp(value);
                break;

            case "tenpow":
                result =
                    Math.pow(10, value);
                break;

            case "abs":
                result =
                    Math.abs(value);
                break;

            case "random":
                result =
                    Math.random();
                break;

            case "factorial":
                result =
                    factorial(value);
                break;

            case "power":

                /*
                   xʸ:
                   value digunakan sebagai x.
                   User dapat mengetik angka,
                   tekan xʸ, kemudian angka lagi.
                */

                expression =
                    String(value) + "**";

                currentResult =
                    expression;

                updateDisplay();

                return;

            default:
                return;

        }

        if (!Number.isFinite(result)) {

            throw new Error();

        }

        expression =
            String(result);

        currentResult =
            String(result);

        updateDisplay();

        addXP(5);

        unlockAchievement("scientific");

    } catch {

        showError();

    }

}


function factorial(number) {

    if (
        number < 0 ||
        !Number.isInteger(number) ||
        number > 170
    ) {

        throw new Error();

    }

    let result = 1;

    for (
        let i = 2;
        i <= number;
        i++
    ) {

        result *= i;

    }

    return result;

}


/* =========================================================
   MODE SWITCH
   ========================================================= */

modeSelect.addEventListener("change", () => {

    const mode =
        modeSelect.value;

    scientificPanel.classList.add("hidden");

    programmerPanel.classList.add("hidden");

    converterPanel.classList.add("hidden");

    if (mode === "scientific") {

        scientificPanel.classList.remove("hidden");

        knightSpeak("Scientific mode activated!");

        unlockAchievement("scientific");

    }

    if (mode === "programmer") {

        programmerPanel.classList.remove("hidden");

        knightSpeak("Programmer mode activated!");

        unlockAchievement("programmer");

        updateProgrammerDisplay();

    }

    if (mode === "converter") {

        converterPanel.classList.remove("hidden");

        knightSpeak("Converter mode activated!");

        unlockAchievement("converter");

    }

});


/* =========================================================
   PROGRAMMER
   ========================================================= */

document.querySelectorAll(
    "[data-base]"
).forEach(button => {

    button.addEventListener("click", () => {

        programmerBase =
            Number(button.dataset.base);

        document.querySelectorAll(
            "[data-base]"
        ).forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        updateProgrammerDisplay();

    });

});


document.querySelectorAll(
    "[data-bit]"
).forEach(button => {

    button.addEventListener("click", () => {

        const operation =
            button.dataset.bit;

        try {

            let value =
                Math.trunc(
                    Number(
                        expression || currentResult
                    )
                );

            let result;

            switch (operation) {

                case "and":

                    expression = "";
                    knightSpeak("AND: gunakan angka pertama lalu hasil.");
                    return;

                case "or":

                    knightSpeak("OR operation selected.");
                    return;

                case "xor":

                    knightSpeak("XOR operation selected.");
                    return;

                case "not":

                    result = ~value;
                    break;

                case "shl":

                    result = value << 1;
                    break;

                case "shr":

                    result = value >> 1;
                    break;

                default:
                    return;

            }

            expression =
                String(result);

            currentResult =
                String(result);

            updateDisplay();

            updateProgrammerDisplay();

            addXP(5);

        } catch {

            showError();

        }

    });

});


function updateProgrammerDisplay() {

    if (!programmerValue) return;

    let value =
        Number(
            expression || currentResult
        );

    if (!Number.isFinite(value)) {

        programmerValue.textContent =
            "0";

        return;

    }

    value =
        Math.trunc(value);

    let output = "";

    if (programmerBase === 2) {

        output =
            (value >>> 0).toString(2);

    }

    if (programmerBase === 8) {

        output =
            (value >>> 0).toString(8);

    }

    if (programmerBase === 10) {

        output =
            value.toString(10);

    }

    if (programmerBase === 16) {

        output =
            (value >>> 0).toString(16).toUpperCase();

    }

    programmerValue.textContent =
        output;

}


/* =========================================================
   CONVERTER
   ========================================================= */

const units = {

    length: {

        "Meter (m)": 1,
        "Kilometer (km)": 1000,
        "Centimeter (cm)": 0.01,
        "Millimeter (mm)": 0.001,
        "Mile (mi)": 1609.344,
        "Yard (yd)": 0.9144,
        "Foot (ft)": 0.3048,
        "Inch (in)": 0.0254

    },

    weight: {

        "Kilogram (kg)": 1,
        "Gram (g)": 0.001,
        "Milligram (mg)": 0.000001,
        "Ton": 1000,
        "Pound (lb)": 0.45359237,
        "Ounce (oz)": 0.0283495231

    },

    area: {

        "m²": 1,
        "km²": 1000000,
        "cm²": 0.0001,
        "Hectare": 10000,
        "Acre": 4046.8564224

    },

    volume: {

        "Liter": 1,
        "Milliliter": 0.001,
        "m³": 1000,
        "Gallon": 3.785411784,
        "Cup": 0.2365882365

    },

    time: {

        "Second": 1,
        "Minute": 60,
        "Hour": 3600,
        "Day": 86400

    },

    speed: {

        "m/s": 1,
        "km/h": 0.2777777778,
        "mph": 0.44704,
        "knot": 0.514444

    },

    data: {

        "Byte": 1,
        "KB": 1024,
        "MB": 1024 ** 2,
        "GB": 1024 ** 3,
        "TB": 1024 ** 4

    },

    energy: {

        "Joule": 1,
        "Kilojoule": 1000,
        "Calorie": 4.184,
        "Kilocalorie": 4184

    }

};


function setupConverter() {

    updateConverterUnits();

    converterCategory.addEventListener(
        "change",
        updateConverterUnits
    );

    converterInput.addEventListener(
        "input",
        updateConverter
    );

    converterFrom.addEventListener(
        "change",
        updateConverter
    );

    converterTo.addEventListener(
        "change",
        updateConverter
    );

}


function updateConverterUnits() {

    const category =
        converterCategory.value;

    converterFrom.innerHTML = "";

    converterTo.innerHTML = "";

    if (category === "temperature") {

        const temperatureUnits = [
            "Celsius",
            "Fahrenheit",
            "Kelvin"
        ];

        temperatureUnits.forEach(unit => {

            converterFrom.add(
                new Option(unit, unit)
            );

            converterTo.add(
                new Option(unit, unit)
            );

        });

    } else {

        Object.keys(
            units[category]
        ).forEach(unit => {

            converterFrom.add(
                new Option(unit, unit)
            );

            converterTo.add(
                new Option(unit, unit)
            );

        });

    }

    updateConverter();

}


function updateConverter() {

    const category =
        converterCategory.value;

    const value =
        Number(converterInput.value);

    const from =
        converterFrom.value;

    const to =
        converterTo.value;

    if (Number.isNaN(value)) {

        converterOutput.textContent =
            "0";

        return;

    }

    let result;

    if (category === "temperature") {

        result =
            convertTemperature(
                value,
                from,
                to
            );

    } else {

        const base =
            value * units[category][from];

        result =
            base / units[category][to];

    }

    converterOutput.textContent =
        formatNumber(result);

}


function convertTemperature(
    value,
    from,
    to
) {

    let celsius;

    if (from === "Celsius") {

        celsius = value;

    } else if (from === "Fahrenheit") {

        celsius =
            (value - 32) * 5 / 9;

    } else {

        celsius =
            value - 273.15;

    }

    if (to === "Celsius") {

        return celsius;

    }

    if (to === "Fahrenheit") {

        return celsius * 9 / 5 + 32;

    }

    return celsius + 273.15;

}


/* =========================================================
   HISTORY
   ========================================================= */

function addHistory(
    calculation,
    answer
) {

    history.unshift({

        calculation,

        answer,

        date:
            new Date().toLocaleString("id-ID")

    });

    if (history.length > 50) {

        history.pop();

    }

    localStorage.setItem(
        "knightHistory",
        JSON.stringify(history)
    );

    renderHistory();

    checkAchievements();

}


function renderHistory() {

    if (!historyList) return;

    if (history.length === 0) {

        historyList.innerHTML =
            `<div class="empty-history">
                Belum ada riwayat perhitungan.
             </div>`;

        return;

    }

    historyList.innerHTML =
        history.map((item, index) => {

            return `
                <div class="history-item">
                    <div>
                        <strong>${escapeHTML(item.calculation)}</strong>
                        <span>= ${escapeHTML(item.answer)}</span>
                    </div>

                    <small>${escapeHTML(item.date)}</small>

                    <button
                        class="history-use"
                        data-index="${index}">
                        USE
                    </button>
                </div>
            `;

        }).join("");

}


historyList.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(".history-use");

        if (!button) return;

        const index =
            Number(button.dataset.index);

        const item =
            history[index];

        if (!item) return;

        expression =
            item.calculation;

        currentResult =
            item.answer;

        updateDisplay();

        closeModal(historyModal);

    }
);


if (clearHistory) {

    clearHistory.addEventListener(
        "click",
        () => {

            history = [];

            localStorage.setItem(
                "knightHistory",
                JSON.stringify(history)
            );

            renderHistory();

            knightSpeak(
                "History cleared!"
            );

        }
    );

}


/* =========================================================
   ACHIEVEMENTS
   ========================================================= */

function unlockAchievement(id) {

    if (achievements.includes(id)) {

        return;

    }

    achievements.push(id);

    localStorage.setItem(
        "knightAchievements",
        JSON.stringify(achievements)
    );

    renderAchievements();

    updateStats();

    const achievement =
        achievementData.find(
            item => item.id === id
        );

    if (achievement) {

        showToast(
            `${achievement.icon} Achievement unlocked: ${achievement.name}`
        );

    }

}


function checkAchievements() {

    if (calculations >= 1) {

        unlockAchievement("first");

    }

    if (calculations >= 10) {

        unlockAchievement("ten");

    }

    if (calculations >= 50) {

        unlockAchievement("fifty");

    }

    if (history.length >= 5) {

        unlockAchievement("history");

    }

}


function renderAchievements() {

    if (!achievementList) return;

    achievementList.innerHTML =
        achievementData.map(item => {

            const unlocked =
                achievements.includes(item.id);

            return `
                <div class="achievement-item ${
                    unlocked ? "unlocked" : "locked"
                }">

                    <div class="achievement-icon">
                        ${unlocked ? item.icon : "🔒"}
                    </div>

                    <div>
                        <strong>
                            ${item.name}
                        </strong>

                        <p>
                            ${item.description}
                        </p>
                    </div>

                </div>
            `;

        }).join("");

}


/* =========================================================
   XP / LEVEL
   ========================================================= */

function addXP(amount) {

    xp += amount;

    while (xp >= 100) {

        xp -= 100;

        knightSpeak(
            "LEVEL UP! ⚔️"
        );

    }

    localStorage.setItem(
        "knightXP",
        xp
    );

    updateLevel();

}


function updateLevel() {

    const level =
        Math.floor(
            calculations / 5
        ) + 1;

    const names = [
        "Novice Knight",
        "Apprentice Knight",
        "Warrior Knight",
        "Elite Knight",
        "Master Knight",
        "Legendary Knight"
    ];

    const name =
        names[
            Math.min(
                level - 1,
                names.length - 1
            )
        ];

    levelText.textContent =
        `LEVEL ${String(level).padStart(2, "0")}`;

    levelName.textContent =
        name;

    xpBar.style.width =
        `${xp}%`;

    xpText.textContent =
        `${xp} / 100 XP`;

}


/* =========================================================
   STATS
   ========================================================= */

function updateStats() {

    calcCount.textContent =
        calculations;

    achievementCount.textContent =
        achievements.length;

    localStorage.setItem(
        "knightCalculations",
        calculations
    );

}


/* =========================================================
   KEYBOARD
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        const key =
            event.key;

        if (
            /^[0-9]$/.test(key) ||
            ["+", "-", "*", "/", "."].includes(key)
        ) {

            event.preventDefault();

            handleKey(key);

            return;
        }

        if (key === "Enter" || key === "=") {

            event.preventDefault();

            calculate();

            return;
        }

        if (key === "Escape") {

            clearCalculator();

            return;
        }

        if (key === "Backspace") {

            event.preventDefault();

            backspace();

            return;
        }

        if (key === "%") {

            percentage();

        }

    }
);


/* =========================================================
   BACKSPACE BUTTON
   ========================================================= */

if (backspaceBtn) {

    backspaceBtn.addEventListener(
        "click",
        () => {

            playSound();

            backspace();

        }
    );

}


/* =========================================================
   MODALS
   ========================================================= */

function openModal(modal) {

    if (!modal) return;

    modal.classList.add("show");

}


function closeModal(modal) {

    if (!modal) return;

    modal.classList.remove("show");

}


historyBtn.addEventListener(
    "click",
    () => {

        renderHistory();

        openModal(historyModal);

    }
);


achievementBtn.addEventListener(
    "click",
    () => {

        renderAchievements();

        openModal(achievementModal);

    }
);


settingsBtn.addEventListener(
    "click",
    () => {

        updateSettingsUI();

        openModal(settingsModal);

    }
);


document.querySelectorAll(
    "[data-close]"
).forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const id =
                button.dataset.close;

            closeModal(
                document.getElementById(id)
            );

        }
    );

});


document.querySelectorAll(
    ".modal"
).forEach(modal => {

    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                closeModal(modal);

            }

        }
    );

});


/* =========================================================
   THEME
   ========================================================= */

themeBtn.addEventListener(
    "click",
    toggleTheme
);


themeSetting.addEventListener(
    "click",
    toggleTheme
);


function toggleTheme() {

    settings.theme =
        settings.theme === "dark"
            ? "light"
            : "dark";

    saveSettings();

    applySettings();

    updateSettingsUI();

}


function applySettings() {

    document.body.classList.toggle(
        "light-theme",
        settings.theme === "light"
    );

    document.body.classList.toggle(
        "no-animation",
        !settings.animation
    );

    themeBtn.textContent =
        settings.theme === "dark"
            ? "🌙"
            : "☀️";

    soundBtn.textContent =
        settings.sound
            ? "🔊"
            : "🔇";

}


/* =========================================================
   SOUND
   ========================================================= */

soundBtn.addEventListener(
    "click",
    () => {

        settings.sound =
            !settings.sound;

        saveSettings();

        applySettings();

        updateSettingsUI();

        knightSpeak(
            settings.sound
                ? "Sound ON"
                : "Sound OFF"
        );

    }
);


soundSetting.addEventListener(
    "click",
    () => {

        settings.sound =
            !settings.sound;

        saveSettings();

        applySettings();

        updateSettingsUI();

    }
);


function playSound() {

    if (!settings.sound) return;

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) return;

        const audio =
            new AudioContext();

        const oscillator =
            audio.createOscillator();

        const gain =
            audio.createGain();

        oscillator.connect(gain);

        gain.connect(audio.destination);

        oscillator.frequency.value =
            650;

        gain.gain.value =
            0.03;

        oscillator.start();

        oscillator.stop(
            audio.currentTime + 0.05
        );

    } catch {

        // ignore sound errors

    }

}


/* =========================================================
   SETTINGS
   ========================================================= */

animationSetting.addEventListener(
    "click",
    () => {

        settings.animation =
            !settings.animation;

        saveSettings();

        applySettings();

        updateSettingsUI();

    }
);


vibrationSetting.addEventListener(
    "click",
    () => {

        settings.vibration =
            !settings.vibration;

        saveSettings();

        updateSettingsUI();

    }
);


decimalSetting.addEventListener(
    "change",
    () => {

        settings.decimals =
            decimalSetting.value;

        saveSettings();

        updateDisplay();

        updateConverter();

    }
);


function updateSettingsUI() {

    themeSetting.textContent =
        settings.theme === "dark"
            ? "Dark"
            : "Light";

    soundSetting.textContent =
        settings.sound
            ? "ON"
            : "OFF";

    animationSetting.textContent =
        settings.animation
            ? "ON"
            : "OFF";

    vibrationSetting.textContent =
        settings.vibration
            ? "ON"
            : "OFF";

    decimalSetting.value =
        settings.decimals;

}


/* =========================================================
   RESET DATA
   ========================================================= */

resetData.addEventListener(
    "click",
    () => {

        const confirmReset =
            confirm(
                "Reset semua data calculator?"
            );

        if (!confirmReset) return;

        localStorage.removeItem(
            "knightMemory"
        );

        localStorage.removeItem(
            "knightCalculations"
        );

        localStorage.removeItem(
            "knightXP"
        );

        localStorage.removeItem(
            "knightHistory"
        );

        localStorage.removeItem(
            "knightAchievements"
        );

        localStorage.removeItem(
            "knightSettings"
        );

        location.reload();

    }
);


/* =========================================================
   KNIGHT MESSAGE
   ========================================================= */

function knightSpeak(message) {

    if (!knightMessage) return;

    knightMessage.textContent =
        message;

}


function randomMessage() {

    const messages = [

        "Calculation successful! ⚔️",

        "Excellent work, Knight! 🛡️",

        "The answer is ready! ✨",

        "Mission completed! 🚀",

        "Power calculation complete! ⚡",

        "Well calculated, Knight! 👑"

    ];

    return messages[
        Math.floor(
            Math.random() *
            messages.length
        )
    ];

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {

    if (!toastContainer) return;

    const toast =
        document.createElement("div");

    toast.className =
        "toast";

    toast.textContent =
        message;

    toastContainer.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 3000);

}


/* =========================================================
   VIBRATION
   ========================================================= */

function vibrate() {

    if (
        settings.vibration &&
        navigator.vibrate
    ) {

        navigator.vibrate(30);

    }

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   SAVE SETTINGS
   ========================================================= */

function saveSettings() {

    localStorage.setItem(
        "knightSettings",
        JSON.stringify(settings)
    );

}


/* =========================================================
   EXTRA BUTTON FEEDBACK
   ========================================================= */

document.addEventListener(
    "click",
    () => {

        vibrate();

    }
);
