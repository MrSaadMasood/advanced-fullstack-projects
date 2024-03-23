import { useEffect, useRef, useState } from "react";
import { FaCamera } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import useInterceptor from "../hooks/useInterceptors";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createNewGroup, getUserFriends } from "../../api/dataService";
import useImageFileHook from "../hooks/useCreateGroup";
import AddRemoveGroupFriends from "../MiscComponents/AddRemoveGroupFriends";

export default function NewGroupForm() {
    const navigate = useNavigate();
    const [groupName, setGroupName] = useState("");
    const [isErrorDivPresent, setIsErrorDivPresent] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const axiosPrivate = useInterceptor();
    const imageRef = useRef<HTMLInputElement>(null);
    const { 
        handleFileInputChange,
        handleAddRemoveButtonClick,
        friendsIncluded,
        rawImageFile,
        imageUrl 
    } = useImageFileHook()

    const { mutate : creatGroupFormMutation } = useMutation({
        mutationFn : createNewGroup,
        onSuccess : ()=> navigate("/", { replace : true}),
        onError : ()=> {setErrorMessage("Failed to create new Group! Try Again"); setIsErrorDivPresent(true)}
    })

    const { data : friendList } = useQuery({
        queryKey : ["friends"],
        queryFn : ()=> getUserFriends(axiosPrivate),
        
    })
    
    // timer to remove the error div
    useEffect(() => {
        if (isErrorDivPresent) {
            const timer = setTimeout(() => {
                 setIsErrorDivPresent(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isErrorDivPresent]);



    const handleCancelClick = () => {
        navigate("/");
    };

    // conditionally checks if the group name is empty or not or if the group has at least 2 members
    // the request is sent and the user is then redirected to the homepage
    const handleSubmitClick = async () => {
        if (groupName === "") {
             setIsErrorDivPresent(true);
            return setErrorMessage("Group Name must be provided");
        }

        if (friendsIncluded.length < 2) {
             setIsErrorDivPresent(true);
            return setErrorMessage("The Group must have at least 2 Members");
        }
        if(!rawImageFile) return

        creatGroupFormMutation({ axiosPrivate, rawImageFile, groupName, friendsIncluded})
    };

    return (
        <div>
            <div className="absolute bg-black flex flex-col justify-center items-center h-screen w-screen">
                <div className=" relative">
                    <div className="relative w-44 h-44 rounded-full overflow-hidden">
                        <img src={imageUrl} alt="" width={"300px"} />
                        <input
                            type="file"
                            id="image"
                            name="image"
                            className="hidden"
                            accept=".jpg"
                            onChange={handleFileInputChange}
                            ref={imageRef}
                        />
                    </div>
                    <button
                        className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 h-12 w-12 flex justify-center items-center 
                        rounded-full"
                        onClick={() => {
                            if(!imageRef.current) return; 
                            imageRef.current.click()
                        }}
                    >
                        <FaCamera size={30} color="black" className=" h-6 sm:h-12" />
                    </button>
                </div>

                <input
                    type="text"
                    className="ml-4 mt-4 p-2 border border-gray-300 rounded-md w-72"
                    placeholder="Group Name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                />
                {isErrorDivPresent &&
                    <div
                        className="flex justify-center items-center mt-3 text-white bg-red-600 w-[40%] h-8 rounded-md "
                    >
                        {errorMessage}
                    </div>
                }
                <div className="ml-4 overflow-y-scroll noScroll text-white mt-4 w-[20rem] sm:w-[29rem] h-[20rem] p-3 border-2 rounded-lg">
                    {friendList && <AddRemoveGroupFriends
                        friendList={friendList}
                        friendsIncluded={friendsIncluded}
                        handleAddRemoveButtonClick={handleAddRemoveButtonClick}
                    />}
                </div>
                <div className="mt-4 flex w-44 justify-between items-center">
                    <button
                        className="bg-red-500 hover:bg-red-600 text-white p-2 w-20 rounded-md"
                        onClick={handleCancelClick}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-gray-500 hover:bg-gray-600 text-white p-2 w-20 rounded-md"
                        onClick={handleSubmitClick}
                        disabled={friendList ? false : true}
                    >
                        Submit
                    </button>
                </div>

            </div>
        </div>
    );
}
