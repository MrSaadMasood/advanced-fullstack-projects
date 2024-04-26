import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ChatForm from "../../Components/Forms/ChatForm"
import { user } from "../testUtils"

describe('tests the chat form component', () => { 
    const handleFileChange = vi.fn()
    const onChange = vi.fn()
    const handleSubmit = vi.fn()
    beforeEach(()=>{

        render(
            <ChatForm 
                 handleFileChange={handleFileChange}
                 onChange={onChange}
                 handleSubmit={handleSubmit}
            />
        )
    })

    it("should render the chat form", ()=>{
        expect(screen.getByTestId("submit")).toBeInTheDocument()
        expect(screen.getByTestId("file")).toBeInTheDocument()
        expect(screen.getByTestId("triggerFileInput")).toBeInTheDocument()
    })

    it("should input the text", async ()=>{

        const inputElement = screen.getByPlaceholderText("Type a message")
        await user.type(inputElement, "chat form")
        expect(onChange).toHaveBeenCalledTimes(9)
    })

    it("should upload the image", async ()=>{

        const imageInput = screen.getByTestId("file")
        await user.upload(imageInput, new File(["file"], "image.jpg", { type : "image/jpg"}))
        expect(handleFileChange).toHaveBeenCalled()
    })
        
 })