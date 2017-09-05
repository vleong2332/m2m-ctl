import React from 'react';
import { StyledMessage } from './style';

const Message = ({ text }) => {
	return (
		<StyledMessage className="message">
			{text}
		</StyledMessage>
	);
};

export default Message;
