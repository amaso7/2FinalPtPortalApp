import React from 'react'
import { Container } from 'react-bootstrap'
import { BrowserRouter, Switch } from 'react-router-dom'

import ApolloProvider from './ApolloProvider'

import './App.scss'

import Home from './pages/home/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import DrRegister from './pages/DrRegister'
import DrHome from './pages/Drhome/drHome'
import DrLogin from './pages/DrLogin'

import { AuthProvider } from './context/auth'
import { MessageProvider } from './context/message'
import DynamicRoute from './util/DynamicRoute'

function App() {
  return (
    <ApolloProvider>
      <AuthProvider>
        <MessageProvider>
          <BrowserRouter>
            <Container className="pt-5">
              <Switch>
                <DynamicRoute exact path="/" component={Home} authenticated />
                <DynamicRoute path="/register" component={Register} guest />
                <DynamicRoute path="/login" component={Login} guest />
                <DynamicRoute path="/drregister" component={DrRegister} guest />
                <DynamicRoute path="/drlogin" component={DrLogin} guest />
                <DynamicRoute exact path="/drHome" component={DrHome} authenticated/>
              </Switch>
            </Container>
          </BrowserRouter>
        </MessageProvider>
      </AuthProvider>
    </ApolloProvider>
  )
}

export default App
