const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require('pg');
const dotenv = require("dotenv");

dotenv.config();
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const db = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});


// Caesar Cipher Function
function caesarCipher(text, shift, encrypt = true) {
    return text.split("").map(char => {
        if (char.match(/[a-z]/i)) {
            let code = char.charCodeAt(0);
            let base = char >= "a" ? 97 : 65;
            return String.fromCharCode(((code - base + (encrypt ? shift : -shift) + 26) % 26) + base);
        }
        return char;
    }).join("");
}

// Home Page
app.get("/", (req, res) => {
    res.render("index");
});

// Encrypt Text
app.post("/encrypt", async (req, res) => {
    const { text, shift } = req.body;
    const encryptedText = caesarCipher(text, parseInt(shift), true);

    await db.query("INSERT INTO messages (text, shift, encrypted_text) VALUES ($1, $2, $3)", [text, shift, encryptedText]);
    res.render("result", { result: encryptedText, action: "Encrypted" });
});

// Decrypt Text
app.post("/decrypt", async (req, res) => {
    const { text, shift } = req.body;
    const decryptedText = caesarCipher(text, parseInt(shift), false);
    
    res.render("result", { result: decryptedText, action: "Decrypted" });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
