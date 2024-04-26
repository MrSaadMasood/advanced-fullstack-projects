import "@testing-library/jest-dom"
import { beforeEach, describe, expect, it } from "vitest"
import SignUpForm from "../../Components/Forms/SignupForm"
import { customRender, user } from "../testUtils"
import { screen } from "@testing-library/react"

describe("tests the signup form component", ()=>{
    beforeEach(()=>{

        customRender(
            <SignUpForm />
        )
    })
    it("should successfully render and sign up the user", async ()=>{

        const nameInput = screen.getByLabelText("Full Name")
        const emailInput = screen.getByLabelText("Email")
        const passwordInput = screen.getByLabelText("Password")
        const submit = screen.getByDisplayValue("Sign Up")

        expect(nameInput).toBeInTheDocument()
        expect(emailInput).toBeInTheDocument()

        await user.type(nameInput, "Test Maker Greek")
        await user.type(emailInput, "test@gmail.com")
        await user.type(passwordInput, "Testing.123")
        await user.click(submit)

        const error = screen.queryByText("Could not sign you up, try again!")
        expect(error).not.toBeInTheDocument()

    })

    it("should fail the signup of the user", async ()=>{

        const nameInput = screen.getByLabelText("Full Name")
        const emailInput = screen.getByLabelText("Email")
        const passwordInput = screen.getByLabelText("Password")
        const submit = screen.getByDisplayValue("Sign Up")

        expect(nameInput).toBeInTheDocument()
        expect(emailInput).toBeInTheDocument()

        await user.type(nameInput, "Test Maker Greek")
        await user.type(emailInput, "wrong@gmail.com")
        await user.type(passwordInput, "Testing.123")
        await user.click(submit)

        const error = screen.queryByText("Could not sign you up, try again!")
        expect(error).toBeInTheDocument()
    })
})