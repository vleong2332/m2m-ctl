import React from 'react';
import { Filter, Notification, Records, Group } from './components';
import { isReady as checkIsReady } from './services/helpers';
import { StyledApp, MainPanel } from './style.js';

const App = ({
	isEnabled,
	config,
	filters,
	currentFilter,
	records,
	groupedRecords,
	associatedIds,
	errors,
	queue,
	switchFilter,
	associate,
	disassociate,
	batchAssociate,
	batchDisassociate,
}) => {
	const isReady = checkIsReady(errors, queue);

  return (
		<StyledApp className="m2m-control" isReady={isReady}>
      <Filter
        filters={filters}
        currentFilter={currentFilter}
        onFilterItemClick={switchFilter}
      />
      <MainPanel className="content-panel">
        {config.groupByField
					?	groupedRecords && groupedRecords.map((records, index) => (
						<Group
							key={index}
							config={config}
							records={records}
							currentFilter={currentFilter}
							isEnabled={isReady && isEnabled}
							associatedIds={associatedIds}
							associate={associate}
							batchAssociate={batchAssociate}
							batchDisassociate={batchDisassociate}
							disassociate={disassociate}
						/>
					))
          : <Records
						config={config}
						list={records}
            currentFilter={currentFilter}
            isEnabled={isReady && isEnabled}
            associatedIds={associatedIds}
            associate={associate}
            disassociate={disassociate}
						isCollapsed={false}
          />}
      </MainPanel>
      <Notification
        errors={errors}
        queue={queue} />
    </StyledApp>
  );
}

export default App;
