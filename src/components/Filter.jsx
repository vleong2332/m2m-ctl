import React from 'react';
import styled from 'styled-components';

const StyledFilter = styled.div`
	flex: 0 0 auto;
	width: 100%;
	margin-bottom: 0.5rem;
`;

const FilterItem = styled.span`
	color: ${({currentFilter, filterValue}) => filterValue === currentFilter? '#000': '#666'};
	font-weight: 600;
	margin-left: ${({first}) => first ? '0' : '0.3rem'};
	margin-right: 0.3rem;
	cursor: pointer;
`;

const renderFilter = props => {
	let { filters, currentFilter, switchFilter } = props;

	return filters.map((filter, index) => {
		return (
			<FilterItem
				key={index}
				className="filter-item"
				currentFilter={currentFilter}
				filterValue={filter.value}
				first={index === 0}
				onClick={() => switchFilter(filter.value)}
			>
				{filter.name}
			</FilterItem>
		);
	});
};

const Filter = props => {
	return (
		<StyledFilter className="filters">
			{renderFilter(props)}
		</StyledFilter>
	);
};

export default Filter;
