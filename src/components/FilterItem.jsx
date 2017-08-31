import React from 'react';
import styled from 'styled-components';

const Root = styled.span`
	margin-right: 0.6rem;
	color: ${({isActive}) => isActive ? '#000': '#666'};
	font-weight: 600;
	cursor: pointer;

  &::last-of-type {
    margin-right: 0.3rem;
  }
`;

const FilterItem = ({ text, isActive, onClick }) => {
  return (
    <Root
      className="filter-item"
      isActive={isActive}
      onClick={onClick}
    >
      {text}
    </Root>
  );
}

export default FilterItem;
