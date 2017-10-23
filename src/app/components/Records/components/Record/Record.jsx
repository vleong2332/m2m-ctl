import React from 'react';
import { StyledRecord } from './style';

const Record = props => {
	let { content, isReady, isAssociated, onClick, visible } = props;

	return (
		<StyledRecord
			className='record'
			isReady={isReady}
			isAssociated={isAssociated}
			onClick={onClick}
			enabled={visible}
		>
			{content}
		</StyledRecord>
	);
};

export default Record;
