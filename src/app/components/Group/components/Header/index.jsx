import React from 'react';
import MdKeyboardArrowDown from 'react-icons/lib/md/keyboard-arrow-down';
import MdKeyboardArrowUp from 'react-icons/lib/md/keyboard-arrow-up';
import { StyledHeader, SelectAllBox, Title, ExpandIconContainer } from './style';

const Header = ({ title, isCollapsed, allSelected, onExpandIconClick, onSelectAllClick }) => {
	return (
		<StyledHeader className="header">
			<SelectAllBox
				className="select-all-box"
				allSelected={allSelected}
				onClick={onSelectAllClick}
			/>
			<Title className="title">{title}</Title>
			<ExpandIconContainer className="expand" onClick={onExpandIconClick}>
				{isCollapsed ? <MdKeyboardArrowDown /> : <MdKeyboardArrowUp />}
			</ExpandIconContainer>
		</StyledHeader>
	);
};

export default Header;
