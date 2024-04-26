import { describe, expect, it, vi } from "vitest";
import NewGroupForm from "../../Components/Forms/NewGroupForm";
import "@testing-library/jest-dom"
import { screen, waitFor } from "@testing-library/react";
import { customRender, user } from "../testUtils";

describe("should test the new group form component", ()=>{

    it("should successfully render the form", async ()=>{

        customRender(
            <NewGroupForm />
        )
        expect(screen.getByRole("button", { name : "Cancel"})).toBeInTheDocument()
        expect(screen.getByRole("button", { name : "Submit"})).toBeInTheDocument()
    })

    it("should successfully create a new group form and the failure of group creation", async ()=>{

        global.URL.createObjectURL = vi.fn()
        global.URL.revokeObjectURL = vi.fn()

        customRender(
            <NewGroupForm /> 
        )

        const groupNameInput = screen.getByPlaceholderText("Group Name")
        await user.type(groupNameInput, "new test group")
        await waitFor(()=> screen.debug())
        await waitFor(async ()=> {
            const addButtons = screen.getAllByRole("button", { name : "Add"})
            for (let button of addButtons) {
                await user.click(button)
            }
            expect(screen.queryByText("Add")).not.toBeInTheDocument()

            // removeing an added member
            const removeButtons = screen.getAllByRole("button", { name : "Remove"})
            await user.click(removeButtons[0])
            expect(screen.getByText("Add")).toBeInTheDocument()

            // uploading an image
            const imageInput = screen.getByTestId("groupImageInput")
            const imageFile = new File(["iamge"], "hello.jpg", { type : "image/jpg"})
            await user.upload(imageInput, imageFile)

            const submitButton = screen.getByRole("button", { name : "Submit"})
            await user.click(submitButton)

        })

    })
})