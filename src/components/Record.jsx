import React from 'react';
import styled from 'styled-components';

const StyledRecord = styled.div`
	flex: 1 1 5rem;
	padding: 0.25rem;
	cursor: pointer;
	background-color: ${({ associated }) => associated ? 'steelblue' : 'initial'};
	color: ${({ associated }) => associated ? 'white' : 'initial'};
	font-weight: ${({ associated }) => associated ? 'bold' : 'normal'};
`;

const Record = props => {
	let { content, logicalName, entityId, associated, associate, disassociate } = props;
	return (
		<StyledRecord
			className='record'
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
