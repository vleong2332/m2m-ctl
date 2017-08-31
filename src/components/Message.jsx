import React from 'react';
import styled from 'styled-components';

const Root = styled.p`
	flex: 1 1 auto;
	padding: 0.25rem;
	margin: 0;
`;

const Message = ({ text }) => {
	return (
		<Root className="message">
			{text}
		</Root>
	);
};

export default Message;
