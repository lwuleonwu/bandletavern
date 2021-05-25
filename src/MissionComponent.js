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
            missionsList: this.props.list,
            missionId: -1
        }

        this.selectMission = this.selectMission.bind(this);
        this.confirmMissionSelect = this.confirmMissionSelect.bind(this);
        this.cancelMissionSelect = this.cancelMissionSelect.bind(this);
    }

    // track which mission user clicked on
    selectMission(newMission) {
        this.setState({
            mission: newMission,
            missionId: newMission.id
        });
    }

    confirmMissionSelect() {
        this.props.select(this.state.mission, this.state.missionId);
    }

    cancelMissionSelect() {
        this.props.cancel(Mode.NONE);
    }

    componentDidUpdate(oldProps) {
        if (this.props.list != oldProps.list) {
            this.setState({
                missionsList: this.props.list
            });
        }
    }

    render() {
        return (
            <div className={"missionsList"}>
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
        let objList = this.props.mission.objectives; // objectives list
        return (
            <div id={this.props.mission.id} onClick={this.selectMission}>
                <div className="missionTitle">{this.props.mission.title}</div>
                <div className="missionDesc">{this.props.mission.description}</div>
                <div className="missionProgress">
                    <ul>
                        {objList.map((obj, index) =>
                            <li key={index}>
                                <div className="objDesc">{obj.description}</div>
                                <div className="objProgress">
                                    <span className="objProgressCurr">{obj.progress.currentProgress}</span> 
                                    / 
                                    <span className="objProgressTotal">{obj.progress.totalCount}</span>
                                </div>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        );
    }
}

export {MissionSelect};
