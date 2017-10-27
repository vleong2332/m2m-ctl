import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import './index.css';

const Xrm = window.parent.Xrm;
const rootEl = document.getElementById('root');

Xrm.Utility.customM2MControl = {
  ...Xrm.Utility.customM2MControl,
  api: { rerender },
};

ReactDOM.render(<App xrm={Xrm} isEnabled={true} />, rootEl);
postMount();

/////////////////////////////////

function rerender(config = {}) {
  ReactDOM.render(
    <App
      xrm={config.xrm || Xrm}
      isEnabled={config.isEnabled === undefined ? true : config.isEnabled}
      filter={config.filter}
    />,
    rootEl
  );
}

function postMount() {
  const hooks = Xrm.Utility.customM2MControl.hooks;
  hooks && hooks.postMount && hooks.postMount();
}
