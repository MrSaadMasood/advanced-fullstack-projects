const { ObjectId} = require("mongodb")

const users = [
    {
        _id: new ObjectId('65bb556b3630cc7c7fca24bf'),
        fullName: 'saad',
        email: 'saad@gmail.com',
        password: '$2b$10$SHsGKDrnlp3Ih7H/iUdkLeodEXLC3G2Lsj1VzfFm8yOsB3NDSYHhK',
        friends: [
          new ObjectId('65bbb207c05731ef6b25ad19'),
          new ObjectId('65bcc471e30a163b04040db1'),
        ],
        receivedRequests: [
          new ObjectId("65cdd4eaebdddbc2ddf377c4")
        ],
        sentRequests: [
        ],
        bio: 'this is saad masood this apps creator',
        profilePicture: 'image-1708026988991581479363.jpg',
        normalChats: [
          {
            friendId: new ObjectId('65bcc471e30a163b04040db1'),
            collectionId: new ObjectId('65ce6e271673e9ea756f06ff')
          },
        ],
        groupChats: [
          {
            id: new ObjectId('65ce707f1673e9ea756f0705'),
            members: [
              new ObjectId('65bbb207c05731ef6b25ad19'),
              new ObjectId('65bcc471e30a163b04040db1'),
              new ObjectId('65bb556b3630cc7c7fca24bf')
            ],
            admins: [
              new ObjectId('65bb556b3630cc7c7fca24bf')
            ],
            collectionId: new ObjectId('65ce707d1673e9ea756f0703'),
            groupName: 'rangers',
            groupImage: null
          },
          {
            id: new ObjectId('65ce70ad1673e9ea756f0708'),
            members: [
              new ObjectId('65bbb207c05731ef6b25ad19'),
              new ObjectId('65bcc471e30a163b04040db1'),
              new ObjectId('65bb556b3630cc7c7fca24bf')
            ],
            admins: [
              new ObjectId('65bb556b3630cc7c7fca24bf')
            ],
            collectionId: new ObjectId('65ce70aa1673e9ea756f0706'),
            groupName: 'random',
            groupImage: null
          },
          {
            id: new ObjectId('65ce70d61673e9ea756f070b'),
            members: [
              new ObjectId('65bbb207c05731ef6b25ad19'),
              new ObjectId('65bcc471e30a163b04040db1'),
              new ObjectId('65bb556b3630cc7c7fca24bf')
            ],
            admins: [
              new ObjectId('65bb556b3630cc7c7fca24bf')
            ],
            collectionId: new ObjectId('65ce70d41673e9ea756f0709'),
            groupName: 'another sample',
            groupImage: 'image-1708028116229864709855.jpg'
          }
        ]
      },
      {
        _id: new ObjectId('65bbb207c05731ef6b25ad19'),
        fullName: 'Ammar Masood',
        email: 'ammar@gmail.com',
        password: '$2b$10$SjvuanE7ISv3tXjMWZrGfeaJiNuKsF2aKneVrf2VTFN6cyDmlUVzS',
        friends: [
          new ObjectId('65bb556b3630cc7c7fca24bf')
        ],
        receivedRequests: [
          new ObjectId('65bcc471e30a163b04040db1')
        ],
        sentRequests: [
        ],
        profilePicture: 'image-1707832479957193746767.jpg',
        groupChats: [
          {
            id: new ObjectId('65ce707f1673e9ea756f0705'),
            members: [
              new ObjectId('65bbb207c05731ef6b25ad19'),
              new ObjectId('65bcc471e30a163b04040db1'),
              new ObjectId('65bb556b3630cc7c7fca24bf')
            ],
            admins: [
              new ObjectId('65bb556b3630cc7c7fca24bf')
            ],
            collectionId: new ObjectId('65ce707d1673e9ea756f0703'),
            groupName: 'rangers',
            groupImage: null
          },
          {
            id: new ObjectId('65ce70ad1673e9ea756f0708'),
            members: [
              new ObjectId('65bbb207c05731ef6b25ad19'),
              new ObjectId('65bcc471e30a163b04040db1'),
              new ObjectId('65bb556b3630cc7c7fca24bf')
            ],
            admins: [
              new ObjectId('65bb556b3630cc7c7fca24bf')
            ],
            collectionId: new ObjectId('65ce70aa1673e9ea756f0706'),
            groupName: 'random',
            groupImage: null
          },
          {
            id: new ObjectId('65ce70d61673e9ea756f070b'),
            members: [
              new ObjectId('65bbb207c05731ef6b25ad19'),
              new ObjectId('65bcc471e30a163b04040db1'),
              new ObjectId('65bb556b3630cc7c7fca24bf')
            ],
            admins: [
              new ObjectId('65bb556b3630cc7c7fca24bf')
            ],
            collectionId: new ObjectId('65ce70d41673e9ea756f0709'),
            groupName: 'another sample',
            groupImage: 'image-1708028116229864709855.jpg'
          }
        ]
      },
      {
        _id: new ObjectId('65bcc471e30a163b04040db1'),
        fullName: 'Hamza Saleem',
        email: 'hamza@gmail.com',
        password: '$2b$10$S442GuPMtyyxg2v64iYw2u/j.Ec5RlPPq3MvsEjYvjv1N5GLxhWs.',
        friends: [
          new ObjectId('65bb556b3630cc7c7fca24bf')
        ],
        receivedRequests: [],
        sentRequests: [],
        profilePicture: 'image-1708026974916373413558.jpg',
        normalChats: [
          {
            friendId: new ObjectId('65bb556b3630cc7c7fca24bf'),
            collectionId: new ObjectId('65ce6e271673e9ea756f06ff')
          }
        ],
        groupChats: [
          {
            id: new ObjectId('65ce707f1673e9ea756f0705'),
            members: [
              new ObjectId('65bbb207c05731ef6b25ad19'),
              new ObjectId('65bcc471e30a163b04040db1'),
              new ObjectId('65bb556b3630cc7c7fca24bf')
            ],
            admins: [
              new ObjectId('65bb556b3630cc7c7fca24bf')
            ],
            collectionId: new ObjectId('65ce707d1673e9ea756f0703'),
            groupName: 'rangers',
            groupImage: null
          },
          {
            id: new ObjectId('65ce70ad1673e9ea756f0708'),
            members: [
              new ObjectId('65bbb207c05731ef6b25ad19'),
              new ObjectId('65bcc471e30a163b04040db1'),
              new ObjectId('65bb556b3630cc7c7fca24bf')
            ],
            admins: [
              new ObjectId('65bb556b3630cc7c7fca24bf')
            ],
            collectionId: new ObjectId('65ce70aa1673e9ea756f0706'),
            groupName: 'random',
            groupImage: null
          },
          {
            id: new ObjectId('65ce70d61673e9ea756f070b'),
            members: [
              new ObjectId('65bbb207c05731ef6b25ad19'),
              new ObjectId('65bcc471e30a163b04040db1'),
              new ObjectId('65bb556b3630cc7c7fca24bf')
            ],
            admins: [
              new ObjectId('65bb556b3630cc7c7fca24bf')
            ],
            collectionId: new ObjectId('65ce70d41673e9ea756f0709'),
            groupName: 'another sample',
            groupImage: 'image-1708028116229864709855.jpg'
          }
        ]
      },
      {
        _id: new ObjectId('65cdd4eaebdddbc2ddf377c4'),
        fullName: 'random Dude',
        email: 'random@gmail.com',
        password: '$2b$10$9oPY4aFxsmpjEd0P5Xb4WeBnoIhp5bnmf7ysi9dQBkmOzSIEt9dEi',
        friends: [],
        receivedRequests: [],
        sentRequests: []
      },
    {
        _id : new ObjectId("5e9e1ef80c0b0e001f8e9999"),
        fullName: "testName",
        email: "test@gmail.com",
        password: "$2b$10$ODylWueOKePclLOLIiaiVOBlOlXbyfLTwjMvRyswJ4qWPweSO96WG",
        friends: [],
        receivedRequests: [],
        sentRequests: [],
    }
]

