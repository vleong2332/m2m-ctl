import React from 'react';
import styled from 'styled-components';

const StyledStatusIcon = styled.div`
	flex: 0 0 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const StatusIconOk = styled.div`
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background-color: green;
`;

const StatusIconWarning = styled.div`
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background-color: yellow;
`;

const StatusIconError = styled.div`
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background-color: red;
`;

const StatusIconBusy = styled.div`
	width: 7px;
	height: 7px;
	border-radius: 50%;
	border: 1px solid green;
`;

const renderStatusIcon = status => {
	return status === 'error' ? <StatusIconError /> :
		status === 'warning' ? <StatusIconWarning /> :
			status === 'busy' ? <StatusIconBusy /> :
				<StatusIconOk />;
};

const StatusIcon = ({ status }) => {
	return (
		<StyledStatusIcon className="status-icon">
			{renderStatusIcon(status)}
		</StyledStatusIcon>
	);
};

export default StatusIcon;
