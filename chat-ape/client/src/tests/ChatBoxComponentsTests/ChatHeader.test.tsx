import "@testing-library/jest-dom"
import { beforeEach, describe, expect, it } from "vitest"
import { customRender, generalGroupData, handleChatSearchInputChange, handleIsFilterClicked, openGroupManager, selectedChatSetter } from "../testUtils"
import ChatHeader from "../../Components/ChatBoxComponets/ChatHeader"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

describe('test the chat header component', () => { 
    const user = userEvent.setup()

    beforeEach(()=>{
        customRender(
            <ChatHeader
                chatSearchInput=""
                friendChatImage=""
                dataSent={generalGroupData}
                handleChatSearchInputChange={handleChatSearchInputChange}
                handleIsFilterClicked={handleIsFilterClicked}
                openGroupManager={openGroupManager}
                selectedChatSetter={selectedChatSetter}
            />
        )
    })

    it("should render the chat header component", ()=>{

        expect(screen.getByText("chat group")).toBeInTheDocument()
        expect(screen.getByTestId("filterButton")).toBeInTheDocument()
    })

    it("should open the chat filter", async ()=>{
        const filterButton = screen.getByTestId("filterButton")
        await user.click(filterButton)
        expect(handleIsFilterClicked).toHaveBeenCalled()
    })

    it("should open the group manager", async ()=>{

        const groupManagerButton = screen.getByTestId("groupManagerButton")
        await user.click(groupManagerButton)
        expect(openGroupManager).toHaveBeenCalled()
    })
    it("should test the successfull working of the search bar", async ()=>{

        const searchButton = screen.getByTestId("searchButton")
        await user.click(searchButton)

        const searchInput = screen.getByTestId("chatHeaderSearchInput")
        await user.type(searchInput, "hello")
        expect(handleChatSearchInputChange).toHaveBeenCalledTimes(5)

        const cancelSearch = screen.getByTestId("cancelSearch")
        await user.click(cancelSearch)
        expect(screen.queryByTestId("chatHeaderSearchInput")).not.toBeInTheDocument()

    })
 })