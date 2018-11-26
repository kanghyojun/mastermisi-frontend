chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.storage.sync.get(['mastermisiToken'], function(result) {
    if (result.mastermisiToken == null || !result.mastermisiToken) {
      chrome.browserAction.setPopup({'popup': 'login.html'});
    } else {
      chrome.browserAction.setPopup({'popup': 'password.html'});
    }
  });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(sender.tab ?
              "from a content script:" + sender.tab.url :
              "from the extension");
  if (request.loginSuccess) {
    chrome.storage.sync.set({'mastermisiToken': request.token}, function() {
      chrome.browserAction.setPopup({'popup': 'password.html'});
    });
  }
});
