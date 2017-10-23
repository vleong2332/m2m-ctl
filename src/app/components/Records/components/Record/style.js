import styled from 'styled-components';

export const StyledRecord = styled.div`
	flex: 1 1 5rem;
	padding: 0.25rem;
	background-color: ${({ isAssociated }) => isAssociated ? 'steelblue' : 'initial'};
	color: ${({ isAssociated, enabled }) => enabled ? 'red' : isAssociated ? 'white' : 'initial'};
	font-weight: ${({ isAssociated }) => isAssociated ? 'bold' : 'normal'};
	cursor: ${({isReady}) => isReady ? 'pointer' : 'inherit'};
	pointer-events: ${({ isReady }) => isReady ? 'auto' : 'none'};
`;
