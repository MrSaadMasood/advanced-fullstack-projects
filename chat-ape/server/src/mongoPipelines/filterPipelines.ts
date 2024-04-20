// const groupChatFilterationPipeline = <T extends string>(collectionId: T, date : T, groupMemberId :T ) => {
//      return [
//             {
//                 $match: {
//                 _id: collectionId,
//                 },
//             },
//             {
//                 $unwind: "$chat",
//             },
//             {
//                 $lookup: {
//                 from: "users",
//                 localField: "chat.userId",
//                 foreignField: "_id",
//                 as: "friendData",
//                 },
//             },
//             {
//                 $unwind: "$friendData",
//             },
//             {
//                 $project: {
//                 _id: 1,
//                 chat: "$chat",
//                 senderName: "$friendData.fullName",
//                 messageDate: {
//                     $dateToString: {
//                     format: "%m/%d/%Y",
//                     date: "$chat.time",
//                     },
//                 },
//                 },
//             },
//         ] 
//         if(groupMemberId) {
//             const array = [

//             {
//                 $match: {
//                     messageDate: date,
//                     $or : [
//                         // {   messageDate : dateString,
//                         //     "chat.userId" : groupMemberId
//                         // },
//                         // { messageDate : dateString, "chat.useId" : { $exists} }
//                         { "chat.userId" : groupMemberId },
//                         { "chat.userId" : { $exists : groupMemberId ? false : true}}
//                     ]
//                     }
//             },
//             {
//                 $project: {
//                 messageDate: 0,
//                 },
//             },
//             ] 
//             // pipeline.push(array[1])
//         }
// }