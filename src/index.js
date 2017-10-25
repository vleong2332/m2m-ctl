import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import './index.css';

const Xrm = window.parent.Xrm;
const rootEl = document.getElementById('root');

window.customM2MControl = {
  rerender,
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
  const hook = Xrm.Utility.customM2MControl;
  hook && hook.postMount && hook.postMount();
}
