'use strict';

chrome.runtime.getBackgroundPage( (backgroundPage) => {

  document.getElementById('btn-one').onclick = backgroundPage.testOne;
  document.getElementById('btn-two').onclick = backgroundPage.testTwo;

});
