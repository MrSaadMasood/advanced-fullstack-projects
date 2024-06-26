import { IoArrowBackCircleOutline } from "react-icons/io5";
import { AcceptedDataOptions, CommonProp, handleFilterClicked, OpenGroupManager } from "../../Types/dataTypes";
import { FaFilter, FaSearch } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { MdCancel } from "react-icons/md";

interface ChatHeaderProps extends CommonProp {
    dataSent : AcceptedDataOptions, 
    friendChatImage : string
    handleChatSearchInputChange : (value : string)=>void
    chatSearchInput : string 
    handleIsFilterClicked : handleFilterClicked 
    openGroupManager : OpenGroupManager
}
export default function ChatHeader({ 
    selectedChatSetter, 
    dataSent, 
    friendChatImage,
    handleChatSearchInputChange,
    chatSearchInput,
    handleIsFilterClicked,
    openGroupManager
}: ChatHeaderProps) {

    const [ isChatSearchClicked , setIsChatSearchClicked ] = useState(false)
    const chatSearchRef = useRef<HTMLInputElement>(null)
    const filterType = dataSent.type === "group" ? "group" : "normal"
    
    useEffect(()=>{ 
            if (isChatSearchClicked && chatSearchRef){
                chatSearchRef.current?.focus();
            }
    }, [isChatSearchClicked, chatSearchRef])

    // this function is used for smaller devices to go back from the chat display to chat list display
    function goBack() {
        selectedChatSetter("");
    }

    return (
        <header className="h-16 sm:h-20 md:h-24 lg:h-20 bg-black border-b-2 border-[#555555] text-white
            flex justify-between items-center">
            <div className="w-auto h-14 ml-4 md:ml-8 lg:ml-3 flex justify-start items-center">
                <button 
                    data-testid="back"
                    onClick={goBack} 
                    className="lg:hidden"
                >
                    <IoArrowBackCircleOutline size={25} />
                </button>
                <button 
                    data-testid="groupManagerButton"
                    onClick={()=>{
                        if(dataSent.type === "group") openGroupManager(dataSent._id)
                    }}
                    className="flex justify-center items-center">
                    <div 
                        className="h-10 md:h-14 w-10 md:w-14 rounded-full ml-6 overflow-hidden">
                        <img src={friendChatImage} alt="" width={"300px"} />
                    </div>
                    {dataSent.type === "group" &&
                    <h2
                        className="ml-3 sm:text-lg md:text-xl">
                        {dataSent.groupName}
                    </h2>
                    } 
                    {dataSent.type === "normal" &&
                    <h2 
                        className="ml-3 sm:text-lg md:text-xl">
                        {dataSent.fullName}
                    </h2>
                    }
                </button>
                
            </div>
                {!isChatSearchClicked &&
                    <div>
                    </div>
                }
                {!isChatSearchClicked && 
                <div className=" mr-4 cursor-pointer flex justify-between items-center w-14 ">
                    <FaSearch 
                        data-testid="searchButton"
                        size={20}
                        onClick={()=> setIsChatSearchClicked(true)}
                    />
                    <FaFilter
                        data-testid="filterButton"
                        size={20}
                        onClick={()=> handleIsFilterClicked(true, filterType )}
                    />
                </div>}
                {isChatSearchClicked &&
                    <div className=" flex justify-center items-center mr-4">
                        
                        <input 
                            className="text=white bg-gray-700 p-1 rounded-lg pl-3 w-[80%] md:w-[85%] mr-2"
                            type="text" 
                            ref={chatSearchRef}
                            onChange={(e)=> handleChatSearchInputChange(e.target.value)}
                            name="search" 
                            data-testid="chatHeaderSearchInput"
                            id="search" 
                            value={chatSearchInput}
                        />
                        <div>
                            <MdCancel
                                data-testid="cancelSearch"
                                size={24}
                                className="cursor-pointer"
                                onClick={()=>{ setIsChatSearchClicked(false); handleChatSearchInputChange("") }}
                            />
                        </div>
                    </div>
                }
        </header>
    );
}

