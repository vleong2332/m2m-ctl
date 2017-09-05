import styled from 'styled-components';

export const StyledStatusIcon = styled.div`
	flex: 0 0 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
`;

export const Dot = styled.div`
	border-radius: 50%;
	width: ${({status}) => status === 'busy' ? '7px' : '8px'};
	height: ${({status}) => status === 'busy' ? '7px' : '8px'};
	border: ${({status}) => status === 'busy' ? '1px solid lightgreen' : 'none'};
	background-color: ${({status}) => (
		status === 'error'
			? 'orangered'
			: status === 'warning'
				? 'yellow'
				: status === 'busy'
					? 'transparent'
					: 'lightgreen'
	)};
`;
