import "@testing-library/jest-dom"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { customRender, factor2AuthLogin, user } from "../testUtils"
import Factor2Auth from "../../Components/Forms/Factor2Auth"
import { screen } from "@testing-library/react"

describe("tests the factor 2 auth form", async ()=>{
    
    beforeEach(()=> {
        localStorage.setItem("f2a", JSON.stringify(factor2AuthLogin))
        customRender(<Factor2Auth />)
    })

    afterEach(()=> {
        localStorage.removeItem("f2a")
    })

    it("should render the factor2Auth Form compoenent", async ()=>{

        expect(screen.getByRole("button", { name : "QR Code"})).toBeInTheDocument()
        expect(screen.getByRole("button", { name : "Passkey"})).toBeInTheDocument()
        expect(screen.queryByRole("button", { name : "Failed to get the QR Code. Try Again!"})).not.toBeInTheDocument()
    })

    it("should successfully navigate the user is the passkey is correct", async ()=>{
        const passKeyButton = screen.getByRole("button", { name : "Passkey"})
        await user.click(passKeyButton)

        const passkeyInputs = screen.getAllByTestId("PasskeyInput")
        for(let input of passkeyInputs){
            await user.type(input, "2" )
        }
        expect(passkeyInputs[1]).toHaveValue(2)

        const submitButton = screen.getByRole("button", { name : "Submit"})
        await user.click(submitButton)
        expect(screen.queryByText("Failed to verify the Otp. Try Again!")).not.toBeInTheDocument()

    })
    it("should give error when wrong passkey is sent", async ()=>{
        const passKeyButton = screen.getByRole("button", { name : "Passkey"})
        await user.click(passKeyButton)

        const passkeyInputs = screen.getAllByTestId("PasskeyInput")
        for(let input of passkeyInputs){
            await user.type(input, "1" )
        }
        expect(passkeyInputs[1]).toHaveValue(1)

        const submitButton = screen.getByRole("button", { name : "Submit"})
        await user.click(submitButton)
        expect(screen.getByText("Failed to verify the Otp. Try Again!")).toBeInTheDocument()

    })
})