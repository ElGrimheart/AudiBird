export default function stationStreamHandler(io) {
    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        socket.on('mic-audio-chunk', (chunk) => {
            socket.broadcast.emit('mic-audio-chunk', chunk);
        });

        socket.on('disconnect', () => {
            console.log("Socket disconnected:", socket.id);
        });
    });
}