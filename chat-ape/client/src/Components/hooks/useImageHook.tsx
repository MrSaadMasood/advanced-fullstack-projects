import { useEffect, useState } from "react"
import useInterceptor from "./useInterceptors";
import { useQuery } from "@tanstack/react-query";
import { fetchPictureFromServer} from "../../api/dataService";

function useImageHook(url? : string) {

    const defaultImageUrl = "/placeholder.png" 
    const axiosPrivate = useInterceptor()
    const { data : image = defaultImageUrl } = useQuery({
        queryKey : [url],
        queryFn : async ()=> {
            if(!url || url.startsWith("https")) return
            return fetchPictureFromServer(axiosPrivate, url)
        },
        enabled : !!url
    })
    useEffect(()=>{

        if(image !== defaultImageUrl) return ()=> URL.revokeObjectURL(image)

    },[image])
  
    if(!url) return image
    if(url.startsWith("https")) return url
    return image
}

export default useImageHook
