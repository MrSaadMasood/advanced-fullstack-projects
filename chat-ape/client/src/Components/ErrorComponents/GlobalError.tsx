
function GlobalError({ message } : { message : string}) {
  return (
        <div className="relative">
            <div className="absolute top-0 left-0 text-black w-screen h-screen z-30 flex justify-center items-center">
                <div className="relative h-screen w-screen flex flex-col justify-start items-center mt-10
                 lg:justify-end lg:items-center lg:mb-28">
                    <div className="bg-red-900 flex justify-center items-center
                    h-10 w-72 sm:w-[28rem] md:w-[38rem] p-2 md:p-3 text-white 
                    shadowit rounded-lg">
                        <p className=" w-full text-center text-xs sm:text-sm flex justify-center items-center">
                            {message}
                        </p>
                    </div>
                </div>
                
            </div>
        </div>
  )
}

export default GlobalError