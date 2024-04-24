import {Message } from "../../Types/dataTypes"

// if the image uploaded is larger than the recommended size this div is showm
export default function ErrorBox({ data } : { data : Message}){
    
    const dateObject = new Date(data.time)

    return(
    <li className=" text-white text-base w-[100%] h-auto mb-2 
    flex justify-end items-center">
        <div className="  w-[60%] mr-3 h-auto flex flex-col justify-betweeen items-end">

            <div className=" text-[.5rem] h-4 w-auto flex justify-around items-center">
                <p className="">
                    {dateObject.toDateString()}
                </p>

            </div>

            <p className=" pt-1 pb-1 pl-2 pr-2  bg-orange-900 text-gray-400 h-auto w-auto break-all 
                 right-box flex justify-center items-center" >
                {data.content}
            </p>

        </div>
    </li>
    )
}

