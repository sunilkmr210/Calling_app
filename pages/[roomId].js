import { useSocket } from "@/context/socket"
import useMediaStream from "@/hooks/useMediaStream";
import userPeer from "@/hooks/userPeer"
import Player from "@/components/Player";
import { useEffect, useState } from "react";
import usePlayer from "@/hooks/usePlayer";
import styles from "@/styles/room.module.css";
import { useRouter } from "next/router";
import Bottom from "@/components/Bottom";
import { cloneDeep } from "lodash";
import CopySection from "@/components/CopySection";

const Room = () => {
    const socket = useSocket();
    const { roomId } = useRouter().query;
    const { peer, myId } = userPeer();
    const { stream } = useMediaStream();
    const { players, setPlayers, playerHighlighted, nonhighlightedPlayers, toggleAudio, toggleVideo, leaveRoom } = usePlayer(myId, roomId, peer);

    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (!socket || !peer || !stream) return;
        const handleUserConnected = (newUser) => {
            console.log(`user connected in room with userId ${newUser}`)

            //since user-connected event is listened by others as it is a broadcasted event so peer in the following line is others
            const call = peer.call(newUser, stream);

            //this event listener register itself in a map and executes whenever called in the furture
            call.on('stream', (incomingStream) => {
                console.log(`incoming stream from ${newUser}`);

                setPlayers((prev) => ({
                    ...prev,
                    [newUser]: {
                        url: incomingStream,
                        muted: true,
                        playing: true,
                    },
                }));

                setUsers((prev) => ({
                    ...prev,
                    [newUser]: call
                }))

            });
        };

        socket.on('user-connected', handleUserConnected);

        return () => {
            socket.off('user-connected', handleUserConnected);
        }
    }, [peer, socket, stream, setPlayers])


    useEffect(() => {
        if (!socket) return;

        const handleToggleAudio = (userId) => {
            console.log(`user with if ${userId} toggled audio`)
            setPlayers((prev) => {
                const copy = cloneDeep(prev);
                copy[userId].muted = !copy[userId].muted;
                return { ...copy };
            })
        }

        const handleToggleVideo = (userId) => {
            console.log(`user with if ${userId} toggled video`)
            setPlayers((prev) => {
                const copy = cloneDeep(prev);
                copy[userId].playing = !copy[userId].playing;
                return { ...copy };
            })
        }

        const handleUserLeave = (userId) => {
            console.log(`user with userId ${userId} is leaving room`);
            users[userId]?.close();
            const playersCopy = cloneDeep(players);
            delete playersCopy[userId];
            setPlayers(playersCopy);
        }

        socket.on('user-toggle-audio', handleToggleAudio);
        socket.on('user-toggle-video', handleToggleVideo);
        socket.on('user-leave', handleUserLeave);

        return () => {
            socket.off('user-toggle-audio', handleToggleAudio);
            socket.off('user-toggle-video', handleToggleVideo);
            socket.off('user-leave', handleUserLeave);
        }

    }, [players, socket, setPlayers, users]);

    useEffect(() => {
        if (!peer || !stream) return;
        peer.on('call', (call) => {
            const { peer: callerId } = call;
            call.answer(stream);

            call.on('stream', (incomingStream) => {
                console.log(`incoming stream from ${callerId}`);

                setPlayers((prev) => ({
                    ...prev,
                    [callerId]: {
                        url: incomingStream,
                        muted: true,
                        playing: true,
                    },
                }));

                setUsers((prev) => ({
                    ...prev,
                    [callerId]: call
                }));

            })
        })
    }, [peer, stream, setPlayers]);

    //basically this useEffect is only beneficial for first user, after that it is redundant
    useEffect(() => {
        if (!stream || !myId) return;
        console.log(`setting my stream ${myId}`);
        setPlayers((prev) => ({
            ...prev,
            [myId]: {
                url: stream,
                muted: true,
                playing: true,
            },
        }));
    }, [myId, setPlayers, stream])



    return (
        <>
            <div className={styles.activePlayerContainer}>
                {playerHighlighted && (<Player url={playerHighlighted.url} muted={playerHighlighted.muted} playing={playerHighlighted.playing} isActive />)}
            </div>
            <div className={styles.inActivePlayerContainer}>
                {Object.keys(nonhighlightedPlayers).map((playerId) => {
                    const { url, muted, playing } = nonhighlightedPlayers[playerId];
                    return (<Player key={playerId} url={url} muted={muted} playing={playing} isActive={false} />)
                })}
            </div>

            <CopySection roomId={roomId} />

            <Bottom muted={playerHighlighted?.muted} playing={playerHighlighted?.playing} toggleAudio={toggleAudio} toggleVideo={toggleVideo} leaveRoom={leaveRoom} />
        </>
    )
}

export default Room;