import { AssessoryData } from '../../Types/dataTypes'

interface Props {
    friendList : AssessoryData[],
    handleAddRemoveButtonClick : (id : string) =>void,
    friendsIncluded : string[]
}

function AddRemoveGroupFriends({ friendList, handleAddRemoveButtonClick, friendsIncluded }: Props) {
        return friendList.map((friend, index) => (
            <div
                key={index}
                className="flex items-center justify-between mb-2 border-b-2 border-gray-500 p-1"
            >
                <span className=" w-[80%] overflow-hidden">{friend.fullName}</span>
                <button
                    className={`p-2 ${
                        friendsIncluded.includes(friend._id)
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-green-500 hover:bg-green-700"
                        } text-white rounded w-20`}
                    onClick={() => handleAddRemoveButtonClick(friend._id)}
                >
                    {friendsIncluded.includes(friend._id) ? "Remove" : "Add"}
                </button>
            </div>
        ))
}


export default AddRemoveGroupFriends