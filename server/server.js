import { createServer } from 'http';
import { Server } from "socket.io";
import app from './app.js';

const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

server.listen(process.env.PORT, (error) => {
    if (error) {
        return console.log(`Error starting server: ${error.message}`);
    }
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});


export { io };