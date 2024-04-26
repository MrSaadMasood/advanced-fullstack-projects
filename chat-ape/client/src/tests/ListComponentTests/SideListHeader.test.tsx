import "@testing-library/jest-dom"
import { customRender, handleChatSearchInputChange, user } from "../testUtils"
import { screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import SideListsHeader from "../../Components/ListsComponets/SideListsHeader"

describe('tests the SideListHeader component', () => { 
    const setIsSearchTriggered = vi.fn()

    it('should render the component successfully', () => { 

        customRender(
            <SideListsHeader 
                handleSearchInputChange={handleChatSearchInputChange}
                headerText="test header"
                searchInput="random"
                isSearchTriggered={false}
                setIsSearchTriggered={setIsSearchTriggered}
            />
        )
        expect(screen.getByText("test header")).toBeInTheDocument()
        expect(screen.queryByText("random")).not.toBeInTheDocument()
    })

    it("should open the search bar and filter based on search and then close the search bar", async ()=>{

        customRender(
            <SideListsHeader 
                handleSearchInputChange={handleChatSearchInputChange}
                headerText="test header"
                searchInput="random"
                isSearchTriggered={true}
                setIsSearchTriggered={setIsSearchTriggered}
            />
        )
        expect(screen.queryByText("test header")).not.toBeInTheDocument()
        screen.debug()
        
        const inputSearch = screen.getByPlaceholderText("Search Something")
        await user.type(inputSearch, "other")
        expect(handleChatSearchInputChange).toHaveBeenCalledTimes(5)

        await user.click(screen.getByTestId("closeSearch"))
        expect(setIsSearchTriggered).toHaveBeenCalledTimes(1)

    })

 })