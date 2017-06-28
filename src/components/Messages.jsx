import React from 'react';

import Message from './Message';

const Messages = ({ messages }) => {
	return (
		<div className="messages">
			{messages.map((message, index) => <Message key={index} content={message} />)}
		</div>
	);
};

export default Messages;
