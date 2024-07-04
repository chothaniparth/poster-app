
const dotenv = require("dotenv");
dotenv.config();

const { BASE_URL, PORT, SECRET_KEY, DATABASE_PASSWORD, DATABASE_NAME, DATABASE_SERVER, DATABASE_USER, LIVE_URL } = process.env;

module.exports = {
    BASE_URL,
    LIVE_URL,
    PORT,
    SECRET_KEY,
    DATABASE_PASSWORD,
    DATABASE_NAME,
    DATABASE_SERVER,
    DATABASE_USER,
}