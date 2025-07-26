import { createContext } from "react";

// Context for managing socket connections
const SocketContext = createContext({
    socketRef: { current: null },
    isConnected: false
});

export default SocketContext;