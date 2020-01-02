const socket = io();
const link = document.querySelector('#link');
const linkTemplate = document.querySelector('#link-template').innerHTML;

const { room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

socket.emit('join', { room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});

socket.on('return room', (lastRoom) => {
  const joinLink = new URL(location);
  joinLink.searchParams.append('room', lastRoom);

  // should show link

  const html = Mustache.render(linkTemplate, {
    link: joinLink.toString(),
});
link.insertAdjacentHTML('beforeend', html);

});