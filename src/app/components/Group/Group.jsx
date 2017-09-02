import React from 'react';
import isEqual from 'lodash.isequal';

import { StyledGroup} from './style';
import Header from './components/Header';
import Records from 'app/components/Records';


class Group extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			isCollapsed: false,
			allSelected: this.setAllSelected(),
		};
		this.toggleIsCollapsed = this.toggleIsCollapsed.bind(this);
		this.selectAll = this.selectAll.bind(this);
		this.deselectAll = this.deselectAll.bind(this);
		this.setAllSelected = this.setAllSelected.bind(this);
	}

	toggleIsCollapsed() {
		this.setState({ isCollapsed: !this.state.isCollapsed });
	}

	setAllSelected(props = this.props) {
		const { records, config, associatedIds } = props;
		const unassociatedIdsInGroup = records.list
			.map(entry => entry[config.relatedEntPrimaryIdAttr])
			.filter(id => associatedIds.indexOf(id) === -1);

		this.setState({ allSelected: unassociatedIdsInGroup.length === 0 });
	}

	componentWillReceiveProps(nextProps) {
		if (!isEqual(this.props.associatedIds, nextProps.associatedIds)) {
			this.setAllSelected(nextProps);
		}
	}

	selectAll() {
		const { records, config, batchAssociate, associatedIds } = this.props;
		const idFieldName = config.relatedEntPrimaryIdAttr;
		const unassociatedIdsInGroup = records.list
			.map(entry => entry[idFieldName])
			.filter(id => associatedIds.indexOf(id) === -1);

		batchAssociate(unassociatedIdsInGroup);
	}

	deselectAll() {
		const { records, config, batchDisassociate, associatedIds } = this.props;
		const idFieldName = config.relatedEntPrimaryIdAttr;
		const associatedIdsInGroup = records.list
			.map(entry => entry[idFieldName])
			.filter(id => associatedIds.indexOf !== -1);

		batchDisassociate(associatedIdsInGroup);
	}

	render() {
		const { isReady, currentFilter, config, records, associatedIds, associate, disassociate } = this.props;
		const { isCollapsed, allSelected } = this.state;

		return (
			<StyledGroup className="group">
				<Header
					title={records.name}
					isCollapsed={isCollapsed}
					allSelected={allSelected}
					onExpandIconClick={this.toggleIsCollapsed}
					onSelectAllClick={allSelected ? this.deselectAll : this.selectAll}
				/>
				{isCollapsed
					? null
					: <Records
						config={config}
						list={records.list}
						currentFilter={currentFilter}
						isReady={isReady}
						associatedIds={associatedIds}
						associate={associate}
						disassociate={disassociate}
					/>}
			</StyledGroup>
		);
	}

}

export default Group;
