# ⚔ Cubes Adventure Knight Calculator

Kalkulator futuristik bertema **voxel / Cube Knight** yang dibuat dengan HTML5, CSS3, dan Vanilla JavaScript.

## ✨ Features
- Basic calculator
- Scientific calculator
- Programmer calculator: BIN / DEC / HEX / OCT, AND, OR, XOR, NOT, SHL, SHR
- Unit converter: panjang, berat, suhu, luas, volume, waktu, kecepatan, data, energi
- Memory: MC, MR, M+, M-, MS
- Adventure History
- XP dan Knight Level
- Achievement
- Dark / Light Mode
- Sound Effect menggunakan Web Audio API
- Keyboard support
- Responsive desktop, tablet, dan smartphone
- LocalStorage untuk history, memory, XP, achievement, dan settings
- Tidak membutuhkan database/backend

## 📁 Struktur
```text
cubes-adventure-calculator/
├── index.html
├── style.css
├── script.js
├── README.md
└── assets/
    ├── icons/
    └── images/
```

## 🚀 GitHub Pages
1. Buat repository baru di GitHub.
2. Upload `index.html`, `style.css`, `script.js`, `README.md`, dan folder `assets`.
3. Klik **Settings**.
4. Pilih **Pages**.
5. Pada Source pilih **Deploy from a branch**.
6. Pilih branch **main** dan folder **/root**.
7. Klik **Save**.
8. Tunggu proses selesai, lalu buka link GitHub Pages yang diberikan GitHub.

## ⌨ Keyboard
| Tombol | Fungsi |
|---|---|
| 0-9 | Angka |
| + - * / | Operator |
| Enter | Sama dengan |
| Escape | AC |
| Backspace | Hapus |
| % | Persen |
| . | Desimal |

## 🎨 Mengganti Nama Game
Buka `index.html`, cari:
```html
CUBES ADVENTURE KNIGHT
```
lalu ganti dengan nama yang kamu inginkan.

## 🎨 Mengganti Warna
Buka `style.css`, bagian paling atas `:root` berisi CSS variables:
```css
--cyan:#35e7ff;
--blue:#477dff;
--purple:#a65cff;
--pink:#ff4fd8;
--green:#63ff9a;
--gold:#ffd45a;
```

## 🛡 Mengganti Cube Knight
Karakter dibuat menggunakan HTML + CSS, jadi tidak membutuhkan gambar eksternal. Bagian karakter ada di `index.html` dengan class `.cube-knight`, `.helmet`, `.armor`, `.sword`, dan `.shield`.

## 💾 Data
Semua data pengguna disimpan di browser menggunakan `localStorage`. Tidak ada backend atau database.

## 📜 License
Project portfolio sekolah. Silakan dikembangkan dan disesuaikan dengan kebutuhan.
