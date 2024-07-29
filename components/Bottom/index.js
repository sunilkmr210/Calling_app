import cx from "classnames";
import { Mic, Video, PhoneOff, MicOff, VideoOff } from "lucide-react";
import styles from '@/components/Bottom/index.module.css'; 

const Bottom = (props)=>{
    const {muted, playing, toggleAudio, toggleVideo, leaveRoom} = props;

    return(
        <div className={styles.bottomMenu}>
            {muted? <MicOff className = {cx(styles.icon, styles.active)} size={55} onClick={toggleAudio}/>:<Mic className={styles.icon} size={55} onClick={toggleAudio}/>}
            {playing? <VideoOff className={styles.icon} onClick={toggleVideo} size={55}/>:<VideoOff className={cx(styles.icon, styles.active)} onClick={toggleVideo} size={55}/>}
            <PhoneOff size={55} className={styles.icon} onClick={leaveRoom}/>
        </div>
    )
}

export default Bottom