import React from 'react';
import styled from 'styled-components';

const StyledRecord = styled.div`
	flex: 1 1 5rem;
	padding: 0.25rem;
	cursor: ${({ready}) => ready ? 'pointer' : 'inherit'};
	background-color: ${({ associated }) => associated ? 'steelblue' : 'initial'};
	color: ${({ associated }) => associated ? 'white' : 'initial'};
	font-weight: ${({ associated }) => associated ? 'bold' : 'normal'};
	pointer-events: ${({ ready }) => ready ? 'auto' : 'none'};
`;

const PhantomRecord = styled.div`
	visibility: hidden;
	pointer-events: none;
	flex: 1 1 5rem;
	padding: 0 0.25rem;
`;

const Record = props => {
	let { phantom, content, logicalName, entityId, ready, associated, associate,
		disassociate } = props;

	return phantom ?
		<PhantomRecord /> :
		(
			<StyledRecord
				className='record'
				ready={ready}
				associated={associated}
				logicalName={logicalName}
				entityId={entityId}
				onClick={() => associated ? disassociate(entityId) : associate(entityId)}
			>
				{content}
			</StyledRecord>
		);
};

export default Record;
