import React, { useEffect, useRef } from 'react'
import { FaList, FaSearch } from 'react-icons/fa'
import { MdCancel } from 'react-icons/md'

interface SideListsHeaderProps {
    searchInput : string,
    isSearchTriggered : boolean,
    headerText : string,
    setIsSearchTriggered : React.Dispatch<React.SetStateAction<boolean>>,   
    handleSearchInputChange : (value : string) => void,
}

function SideListsHeader({
    handleSearchInputChange,
    setIsSearchTriggered,
    headerText,
    isSearchTriggered,
    searchInput
} : SideListsHeaderProps) {

    const searchInputRef = useRef<HTMLInputElement>(null)
  
    useEffect(()=>{ 
            if (isSearchTriggered && searchInputRef){
                searchInputRef.current?.focus();
            }
    }, [isSearchTriggered])

  return (
    <header className="border-b-2 border-[#555555] h-24 lg:h-20 flex justify-start items-center">
        <div className="flex justify-between items-center h-auto w-[90%] ml-5">
            {!isSearchTriggered &&
                <div className="flex justify-center items-center">
                    <FaList size={18} />
                    <p className="font-bold text-xl ml-3">
                        {headerText}
                    </p>
                </div>
            }
            {isSearchTriggered &&
                <input 
                    className="text=white bg-gray-700 p-1 rounded-lg pl-3 w-[85%]"
                    type="text" 
                    ref={searchInputRef}
                    onChange={(e)=> handleSearchInputChange(e.target.value)}
                    name="search" 
                    id="search" 
                    value={searchInput}
                    />
            }
            
            {!isSearchTriggered && 
                <div>
                    <FaSearch
                        className="cursor-pointer"
                        onClick={() => setIsSearchTriggered(true)}
                    />
                </div>
            }
            {isSearchTriggered && 
                <div>
                    <MdCancel
                        className=" cursor-pointer"
                        onClick={()=> setIsSearchTriggered(false)}
                        size={24}
                    />
                </div>
            }

        </div>

    </header>
  )
}

export default SideListsHeader