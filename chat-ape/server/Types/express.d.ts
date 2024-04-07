declare namespace Express {
    interface Request {
        user : tokenUser
        chatImage : boolean
        profileImage : boolean
        groupImage : boolean
        incomingMessage : {
            isGoogleUser : boolean
        }
        ReqQuery : {
            collectionId? : string,
            messageId? : string,
            type: ChatType
        }
                
    }
}