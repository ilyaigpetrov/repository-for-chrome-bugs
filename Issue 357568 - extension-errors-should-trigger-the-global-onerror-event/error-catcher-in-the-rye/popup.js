'use strict';

window.addEventListener('error', (err) => console.log('Popup: onerror', err));
window.addEventListener('unhandledrejection', (err) => console.log('Popup: unhandled Rej', err));

chrome.runtime.getBackgroundPage( function(backgroundPage) {

  document.getElementById('bg-reject-btn').onclick = () => {

    backgroundPage.console.log('Popup: rejecting promise...');
    backgroundPage.rejectPromise();

  };

  document.getElementById('bg-throw-btn').onclick = () => {

    backgroundPage.console.log('Popup: throwing error...');
    backgroundPage.throwError();

  };


  document.getElementById('bg-timeout-btn').onclick = () => {

    backgroundPage.console.log('Popup: timeouted error throw...');
    backgroundPage.timeoutError();

  };

  document.getElementById('bg-storage-btn').onclick = () => {

    backgroundPage.console.log('Popup: storage error...');
    backgroundPage.storageError();

  };

  document.getElementById('bg-timechrome-btn').onclick = () => {

    backgroundPage.console.log('Popup: storage + timeout');
    backgroundPage.storagetimeError();

  };
  
  document.getElementById('pop-timeout-btn').onclick = () => {

    setTimeout( () => {
      backgroundPage.console.log('Popup: timeout + storage');
      backgroundPage.storageError();
    }, 0)

  };

  document.getElementById('pop-timethrow-btn').onclick = () => {

    setTimeout( () => {
      backgroundPage.console.log('Popup: timeout + throw');
      backgroundPage.throwError();
    }, 0)

  };
  
  document.getElementById('pop-defer-btn').onclick = () => {
    deferCb(() => {
      backgroundPage.throwError();
    });
  };
  

});
