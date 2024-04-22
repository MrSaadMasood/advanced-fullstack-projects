import { MdCancel } from "react-icons/md"
import { AssessoryData, OpenGroupManager, UserData } from "../../Types/dataTypes"
import UserManagingList from "../ListsComponets/UserManagingList"
import { useEffect, useMemo, useRef, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { addFriendToGroup, fetchingBasedOnOptionSelected, makeMemberGroupAdmin, removeGroupAdmin, removeGroupMember } from "../../api/dataService"
import useInterceptor from "../hooks/useInterceptors"
import { groupManagerFilter } from "../../utils/filterArrayFunction"

interface GroupManagerProps {
    openGroupManager : OpenGroupManager,
    groupMembers : AssessoryData[]
    userData : UserData
    groupId : string,
    setGlobalError : React.Dispatch<React.SetStateAction<string>>
    isUserChangedSetter : (value : boolean)=> void
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
    changeUserDataBasedOnGroupChanges
} : GroupManagerProps) {

    const axiosPrivate = useInterceptor() 
    const [ buttonTypeClicked , setButtonTypeClicked] = useState("Members")
    const [ isSearchButtonClicked, setIsSearchButtonClicked] = useState(false)
    const [ searchInput , setSearchInput ] = useState("")
    const [ memberBeingOperatedId , setMemberBeingOperatedId ] = useState("")
    const chatSearchRef = useRef<HTMLInputElement>(null)

    const managerdGroup = useMemo(()=> userData.groupChats.find(group => group.collectionId === groupId),[groupId, userData ])
    const groupAdminsArray = managerdGroup ? managerdGroup.admins : []

    const { data : friends = [] , error : fetchingFriendsError} = useQuery({
        queryKey : [buttonTypeClicked],
        queryFn : ()=> fetchingBasedOnOptionSelected(axiosPrivate, 2),
        enabled : buttonTypeClicked === "Friends"
    })
    const friendsArray : AssessoryData[] = friends
    const friendsOtherThanGroupMembers =  useMemo(()=> friendsArray.filter((friend, index) => 
        friend._id !== userData._id && friend._id !== groupMembers[index]._id),
        [userData, groupMembers ])
        
console.log('the group members are', groupMembers)
    const groupAdmins = useMemo(()=> groupMembers.filter(member => groupAdminsArray.includes(member._id)),[groupMembers, groupAdminsArray ])
    const membersOtherThanAdmins = useMemo(()=> groupMembers.filter(member => !groupAdminsArray.includes(member._id)),[groupMembers, groupAdmins])
    const noneElementIndex = useMemo(()=>membersOtherThanAdmins.findIndex(member => member.fullName === "None"),[membersOtherThanAdmins])
    if(noneElementIndex >= 0) membersOtherThanAdmins.splice(noneElementIndex, 1)

    const infoButtonsArray = [ "Members", "Admins", "Friends" ]
    const isUserAdmin = groupAdminsArray.includes(userData._id)
    console.log("the user data is", userData)
    const filteredAdminsArray = searchInput !== "" ? groupManagerFilter(groupAdmins, searchInput) : groupAdmins
    const filteredOtherMembersArray = searchInput !== "" ? groupManagerFilter( membersOtherThanAdmins, searchInput) : membersOtherThanAdmins
    const filterdFriendsArray = searchInput !== "" ? groupManagerFilter(friendsOtherThanGroupMembers, searchInput) : friendsOtherThanGroupMembers
    
    const { mutate : RemoveMemberFromGroupMutation , isPending : isMemberBeingRemoved } = useMutation({
        mutationFn : removeGroupMember,
        onSuccess : (data)=> onSuccessGroupChanges(data, 1) 
    })

    const { mutate : makeMemberAdminMutation, isPending : isMemberBeingMadeAdmin } = useMutation({
        mutationFn : makeMemberGroupAdmin,
        onSuccess : (data)=> onSuccessGroupChanges(data, 2) 
    })

    const { mutate : removeGroupAdminMutation , isPending : isAdminBeingRemoved} = useMutation({
        mutationFn : removeGroupAdmin,
        onSuccess : (data)=> onSuccessGroupChanges(data, 3) 
    })

    const { mutate : addFriendToGroupMutation , isPending : isFriendBeingAdded } = useMutation({
        mutationFn : addFriendToGroup,
        onSuccess : (data)=> onSuccessGroupChanges(data, 4) 
    })

    useEffect(()=>{
        if(fetchingFriendsError) setGlobalError("Failed To get Your Friends")
    },[fetchingFriendsError])

    function handleMemberRemoval(id : string ){
        if (groupMembers.length <= 2) return setGlobalError("A group must have 3 members")
        RemoveMemberFromGroupMutation({ axiosPrivate, id, collectionId : groupId })
        setMemberBeingOperatedId(id)
    }

    function handleAdminRemoval(id : string ){
        if(groupAdminsArray.length === 1) return setGlobalError("Group must have an Admin")
        removeGroupAdminMutation({axiosPrivate, id, collectionId : groupId})
    }

    function onSuccessGroupChanges(id : string, actionType : number){
        
        setMemberBeingOperatedId("")
        changeUserDataBasedOnGroupChanges(id, actionType)
        handleAreGroupMembersChanged(true)
    }
  return (
        <div className="relative">
            <div className="absolute top-0 left-0 text-black w-screen h-screen z-20 flex justify-center items-center">
               <div className=" w-[95%] h-[97%] lg:w-[50%] bg-[#303030] text-white flex flex-col justify-center items-center rounded-xl">
                    <div className=" w-[60%] h-[10%] overflow-hidden flex justify-center items-center
                     text-2xl sm:text-4xl font-bold mt-2">
                        Group Name
                    </div>
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
                                console.log("the user is adming but this is still being rendered")
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
                                                    onClick={()=> makeMemberAdminMutation({ axiosPrivate, id : member._id, collectionId : groupId })}
                                                >
                                                        Admin
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
        </div>
  )
}

export default GroupManager