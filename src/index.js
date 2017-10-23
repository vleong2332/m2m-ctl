import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import './index.css';

const Xrm  = window.parent.Xrm;
const rootEl = document.getElementById('root');

ReactDOM.render(<App xrm={Xrm} />, rootEl);

window.customM2MControl = {
  hide: function(itemsToHide) {
    ReactDOM.render(<App xrm={Xrm} itemsToHide={itemsToHide} />, rootEl);
  },
}
