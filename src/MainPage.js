import React from "react";
import * as mode from "./ModeComponent";
import * as mission from "./MissionComponent";
import * as FindGroup from "./FindGroupComponent";
import * as FindPlayer from "./FindPlayerComponent";
// import * as client from "./client";

class MainPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: mode.Mode.NONE,
            missionId: -1,
            clientReady: false, // if requests for missions/player info from client are done
            missionsList: [],
        };

        this.selectMode = this.selectMode.bind(this);
        this.selectMission = this.selectMission.bind(this);
        this.updateDisplay = this.updateDisplay.bind(this);
        this.cancelGroupFind = this.cancelGroupFind.bind(this);
        this.cancelPlayerFind = this.cancelPlayerFind.bind(this);

        this.messageInit();
    }

    componentDidMount() {
        // retrieve missions and player info from client
        window.api.send("toMain", "mission");
        window.api.send("toMain", "player");
    }

    // add listeners for messages from electron
    messageInit() {
        console.log("Adding listeners for missions and player info");
        window.api.receive("missions", (data) => {
            console.log("Received missions");
            this.setState({
                missionsList: data
            });

            if (this.state.playerInfo) {
                this.setState({
                    clientReady: true
                });
            }

            console.log(data);
        });
        window.api.receive("player", (data) => {
            console.log("Received player info");
            this.setState({
                playerInfo: data
            });

            if (this.state.missionsList) {
                this.setState({
                    clientReady: true
                });
            }
        });
    }

    selectMode(newMode) {
        console.log(`Mode selected: ${newMode}`);

        if (newMode === mode.Mode.NONE) {
            this.setState({
                missionId: -1
            });
        }

        this.setState({
            mode: newMode
        });
    }

    selectMission(newMission) {
        console.log(`Confirmed mission selected: ${newMission.id}`);

        this.setState({
            missionId: newMission.id,
            mission: newMission
        });
    }

    cancelGroupFind() {
        // TODO: remove user info from database
        console.log(`Left queue for ${this.state.mission.title}`)

        this.setState({
            missionId: -1
        });
    }

    cancelPlayerFind() {
        // TODO: remove listener from database
        console.log(`End search for players`);

        this.setState({
            missionId: -1
        });
    }

    // switch between mode select, mission select, and results
    updateDisplay() {
        if (this.state.mode === mode.Mode.NONE) {
            // mode has not yet been selected
            return <mode.ModeSelect select={this.selectMode} />;
        } else if (this.state.mode !== mode.Mode.NONE && this.state.missionId === -1) {
            // mission has not yet been selected

            return <mission.MissionSelect select={this.selectMission}
                cancel={this.selectMode} list={this.state.missionsList} />;
        } else {
            // user is in queue or inviting players
            if (this.state.mode === mode.Mode.FIND_GROUP) {
                return <FindGroup.QueueScreen missionTitle={this.state.mission.title}
                    cancel={this.cancelGroupFind} />
            } else if (this.state.mode === mode.Mode.FIND_PLAYER) {
                return <FindPlayer.PlayerSearch missionTitle={this.state.mission.title}
                    cancel={this.cancelPlayerFind} />
            }
        }
    }

    render() {
        return (
            <div>
                {this.updateDisplay()}
            </div>
        );
    }
}

export {MainPage};
