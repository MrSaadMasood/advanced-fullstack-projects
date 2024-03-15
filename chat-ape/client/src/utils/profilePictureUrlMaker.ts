export default function profilePictureUrlMaker(imageName : string | undefined) {
    if(!imageName) return 
    return `/user/get-profile-picture/${imageName}` 
}