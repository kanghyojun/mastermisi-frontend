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
  switch (request.type) {
    case 'logout':
      chrome.browserAction.setPopup({'popup': 'login.html'});
      break;
  }
});
