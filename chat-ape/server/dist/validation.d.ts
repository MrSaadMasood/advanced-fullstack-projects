declare const usersCollectionSchema: {
    validator: {
        $jsonSchema: {
            required: string[];
            properties: {
                fullName: {
                    bsonType: string;
                };
                email: {
                    bsonType: string;
                };
                password: {
                    bsonType: string;
                };
                friends: {
                    bsonType: string;
                    items: {
                        bsonType: string;
                    };
                };
                receivedRequests: {
                    bsonType: string;
                    items: {
                        bsonType: string;
                    };
                };
                sentRequests: {
                    bsonType: string;
                    items: {
                        bsonType: string;
                    };
                };
                normalChats: {
                    bsonType: string;
                    items: {
                        bsonType: string;
                        required: string[];
                        properties: {
                            friendId: {
                                bsonType: string;
                            };
                            collectionId: {
                                bsonType: string;
                            };
                        };
                    };
                };
                groupChats: {
                    bsonType: string;
                    items: {
                        bsonType: string;
                        required: string[];
                        properties: {
                            id: {
                                bsonType: string;
                            };
                            members: {
                                bsonType: string;
                                items: {
                                    bsonType: string;
                                };
                            };
                            admins: {
                                bsonType: string;
                                items: {
                                    bsonType: string;
                                };
                            };
                            collectionId: {
                                bsonType: string;
                            };
                        };
                    };
                };
                profilePicture: {
                    bsonType: string[];
                };
                bio: {
                    bsonType: string;
                };
                isGoogleUser: {
                    bsonType: string;
                };
                is2FactorAuthEnabled: {
                    bsonType: string;
                };
                factor2AuthSecret: {
                    bsonType: string;
                };
            };
        };
    };
    validationAction: string;
};
declare const normalChatsCollectionSchema: {
    validator: {
        $jsonSchema: {
            properties: {
                chat: {
                    bsonType: string;
                    items: {
                        bsonType: string;
                        required: string[];
                        properties: {
                            id: {
                                bsonType: string;
                            };
                            userId: {
                                bsonType: string;
                            };
                            content: {
                                bsonType: string;
                            };
                            path: {
                                bsonType: string;
                            };
                            time: {
                                bsonType: string;
                            };
                        };
                    };
                };
            };
        };
    };
    validationAction: string;
};
declare const groupChatsCollectionSchema: {
    validator: {
        $jsonSchema: {
            properties: {
                chat: {
                    bsonType: string;
                    items: {
                        bsonType: string;
                        required: string[];
                        properties: {
                            id: {
                                bsonType: string;
                            };
                            userId: {
                                bsonType: string;
                            };
                            content: {
                                bsonType: string;
                            };
                            path: {
                                bsonType: string;
                            };
                            time: {
                                bsonType: string;
                            };
                        };
                    };
                };
            };
        };
    };
    validationAction: string;
};
declare const tokensCollectionSchema: {
    validator: {
        $jsonSchema: {
            required: string[];
            properties: {
                token: {
                    bsonType: string;
                };
            };
        };
    };
};
export { usersCollectionSchema, normalChatsCollectionSchema, groupChatsCollectionSchema, tokensCollectionSchema };
