
import React from 'react';

import './index.scss';

import EquipArea from './EquipArea';
import HandcardArea from './HandcardArea';
import ButtonArea from './ButtonArea';
import AvatarArea from './AvatarArea';

class Dashboard extends React.Component {

	constructor(props) {
		super(props);

		const room = this.props.room;
		this.state = {
			player: room.dashboardPlayer()
		};
		room.on('playerChanged', () => {
			this.setState({player: room.dashboardPlayer()});
		});
	}

	render() {
		const player = this.state.player;
		if (!player) {
			return null;
		}

		return <div className="dashboard">
			<EquipArea />
			<HandcardArea />
			<ButtonArea />
			<AvatarArea player={player} />
		</div>;
	}

}

export default Dashboard;
