import "@testing-library/jest-dom"
import { renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import useSendMessages from "../../Components/hooks/useSendMessages"
import { chatDataSetter, generalGroupData, sendMessageToWS, setGlobalError, TestProviderWrappers, userData } from "../testUtils"
import React, {  } from "react"
import { CustomFormEvent } from "../../Types/dataTypes"

describe("tests the useSendMessages hook", ()=>{

    it("should send post request to save th group messages", async ()=>{

        const { result } = renderHook(()=> useSendMessages({
            sendMessageToWS : sendMessageToWS,
            generalGroupData : generalGroupData,
            chatDataSetter,
            chatType : "group",
            userData : userData,
            setGlobalError 
        }) , { wrapper : TestProviderWrappers})

        const event = {
            target : {
                value : "random",
            }
        } as React.ChangeEvent<HTMLInputElement>
        
        const formEvent : CustomFormEvent = {
            preventDefault : ()=> {},
            target : {
               reset : ()=> {}
            }
        } 
        await waitFor(()=> result.current.onChange(event))
        await waitFor(()=> {
            result.current.handleSubmit(formEvent)
            expect(sendMessageToWS).toHaveBeenCalledTimes(1)
        }) 

    })
})
