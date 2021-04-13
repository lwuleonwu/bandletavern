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
            userList: this.props.list,
        }
    }

    /*
    componentDidMount() {
        let testList = new Map();
        testList.set(500, {
            accountId: 500,
            displayName: "tets"
        });

        testList.set(800, {
            accountId: 800,
            displayName: "another one"
        });

        this.setState({
            userList: testList
        });
    }
    */

    render() {
        return(
            <div>
                <div>Searching for players for: <b>{this.props.missionTitle}</b></div>
                <PlayerList userList={this.state.userList} />
                <button onClick={this.props.cancel}>Cancel Search</button>
            </div>
        );
    }
}

function PlayerList(props) {
    return (
        <ul>
            {[...props.userList].map(([accountId, playerInfo]) =>
                <li key={accountId}>
                    <PlayerPost player={playerInfo} />
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
        let otherPlayerData = this.props.player;
        window.api.send("invite", otherPlayerData);

        this.setState({
            inviteStatus: true
        });
    }
    
    render() {
        return (
            <div>
                <div className="playerName" id={this.props.player.accountId}>
                    {this.props.player.displayName}
                </div>
                <button className="inviteBtn" onClick={this.handleInvite}>
                    {this.state.inviteStatus ? "✓" : "+"}
                </button>
            </div>
        );
    }
}

export {PlayerSearch}