const normalChats = [
        {
          "_id": new ObjectId("65ce6e271673e9ea756f06ff"),
          "chat": [
            {
              "userId": new ObjectId("65bb556b3630cc7c7fca24bf"),
              "time": new Date("2024-02-15T20:03:51.695Z"),
              "content": "hamza this is my first message",
              "id": new ObjectId("65ce6e241673e9ea756f06fe")
            },
            {
              "userId": new ObjectId("65bb556b3630cc7c7fca24bf"),
              "time": new Date("2024-02-15T20:04:45.071Z"),
              "content": "how are you",
              "id": new ObjectId("65ce6e5a1673e9ea756f0700")
            },
            {
              "userId": new ObjectId("65bb556b3630cc7c7fca24bf"),
              "time": new Date("2024-02-15T20:09:09.270Z"),
              "content": "this is me",
              "id": new ObjectId("65ce6f621673e9ea756f0701")
            },
            {
              "userId": new ObjectId("65bb556b3630cc7c7fca24bf"),
              "time": new Date("2024-02-15T20:09:13.204Z"),
              "content": "h",
              "id": new ObjectId("65ce6f661673e9ea756f0702")
            },
            {
              "userId": new ObjectId("65bb556b3630cc7c7fca24bf"),
              "time": new Date("2024-02-16T07:20:11.812Z"),
              "content": "hello this is the first production message",
              "id": new ObjectId("65cf0ca96459c5b93b9de79f")
            },
            {
              "userId": new ObjectId("65bb556b3630cc7c7fca24bf"),
              "time": new Date("2024-02-16T12:09:29.105Z"),
              "content": "Hello hamza",
              "id": new ObjectId("65cf5078207bb6485053c8fe")
            },
            {
              "userId": new ObjectId("65bb556b3630cc7c7fca24bf"),
              "time": new Date("2024-02-16T12:18:09.316Z"),
              "content": "hi",
              "id": new ObjectId("65cf5280207bb6485053c900")
            },
            {
              "userId": new ObjectId("65bb556b3630cc7c7fca24bf"),
              "time": new Date("2024-02-24T13:36:49.769Z"),
              "content": "Hi",
              "id": new ObjectId("65d9f0f1d68defd3599e4129")
            },
            {
              "userId": new ObjectId("65bcc471e30a163b04040db1"),
              "time": new Date("2024-02-27T12:03:50.304Z"),
              "path": "image-1709035426809242559956.jpg",
              "id": new ObjectId("65ddcfa28fdd5b1122130bb8")
            },
            {
              "userId": new ObjectId("65bcc471e30a163b04040db1"),
              "time": new Date("2024-02-28T06:44:34.314Z"),
              "content": "this is slow i think",
              "id": new ObjectId("65ded64ec9d1f0135be9e763")
            }
          ]
        },
        {
          "_id": new ObjectId("65cf535a207bb6485053c904"),
          "chat": [
            {
              "userId": new ObjectId("65cf52dc207bb6485053c901"),
              "time": new Date("2024-02-16T12:21:46.868Z"),
              "content": "Hello",
              "id": new ObjectId("65cf535a207bb6485053c903")
            },
            {
              "userId": new ObjectId("65cf52dc207bb6485053c901"),
              "time": new Date("2024-02-16T12:22:01.983Z"),
              "content": "Ap kay matlooba number sy rabta mumkin nahi ha",
              "id": new ObjectId("65cf5369207bb6485053c905")
            },
            {
              "userId": new ObjectId("65bb556b3630cc7c7fca24bf"),
              "time": new Date("2024-02-16T16:05:27.830Z"),
              "content": "Kr lo ji",
              "id": new ObjectId("65cf87c7d502d2bbd60835af")
            },
            {
              "userId": new ObjectId("65bb556b3630cc7c7fca24bf"),
              "time": new Date("2024-02-19T18:41:56.400Z"),
              "content": "Hi",
              "id": new ObjectId("65d3a0f4a658bae731d09cc8")
            }
          ]
        }
      ]

