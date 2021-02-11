import React from "react";

let Mode = {
    NONE: -1,
    FIND_GROUP: 0,
    FIND_PLAYER: 1
};

class ModeSelect extends React.Component {
    constructor(props) {
        super(props);
    }

    selectMode(newMode) {
        this.props.select(newMode)
    }

    render() {
        return (
            <div>
                <div onClick={this.selectMode.bind(this, Mode.FIND_GROUP)}>
                    Find a Group
                </div>
                <div onClick={this.selectMode.bind(this, Mode.FIND_PLAYER)}>
                    Search for Users
                </div>
            </div>
        );
    }
}

export {Mode, ModeSelect};
