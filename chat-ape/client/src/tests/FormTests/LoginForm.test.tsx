import { beforeEach, describe, expect, it } from "vitest"
import { customRender, user } from "../testUtils"
import LoginForm from "../../Components/Forms/LoginForm"
import { screen } from "@testing-library/react"
import "@testing-library/jest-dom" 

describe('tests the login form', () => { 
    beforeEach(()=> {
        customRender(<LoginForm />)
    })

    it("should render the input form", async ()=>{

        const emailInput = screen.getByLabelText("Email")
        const passwordInput = screen.getByLabelText("Password")
        const guestLogin = screen.getByText("Guest Login")
        expect(emailInput).toBeInTheDocument()
        expect(guestLogin).toBeInTheDocument()
        expect(passwordInput).toBeInTheDocument()
    })
    it("should do successfull normal login and guest login", async ()=>{

        const emailInput = screen.getByTestId("email")
        const passwordInput = screen.getByTestId("password")
        const submit = screen.getByDisplayValue("Log In")
        const guestLogin = screen.getByText("Guest Login")

        await user.type(emailInput, "saad@gmail.com")
        await user.type(passwordInput, "Saad.Masood1122")
        await user.click(submit)

        expect(submit).toBeInTheDocument()

        const errorMessage = screen.queryByText("Failed to Log the User in! Try Again")
        expect(errorMessage).not.toBeInTheDocument()
        
        // testing the guest login

        await user.clear(passwordInput)
        await user.clear(emailInput)
        await user.click(guestLogin)

        expect(errorMessage).not.toBeInTheDocument()
    })

    it("should login to google successfully", async ()=>{
        const googleLoginButton = screen.getByRole("button", { name : "Sign in with Google"})

        await user.click(googleLoginButton)

        const errorMessage = screen.queryByText("Failed to Log the User in! Try Again")
        expect(screen.queryByText("Google Login Failed! Try Again!")).not.toBeInTheDocument()
        expect(errorMessage).not.toBeInTheDocument()
    })

    it("should fail the login and display the error div", async ()=>{

        const emailInput = screen.getByTestId("email")
        const passwordInput = screen.getByTestId("password")
        const submit = screen.getByDisplayValue("Log In")

        await user.type(passwordInput, "Wrong.123")
        await user.type(emailInput, "saad@gmail.com")
        await user.click(submit)

        expect(submit).toBeInTheDocument()

        const errorMessage = screen.queryByText("Failed to Log the User in! Try Again")
        expect(errorMessage).toBeInTheDocument()
    })

 })
