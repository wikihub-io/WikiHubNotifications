function WikiHubNotifications() {
  this.timer   = null;
  this.unreads = [];
  this.token   = null;
}

WikiHubNotifications.prototype = {
  HOME_URL          : 'https://wikihub.io/',
  NOTIFICATIONS_URL : 'https://wikihub.io/notifications',

  API_BASE_URL      : 'https://wikihub.io',
  API_NOTIFICATIONS : '/api/v1/notifications',

  TIMER_INTERVAL : 30 * 1000, // 30s

  init : function (callback) {
    var self = this;

    if (self.timer) {
      clearTimeout(self.timer);
      self.timer = null;
    }

    var popup = chrome.extension.getViews({type: 'popup'})[0];
    if (popup && !callback) {
      self.timer = setTimeout(function() {
        self.init.call(self);
      }, self.TIMER_INTERVAL);
      return;
    }

    self.getNotifications(true, function (notes) {
      if (notes !== null) {
        self.unreads = [];
        notes.forEach(function (note) {
          self.unreads.push(note.id);
        });
        self.updateBadge();
        self.timer = setTimeout(function() {
          self.init.call(self);
        }, self.TIMER_INTERVAL);
      } else {
        chrome.browserAction.setBadgeBackgroundColor({color : [255, 0, 0, 255]});
        chrome.browserAction.setBadgeText({text : 'X'});
      }
      if (typeof callback == 'function') callback();
    });
  },

  updateBadge : function() {
    var self = this;

    chrome.browserAction.setBadgeBackgroundColor({color : [0, 152, 204, 255]});
    if (self.unreads.length) {
      chrome.browserAction.setBadgeText({text : '' + self.unreads.length});
    }
    else {
      chrome.browserAction.setBadgeText({text : ''});
    }
  },

  getNotifications : function (unread, callback) {
    var self = this;

    var url = self.API_BASE_URL + self.API_NOTIFICATIONS;
    if (unread) {
      url += '?' + $.param({
          unread : '1'
      });
    }

    $.ajax({
      type     : 'GET',
      url      : url,
      dataType : 'json',
      success  : function (data, textStatus, jqXHR) {
        callback(data);
      },
      error    : function (jqXHR, textStatus, errorThrown) {
        callback(null);
      },
      headers  : {
        'Authorization' : 'Bearer ' + self.token
      }
    });
  }
};

var WHN = new WikiHubNotifications();

$(function () {
  if (!localStorage.getItem('token')) {
    chrome.tabs.create({url: "options.html"});
    return;
  }
  WHN.token = localStorage.getItem('token');
  WHN.init();
});
