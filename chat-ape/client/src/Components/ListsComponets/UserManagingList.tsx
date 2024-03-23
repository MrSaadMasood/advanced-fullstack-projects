import { AssessoryData } from "../../Types/dataTypes";
import LazyLoad from 'react-lazy-load' 
import useImageHook from "../hooks/useImageHook";
import profilePictureUrlMaker from "../../utils/profilePictureUrlMaker";
import { memo } from "react";

const UserManagingList = memo(function UserManagingList({ children, member  } : {children : JSX.Element, member : AssessoryData}) {
    const url = profilePictureUrlMaker(member.profilePicture)
    const image = useImageHook(url)
    console.log("the user member is being rendered")
    return (
    <div className="w-full h-10 sm:h-16 flex justify-between items-center border-b-2 border-white mt-3">
        <div className=" flex justify-start items-center w-[55%] ">
            <LazyLoad className=" w-8 h-8 sm:w-12 sm:h-12 rounded-full overflow-hidden mr-2">
                <img src={image} alt="" />
            </LazyLoad>
            <div className=" h-8 w-24 sm:w-44 lg:w-96 sm:text-lg flex justify-start items-center ml-2 overflow-hidden">
                { member.fullName }
            </div>
        </div>
        <div>
            {children}
        </div> 
    </div>
)})

export default UserManagingList