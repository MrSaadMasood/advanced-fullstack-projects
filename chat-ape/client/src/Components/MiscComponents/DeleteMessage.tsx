interface Props {
    deleteMessage : ()=> undefined | void,
    handleMessageDeleteCancellation : ()=>void
}
// div shown the user want to delete his message
export default function DeleteMessage({ deleteMessage, handleMessageDeleteCancellation } : Props) {
    return (
        <section className="relative">
            <div className="absolute top-0 left-0 text-black w-screen h-screen z-20 flex justify-center items-center">
                <div className="bg-[#4b4b4b] h-64 w-72 sm:w-[24rem] md:w-[27rem] p-2 md:p-3 text-white flex flex-col 
                items-center shadowit justify-center rounded-lg">
                    <p className=" w-[90%] text-center sm:text-lg">
                        Are You Sure You Want To Delete This Message
                    </p>
                    <div className=" flex justify-between items-center mt-4 lg:mt-5 w-[70%] sm:w-[55%] md:w-[50%]">
                        <button
                            onClick={deleteMessage}
                            className="bg-red-600 hover:bg-red-700 ease-in duration-100 rounded-md text-white px-4 py-2">
                                Delete
                                </button>
                        <button
                            className="bg-gray-400 hover:bg-gray-500 ease-in duration-100 rounded-md text-white px-4 py-2"
                            onClick={handleMessageDeleteCancellation}
                            >
                                Cancel
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
