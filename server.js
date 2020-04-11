const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const formatMessage = require('./utils/messages');
const { userJoin, getUser, userLeave, getRoomUsers } = require('./utils/users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = 4200 || process.env.PORT;


// Static assets folder
app.use( express.static(path.join(__dirname, 'public')) );

// Run when client connects
io.on('connection', socket => {
    // console.log('Client connected');

    // Add/Join user
    socket.on('joinRoom', ({username, room}) => {
        let user = userJoin(socket.id, username, room)
        socket.join(user.room)
        
        // Emits to a requesting user
        socket.emit('message', formatMessage('ChatBot','Welcome to the ChatCord'));
        // Broadcast to everybody except user who's connecting
        socket.broadcast.to(user.room).emit(
            'message', 
            formatMessage('ChatBot',`A ${user.username} has joined the chat`)
        );
        // Update room and users list
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    // Listen for messages
    socket.on('chatMessage', msg => {
        const user = getUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })

    // Run when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            // io.emit emits to everyone
            io.to(user.room).emit(
                'message', 
                formatMessage('ChatBot',`${user.username} has left the chat`)
            ) 
        }

        // Update room and users list
        io.to(user.room).emit('roomUsers', {//
            room: user.room,
            users: getRoomUsers(user.room)
        })
    });
        
})

server.listen(PORT, () => console.log(`Server running on port ${PORT}`) );