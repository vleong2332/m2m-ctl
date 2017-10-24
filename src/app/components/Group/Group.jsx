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
			allSelected: this.checkAllSelected(props),
		};
		this.toggleIsCollapsed = this.toggleIsCollapsed.bind(this);
		this.selectAll = this.selectAll.bind(this);
		this.deselectAll = this.deselectAll.bind(this);
		this.setAllSelected = this.setAllSelected.bind(this);
	}

	toggleIsCollapsed() {
		this.setState({ isCollapsed: !this.state.isCollapsed });
	}

	checkAllSelected(props) {
		const { records, config, associatedIds } = props;
		const unassociatedIdsInGroup = records.list
			.map(entry => entry[config.relatedEntity.primaryIdAttr])
			.filter(id => associatedIds.indexOf(id) === -1);
		return unassociatedIdsInGroup.length === 0;
	}

	setAllSelected(props = this.props) {
		this.setState({ allSelected: this.checkAllSelected(props) });
	}

	componentWillReceiveProps(nextProps) {
		if (!isEqual(this.props.associatedIds, nextProps.associatedIds)) {
			this.setAllSelected(nextProps);
		}
	}

	selectAll() {
		const { records, config, batchAssociate, associatedIds } = this.props;
		const idFieldName = config.relatedEntity.primaryIdAttr;
		const unassociatedIdsInGroup = records.list
			.map(entry => entry[idFieldName])
			.filter(id => associatedIds.indexOf(id) === -1);

		batchAssociate(unassociatedIdsInGroup);
	}

	deselectAll() {
		const { records, config, batchDisassociate, associatedIds } = this.props;
		const idFieldName = config.relatedEntity.primaryIdAttr;
		const associatedIdsInGroup = records.list
			.map(entry => entry[idFieldName])
			.filter(id => associatedIds.indexOf !== -1);

		batchDisassociate(associatedIdsInGroup);
	}

	render() {
		const { isEnabled, currentFilter, config, records, associatedIds, associate, disassociate } = this.props;
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
						isEnabled={isEnabled}
						associatedIds={associatedIds}
						associate={associate}
						disassociate={disassociate}
					/>}
			</StyledGroup>
		);
	}

}

export default Group;
