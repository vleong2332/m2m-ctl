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

const getMessage = ({ errors, queue }) => {
	return errors.length > 0 ?
		errors[0] :
		queue.length > 0 ?
			queue[0].message :
			'Ready';
};

const getStatus = ({ errors, queue }) => {
	return errors.length > 0 ?
		'error' :
		queue.length > 0 ?
			'busy' :
			'ok';
};

const Notification = props => {
	console.log('NOTIFICATION', props.queue);
	return (
		<StyledNotification className="notification">
			<Message message={getMessage(props)} />
			<StatusIcon status={getStatus(props)} />
		</StyledNotification>
	);
};

export default Notification;
