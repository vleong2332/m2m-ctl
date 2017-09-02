import styled from 'styled-components';

export const StyledApp = styled.div`
	height: 100%;
	text-align: left;
	font-family: 'Segoe UI';
	font-size: 12px;
	color: #111;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	pointer-events: ${({isReady}) => isReady ? 'auto' : 'none'};
`;

export const MainPanel = styled.div`
	flex: 1 1 auto;
	display: flex;
	flex-direction: column;
	overflow: auto;
	padding-bottom: 1rem;
`;

export const GroupedRecords = styled.div`
	height: 100%;
`;
