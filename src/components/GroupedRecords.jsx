import React from 'react';
import styled from 'styled-components';

import Group from './Group';

const StyledGroupedRecords = styled.div`
	height: 100%;
`;

const GroupedRecords = props => {
	let { list, ...rest } = props;
	
	return (
		<StyledGroupedRecords className="grouped-records">
			{
				list.map((item, index) => <Group key={index} item={item} {...rest} />)
			}
		</StyledGroupedRecords>
	);
};

export default GroupedRecords;
