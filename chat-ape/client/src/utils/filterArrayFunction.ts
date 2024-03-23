import { ChatList, GeneralGroupList, AssessoryData, ChatData, GroupChatData, ChatType } from "../Types/dataTypes"


export default function getFilteredData<T extends ChatList | GeneralGroupList | AssessoryData >
        (dataArray : T[], optionsSelected : number, searchInput : string){
        if(searchInput){
            switch (optionsSelected) {
                case 1:
                    return (dataArray as ChatList[]).filter(chat=> chat.friendData.fullName.toLowerCase().includes(searchInput))
                case 2:
                case 3:
                case 5: 
                    return (dataArray as AssessoryData[]).filter(data=> data.fullName.toLowerCase().includes(searchInput))
                case 4:
                   return (dataArray as GeneralGroupList[]).filter(groupChat => groupChat.groupName.toLowerCase().includes(searchInput))
                default:
                    return dataArray            
            }
        }
        else return dataArray
    }

export function filterChatData<T extends ChatData | GroupChatData>
    (chatData : T | T[], ChatType : ChatType, chatSearchInput : string){
        if(chatSearchInput){
            switch (ChatType) {
                case "normal":
                    const copiedChatData = {...chatData as ChatData}
                    const chatArray = copiedChatData.chat
                    const filteredChatArray = chatArray.filter(chat=> chat.content?.toLowerCase().includes(chatSearchInput))
                    return { _id : copiedChatData._id, chat : [...filteredChatArray]}
                case "group":
                    return (chatData as GroupChatData[]).filter(groupChat => groupChat.chat.content?.toLocaleLowerCase().includes(chatSearchInput))
                default:
                    return chatData;
            }
        }
        else return chatData
    }

export function groupManagerFilter<T extends AssessoryData >(array : T[], searchInput : string ){
    if(array.length === 0) return array
    return array.filter(data => data.fullName.toLowerCase().includes(searchInput.toLowerCase()))
}