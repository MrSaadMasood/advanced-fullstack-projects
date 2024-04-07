declare namespace Express {
    interface Request {
        user : tokenUser
        chatImage : boolean
        profileImage : boolean
        groupImage : boolean
        headers : {
            isGoogleUser : boolean
        }
        file : {
            filename : string | undefined
        } 
        query : {
            collectionId? : string,
            messageId? : string,
            type: ChatType
        }
                
    }
}