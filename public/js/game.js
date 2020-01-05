const socket = io();
const link = document.querySelector('#link');
const linkTemplate = document.querySelector('#link-template').innerHTML;
const gameTemplate = document.querySelector('#game-template').innerHTML;
const resultTemplate = document.querySelector('#result-template').innerHTML;

const { room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const WIN_TEXT = 'ПОБЕДА';
const LOSE_TEXT = 'ПОРАЖЕНИЕ';
const DRAW_TEXT = 'НИЧЬЯ';

const playSound = src => {
    sound = new Howl({
        src: [src],
    });
    sound.play();
};

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

socket.on('start the game', (userInRoom) => {
    const html = Mustache.render(gameTemplate);
    link.innerHTML = html;
    console.log(userInRoom);
    // createOffer(oponentId);
    // playSound('sounds/start.mp3');

    document.querySelector('#controls').addEventListener('click', function(e) {
        socket.emit('send move', { move: e.target.id });
        for (child of this.children) {
            if (child.nodeName === 'BUTTON') {
                child.setAttribute('disabled', 'disabled');
            }
        }
    });
});

const gestureTranslate = {
    rock: 'камень',
    scissors: 'ножницы',
    paper: 'бумага',
    lizard: 'ящерица',
    spock: 'спок',
};
const showResults = (lastMove, id, result) => {
    const yourGesture =
        gestureTranslate[lastMove.filter(item => item.id === id)[0].move];
    const oponentGesture =
        gestureTranslate[lastMove.filter(item => item.id !== id)[0].move];

    const html = Mustache.render(resultTemplate, {
        yourGesture,
        oponentGesture,
        result,
    });
    document.querySelector('#result').innerHTML = html;
};

socket.on('return result', ({ winnerId, lastMove }) => {
    for (child of document.querySelector('#controls').children) {
        if (child.nodeName === 'BUTTON') {
            child.removeAttribute('disabled');
        }
    }
    let result;
    let sound;

    if (winnerId === socket.id) {
        result = WIN_TEXT;
        playSound('sounds/win.mp3');
    } else if (winnerId) {
        result = LOSE_TEXT;
        playSound('sounds/lose.mp3');
    }

    if (winnerId === null) {
        result = DRAW_TEXT;
        playSound('sounds/start.mp3');
    }

    showResults(lastMove, socket.id, result);
});

const peerConnection =
    window.RTCPeerConnection ||
    window.mozRTCPeerConnection ||
    window.webkitRTCPeerConnection ||
    window.msRTCPeerConnection;

const sessionDescription =
    window.RTCSessionDescription ||
    window.mozRTCSessionDescription ||
    window.webkitRTCSessionDescription ||
    window.msRTCSessionDescription;

navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

const pc = new peerConnection({
    iceServers: [
        {
            url: 'stun:stun.services.mozilla.com',
            username: 'somename',
            credential: 'somecredentials',
        },
    ],
});

function createOffer(id) {
    pc.createOffer(function(offer) {
        pc.setLocalDescription(
            new sessionDescription(offer),
            function() {
                socket.emit('make-offer', {
                    offer: offer,
                    to: id,
                });
            },
            error
        );
    }, error);
}

function error(err) {
    console.warn('Error', err);
}
