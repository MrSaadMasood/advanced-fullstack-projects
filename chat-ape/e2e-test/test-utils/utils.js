import { expect } from '@playwright/test' 
export async function isMessageSent( page, chatName, checkMessage , messageSent){

        await page.getByText(chatName).click()
        const message = page.getByText(checkMessage , { exact : true})
        await message.scrollIntoViewIfNeeded()

        await expect(message).toBeVisible()

        await page.getByPlaceholder("Type a message").fill(messageSent)

        await (page.getByTestId("submit")).click()

        const newMessage = page.getByText(messageSent , { exact : true}).last()
        await newMessage.scrollIntoViewIfNeeded()

        await expect(newMessage).toBeVisible()
}

export async function isMessageReceived(page, chatName, checkMessage){

        await page.getByText(chatName).click()

        const receivedMessage = page.getByText(checkMessage).last()

        await receivedMessage.scrollIntoViewIfNeeded()

        await expect(receivedMessage).toBeVisible()
}