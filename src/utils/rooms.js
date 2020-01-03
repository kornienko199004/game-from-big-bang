let rooms = [];

const addRoom = room => {
    const newRoom = { room, lastMove: [] };
    rooms = [...rooms, newRoom];
    console.log(rooms);
    return newRoom;
};

const getRoomIndex = room => {
  const index = rooms.findIndex(item => item.room == room);
  console.log(index);
  console.log(room);
  console.log(rooms);
  if (index !== -1) {
    return index;
  }
  throw new Error('Can\'t find room');
};

const writeLastMove = (user, move) => {
    try {
      const index = getRoomIndex(user.room);

      if (rooms[index].lastMove.length < 2) {
        const room = { ...rooms[index], lastMove: [...rooms[index].lastMove, { id: user.id, move }] };
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

module.exports = {
  addRoom,
  writeLastMove,
  getRooms,
};
