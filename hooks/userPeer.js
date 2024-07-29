import { useSocket } from "@/context/socket";
import { useRouter } from "next/router";

const { useState, useEffect, useRef } = require("react");

const userPeer = () => {
    const socket = useSocket();
    const roomId = useRouter()?.query.roomId;
    const [peer, setPeer] = useState(null);
    const [myId, setMyId] = useState("");
    const isPeerSet = useRef(false);

    //In react strict mode the below useEffect runs twice so useRef is used
    // https://stackoverflow.com/questions/72238175/why-useeffect-running-twice-and-how-to-handle-it-well-in-react

    useEffect(() => {
        if (isPeerSet.current || !roomId || !socket) return;
        isPeerSet.current = true;
        (async function initPeer() {
            const myPeer = new (await import('peerjs')).default();
            setPeer(myPeer);

            myPeer.on('open', (id) => {
                console.log(`your peer id is ${id}`);
                setMyId(id);
                // console.log(roomId);
                socket?.emit('join-room', roomId, id)
            })
        })() //this pair of bracket is for invoking the function
    }, [])

    return {
        peer,
        myId
    }
}

export default userPeer;