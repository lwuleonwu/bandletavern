import React from "react";
import {Mode} from "./ModeComponent";

/*
    Mission Format
    Each mission in this.state.missions is an object with these fields:

    id: id of the mission
    title: title of the mission
    desc: description of the mission objective
    progress: current progress of the mission
    total: max progress of the mission

*/

class MissionSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            missionsList: [],
        }

        this.loadMission = this.loadMission.bind(this);
        this.selectMission = this.selectMission.bind(this);
        this.confirmMissionSelect = this.confirmMissionSelect.bind(this);
        this.cancelMissionSelect = this.cancelMissionSelect.bind(this);
    }

    // add a new mission to the missions list
    loadMission(newMission) {
        let oldList = this.state.missionsList;
        let newList = oldList.push(newMission);
        this.setState({
            missionsList: newList
        });
    }

    // track which mission user clicked on
    selectMission(newMission) {
        this.setState({
            mission: newMission
        });
    }

    confirmMissionSelect() {
        this.props.select(this.state.mission);

        // TODO: add user info to database
    }

    cancelMissionSelect() {
        this.props.cancel(Mode.NONE);
    }

    componentDidMount() {
        // TODO: populate missions list in this.state.missions
        // retrieve missions at earlier point in application?

        // for testing
        let mission1 = {
            id: 1,
            title: "the first one",
            desc: "refer to title",
            progress: 0,
            total: 1
        };

        let mission3 = {
            id: 3,
            title: "where's 2?",
            desc: "we skipped the second one",
            progress: 1,
            total: 3
        };

        /*
        this.loadMission(mission1);
        this.loadMission(mission3);
        */
        this.setState({
            missionsList: [mission1, mission3]
        });
    }

    render() {
        return (
            <div>
                <ul>
                    {(this.state.missionsList).map((mission) => 
                        <li key={mission.id}>
                            <MissionPost
                                mission={mission}
                                select={this.selectMission}
                            />
                        </li>
                    )}
                </ul>
                <button onClick={this.confirmMissionSelect}>Confirm</button>
                <button onClick={this.cancelMissionSelect}>Cancel</button>
            </div>
        );
    }
}

// simple container for mission info
// includes mission title, description, progress
class MissionPost extends React.Component {
    constructor(props) {
        super(props);

        this.selectMission = this.selectMission.bind(this);
    }

    selectMission() {
        console.log(`Selected mission: ${this.props.mission.id}`);
        this.props.select(this.props.mission);
    }

    render() {
        return (
            <div id={this.props.mission.id} onClick={this.selectMission}>
                <div className="missionTitle">{this.props.mission.title}</div>
                <div className="missionDesc">{this.props.mission.desc}</div>
                <div className="missionProgress">
                    {this.props.mission.progress} / {this.props.mission.total}
                </div>
            </div>
        );
    }
}

export {MissionSelect};
