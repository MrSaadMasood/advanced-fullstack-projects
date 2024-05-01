import ReactDOM from 'react-dom/client'
import './index.css'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import PrivateRoute from './Components/PrivateRoute.jsx'
import NewGroupForm from './Components/Forms/NewGroupForm.jsx'
import ErrorPage from './Components/ErrorComponents/ErrorPage.js'
import { AuthProvider } from './Components/Context/authProvider.jsx'
import { QueryClient, QueryClientProvider  } from '@tanstack/react-query' 
import { GoogleOAuthProvider } from '@react-oauth/google' 
import React, { lazy, Suspense } from 'react'
import Loader from './Components/ReuseableFormComponents/Loader.js'

const Home = lazy(()=> import("./Components/Home.js"))
const Signup = lazy(()=> import("./Components/AuthComponents/Signup.js"))
const Factor2Auth = lazy(()=> import("./Components/Forms/Factor2Auth.js"))
const queryClient = new QueryClient()

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/' element={<PrivateRoute />} >
        <Route path='/' element={<Suspense fallback={<Loader />}><Home/></Suspense>} index/>
        <Route path='/create-new-group' element={<NewGroupForm />} />
        <Route path='*' element={<ErrorPage/>} />
      </Route>
      <Route path='/sign-up' element={<Suspense fallback={<Loader />}> <Signup /> </Suspense>} />
      <Route path='/factor-2-auth' element={<Suspense fallback={<Loader />}> <Factor2Auth /> </Suspense>} />
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
  )