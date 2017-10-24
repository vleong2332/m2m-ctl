import React from 'react';
import isEqual from 'lodash.isequal';
import App from './App';
import EmptyMessage from './components/EmptyMessage';
import reducers from './services/reducers';
import config from './services/config';
import api from './services/api';
import { getExtraData, groupRecords, refreshData, notify } from './services/helpers';
import { FILTER_ALL, FILTER_SELECTED, FILTER_UNSELECTED } from './services/constants';

class AppContainer extends React.Component {

	constructor(props) {
		super(props);
    this.state = {
			isEditForm: this.isEditForm(this.props.xrm),
      currentFilter: FILTER_ALL,
      errors: [],
      queue: [],
      records: [],
      groupedRecords: [],
      associatedIds: []
    };
		this.filters = [
			{ name: 'All', value: FILTER_ALL },
			{ name: 'Selected', value: FILTER_SELECTED },
			{ name: 'Unselected', value: FILTER_UNSELECTED }
		];
    this.groupNamesAreMapped = false;
		this.associate = this.associate.bind(this);
		this.batchAssociate = this.batchAssociate.bind(this);
		this.disassociate = this.disassociate.bind(this);
		this.batchDisassociate = this.batchDisassociate.bind(this);
		this.switchFilter = this.switchFilter.bind(this);
	}

	isEditForm(xrm) {
		return xrm.Page.ui.getFormType() === 2;
	}

  // ===============
  // STATE MODIFIERS
  // ===============

	switchFilter(val) {
		let newFilter = val !== FILTER_SELECTED && val !== FILTER_UNSELECTED
			? FILTER_ALL
			: val;
		this.setState({ currentFilter: newFilter });
	}

	addError(message) {
		this.setState(reducers.addError(message));
	}

	enqueue(message) {
    // TODO: Possibly return an object that has .dismiss() to dequeue the message.
		const key = Date.now();
		this.setState(reducers.enqueue(key, message));
		return key;
	}

	dequeue(key) {
		this.setState(reducers.dequeue(key));
	}

  // TODO: Find a better way than a setState callback
  addAssociated(id, cb) {
    this.setState(reducers.addAssociated(id), cb);
  }

  // TODO: Find a better way than a setState callback
  removeAssociated(id, cb) {
    this.setState(reducers.removeAssociated(id), cb);
  }

  // ===============
	// LIFECYCLE HOOKS
  // ===============

	componentWillMount() {
		if (this.state.isEditForm) {
			this.getInfoFromURL();
		}
	}

	componentDidMount() {
		if (this.state.isEditForm) {
			this.getInfoFromAPI();
		}
	}

	componentDidUpdate(prevProps, prevState) {
    const { records, groupedRecords } = this.state;

		const recordsAreUpdated = !isEqual(prevState.records, records);
    if (recordsAreUpdated && config.groupByField) {
      const groupedRecords = groupRecords.call(this, records, config.groupByField);
      this.groupNamesAreMapped = false;
      this.setState({ groupedRecords });
    }

		const groupedRecordsAreUpdated = !isEqual(prevState.groupedRecords, groupedRecords);
    if (groupedRecordsAreUpdated && !this.groupNamesAreMapped) {
      this.mapGroupName();
    }

		const newFilterFunctionReceived = !isEqual(prevProps.filter, this.props.filter)
		if (newFilterFunctionReceived) {
			this.setState({
				records: this.runProvidedFilter(this.state.records),
				groupedRecords: this.runProvidedFilter(this.state.groupedRecords)
		  });
		}
  }

	componentWillReceiveProps(nextProps) {
		console.log(this.props, nextProps);
	}

	getInfoFromURL() {
		try {
			const { xrm } = this.props;
			const extraData = getExtraData.call(this, window.location.search);
      const hasRequiredConfig = !!(extraData || extraData.schemaName || extraData.displayField);

			if (!hasRequiredConfig) {
				throw new Error('Missing required configuration data.');
			}

      config.apiUrl = xrm.Page.context.getClientUrl() + '/api/data/v8.2';
      config.schemaName = extraData.schemaName;
      config.displayField = extraData.displayField;
      config.groupByField = extraData.groupByField;
			config.thisEntity.id = xrm.Page.data.entity.getId().replace(/{|}/g, '');
			config.thisEntity.name = xrm.Page.data.entity.getEntityName();
		} catch (error) {
			console.error(error);
			this.addError(error.message);
		}
	}

