const socket = io();
const link = document.querySelector('#link');
const linkTemplate = document.querySelector('#link-template').innerHTML;
const gameTemplate = document.querySelector('#game-template').innerHTML;

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

    document.querySelector('#game__form')
      .addEventListener('submit', (e) => {
        e.preventDefault();

        socket.emit('send move', { move: e.target.elements.move.value });
        document.querySelector('#move-button').setAttribute('disabled', 'disabled');
      });
});

socket.on('return result', (id) => {
    document.querySelector('#move-button').removeAttribute('disabled');
    if (id === null) {
        return alert('НИЧЬЯ');
    }

    if (id === socket.id) {
        return alert('~ВЫ ПОБЕДИЛИ~!!!!!!!!!!');
    }
    return alert('~ВЫ ПРОИГРАЛИ(((~');
});


