import { AssessoryData } from "../../Types/dataTypes";
import LazyLoad from 'react-lazy-load' 
import useImageHook from "../hooks/useImageHook";
import profilePictureUrlMaker from "../../utils/profilePictureUrlMaker";
import { memo } from "react";

const UserManagingList = memo(function UserManagingList({ children, member   } : 
    {children : JSX.Element, member : AssessoryData, }) {
    const url = profilePictureUrlMaker(member.profilePicture)
    const image = useImageHook(url)
    return (
    <section className="w-full h-10 sm:h-16 lg:h-12 flex justify-between items-center border-b-2 border-white mt-3">
        <div className=" flex justify-start items-center w-[55%] ">
            <LazyLoad className=" w-8 h-8 sm:w-12 sm:h-12 lg:h-10 lg:w-24 xl:h-10 xl:w-14 flex justify-center items-center
             rounded-full overflow-hidden mr-2 ">
                <img src={image} alt="" />
            </LazyLoad>
            <div className=" h-8 w-24 text-ellipsis whitespace-nowrap
             sm:w-44 lg:w-96 sm:text-lg flex justify-start items-center ml-2 overflow-hidden">
                { member.fullName }
            </div>
        </div>
        <div>
            {children}
        </div> 
    </section>
)})

export default UserManagingList