	async getInfoFromAPI() {
		if (!config || !config.hasRequiredProps()) {
			this.addError('Configuration is missing required props.');
			return;
		}

		try {
			const { relationshipType, thisEntity, relatedEntity } =
        await this.getRelationshipInfoAndThisEntityCollectionName();

      config.relationshipType = relationshipType;
      config.thisEntity.collectionName = thisEntity.collectionName;
      config.thisEntity.intersectAttr = thisEntity.intersectAttr;
      config.relatedEntity.name = relatedEntity.name;
      config.relatedEntity.intersectAttr = relatedEntity.intersectAttr;

			const [ collectionName, primaryIdAttr ] =  await this.getRelatedEntityMetadata();

      config.relatedEntity.collectionName = collectionName;
      config.relatedEntity.primaryIdAttr = primaryIdAttr;

			const [ relatedEntityRecords, associatedRecords ] =
        await this.getRelatedAndAssociatedRecords();

			console.log('running filter');
			const filteredRelatedEntityRecords = this.runProvidedFilter(relatedEntityRecords);

      this.setState({ records: filteredRelatedEntityRecords });
      associatedRecords && this.setState({
        associatedIds : associatedRecords.map(record => record[config.relatedEntity.primaryIdAttr])
      });
		} catch (error) {
			console.error(error);
			this.addError(error.message);
		}
	}

  // ====================================
	// METHODS USED INSIDE LIFECYCLE HOOOKS
  // ====================================

  getRelationshipInfoAndThisEntityCollectionName() {
    return new Promise(async(resolve, reject) => {
      const { apiUrl, schemaName, thisEntity } = config;

      const statusMessageKey1 = this.enqueue('Getting relationship metadata');
      const statusMessageKey2 = this.enqueue('Getting this entity metadata');

      const [ relationshipMetadata, thisEntityMetadata ] = await Promise.all([
        api.getRelationshipMetadata(apiUrl, schemaName),
        api.getEntityMetadata(apiUrl, thisEntity.name, [ 'LogicalCollectionName' ]),
      ]);

      this.dequeue(statusMessageKey1);
      this.dequeue(statusMessageKey2);

      if (!relationshipMetadata) {
        throw new Error('Cannot get relationship metadata');
      }
      if (!thisEntityMetadata) {
        throw new Error('Cannot get entity metadata for ', config.thisEntity.name);
      }

      const [ thisEntityData, relatedEntityData ] =
        this.getEntitiesNameAndIntersectAttr(relationshipMetadata);

      resolve({
        relationshipType: relationshipMetadata.RelationshipType,
        thisEntity: {
          collectionName: thisEntityMetadata.LogicalCollectionName,
          intersectAttr: thisEntityData.intersectAttr,
        },
        relatedEntity: {
          name: relatedEntityData.name,
          intersectAttr: relatedEntityData.intersectAttr,
        }
      });
    });
  }

  getEntitiesNameAndIntersectAttr(relationshipMetadata) {
    const { schemaName, thisEntity } = config;
    const {
      Entity1LogicalName,
      Entity1IntersectAttribute,
      Entity2LogicalName,
      Entity2IntersectAttribute
    } = relationshipMetadata;
    const thisEntityIsEntity1 =
      thisEntity.name === Entity1LogicalName &&
      thisEntity.name !== Entity2LogicalName;
    const thisEntityIsEntity2 =
      thisEntity.name !== Entity1LogicalName &&
      thisEntity.name === Entity2LogicalName;

    if (thisEntityIsEntity1) {
      return [
        { intersectAttr: Entity1IntersectAttribute },
        { name: Entity2LogicalName, intersectAttr: Entity2IntersectAttribute }
      ];
		} else if (thisEntityIsEntity2) {
      return [
        { intersectAttr: Entity2IntersectAttribute },
        { name: Entity1LogicalName, intersectAttr: Entity1IntersectAttribute }
      ];
		} else {
			throw new Error(
        `Cannot determine whether ${thisEntity.name} is Entity1 or Entity2 in ${schemaName}`
      );
		}
  }

