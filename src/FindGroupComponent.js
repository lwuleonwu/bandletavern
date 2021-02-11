function QueueScreen(props) {
    return (
        <div>
            <div>In Queue for <b>{props.missionTitle}</b></div>
            <button onClick={props.cancel}>Leave Queue</button>
        </div>
    );
}

export {QueueScreen}
