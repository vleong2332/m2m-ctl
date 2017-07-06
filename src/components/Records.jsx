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
	let { config, ready, list, associated, associate, disassociate } = props;

	return list && list.map((item, index) => {
		let id = item[config.relatedEntPrimaryIdAttr];
		let content = item[config.displayField];
		let isAssociated = associated.indexOf(id) !== -1;

		return (
			<Record
				key={index}
				ready={ready}
				content={content}
				logicalName={config.logicalName}
				entityId={id}
				associate={associate}
				disassociate={disassociate}
				associated={isAssociated}
			/>
		);
	});
};

const renderPhantomRecords = props => {
	let { list } = props;
	// Assuming that this record container spans the full width of the body.
	let rowWidth = window.document.body.clientWidth;
	let recordFlexBasis = 90;
	let itemsWidth = list.length * recordFlexBasis;
	if (itemsWidth > rowWidth) {
		let phantomRecords = [];
		for (let i = 0; i < 12; i++) {
			phantomRecords.push(<Record phantom />);
		}
		return phantomRecords;
	}
};

const Records = props => {
	return (
		<StyledRecords className="records" collapsed={props.collapsed}>
			{renderRecords(props)}
			{renderPhantomRecords(props)}
		</StyledRecords>
	);
};

export default Records;
