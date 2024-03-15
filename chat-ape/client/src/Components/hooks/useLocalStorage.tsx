import { useState } from "react"
import { UserSaved } from "../../Types/dataTypes"

// handles the tokens stored in the local storage
export default function useLocalStorage(){
    const [ value, setValue] = useState<UserSaved>()

    const setItem = (key : string, value : UserSaved)=>{
        localStorage.setItem(key, JSON.stringify(value))
    }

    const getItem = (key : string)=>{
        const item = localStorage.getItem(key)
        if(!item) return
        const value : UserSaved = JSON.parse(item)
        setValue(value)
        return value

    }

    const removeItem = (key : string)=>{
        localStorage.removeItem(key)
    }

    return { value ,setItem, getItem , removeItem}
}