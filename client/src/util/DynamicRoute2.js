import React from 'react'
import { Route, Redirect } from 'react-router-dom'

import { useAuthState } from '../context/auth'

export default function DynamicRoute2(props) {
  const { druser } = useAuthState()

if (props.authenticated && !druser) {
    return <Redirect to="/drlogin" />
  } else if (props.guest && druser) {
    return <Redirect to="/drHome" />
  } else {
    return <Route component={props.component} {...props} />
  }
}
