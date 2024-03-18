import { describe, test, expect } from '@playwright/test' 

describe("tests the login and signup functionality", ()=>{
    test("tests the signup page", async ({ page })=>{
        // await page.goto("http://localhost:5173/sign-up")

        // await expect(page.getByRole("heading", { name : "ChatApe"})).toBeVisible()

        // await page.getByTestId("fullName").fill("e2e tester")
        // await page.getByTestId("email").fill("tester@playwright.com")
        // await page.getByTestId("password").fill("Tester.1122")

        // await page.getByRole("button", { name : "Sign Up"}).click()

        // const loginPage = page.getByRole("heading", { name : "Login"})
        // await expect(loginPage).toBeVisible()
    })

    test("tests the login page", async ({ page })=>{
        await page.goto("http://localhost:5173/login")

        await expect(page.getByRole("heading", { name : "Login"})).toBeVisible()

        await page.getByTestId("email").fill("saad@gmail.com")
        await page.getByTestId("password").fill("Saad.Masood1122")

        await page.getByRole("button", { name : "Log in"}).click()

        await expect(page.getByText("No Chat Selected")).toBeVisible()
        

    })
})