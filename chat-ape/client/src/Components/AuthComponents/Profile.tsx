import { FaCamera } from "react-icons/fa6";
import { MdDone } from "react-icons/md";
import useInterceptor from "../hooks/useInterceptors";
import { FormEvent, useContext, useRef, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { UserData } from "../../Types/dataTypes";
import ReactSwitch from "react-switch";
import { isAuth } from "../Context/authContext";
import { useMutation } from "@tanstack/react-query";
import { addNewProfilePicture, changefactor2AthSettings, deletePreviousProfilePicture, disableFactor2AuthSettings, updateUserBio } from "../../api/dataService";
import useLocalStorage from "../hooks/useLocalStorage";
import { useNavigate } from "react-router-dom";

interface profileProps {
  userData: UserData,
  profilePictureUrl: string,
  isUserChangedSetter: (value: boolean) => void
  setGlobalError: React.Dispatch<React.SetStateAction<string>>
}

export default function Profile({
  userData,
  profilePictureUrl,
  isUserChangedSetter,
  setGlobalError
}: profileProps) {

  const { isAuthenticated, setIsAuthenticated } = useContext(isAuth)
  const isBio = userData.bio || "Hi there, I am using ChatApe";
  const bioInput = useRef<HTMLInputElement>(null)
  const [bio, setBio] = useState(isBio);
  const [profilePicture, setProfilePicture] = useState(profilePictureUrl);
  const [isBioButtonClicked, setIsBioButtonClicked] = useState(false);
  const [submitProfilePictureButton, setSubmitProfilePictureButton] = useState(false);
  const [image, setImage] = useState<Blob>();
  const [text, setText] = useState(bio);
  const axiosPrivate = useInterceptor();
  const pictureRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate()
  const { removeItem, setItem } = useLocalStorage()
  const { mutate: disableFactor2AuthMutation } = useMutation({
    mutationFn: disableFactor2AuthSettings,
    onError: () => {
      is2FactorAuthEnabledSetter(false)
    }
  })

  const { mutate: factor2AuthMutation } = useMutation({
    mutationFn: changefactor2AthSettings,
    onSuccess: (data) => {
      const dataToStore = {
        ...data,
        isGoogleUser: isAuthenticated.isGoogleUser,
        refreshToken: isAuthenticated.refreshToken,
        accessToken: ""
      }
      setItem("f2a", dataToStore)
      removeItem("user")
      navigate("/factor-2-auth")
      isUserChangedSetter(false)
    },
    onError: () => setGlobalError("Failed to change the Auth Mode")
  })

  const { mutate: deleteProfilePictureMutation } = useMutation({
    mutationFn: deletePreviousProfilePicture,
    onError: () => setGlobalError("Previous Profile Picture Deletion Failed")
  })
  const { mutate: addNewPictureMutation } = useMutation({
    mutationFn: addNewProfilePicture,
    onError: () => setGlobalError("Failed to Change the Profile Picture")

  })

  const { mutate: changeBioMutation } = useMutation({
    mutationFn: updateUserBio,
    onSuccess: () => {
      setBio(text);
      setIsBioButtonClicked(false);
    }
  })

  // handles submission of bio to the server
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (text === "") return
    changeBioMutation({ axiosPrivate, text });
    (e.target as HTMLFormElement).reset();
  }

  function getProfilePicture() {
    if (pictureRef.current) pictureRef.current.click();
  }

  // if an image is uploaded it shown a preview and then if confirm saves the image to the server
  // if the user already has a profile picture the previous picture is deletd and is replaced with new picture
  async function handleImageSubmission() {
    if (!image) return setGlobalError("No Image Provided! Try Providing Again!");

    if (userData.profilePicture && userData.profilePicture.startsWith("image")) {
      deleteProfilePictureMutation({ axiosPrivate, profilePicture: userData.profilePicture })
    }
    const formData = new FormData();
    formData.append("image", image);
    addNewPictureMutation({ axiosPrivate, formData })
    setSubmitProfilePictureButton(false);
    isUserChangedSetter(true);
  }

  // handles the uploading of image and image preview
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    const image = e.target.files[0];
    const url = URL.createObjectURL(image);
    setImage(image);
    setProfilePicture(url);
    setSubmitProfilePictureButton(true);
  }

  function toggleButton() {
    if (!isAuthenticated.is2FactorAuthEnabled) {
      factor2AuthMutation({
        email: userData.email,
      })
      return is2FactorAuthEnabledSetter(true)
    }
    disableFactor2AuthMutation(userData._id)
    return is2FactorAuthEnabledSetter(false)
  }

  function is2FactorAuthEnabledSetter(value: boolean) {
    setIsAuthenticated((prevData) => {
      const updatedData = {
        ...prevData,
        is2FactorAuthEnabled: value
      }
      setItem("user", updatedData)
      return updatedData
    })
  }

  return (
    <section className="lg:ml-16 lg:w-full lg:h-screen">
      <header className="w-full bg-black text-white border-b-2 border-[#555555] h-16 flex justify-between items-center p-3">
        <h2>My Profile</h2>
        <div className="w-[40%] sm:w-[30%] md:w-[25%] lg:w-[20%] xl:w-[15%] overflow-hidden
                flex justify-between items-center">
          <div className="h-10 w-10 rounded-full overflow-hidden">
            <img src={profilePicture} alt="" width={"400px"} />
          </div>
          <h2>{userData.fullName}</h2>
        </div>
      </header>
      <section className="h-[95vh] lg:h-[100vh] text-white bg-black flex flex-col justify-center items-center">
        <div className="sm:h-[15rem] relative">
          <div className=" h-44 w-44 sm:h-60 sm:w-60 rounded-full flex justify-center items-center relative overflow-hidden">
            <img src={profilePicture} alt="" width={"1000px"} />
          </div>
          {!submitProfilePictureButton && (
            <button
              data-testid="getPicture"
              className="absolute bottom-0 right-7 sm:right-10 flex justify-center items-center
                                h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-[#646464]"
              onClick={getProfilePicture}
            >
              <FaCamera size={30} color="black" className="h-6 sm:h-12" />
            </button>
          )}

          {submitProfilePictureButton && (
            <button
              data-testid="setImage"
              className="absolute bottom-0 right-7 sm:right-10 flex justify-center items-center
                                h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-gray-400"
              onClick={handleImageSubmission}
            >
              <MdDone size={30} color="black" className="h-6 sm:h-12" />
            </button>
          )}
          <input
            type="file"
            name="profilePicture"
            data-testid="profilePicture"
            id="profilePicture"
            className="hidden"
            onChange={handleImageChange}
            ref={pictureRef}
          />
        </div>

        <div className="flex justify-between items-center h-16 w-24 sm:w-28 mt-3 sm:mt-5">
          <h3 className="text-3xl sm:text-4xl font-bold">Bio</h3>
          <button onClick={() => {
            setIsBioButtonClicked(true);
            // bioInput.current.focus()
          }
          } data-testid="editBio" >
            <FaRegEdit size={30} />
          </button>
        </div>
        <div className="bg-[#777777] relative w-60 sm:w-[25rem] h-auto rounded-lg text-center break-all p-2 sm:p-3 mt-3">
          {!isBioButtonClicked && <p className="md:text-lg">{bio}</p>}
          {isBioButtonClicked && (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col justify-center items-center"
            >
              <input
                type="text"
                name="bio"
                id="bio"
                placeholder="Enter Bio Here"
                value={text}
                ref={bioInput}
                required
                onChange={(e) => setText(e.target.value)}
                className="bg-[#868686] w-[100%] p-1"
              />
              <input
                type="submit"
                data-testid="submit"
                value={"Submit"}
                className="bg-[#303030] text-white p-2 rounded-md mt-3
                                    cursor-pointer hover:bg-[#1b1a1a]"
              />
            </form>
          )}
        </div>
        <div className=" bg-[#777777] w-[80%] h-[6%] rounded-md mt-5 flex justify-between items-center p-4">
          <p className=" text-base font-bold ">
            Enable 2FA
          </p>
          <ReactSwitch
            checked={isAuthenticated.is2FactorAuthEnabled}
            onChange={toggleButton}
            data-testid="toggleButton"
          />
        </div>
      </section>
    </section>
  );
}
