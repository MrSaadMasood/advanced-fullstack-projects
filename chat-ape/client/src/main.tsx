import React from 'react'
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

const queryClient = new QueryClient()

// async function deferRender(){
//   const { worker } = await import("./mocks/browser.js")
//   return worker.start()
// }
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/' element={<PrivateRoute />} >
        <Route path='/' element={<Home />} index/>
        <Route path='/create-new-group' element={<NewGroupForm />} />
      </Route>
      <Route path='/login' element={<Login />} />
      <Route path='/sign-up' element={<Signup />} />
      <Route path='*' element={<ErrorPage/>} />
    </>
  )
)


  ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
  )