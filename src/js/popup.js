var BG = chrome.extension.getBackgroundPage();

var NOTIFICATION_TYPES = {
  "ArticleCommentMentionNotification"  : 'fa fa-at',
  "ArticleCommentNotification"         : 'fa fa-comment-o',
  "ArticleCommentReactionNotification" : 'fa fa-smile-o',
  "ArticleMentionNotification"         : 'fa fa-at',
  "ArticleReactionNotification"        : 'fa fa-smile-o',
  "ArticleReferenceNotification"       : 'fa fa-link',
  "IssueCommentMentionNotification"    : 'fa fa-at',
  "IssueCommentNotification"           : 'fa fa-comment-o',
  "IssueCommentReactionNotification"   : 'fa fa-smile-o',
  "IssueMentionNotification"           : 'fa fa-at',
  "IssueReactionNotification"          : 'fa fa-smile-o',
  "PageMentionNotification"            : 'fa fa-at'
};

$(window).on('load', function () {
  var $nav = $('body > header nav');

  var $a = $('<a/>', {
    id    : 'close',
    class : 'fa fa-close',
    href  : '#',
    title : 'Close'
  }).click(function () {
    hidePopup();
    return false;
  }).prependTo($nav);

  $('h1').css({
    cursor : 'pointer'
  }).on('click', function () {
    openWindow(BG.WHN.NOTIFICATIONS_URL, false);
  });
});

$(document).on('click', 'article a', function (event) {
  event.preventDefault();
  event.stopPropagation();
  if ($(this).attr('href') == 'options.html') {
    openWindow($(this).attr('href'), false);
  } else {
    openWindow($(this).attr('href'), true);
  }
  return false;
});

$(document).on('click', 'article li.notification', function (event) {
  openWindow($(this).attr('data-url'), true);
});

function updateBadge() {
  $('#unread').empty().append(BG.WHN.unreads.length ? '(' + BG.WHN.unreads.length + ')' : '');
}

function loadNotifications() {
  $('#loading').show();

  updateBadge();

  var $article = $('article');
  $('ul', $article).remove();

  BG.WHN.getNotifications(false, function (notes) {
    if (notes === null) {
      var msg = chrome.i18n.getMessage('must_be_invalid_token');
      $('<ul/>').appendTo($article).append('<li>' + msg + '</li>');
      $('#loading').hide();
      return;
    }
    if (!notes.length) {
      var msg = chrome.i18n.getMessage('no_notifications');
      $('<ul/>').appendTo($article).append('<li>' + msg + '</li>');
      $('#loading').hide();
      return;
    }

    var $ul = $('<ul/>').appendTo($article);

    notes.forEach(function (note) {
      addOneNotificationToList(note, $ul);
    });

    $('#loading').hide();
  });
}

function addOneNotificationToList(note, $ul) {
  var $li = $('<li/>', {
    class      : 'notification',
    'data-url' : note.url
  }).appendTo($ul);

  if ($.inArray(note.id, BG.WHN.unreads) !== -1) {
    $li.addClass('unread');
  }

  if (NOTIFICATION_TYPES[note.type]) {
    var $div = $('<div/>', {
      class : NOTIFICATION_TYPES[note.type]
    }).append('<div/>').appendTo($li);
  }

  $('<img/>', {
    src : note.sender.image_url
  }).appendTo($li);

  var time = new Date(note.created_at);
  $('<a/>', {
    class : 'datetime',
    href  : note.url,
    title : note.url
  }).append(time.toString()).appendTo($li).wrap('<div/>');

  var $info = $('<div/>');
  var url = BG.WHN.HOME_URL + '@' + note.sender.name;
  $('<a/>', {
    class : 'sender',
    href  : url,
    title : url
  }).append(note.sender.name).appendTo($info);

  $info.append('@');

  url = 'https://' + note.community.domain_name + '.' + BG.WHN.HOME_URL.replace(/^https:\/\//, '');
  $('<a/>', {
    class : 'community',
    href  : url,
    title : url
  }).append(note.community.name).appendTo($info);

  $info.appendTo($li);

  $('<div/>').addClass('title').html(note.title).appendTo($li);

  $('<div/>').addClass('clear').appendTo($li);
}

function openWindow(url, background) {
  chrome.tabs.create({
    url      : url,
    selected : !background
  });
}

function hidePopup() {
  window.close();
}

$(function () {
  $('.need2translate').each(function () {
    $this = $(this);
    var translated = $this.html().replace(/__MSG_(.+)__/g, function (m, key) {
      return chrome.i18n.getMessage(key);
    });
    $this.html(translated);
  });

  loadNotifications();
});

$(window).on('unload', function () {
  BG.WHN.init(function () {});
});