  getRelatedEntityMetadata() {
    return new Promise(async(resolve, reject) => {
      const { apiUrl, relatedEntity } = config;

      const statusMessageKey1 = this.enqueue('Getting related entity metadata');
      const relatedEntMetadata = await api.getEntityMetadata(
        apiUrl,
        relatedEntity.name,
        [
          'PrimaryIdAttribute',
          'LogicalCollectionName'
        ]
      );
      this.dequeue(statusMessageKey1);

      if (!relatedEntMetadata) {
        throw new Error('Cannot get entity metadata for ', relatedEntity.name);
      }

      resolve([ relatedEntMetadata.LogicalCollectionName, relatedEntMetadata.PrimaryIdAttribute ]);
    });
  }

  getRelatedAndAssociatedRecords() {
    return new Promise(async (resolve, rejct) => {
      const { apiUrl, schemaName, thisEntity, relatedEntity, displayField, groupByField } = config;

      const statusMessageKey1 = this.enqueue('Getting related entity records');
      const statusMessageKey2 = this.enqueue('Getting currently associated records');

      const [ relatedEntityRecords, associatedRecords] = await Promise.all([
        api.getRelatedEntityRecords(
          apiUrl,
          relatedEntity.collectionName,
          [
            relatedEntity.primaryIdAttr,
            displayField,
            groupByField || '',
          // Filter out falsy elements
          ].filter(entry => entry)
        ),
        api.getCurrentlyAssociated(
          apiUrl,
          thisEntity.collectionName,
          thisEntity.id,
          schemaName,
          [ relatedEntity.primaryIdAttr ]
        ),
      ]);

      this.dequeue(statusMessageKey1);
      this.dequeue(statusMessageKey2);

      if (!relatedEntityRecords) {
        throw new Error('Cannot get related entity records');
      }

      resolve([ relatedEntityRecords, associatedRecords ]);
    });
  }

	runProvidedFilter(relatedEntityRecords) {
		console.log('provided filter', this.props.filter);
		return this.props.filter
			? relatedEntityRecords.filter(r => this.props.filter(r))
			: relatedEntityRecords;
	}

  async mapGroupName() {
    const { apiUrl, relatedEntity, groupByField } = config;
    let statusMessageKey;

    try {
      // Get the field type of the groupByField
      statusMessageKey = this.enqueue('Getting field type of group-by field');
      const fieldType = await api.getFieldType(apiUrl, relatedEntity.name, groupByField);
      this.dequeue(statusMessageKey);

      // Currently, we only support picklist/optionset
      if (!fieldType || fieldType.toLowerCase() !== 'picklist') {
        return;
      }

      // Get the optionset if groupByField is an optionset field
      statusMessageKey = this.enqueue('Getting option set for group name');
      const optionsetOptions = await api.getOptionSetOptions(apiUrl, relatedEntity.name, groupByField);
      this.dequeue(statusMessageKey);

      if (!optionsetOptions) {
        return;
      }

      // Go through each group and change the name of it to the label of the option.
      let groupedRecords = this.state.groupedRecords.slice();

      groupedRecords.forEach(group => {
        const hasNoName = group.name === 'null' || group.name === 'undefined' || group.name === '';

        if (hasNoName) {
          group.name = 'Unknown';
        } else {
          // eslint-disable-next-line
          const optionset = optionsetOptions.find(opt => (
            opt.Value.toString() === group.name.toString()
          ));

          if (optionset) {
            group.name = optionset.Label.UserLocalizedLabel.Label;
          }
        }
      });

      this.groupNamesAreMapped = true;
      this.setState({ groupedRecords });
    } catch(error) {
      console.error(error);
      this.addError(error.message);
    }
  }

  // ===============================
  // METHODS PASSED DOWN TO CHILDREN
  // ===============================

