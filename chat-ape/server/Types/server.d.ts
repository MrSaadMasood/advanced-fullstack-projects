type ConnectDataCallback = (value? : Error) => void

interface tokenUser {
    id : string
    email? : string
}

interface DocumentInput {
    _id : string
    chat : Message[],
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
    receivedRequests? : string[],
    friends? : string[]
}

interface Message {
    userId : string,
    time : Date,
    content :string,
    id : string
}
type User = Exclude<keyof DocumentInput, "_id" | "chat"> 

type operationType = "$push" | "$pull"
type operatedArray = "members" | "admins"
type FriendsNRequests = "receivedRequests" | "friends"
type ChatType = "normal" | "group"