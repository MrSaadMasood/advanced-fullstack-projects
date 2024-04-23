import { Axios, AxiosInstance } from "axios"
import { z } from "zod"
import { assessoryData, friendDataSchema, groupChatSchema, normalChatSchema } from "../zodSchema/schema"

interface UserDataIncomplete {
    bio: string
    email : string
    friends: string[]
    receivedRequests: string[]
    sentRequests: string[]
    normalChats: NormalChats[]
    groupChats: GroupChats[]
}

export interface CommonUserData {
    _id: string
    fullName: string
    type?: "normal"
    profilePicture?: string | null
    collectionId : string
}

interface NormalChats {
    collectionId: string
    friendId: string
}

interface GroupChats {
    admins: string[]
    collectionId: string
    id: string
    members: string[]
    groupName: string
    groupImage: null | string
}

interface UserData extends CommonUserData, UserDataIncomplete {}

export type AssessoryData = z.infer<typeof assessoryData>

type ChatList = z.infer<typeof normalChatSchema>

interface Message {
    id: string
    userId: string
    time: string
    content?: string
    path?: string
    error?: boolean
}

export interface ChatData {
    _id: string
    chat: Message[]
}

export interface GroupChatData {
    chat: Message
    senderName: string
    _id: string
}

export type GeneralGroupList = z.infer<typeof groupChatSchema> & {
    type? : "group"
}

export interface MessageToDelete {
    collectionId: string
    messageId: string
    type: ChatType
}

export type UserSaved = NormalUserAuthSaved | Factor2AuthEnabledUser

interface UserAuthSaved{
    accessToken: string
    refreshToken: string
    isGoogleUser: boolean
    factor2AuthToken? : string
}

export interface NormalUserAuthSaved extends UserAuthSaved {
    is2FactorAuthEnabled: boolean

}
export type Factor2AuthEnabledUser = Omit<UserAuthSaved, "accessToken"> & {
    is2FactorAuthEnabled: true
    factor2AuthToken : string
}

export type ChatType = "normal" | "group"

export interface CommonProp {
    selectedChatSetter: (chat: string) => void
}

export interface ChatProps {
    sendMessageToWS: (sentData: AcceptedDataOptions, content: string, contentId: string, type: ContentOrImagePath) => void
    chatDataSetter: (data: any, type: ChatType, extraDataForGroupChat?: GeneralGroupList) => void
    handleMessageDelete: (messageId: string, type: ChatType, collectionId? : string) => void
}

export type AcceptedDataOptions = CommonUserData | GeneralGroupList

export type ContentOrImagePath = "content" | "path"

export interface SignUpFormdata {
    fullName: string
    email: string
    password: string
}

export type FormDataLogin = Omit<SignUpFormdata, "fullName">

export interface createNewGroupProps extends AxiosCustom {
    groupName: string
    rawImageFile: Blob
    friendsIncluded: string[]
}

interface MessageData {
    collectionId?: string
    groupId?: string
}

export interface sendImageMessageProps extends AxiosCustom {
    endpoint: string
    imageMessageData: MessageData & {
        image: Blob
    }
}

export interface textMessageDataProps extends AxiosCustom {
    endpoint: string
    textMessageData: MessageData & {
        content: string
    }
}

interface AxiosCustom {
    axiosPrivate: AxiosInstance
}

type handleFilterClicked = (value : boolean, type : ChatType ) => void

export type EnableFactor2Auth = Omit<Factor2AuthEnabledUser, "is2FactorAuthEnabled" | "factor2AuthToken"> & Pick<SignUpFormdata , "email">

export interface DeleteProfilePicture extends AxiosCustom {
    profilePicture : string
}
export interface AddNewProfilePicture extends AxiosCustom {
    formData : FormData
}

export interface FilterOptions {
    filterClicked : boolean
    type : ChatType
}

export interface FilterChat extends AxiosCustom {
    chatType : ChatType
    date : Date
    groupMemberId : string
    collectionId : string
}
export interface FetchChatData extends AxiosCustom {
    chatType : ChatType
    chatId : string
    docsSkipCount : number
}

export type GetChatData = (data : AcceptedDataOptions )=>void
export type BoxSide = "right" | "left"
export type OpenGroupManager = (groupId : string)=> void
export type RequestsWithIds = AxiosCustom & Pick<Message, "id"> & { collectionId? : string }
export type RequestWithIdAndCollectionId = RequestsWithIds & Pick<NormalChats, "collectionId">
export type FriendData = z.infer<typeof friendDataSchema> 