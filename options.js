function saveOptions() {
  var serverURL = document.getElementById('serverURL').value;
  chrome.storage.sync.set({
    serverURL: serverURL,
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restoreOptions() {
  chrome.storage.sync.get({
    serverURL: 'http://localhost:5000',
  }, function(items) {
    document.getElementById('serverURL').value = items.serverURL;
  });
}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
