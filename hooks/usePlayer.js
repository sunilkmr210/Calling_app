import { useState } from 'react'
import { cloneDeep } from 'lodash';
import { useSocket } from '@/context/socket';
import { useRouter } from 'next/router';

const usePlayer = (myId, roomId, peer) => {
    const socket = useSocket();
    const router = useRouter();
    const [players, setPlayers] = useState({});

    //lodash library
    //look into shallow copy and deep copy in javascript
    const playersCopy = cloneDeep(players);

    const playerHighlighted = playersCopy[myId];
    delete playersCopy[myId];

    const nonhighlightedPlayers = playersCopy;

    const leaveRoom = ()=>{
        socket.emit('user-leave', myId, roomId);
        console.log('leaving room', roomId);
        peer?.disconnect();
        router.push('/');
    }


    const toggleAudio = () => {
        console.log('I toggled my audio');
        setPlayers((prev) => {
            const copy = cloneDeep(prev);
            copy[myId].muted = !copy[myId].muted;
            // React's state management relies on shallow comparison. If the top-level reference of the state object doesn't change, React may not detect any changes in deeply nested properties
            // When you do return [...copy], you're creating a new array that has the same elements as copy. This ensures that the top-level reference of the array is different from the previous state, which guarantees that React will notice the change and trigger a re-render
            return {...copy};
        })
        socket.emit('user-toggle-audio', myId, roomId);
    }
    const toggleVideo = () => {
        console.log('I toggled my video');
        setPlayers((prev) => {
            const copy = cloneDeep(prev);
            copy[myId].playing = !copy[myId].playing;

            //... used for destructuring object elements and then created new array
            return {...copy};
        })
        socket.emit('user-toggle-video', myId, roomId);
    }


    return {
        players, setPlayers, playerHighlighted, nonhighlightedPlayers, toggleAudio, toggleVideo, leaveRoom
    }
}

export default usePlayer;