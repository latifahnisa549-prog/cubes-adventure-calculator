// ================================
// CUBES ADVENTURE KNIGHT
// SIMPLE FUNCTIONAL CALCULATOR
// ================================

let angkaPertama = "";
let operator = "";
let angkaKedua = "";
let sedangMenghitung = false;

const result = document.getElementById("result");
const expression = document.getElementById("expression");

// Tampilkan angka
function tampilkan(nilai) {
    result.textContent = nilai;
}

// ================================
// TOMBOL KALKULATOR
// ================================

document.querySelectorAll("[data-key]").forEach(function(button) {

    button.addEventListener("click", function() {

        const key = button.getAttribute("data-key");

        // ANGKA
        if (/^[0-9]$/.test(key)) {

            if (sedangMenghitung) {
                tampilkan(key);
                sedangMenghitung = false;
            } else {

                if (result.textContent === "0") {
                    tampilkan(key);
                } else {
                    tampilkan(result.textContent + key);
                }
            }

            return;
        }

        // TITIK
        if (key === ".") {

            if (!result.textContent.includes(".")) {
                tampilkan(result.textContent + ".");
            }

            return;
        }

        // AC
        if (key === "AC") {

            angkaPertama = "";
            angkaKedua = "";
            operator = "";
            sedangMenghitung = false;

            tampilkan("0");
            expression.textContent = "0";

            return;
        }

        // BACKSPACE
        if (key === "backspace") {

            let nilai = result.textContent;

            if (nilai.length > 1) {
                tampilkan(
                    nilai.substring(
                        0,
                        nilai.length - 1
                    )
                );
            } else {
                tampilkan("0");
            }

            return;
        }

        // PERSEN
        if (key === "percent") {

            let nilai =
                parseFloat(result.textContent);

            if (!isNaN(nilai)) {

                nilai = nilai / 100;

                tampilkan(
                    String(nilai)
                );
            }

            return;
        }

        // PLUS MINUS
        if (key === "sign") {

            let nilai =
                parseFloat(result.textContent);

            if (!isNaN(nilai)) {

                nilai = nilai * -1;

                tampilkan(
                    String(nilai)
                );
            }

            return;
        }

        // OPERATOR
        if (
            key === "+" ||
            key === "-" ||
            key === "*" ||
            key === "/"
        ) {

            angkaPertama =
                parseFloat(
                    result.textContent
                );

            operator = key;

            sedangMenghitung = true;

            expression.textContent =
                angkaPertama +
                " " +
                operator;

            return;
        }

        // HASIL
        if (key === "=") {

            if (
                angkaPertama === "" ||
                operator === ""
            ) {
                return;
            }

            angkaKedua =
                parseFloat(
                    result.textContent
                );

            let hasil;

            if (operator === "+") {
                hasil =
                    angkaPertama +
                    angkaKedua;
            }

            else if (operator === "-") {
                hasil =
                    angkaPertama -
                    angkaKedua;
            }

            else if (operator === "*") {
                hasil =
                    angkaPertama *
                    angkaKedua;
            }

            else if (operator === "/") {

                if (angkaKedua === 0) {

                    tampilkan("ERROR");

                    angkaPertama = "";
                    angkaKedua = "";
                    operator = "";

                    return;
                }

                hasil =
                    angkaPertama /
                    angkaKedua;
            }

            // Tampilkan hasil
            tampilkan(
                formatHasil(hasil)
            );

            expression.textContent =
                angkaPertama +
                " " +
                operator +
                " " +
                angkaKedua +
                " =";

            angkaPertama = hasil;
            angkaKedua = "";
            operator = "";

            sedangMenghitung = true;

            return;
        }

    });

});

// ================================
// FORMAT HASIL
// ================================

function formatHasil(hasil) {

    if (!Number.isFinite(hasil)) {
        return "ERROR";
    }

    // Hilangkan angka desimal yang terlalu panjang
    return Number(
        hasil.toFixed(10)
    ).toString();
}

// ================================
// KEYBOARD PC
// ================================

document.addEventListener(
    "keydown",
    function(event) {

        const key = event.key;

        // ANGKA
        if (/^[0-9]$/.test(key)) {

            const tombol =
                document.querySelector(
                    `[data-key="${key}"]`
                );

            if (tombol) {
                tombol.click();
            }

            return;
        }

        // OPERATOR
        if (
            key === "+" ||
            key === "-" ||
            key === "*" ||
            key === "/"
        ) {

            const tombol =
                document.querySelector(
                    `[data-key="${key}"]`
                );

            if (tombol) {
                tombol.click();
            }

            return;
        }

        // ENTER
        if (
            key === "Enter" ||
            key === "="
        ) {

            const tombol =
                document.querySelector(
                    `[data-key="="]`
                );

            if (tombol) {
                tombol.click();
            }

            return;
        }

        // BACKSPACE
        if (key === "Backspace") {

            const tombol =
                document.getElementById(
                    "backspaceBtn"
                );

            if (tombol) {
                tombol.click();
            }

            return;
        }

        // ESC = AC
        if (key === "Escape") {

            const tombol =
                document.querySelector(
                    `[data-key="AC"]`
                );

            if (tombol) {
                tombol.click();
            }

            return;
        }

        // TITIK
        if (key === ".") {

            const tombol =
                document.querySelector(
                    `[data-key="."]`
                );

            if (tombol) {
                tombol.click();
            }
        }
    }
);
