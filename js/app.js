(function () {
  const $ = selector => document.querySelector(selector)

  const tokenKey = 'token'
  let token = localStorage.getItem(tokenKey)
  const gistKey = 'gist'
  let gist = localStorage.getItem(gistKey)
  const myURLsKey = 'myURLs'
  let myURLs = parseJSON(localStorage.getItem(myURLsKey)) || []

  const $settingsBtn = $('#settingsBtn')
  const $settingsDialog = $('#settingsDialog')
  const $settingsForm = $('#settingsForm')
  const $tokenInput = $('#tokenInput')
  const $gistHashInput = $('#gistHashInput')
  const $saveSettingsBtn = $('#saveSettingsBtn')
  const $cancelSettingsBtn = $('#cancelSettingsBtn')

  const $addURLBtn = $('#addURLBtn')
  const $urlDialog = $('#urlDialog')
  const $addEdit = $('#addEdit')
  const $urlForm = $('#urlForm')
  const $urlId = $('#urlId')
  const $urlInput = $('#urlInput')
  const $titleInput = $('#titleInput')
  const $loadingAddURL = $('#loadingAddURL')
  const $saveURLBtn = $('#saveURLBtn')
  const $cancelURLBtn = $('#cancelURLBtn')

  const $deleteDialog = $('#deleteDialog')
  const $deleteYes = $('#deleteYes')
  const $deleteNo = $('#deleteNo')
  const $deleteItem = $('#deleteItem')

  const $mainContainer = $('#mainContainer')
  const $loadingURLs = $('#loadingURLs')
  const $searchInput = $('#searchInput')
  const $urlList = $('#urlList')
  const $snackbar = $('#snackbar')

  let lastScrollTop = 0

  init()

  $settingsBtn.addEventListener('click', showSettingsDialog)
  $settingsForm.addEventListener('submit', saveSettingsHandler)
  $saveSettingsBtn.addEventListener('click', saveSettingsHandler)
  $cancelSettingsBtn.addEventListener('click', hideSettingsDialog)

  $addURLBtn.addEventListener('click', showURLDialog)
  $urlForm.addEventListener('submit', saveURLHandler)
  $saveURLBtn.addEventListener('click', saveURLHandler)
  $cancelURLBtn.addEventListener('click', hideURLDialog)
  $urlInput.addEventListener('change', urlInputHandler)

  $mainContainer.addEventListener('scroll', scrollHandler, false)
  $searchInput.addEventListener('keyup', searchHandler)
  document.addEventListener('click', clickHandler)

  $deleteYes.addEventListener('click', deleteYesHandler)
  $deleteNo.addEventListener('click', deleteNoHandler)

  function init () {
    const url = location.search.split('=').pop()
    if (isValidURL(url)) {
      fetch(corsAnywhere(url))
      .then(res => res.text())
      .then(str => (new window.DOMParser()).parseFromString(str, 'text/html'))
      .then(({ title }) => saveURL({ url, title, id: getId(), timestamp: Date.now() }))
      .catch(console.error)
    }
    if (!$settingsDialog.showModal) {
      dialogPolyfill.registerDialog($settingsDialog)
      dialogPolyfill.registerDialog($urlDialog)
      dialogPolyfill.registerDialog($deleteDialog)
    }

    $tokenInput.value = token
    $gistHashInput.value = gist

    syncMyURLs()
  }

  function scrollHandler () {
    var st = $mainContainer.scrollTop
    var diff = st - lastScrollTop
    if (Math.abs(diff) < 140) return
    (st > lastScrollTop ? hideElement : showElement)($addURLBtn)
    lastScrollTop = st
  }

  function hideElement ($el) {
    setTimeout(() => $el.classList.add('hidden'), 500)
    $el.classList.add('visually-hidden')
  }

  function showElement ($el) {
    $el.classList.remove('hidden')
    setTimeout(() => $el.classList.remove('visually-hidden'), 10)
  }

  function searchHandler () {
    const elements = [...$urlList.children]
    const query = $searchInput.value.trim().toLowerCase()

    if (query.length < 2) {
      elements.forEach($el => {
        $el.style.display = ''
      })
      return
    }

    elements.forEach($el => {
      const text = $el.innerText.replace(/\n|more_vert/g, '').toLowerCase()

      $el.style.display = fuzzySearch(query, text) ? '' : 'none'
    })
  }

  // source: https://github.com/bevacqua/fuzzysearch
  function fuzzySearch (needle, haystack) {
    const hlen = haystack.length
    const nlen = needle.length
    if (nlen > hlen) {
      return false
    }
    if (nlen === hlen) {
      return needle === haystack
    }
    outer: for (var i = 0, j = 0; i < nlen; i++) {
      const nch = needle.charCodeAt(i)
      while (j < hlen) {
        if (haystack.charCodeAt(j++) === nch) {
          continue outer
        }
      }
      return false
    }
    return true
  }

  function deleteYesHandler () {
    const id = $deleteItem.dataset.deleteid
    const $li = $('#' + id)
    hideElement($li)
    $deleteDialog.close()
    $li.remove()

    myURLs.forEach((data, i) => data.id === id && myURLs.splice(i, 1))

    localStorage.setItem(myURLsKey, JSON.stringify(myURLs))
    uploadMyURLs()
  }

  function deleteNoHandler () {
    $deleteDialog.close()
  }

  function clickHandler (e) {
    const id = e.target.parentElement.dataset.id
    if (id) {
      const $li = $('#' + e.target.parentElement.dataset.id)
      const action = e.target.dataset.action
      const title = $li.querySelector('.item-title').innerText
      if (action === 'edit') {
        $addEdit.innerText = 'Update'
        $urlId.value = id
        $titleInput.value = title
        $urlInput.value = $li.querySelector('.item-url').innerText
        fixMDLInput($urlInput)
        fixMDLInput($titleInput)
        $urlDialog.showModal()
      } else if (action === 'delete') {
        $deleteItem.innerText = title
        $deleteItem.dataset.deleteid = id
        $deleteDialog.show()
      }
    }
  }

  function saveSettingsHandler () {
    if ($settingsForm.checkValidity()) {
      token = $tokenInput.value
      gist = $gistHashInput.value
      localStorage.setItem(tokenKey, token)
      localStorage.setItem(gistKey, gist)
      hideSettingsDialog()
      syncMyURLs()
    }
  }

  function showSettingsDialog () {
    $saveURLBtn.disabled = true
    $settingsDialog.showModal()
    fixMDLInput($tokenInput)
    fixMDLInput($gistHashInput)
  }

  function hideSettingsDialog () {
    $settingsDialog.close()
  }

  function urlInputHandler (e) {
    const url = $urlInput.value
    if (!isValidURL(url)) return

    $loadingAddURL.style.display = 'block'
    $saveURLBtn.disabled = true
    fetch(corsAnywhere(url))
    .then(res => res.text())
    .then(str => (new window.DOMParser()).parseFromString(str, 'text/html'))
    .then(({ title }) => updateTitle(title))
    .catch(err => {
      updateTitle()
      console.error(err)
    })
  }

  function isValidURL (url) {
    return /^https?:\/\/\w+\.\w+.+$/.test(url)
  }

  function corsAnywhere (url) {
    return 'https://cors-anywhere.herokuapp.com/' + url
  }

  function updateTitle (title) {
    $titleInput.value = $titleInput.value || title || $urlInput.value
    fixMDLInput($titleInput)
    $loadingAddURL.style.display = 'none'
    $saveURLBtn.disabled = $titleInput.disabled = false
  }

  function fixMDLInput ($input) {
    $input.parentElement.MaterialTextfield.checkDirty()
    $input.parentElement.MaterialTextfield.checkValidity()
  }

  function saveURLHandler () {
    if ($urlForm.checkValidity()) {
      const data = {}

      for (let i = 0, l = $urlForm.length; i < l; ++i) {
        const input = $urlForm[i]
        if (input.name) data[input.name] = input.value
      }

      data.timestamp = Date.now()

      if (data.id) {
        myURLs.forEach((d, i) => {
          if (d.id === data.id) myURLs[i] = data
        })

        $('#' + data.id).replaceWith(generateListItem(data))

        syncMyURLs()
      } else {
        data.id = getId()
        saveURL(data)
      }

      componentHandler.upgradeAllRegistered()

      hideURLDialog()
    }
  }

  function saveURL (urlObj) {
    let exists = false
    let i = myURLs.length

    while (i--) {
      if (myURLs[i].url === urlObj.url) {
        exists = true
        showSnackbar('URL already exists.')
        break
      }
    }

    if (!exists) {
      myURLs.push(urlObj)
      $urlList.prepend(generateListItem(urlObj))

      syncMyURLs()
    }
  }

  function hideURLDialog () {
    $addEdit.innerText = 'Add'
    $urlDialog.close()
    $urlForm.reset()
  }

  function showURLDialog () {
    $saveURLBtn.disabled = $titleInput.disabled = true
    $urlDialog.showModal()
  }

  function parseJSON (str) {
    try {
      return JSON.parse(str)
    } catch (e) {
      return null
    }
  }

  function getId () {
    const array = new Uint32Array(1)
    window.crypto.getRandomValues(array)
    return 'url' + array[0]
  }

  function generateListItem (url) {
    return Object.assign(document.createElement('li'), {
      id: url.id,
      classList: 'mdl-list__item mdl-list__item--two-line',
      innerHTML: `<a href="${url.url}" target="_blank" class="mdl-list__item-primary-content custom-item">
        <img src="https://www.google.com/s2/favicons?domain_url=${url.url}" />
        <span class="item-title" title="${url.title}">${url.title}</span>
        <span title="${url.url}" class="item-url mdl-list__item-sub-title">${url.url}</span>
      </a>
      <span class="mdl-list__item-secondary-action">
        <button class="android-more-button mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect" id="urlMenu${url.id}" title="Menu">
          <svg style="width:24px;height:24px" viewBox="0 0 24 24">
          <path fill="#424242" d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z" />
          </svg>
        </button>
        <ul class="mdl-menu mdl-js-menu mdl-menu--bottom-left mdl-js-ripple-effect" for="urlMenu${url.id}" data-id="${url.id}">
          <li data-action="edit" class="mdl-menu__item">Edit</li>
          <li data-action="delete" class="mdl-menu__item">Delete</li>
        </ul>
      </span>`
    })
  }

  function renderMyURLs () {
    $urlList.innerHTML = ''
    myURLs.forEach(data => $urlList.prepend(generateListItem(data)))
    componentHandler.upgradeAllRegistered()
    $loadingURLs.style.display = 'none'
  }

  function syncMyURLs () {
    if (!token || !gist) {
      renderMyURLs()
      localStorage.setItem(myURLsKey, JSON.stringify(myURLs))
      return
    } else if (myURLs.length) {
      renderMyURLs()
    }

    fetch('https://api.github.com/gists/' + gist, {
      headers: {
        Authorization: 'token ' + token
      }
    })
    .then(res => res.json())
    .then(json => {
      const remoteURLs = parseJSON(json.files.myurls.content) || []
      myURLs = mergeArrays('url', myURLs, remoteURLs)
      renderMyURLs()
      localStorage.setItem(myURLsKey, JSON.stringify(myURLs))
      uploadMyURLs()
    })
    .catch(err => {
      renderMyURLs()
      localStorage.setItem(myURLsKey, JSON.stringify(myURLs))

      showSnackbar()
      console.error(err)
    })
  }

  function showSnackbar (message, actionText, time, actionHandler) {
    $snackbar.MaterialSnackbar.showSnackbar({
      message: message || 'Could not sync with gist. Pelease provide the correct token and gist.',
      actionHandler: actionHandler || function () { $snackbar.MaterialSnackbar.cleanup_() },
      actionText: actionText || 'OK',
      timeout: time || 4000
    })
  }

  function uploadMyURLs () {
    const request = new XMLHttpRequest()
    request.open('PATCH', 'https://api.github.com/gists/' + gist, false)
    request.setRequestHeader('Content-type', 'application/json')
    request.setRequestHeader('Authorization', 'token ' + token)
    request.onreadystatechange = e => {  
      if (request.readyState === 4 && request.status !== 200) showSnackbar()
    }
  
    request.send(JSON.stringify({
      description: 'Gist for https://myurls.github.io',
      files: {
        myurls: {
          content: JSON.stringify(myURLs)
        }
      }
    }))
  }

  function mergeArrays (keyName) {
    const index = {}
    let i = 0
    let len = 0
    const merge = []
    let arr
    let name

    for (var j = 1; j < arguments.length; j++) {
      arr = arguments[j]
      for (i = 0, len = arr.length; i < len; i++) {
        name = arr[i][keyName]
        if ((typeof name !== 'undefined') && !(name in index)) {
          index[name] = true
          merge.push(arr[i])
        }
      }
    }

    return merge
  }
})()
