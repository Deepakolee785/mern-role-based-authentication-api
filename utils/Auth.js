const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const User = require('../models/User')
const { APP_SECRET } = require('../config')
const { check } = require('express-validator')

/**
 * @DESC To register the user(USER, ADMIN, SUPERADMIN )
 */
const userRegister = async (userData, role, res) => {
  try {
    // Validate Username
    let usernameTaken = await validateUsername(userData.username)
    if (usernameTaken)
      return res
        .status(400)
        .send({ message: 'Username is already taken.', status: false })

    // Validate Email
    let emailRegistered = await validateEmail(userData.email)
    if (emailRegistered)
      return res.status(400).send({
        message: 'Email has already been registered.',
        status: false,
      })

    // Get hashed password
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(userData.password, salt)

    // Create a new User
    const newUser = new User({
      ...userData,
      password: hashedPassword,
      role,
    })

    const savedUser = await newUser.save()
    return res.status(201).send({
      message: `${savedUser.role} registered successfully!`,
      user: savedUser._id,
      status: true,
    })
  } catch (error) {
    return res.send({
      message: 'Unable to register you account.',
      status: false,
    })
  }
}

/**
 * @DESC To login the user(USER, ADMIN, SUPERADMIN )
 */

const userLogin = async (userData, role, res) => {
  try {
    let { username, password } = userData

    // Check if username is in the database
    const user = await User.findOne({ username })
    if (!user)
      return res
        .status(404)
        .send({ message: 'Invalid username.', status: false })

    // Check if the role matches
    if (user.role !== role)
      return res.status(403).send({
        message: 'Please make sure you are logging in form right portal',
        status: false,
      })

    // Check if password matches the user
    let isPasswordMatched = await bcrypt.compare(password, user.password)
    if (isPasswordMatched) {
      // Generate and Assign the token
      const payload = {
        user_id: user._id,
        role: user.role,
        username: user.username,
      }
      let token = jwt.sign(payload, APP_SECRET, { expiresIn: '7 days' })
      res.status(200).send({
        message: `${user.role} logged in successfully`,
        status: true,
        token,
      })
    } else {
      return res.status(403).send({
        message: 'Incorrect Password.',
        status: false,
      })
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: 'Unable to login to you account.', status: false })
  }
}

// Check if username is taken
const validateUsername = async (username) => {
  let user = await User.findOne({ username })
  return user ? true : false
}

// Check if email is already been registered
const validateEmail = async (email) => {
  let user = await User.findOne({ email })
  return user ? true : false
}

/**
 * @DESC Passport middleware
 */
const userAuth = passport.authenticate('jwt', { session: false })

// Serialized User
const serializedUser = (user) => {
  return {
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
  }
}

/**
 * @DESC Check role middleware
 */
const checkRole = (roles) => (req, res, next) =>
  roles.includes(req.user.role)
    ? next()
    : res.status(401).send({ message: 'Unauthorized', status: false })

/**
 * @DESC Register Validation
 */

const registerValidation = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please enter a valid email').isEmail(),
  check('username', 'Username is required').not().isEmpty(),
  check('password', 'Password must contain atleast six characters').isLength({
    min: 6,
  }),
]

const loginValidation = [
  check('username', 'Username is required').not().isEmpty(),
  check('password', 'Password must contain atleast six characters').isLength({
    min: 6,
  }),
]

module.exports = {
  userRegister,
  userLogin,
  userAuth,
  serializedUser,
  checkRole,
  registerValidation,
  loginValidation,
}
