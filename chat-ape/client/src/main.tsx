import ReactDOM from 'react-dom/client'
import './index.css'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import Home from './Components/Home.jsx'
import Login from './Components/AuthComponents/Login.js'
import Signup from './Components/AuthComponents/Signup.js'
import PrivateRoute from './Components/PrivateRoute.jsx'
import NewGroupForm from './Components/Forms/NewGroupForm.jsx'
import ErrorPage from './Components/ErrorComponents/ErrorPage.js'
import { AuthProvider } from './Components/Context/authProvider.jsx'
import { QueryClient, QueryClientProvider  } from '@tanstack/react-query' 
import { GoogleOAuthProvider } from '@react-oauth/google' 
import Factor2Auth from './Components/Forms/Factor2Auth.js'
import React from 'react'

const queryClient = new QueryClient()

async function deferRender(){
  const { worker } = await import("./mocks/browser")
  return worker.start()
}
if(process.env.NODE_ENV === "test"){
  (async ()=> await deferRender())()
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/' element={<PrivateRoute />} >
        <Route path='/' element={<Home />} index/>
        <Route path='/create-new-group' element={<NewGroupForm />} />
      </Route>
      <Route path='/login' element={<Login />} />
      <Route path='/sign-up' element={<Signup />} />
      <Route path='/factor-2-auth' element={<Factor2Auth />} />
      <Route path='*' element={<ErrorPage/>} />
    </>
  )
)


  ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
  <GoogleOAuthProvider clientId={import.meta.env.VITE_REACT_GOOGLE_CLIENT_ID}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </QueryClientProvider>
  </GoogleOAuthProvider>
  </React.StrictMode>
  ,
  )