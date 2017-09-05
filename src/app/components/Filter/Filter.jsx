import React from 'react';
import FilterItem from './components/FilterItem';
import { StyledFilter } from './style';

const Filter = ({ filters, currentFilter, onFilterItemClick }) => (
	<StyledFilter className="filter">
		{filters && filters.map((filter, index) => (
			<FilterItem
				key={index}
				isActive={filter.value === currentFilter}
				onClick={() => onFilterItemClick(filter.value)}
			>
				{filter.name}
			</FilterItem>
		))}
	</StyledFilter>
);

export default Filter;
