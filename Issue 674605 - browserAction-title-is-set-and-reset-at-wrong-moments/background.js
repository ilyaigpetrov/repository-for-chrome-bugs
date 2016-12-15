'use strict';

chrome.tabs.onUpdated.addListener(
  (tabId, changeInfo, tab) => {

    console.log('UPDATED!', tab.url, changeInfo);

  }
);

function updateTitle(requestDetails, cb) {

  const id = ('00' + parseInt(Math.random()*1000)).slice(-3);
  console.log(0, id, 'START. Getting...');
  chrome.browserAction.getTitle(
    { tabId: requestDetails.tabId },
    (title) => {

      if (requestDetails.type === 'main_frame') {
        title += ' MAIN';
      }
      title += '!';
      chrome.browserAction.setTitle({
        title: title,
        tabId: requestDetails.tabId
      });
      console.log(0, id, 'Got. Set:', title, 'FINISH');
      return cb && cb();

    }
  );

}

function logReady() {
  console.log('Open http://archive.org. For subsecuent refresh: hit F12, Right click on reload button > Empty cache and hard reload)');
}

window.testOne = function() {

  removeAllListeners();
  chrome.webRequest.onCompleted.addListener(
    updateTitle,
    { urls: ['*://*.archive.org/*'] }
  );
  console.log('Test ONE Installed!');
  logReady();

};

/*
  Test One
  --------

  Load some massive page.
  In DevTools console the logs will look like:

81 "START. Getting..."
81 "Got. Set:" "FooBar Extension MAIN!" "FINISH"
UPDATED! https://archive.org/ Object {status: "loading"}
UPDATED! https://archive.org/ Object {favIconUrl: "https://archive.org/images/glogo.jpg"}
491 "START. Getting..."
491 "Got. Set:" "FooBar Extension MAIN!!" "FINISH"
32 "START. Getting..."
32 "Got. Set:" "FooBar Extension MAIN!!!" "FINISH"
250 "START. Getting..."
505 "START. Getting..."
250 "Got. Set:" "FooBar Extension MAIN!!!!" "FINISH"
505 "Got. Set:" "FooBar Extension MAIN!!!!" "FINISH"
591 "START. Getting..."
591 "Got. Set:" "FooBar Extension MAIN!!!!!" "FINISH"
123 "START. Getting..."
121 "START. Getting..."
194 "START. Getting..."
123 "Got. Set:" "FooBar Extension MAIN!!!!!!" "FINISH"
121 "Got. Set:" "FooBar Extension MAIN!!!!!!" "FINISH"
194 "Got. Set:" "FooBar Extension MAIN!!!!!!" "FINISH"

  Notice that some titles ("!!!!") are repeated, because callbacks
  receive title set at the moment of calling getTitle (not at the
  moment just before calling callback).

  BUG ONE
  -------
  This behaviour may be considered as a bug, because I expect
  getTitle's callback to be executed with the most recent title,
  i.e. the one set by the most recent setTitle.

  Let's try calling setTitle strictly after corresponding getTitle.
**/

let previousUpdateTitleFinished = Promise.resolve();

function updateTitleAtomic(requestDetails) {

  previousUpdateTitleFinished = previousUpdateTitleFinished.then(
    () => new Promise( resolve => updateTitle( requestDetails, resolve ) )
  );

}

function removeAllListeners() {

  chrome.webRequest.onCompleted.removeListener(updateTitle);
  chrome.webRequest.onCompleted.removeListener(updateTitleAtomic);

}

window.testTwo = function() {

  removeAllListeners();
  chrome.webReques.onCompleted.addListener(
    updateTitleAtomic,
    { urls: ['*://*.archive.org/*'] }
  );
  console.log('Test TWO Installed!');
  logReady();

};

/*
  Test Two
  --------

  Now this seems to fix the problem, but not quite.
  Load archive.org and wait till finish.

287" "START. Getting..."
287" "Got. Set:" "FooBar Extension MAIN!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" "FINISH"
UPDATED! https://archive.org/ Object {status: "complete"}

  Then hit F5:

027" "START. Getting..."
027" "Got. Set:" "FooBar Extension MAIN!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! MAIN!" "FINISH"
UPDATED! https://archive.org/ Object {status: "loading"}
UPDATED! https://archive.org/ Object {favIconUrl: "https://archive.org/images/glogo.jpg"}
050" "START. Getting..."
050" "Got. Set:" "FooBar Extension!" "FINISH"
349" "START. Getting..."
349" "Got. Set:" "FooBar Extension!!" "FINISH"
UPDATED! https://archive.org/ Object {status: "complete"}

  Notice that title is erased only after first request is completed, not before it.

  BUG TWO
  -------
  Title is reset after webRequest.onCompleted of the main frame, not before it.
  This behaviour may be considered as a bug or a feature.

**/
