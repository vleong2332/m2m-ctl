import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import './index.css';

const Xrm  = window.parent.Xrm;
const rootEl = document.getElementById('root');

window.customM2MControl = {
  rerender: function rerender(config = {}) {
    console.log('inside rerender with config', config);
    ReactDOM.render(
      <App
        xrm={config.xrm || Xrm}
        isEnabled={config.isEnabled === undefined ? true : config.isEnabled}
        filter={config.filter}
      />,
      rootEl
    );
  },
  disable: function disable() {
    this.rerender({
      isEnabled: false,
    });
  },
  enable: function enable() {
    this.rerender({
      isEnabled: true,
    });
  },
  filter: function filter(filterFunction = () => true) {
    this.rerender({
      filter: filterFunction,
    });
  },
}

ReactDOM.render(<App xrm={Xrm} isEnabled={true} />, rootEl);
runAfterMount();

function runAfterMount() {
  const contentAttr = Xrm.Page.getAttribute('wa_content');
  const currentContent = contentAttr.getOption(contentAttr.getValue());

  let filterFunction;
  let isEnabled;

  switch (currentContent.text.toLowerCase()) {
    case 'bible':
    case 'stories':
    case 'nt':
    case 'ot':
      isEnabled = false;
      break;
    case 'part. nt':
      filterFunction = i => i.wa_testament === 953860000;
      isEnabled = true;
      break;
    case 'part. ot':
      filterFunction = i => i.wa_testament === 953860001;
      isEnabled = true;
      break;
    case 'unknown':
      isEnabled = true;
      break;
    default:
      return;
  }

  console.log('calling rerender with', isEnabled, filterFunction);

  window.customM2MControl.rerender({
    isEnabled,
    filter: filterFunction,
  });
};
