
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'configUpdated') {
    location.reload()
  }
})




let config
const activityEvents = ['mousedown', 'keydown', 'mousemove', 'scroll', 'touchstart', 'click'];
let lastActivityTime = Date.now();
let confirmationTimer = null;

chrome.storage.sync.get('config', (data) => {
  if (data.config) {
    console.log('set config')
    config = data.config
  }

  listenForInactivity()
});



function listenForInactivity() {
  activityEvents.forEach(eventType => {
    document.addEventListener(eventType, resetInactivityTimer, { passive: true });
  })
  resetInactivityTimer()
}


let inactivityTimer
function resetInactivityTimer() {
  if (!config.ACTIVE) return
  // console.log('reset activity timer')
  lastActivityTime = Date.now();

  if (inactivityTimer) {
    clearTimeout(inactivityTimer)
  }

  // Clear any existing timers
  if (confirmationTimer) {
    clearTimeout(confirmationTimer);
    confirmationTimer = null;
  }

  // Set new inactivity timer
  inactivityTimer = setTimeout(checkInactivity, config.INACTIVITY_TIMEOUT);
}


function checkInactivity() {
  if (!config.ACTIVE) return

  console.log('checking active')
  const timeSinceLastActivity = Date.now() - lastActivityTime
  if (timeSinceLastActivity >= config.INACTIVITY_TIMEOUT) {
    showRefreshConfirmationDialog()
  } else {
    const remainingTime = config.INACTIVITY_TIMEOUT - timeSinceLastActivity;
    setTimeout(checkInactivity, remainingTime);
  }
}


// Clear local storage
function refreshSession() {
  if (!config.ACTIVE) return

  if (!document.hidden) localStorage.clear();
  location.reload()
  console.log('Local storage cleared due to inactivity');
}





///// POPUPS


// Create and show confirmation dialog
function showRefreshConfirmationDialog() {
  if (!config.ACTIVE) return

  console.log('confirmation box')
  // Remove any existing confirmation dialog
  const existingDialog = $.id('activity-confirmation-dialog');
  if (existingDialog) {
    existingDialog.remove();
  }

  let secondsLeft = config.CONFIRMATION_TIMEOUT / 1000 || 20;

  const $modal = $.div('', {
    id: 'activity-confirmation-dialog',
    style: `
      position: fixed;
      top: 0;
      left: 0;
      background-color: white;
      padding: 20px;
      z-index: 9999;
      font-family: monospace;
      text-align: center;
      border: 2px solid #000;
      color: #000;
      width: 300px;
      box-shadow: 0 0 10px #000;
    `
  })


  $modal.innerHTML = `
    <p style="font-family: monospace">Are you still there? This page will refresh in <span id="timeLeft">${secondsLeft}</span> seconds if no response is received.</p>
    <button style="font-family: monospace" id="stillHere" style="background-color: #ff00c7; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; margin-top: 10px;">Yes</button>
  `
  document.body.appendChild($modal)



  const countdownInterval = setInterval(() => {
    secondsLeft--;
    $.id('timeLeft').innerHTML = secondsLeft
    if (secondsLeft <= 0) {
      refreshSession()
    }
  }, 1000);

  // Add event listener to confirm button
  $.id('stillHere').addEventListener('click', () => {
    $modal.remove()
    clearInterval(countdownInterval)
    resetInactivityTimer()
  });

}












$ = (elem, prop, value) => elem.style[prop] = value


$.cls = (selector, elem=document) => Array.isArray(elem)
  ? elem.map(e => $.cls(e, selector)).flat()
  : Array.from(elem.getElementsByClassName(selector))

$.id = (selector, elem=document) => Array.isArray(elem)
  ? elem.find(e => $.id(e, selector))
  : elem.getElementById(selector)


$.render = (e, children) => {
  if (!children) return
  else if (typeof children === 'string') e.innerHTML = children
  else if (Array.isArray(children)) {
    if (typeof children[0] === 'string') {
      children.forEach(child => {
        e.innerHTML += (
          typeof child === 'string' ? child : child.outerHTML
        )
      })
    } else {
      e.append(...children.flat())
    }
  }
  else {
    e.append(children)
  }
}


$.create = elType => (children, attrs={}) => {
  const e = document.createElement(elType)
  $.render(e, children)

  Object.keys(attrs).forEach(a => {
    e.setAttribute(a, attrs[a])
  })

  return e
}

$.a = $.create('a')
$.li = $.create('li')
$.div = $.create('div')
$.span = $.create('span')
$.main = $.create('main')
$.section = $.create('section')
$.button = $.create('button')


const $html = document.getElementsByTagName('html')[0]
