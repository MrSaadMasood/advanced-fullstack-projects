import userEvent from '@testing-library/user-event'
import {  beforeEach, describe, expect, it, vi } from 'vitest' 
import { customRender, setGlobalError, userData } from '../testUtils'
import Profile from '../../Components/AuthComponents/Profile'
import { screen } from '@testing-library/react'
import "@testing-library/jest-dom"

describe('tests the Profile compoent', () => { 

    const user = userEvent.setup()
    const isUserChangedSetter = vi.fn()
    global.URL.createObjectURL = vi.fn()
    userData.profilePicture = "iamge-radom.jpg"
    beforeEach(()=> {

            customRender(
                <Profile
                    profilePictureUrl={"path"} 
                    isUserChangedSetter={isUserChangedSetter}
                    userData={userData}
                    setGlobalError={setGlobalError}
                />
        )

    })
    it('should render the Profile compoenent', async () => { 
        
        const fullNameElem = screen.getByText("test user")
        const bioElement = screen.getByText("i am a test user")
        expect(bioElement).toBeInTheDocument()
        expect(fullNameElem).toBeInTheDocument()

     })

    it('should change the bio of the user', async () => { 

        const bioEditButton = screen.getByTestId("editBio")

        await user.click(bioEditButton)

        const bioSubmit = screen.getByDisplayValue("Submit")
        const textInput = screen.getByPlaceholderText("Enter Bio Here")
        await user.type(textInput, " God of Thunder")
        await user.click(bioSubmit)

        const bioElement = screen.getByText("i am a test user God of Thunder")
        expect(bioElement).toBeInTheDocument()

     })

    it("should successfully update profile picture and delete the previous one", async ()=> {
        const imageFile = new File(["hello"], "hello.jpg", { type : "image/jpg"})
        const getProfilePictureButton = screen.getByTestId("getPicture")
        const imageInput = screen.getByTestId("profilePicture")

        await user.click(getProfilePictureButton)
        await user.upload(imageInput, imageFile)
        const handleImageSubmission = screen.getByTestId("setImage")
        await user.click(handleImageSubmission)
        expect(isUserChangedSetter).toHaveBeenCalled()
    })

    it("should check enabling and disabling of factor 2 authentication", async ()=>{

        const toggleButton = screen.getByTestId("toggleButton")
        await user.click(toggleButton)
        expect(toggleButton.ariaChecked).toBe("true")
        expect(isUserChangedSetter).toHaveBeenCalledWith(false)

        await user.click(toggleButton)
        expect(toggleButton.ariaChecked).toBe("false")
    })
 })
