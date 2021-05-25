import React from "react";
import * as mode from "./ModeComponent";
import * as mission from "./MissionComponent";
import * as FindGroup from "./FindGroupComponent";
import * as FindPlayer from "./FindPlayerComponent";
import * as database from "./database";

class MainPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: mode.Mode.NONE,
            missionId: -1,
            clientReady: false, // if requests for missions/player info from client are done
            missionsList: [],
            userList: new Map(),
            userRegistered: false, // check if user is already in database
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

        // remove user info from database on exit
        window.onbeforeunload = (event) => {
            let playerInfo = this.state.playerInfo;
            database.checkUser(playerInfo.accountId, (registeredMissionId) => {
                if (registeredMissionId !== -1) {
                    // user already in database, remove them
                    database.unregisterMission(playerInfo, registeredMissionId);
                }
                database.signOut();
                window.api.send("toMain", "exit");
                window.onbeforeunload = null;
            });

            event.returnValue = false;
        }
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

            // ready connection to database
            window.api.send("player", data);

            if (this.state.missionsList) {
                this.setState({
                    clientReady: true
                });
            }

            console.log(data);
        });
        window.api.receive("token", (data) => {
            console.log("Received auth token");
            this.setState({
                token: data
            });

            database.signIn(this.state.token);
        });
        window.api.receive("validLobby", (data) => {
            console.log("Received valid lobby check");
            this.setState({
                inLobby: data
            });
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

    selectMission(newMission, newMissionId) {
        if (newMissionId !== -1) {
            console.log(`Confirmed mission selected: ${newMission.id}`);

            let playerInfo = this.state.playerInfo;
            database.checkUser(playerInfo.accountId, (registeredMissionId) => {
                if (registeredMissionId !== -1) {
                    // user already in database, remove them
                    database.unregisterMission(playerInfo, registeredMissionId);
                }

                if (this.state.mode === mode.Mode.FIND_GROUP) {
                    // register user for mission
                    database.registerMission(playerInfo, newMission.id);
                } else if (this.state.mode === mode.Mode.FIND_PLAYER) {
                    // retrieve user list for mission
                    database.addMissionListener(newMission.id, (regPlayerInfo, added) => {
                        // initial snapshot contains every item in the list
                        // added: true, snapshot contains names of users to add to list
                        // added: false, snapshot contains names of users to remove
                        if (added) {
                            // add player info to list
                            if (!this.state.userList.has(regPlayerInfo.accountId)) {
                                let newUserList = this.state.userList;
                                newUserList.set(regPlayerInfo.accountId, regPlayerInfo);
                                this.setState({
                                    userList: newUserList
                                });
                            } else {
                                // player already in list, do not update
                            }
                        } else {
                            if (this.state.userList.has(regPlayerInfo.accountId)) {
                                let newUserList = this.state.userList;
                                newUserList.delete(regPlayerInfo.accountId);
                                this.setState({
                                    userList: newUserList
                                });
                            } else {
                                // user not in list, do not update, also weird scenario
                            }
                        }
                    });
                }

                this.setState({
                    missionId: newMission.id,
                    mission: newMission
                });
            });
        }
    }

    cancelGroupFind() {
        console.log(`Left queue for ${this.state.mission.title}`)

        database.unregisterMission(this.state.playerInfo, this.state.missionId);

        this.setState({
            missionId: -1
        });
    }

    cancelPlayerFind() {
        console.log(`End search for players`);

        database.removeMissionListener(this.state.missionId);

        this.setState({
            missionId: -1
        });
    }

    // switch between mode select, mission select, and results
    updateDisplay() {
        if ((this.state.mode === mode.Mode.None || this.state.missionId === -1) && this.state.clientReady) {
            return <div>
                <mode.ModeSelect select={this.selectMode} />
                <mission.MissionSelect select={this.selectMission}
                    cancel={this.selectMode} list={this.state.missionsList} />
            </div>;
        } else {
            // user is in queue or inviting players
            if (this.state.mode === mode.Mode.FIND_GROUP) {
                return <FindGroup.QueueScreen missionTitle={this.state.mission.title}
                    cancel={this.cancelGroupFind} />
            } else if (this.state.mode === mode.Mode.FIND_PLAYER) {
                return <FindPlayer.PlayerSearch missionTitle={this.state.mission.title}
                    cancel={this.cancelPlayerFind} list={this.state.userList} />
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
