import app from './app.js';
import http from 'http';
import { Server } from "socket.io";


// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
export const io = new Server(server, { 
    cors: { 
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
});


// Log socket connections
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on ('connect', () => {
        console.log(`Client ${socket.id} connected`);
    });

    socket.on('joinStation', (stationId) => {
        console.log(`Client ${socket.id} joined station: ${stationId}`);
        socket.join(stationId);
    });

    socket.on('leaveStation', (stationId) => {
        console.log(`Client ${socket.id} left station: ${stationId}`);
        socket.leave(stationId);
    });
});


// Start server
server.listen(process.env.PORT, '0.0.0.0', (error) => {
    if (error) {
        return console.log(`Error starting server: ${error.message}`);
    }
    console.log(`Server is running on port ${process.env.PORT}`);
});
