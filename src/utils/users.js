let users = [];

const addUser = ({ id, room }) => {
  const user = { id, room };
  users = [...users, user];
  console.log(users);
  return user;
};

const removeUser = (id) => {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users[index];
  }
};

const getUsersInRoom = (currentRoom) => {
  const normalizedRoomName = currentRoom.trim().toLowerCase();
  return users.filter(({ room }) => room === normalizedRoomName);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};