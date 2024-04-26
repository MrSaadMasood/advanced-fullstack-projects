import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ErrorPage from "../../Components/ErrorComponents/ErrorPage"
import GlobalError from "../../Components/ErrorComponents/GlobalError"

vi.mock("react-router-dom", async (importOriginal)=>{
    const original = await importOriginal<typeof import("react-router-dom")>()
    return {
        ...original,
        useRouteError : vi.fn(()=> new Error("mocked error"))
    }
})
describe('testing the Global Error Page', () => { 
    it("should render the Error Page", ()=>{
        render(
            <ErrorPage /> 
        )

        expect(screen.getByRole("heading", { name : "Oops! Something went wrong"})).toBeInTheDocument()
        expect(screen.getByText("mocked error")).toBeInTheDocument()
        expect(screen.getByText("Were sorry, but there seems to be an error.")).toBeInTheDocument()
    })
})

describe("tests the globalError component", ()=>{
    it("should display the message passed ", ()=>{
        render(
            <GlobalError message="global error" />
        )

        expect(screen.getByRole("heading", { name : "global error"})).toBeInTheDocument()
    })
})