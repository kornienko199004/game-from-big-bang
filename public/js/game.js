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
    const joinLink = new URL(location);
    joinLink.searchParams.append('room', lastRoom);

    // should show link

    const html = Mustache.render(linkTemplate, {
        link: joinLink.toString(),
    });
    link.insertAdjacentHTML('beforeend', html);
});

socket.on('start the game', () => {
    alert('start the game');
    console.log('start the game');
    const html = Mustache.render(gameTemplate);
    link.innerHTML = html;

    document.querySelector('#game__form')
      .addEventListener('submit', (e) => {
        e.preventDefault();
        console.log(e.target.elements.move.value);

        socket.emit('send move', { move: e.target.elements.move.value });
      });
});

socket.on('get result', (res) => {
    console.log(res);
});


