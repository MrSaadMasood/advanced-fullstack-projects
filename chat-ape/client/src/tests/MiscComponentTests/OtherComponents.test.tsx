import "@testing-library/jest-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import DeleteMessage from "../../Components/MiscComponents/DeleteMessage"
import { render, screen } from "@testing-library/react"
import { groupMembers, handleIsFilterClicked, user } from "../testUtils"
import FilterOptions from "../../Components/MiscComponents/FilterOptions"
import ImageDiv from "../../Components/MiscComponents/ImageDiv"

describe('tests the DeleteMessage component', () => { 
    const deleteMessage = vi.fn()
    const handleMessageDeleteCancellation = vi.fn() 

    it("should render successfully and test tests if it daeletes the message or cancel the operation", async ()=>{
        render(
            <DeleteMessage
                deleteMessage={deleteMessage}
                handleMessageDeleteCancellation={handleMessageDeleteCancellation}
            />
        )
        
        expect(screen.getByText("Are You Sure You Want To Delete This Message")).toBeInTheDocument()

        const deleteButton = screen.getByRole("button", { name : "Delete"})
        const cancelButton = screen.getByRole("button", { name : "Cancel"})

        await user.click(deleteButton)
        await user.click(cancelButton)
    })
 })

describe("it should render the FilterOptions component", ()=>{

    const getFilteredChat = vi.fn()
    beforeEach(()=>{
        render(
            <FilterOptions 
                filterOptions={{ filterClicked : true, type : "group"}}
                getFilteredChat={getFilteredChat}
                groupMembers={groupMembers}
                handleIsFilterClicked={handleIsFilterClicked}
            />
        )
    })
    it("should render successfully", async ()=>{


        expect(screen.getByText("Filter Chat by Date")).toBeInTheDocument()
        expect(screen.getByText("Filter By Group Member")).toBeInTheDocument()
        expect(screen.getByText("Cancel")).toBeInTheDocument()
        expect(screen.getByText("test member 1")).toBeInTheDocument()
        
    })

    it("should check if the fiter button and cancel button are working", async ()=>{

        const filterbutton = screen.getByRole("button", { name : "Filter"})
        const cancelButton = screen.getByRole("button", { name : "Cancel"})
        const selectOptions = screen.getByTestId("selectGroupMembers")

        await user.selectOptions(selectOptions, "test member 1")
        await user.click(filterbutton)
        await user.click(cancelButton)

        expect(getFilteredChat).toHaveBeenCalledTimes(1)
        expect(handleIsFilterClicked).toHaveBeenCalledWith(false, "normal")

    })
})

describe('tests the ImageDiv component', () => { 
    it("should render successfully", ()=>{
        render(
            <ImageDiv image="/public/pattern.jpg" />
        )

    })
 })