import React from 'react';
import styled from 'styled-components';

import Group from './Group';

const Root = styled.div`
	height: 100%;
`;

const GroupedRecords = ({ list, ...rest }) => {
	return (
		<Root className="grouped-records">
			{list.map((records, index) => <Group key={index} records={records} {...rest} />)}
		</Root>
	);
};

export default GroupedRecords;