  async associate(recordId) {
		let statusMessageKey = this.enqueue('Associating...');

		try {
			await api.associateInPort(recordId, config);
			this.addAssociated(recordId, () => {
				this.dequeue(statusMessageKey);
			});
			refreshData.call(this);
		} catch(error) {
			console.error(error);
      this.dequeue(statusMessageKey);
      this.addError('Associate failed');
      notify.call(
        this,
        'There\'s a problem in associating that record. Try to refresh the page and do it again. ' +
          'If problem persists, please contact IT.',
        'ERROR'
      );
		}
	}

	async disassociate(recordId) {
		let statusMessageKey = this.enqueue('Disassociating...');

		try {
			await api.disassociateInPort(recordId, config);
			this.removeAssociated(recordId, () => {
				this.dequeue(statusMessageKey);
			});
			refreshData.call(this);
		} catch(error) {
			console.error(error);
      this.dequeue(statusMessageKey);
			this.addError('Disassociate failed');
      notify.call(
        this,
        'There\'s a problem in disassociating that record. Try to refresh the page and do it ' +
          'again. If problem persists, please contact IT.',
        'ERROR'
      );
		}
	}

	async batchAssociate(recordIds) {
		const statusMessageKey = this.enqueue('Associating...');
		const associateRequests = recordIds && recordIds.map(recordId => (
      // assciateInPort() returns the responseText if status code is in the 200's, in this case, it
      // would be "".
      api.associateInPort(recordId, config)
        .then(() => {
          // We're modifying the associatedIds here one by one, instead of "batching" them, so that
          // we get immediate visual feedback for the ones that are done.
  				this.addAssociated(recordId);
  			})
    ));

		try {
			await Promise.all(associateRequests);
			this.dequeue(statusMessageKey);
      // Because the server is multi-threaded, our batched requests are ran in such a way that the
      // last one could finish before the second to last one. For example, if we select all NT
      // books, we would expect the books (text) field to be "mat-rev". However, the action that's
      // triggered for associating "Revelation" could finish before the action for "Jude" resulting
      // in "mat-3jn, rev". This runAction request caps off the batched requests so that the same
      // action is triggered again once they are finished (hopefully?). A possible improvement would
      // be to actually batch the requests to a single, atomic request.
			await api.runAction("wa_SetBooksTextForProject", config);
			refreshData.call(this);
		} catch (error) {
			console.error(error);
      this.dequeue(statusMessageKey);
			this.addError('Associate failed');
      notify.call(
        this,
        'There\'s a problem in associating one of the records. Try to refresh the page and do it ' +
          'again. If problem persists, please contact IT.',
        'ERROR'
      );
		}
	}

  // NOTE: See comments for batchAssociate()
	async batchDisassociate(recordIds) {
		const statusMessageKey = this.enqueue('Disassociating...');
		const disassociateRequests = recordIds && recordIds.map(recordId => (
      api.disassociateInPort(recordId, config).then(resp => {
				this.removeAssociated(recordId);
			})
    ));

		try {
			await Promise.all(disassociateRequests);
			this.dequeue(statusMessageKey);
			await api.runAction("wa_SetBooksTextForProject", config);
			refreshData.call(this);
		} catch (error) {
			console.error(error);
      this.dequeue(statusMessageKey);
			this.addError('Disassociate failed');
      notify.call(
        this,
        'There\'s a problem in associating one of the records. Try to refresh the page and do it ' +
          'again. If problem persists, please contact IT.',
        'ERROR'
      );
		}
	}

  // ======
  // RENDER
  // ======

  render() {
    return this.state.isEditForm
			? <App
				isEnabled={this.props.isEnabled}
        config={config}
        {...this.state}
        filters={this.filters}
        switchFilter={this.switchFilter}
        associate={this.associate}
        disassociate={this.disassociate}
        batchAssociate={this.batchAssociate}
        batchDisassociate={this.batchDisassociate}
				filter={this.filter}
      />
			: <EmptyMessage>To enable this content, create the record.</EmptyMessage>;
  }
}

export default AppContainer;
