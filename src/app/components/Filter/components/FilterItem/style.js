import styled from 'styled-components';

export const StyledFilterItem = styled.span`
	margin-right: 0.6rem;
	color: ${({isActive}) => isActive ? '#000': '#666'};
	font-weight: 600;
	cursor: pointer;

  &::last-of-type {
    margin-right: 0.3rem;
  }
`;
