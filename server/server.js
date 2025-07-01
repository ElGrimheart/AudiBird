import app from './app.js';
import { createServer } from 'http';

const server = createServer(app);

server.listen(process.env.PORT, (error) => {
    if (error) {
        return console.log(`Error starting server: ${error.message}`);
    }
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});