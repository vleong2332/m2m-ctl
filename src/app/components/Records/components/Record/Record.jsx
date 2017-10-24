import React from 'react';
import { StyledRecord } from './style';

const Record = props => {
	let { content, isEnabled, isAssociated, onClick } = props;

	return (
		<StyledRecord
			className='record'
			isEnabled={isEnabled}
			isAssociated={isAssociated}
			onClick={onClick}
		>
			{content}
		</StyledRecord>
	);
};

export default Record;
