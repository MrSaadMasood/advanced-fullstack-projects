import { beforeAll, vi, afterAll, afterEach } from "vitest"
import { cleanup } from "@testing-library/react"
import { server } from "../mocks/browser"


window.IntersectionObserver = vi.fn().mockImplementation(()=>
        ({ observe : ()=> null, unobserve : ()=> null }))

beforeAll(() => server.listen())
afterAll(() => server.close())
afterEach(()=> { server.resetHandlers(), cleanup()})
