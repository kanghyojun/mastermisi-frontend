function getUrl(path, callback) {
  chrome.storage.sync.get(['serverURL'], function(result) {
    const serverURL = result.serverURL == null ? 'http://localhost:5000' : result.serverURL;

    callback(serverURL + path)
  });
}

function requestLogin(id, passcode, callback) {
  getUrl('/api/auth/', function(url) {
    $.ajax(
      url, {type: 'POST', data: {id: id, passcode: passcode}}
    ).done(function(data) {
      callback({success: true, data: data});
    }).fail(function() {
      callback({success: false});
    });
  });
}

$(document).ready(function() {
  const $login = $('#login');

  $login.extend({
    state: {loading: false, success: false, login: true, error: false},
    setState: function(state) {
      this.state = { ...this.state, ...state };
      this.render();
    },
    render: function() {
      const $login = $(this);
      const $loading = $('#loading');
      const $success = $('#success');

      console.log(this.state);
      $login.toggle(this.state.login);
      $loading.toggle(this.state.loading);
      $success.toggle(this.state.success);
    }
  });

  $login.setState({ login: true });

  $login.submit(function(event) {
    event.stopPropagation()
    const $this = $(this);
    const id = $this.find('input[name=id]').val();
    const passcode = $this.find('input[name=passcode]').val();

    $login.setState({ loading: true, login: false });

    requestLogin(id, passcode, function(payload) {
      const { success, data } = payload;

      if (!success) {
        $login.setState({ loading: false, login: true, error: true });
      } else {
        chrome.runtime.sendMessage({type: 'login', success: true, token: data.token});
        chrome.browserAction.setPopup({'popup': 'password.html'});
        $login.setState({ loading: false, login: false, success: true });
      }
    });
  });
});
