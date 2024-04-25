import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { removeGroupMember, makeMemberGroupAdmin, removeGroupAdmin, addFriendToGroup } from "../../api/dataService";
import { AssessoryData, FriendData, UserData } from "../../Types/dataTypes";
import { groupManagerFilter } from "../../utils/filterArrayFunction";
import useInterceptor from "./useInterceptors";

interface useGroupManagerProps {
    groupMembers : AssessoryData[]
    userData : UserData
    groupId : string,
    setGlobalError : React.Dispatch<React.SetStateAction<string>>
    handleAreGroupMembersChanged : (value : boolean) => void
    changeUserDataBasedOnGroupChanges : ( id : string, actionType : number ) => void   
    friends : FriendData[]
}
function useGroupManager({ 
    userData,
    groupId,
    groupMembers, 
    setGlobalError,
    handleAreGroupMembersChanged,
    changeUserDataBasedOnGroupChanges,
    friends
 } : useGroupManagerProps) {
    
    const [ searchInput , setSearchInput ] = useState("")
    const axiosPrivate = useInterceptor()
    const [ memberBeingOperatedId , setMemberBeingOperatedId ] = useState("")

    const managedGroup = useMemo(()=> userData.groupChats.find(group => 
        group.collectionId === groupId)
    ,[groupId, userData ])

    const groupAdminsArray = managedGroup ? managedGroup.admins : []

    const friendsOtherThanGroupMembers = useMemo(() => {
        if(!managedGroup) return []
        return friends.filter(friend => !managedGroup.members.includes(friend._id))
    },[ friends, groupMembers, userData]);

    const groupAdmins = useMemo(()=> groupMembers.filter(member => 
        groupAdminsArray.includes(member._id)),
    [groupMembers, groupAdminsArray, userData ])

    const membersOtherThanAdmins = useMemo(()=> 
        groupMembers.filter(member => 
            !groupAdminsArray.includes(member._id)),
    [groupMembers, groupAdmins, userData])

    const noneElementIndex = useMemo(()=> membersOtherThanAdmins.findIndex(member => 
        member.fullName === "None"),
    [membersOtherThanAdmins])

    if(noneElementIndex >= 0) membersOtherThanAdmins.splice(noneElementIndex, 1)

    const infoButtonsArray = [ "Members", "Admins", "Friends" ]
    const isUserAdmin = groupAdminsArray.includes(userData._id)

    const filteredAdminsArray = searchInput !== "" ? 
        groupManagerFilter(groupAdmins, searchInput) : groupAdmins

    const filteredOtherMembersArray = searchInput !== "" ? 
        groupManagerFilter( membersOtherThanAdmins, searchInput) : membersOtherThanAdmins

    const filterdFriendsArray = searchInput !== "" ? 
        groupManagerFilter(friendsOtherThanGroupMembers, searchInput) : friendsOtherThanGroupMembers
    
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

    function handleMakeMemberAdmin(id : string){
        memberBeingOperatedIdIdSetter(id)
        makeMemberAdminMutation({ axiosPrivate, id, collectionId : groupId })

    }
    function handleMemberRemoval(id : string ){
        if (groupMembers.length <= 2) return setGlobalError("A group must have 3 members")
        RemoveMemberFromGroupMutation({ axiosPrivate, id, collectionId : groupId })
        memberBeingOperatedIdIdSetter(id)
    }

    function handleAdminRemoval(id : string ){
        if(groupAdminsArray.length === 1) return setGlobalError("Group must have an Admin")
        memberBeingOperatedIdIdSetter(id)
        removeGroupAdminMutation({axiosPrivate, id, collectionId : groupId})
    }

    function memberBeingOperatedIdIdSetter(id : string){
        setMemberBeingOperatedId(id)
    }

    function onSuccessGroupChanges(id : string, actionType : number){
        
        setMemberBeingOperatedId("")
        changeUserDataBasedOnGroupChanges(id, actionType)
        handleAreGroupMembersChanged(true)
    }

    return {
        memberBeingOperatedId,
        infoButtonsArray,
        isUserAdmin,
        setSearchInput,
        filterdFriendsArray,
        filteredAdminsArray,
        isMemberBeingMadeAdmin,
        isMemberBeingRemoved,
        managedGroup,
        searchInput,
        setMemberBeingOperatedId,   
        isAdminBeingRemoved,
        handleAdminRemoval,
        addFriendToGroupMutation,
        handleMemberRemoval,
        handleMakeMemberAdmin,
        filteredOtherMembersArray,
        isFriendBeingAdded
    }
}

export default useGroupManager


