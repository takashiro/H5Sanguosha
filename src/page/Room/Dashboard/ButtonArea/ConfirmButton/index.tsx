
import React from 'react';

import './index.scss';

interface ButtonProps {
	enabled: boolean;
	onClick: () => void;
}

class ConfirmButton extends React.Component<ButtonProps, {}> {
	handleClick = (): void => {
		const { onClick } = this.props;
		setTimeout(onClick, 0);
	}

	render(): JSX.Element {
		const { enabled } = this.props;
		const classNames = ['confirm'];
		if (enabled) {
			classNames.push('enabled');
		}
		return (
			<button type="button" className={classNames.join(' ')} onClick={this.handleClick} />
		);
	}
}

export default ConfirmButton;