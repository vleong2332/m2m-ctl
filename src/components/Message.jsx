import React from 'react';
import styled from 'styled-components';

const StyledMessage = styled.p`
	flex: 1 1 auto;
	padding: 0.25rem;
	margin: 0;
`;

const Message = ({ message }) => {
	return (
		<StyledMessage className="message">
			{message}
		</StyledMessage>
	);
};

export default Message;
