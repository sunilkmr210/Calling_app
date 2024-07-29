import React, { useRef, useState, useEffect } from 'react'

const useMediaStream = () => {

    const [state, setState] = useState(null);
    const isSetStream = useRef(false);

    useEffect(()=>{
        if(isSetStream.current) return;
        isSetStream.current = true;
        (async function initStream(){
            try{
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true, 
                    video: true
                })
                console.log("setting your stream")
                setState(stream);
            }catch(error){
                console.log(error);
            }
        })()
    }, [])

    return {
        stream: state
    }

}

export default useMediaStream
