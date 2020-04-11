const socket = io();

const chatForm = document.querySelector('#chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.querySelector('#room-name');
const usersList = document.querySelector('#users');
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

console.log('Socket.io: ',socket)

// Join chatroom
socket.emit('joinRoom', { username, room });

// Update room users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room)
    outputUsersList(users)
})

// Message output
socket.on('message', message => {
    console.log(message)
    outputMessage(message)
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

// Message submited
chatForm.addEventListener('submit', e => {
    e.preventDefault();
    let msg = e.target.elements.msg.value;
    socket.emit('chatMessage', msg);
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
})

function outputMessage(msg) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `
        <p class="meta">${msg.username} <span>${msg.time}</span></p>
        <p class="text">
            ${msg.text}
        </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

function outputRoomName(room) {
    roomName.innerHTML = room;
}

function outputUsersList(users) {
    usersList.innerHTML = `
        ${ users.map( user => `<li>${user.username}</li>` ).join('') }
    `
}