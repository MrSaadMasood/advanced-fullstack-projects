import { useState } from "react"
import { ChatType, FilterOptions } from "../../Types/dataTypes"

function useSearch() {
 
    const [ searchInput , setSearchInput] = useState("")
    const [ chatSearchInput , setChatSearchInput ] = useState("")
    const [ filterOptions , setFilterOptions ] = useState<FilterOptions>({ filterClicked : false, type : "normal"})

    function handleIsFilterClicked( value : boolean, type : ChatType){
        setFilterOptions({ filterClicked : value, type})
    }

    function handleSearchInputChange(value : string){

        setSearchInput(value.toLowerCase())
    }
    function handleChatSearchInputChange(value : string){

        setChatSearchInput(value.toLowerCase())
    } 
    return {
        searchInput, 
        chatSearchInput,
        filterOptions,
        handleSearchInputChange,
        handleChatSearchInputChange,
        handleIsFilterClicked
    }
}

export default useSearch