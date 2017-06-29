import React from 'react';
import styled from 'styled-components';

import Record from './Record';

const StyledRecords = styled.div`
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
`;

const renderRecords = props => {
	let { list, logicalName, primaryAttr, displayField, associated, associate, disassociate } = props;
	return list && list.map((item, index) => {
		let id = item[primaryAttr];
		return (
			<Record
				key={index}
				content={item[displayField]}
				logicalName={logicalName}
				entityId={id}
				associate={associate}
				disassociate={disassociate}
				associated={associated.indexOf(id) !== -1}
			/>
		);
	})
};

const Records = props => {
	return (
		<StyledRecords className="records">
			{renderRecords(props)}
		</StyledRecords>
	);
};

export default Records;
