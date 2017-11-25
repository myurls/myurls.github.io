(function () {
  const $ = selector => document.querySelector(selector)

  const $settingsBtn = $('#settingsBtn')
  const $settingsDialog = $('#settingsDialog')
  const $settingsForm = $('#settingsForm')
  const $saveSettingsBtn = $('#saveSettingsBtn')
  const $cancelSettingsBtn = $('#cancelSettingsBtn')

  const $addBookmarkBtn = $('#addBookmarkBtn')
  const $bookmarkDialog = $('#bookmarkDialog')
  const $bookmarkForm = $('#bookmarkForm')
  const $saveBookmarkBtn = $('#saveBookmarkBtn')
  const $cancelBookmarkBtn = $('#cancelBookmarkBtn')

  $settingsBtn.addEventListener('click', () => $settingsDialog.showModal())
  $settingsForm.addEventListener('submit', saveSettings)
  $saveSettingsBtn.addEventListener('click', saveSettings)
  $cancelSettingsBtn.addEventListener('click', hideSettingsDialog)

  $addBookmarkBtn.addEventListener('click', () => $bookmarkDialog.showModal())
  $bookmarkForm.addEventListener('submit', saveBookmark)
  $saveBookmarkBtn.addEventListener('click', saveBookmark)
  $cancelBookmarkBtn.addEventListener('click', hideBookmarkDialog)

  function saveSettings () {
    if ($settingsForm.checkValidity()) {
      hideSettingsDialog()
    }
  }

  function hideSettingsDialog () {
    $settingsDialog.close()
    $settingsForm.reset()
  }

  function saveBookmark () {
    if ($bookmarkForm.checkValidity()) {
      hideBookmarkDialog()
    }
  }

  function hideBookmarkDialog () {
    $bookmarkDialog.close()
    $bookmarkForm.reset()
  }
})()
