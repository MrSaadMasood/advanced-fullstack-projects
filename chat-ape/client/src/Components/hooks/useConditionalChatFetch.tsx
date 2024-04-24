import { useEffect, useRef } from "react";
import { ChatData, GroupChatData } from "../../Types/dataTypes";

function useConditionalChatFetch(
  chatData : ChatData | GroupChatData[],
) {
    const chatDiv = useRef<HTMLUListElement>(null);

    useEffect(() => {
        const div = chatDiv.current;

        function scrollToBottom() {
            if (!div) return;
            div.scrollTop = div.scrollHeight;
        }

        scrollToBottom();
    }, [chatDiv, chatData]);

    return {
        chatDiv
    };
}

export default useConditionalChatFetch;
