import React, { Component } from 'react';
import Filter from './components/Filter';
import Notification from './components/Notification';
import Records from './components/Records';
import Group from './components/Group';
import reducers from './services/reducers';
import config from './services/config';
import api from './services/api';
import { getParam } from 'services/utils';
import {
	getExtraData,
	getId,
	getGroupedRecords,
	isReady as checkIsReady,
} from './services/helpers';
import { FILTER_ALL, FILTER_SELECTED, FILTER_UNSELECTED } from './services/constants';

import { StyledApp, MainPanel } from './style.js';

class App extends Component {

	constructor(props) {
		super(props);
		this.filters = [
			{ name: 'All', value: FILTER_ALL },
			{ name: 'Selected', value: FILTER_SELECTED },
			{ name: 'Unselected', value: FILTER_UNSELECTED }
		];
		this.state = {
			currentFilter: FILTER_ALL,
			errors: [],
			queue: [],
			records: [],
			associatedIds: []
		};
		this.addError = this.addError.bind(this);
		this.addQueue = this.addQueue.bind(this);
		this.removeQueue = this.removeQueue.bind(this);
		this.associate = this.associate.bind(this);
		this.batchAssociate = this.batchAssociate.bind(this);
		this.disassociate = this.disassociate.bind(this);
		this.batchDisassociate = this.batchDisassociate.bind(this);
		this.switchFilter = this.switchFilter.bind(this);
	}

	/**
	 * State modifiers
	 */

	addError(message) {
		this.setState(reducers.addError(message));
	}

	addQueue(message) {
		let key = Date.now();
		this.setState(reducers.enqueue(key, message));
		return key;
	}

	removeQueue(key) {
		this.setState(reducers.dequeue(key));
	}

	async associate(recordId) {
		let statusMessageKey = this.addQueue('Associating...');

		try {
			await api.associateInPort(recordId, config);
			this.setState(reducers.addAssociated(recordId), () => {
				this.removeQueue(statusMessageKey);
			});
			this.props.xrm.Page.data.refresh();
		} catch(err) {
			console.error(err);
			this.addError('Associate failed');
		}
	}

	async batchAssociate(recordIds) {
		const statusMessageKey = this.addQueue('Associating...');
		// assciateInPort() returns the responseText if status code is in the 200's, in this case, it
		// would be "".
		const associateRequests = recordIds && recordIds
			.map(recordId => api.associateInPort(recordId, config)
				.then(resp => {
					this.setState(reducers.addAssociated(recordId));
				})
			);

		try {
			await Promise.all(associateRequests);
			this.removeQueue(statusMessageKey);
			await api.runAction(config.thisEntCollName, config.thisEntId, "wa_SetBooksTextForProject", config);
			this.props.xrm.Page.data.refresh();
		} catch (error) {
			console.error(error);
			this.addError('Associate failed');
		}
	}

	async disassociate(recordId) {
		let statusMessageKey = this.addQueue('Disassociating...');

		try {
			await api.disassociateInPort(recordId, config);
			this.setState(reducers.removeAssociated(recordId), () => {
				this.removeQueue(statusMessageKey);
			});
			this.props.xrm.Page.data.refresh();
		} catch(err) {
			console.error(err);
			this.addError('Disassociate failed');
		}
	}

	async batchDisassociate(recordIds) {
		const statusMessageKey = this.addQueue('Disassociating...');
		// disassciateInPort() returns the responseText if status code is in the 200's, in this case, it
		// would be "".
		const disassociateRequests = recordIds && recordIds
			.map(recordId => api.disassociateInPort(recordId, config)
				.then(resp => {
					this.setState(reducers.removeAssociated(recordId));
				})
			);

		try {
			await Promise.all(disassociateRequests);
			this.removeQueue(statusMessageKey);
			await api.runAction(config.thisEntCollName, config.thisEntId, "wa_SetBooksTextForProject", config);
			this.props.xrm.Page.data.refresh();
		} catch (error) {
			console.error(error);
			this.addError('Disassociate failed');
		}
	}

	switchFilter(val) {
		let newFilter = val !== FILTER_SELECTED && val !== FILTER_UNSELECTED
			? FILTER_ALL
			: val;
		this.setState({ currentFilter: newFilter });
	}

	/**
	 * Lifecycle hooks
	 */

	componentWillMount() {
		try {
			const searchString = window.location.search;
			const extraData = getExtraData.call(this, searchString);

			if (!extraData) {
				throw new Error('Missing web resource data');
			}

			config.init(this.props.xrm, extraData);
			config.thisEntName = getParam(searchString, 'typename');;

			const thisEntId = getId.call(this, searchString);
			config.thisEntId = thisEntId && thisEntId.replace(/{|}/g, '');
		} catch (err) {
			console.error(err);
			this.addError(err.message);
		}
	}

