import {io} from 'socket.io-client';
import { createContext, useEffect, useState, useContext } from "react";

const SocketContext = createContext(null);

export const useSocket = ()=>{
    const socket = useContext(SocketContext);
    return socket;
}

export const SocketProvider = (props)=>{
    const {children} = props;
    const [socket, setSocket] = useState(null);

    useEffect(()=>{
        const connection = io();
        setSocket(connection);
    }, [])
    

    // In Next.js, both the server-side code (API routes) and the client-side code (React components) are part of the same project and can be tightly coupled. This can sometimes lead to issues where the client-side code expects the server-side socket to be ready and available immediately.

    socket?.on('connect_error', async (err) => {
        console.log("Error establishing socket", err)
        await fetch('/api/socket')
    })

    

    return (<SocketContext.Provider value = {socket}>
        {children}
    </SocketContext.Provider>)

}