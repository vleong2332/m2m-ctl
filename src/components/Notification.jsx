import React from 'react';
import styled from 'styled-components';

import Message from './Message';
import StatusIcon from './StatusIcon';

const Root = styled.div`
	flex: 0 0 auto;
	display: flex;
	flex-direction: row;
	background-color: #333;
	color: #FFF;
	width: 100%;
`;

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
		<Root className="notification">
			<Message text={message} />
			<StatusIcon status={status} />
		</Root>
	);
};

export default Notification;
