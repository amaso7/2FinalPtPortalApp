const bcrypt = require('bcryptjs')
const { UserInputError, AuthenticationError } = require('apollo-server')
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')

const { Message, DrUser } = require('../../models')
const { JWT_SECRET } = require('../../config/env.json')

module.exports = {
  Query: {
    getDrUsers: async (_, __, { druser }) => {
      try {
        if (!druser) throw new AuthenticationError('Unauthenticated')

        let drusers = await DrUser.findAll({
          attributes: ['drusername', 'imageUrl', 'createdAt'],
          where: { drusername: { [Op.ne]: druser.drusername } },
        })

        const allDrUserMessages = await Message.findAll({
          where: {
            [Op.or]: [{ from: druser.drusername }, { to: druser.drusername }],
          },
          order: [['createdAt', 'DESC']],
        })

        drusers = drusers.map((otherDrUser) => {
          const latestMessage = allDrUserMessages.find(
            (m) => m.from === otherDrUser.drusername || m.to === otherDrUser.drusername
          )
          otherDrUser.latestMessage = latestMessage
          return otherDrUser
        })

        return drusers
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    drlogin: async (_, args) => {
      const { drusername, password } = args
      let errors = {}

      try {
        if (drusername.trim() === '')
          errors.drusername = 'username must not be empty'
        if (password === '') errors.password = 'password must not be empty'

        if (Object.keys(errors).length > 0) {
          throw new UserInputError('bad input', { errors })
        }

        const druser = await DrUser.findOne({
          where: { drusername },
        })

        if (!druser) {
          errors.drusername = 'user not found'
          throw new UserInputError('user not found', { errors })
        }

        const correctPassword = await bcrypt.compare(password, druser.password)

        if (!correctPassword) {
          errors.password = 'password is incorrect'
          throw new UserInputError('password is incorrect', { errors })
        }

        const token = jwt.sign({ drusername }, JWT_SECRET, {
          expiresIn: 60 * 60,
        })

        return {
          ...druser.toJSON(),
          token,
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
  },
  Mutation: {
    registerDr: async (_, args) => {
      let { drusername, email, password, confirmPassword } = args
      let errors = {}

      try {
        // Validate input data
        if (email.trim() === '') errors.email = 'email must not be empty'
        if (drusername.trim() === '')
          errors.drusername = 'username must not be empty'
        if (password.trim() === '')
          errors.password = 'password must not be empty'
        if (confirmPassword.trim() === '')
          errors.confirmPassword = 'repeat password must not be empty'

        if (password !== confirmPassword)
          errors.confirmPassword = 'passwords must match'

        // // Check if username / email exists
        // const userByUsername = await User.findOne({ where: { username } })
        // const userByEmail = await User.findOne({ where: { email } })

        // if (userByUsername) errors.username = 'Username is taken'
        // if (userByEmail) errors.email = 'Email is taken'

        if (Object.keys(errors).length > 0) {
          throw errors
        }

        // Hash password
        password = await bcrypt.hash(password, 6)

        // Create user
        const druser = await DrUser.create({
          drusername,
          email,
          password,
        })

        // Return user
        return druser
      } catch (err) {
        console.log(err)
        if (err.name === 'SequelizeUniqueConstraintError') {
          err.errors.forEach(
            (e) => (errors[e.path] = `${e.path} is already taken`)
          )
        } else if (err.name === 'SequelizeValidationError') {
          err.errors.forEach((e) => (errors[e.path] = e.message))
        }
        throw new UserInputError('Bad input', { errors })
      }
    },
  },
}
