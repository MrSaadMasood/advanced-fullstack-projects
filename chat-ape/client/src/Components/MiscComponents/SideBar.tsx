import { MdOutlineChatBubbleOutline } from "react-icons/md";
import { FaUserFriends } from "react-icons/fa";
import { HiOutlineChatAlt2 } from "react-icons/hi";
import { FaRegStar } from "react-icons/fa";
import { IoMdLogOut } from "react-icons/io";
import { RiUserFollowLine } from "react-icons/ri";
import useLocalStorage from "../hooks/useLocalStorage";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { isAuth } from "../Context/authContext";
import { useMutation } from "@tanstack/react-query";
import { logoutUser } from "../../api/dataService";
import { googleLogout } from '@react-oauth/google' 

interface SideBarProps {
  setOptions : (option : number, text : string) => void,
  profilePictureUrl : string ,
  setGlobalError : React.Dispatch<React.SetStateAction<string>>
}

export default function SideBar({ setOptions, profilePictureUrl,  setGlobalError } : SideBarProps) {
    
  const { isAuthenticated, setIsAuthenticated } = useContext(isAuth)
  const { removeItem} = useLocalStorage();
  const navigate = useNavigate();
  
  const { mutate : logOutUserMutation } = useMutation({
    mutationFn : logoutUser,
    onSuccess : ()=>{
      if(isAuthenticated.isGoogleUser) googleLogout()
      removeItem("user");
      setIsAuthenticated({ accessToken : "" , refreshToken : "", isGoogleUser : false, is2FactorAuthEnabled : false})
      navigate("/login", { replace : true });
    },
    onError : ()=>{
      setGlobalError("Failed to Logout!")
    }
  })
  

  return (
    <nav className="bg-black text-white fixed border-y-2 lg:border-y-0 lg:border-r-2 z-10
         border-[#555555] bottom-0 w-full h-12 sm:h-14 md:h-16 lg:top-0
         lg:left-0 lg:h-screen
         lg:w-16"
    >
        <ul className="flex justify-around items-center lg:flex lg:flex-col lg:justify-around lg:items-center lg:h-screen
            lg:w-16 w-full h-12 sm:h-14 md:h-16"
        >
            <li className="w-8 sm:w-9 md:w-10">
              <img src="/logo.png" alt="logo" />
            </li>
            <div className="border-x-2 lg:border-y-2 lg:w-9 lg:h-0 border-gray-600 w-0 h-9"></div>
            <li data-testid="option1" onClick={() => setOptions(1, "Chats")}>
              <MdOutlineChatBubbleOutline size={23} />
            </li>
            <li data-testid="option2" className=".friends" onClick={() => { setOptions(2, "Friends") }}>
            <RiUserFollowLine size={23} />
            </li>
            <li data-testid="option3"onClick={() => { setOptions(3, "Follow Requests") }}>
            <FaUserFriends size={23} />
            </li>
            <li data-testid="option4"onClick={() => { setOptions(4, "Group Chats") }}>
            <HiOutlineChatAlt2 size={23} />
            </li>
            <li data-testid="option5"onClick={() => { setOptions(5, "Users") }}>
            <FaRegStar size={23} />
            </li>
            <li data-testid="option7"onClick={()=> logOutUserMutation({ refreshToken : isAuthenticated.refreshToken })}>
            <IoMdLogOut size={23} />
            </li>
            <li data-testid="option6" onClick={() => setOptions(6, "Profile")} className="h-8 w-8 rounded-full overflow-hidden">
              <img src={profilePictureUrl} alt="" width={"300px"} />
            </li>
        </ul>
    </nav>
  );
}
