import React from 'react';
import { StyledStatusIcon, Dot } from './style';

const StatusIcon = ({ status }) => {
	return (
		<StyledStatusIcon className="status-icon">
			<Dot status={status} />
		</StyledStatusIcon>
	);
};

export default StatusIcon;
