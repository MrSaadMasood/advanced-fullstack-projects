import { useState } from "react";
import { AssessoryData, ChatType, handleFilterClicked, type FilterOptions } from "../../Types/dataTypes";

interface FilterOptionsProps {
    filterOptions : FilterOptions,
    groupMembers : AssessoryData[]
    handleIsFilterClicked : handleFilterClicked
    getFilteredChat : (date : Date, groupMember : string, chatType : ChatType)=>void
}

function FilterOptions({
    filterOptions,
    groupMembers,
    handleIsFilterClicked,
    getFilteredChat
}: FilterOptionsProps) {

    const [ date , setDate] = useState(new Date())
    const [ filterMember , setFilterMember] = useState("")

    return (
        <section className="relative">
            <div className="absolute top-0 left-0 text-black w-screen h-screen z-20 flex justify-center items-center">
                <form className="bg-[#4b4b4b] h-64 w-72 sm:w-[24rem] md:w-[27rem] p-2 md:p-3 text-white flex flex-col 
                items-center shadowit justify-center rounded-lg"
                onSubmit={(e)=> {e.preventDefault(); getFilteredChat(date, filterMember, filterOptions.type )}}
                >
                    <p className=" w-[90%] text-center sm:text-xl">
                        Filter Chat by Date
                    </p>
                    <input 
                        type="date" 
                        name="chatDate" 
                        id="chatDate" 
                        onChange={(e)=> setDate(new Date(e.target.value))}
                        className=" w-[12rem] bg-[#878787] p-2 cursor-pointer rounded-md mt-2"
                    />
                    {filterOptions.type === "group" &&
                        <div className=" flex flex-col jusctify-center items-center">
                            <p className=" w-full text-center sm:text-lg">
                                Filter By Group Member
                            </p>
                            <select 
                                name="groupMembers" 
                                id="groupMembers" 
                                className="bg-[#878787] p-1 rounded-md w-[10rem] mt-2"
                                onChange={(e)=> setFilterMember(e.target.value)}    
                            >
                                {groupMembers.map(member=>(
                                    <option key={member._id} value={member._id}>{member.fullName}</option>
                                ))}
                            </select>
                        </div>
                    }
                    <div className=" flex justify-between items-center mt-4 lg:mt-5 w-[70%] sm:w-[55%] md:w-[50%]">
                        <button
                            type="submit"
                            className="bg-red-600 w-[5.5rem] hover:bg-red-700 ease-in duration-100 rounded-md text-white px-4 py-2"
                        >
                                Filter
                        </button>
                        <button
                            type="button"
                            className="bg-gray-400 hover:bg-gray-500 ease-in duration-100 rounded-md text-white px-4 py-2"
                            onClick={()=> handleIsFilterClicked(false, "normal")}
                        >
                                Cancel
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );

}

export default FilterOptions