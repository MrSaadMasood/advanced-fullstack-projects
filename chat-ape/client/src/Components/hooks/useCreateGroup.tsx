import { ChangeEvent, useCallback, useState } from "react";

function useCreateGroup() {

    const [imageUrl , setImageUrl] = useState("/placeholder.png");
    const [rawImageFile , setRawImageFile ] = useState<Blob>();
    const [friendsIncluded, setFriendsIncluded] = useState<string[]>([]);
    // handles the that is upload converts it into the object url and shows the image preview
    const handleFileInputChange = useCallback((e : ChangeEvent<HTMLInputElement>) => {
        if(!e.target.files) return
        const imageFile = e.target.files[0];
        const url = URL.createObjectURL(imageFile);
        setImageUrl(url);
        setRawImageFile(imageFile);
    }, []);

    // for addinf or removing the friends from the included members of th group
    const handleAddRemoveButtonClick = useCallback((friend : string ) => {
        const friendIndex = friendsIncluded.findIndex((f) => f === friend);

        if (friendIndex !== -1) {
            const updatedFriends = [...friendsIncluded];
            updatedFriends.splice(friendIndex, 1);
            setFriendsIncluded(updatedFriends);
        } else {
            setFriendsIncluded([...friendsIncluded, friend]);
        }
    },[friendsIncluded]);

    return {
        handleFileInputChange,
        handleAddRemoveButtonClick,
        friendsIncluded,
        rawImageFile,
        imageUrl
    }
}

export default useCreateGroup