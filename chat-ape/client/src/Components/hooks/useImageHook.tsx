import { useEffect, useState } from "react"
import useInterceptor from "./useInterceptors";
import { useQuery } from "@tanstack/react-query";
import { fetchPictureFromServer} from "../../api/dataService";

function useImageHook(url? : string) {

    const [image, setImage] = useState("/placeholder.png")
    if(!url) return image
    if(url.startsWith("https")) return url
    const axiosPrivate = useInterceptor()
    const { data } = useQuery({
        queryKey : [url],
        queryFn : async ()=> {
            if(!url) return
            return fetchPictureFromServer(axiosPrivate, url)
        },
        enabled : !!url
    })
    useEffect(()=>{
       
        if(!data) return
        
        setImage(data)
        return ()=> URL.revokeObjectURL(data)

    },[data])
  
    return image
}

export default useImageHook
