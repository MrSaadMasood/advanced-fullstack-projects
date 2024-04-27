import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ErrorDiv from "../../Components/ReuseableFormComponents/ErrorDiv"
import PasswordCheckBox from "../../Components/ReuseableFormComponents/PasswordCheckBox"
import { user } from "../testUtils"
import SubmitButton from "../../Components/ReuseableFormComponents/SubmitButton"

describe("tests the ErrorDiv compoenent", ()=>{
    it("should render", ()=>{
        render(
            <ErrorDiv 
                errorMessage="random Error"
                isFailed={true} 
                width="w-10"
            />
            )
        
        expect(screen.getByText("random Error")).toBeInTheDocument()
    })

    it("shold faile to render", ()=>{
         render(
            <ErrorDiv 
                errorMessage="random Error"
                isFailed={false} 
                width="w-10"
            />
        )

        expect(screen.queryByText("random Error")).not.toBeInTheDocument()
    })
})

describe('tests the PasswordCheckBox component', () => { 
    it("should check the checkbox", async ()=>{
        const setChecked = vi.fn()
        render(
            <PasswordCheckBox
                checked={false}          
                setChecked={setChecked}
            />
        )

        expect(screen.getByText("Show Password")).toBeInTheDocument()

        const checkBox = screen.getByTestId("showPassword")
        await user.click(checkBox)
        expect(setChecked).toHaveBeenCalledTimes(1)

    })
 })

describe('tests the SubmitButton component', () => { 
    it("should have the correct display value", ()=>{
        render(<SubmitButton value="hello" />)

        expect(screen.getByDisplayValue("hello")).toBeInTheDocument()
    })
 })