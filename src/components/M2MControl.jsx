import React from 'react';
import styled from 'styled-components';

import Filter from './Filter';
import Notification from './Notification';
import Records from './Records';
import GroupedRecords from './GroupedRecords';

import { FILTER_ALL, FILTER_SELECTED, FILTER_UNSELECTED } from '../modules/Constant';

const Root = styled.div`
	height: 100%;
	text-align: left;
	font-family: 'Segoe UI';
	font-size: 12px;
	color: #111;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	pointer-events: ${({isReady}) => isReady ? 'auto' : 'none'};
`;

const ContentPanel = styled.div`
	flex: 1 1 auto;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	overflow: auto;
	padding-bottom: 1rem;
`;

const filters = [
	{ name: 'All', value: FILTER_ALL },
	{ name: 'Selected', value: FILTER_SELECTED },
	{ name: 'Unselected', value: FILTER_UNSELECTED }
];

const M2MControl = ({
	config,
	currentFilter,
	errors,
	queue,
	records,
	associatedIds,
	associate,
	disassociate,
	switchFilter,
	isReady,
}) => {
	// console.log('===> RECORDS:', records);
  return (
    <Root className="m2m-control" isReady={isReady}>
      <Filter
        filters={filters}
        currentFilter={currentFilter}
        onFilterItemClick={switchFilter}
      />
      <ContentPanel className="content-panel">
        {config.groupByField
          ? <GroupedRecords
            filter={currentFilter}
            ready={isReady}
            config={config}
            list={records}
            associated={associatedIds}
            associate={associate}
            disassociate={disassociate}
          />
          : <Records
						config={config}
						list={records}
            currentFilter={currentFilter}
            isReady={isReady}
            associatedIds={associatedIds}
            associate={associate}
            disassociate={disassociate}
						isCollapsed={false}
          />}
      </ContentPanel>
      <Notification
        errors={errors}
        queue={queue} />
    </Root>
  );
}

export default M2MControl;
