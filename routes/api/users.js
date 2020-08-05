const router = require('express').Router()
const { validationResult } = require('express-validator')

const {
  userRegister,
  userLogin,
  userAuth,
  serializedUser,
  checkRole,
  registerValidation,
  loginValidation,
} = require('../../utils/Auth')

// Users registration Route
router.post('/register-user', registerValidation, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json(errors)
  await userRegister(req.body, 'user', res)
})

// Adim registration Route
router.post(
  '/register-admin',
  registerValidation,
  userAuth,
  checkRole(['superadmin']),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json(errors)
    await userRegister(req.body, 'admin', res)
  }
)

// SuperAdmin registration Route
router.post(
  '/register-superadmin',
  registerValidation,
  userAuth,
  checkRole(['superadmin']),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json(errors)
    await userRegister(req.body, 'superadmin', res)
  }
)

// Users login Route
router.post('/login-user', loginValidation, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json(errors)
  await userLogin(req.body, 'user', res)
})

// Adim login Route
router.post('/login-admin', loginValidation, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json(errors)
  await userLogin(req.body, 'admin', res)
})

// SuperAdmin login Route
router.post('/login-superadmin', loginValidation, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json(errors)
  await userLogin(req.body, 'superadmin', res)
})

// Profile route
router.get('/profile', userAuth, async (req, res) => {
  return res.send(serializedUser(req.user))
})

// Users Protected Route
router.get(
  '/user-protected',
  userAuth,
  checkRole(['user']),
  async (req, res) => {
    return res.send(serializedUser(req.user))
  }
)

// Adim Protected Route
router.get(
  '/admin-protected',
  userAuth,
  checkRole(['admin']),
  async (req, res) => {
    return res.send(serializedUser(req.user))
  }
)

// SuperAdmin Protected Route
router.get(
  '/superadmin-protected',
  userAuth,
  checkRole(['superadmin']),
  async (req, res) => {
    return res.send(serializedUser(req.user))
  }
)

module.exports = router
