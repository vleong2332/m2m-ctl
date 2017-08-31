import React from 'react';
import styled from 'styled-components';

const Root = styled.div`
	flex: 1 1 5rem;
	padding: 0.25rem;
	background-color: ${({ isAssociated }) => isAssociated ? 'steelblue' : 'initial'};
	color: ${({ isAssociated }) => isAssociated ? 'white' : 'initial'};
	font-weight: ${({ isAssociated }) => isAssociated ? 'bold' : 'normal'};
	cursor: ${({isReady}) => isReady ? 'pointer' : 'inherit'};
	pointer-events: ${({ isReady }) => isReady ? 'auto' : 'none'};
`;

const Record = props => {
	let { content, isReady, isAssociated, onClick } = props;

	return (
		<Root
			className='record'
			isReady={isReady}
			isAssociated={isAssociated}
			onClick={onClick}
		>
			{content}
		</Root>
	);
};

export default Record;
