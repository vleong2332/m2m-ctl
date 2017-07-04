import React from 'react';
import styled from 'styled-components';

const StyledGroupHeader = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	width: 100%;
	cursor: pointer;
`;

const Title = styled.h1`
	flex: 1 1 auto;
	margin: 0px 0 0.25rem;
	font-size: medium;
`;

const Expand = styled.div`
	flex: 0 0 24px;
	height: 24px;
	background-color: red;
`;

const GroupHeader = props => {
	let { title, setCollapsed, allSelected, selectAll, deselectAll } = props;
	return (
		<StyledGroupHeader className="header">
			<Title className="title" onClick={allSelected ? deselectAll : selectAll}>{title}</Title>
			<Expand className="expand" onClick={setCollapsed}></Expand>
		</StyledGroupHeader>
	);
};

export default GroupHeader;
