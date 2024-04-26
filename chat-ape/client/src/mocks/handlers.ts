import { http, HttpResponse  } from 'msw' 
import fs from "fs"
import path from "path"
import { chat1, completeChatData, factor2AuthLogin, friendData, friendDataArray, groupChatData, groupMembers } from '../tests/testUtils'

const baseUrl = import.meta.env.VITE_REACT_APP_SITE_URL
const okStatus = { status : 200 }
function urlMaker(path : string){
    return `${baseUrl}/${path}`
}

export const handlers = [
    http.post(urlMaker("auth-user/sign-up"), async ({ request})=>{
        const data = await request.json() as { email  : string}
        const email = data.email
        if(email === "wrong@gmail.com") return HttpResponse.json({}, { status : 400})
        return HttpResponse.json({ message : "successfull"}, okStatus)
    }),
    http.delete(urlMaker("auth-user/disable-factor2Auth/:id"), ()=>{
        return HttpResponse.json({}, okStatus)
    }),
    http.post(urlMaker("auth-user/enable-f2a"), ()=>{
        return HttpResponse.json({ 
            factor2AuthToken: "f2asecret",
            is2FactorAuthEnabled: true
        }, okStatus)
    }),
    http.delete(urlMaker(`user/delete-previous-profile-picture/:name`), ()=>{
        return HttpResponse.json({}, okStatus)
    }),
    http.post(urlMaker("auth-user/login"), async ({ request })=>{
        const received = await request.json() as { password : string }
        const { password } = received
        if(password === "Wrong.123") return HttpResponse.json({}, {status : 400})

        return HttpResponse.json( {...factor2AuthLogin, accessToken : "access"}, okStatus)
    }),
    http.post(urlMaker("auth-user/google"), ()=>{
        return HttpResponse.json( factor2AuthLogin , okStatus)
    }),

    http.get(urlMaker("user/get-friends"), ()=>{
        return HttpResponse.json([
            {   _id : "99",
                fullName : "user friend 1",
                profilePicture : null,
                collectionId : "friendCollection1"
            },
            {   _id : "11",
                fullName : "user friend 2",
                profilePicture : null,
                collectionId : "friendCollection2"
            },
           {   _id : "22",
                fullName : "user friend 3",
                profilePicture : null,
                collectionId : "friendCollection3"
            }   
        ], okStatus)
    }),
    http.delete(urlMaker(`user/remove-group-member`), ()=>{
        return HttpResponse.json({} , okStatus )
    }),

    http.put(urlMaker("user/make-member-admin"), ()=> {
        return HttpResponse.json({}, okStatus)
    }),
    http.delete(urlMaker("user/remove-group-admin"), ()=> {
        return HttpResponse.json({}, okStatus)
    }),
    http.put(urlMaker("user/add-group-member"), ()=>{
        return HttpResponse.json({}, okStatus)
    }),
    http.post(urlMaker("auth-user/refresh"), ()=>{
        return HttpResponse.json({
            newAccessToken : "accessToken"
        }, { status : 200})
    }),

    http.post(urlMaker("user/create-new-group"), ()=>{
        return HttpResponse.json({}, { status : 200})
    }),

    http.post(urlMaker("user/send-request"), ()=>{
        return HttpResponse.json({}, {status : 200})
    }),

    http.get(urlMaker("user/get-chat-image/:image"), ({  })=>{
        const imagePath = path.join(process.cwd(), "public/pattern.jpg")
        const buffer = fs.readFileSync(imagePath)
        
        return HttpResponse.arrayBuffer(buffer, {
            headers : {
                "Content-Type" : "image/jpg"
            },
            status : 200
        })
    }),

    http.delete(urlMaker("user/delete-previous-profile-picture/:image"), ({  })=>{
        return HttpResponse.json({}, { status : 200})
    }),

    http.post(urlMaker("user/add-profile-image"), async ()=>{
        return HttpResponse.json({}, { status : 200})
    }),

    http.post(urlMaker("user/change-bio"), ()=>{
        return HttpResponse.json({}, { status : 200})
    }),
    http.get(urlMaker("user/get-chatlist"), ()=>{
        return HttpResponse.json([
            {
                _id : "randomId",
                lastMessage : chat1,
                friendData : friendData
            }
        ], okStatus)
    }),
    http.get(urlMaker("user/get-friends"), ()=>{
        return HttpResponse.json([friendDataArray], okStatus)
    }), 
    http.get(urlMaker("user/get-users"), ()=> {
        return HttpResponse.json([{ _id : "1000", fullName : "user1", profilePicture : null}], okStatus)
    }),
    http.get(urlMaker("user/follow-requests"), ()=>{
        return HttpResponse.json([{ _id : "1000", fullName : "user1", profilePicture : null}], okStatus)
    }),
    http.get(urlMaker(`user/get-group-chat/:id`), ()=>{
        return HttpResponse.json(groupChatData, okStatus)
    }),
    http.get(urlMaker(`user/group-members/:id`), ()=>{
        return HttpResponse.json(groupMembers, okStatus)
    }),
    http.post(urlMaker("user/filter-chat"), ()=>{
        const chat = { ...chat1, id : "filter1", content : "filtered"}
        return HttpResponse.json({ 
            groupChatData : [{_id : "filterId", senderName : "filterer", chat }]
        }, okStatus)
    }),
    http.get(urlMaker("user/get-chat/:id"), ()=>{
        return HttpResponse.json(completeChatData, okStatus)
    }),
    http.get(urlMaker("socket.io/"), ()=>{
        return HttpResponse.json({}, okStatus)
    }),
    http.put(urlMaker("user/make-member-admin"), ()=>{
        return HttpResponse.json({} , okStatus)
    }),
    http.delete(urlMaker(`user/remove-group-member`), ()=>{
        return HttpResponse.json({}, okStatus)
    }),
    http.delete(urlMaker(`user/add-group-member`), ()=>{
        return HttpResponse.json({}, okStatus)
    }),
    http.post(urlMaker("user/add-chat-image"), ()=>{
        return HttpResponse.json({
            filename : "image-normal.jpg",
            id : "normlImageId"
        }, okStatus)
    }),
    http.post(urlMaker("user/add-group-chat-image"), ()=>{
        return HttpResponse.json({
            filename : "groupImage.jpg",
            id : "four"
        }, { status : 200})
    }),
    http.post(urlMaker("user/chat-data"), ()=>{
        return HttpResponse.json({ id : "addedId"}, okStatus)
    }),
    http.post(urlMaker("user/group-data"), ()=>{
        return HttpResponse.json({ id : "addedId"}, okStatus)
    }),
    http.post(urlMaker("factor2/verify-otp"), async ({ request })=>{ 
        const data = await request.json() as { otp : string }
        const otp = data.otp
        if(otp === "111111") return  HttpResponse.json({}, {status : 400})
        return HttpResponse.json({...factor2AuthLogin, accessToken : "accessToken"}, okStatus)
    }),
    http.get(urlMaker("factor2/generate-otp"), ()=>{
        const imagePath = path.join(process.cwd(), "/public/pattern.jpg") 
        const buffer = fs.readFileSync(imagePath)
        return HttpResponse.arrayBuffer(buffer, {
            headers : {
                "Content-Type" : "image/jpg"
            },
            status : 200
        })
        
    }),
    http.get(urlMaker("user/get-profile-picture/:image"), ()=>{
        const imagePath = path.join(process.cwd(), "public/pattern.jpg")
        const buffer = fs.readFileSync(imagePath)
        
        return HttpResponse.arrayBuffer(buffer, {
            headers : {
                "Content-Type" : "image/jpg"
            },
            status : 200
        })
    }),

    http.get(urlMaker("user/group-picture/:iamge"), ()=>{
        const imagePath = path.join(process.cwd(), "public/pattern.jpg")
        const buffer = fs.readFileSync(imagePath)
        
        return HttpResponse.arrayBuffer(buffer, {
            headers : {
                "Content-Type" : "image/jpg"
            },
            status : 200
        })
    }),

    http.delete(urlMaker("user/remove-friend/:id"), ()=>{
        return HttpResponse.json({}, { status : 200})
    }),

    http.post(urlMaker("user/add-friend"), ()=>{
        return HttpResponse.json({}, okStatus )

    }),

    http.delete(urlMaker("user/remove-follow-request/:id"), ()=>{
        return HttpResponse.json({}, okStatus)
    })
]