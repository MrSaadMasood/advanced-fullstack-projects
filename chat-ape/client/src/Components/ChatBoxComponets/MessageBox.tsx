import { memo } from "react";
import { BoxSide, ChatType, Message } from "../../Types/dataTypes";
import useImageHook from "../hooks/useImageHook";
import LazyLoad from "react-lazy-load";

interface MessageBoxProps {
  data: Message;
  sender?: string;
  chatType: ChatType;
  boxSide: BoxSide;
  deleteMessage: (id: string) => void;
}
const MessageBox = memo(function MessageBox({
  data,
  sender,
  chatType,
  boxSide,
  deleteMessage,
}: MessageBoxProps) {
  const url = data.path
    ? chatType === "normal"
      ? `/user/get-chat-image/${data.path}`
      : `/user/group-picture/${data.path}`
    : undefined;
  const picture = useImageHook(url);
  const dateObject = new Date(data.time);
  const flexStylesBasedOnSide =
    boxSide === "left" ? "justify-start" : "justify-end";
  const secondDivStyle = boxSide === "left" ? "items-start" : "items-end";
  const thirdDivStyle =
    boxSide === "left" ? "justify-between" : "justify-around";
  const margin = boxSide === "left" ? "ml-2" : "mr-2";
  const boxCustomStyle = boxSide === "left" ? "left-box" : "right-box";

  return (
    <li
      data-testid="messageBox"
      className={`text-white text-base w-[100%] h-auto mb-2 flex ${flexStylesBasedOnSide} items-center`}
      onDoubleClick={() => {
        if (boxSide === "right" || chatType === "group") deleteMessage(data.id);
      }}
    >
      <div
        className={`w-[60%] ml-3 h-auto flex flex-col justify-between ${secondDivStyle}`}
      >
        <div
          className={`text-[.5rem] h-4 w-auto flex ${thirdDivStyle} items-center`}
        >
          <p>{dateObject.toDateString()}</p>
          {sender && <p className={margin}>{sender}</p>}
        </div>
        {data.content && (
          <p
            className={`pt-1 pb-1 pl-2 pr-2 bg-orange-600 h-auto w-auto break-all 
                         ${boxCustomStyle} flex justify-center items-center`}
          >
            {data.content}
          </p>
        )}
        {data.path && (
          <LazyLoad>
            <img src={picture} alt="" width={"300px"} />
          </LazyLoad>
        )}
      </div>
    </li>
  );
});

// export default React.memo(MessageBox)
export default MessageBox;
