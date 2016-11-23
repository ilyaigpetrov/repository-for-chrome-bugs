'use strict';

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log('UPDATED!', tab.url, changeInfo);
});

function updateTitle(requestDetails, cb) {
  //var ID = parseInt(Math.random()*100);
  //console.log(ID, 'START');
  chrome.browserAction.getTitle(
    { tabId: requestDetails.tabId },
    title => {      
      if (requestDetails.type === 'main_frame') title += ' MAIN';
      console.log(title);
      chrome.browserAction.setTitle({
        title: title + '!',
        tabId: requestDetails.tabId
      });
      //console.log(ID, 'FINISH');
      return cb && cb();
    }
  );

}
/*
  chrome.webRequest.onCompleted.addListener(
    updateTitle,
    ...
  );

  Load some massive page.
  In DevTools console the logs will look like:
  
    FooBar Extension
    (6) FooBar Extension!
    (2) FooBar Extension!!
    FooBar Extension!!!
    FooBar Extension!!!!

  Notice the (6) and (2) denoting the number of repeated log messages.
  Uncommenting logs reveals that START->FINISH pairs are messed.
  
  BUG ONE
  -------
  This behaviour may be considered as a bug, because I expect
  getTitle's callback to be executed with the most recent title,
  i.e. the one set by the most recent setTitle.

  Let's try calling setTitle strictly after corresponding getTitle.
**/

var previousUpdateTitleFinished = Promise.resolve();

function updateTitleAtomic(requestDetails) {
  
  previousUpdateTitleFinished = previousUpdateTitleFinished.then(
    () => new Promise( resolve => updateTitle( requestDetails, resolve ) )
  );

}

chrome.webRequest.onCompleted.addListener(
  updateTitle,
  { urls: ['*://*.archive.org/*'] }
);

/*
  Now this seems to fix the problem, but not quite.
  Try reloading the extension, opening new tab, then loading archive.org:
  
    UPDATED! chrome://newtab/ Object {status: "loading", url: "chrome://newtab/"}
    UPDATED! chrome://newtab/ Object {favIconUrl: "https://www.google.ru/favicon.ico"}
    UPDATED! http://archive.org/ Object {status: "complete"}
    pageAction's title lost after setting MAIN
    UPDATED! https://archive.org/ Object {status: "loading", url: "https://archive.org/"}
    UPDATED! https://archive.org/ Object {favIconUrl: "https://archive.org/images/glogo.jpg"}
    UPDATED! https://archive.org/ Object {title: "Internet Archive: Digital Library of Free Books, Movies, Music & Wayback Machine"}
    pageAction's title lost after setting
    pageAction's title lost after setting!

  Notice that the 'MAIN' title was set and lost afer update.

  Now don't close the tab with archive.org.
  Hit F5 on it.
  And in logs I have:
  
    UPDATED! https://archive.org/ Object {status: "complete"}
    pageAction's title lost after setting!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    pageAction's title lost after setting!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! MAIN
    UPDATED! https://archive.org/ Object {status: "loading"}
    UPDATED! https://archive.org/ Object {title: "Internet Archive: Digital Library of Free Books, Movies, Music & Wayback Machine"}
    pageAction's title lost after setting
    pageAction's title lost after setting!
  
  BUG TWO
  -------
  Title is reset and lost after webRequest.onCompleted of the main frame, not before it.
  This behaviour may be considered as a bug or a feature.

**/