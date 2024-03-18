import React from 'react'
import { FaList, FaSearch } from 'react-icons/fa'
import { MdCancel } from 'react-icons/md'

interface SideListsHeaderProps {
    isSearchTriggered : boolean,
    headerText : string,
    setIsSearchTriggered : React.Dispatch<React.SetStateAction<boolean>>,   
}
function SideListsHeader({
    isSearchTriggered,
    headerText,
    setIsSearchTriggered,
} : SideListsHeaderProps ) {
  return (
    <div className="border-b-2 border-[#555555] h-24 lg:h-20 flex justify-start items-center">
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
                    name="search" 
                    id="search" />
            }
            
            {!isSearchTriggered && 
                <div>
                    <FaSearch
                        className=" cursor-pointer"
                        onClick={()=> setIsSearchTriggered(true)}
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

    </div>
  )
}

export default SideListsHeader