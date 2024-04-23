export default function profilePictureUrlMaker(imageName : string | null) {
    if(!imageName) return 
    return `/user/get-profile-picture/${imageName}` 
}