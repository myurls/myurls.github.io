(function () {
  const $ = selector => document.querySelector(selector)

  const tokenKey = 'token'
  const token = localStorage.getItem(tokenKey)
  const myURLsKey = 'myURLs'
  const myURLs = localStorage.getItem(myURLsKey)

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

      localStorage.setItem(myURLsKey, $tokenInput.value)
      hideURLDialog()
    }
  }

  function hideURLDialog () {
    $urlDialog.close()
    $urlForm.reset()
  }
})()
