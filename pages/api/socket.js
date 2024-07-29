import { Server } from 'socket.io';

const SocketHandler = (req, res) => {

    if (res.socket.server.io) {
        console.log('socket is already running')
    }
    else {
        const io = new Server(res.socket.server, {
            cors: {
                origin: 'http://localhost:8080'
            }
        });
        res.socket.server.io = io;

        io.on('connection', (socket) => {
            console.log('Server is connected');

            socket.on('join-room', (roomId, userId) => {
                console.log(`a new user ${userId} joined room ${roomId}`)
                socket.join(roomId);
                socket.broadcast.to(roomId).emit('user-connected', userId);
            });

            socket.on('user-toggle-audio', (userId, roomId) => {
                //no need for socket.join but no duplicates are formed 
                socket.join(roomId);
                socket.broadcast.to(roomId).emit('user-toggle-audio', userId);
            })
            socket.on('user-toggle-video', (userId, roomId) => {
                socket.join(roomId);
                socket.broadcast.to(roomId).emit('user-toggle-video', userId);
            })

            socket.on('user-leave', (userId, roomId) => {

                socket.join(roomId);
                socket.broadcast.to(roomId).emit('user-leave', userId);

            })

        })
    }
    res.end();
}

export default SocketHandler;