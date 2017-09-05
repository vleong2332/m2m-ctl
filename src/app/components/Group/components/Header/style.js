import styled from 'styled-components';

export const StyledHeader = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	width: 100%;
	border-bottom: 1px solid #D6D6D6;
`;

export const SelectAllBox = styled.div`
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

export const Title = styled.h1`
	flex: 1 1 auto;
	margin: 0px 0 0.25rem;
	font-size: inherit;
	font-weight: normal;
`;

export const ExpandIconContainer = styled.div`
	flex: 0 0 24px;
	height: 24px;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
`;
