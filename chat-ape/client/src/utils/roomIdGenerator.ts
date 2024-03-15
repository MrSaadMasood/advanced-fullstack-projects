
    // generate a room id so users can connect to this room
export function generateRoomId(userId : string, friendId : string) {
        const sortedArray = [userId, friendId].sort();
        return `room${sortedArray[0]},${sortedArray[1]}`;
    }
