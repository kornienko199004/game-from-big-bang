const socket = io();
const link = document.querySelector('#link');
const linkTemplate = document.querySelector('#link-template').innerHTML;
const gameTemplate = document.querySelector('#game-template').innerHTML;
const resultTemplate = document.querySelector('#result-template').innerHTML;

const { room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

socket.emit('join', { room }, error => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});

socket.on('return room', lastRoom => {
    const joinLink = new URL(location.origin);
    joinLink.searchParams.append('room', lastRoom);

    // should show link
    const html = Mustache.render(linkTemplate, {
        link: joinLink.toString(),
    });
    link.innerHTML = html;
});

socket.on('start the game', () => {
    alert('ИГРА НАЧАЛАСЬ');
    const html = Mustache.render(gameTemplate);
    link.innerHTML = html;

    const sound = new Howl({
        src: ['sounds/start.mp3']
      });
      sound.play();

    document.querySelector('#game__form')
      .addEventListener('submit', (e) => {
        e.preventDefault();

        socket.emit('send move', { move: e.target.elements.move.value });
        document.querySelector('#move-button').setAttribute('disabled', 'disabled');
      });
});

const gestureTranslate = {
    rock: 'камень',
    scissors: 'ножницы',
    paper: 'бумага',
    lizard: 'ящерица',
    spock: 'спок',
}
const showResults = (lastMove, id, result) => {
    const yourGesture = gestureTranslate[lastMove.filter(item => item.id === id)[0].move];
    const oponentGesture = gestureTranslate[lastMove.filter(item => item.id !== id)[0].move];

    const html = Mustache.render(resultTemplate, {
        yourGesture,
        oponentGesture,
        result
    });
    document.querySelector('#result').innerHTML = html;
};

socket.on('return result', ({ winnerId, lastMove }) => {
    document.querySelector('#move-button').removeAttribute('disabled');
    console.log(lastMove);
    let result;
    let sound;

    if (winnerId === socket.id) {
        result = 'ПОБЕДА';
        sound = new Howl({
            src: ['sounds/win.mp3']
          });
          sound.play();
    } else {
        result = 'ПОРАЖЕНИЕ'
        sound = new Howl({
            src: ['sounds/lose.mp3']
          });
          sound.play();
    }

    if (winnerId === null) {
        result = 'НИЧЬЯ';
        sound = new Howl({
            src: ['sounds/draw.mp3']
          });
          sound.play();
    }

    
    showResults(lastMove, socket.id, result);
});


