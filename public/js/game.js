const socket = io();
const link = document.querySelector('#link');
const linkTemplate = document.querySelector('#link-template').innerHTML;
const gameTemplate = document.querySelector('#game-template').innerHTML;
const resultTemplate = document.querySelector('#result-template').innerHTML;

const { room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const WIN_TEXT = 'ПОБЕДА';
const LOSE_TEXT = 'ПОРАЖЕНИЕ';
const DRAW_TEXT = 'НИЧЬЯ';
let globalStream;

let answersFrom = {},
    offer;
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
    if (globalStream) {
        globalStream.getTracks().forEach((track) => {
            track.stop();
          });
    }

    // should show link
    const html = Mustache.render(linkTemplate, {
        link: joinLink.toString(),
    });
    link.innerHTML = html;
});

socket.on('start the game', userInRoom => {
    const html = Mustache.render(gameTemplate);
    link.innerHTML = html;
    const oponentId = userInRoom.filter(item => item.id !== socket.id)[0].id;
    document.querySelector('#oponentId').addEventListener('click', function() {
        createOffer(oponentId);
        this.setAttribute('disabled', 'disabled');
    });
    navigator.getUserMedia(
        { video: true, audio: true },
        function(stream) {
            console.log(stream);
            const video = document.querySelector('video');
            video.srcObject = stream;
            pc.addStream(stream);
            globalStream = stream;
        },
        error
    );

    pc.onaddstream = function(obj) {
        console.log(obj);
        var vid = document.createElement('video');
        vid.setAttribute('class', 'video-small');
        vid.setAttribute('autoplay', 'autoplay');
        vid.setAttribute('id', 'video-small');
        vid.setAttribute('style', 'position:absolute; top:0; width:100px');
        document.getElementById('users-container').appendChild(vid);
        vid.srcObject = obj.stream;
    };

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

socket.on('offer-made', function(data) {
    document.querySelector('#oponentId').setAttribute('disabled', 'disabled');
    offer = data.offer;

    pc.setRemoteDescription(
        new sessionDescription(data.offer),
        function() {
            pc.createAnswer(function(answer) {
                pc.setLocalDescription(
                    new sessionDescription(answer),
                    function() {
                        socket.emit('make-answer', {
                            answer: answer,
                            to: data.socket,
                        });
                    },
                    error
                );
            }, error);
        },
        error
    );
});

socket.on('answer-made', function(data) {
    pc.setRemoteDescription(
        new sessionDescription(data.answer),
        function() {
            if (!answersFrom[data.socket]) {
                createOffer(data.socket);
                answersFrom[data.socket] = true;
            }
        },
        error
    );
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
