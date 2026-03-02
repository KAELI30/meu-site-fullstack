const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const userRepository = require('../repositories/userRepository')

async function login(email, password) {
  const user = await userRepository.findByEmail(email)

  if (!user) {
    throw new Error('Invalid credentials')
  }

  const passwordMatch = await bcrypt.compare(password, user.password)

  if (!passwordMatch) {
    throw new Error('Invalid credentials')
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )

  return token
}

module.exports = { login }