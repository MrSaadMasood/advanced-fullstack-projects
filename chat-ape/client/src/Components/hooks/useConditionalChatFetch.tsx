import { useEffect, useRef } from "react";

function useConditionalChatFetch(
    handleIsMoreChatRequested: (value: boolean) => void,
) {
    const chatDiv = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const div = chatDiv.current;
        if (!div) return;

        function handleCompletelyScrolled() {
            if (div?.scrollTop === 0) handleIsMoreChatRequested(true);
        }

        div.addEventListener("scroll", handleCompletelyScrolled);

        return () => div.removeEventListener("scroll", handleCompletelyScrolled);
    }, []);

    useEffect(() => {
        const div = chatDiv.current;

        function scrollToBottom() {
            if (!div) return;
            div.scrollTop = div.scrollHeight;
        }

        scrollToBottom();
    }, []);

    return {
        chatDiv
    };
}

export default useConditionalChatFetch;
