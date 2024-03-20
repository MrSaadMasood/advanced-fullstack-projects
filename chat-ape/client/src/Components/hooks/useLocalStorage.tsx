import { UserSaved } from "../../Types/dataTypes"

// handles the tokens stored in the local storage
export default function useLocalStorage(){

    const setItem = (key : string, value : UserSaved)=>{
        localStorage.setItem(key, JSON.stringify(value))
    }

    const getItem = (key : string)=>{
        const item = localStorage.getItem(key)
        if(!item) return
        const value = JSON.parse(item)
        return value

    }

    const removeItem = (key : string)=>{
        localStorage.removeItem(key)
    }

    return { setItem, getItem , removeItem}
}