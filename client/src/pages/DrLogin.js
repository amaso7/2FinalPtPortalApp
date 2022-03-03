import React, { useState } from 'react'
import { Row, Col, Form, Button } from 'react-bootstrap'
import { gql, useLazyQuery } from '@apollo/client'
import { Link } from 'react-router-dom'

import { useAuthDispatch } from '../context/auth'

const LOGIN_DRUSER = gql`
  query drlogin($drusername: String!, $password: String!) {
    drlogin(drusername: $drusername, password: $password) {
      drusername
      email
      createdAt
      token
    }
  }
`

export default function DrLogin(props) {
  const [variables, setVariables] = useState({
    drusername: '',
    password: '',
  })
  const [errors, setErrors] = useState({})

  const dispatch = useAuthDispatch()

  const [loginDrUser, { loading }] = useLazyQuery(LOGIN_DRUSER, {
    onError: (err) => setErrors(err.graphQLErrors[0].extensions.errors),
    onCompleted(data) {
      dispatch({ type: 'DRLOGIN', payload: data.drlogin })
      window.location.href = '/drHome'
    },
  })

  const submitLoginForm = (e) => {
    e.preventDefault()

    loginDrUser({ variables })
  }

  return ( <Row className=" py-5 justify-content-center">
  <Col sm={8} md={6} lg={4}>
    
    <h1 className='text-center '>Azure for Health LLC. Provier Portal </h1>
    <h3 className='text-center '>Doctors Login Here!</h3>
    <Form onSubmit={submitLoginForm}>

<Form.Group >
<Form.Label className={errors.drusername && 'text-danger'}>{errors.drusername ?? 'Username'}</Form.Label>
<Form.Control type="text" placeholder="Enter Username" value={variables.drusername} className={errors.drusername && 'is-invalid'} onChange={(e) => 
  setVariables({...variables,drusername: e.target.value}) } />
</Form.Group>
<Form.Group >
<Form.Label className={errors.password && 'text-danger'}>{errors.password ?? 'Password'}</Form.Label>
<Form.Control type="Password" placeholder="Enter Password" value={variables.password} className={errors.password && 'is-invalid'} onChange={(e) => 
  setVariables({...variables,password: e.target.value}) } />
</Form.Group>

<div className="text-center py-2">
  <Button variant="success" type="submit" disabled= {loading}>
      { loading ? 'loading...': 'Login'}
</Button>
<br />
      <small>
        Don't have an account? <Link to="/drregister">Provider Register</Link>
      </small>
<br />
      <small>
        If you are a Patient, click here! <Link to="/login">Patient Login</Link>
      </small>
</div>
</Form>
</Col>
</Row>
)
}
