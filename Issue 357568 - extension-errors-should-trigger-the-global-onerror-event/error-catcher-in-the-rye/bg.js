'use strict';

window.onerror = (...args) => console.warn('BG: onerror', ...args);

window.addEventListener('error', (...args) => console.warn('BG: Error EventListener', args) );

window.addEventListener('unhandledrejection', (event) => {

  console.warn('BG: Unhandled rejection.');

});

window.throwError = () => {

  console.warn('BG: throwError called.');
  throw new Error('BG: Err!');

};

window.rejectPromise = () => {

  console.warn('BG: rejectProimse called.');
  Promise.reject('BG: Reject!');

};

window.timeoutError = () => {

  console.warn('BG: timeouted throw.');
  setTimeout(function() {throw new Error('BG: From timeout with love!')}, 0);
  
};

window.storageError = () => {

  console.warn('BG: storage error.');
  chrome.storage.sync.get(
    function() {throw new Error('BG: From storage!')}
  );

};

window.timestorageError = () => {

  console.warn('BG: storage + timeout.');
  chrome.storage.sync.get(
    function() { setTimeout( function(){throw new Error('BG: From storage /w Timeout!')}, 0); }
  );

};

console.warn('BG: loaded');
