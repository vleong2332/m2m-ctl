import React from 'react';

import { StyledNotification } from './style';
import Message from './components/Message';
import StatusIcon from './components/StatusIcon';

const Notification = ({ errors, queue }) => {
	let message;
	let status;

	if (errors.length > 0) {
		message = errors[0];
		status = 'error';
	} else if (queue.length > 0) {
		message = queue[0].message;
		status = 'busy';
	} else {
		message = 'Ready';
		status = 'ok';
	}

	return (
		<StyledNotification className="notification">
			<Message text={message} />
			<StatusIcon status={status} />
		</StyledNotification>
	);
};

export default Notification;
