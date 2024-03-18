import { chromium,  describe,  beforeAll, test, expect, mergeExpects } from '@playwright/test'
import { isMessageReceived, isMessageSent } from '../test-utils/utils';

describe("tests the functionality of the messaging app", ()=>{

    let page;
    let friendPage;
    beforeAll(async ()=>{
        const browser = await chromium.launch()
        const myContext = await browser.newContext()
        const friendContext = await browser.newContext()

        page = await myContext.newPage()
        friendPage = await friendContext.newPage()

        await page.goto("http://localhost:5173/login")
        await friendPage.goto("http://localhost:5173/login")

        await expect(page.getByRole("heading", { name : "Login"})).toBeVisible()
        await expect(friendPage.getByRole("heading", { name : "Login"})).toBeVisible()

        await page.getByTestId("email").fill("saad@gmail.com")
        await page.getByTestId("password").fill("Saad.Masood1122")
        
        await friendPage.getByTestId("email").fill("hamza@gmail.com")
        await friendPage.getByTestId("password").fill("Hamza.Saleem1122")

        await page.getByRole("button", { name : "Log in"}).click()
        await friendPage.getByRole("button", { name : "Log in"}).click()

        await expect(page.getByText("No Chat Selected")).toBeVisible()
        await expect(friendPage.getByText("No Chat Selected")).toBeVisible()
    })

    test("tests the normal chats functionlity", async ()=>{
        
        await isMessageSent(page, "Hamza Saleem", "hello hamz", "this is the e2e test")
        await isMessageReceived(friendPage, "saad", "this is the e2e test")
    })

    test("test the group chat message functionality", async ()=>{
        await page.getByTestId("option4").click()
        await friendPage.getByTestId("option4").click()

        await isMessageSent(page, "rangers", "hello again", "group e2e test")
        await isMessageReceived(friendPage, "rangers", "group e2e test")
    })

    test("test the friends component", async ()=>{

        await page.getByTestId("option2").click()

        expect(page.getByText("Friends")).toBeVisible()

        await page.getByRole("button", { name : "Message"}).last().click()
        
        const message = page.getByText("hello hamz", { exact : true})
        await message.scrollIntoViewIfNeeded()

        await expect(message).toBeVisible()
    })

    test("tesst the follow requests functionality", async ()=>{

        await page.getByTestId("option3").click()

        await expect(page.getByText("Follow Requests")).toBeVisible()
    })

    test("tesst the follow users functionality", async ()=>{

        await page.getByTestId("option5").click()

        await expect(page.getByText("Users")).toBeVisible()

        await expect(page.getByText("Alanis.Douglas")).toBeVisible()

        const followButton = await page.getByRole("button", { name : "Follow"}).first()
        
        await followButton.click()

        await expect(page.getByText("Request Sent", { exact : true}).first()).toBeVisible()

    })

    test("it tests the profile page functionality", async ()=>{

        await page.getByTestId("option6").click()
        
        await expect(page.getByRole("heading", { name : "Bio"})).toBeVisible()

        await page.getByTestId("bioEdit").click()

        await expect(page.getByTestId("submit")).toBeVisible()

        await page.getByPlaceholder("Enter Bio Here").fill("the bio is now edited by e2e test")

        await page.getByTestId("submit").click()

        await expect(page.getByText("the bio is now edited by e2e test")).toBeVisible()

    })

    test("tests the new group creating functionality", async ()=>{

        await page.goto("http://localhost:5173/create-new-group")
        
        const cancelButton = await page.getByRole("button", { name : "Cancel"})

        await expect(cancelButton).toBeVisible()

        const addRemoveButton1 = await  page.getByRole("button", { name : "Add"}).first()
        const addRemoveButton2 = await page.getByRole("button", { name : "Add"}).last()

        
        await addRemoveButton1.click()
        await addRemoveButton2.click()

        await page.getByPlaceholder("Group Name").fill("test group")

        await page.getByRole("button", { exact : true , name : "Submit"}).click()

        await expect(await page.getByText("Remove").first()).toBeVisible()

        await expect(page.getByText("Hamza Saleem")).toBeVisible()
    })

    test("checks the logout functionality", async ()=>{
        await page.getByTestId("option7").click()

        await expect(page.getByRole("heading", { name : "Login"})).toBeVisible()
    })

})
