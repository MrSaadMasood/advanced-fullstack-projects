interface ExtraUserProps {
    isGoogleUser : boolean
    receivedRequests : string[],
    friends : string[]
    sentRequests : string[]
    is2FactorAuthEnabled: boolean
}

interface GeneralObjectWithStringProps {
    [ index : string ] : string
}

type CreateNewUser = 
    GeneralObjectWithStringProps & 
    ExtraUserProps
type ConnectDataCallback = (value? : Error) => void

interface JWTTokenPayload {
    id : string
    email? : string
}

interface MongoDocument {
    _id : string
    chat? : Message[],
    normalChats? : {
        friendId : string,
        collectionId : string
    }[],
    groupChats? : {
        id : string
        members : string[]
        admins : string[]
        collectionId : string
        groupName : string
        groupImage : string | null
    }[],
}
type DocumentInput = Partial<Pick<CreateNewUser, "receivedRequests" | "friends">> & MongoDocument 

interface Message {
    userId : string,
    time : Date,
    content :string,
    id : string
}
type AppUser = Exclude<keyof DocumentInput, "_id" | "chat"> 

type OperationType = "$push" | "$pull"
type OperatedArray = "members" | "admins"
type FriendsNRequests = "receivedRequests" | "friends"
type ChatType = "normal" | "group"

type AllUsersData = Pick<DocumentInput, "_id"> & {
    profilePicture : string
    fullName : string
}