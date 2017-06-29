import 'es6-promise/auto';


const Ajax = {};

/**
 * Send Cross-browser (IE 5.5+, Firefox, Opera, Chrome, Safari) AJAX request.
 *
 * @param string url
 * @param object successCb
 * @param object errorCb
 * @param mixed data
 */
Ajax.send = (method, url, successCb, errorCb, data) => {
	try {
		let req = Ajax.getXmlRequest(Ajax.getWindow());
		req.open(method, url, 1);
		if (method === 'POST') {
			req.setRequestHeader('Content-type', 'application/json');
		}
		req.onreadystatechange = (e) => {
			Ajax.handleReadyStateChange(e.target, successCb, errorCb);
		};
		req.send(data);
	} catch (e) {
		Ajax.log(e);
	}
};
// https://gist.github.com/Xeoncross/7663273

// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
// https://gist.github.com/jed/993585
// https://gist.github.com/Fluidbyte/5082377
// https://github.com/Xeoncross/kb_javascript_framework/blob/master/kB.js#L30
// https://gist.github.com/iwek/5599777
// http://msdn.microsoft.com/en-us/library/ms537505(v=vs.85).aspx#_id


Ajax.sendWithPromise = (url, data) => {
	let method = data ? 'POST' : 'GET';
	return new Promise((resolve, reject) => {
		Ajax.send(method, url, resolve, reject, data);
	});
}

Ajax.getWithPromise = (url) => {
	return new Promise((resolve, reject) => {
		Ajax.send('GET', url, resolve, reject);
	});
}

Ajax.postWithPromise = (url, data) => {
	return new Promise((resolve, reject) => {
		Ajax.send('POST', url, resolve, reject, data);
	});
}

Ajax.deleteWithPromise = (url) => {
	return new Promise((resolve, reject) => {
		Ajax.send('DELETE', url, resolve, reject);
	});
}


// (leongv) Most, if not all, of these may seem ultra pointless, but it actually helps send() to be
// unit-tested by removing the external dependency.

Ajax.getWindow = () => {
	return window;
};

Ajax.getXmlRequest = (windowObj) => {
	return windowObj.XMLHttpRequest ?
		new windowObj.XMLHttpRequest() :
		new windowObj.ActiveXObject('MSXML2.XMLHTTP.3.0');
};

Ajax.log = (content) => {
	console.log(content);
};

Ajax.handleReadyStateChange = (req, successCb, errorCb) => {
	if (req.readyState >= 4) {
		if (req.status >= 200 && req.status <= 299) {
			if (successCb) successCb(req.responseText);
		} else {
			if (errorCb) errorCb(req.responseText);
		}
	}
};

export default Ajax;
