import React from 'react';
import styled from 'styled-components';

const Root = styled.div`
	flex: 0 0 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const Dot = styled.div`
	border-radius: 50%;
	width: ${({status}) => status === 'busy' ? '7px' : '8px'};
	height: ${({status}) => status === 'busy' ? '7px' : '8px'};
	border: ${({status}) => status === 'busy' ? '1px solid lightgreen' : 'none'};
	background-color: ${({status}) => (
		status === 'error'
			? 'orangered'
			: status === 'warning'
				? 'yellow'
				: status === 'busy'
					? 'transparent'
					: 'lightgreen'
	)};
`;

const StatusIcon = ({ status }) => {
	return (
		<Root className="status-icon">
			<Dot status={status} />
		</Root>
	);
};

export default StatusIcon;
