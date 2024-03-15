
interface UserDataIncomplete  {
    bio : string
    friends : string[]
    receivedRequests : string[]
    sentRequests : string[]
    normalChats : NormalChats[]
    groupChats : GroupChats[]
}

export interface CommonUserData {
    _id : string
    fullName : string
    type? : "normal"
    profilePicture? : string
}


interface NormalChats {
    collectionId : string,
    friendId : string
}

interface GroupChats {
    admins : string[]
    collectionId : string
    id : string,
    members : string[]
    groupName : string
    groupImage : null | string
}

interface UserData extends CommonUserData , UserDataIncomplete {}

export interface AssessoryData {
    _id : string
    fullName : string
    profilePicture? : string
}

export interface ChatList{
    friendData : CommonUserData
    lastMessage : Message
    _id : string
}

interface Message {
    id : string
    userId : string
    time : string
    content? : string
    path?: string
    error? : boolean
}

export interface ChatData {
    _id : string
    chat : Message[]
}

export interface GroupChatData {
    chat : Message
    senderName : string
    _id : string
}

export interface GeneralGroupList {
    lastMessage : Message
    senderName : string
    _id : string
    groupName : string
    groupImage : null | string
    type? : "group"
}


export interface MessageToDelete {
    collectionId : string
    messageId : string
    type : ChatType
}

export interface UserSaved {
    accessToken : string
    refreshToken : string
}

export type ChatType = "normal" | "group"

export interface CommonProp {
    selectedChatSetter : (chat : string)=> void,
}

export interface ChatProps {
    sendMessageToWS : (sentData: AcceptedDataOptions, content: string, contentId: string, type: ContentOrImagePath) => void 
    chatDataSetter : (data: any, type: ChatType,  extraDataForGroupChat?: GeneralGroupList) => void
    handleMessageDelete : (messageId: string, type: ChatType) => void
}

export type AcceptedDataOptions = CommonUserData | GeneralGroupList

export type ContentOrImagePath = "content" | "path"