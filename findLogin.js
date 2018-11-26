function find(request) {
  let result = false;
  for (const elem of document.getElementsByTagName('input')) {
    switch (elem.type) {
      case 'text': 
        if (elem.name in ['id', 'email', 'name', 'identifier']) {
          result = true;
        }
        break;
      case 'password':
        result = true;
        break;
    }
  }

  return {found: result}
}

function fill(request) {
  for (const elem of document.getElementsByTagName('input')) {
    if (elem.type === 'password') {
        elem.value = request.password
    }
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(request);
  switch (request.type) {
    case 'find':
      message = find(request)
      break;
    case 'fill':
      message = fill(reuqset)
      break;
  }
  sendResponse(message);
});
