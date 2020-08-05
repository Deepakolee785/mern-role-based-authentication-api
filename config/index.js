require('dotenv').config()

module.exports = {
  APP_SECRET: process.env.APP_SECRET,
  DB_URL: process.env.DB_URL,
  PORT: process.env.APP_PORT,
}
