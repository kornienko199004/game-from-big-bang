let rooms = [];

const addRoom = room => {
    const newRoom = { room, lastMove: [] };
    rooms = [...rooms, newRoom];
    return newRoom;
};

const getRoomIndex = room => {
    const index = rooms.findIndex(item => item.room == room);
    if (index !== -1) {
        return index;
    }
    throw new Error("Can't find room");
};

const writeLastMove = (user, move) => {
    try {
        const index = getRoomIndex(user.room);

        if (rooms[index].lastMove.length < 2) {
            const room = {
                ...rooms[index],
                lastMove: [...rooms[index].lastMove, { id: user.id, move }],
            };
            rooms = [...rooms.filter((item, i) => i !== index), room];
            return room;
        } else {
            throw new Error('can not write new move');
        }
    } catch (e) {
        return e;
    }
};

const getRooms = () => {
    return rooms;
};

const clearLastMove = room => {
    try {
        const index = getRoomIndex(room);

        const changedRoom = {
            ...rooms[index],
            lastMove: [],
        };
        rooms = [...rooms.filter((item, i) => i !== index), changedRoom];
        return changedRoom;
    } catch (e) {
        return e;
    }
};

module.exports = {
    addRoom,
    writeLastMove,
    getRooms,
    clearLastMove
};
