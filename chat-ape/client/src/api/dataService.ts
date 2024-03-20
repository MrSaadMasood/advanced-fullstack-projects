import { AxiosError, AxiosInstance } from "axios";
import server from '../api/axios' 
import { requestHandler } from "./requestHandler";
import { AddNewProfilePicture, AssessoryData, DeleteProfilePicture, EnableFactor2Auth, MessageToDelete, UserSaved } from "../Types/dataTypes";
import { FormDataLogin, SignUpFormdata, createNewGroupProps, sendImageMessageProps, textMessageDataProps } from "../Types/dataTypes";

export async function fetchingBasedOnOptionSelected(axiosPrivate : AxiosInstance, optionsSelected : number){
        // to get the normal chat list of the user with friends containing the friend name and last message
        if (optionsSelected === 1) {
            const result = await requestHandler(axiosPrivate, "/user/get-chatlist" )
            if(result.code === 400) throw new Error(result.error.message)
            return result.data as any
        }

        // to get all the friends of the user
        if (optionsSelected === 2) {
            const result = await requestHandler(axiosPrivate, "/user/get-friends" )
            if(result.code === 400) throw new Error(result.error.message)
            return result.data as any           
        }

        // // to get the follow request sent to the user
        if (optionsSelected === 3) {
            const result = await requestHandler(axiosPrivate, "/user/follow-requests" )
            if(result.code === 400) throw new Error(result.error.message)
            return result.data as any
        }

        // // to get group chats with last message and group name
        if (optionsSelected === 4) {
            const result = await requestHandler(axiosPrivate, "/user/group-chats" )
            if(result.code === 400) throw new Error(result.error.message)
            return result.data as any
        }

        // // to get all the users of the app
        if (optionsSelected === 5) {
            const result = await requestHandler(axiosPrivate, "/user/get-users" )
            if(result.code === 400) throw new Error(result.error.message)
            return result.data as any
        }

}


export async function fetchUserData(axiosPrivate : AxiosInstance){

    const result = await requestHandler(axiosPrivate, "/user/updated-data")
    if(result.code === 400) throw new Error(result.error.message)
    return result.data as any
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
        await axiosPrivate.delete(`/user/delete-message?data=${JSON.stringify(messageToDeleteInfo)}`);
    } catch (error) {
        console.log("failed to delete the message")
    }
}

export async function logoutUser({ token } : { token : string}){
    try {
        await server.delete(`/auth-user/logout`, {
            data : {
                token
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
        return response.data as UserSaved 
   } catch (error) {
        console.log("failed to log the user in")
        throw new Error("failed to login the user")
   } 
}

export async function getUserFriends(axiosPrivate : AxiosInstance){
    try {
        const response = await axiosPrivate.get(`/user/get-friends-data`);
        return response.data as AssessoryData[]
    } catch (error) {
        console.log("failed to get the friends data")
        throw new Error("failed to get the friends data")
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
        return response.data
    } catch (error) {
        console.log("failed to send the image")
        throw new Error("failed to send the image")
    }
}

export async function sendTextMessage({ axiosPrivate , endpoint, textMessageData } : textMessageDataProps){
    try {
        const response = await axiosPrivate.post(endpoint, textMessageData)
        return response.data
    } catch (error) {
        console.log("failed to send the message")
        throw new Error("failed to send the message")
    }
}

export async function factor2AuthLogin(formData : { otp : string , refreshToken : string, factor2AuthToken: string }){
    try {
        console.log("the intermediary token is", formData.factor2AuthToken)
        const response = await server.post("/factor2/verify-otp", formData, {
            headers : {
                Authorization : `Bearer ${formData.factor2AuthToken}`
            }
        } )
        return response.data
    } catch (error) {
        console.log("failed to factor 2 authentication")
        throw new Error
    }
}

export async function fetchQRCode(factor2AuthToken: string ){
    try {
        console.log('fetching the qr code now')
        const response = await server.get("/factor2/generate-otp", {
            headers : {
                Authorization : `Bearer ${factor2AuthToken}`
            }
        })
        return response.data
    } catch (error) {
        console.log("failed to get the get QR code")
        throw new Error
    }
}

export async function changefactor2AthSettings({ email , isGoogleUser, refreshToken }: EnableFactor2Auth ){
    try {
        const response = await server.post("/auth-user/enable-f2a", { email, isGoogleUser, refreshToken })
        return response.data
    } catch (error) {
        console.log((error as AxiosError).message);
         
    }
}

export async function disableFactor2AuthSettings(id : string){
    try {
        const response = await server.delete(`/auth-user/disable-factor2Auth/${id}`)
        return response.data
    } catch (error) {
        console.log((error as AxiosError).message)
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
    }
}

export async function updateUserBio({axiosPrivate, text} : { axiosPrivate : AxiosInstance, text : string}) {
    try {   
        await axiosPrivate.post("/user/change-bio", { bio: text });
    } catch (error) {
        console.log((error as AxiosError).message)
    }
}