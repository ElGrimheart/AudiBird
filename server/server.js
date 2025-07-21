import { createServer } from 'http';
import { Server } from "socket.io";
import app from './app.js';
import stationStreamHandler from './sockets/station-stream-handler.js';

const server = createServer(app);
const io = new Server(server, { 
    cors: { 
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
});

stationStreamHandler(io);

server.listen(process.env.PORT, '0.0.0.0', (error) => {
    if (error) {
        return console.log(`Error starting server: ${error.message}`);
    }
    console.log(`Server is running on ${process.env.BACKEND_URL}:${process.env.PORT}`);
});


export { io };