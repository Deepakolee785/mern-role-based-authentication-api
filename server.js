const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const { success, error } = require('consola')
const passport = require('passport')

// Bring app constants
const { DB_URL, PORT } = require('./config')

// Initialize the app
const app = express()

// global middleware
app.use(cors())
app.use(express.json())
app.use(passport.initialize())

require('./middlewares/validateToken')(passport)

// User router middleware
app.use('/api/users', require('./routes/api/users'))

const startApp = async () => {
  try {
    // Connecting with mongoDB
    await mongoose.connect(DB_URL, {
      useFindAndModify: false,
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
    success({
      message: `Mongodb connected successfully! \n${DB_URL}`,
      badge: true,
    })

    // Listen to port
    app.listen(PORT, () =>
      success({
        message: `Server is running on ${PORT}`,
        badge: true,
      })
    )
  } catch (error) {
    error({
      message: `Unable to connect to MongoDB! \n${err}`,
      badge: true,
    })
    startApp()
  }
}

startApp()
