const userResolvers = require('./users')
const messageResolvers = require('./messages')
const druserResolvers = require('./drusers')
const { User, Message, Druser } = require('../../models')


module.exports = {
  Message: {
    createdAt: (parent) => parent.createdAt.toISOString(),
  },
  Reaction: {
    createdAt: (parent) => parent.createdAt.toISOString(),
    message: async (parent) => await Message.findByPk(parent.messageId),
    druser: async (parent) =>
      await Druser.findByPk(parent.druserId, {
        attributes: ['drusername', 'imageUrl', 'createdAt'],
      }),
    user: async (parent) =>
      await User.findByPk(parent.userId, {
        attributes: ['username', 'imageUrl', 'createdAt'],
      }),
  },
  User: {
    createdAt: (parent) => parent.createdAt.toISOString(),
  },
  Druser: {
    createdAt: (parent) => parent.createdAt.toISOString(),
  },
  Query: {
    ...druserResolvers.Query,
    ...userResolvers.Query,
    ...messageResolvers.Query,
  },
  Mutation: {
    ...druserResolvers.Mutation,
    ...userResolvers.Mutation,
    ...messageResolvers.Mutation,
  },
  Subscription: {
    ...messageResolvers.Subscription,
  },
}
