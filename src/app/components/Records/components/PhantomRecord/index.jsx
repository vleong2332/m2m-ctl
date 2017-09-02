import React from 'react';
import styled from 'styled-components';

const Root = styled.div`
	visibility: hidden;
	pointer-events: none;
	flex: 1 1 5rem;
	padding: 0 0.25rem;
`;

const PhantomRecord = () => (
  <Root className="phantom-record" />
);

export default PhantomRecord;
