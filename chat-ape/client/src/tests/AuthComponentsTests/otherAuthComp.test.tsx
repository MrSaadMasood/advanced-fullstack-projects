import { describe, expect, it } from "vitest"
import { customRender } from "../testUtils"
import { screen } from "@testing-library/react"
import Login from "../../Components/AuthComponents/Login"
import "@testing-library/jest-dom"
import Signup from "../../Components/AuthComponents/Signup"

describe('tests the main login page not functionlity', () => {  
    it("should render the login page", ()=>{

        customRender(
            <Login />
        )

        const appName = screen.getByRole("heading", { name : "ChatApe"})
        const loginHeading = screen.getByRole("heading", { name : "Login"})
        expect(appName).toBeInTheDocument()
        expect(loginHeading).toBeInTheDocument()
    })
})

describe('tests the main signup page and not its funcationlity', () => { 

    it('should render the sign up page', () => { 

        customRender(
            <Signup />
        )
        
        const appName = screen.getByRole("heading", { name : "ChatApe"})
        const createAccountHeading = screen.getByRole("heading", { name : "Create Account"})
        expect(appName).toBeInTheDocument()
        expect(createAccountHeading).toBeInTheDocument()
    })
 })