const groupChats = [
          {
              "_id": new ObjectId("65ce707d1673e9ea756f0703"),
              "chat": [
                  {
                      "id": new ObjectId("65ce707d1673e9ea756f0704"),
                      "userId": new ObjectId("65bb556b3630cc7c7fca24bf"),
                      "time": new Date("2024-02-15T20:13:49.492Z"),
                      "content": "You have been added in the group."
                  },
                  {
                      "content": "hello this is testing again",
                      "id": new ObjectId("65ded63ac9d1f0135be9e761"),
                      "userId": new ObjectId("65bcc471e30a163b04040db1"),
                      "time": new Date("2024-02-28T06:44:10.708Z")
                  },
                  {
                      "content": "hello is this fast",
                      "id": new ObjectId("65ded645c9d1f0135be9e762"),
                      "userId": new ObjectId("65bcc471e30a163b04040db1"),
                      "time": new Date("2024-02-28T06:44:21.513Z")
                  }
              ]
          },
          {
              "_id": new ObjectId("65ce70aa1673e9ea756f0706"),
              "chat": [
                  {
                      "id": new ObjectId("65ce70aa1673e9ea756f0707"),
                      "userId": new ObjectId("65bb556b3630cc7c7fca24bf"),
                      "time": new Date("2024-02-15T20:14:34.980Z"),
                      "content": "You have been added in the group."
                  }
              ]
          }
      ];
      
module.exports = {
    groupChats,
    users,
    normalChats
};
      