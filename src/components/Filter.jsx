import React from 'react';
import styled from 'styled-components';

import FilterItem from './FilterItem';

const Root = styled.div`
	flex: 0 0 auto;
	width: 100%;
	margin-bottom: 0.5rem;
`;

const Filter = ({ filters, currentFilter, onFilterItemClick }) => {
	return (
		<Root className="filter">
			{filters && filters.map((filter, index) => (
				<FilterItem
					key={index}
					text={filter.name}
					isActive={filter.value === currentFilter}
					onClick={() => onFilterItemClick(filter.value)}
				/>
			))}
		</Root>
	);
};

export default Filter;
