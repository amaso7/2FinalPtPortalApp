import React, { Fragment, useEffect } from 'react'
import { Row, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { gql, useSubscription } from '@apollo/client'

import { useAuthDispatch, useAuthState } from '../../context/auth'
import { useMessageDispatch } from '../../context/message'

import Users from '../home/Users'
import Messages from '../home/Messages'


const NEW_MESSAGE = gql`
  subscription newMessage {
    newMessage {
      uuid
      from
      to
      content
      createdAt
    }
  }
`

const NEW_REACTION = gql`
  subscription newReaction {
    newReaction {
      uuid
      content
      message {
        uuid
        from
        to
      }
    }
  }
`

export default function DrHome({ history }) {
  const authDispatch = useAuthDispatch()
  const messageDispatch = useMessageDispatch()

  const { user } = useAuthState()

  const { data: messageData, error: messageError } = useSubscription(
    NEW_MESSAGE
  )

  const { data: reactionData, error: reactionError } = useSubscription(
    NEW_REACTION
  )

  useEffect(() => {
    if (messageError) console.log(messageError)

    if (messageData) {
      const message = messageData.newMessage
      const otherUser = user.username === message.to ? message.from : message.to

      messageDispatch({
        type: 'ADD_MESSAGE',
        payload: {
          username: otherUser,
          message,
        },
      })
    }
  }, [messageError, messageData])

  useEffect(() => {
    if (reactionError) console.log(reactionError)

    if (reactionData) {
      const reaction = reactionData.newReaction
      const otherUser =
        user.username === reaction.message.to
          ? reaction.message.from
          : reaction.message.to

      messageDispatch({
        type: 'ADD_REACTION',
        payload: {
          username: otherUser,
          reaction,
        },
      })
    }
  }, [reactionError, reactionData])

  const logout = () => {
    authDispatch({ type: 'LOGOUT' })
    window.location.href = '/login'
  }

  return (
    <Fragment>
        <h1>Azure for Health Dr Portal</h1>
      <Row>
        <Link to={{ pathname: "https://rx7.drfirst.com/login.jsp" }} target="_blank">
            <Button variant="link">Rx Portal</Button>
        </Link>
        <Button variant="link" onClick={logout}>
          Logout
        </Button>
      </Row>
      <Row className="bg-white">
        <Users />
        <Messages />
      </Row>
    </Fragment>
  )
}