	async componentDidMount() {
		const c = config;

		if (!c || !c.initIsSuccessful()) {
			this.addError('Config is improperly cofigured.');
			return;
		}

		let statusMessageKey1;
		let statusMessageKey2;

		try {
			// First batch of requests
			statusMessageKey1 = this.addQueue('Getting relationship metadata');
			statusMessageKey2 = this.addQueue('Getting this entity metadata');
			const [
				relationshipMetadata,
				thisEntMetadata,
			] = await Promise.all([
				api.getRelationshipMetadata(c.api, c.schemaName),
				api.getEntityMetadata(c.api, c.thisEntName, [ 'LogicalCollectionName' ]),
			]);
			this.removeQueue(statusMessageKey1);
			this.removeQueue(statusMessageKey2);
			this.handleRelationshipMetadata(relationshipMetadata);
			this.handleThisEntMetadata(thisEntMetadata);

			// Second batch of requests
			statusMessageKey1 = this.addQueue('Getting related entity metadata');
			const relatedEntMetadata = await api.getEntityMetadata(c.api, c.relatedEntName, [
				'PrimaryIdAttribute',
				'LogicalCollectionName'
			]);
			this.removeQueue(statusMessageKey1);
			this.handleRelatedEntMetadata(relatedEntMetadata);

			// Third batch of requests
			statusMessageKey1 = this.addQueue('Getting related entity records');
			statusMessageKey2 = this.addQueue('Getting currently associated records');
			const [
				relatedEntities,
				associatedRecords,
			] = await Promise.all([
				api.getRelatedEntityRecords(c.api, c.relatedEntCollName, [
					c.relatedEntPrimaryIdAttr,
					c.displayField,
					c.groupByField || ''
				].filter(entry => entry)),
				api.getCurrentlyAssociated(
					c.api,
					c.thisEntCollName,
					c.thisEntId,
					c.schemaName,
					[c.relatedEntPrimaryIdAttr]
				),
			]);
			this.removeQueue(statusMessageKey1);
			this.removeQueue(statusMessageKey2);
			this.handleRelatedEntities(relatedEntities);
			this.handleAssociatedRecords(associatedRecords);

		} catch (err) {
			console.error(err);
			this.addError(err.message);
		}
	}

	/**
	 * Component-specific helpers
	 */

	async mapGroupName() {
	  // There's nothing to map if we're not trying to group the records
	  if (!config.groupByField) {
	    return;
	  }

	  let statusMessageKey;

	  try {
	    // Get the field type of the group-by field
	    statusMessageKey = this.addQueue('Getting field type of group-by field');
	    const fieldType = await api.getFieldType(config.api, config.relatedEntName, config.groupByField);
	    this.removeQueue(statusMessageKey);

	    // Currently, we only support picklist/optionset
	    if (!fieldType || fieldType.toLowerCase() !== 'picklist') {
	      return;
	    }

	    // Get the optionset
	    statusMessageKey = this.addQueue('Getting option set for group name');
	    const optionsetOptions = await api.getOptionSetOptions(config.api, config.relatedEntName, config.groupByField);
	    this.removeQueue(statusMessageKey);

	    if (!optionsetOptions) {
	      return;
	    }

	    // Go through each group and change the name of it to the label of the option.
	    let groupedRecords = this.state.records.slice();

	    groupedRecords.forEach(group => {
	      const hasNoName = group.name === 'null' || group.name === 'undefined' || group.name === '';

	      if (hasNoName) {
	        group.name = 'Unknown';
	      } else {
	        // eslint-disable-next-line
	        let optionset = optionsetOptions.find(opt => opt.Value.toString() == group.name.toString());

	        if (optionset) {
	          group.name = optionset.Label.UserLocalizedLabel.Label;
	        }
	      }
	    });

	    this.setState({ records: groupedRecords });

	  } catch(err) {
	    console.error(err);
	    this.addError(err.message);
	  }
	}

	handleRelationshipMetadata(data) {
		if (!data) {
			throw new Error('Cannot get relationship metadata');
		}
		config.configure(data);
	}

	handleThisEntMetadata(data) {
		if (!data) {
			throw new Error('Cannot get entity metadata for ', config.thisEntName);
		}
		config.thisEntCollName = data.LogicalCollectionName;
	}

	handleRelatedEntMetadata(data) {
		if (!data) {
			throw new Error('Cannot get entity metadata for ', config.relatedEntName);
		}
		config.relatedEntPrimaryIdAttr = data.PrimaryIdAttribute;
		config.relatedEntCollName = data.LogicalCollectionName;
	}

	handleRelatedEntities(data) {
		if (!data) {
			throw new Error('Cannot get related entity records');
		}
		const sortedGroupedRecords = getGroupedRecords.call(this, data, config.groupByField);
		// TODO: Move setState callback to componentDidUpdate
		this.setState({ records: sortedGroupedRecords || data }, this.mapGroupName);
	}

	handleAssociatedRecords(data) {
		if (data) {
			const associatedIds = data.map(record => record[config.relatedEntPrimaryIdAttr]);
			this.setState({ associatedIds });
		}
	}

	/**
	 * Render
	 */

  render() {
		const { currentFilter, records, associatedIds, errors, queue } = this.state;
		const isReady = checkIsReady(this.state.errors, this.state.queue);

    return (
			<StyledApp className="m2m-control" isReady={isReady}>
	      <Filter
	        filters={this.filters}
	        currentFilter={currentFilter}
	        onFilterItemClick={this.switchFilter}
	      />
	      <MainPanel className="content-panel">
	        {config.groupByField
						?	records && records.map((groupedRecords, index) => (
							<Group
								key={index}
								config={config}
								records={groupedRecords}
								currentFilter={currentFilter}
								isReady={isReady}
								associatedIds={associatedIds}
								associate={this.associate}
								batchAssociate={this.batchAssociate}
								batchDisassociate={this.batchDisassociate}
								disassociate={this.disassociate}
							/>
						))
	          : <Records
							config={config}
							list={records}
	            currentFilter={currentFilter}
	            isReady={isReady}
	            associatedIds={associatedIds}
	            associate={this.associate}
	            disassociate={this.disassociate}
							isCollapsed={false}
	          />}
	      </MainPanel>
	      <Notification
	        errors={errors}
	        queue={queue} />
	    </StyledApp>
    );
  }
}

export default App;
