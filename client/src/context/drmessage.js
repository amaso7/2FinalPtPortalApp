import React, { createContext, useReducer, useContext } from 'react'

const MessageStateContext = createContext()
const MessageDispatchContext = createContext()

const messageReducer = (state, action) => {
  let drusersCopy, druserIndex
  const { drusername, message, messages, reaction } = action.payload
  switch (action.type) {
    case 'SET_DRUSERS':
      return {
        ...state,
        drusers: action.payload,
      }
    case 'SET_DRUSER_MESSAGES':
      drusersCopy = [...state.drusers]

      druserIndex = drusersCopy.findIndex((u) => u.drusername === drusername)

      drusersCopy[druserIndex] = { ...drusersCopy[druserIndex], messages }

      return {
        ...state,
        drusers: drusersCopy,
      }
    case 'SET_SELECTED_DRUSER':
      drusersCopy = state.users.map((druser) => ({
        ...druser,
        selected: druser.drusername === action.payload,
      }))

      return {
        ...state,
        drusers: drusersCopy,
      }
    case 'ADD_DRMESSAGE':
      drusersCopy = [...state.drusers]

      druserIndex = drusersCopy.findIndex((u) => u.drusername === drusername)

      message.reactions = []

      let newDruser = {
        ...drusersCopy[druserIndex],
        messages: drusersCopy[druserIndex].messages
          ? [message, ...drusersCopy[druserIndex].messages]
          : null,
        latestMessage: message,
      }

      drusersCopy[druserIndex] = newDruser

      return {
        ...state,
        drusers: drusersCopy,
      }

    case 'ADD_REACTION':
      drusersCopy = [...state.drusers]

      druserIndex = drusersCopy.findIndex((u) => u.drusername === drusername)

      // Make a shallow copy of user
      let druserCopy = { ...drusersCopy[druserIndex] }

      // Find the index of the message that this reaction pertains to
      const messageIndex = druserCopy.messages?.findIndex(
        (m) => m.uuid === reaction.message.uuid
      )

      if (messageIndex > -1) {
        // Make a shallow copy of user messages
        let messagesCopy = [...druserCopy.messages]

        // Make a shallow copy of user message reactions
        let reactionsCopy = [...messagesCopy[messageIndex].reactions]

        const reactionIndex = reactionsCopy.findIndex(
          (r) => r.uuid === reaction.uuid
        )

        if (reactionIndex > -1) {
          // Reaction exists, update it
          reactionsCopy[reactionIndex] = reaction
        } else {
          // New Reaction, add it
          reactionsCopy = [...reactionsCopy, reaction]
        }

        messagesCopy[messageIndex] = {
          ...messagesCopy[messageIndex],
          reactions: reactionsCopy,
        }

        druserCopy = { ...druserCopy, messages: messagesCopy }
        drusersCopy[druserIndex] = druserCopy
      }

      return {
        ...state,
        drusers: drusersCopy,
      }

    default:
      throw new Error(`Unknown action type: ${action.type}`)
  }
}

export const MessageProvider = ({ children }) => {
  const [state, dispatch] = useReducer(messageReducer, { drusers: null })

  return (
    <MessageDispatchContext.Provider value={dispatch}>
      <MessageStateContext.Provider value={state}>
        {children}
      </MessageStateContext.Provider>
    </MessageDispatchContext.Provider>
  )
}

export const useMessageState = () => useContext(MessageStateContext)
export const useMessageDispatch = () => useContext(MessageDispatchContext)
