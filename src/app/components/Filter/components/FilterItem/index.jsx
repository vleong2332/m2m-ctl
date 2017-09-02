import React from 'react';
import { StyledFilterItem } from './style';

const FilterItem = ({ children, isActive, onClick }) => (
  <StyledFilterItem
    className="filter-item"
    isActive={isActive}
    onClick={onClick}
  >
    {children}
  </StyledFilterItem>
);

export default FilterItem;
