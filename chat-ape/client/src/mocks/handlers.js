import { http, HttpResponse } from "msw"
import fs from "fs"
import path from "path"

const baseUrl = import.meta.env.VITE_REACT_APP_SITE_URL

function urlMaker(path){
    return `${baseUrl}/${path}`
}

export const handlers = [
    http.post(urlMaker("auth-user/sign-up"), ()=>{
        return HttpResponse.json({ message : "successfull"}, {status : 200})
    }),

    http.post(urlMaker("auth-user/login"), async ({ request })=>{
        const { password } = await request.json()

        if(password.length < 8) return HttpResponse.json({}, {status : 400})

        return HttpResponse.json({ 
            accessToken : 'accessToken',
            refreshToken : "refreshToken"
        }, {status : 200})
    }),

    http.get(urlMaker("user/get-friends-data"), ({ request })=>{
        return HttpResponse.json({
            friendsData : [
                {
                    fullName : "hercules",
                    _id : 1
                },
                {
                    fullName : "thor",
                    _id : 2
                }
            ]
        }, { status : 200 })
    }),

    http.post(urlMaker("auth-user/refresh"), ()=>{
        return HttpResponse.json({
            newAccessToken : "accessToken"
        }, { status : 200})
    }),

    http.post(urlMaker("user/create-new-group"), async ({ request })=>{
        return HttpResponse.json({}, { status : 200})
    }),

    http.post(urlMaker("user/send-request"), ()=>{
        return HttpResponse.json({}, {status : 200})
    }),

    http.get(urlMaker("user/get-chat-image/:image"), ({ params })=>{
        const imagePath = path.join(process.cwd(), "public/pattern.jpg")
        const buffer = fs.readFileSync(imagePath)
        
        return HttpResponse.arrayBuffer(buffer, {
            headers : {
                "Content-Type" : "image/jpg"
            },
            status : 200
        })
    }),

    http.delete(urlMaker("user/delete-previous-profile-picture/:image"), ({ params })=>{
        return HttpResponse.json({}, { status : 200})
    }),

    http.post(urlMaker("user/add-profile-image"), async ()=>{
        return HttpResponse.json({}, { status : 200})
    }),

    http.post(urlMaker("user/change-bio"), ()=>{
        return HttpResponse.json({}, { status : 200})
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

    http.post(urlMaker("user/add-group-chat-image"), ()=>{
        return HttpResponse.json({
            filename : "groupImage.jpg",
            id : "four"
        }, { status : 200})
    }),

    http.delete(urlMaker("user/remove-friend/:id"), ()=>{
        return HttpResponse.json({}, { status : 200})
    }),

    http.post(urlMaker("user/add-friend"), ()=>{
        return HttpResponse.json({}, { status : 200})
    }),

    http.delete(urlMaker("user/remove-follow-request/:id"), ()=>{
        return HttpResponse.json({}, { status : 200 })
    })
]