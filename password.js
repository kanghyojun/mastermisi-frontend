function getUrl(path, callback) {
  chrome.storage.sync.get(['mastermisiToken'], function(tok) {
    chrome.storage.sync.get(['serverURL'], function(result) {
      const serverURL = result.serverURL == null ? 'http://localhost:5000' : result.serverURL;

      callback(serverURL + path + `?token=${tok.mastermisiToken}`);
    });
  });
}

function requestLookupPassword(url, callback) {
  const payload = {
    type: 'POST',
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify({url: url})
  };
  getUrl('/api/passwords/', function(u) {
    $.ajax(
      u, payload
    ).done(function(data) {
      callback({success: true, found: true, id: data.id});
    }).fail(function() {
      callback({success: false, found: false});
    });
  });
}

function requestGenerateApprovals(id, callback) {
  const payload = {
    type: 'POST',
    contentType: 'application/json',
    dataType: 'json'
  };
  getUrl(`/api/passwords/${id}/approvals/`, function(u) {
    $.ajax(u, payload).done(function(data) {
      callback({success: true, id: data.id, quiz_answer: data.quiz_answer});
    }).fail(function() {
      callback({success: false});
    });
  });
}

function requestApprovePassword(approvalId, passcode, callback) {
  const payload = {
    type: 'POST',
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify({passcode: passcode}),
  };
  getUrl(`/api/pending-approvals/${approvalId}/`, function(u) {
    $.ajax(u, payload).done(function(data) {
      console.log(data)
      callback({success: true, password: data.password, id: data.id});
    }).fail(function() {
      callback({success: false});
    });
  });
}


$(document).ready(function() {
  $('#logout').click(function() {
    chrome.storage.sync.set({'mastermisiToken': null}, function(d) {
      chrome.runtime.sendMessage({type: 'logout'});
    });
  });
  const $pending = $('#pending-approvals-form');
  $pending.find('input[type=button]').click(function(event) {
    event.stopPropagation();
    requestApprovePassword(
      $pending.find('input[name=approval_id]').val(),
      $pending.find('input[name=passcode]').val(),
      function(result) {
        if (result.success) {
          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const message = {type: 'fill', account: {id: result.id, password: result.password}};

            chrome.tabs.sendMessage(tabs[0].id, message, function(response) { });
          });
        } else {
          console.error('error handling');
        }
      }
    );
  });


  const $approv = $('#pending-approvals');
  const $gen = $('#create-password');
  $approv.hide();
  $gen.hide();

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type: 'find'}, function(response) {
      console.log(response)
      if (response == null) {
        return;
      }

      if (response.found) {
        requestLookupPassword(tabs[0].url, function(result) {
          console.log('lokup', result);
          if (result.found) {
              requestGenerateApprovals(result.id, function(genResult) {
                if (!genResult.success) {
                  console.error('Error');
                }

                $approv.find('#passcode').html(genResult.quiz_answer);
                $approv.show();
                $gen.hide();
              });
          } else {
            $approv.hide();
            $gen.show();
          }
        });
      }
    });
  });
});
