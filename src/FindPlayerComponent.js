import React from "react";

/*
    Player Info Format
    
    name: user name of the player
    id: id of the player

*/

class PlayerSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            playerList: [],
        }
    }

    componentDidMount() {
        // TODO: add listener to database to retrieve list of users registered for mission
        // do this in MissionComponent?

        // for testing
        let player1 = {
            name: "Foxwell",
            id: 1,
        };

        let player2 = {
            name: "Zaichata",
            id: 2,
        }

        this.setState({
            playerList: [player1, player2]
        });
    }

    render() {
        return(
            <div>
                <div>Searching for players for: <b>{this.props.missionTitle}</b></div>
                <PlayerList playerList={this.state.playerList} />
                <button onClick={this.props.cancel}>Cancel Search</button>
            </div>
        );
    }
}

function PlayerList(props) {
    return (
        <ul>
            {props.playerList.map(player =>
                <li key={player.id}>
                    <PlayerPost player={player} />
                </li>
            )}
        </ul>
    );
}

class PlayerPost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inviteStatus: false
        }

        this.handleInvite = this.handleInvite.bind(this);
    }

    handleInvite() {
        // TODO: send specified player an invite through client api

        this.setState({
            inviteStatus: true
        });
    }
    
    render() {
        return (
            <div>
                <div className="playerName">{this.props.player.name}</div>
                <button className="inviteBtn" onClick={this.handleInvite}>
                    {this.state.inviteStatus ? "✓" : "+"}
                </button>
            </div>
        );
    }
}

export {PlayerSearch}
