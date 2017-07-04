import React from 'react';
import styled from 'styled-components';
import MdKeyboardArrowDown from 'react-icons/lib/md/keyboard-arrow-down';
import MdKeyboardArrowUp from 'react-icons/lib/md/keyboard-arrow-up';

const StyledGroupHeader = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	width: 100%;
	border-bottom: 1px solid #D6D6D6;
`;

const SelectAllBox = styled.div`
	flex: 0 0 24px;
	height: 24px;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: ${({allSelected}) => allSelected ? 'steelblue' : '#D6D6D6'};
	border: 6px solid white;
	box-sizing: border-box;
	cursor: pointer;
`;

const Title = styled.h1`
	flex: 1 1 auto;
	margin: 0px 0 0.25rem;
	font-size: inherit;
	font-weight: normal;
`;

const Expand = styled.div`
	flex: 0 0 24px;
	height: 24px;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
`;

const GroupHeader = props => {
	let { title, collapsed, setCollapsed, allSelected, selectAll, deselectAll } = props;
	return (
		<StyledGroupHeader className="header">
			<SelectAllBox className="select-all-box" allSelected={allSelected} onClick={allSelected ? deselectAll : selectAll} />
			<Title className="title">{title}</Title>
			<Expand className="expand" onClick={setCollapsed}>
				{collapsed ? <MdKeyboardArrowDown /> : <MdKeyboardArrowUp />}
			</Expand>
		</StyledGroupHeader>
	);
};

export default GroupHeader;
