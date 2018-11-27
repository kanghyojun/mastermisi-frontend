function isAccountId(formName) {
  let result = false;
  const nameList = ['id', 'email', 'login', 'name', 'identifier'];

  result = result || nameList.indexOf(formName) !== -1;

  for (name of nameList) {
    result = result || formName.match(`_${name}`) != null;
    result = result || formName.match('[a-zA-Z]' + name.charAt(0).toUpperCase() + name.slice(1, name.length)) != null;
  }

  return result;
}

function find(request) {
  let result = false;
  for (const elem of document.getElementsByTagName('input')) {
    switch (elem.type) {
      case 'text': 
        if (isAccountId(elem.name)) {
          result = true;
        }
        break;
      case 'password':
        result = true;
        break;
    }
  }

  return {found: result};
}

function fill(request) {
  for (const elem of document.getElementsByTagName('input')) {
    if (elem.type === 'password') {
      elem.value = request.account.password;
    } else if (elem.type === 'text' && isAccountId(elem.name)) {
      elem.value = request.account.id;
    } else if (elem.type === 'email') {
      elem.value = request.account.id;
    }
  }

  return {fill: true};
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.type) {
    case 'find':
      message = find(request)
      break;
    case 'fill':
      message = fill(request)
      break;
  }
  sendResponse(message);
});
