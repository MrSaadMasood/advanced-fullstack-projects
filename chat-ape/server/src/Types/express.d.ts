declare namespace Express {
    interface Request {
        chatImage : string
        profileImage : string
        groupImage : string
        ReqQuery : {
            collectionId? : string,
            messageId? : string,
            type: ChatType
        }
    }
}
