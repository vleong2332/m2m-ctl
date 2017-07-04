import React from 'react';
import styled from 'styled-components';

import Record from './Record';

const StyledRecords = styled.div`
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	height: ${({ collapsed }) => collapsed ? '0px' : '100%'};
	overflow: hidden;
`;

const renderRecords = props => {
	let { config, list, status, associated, associate, disassociate } = props;

	return list && list.map((item, index) => {
		let id = item[config.relatedEntPrimaryIdAttr];
		let content = item[config.displayField];
		let isAssociated = associated.indexOf(id) !== -1;

		return (
			<Record
				key={index}
				content={content}
				logicalName={config.logicalName}
				entityId={id}
				status={status}
				associate={associate}
				disassociate={disassociate}
				associated={isAssociated}
			/>
		);
	});
};

const Records = props => {
	return (
		<StyledRecords className="records" collapsed={props.collapsed}>
			{renderRecords(props)}
		</StyledRecords>
	);
};

export default Records;
