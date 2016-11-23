chrome.webRequest.onCompleted.addListener(
	details => {
		if (details.tabId >= 0) {
		  console.log('SHOW FOR', details.tabId);
		  chrome.pageAction.show(details.tabId);
		}
	},
	{ urls: ['<all_urls>'] }
);