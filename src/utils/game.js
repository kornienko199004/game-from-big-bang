const antagonistTable = {
  rock: ['lizard', 'scissors'],
  paper: ['rock', 'spock'],
  scissors: ['paper', 'lizard'],
  lizard: ['spock'],
  spock: ['rock', 'scissors']
};

const findWinner = (lastMove) => {
  const [user1, user2] = lastMove;

  if (user1.move === user2.move) {
    return null;
  }
  if (antagonistTable[user1.move].includes(user2.move)) {
    return user1.id;
  }
  return user2.id;
};

module.exports = { findWinner };