import { AxiosError, AxiosInstance } from "axios";
import server from '../api/axios' 
import { AddNewProfilePicture, AssessoryData, DeleteProfilePicture, FetchChatData, FilterChat, MessageToDelete, RequestsWithIds, RequestWithIdAndCollectionId, UserSaved } from "../Types/dataTypes";
import { FormDataLogin, SignUpFormdata, createNewGroupProps, sendImageMessageProps, textMessageDataProps } from "../Types/dataTypes";
import { assessoryDataArraySchema, f2aEnableSchema, factor2LoginSchema, friendListSchema, groupChatDataArraySchema, groupChatListSchema, imageSaveSchema, loginUserSchema, normalChatDataSchema, normalChatListSchema, normalId } from "../zodSchema/schema";
import { zodString } from "../zodSchema/zodUtils";

export async function getNormalChatList(axiosPrivate : AxiosInstance) {
    try {
        const response = await axiosPrivate.get( "/user/get-chatlist" )
        return normalChatListSchema.parse(response.data) 
    } catch (error) {
        console.log("error occured while getting normal chatlist", error)
        throw new Error("failed to get the normal Chat list") 
    } 
}

export async function getFriendsList(axiosPrivate : AxiosInstance) {
    try {
        const response = await axiosPrivate.get( "/user/get-friends" )
        return friendListSchema.parse(response.data)
    } catch (error) {
        console.log("error occured while getting friendlist", error)
        throw new Error("failed to get the friends list") 
    } 
}

export async function getFollowRequestsList(axiosPrivate : AxiosInstance) {
    try {
        const response = await axiosPrivate.get( "/user/follow-requests" )
        return assessoryDataArraySchema.parse(response.data)
    } catch (error) {
        console.log("error occured while getting follow request", error)
        throw new Error("failed to get the follow requests") 
    } 
}

export async function getUsersList(axiosPrivate : AxiosInstance) {
    try {
        const response = await axiosPrivate.get( "/user/get-users" )
        return assessoryDataArraySchema.parse(response.data)
    } catch (error) {
        console.log("error occured while getting the users list", error)
        throw new Error("failed to get the users list") 
    } 
}

export async function getGroupChatList(axiosPrivate : AxiosInstance) {
    try {
        const response = await axiosPrivate.get( "/user/group-chats" )
        return groupChatListSchema.parse(response.data)
    } catch (error) {
        console.log("some error occured", error)
        throw new Error("failed to get the users list") 
    } 
}

export async function fetchUserData(axiosPrivate : AxiosInstance){
    try {
        const response = await axiosPrivate.get("/user/updated-data")
        return response.data
    } catch (error) {
        console.log("some error occured", error)
        throw new Error("failed tot fetch users")
    }
}

export async function fetchPictureFromServer(axiosPrivate : AxiosInstance, endpoint : string){
    try{
        
        const picture = await axiosPrivate.get(endpoint , { responseType: "blob" });
        return URL.createObjectURL(picture.data);
    }
    catch(error){
        console.log("failed to get the profile picture")
        throw new Error("failed to get the image from the server")
    }
    
}

interface deleteMessageFromChatArgs {
    axiosPrivate : AxiosInstance,
    messageToDeleteInfo : MessageToDelete
}
export async function deleteMessageFromChat({axiosPrivate, messageToDeleteInfo} : deleteMessageFromChatArgs ){
    try {
        await axiosPrivate.delete
            (`/user/delete-message?collectionId=${messageToDeleteInfo.collectionId}&type=${messageToDeleteInfo.type}&messageId=${messageToDeleteInfo.messageId}`);
    } catch (error) {
        console.log("failed to delete the message")
        throw new Error
    }
}

export async function logoutUser({ refreshToken } : { refreshToken : string}){
    try {
        await server.delete(`/auth-user/logout`, {
            data : {
                refreshToken 
            }
        })
    } catch (error) {
        console.log("failed to logout the user")
        throw new Error("failed to log the user out")
    }
}

