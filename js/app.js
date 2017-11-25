(function () {
  const $ = selector => document.querySelector(selector)

  const tokenKey = 'token'
  const token = localStorage.getItem(tokenKey)
  const myURLsKey = 'myURLs'
  const myURLs = parseJSON(localStorage.getItem(myURLsKey)) || []

  const $settingsBtn = $('#settingsBtn')
  const $settingsDialog = $('#settingsDialog')
  const $settingsForm = $('#settingsForm')
  const $saveSettingsBtn = $('#saveSettingsBtn')
  const $cancelSettingsBtn = $('#cancelSettingsBtn')

  const $addURLBtn = $('#addURLBtn')
  const $urlDialog = $('#urlDialog')
  const $addEdit = $('#addEdit')
  const $urlForm = $('#urlForm')
  const $tokenInput = $('#tokenInput')
  const $saveURLBtn = $('#saveURLBtn')
  const $cancelURLBtn = $('#cancelURLBtn')

  init()

  $settingsBtn.addEventListener('click', () => $settingsDialog.showModal())
  $settingsForm.addEventListener('submit', saveSettings)
  $saveSettingsBtn.addEventListener('click', saveSettings)
  $cancelSettingsBtn.addEventListener('click', hideSettingsDialog)

  $addURLBtn.addEventListener('click', () => $urlDialog.showModal())
  $urlForm.addEventListener('submit', saveURL)
  $saveURLBtn.addEventListener('click', saveURL)
  $cancelURLBtn.addEventListener('click', hideURLDialog)

  function init () {
    $tokenInput.value = token
  }

  function saveSettings () {
    if ($settingsForm.checkValidity()) {
      localStorage.setItem(tokenKey, $tokenInput.value)
      hideSettingsDialog()
    }
  }

  function hideSettingsDialog () {
    $settingsDialog.close()
  }

  function saveURL () {
    if ($urlForm.checkValidity()) {
      const data = {}

      for (let i = 0, l = $urlForm.length; i < l; ++i) {
        const input = $urlForm[i]
        if (input.name) data[input.name] = input.value
      }

      data.timestamp = Date.now()

      if (data.id) {
        let i = myURLs.length
        while (i--) {
          if (myURLs[i].id === data.id) myURLs[i] = data
        }
      } else {
        data.id = getId()
        myURLs.push(data)
      }

      localStorage.setItem(myURLsKey, JSON.stringify(myURLs))
      hideURLDialog()
    }
  }

  function hideURLDialog () {
    $urlDialog.close()
    $urlForm.reset()
  }

  function parseJSON (str) {
    try {
        return JSON.parse(str)
    } catch(e) {
        return null;
    }
  }

  function getId () {
    const array = new Uint32Array(1)
    window.crypto.getRandomValues(array)
    return array[0]
  }
})()
