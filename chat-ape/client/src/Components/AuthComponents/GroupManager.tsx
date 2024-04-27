import { MdCancel } from "react-icons/md"
import { AssessoryData, OpenGroupManager, UserData } from "../../Types/dataTypes"
import UserManagingList from "../ListsComponets/UserManagingList"
import { useRef, useState } from "react"
import useInterceptor from "../hooks/useInterceptors"
import useOptionsSelected from "../hooks/useOptionsSelected"
import useGroupManager from "../hooks/useGroupManager"

interface GroupManagerProps {
    openGroupManager : OpenGroupManager,
    groupMembers : AssessoryData[]
    userData : UserData
    groupId : string,
    setGlobalError : React.Dispatch<React.SetStateAction<string>>
    handleAreGroupMembersChanged : (value : boolean) => void
    changeUserDataBasedOnGroupChanges : ( id : string, actionType : number ) => void
}
function GroupManager({
    openGroupManager,
    groupMembers,
    userData,
    groupId,
    setGlobalError,
    handleAreGroupMembersChanged,
    changeUserDataBasedOnGroupChanges,
} : GroupManagerProps) {

    const axiosPrivate = useInterceptor() 
    const [ buttonTypeClicked , setButtonTypeClicked] = useState("Members")
    const [ isSearchButtonClicked, setIsSearchButtonClicked] = useState(false)
    const { friendsArray : friends } = useOptionsSelected(2)
    const chatSearchRef = useRef<HTMLInputElement>(null)
    const {
        addFriendToGroupMutation,
        filterdFriendsArray,
        filteredOtherMembersArray,
        handleAdminRemoval,
        handleMemberRemoval,
        handleMakeMemberAdmin,
        infoButtonsArray,
        isAdminBeingRemoved,
        isFriendBeingAdded,
        isMemberBeingMadeAdmin,
        isMemberBeingRemoved,
        isUserAdmin,
        memberBeingOperatedId,
        setSearchInput,
        filteredAdminsArray,
        managedGroup,
        searchInput,
        setMemberBeingOperatedId
        
     } = useGroupManager({ 
        userData, 
        groupMembers, 
        setGlobalError, 
        handleAreGroupMembersChanged, 
        changeUserDataBasedOnGroupChanges,
        friends,
        groupId,
    })

  return (
        <section className="relative">
            <div className="absolute top-0 left-0 text-black w-screen h-screen z-20 flex justify-center items-center">
               <div className=" w-[95%] h-[97%] lg:w-[50%] bg-[#303030] text-white flex flex-col justify-center items-center rounded-xl">
                    <h2 className=" w-[60%] h-[10%] overflow-hidden flex justify-center items-center
                     text-2xl sm:text-4xl font-bold mt-2">
                        {managedGroup?.groupName}
                    </h2>
                    <div className=" bg-black w-[90%] lg:w-[85%] h-[80%] mt-5 rounded-xl border-white border-2 overflow-hidden">
                        <div className=" w-full h-20 lg:h-16 bg-gray-600 flex jusctify-between items-center overflow-hidden">
                            {!isSearchButtonClicked && infoButtonsArray.map((button, index) => {
                                if(isUserAdmin){
                                    return ( 
                                        <button 
                                        key={index}
                                        onClick={()=>setButtonTypeClicked(button)} 
                                        className={` ${isUserAdmin ? "w-1/3" : "w-1/2"} border shadow-inner shadow-gray-800 h-full`}>
                                            {button}
                                        </button>
                                    )}
                                if(button === "Friends") return 
                                return (
                                        <button 
                                        key={index}
                                        onClick={()=>setButtonTypeClicked(button)} 
                                        className={` ${isUserAdmin ? "w-1/3" : "w-1/2"} border shadow-inner shadow-gray-800 h-full`}>
                                            {button}
                                        </button>
                                )
                                
                            })}
                            {isSearchButtonClicked &&
                                <div className=" w-full h-full flex justify-center items-center">
                                    <input 
                                        className="text=white bg-gray-950 rounded-lg pl-3 w-[80%] md:w-[85%] lg:w-96 p-2 mr-2"
                                        type="text" 
                                        ref={chatSearchRef}
                                        onChange={(e)=> setSearchInput(e.target.value) }
                                        placeholder="Enter to Search"
                                        name="search" 
                                        id="search" 
                                        value={searchInput}
                                    />
                            <div>
                                <MdCancel
                                    size={24}
                                    className="cursor-pointer"
                                    onClick={()=> setIsSearchButtonClicked(false)}
                                />
                            </div>
                                </div>
                            }
                        </div>
                        <div className="overflow-y-scroll noScroll text-white w-[100%] h-[85%] p-3 lg:p-2">
                            {buttonTypeClicked === "Members" && filteredOtherMembersArray.map((member) =>(
                                <UserManagingList member={member} key={member._id}  >
                                    <div className=" w-[45%] flex justify-between items-center">
                                        {isUserAdmin && (
                                            <>
                                                <button 
                                                    className=" p-1 rounded-md bg-green-500 hover:bg-green-600"
                                                    disabled={isMemberBeingRemoved || isMemberBeingMadeAdmin}
                                                    onClick={()=> handleMakeMemberAdmin(member._id) }
                                                >
                                                        {isMemberBeingMadeAdmin && memberBeingOperatedId === member._id ? "Upgrading" : "Admin"}
                                                </button>   
                                                <button 
                                                    className=" ml-2 p-1 rounded-md bg-red-500 hover:bg-red-600"
                                                    disabled={isMemberBeingRemoved ||  isMemberBeingMadeAdmin}
                                                    onClick={()=> handleMemberRemoval(member._id)}    
                                                >
                                                    {isMemberBeingRemoved && memberBeingOperatedId === member._id ? "Removing" : "Remove"}
                                                </button>
                                            </>
                                        )}
                                        
                                        
                                    </div>   
                                </UserManagingList>
                            ))}
                            {buttonTypeClicked === "Admins" && filteredAdminsArray.map((admin) =>(
                                <UserManagingList member={admin} key={admin._id} >
                                    <div className=" w-[70%] flex justify-center items-center">
                                        {isUserAdmin && (
                                            <button 
                                                onClick={()=> handleAdminRemoval(admin._id)}
                                                disabled={isAdminBeingRemoved}
                                                className=" p-2  text-xs rounded-md bg-red-500 hover:bg-red-600">
                                                    {isAdminBeingRemoved && memberBeingOperatedId === admin._id ? "Removing" : "Remove"}
                                            </button>
                                        )}
                                        
                                    </div>
                                </UserManagingList>
                            ))}
                            {buttonTypeClicked === "Friends" && isUserAdmin && filterdFriendsArray.map((friend) =>(
                                <UserManagingList member={friend} key={friend._id}>
                                    <div className=" w-[42%] flex justify-center items-center">
                                        <button 
                                            onClick={()=> {
                                                addFriendToGroupMutation({ axiosPrivate, id : friend._id, collectionId : groupId})
                                                setMemberBeingOperatedId(friend._id)
                                            }}
                                            disabled={isFriendBeingAdded}
                                            className=" p-2 sm:p-3 font-bold text-xs rounded-md bg-red-500 hover:bg-red-600">
                                                {isFriendBeingAdded && memberBeingOperatedId === friend._id ? "Adding" : "Add"}
                                        </button>
                                    </div>
                                </UserManagingList>
                            )) }
                        </div>
                    </div>
                    <div className=" w-[90%] h-12 mt-2 flex justify-around items-center ">
                        <button 
                            onClick={()=> setIsSearchButtonClicked(true)}
                            className=" bg-yellow-500 hover:bg-yellow-600 p-2 rounded-lg w-1/4">
                                Search
                        </button>
                        <button 
                            onClick={()=> openGroupManager("")}
                            className=" bg-red-500 hover:bg-red-600 p-2 rounded-lg w-1/4">
                                Cancel
                            </button>
                    </div>
                </div> 
            </div>
        </section>
  )
}

export default GroupManager