export async function userSignUp({ formData} : { formData : SignUpFormdata}){
    try {
        await server.post("/auth-user/sign-up", formData )
    } catch (error) {
        console.log("failed to sign-up the user")
        throw new Error("error occured while signing up the user")
    }
}
export async function loginUser({ formData} : { formData : FormDataLogin}){
   try {
        const response = await server.post("/auth-user/login", formData )
        return loginUserSchema.parse(response.data)
   } catch (error) {
        console.log("failed to log the user in")
        throw new Error("failed to login the user")
   } 
}

export async function createNewGroup({ axiosPrivate, groupName, rawImageFile, friendsIncluded } : createNewGroupProps){
    try {
        const formData = new FormData();
        formData.append("image", rawImageFile);
        formData.append("groupName", groupName);
        formData.append("members", JSON.stringify(friendsIncluded));

        await axiosPrivate.post("/user/create-new-group", formData ,{
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    } catch (error) {
        console.log("failed to create the new group")
        throw new Error("failed to create a new Group")        
    }
}

export async function sendImageMessage({ axiosPrivate , endpoint, imageMessageData } : sendImageMessageProps){
    try {
        const response = await axiosPrivate.post(endpoint, imageMessageData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        return imageSaveSchema.parse(response.data)
    } catch (error) {
        console.log("failed to send the image")
        throw new Error("failed to send the image")
    }
}

export async function sendTextMessage({ axiosPrivate , endpoint, textMessageData } : textMessageDataProps){
    try {
        const response = await axiosPrivate.post(endpoint, textMessageData)
        return normalId.parse(response.data)
    } catch (error) {
        console.log("failed to send the message")
        throw new Error("failed to send the message")
    }
}

export async function factor2AuthLogin(formData : { otp : string , refreshToken : string, factor2AuthToken: string }){
    try {
        const response = await server.post("/factor2/verify-otp", formData, {
            headers : {
                Authorization : `Bearer ${formData.factor2AuthToken}`
            }
        } )
        return factor2LoginSchema.parse(response.data)
    } catch (error) {
        console.log("failed to factor 2 authentication")
        throw new Error
    }
}

export async function fetchQRCode(factor2AuthToken: string ){
    try {
        const response = await server.get("/factor2/generate-otp", {
            headers : {
                Authorization : `Bearer ${factor2AuthToken}`
            }
        })
        return zodString.parse(response.data)
    } catch (error) {
        console.log("failed to get the get QR code")
        throw new Error
    }
}

export async function changefactor2AthSettings({ email } : {email : string }){
    try {
        const response = await server.post("/auth-user/enable-f2a", { email })
        return f2aEnableSchema.parse(response.data)
    } catch (error) {
        console.log((error as AxiosError).message);
        throw new Error
         
    }
}

export async function disableFactor2AuthSettings(id : string){
    try {
        const response = await server.delete(`/auth-user/disable-factor2Auth/${id}`)
        return response.data
    } catch (error) {
        console.log((error as AxiosError).message)
        throw new Error
    }
}

export async function deletePreviousProfilePicture({ axiosPrivate, profilePicture }: DeleteProfilePicture) {
    
    try {
        await axiosPrivate.delete(
            `/user/delete-previous-profile-picture/${profilePicture}`
        );
    } catch (error) {
        console.log(
            "Failed to delete the previous profile picture",
            error
        );
        throw new Error
    }
}

export async function addNewProfilePicture({ axiosPrivate, formData }: AddNewProfilePicture) {
    try {
        await axiosPrivate.post(
            "/user/add-profile-image",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
    } catch (error) {
        console.log((error as AxiosError).message)    
        throw new Error
    }
}

export async function updateUserBio({axiosPrivate, text} : { axiosPrivate : AxiosInstance, text : string}) {
    try {   
        await axiosPrivate.post("/user/change-bio", { bio: text });
    } catch (error) {
        console.log((error as AxiosError).message)
        throw new Error
    }
}

export async function filterChat({ axiosPrivate, chatType, date, groupMemberId, collectionId }: FilterChat) {
    try {
        const response = await axiosPrivate.post("/user/filter-chat", { chatType, date, groupMemberId, collectionId })
        return response.data
    } catch (error) {
        console.log((error as AxiosError).message)
        throw new Error
    }
}

export async function getNormalChatData(axiosPrivate : AxiosInstance, chatId : string) {
    try {
        const response = await axiosPrivate.get(`/user/get-chat/${chatId}`)
        return normalChatDataSchema.parse(response.data)
    } catch (error) {
        console.log("failed to get the normal chat data", error) 
        throw new Error("failed to get the normal chat data")
    } 
}

export async function getGroupChatData(axiosPrivate:AxiosInstance, chatId : string) {
    try {
        const response = await axiosPrivate.get(`/user/get-group-chat/${chatId}`)
        return groupChatDataArraySchema.parse(response.data)
    } catch (error) {
        console.log("failed to get the group chat data", error) 
        throw new Error("failed to get the group chat data")
    }
}

export async function fetchGroupMembers({ axiosPrivate, id } : Omit<RequestsWithIds, "collectionId">){
    try {
        
        const response = await axiosPrivate.get(`/user/group-members/${id}`,)
        console.log("fetching the grouop members")
        response.data.push({ _id : "", fullName : "None" })
        return response.data
    } catch (error) {
        console.log((error as AxiosError).message)
        throw new Error
    }
}

export async function addFriendRequest({ axiosPrivate, id }: RequestsWithIds) {
    try {
        await axiosPrivate.post("/user/add-friend", { friendId : id})
    } catch (error) {
        console.log((error as AxiosError).message)
        throw new Error
    }
}
export async function deleteFriendRequest({ axiosPrivate, id }: RequestsWithIds) {
    try {
        await axiosPrivate.delete(`/user/remove-follow-request/${id}`)
    } catch (error) {
        console.log((error as AxiosError).message)
        throw new Error
    }
}
export async function sendFriendRequest({ axiosPrivate, id }: RequestsWithIds) {
    try {
        await axiosPrivate.post("/user/send-request", { receiverId: id });
    } catch (error) {
        console.log((error as AxiosError).message)
        throw new Error
    }
}
export async function removeAFriend({ axiosPrivate, id, collectionId }: RequestsWithIds) {
    try {
        await axiosPrivate.delete(`/user/remove-friend/${id}?collectionId=${collectionId}`)
    } catch (error) {
        console.log((error as AxiosError).message)
        throw new Error
    }
}

export async function removeGroupMember({ axiosPrivate, id, collectionId} : RequestWithIdAndCollectionId ) {
    try {
        await axiosPrivate.delete(`/user/remove-group-member?memberId=${id}&collectionId=${collectionId}`)
        return id
    } catch (error) {
        console.log((error as AxiosError).message)
        throw new Error
    }   
}

export async function  makeMemberGroupAdmin({ axiosPrivate, id, collectionId} : RequestWithIdAndCollectionId) {
    try {
        await axiosPrivate.put(`/user/make-member-admin`, { memberId : id, collectionId})
        return id
    } catch (error) {
        console.log((error as AxiosError).message)
        throw new Error
    }   
}

export async function removeGroupAdmin({ axiosPrivate, id, collectionId} : RequestWithIdAndCollectionId) {
    try {
        await axiosPrivate.delete(`/user/remove-group-admin?memberId=${id}&collectionId=${collectionId}`)
        return id
    } catch (error) {
        console.log((error as AxiosError).message)
        throw new Error
    }   
}

export async function addFriendToGroup({ axiosPrivate, id, collectionId} :RequestWithIdAndCollectionId ) {
    try {
        await axiosPrivate.put(`/user/add-group-member`, { friendId : id , collectionId})
        return id        
    } catch (error) {
        console.log((error as AxiosError).message)
        throw new Error
    }   
}