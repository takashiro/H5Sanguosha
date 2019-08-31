
import React from 'react';

function onCardEnter(motion) {
	const rect = this.node.current.parentElement.getBoundingClientRect();
	const centerTop = (rect.top + rect.bottom) / 2;
	const centerLeft = (rect.left + rect.right) / 2;
	motion.setEndPos(centerTop, centerLeft);
}

class HandArea extends React.Component {

	constructor(props) {
		super(props);

		const area = props.area;

		this.node = React.createRef();

		this.state = {
			num: area.size()
		};

		area.on('cardenter', onCardEnter.bind(this));
		area.on('numchanged', num => this.setState({num}));
	}

	render() {
		return <div ref={this.node} className="handcard-num">{this.state.num}</div>;
	}

}

export default HandArea;
