import React from 'react';

const Record = ({ content, logicalName, entityId }) => {
	return (
		<p
			className="record"
			logicalName={logicalName}
			entityId={entityId}
		>
			{content}
		</p>
	);
};

export default Record;
