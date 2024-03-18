// schema for different collections
const usersCollectionSchema = {
        validator : {
            $jsonSchema : {
                required : ["fullName", "email", "password"],
                properties : {
                    fullName : {
                        bsonType : "string"
                    },
                    email : {
                        bsonType : "string"
                    },
                    password : {
                        bsonType : "string"
                    },
                    friends : {
                        bsonType : "array",
                        items : {
                            bsonType : "string"
                        }
                    },
                    receivedRequests : {
                        bsonType : "array",
                        items : {
                            bsonType : "string"
                        }
                    },
                    sentRequests : {
                        bsonType : "array",
                        items : {
                            bsonType : "string"
                        }
                    },
                    normalChats : {
                        bsonType : "array",
                        items : {
                            bsonType : "object",
                            required : ["friendId", "collectionId"],
                            properties : {
                                friendId : {
                                    bsonType : "string"
                                },
                                collectionId : {
                                    bsonType : "string"
                                }
                            }
                        }
                    },
                    groupChats : {
                        bsonType : "array",
                        items : {
                        bsonType : "object",
                        required : ["id","members", "admins", "collectionId" ],
                        properties : {
                            id : {
                                bsonType : "string"
                            },
                            members : {
                                bsonType : "array",
                                items : {
                                    bsonType : "string"
                                }
                            },
                            admins : {
                                bsonType : "array",
                                items : {
                                    bsonType : "string"
                                }
                            },
                            collectionId : {
                                bsonType : "string"
                            }
                        } 

                        }

                    
                    },
                    profilePicture : {
                        bsonType : ["string", "null"]
                    },
                    bio : {
                        bsonType : "string"
                    },
                    isGoogleUser : {
                        bsonType : "bool"
                    },
                    is2FactorAuthEnabled  : {
                        bsonType : "bool"
                    },
                    factor2AuthSecret : {
                        bsonType : "string"
                    }
                }
            }
        },
        validationAction : "error"
    }


const normalChatsCollectionSchema = {
        validator : {
            $jsonSchema : {
                properties : {
                chat : {
                    bsonType : "array",
                    items : {
                        bsonType : "object",
                        required : ["id", "userId", "time"],
                        properties : {
                            id : {
                                bsonType : "string"
                            },
                            userId : {
                                bsonType : "string"
                            },
                            content : {
                                bsonType : "string"
                            },
                            path : {
                                bsonType : "string"
                            },
                            time : {
                                bsonType : "date"
                            }
                        }
                    }
                }
            }
            }
        },
        validationAction : "error"
    }

const groupChatsCollectionSchema = {
        validator : {
            $jsonSchema : {
                properties : {
                chat : {
                    bsonType : "array",
                    items : {
                        bsonType : "object",
                        required : ["id", "userId", "time"],
                        properties : {
                            id : {
                                bsonType : "string"
                            },
                            userId : {
                                bsonType : "string"
                            },
                            content : {
                                bsonType : "string"
                            },
                            path : {
                                bsonType : "string",
                            },
                            time : {
                                bsonType : "date"
                            }
                        }
                    }
                }
            }
            }
        },
        validationAction : "error"
    }

const tokensCollectionSchema = 
    {
        validator : {
            $jsonSchema : {
                required : ["token"],
                properties : {
                    token : {
                        bsonType : "string"
                    }
                }
            }
        }
    }

module.exports = {
    usersCollectionSchema,
    normalChatsCollectionSchema,
    groupChatsCollectionSchema,
    tokensCollectionSchema
}