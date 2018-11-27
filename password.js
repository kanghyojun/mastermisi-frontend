function getUrl(path, callback) {
  chrome.storage.sync.get(['serverURL'], function(result) {
    const serverURL = result.serverURL == null ? 'http://localhost:5000' : result.serverURL;

    callback(serverURL + path)
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
      callback({success: true, id: data.id});
    }).fail(function() {
      callback({success: false});
    });
  });
}

function requestApprovePassword(approvalId, passcode, callback) {
  console.log(approvalId);
  const payload = {
    type: 'POST',
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify({passcode: passcode}),
  };
  getUrl(`/api/pending-approvals/${approvalId}/`, function(u) {
    $.ajax(u, payload).done(function(data) {
      callback({success: true, password: data.password});
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
            chrome.tabs.sendMessage(tabs[0].id, {type: 'fill'}, function(response) {
            });
          });
        } else {
          console.error('error handling');
        }
      }
    );
  });


  const $approv = $('#pending-approvals');
  const $gen = $('#create-password');
  const $approvId = $approv.find('input[name=approval_id]')
  $approv.hide();
  $gen.hide();

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type: 'find'}, function(response) {
      if (response == null) {
        return;
      }

      if (response.found) {
        requestLookupPassword(tabs[0].url, function(result) {
          if (result.found) {
            if ($approvId.val() == '') {
              requestGenerateApprovals(result.id, function(genResult) {
                if (!genResult.success) {
                  console.error('Error');
                }

                $approvId.val(genResult.id);
                $approv.show();
                $gen.hide();
              });
            } else {
                $approv.show();
                $gen.hide();
            }
          } else {
            $approv.hide();
            $gen.show();
          }
        });
      }
    });
  });
});
