import React from 'react';
import styled from 'styled-components';

import Message from './Message';
import StatusIcon from './StatusIcon';

const StyledNotification = styled.div`
	flex: 0 0 auto;
	display: flex;
	flex-direction: row;
	background-color: #FEFEAA;
	width: 100%;
`;

const Notification = props => {
	let { isAtTop, message, status } = props;
	return (
		<StyledNotification className="notification" isAtTop={isAtTop}>
			<Message message={message} />
			<StatusIcon status={status} />
		</StyledNotification>
	);
};

export default Notification;
