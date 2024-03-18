import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { vi, it , expect, beforeAll, afterAll } from "vitest"
import { MemoryRouter} from "react-router-dom"
import Signup from "../Components/Signup"
import Login from "../Components/Login"
import { AuthProvider } from "../Components/Context/authProvider"
import SignUpForm from "../Components/Forms/SignupForm"
import userEvent from "@testing-library/user-event"
import LoginForm from "../Components/Forms/LoginForm"
import NewGroupForm from "../Components/Forms/NewGroupForm"
import ChatForm from "../Components/Forms/ChatForm"

beforeAll(()=>{
    localStorage.setItem("user", JSON.stringify({
        accessToken : "accessToken",
        refreshToken : "refreshToken"
    }))
})

afterAll(()=> vi.clearAllMocks())

it("tests the sign up Component", async ()=>{
    render(
    <MemoryRouter >
        <Signup />
    </MemoryRouter>
    )

    const element = screen.getByText("ChatApe")
    const image = screen.getByTestId("image")
    expect(element).toBeInTheDocument()
    expect(image).toBeInTheDocument()
    
    
})

it("tests the login page", async ()=>{

    render(
    <AuthProvider>
        <MemoryRouter>
            <Login />
        </MemoryRouter>
    </AuthProvider>
    )

    const logo = screen.getByTestId("login-logo")
    const heading = screen.getByText("Login")
    expect(logo).toBeInTheDocument()
    expect(heading).toBeInTheDocument()
})

it("tests the Sign-up Form Component", async ()=>{
    const user = userEvent.setup()
    render(
        <MemoryRouter>
            <SignUpForm />
        </MemoryRouter>
    )

    const nameInput = screen.getByLabelText("Full Name")
    const emailInput = screen.getByLabelText("Email")
    const passwordInput = screen.getByLabelText("Password")
    const submit = screen.getByDisplayValue("Sign Up")
    const error = screen.queryByText("Could not sign you up, try again!")

    expect(nameInput).toBeInTheDocument()
    expect(emailInput).toBeInTheDocument()

    await user.type(nameInput, "Test Maker Greek")
    await user.type(emailInput, "test@gmail.com")
    await user.type(passwordInput, "Testing.123")
    await user.click(submit)

    expect(error).not.toBeInTheDocument()

})

it("tests the input form component", async ()=>{

    const user = userEvent.setup()

    render(
        <MemoryRouter>
            <AuthProvider>
                <LoginForm />
            </AuthProvider>
        </MemoryRouter>
    )

    const emailInput = screen.getByLabelText("Email")
    const passwordInput = screen.getByLabelText("Password")
    const submit = screen.getByDisplayValue("Log in")
    const error = screen.queryByText("Could not log you in, try again!")
    expect(emailInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()

    await user.type(emailInput, "saad@gmail.com")
    await user.type(passwordInput, "Saad.Masood1122")
    await user.click(submit)

    expect(error).not.toBeInTheDocument()
})

it("tests the login failure", async ()=>{

    const user = userEvent.setup()

    render(
        <MemoryRouter>
            <AuthProvider>
                <LoginForm />
            </AuthProvider>
        </MemoryRouter>
    )

    const emailInput = screen.getByLabelText("Email")
    const passwordInput = screen.getByLabelText("Password")
    const submit = screen.getByDisplayValue("Log in")

    await user.type(passwordInput, "testing")
    await user.type(emailInput, "saad@gmail.com")
    await user.click(submit)
    
    const error = screen.queryByText("Could not log you in, try again!")
    expect(error).toBeDefined()
    expect(error).toBeInTheDocument()
    
})


it("tests the new group form component", async ()=>{
    const user = userEvent.setup()

    render(
        <AuthProvider>
            <MemoryRouter>
                <NewGroupForm />
            </MemoryRouter>
        </AuthProvider>
    )

    const fullName = await screen.findByText("thor")
    expect(fullName).toBeInTheDocument()

    const groupName = screen.getByPlaceholderText("Group Name")
    const memeberButton = await screen.findAllByText("Add")[0]
    const memeberButton1 = await screen.findAllByText("Add")[1]
    const submit = screen.getByText("Submit")
    await user.click(memeberButton)
    await user.click(memeberButton1)
    await user.click(submit)

    const error = screen.queryByText("Group Name must be provided")
    expect(error).toBeInTheDocument()

    await user.type(groupName , "test Group")
    await user.click(submit)

    const formFailure = screen.queryByText("Failed to create a new Group")
    expect(formFailure).not.toBeInTheDocument()
})

it("tests the Chat Form component", async()=>{
    const user = userEvent.setup()

    const handleFileChange = vi.fn()
    const handleSubmit = vi.fn()
    const onChange = vi.fn()
    render(
        <ChatForm 
        handleFileChange={handleFileChange} 
        handleSubmit={handleSubmit}
        onChange={onChange}
        />
    )

    const input = screen.getByPlaceholderText("Type a message")
    const fileInput = screen.getByTestId("file")
    const newFile = new File(["hello"], "hello.jpg", { type : "image/jpg"}) 
    const submit = screen.getByTestId("submit")

    await user.type(input , "test")
    await user.upload(fileInput, newFile)
    await user.click(submit)

    expect(handleFileChange).toHaveBeenCalledOnce()
    expect(handleSubmit).toHaveBeenCalledOnce()
    expect(onChange).toHaveBeenCalledTimes(4)
})