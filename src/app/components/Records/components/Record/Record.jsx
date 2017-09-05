import React from 'react';
import { StyledRecord } from './style';

const Record = props => {
	let { content, isReady, isAssociated, onClick } = props;

	return (
		<StyledRecord
			className='record'
			isReady={isReady}
			isAssociated={isAssociated}
			onClick={onClick}
		>
			{content}
		</StyledRecord>
	);
};

export default Record;
