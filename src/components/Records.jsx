import React from 'react';

import Record from './Record';

const Records = ({ list, logicalName, primaryAttr, displayField }) => {
	return (
		<div className="records">
			{list && list.map((item, index) => (
				<Record
					key={index}
					content={item[displayField]}
					logicalName={logicalName}
					entityId={item[primaryAttr]}
				/>
			))}
		</div>
	);
};

export default Records;
