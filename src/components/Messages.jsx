import React from 'react';
import styled from 'styled-components';

import Message from './Message';

const StyledMessages = styled.div`
	flex: 1 1 auto;
	padding: 0.25rem;
`;

const Messages = ({ messages }) => {
	return (
		<StyledMessages className="messages">
			{messages.map((message, index) => <Message key={index} message={message} />)}
		</StyledMessages>
	);
};

export default Messages;
