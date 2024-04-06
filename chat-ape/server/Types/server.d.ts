type ConnectDataCallback = (value? : Error) => void

interface tokenUser {
    id : string
    email? : string
}

interface DocumentInput {
    _id : string
    chat : Message[]
    normalChats : string,
    groupChats : string
}

interface Message {
    userId : string,
    time : Date,
    content :string,
    id : string
}
interface User {
    normalChats : string[],
    groupChats : string[]
}

type operationType = "$push" | "$pull"
type operatedArray = "members" | "admins"