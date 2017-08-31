import React from 'react';
import styled from 'styled-components';

import Group from './Group';

const Root = styled.div`
	height: 100%;
`;

const GroupedRecords = props => {
	let { list, ...rest } = props;

	return (
		<Root className="grouped-records">
			{list.map((item, index) => <Group key={index} item={item} {...rest} />)}
		</Root>
	);
};

export default GroupedRecords;
