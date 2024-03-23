import { useRef } from "react";
import { IoMdSend } from "react-icons/io";
import { AiFillPicture } from "react-icons/ai";

interface ChatFormProps {
    handleFileChange : (e: React.ChangeEvent<HTMLInputElement>) => void,
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void,
    onChange : (e: React.ChangeEvent<HTMLInputElement>) => void,   
}

export default function ChatForm({
    handleFileChange,
    handleSubmit,
    onChange,
} : ChatFormProps) {
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    function triggerFileInput() {
        if(!fileInputRef.current) return
        fileInputRef.current.click();
    }

    return (
        <form
            className="lg:bg-black h-12 w-full flex justify-center items-center fixed bottom-14 sm:bottom-16 md:bottom-[4.5rem]
            lg:static"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
        >
            <div className="w-10"></div>
            <input
                type="file"
                name="image"
                id="image"
                className="hidden"
                accept=".jpg"
                data-testid="file"
                ref={fileInputRef}
                onChange={handleFileChange}
            />
            <input
                type="text"
                name="content"
                id="content"
                placeholder="Type a message"
                className="p-1 md:p-1 bg-black text-white text-sm h-auto w-full rounded-lg border-2 border-gray-600"
                onChange={onChange}
                required
            />
            <button data-testid="submit" type="submit" className="flex justify-center items-center w-10 ml-1">
                <IoMdSend size={23} color="white" />
            </button>
            <button
                type="button"
                onClick={triggerFileInput}
                className="flex justify-center items-center w-10 mr-1"
            >
                <AiFillPicture size={23} color="white" />
            </button>
        </form>
    );
}
