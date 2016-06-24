var BG = chrome.extension.getBackgroundPage();

$(function () {
  $('.need2translate').each(function () {
    $this = $(this);
    var translated = $this.html().replace(/__MSG_(.+)__/g, function (m, key) {
      return chrome.i18n.getMessage(key);
    });
    $this.html(translated);
  });

  var manifest = chrome.runtime.getManifest();
  $('#version').html(manifest.version);

  var token = localStorage.getItem('token');
  if (token) {
    $('input[name="token"]').val(token);
  }

  $('#submit').css({
    cursor : 'pointer'
  }).on('click', function () {
    $('form').submit();
  });

  $('form').submit(function () {
    var $form = $(this);
    var $token = $('input[name="token"]', $form);
    var token = $.trim($token.val());
    if (token) {
      BG.WHN.token = token;
      BG.WHN.getNotifications(true, function (notes) {
        if (notes !== null) {
          localStorage.setItem('token', token);
          var msg = chrome.i18n.getMessage('valid_token');
          alert(msg);
          BG.WHN.init();
        } else {
          BG.WHN.token = localStorage.getItem('token');
          var msg = chrome.i18n.getMessage('invalid_token');
          alert(msg);
        }
      });
    }
    return false;
  });
});

