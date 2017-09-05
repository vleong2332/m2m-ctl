import styled from 'styled-components';

export const StyledRecords = styled.div`
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	width: 100%;
	height: ${({isCollapsed}) => isCollapsed ? '0px' : '100%'};
	overflow: hidden;
`;
