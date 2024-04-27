import "@testing-library/jest-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { customRender, setGlobalError, user } from "../testUtils"
import SideBar from "../../Components/MiscComponents/SideBar"
import { screen, waitFor } from "@testing-library/react"

describe('tests the SideBar component', () => { 
    const setOptions = vi.fn() 

    beforeEach(()=>{
        customRender(
            <SideBar
                profilePictureUrl=""
                setOptions={setOptions}
                setGlobalError={setGlobalError}
            />
        )
    })

    it("should render the component successfully", async ()=>{
        expect(screen.getByAltText("logo")).toBeInTheDocument()
        expect(screen.getByTestId("option1")).toBeInTheDocument()
        expect(screen.getByTestId("option2")).toBeInTheDocument()
        expect(screen.getByTestId("option3")).toBeInTheDocument()
        expect(screen.getByTestId("option4")).toBeInTheDocument()
        expect(screen.getByTestId("option5")).toBeInTheDocument()
        expect(screen.getByTestId("option6")).toBeInTheDocument()
        
        await user.click(screen.getByTestId("option3"))
        expect(setOptions).toHaveBeenCalledTimes(1)
    })

    it('should successfully log the user out', async ()=>{

        const logoutButton = screen.getByTestId("option7")
        await user.click(logoutButton)
        
        await waitFor(()=>{
            expect(setGlobalError).not.toHaveBeenCalled()
        })
    })
 })