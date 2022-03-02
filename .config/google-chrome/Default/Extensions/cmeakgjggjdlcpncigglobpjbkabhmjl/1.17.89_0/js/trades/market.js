const marketService = function (ws_url, debug) {
  debug = debug || false;

  const toFormData = function (obj) {
    let out = [];
    for (let key in obj) {
      out.push(key + '=' + encodeURIComponent(obj[key]))
    }
    return out.join('&');
  };

  const toSteamId = function (accountId) {
    let b = BigInt(accountId);
    let b2 = BigInt('76561197960265728');
    return (b + b2).toString();
  };

  const toAccountId = function (steamId) {
    let b = BigInt(steamId);
    let b2 = BigInt('76561197960265728');
    return (b - b2).toString();
  };

  const RQ = {
    db: {},
    dbConf: {},

    /**
     *
     * @param name
     * @param {number} interval
     * @returns {boolean}
     */
    can: function (name, interval) {
      if (!this.db.hasOwnProperty(name)) {
        this.db[name] = Date.now();
        return true;
      }
      let diff = Date.now() - this.db[name];
      if (diff > interval) {
        this.db[name] = Date.now();
        return true;
      }
      return false;
    },
  };

  const logger = new (function (debug) {
    this.pool = [];
    const dateFormat = (date, fstr, utc) => {
      utc = utc ? 'getUTC' : 'get';
      return fstr.replace(/%[YmdHMS]/g, function (m) {
        switch (m) {
          case '%Y':
            return date[utc + 'FullYear'](); // no leading zeros required
          case '%m':
            m = 1 + date[utc + 'Month']();
            break;
          case '%d':
            m = date[utc + 'Date']();
            break;
          case '%H':
            m = date[utc + 'Hours']();
            break;
          case '%M':
            m = date[utc + 'Minutes']();
            break;
          case '%S':
            m = date[utc + 'Seconds']();
            break;
          default:
            return m.slice(1); // unknown code, remove %
        }
        // add leading zero if required
        return ('0' + m).slice(-2);
      });
    };
    const add = (args) => {
      if (debug) console.log.apply(null, args);
      let mess = [];
      for (let i = 0; i < args.length; i++) {
        args[i] = arguments[i];
        if ('string' !== typeof args[i]) {
          args[i] = JSON.stringify(args[i]);
        }
        mess.push(args[i]);
      }
      this.pool.push(dateFormat(new Date(), "%H:%M:%S", true) + ' ' + mess.join(' '));
      if (this.pool.length > 200) this.pool.splice(0, 1);
    };

    this.log = function () {
      add(arguments);
    };
    this.error = function () {
      add(arguments);
    };
  })(debug);

  const tryInterval = {
    cnt: {},
    get: function (key, arr) {
      if (!this.cnt.hasOwnProperty(key)) this.cnt[key] = 0;
      if (this.cnt[key] >= arr.length - 1) this.cnt[key] = arr.length - 1;
      return arr[this.cnt[key]++]
    },
    reset: function (key) {
      this.cnt[key] = 0
    }
  };

  const requestGetAsync = async function (url) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          return resolve(xhr.response);
        }
      };
      xhr.onerror = function (err) {
        return reject(err);
      };
      xhr.open('GET', url, true);
      xhr.send('');
    });
  };

  const requestGet = function (url, clb) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        return clb(xhr.response, null);
      }
    };
    xhr.onerror = function (err) {
      return clb(null, err);
    };
    xhr.open('GET', url, true);
    xhr.send('');
  };

  const WS = function (address) {
    this.connId = null;
    this.address = address;
    let needReconnect = true;
    let hookClb = null;
    let hookRedirect = (details) => {
      chrome.webRequest.onBeforeRedirect.removeListener(hookRedirect);
      if (!hookClb) return {};
      this.write('validateOpenIDSteamResponse', {link: details.redirectUrl}, function (res) {
        hookClb(res);
        hookClb = null;
      });
      return {};
    };

    const guid = function guid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      }

      return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };
    let socket;
    let poolEventsSub = {};
    let poolClb = {};

    const connect = () => {
      let pingInterval;
      let timeoutReconnect;
      let heartBeat = true;
      needReconnect = true;

      socket = new WebSocket(this.address);
      socket.onopen = (conn) => {
        this.emit('connect', conn);
        heartBeat = true;
        tryInterval.reset('ws_reconnect');
        pingInterval = setInterval(() => {
          if (heartBeat === false) {
            logger.error('heart beat problem');
            return socket.close(4001, 'heart beat problem');
          }
          try {
            socket.send('ping');
          } catch {
          }
          heartBeat = false;
        }, 15000);
      };
      socket.onclose = (event) => {
        logger.log('close WS connection');
        this.emit('close', event);
        this.connId = null;
        clearInterval(pingInterval);
        pingInterval = null;

        if (timeoutReconnect) {
          clearInterval(timeoutReconnect);
          timeoutReconnect = null;
        }
        if (needReconnect) {
          timeoutReconnect = setTimeout(connect, tryInterval.get('ws_reconnect', [2000, 3000, 5000, 15000, 30000, 40000, 60000]));
        }
      };
      socket.onerror = (error) => {
        logger.error(error);
        this.emit('error', error);
      };
      socket.onmessage = (event) => {
        try {
          if (event.data === 'pong') return heartBeat = true;

          let data = JSON.parse(event.data);
          if (data.e === 'auth ok') {
            this.isAuth = true;
            this.connId = data.d.cid;
            return this.emit('auth', this.connId);
          }
          if (data.hasOwnProperty('h')) {
            return poolClb[data.h](data.d);
          }
          if (data.hasOwnProperty('c')) {
            return this.emit(data.e, data.d, function (answer) {
              data.d = answer;
              socket.send(JSON.stringify(data));
            });
          }
          if (poolEventsSub.hasOwnProperty(data.e)) {
            return this.emit(data.e, data.d);
          }
        } catch (e) {
          logger.error(e);
        }
      };
    };

    this.connect = function () {
      if (this.isActive()) return;
      connect();
    };
    this.on = function (event, clb) {
      if (!poolEventsSub.hasOwnProperty(event)) poolEventsSub[event] = [];
      poolEventsSub[event].push(clb);
      return this;
    };
    this.close = function (code, mess) {
      needReconnect = false;
      if (socket && socket.readyState !== socket.CLOSED) {
        socket.close(code, mess);
      }
    };
    this.restart = function (code, mess) {
      if (socket && socket.readyState !== socket.CLOSED) {
        socket.close(code, mess);
      }
    };
    this.isActive = function () {
      return socket && (socket.readyState == socket.OPEN || socket.readyState == socket.CONNECTING);
    };
    this.isConnected = function () {
      return socket && socket.readyState == socket.OPEN;
    };
    this.emit = function (event, data, clb) {
      if (!poolEventsSub.hasOwnProperty(event)) return false;
      poolEventsSub[event].forEach((e, i) => {
        try {
          e(data, clb)
        } catch (e) {
          logger.log(e)
        }
      });
    };
    this.write = function (channel, data, clb) {
      try {
        var dToSend = {
          e: channel,
          d: data
        };
        if (typeof clb === "function") {
          dToSend.h = guid();
          poolClb[dToSend.h] = clb;
        }
        socket.send(JSON.stringify(dToSend));
      } catch (e) {
      }
      if (typeof clb === "function") {
      }
    };

    // методы
    this.authViaToken = function (projectId, token, clb) {
      if (clb) {
        this.write('authViaToken', {p: projectId, t: token}, function (answer) {
          if (typeof clb === "function") clb(answer);
        });
      } else {
        this.write('authViaToken', {p: projectId, t: token});
      }
    };
    this.authViaOpenID = function (clb) {
      let self = this;
      this.write('authSteam', {extension: true}, function (answer) {
        if (answer.success) {
          logger.log(answer.url)
          requestGet(answer.url, (data, err) => {
            if (err) {
              return clb({success: false, error: err.message})
            }
            // check auth
            let steamId = data.match(/steamId = false/i);
            if (steamId && steamId.hasOwnProperty(0)) {
              return clb({success: false, error: 'need auth'})
            }

            let el = document.createElement("div");
            el.innerHTML = data;
            let action = el.querySelector('#openidForm').getAttribute('action');
            let params = {};
            el.querySelectorAll('#openidForm input').forEach(function (item, i) {
              params[item.getAttribute('name')] = item.getAttribute('value');
            });
            hookClb = clb;
            setTimeout(() => {
              if (hookClb) {
                hookClb({success: false});
                hookClb = null;
              }
            }, 30000)

            chrome.webRequest.onBeforeRedirect.addListener(hookRedirect, {urls: ["https://steamcommunity.com/openid/login"]});
            let http = new XMLHttpRequest();
            http.open('POST', action, true);
            http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            http.send(toFormData(params));
          });
        }

      });
    }
    this.authViaJWT = function (token, clb) {
      this.write('authViaJWT', {t: token, extension: true}, answer => clb(answer));
    };
  };

  let communityURL = 'https://steamcommunity.com';
  let steamidSteam;
  let webSteamId;
  let on = true;
  let autoAcceptTrades = true;
  let needSteamAuth = true;
  let webApiKeyOk = false;
  let nickName = "";
  let ava = "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/b5/b5bd56c1aa4644a474a2e4972be27ef9e82e517e_full.jpg";


  const HANDLERS = {};
  HANDLERS['start'] = (req, sendResponse) => {
    logger.log('start');
    this.start();
    return sendResponse({
      success: true
    });
  };
  HANDLERS['checkInstall'] = function (req, sendResponse) {
    logger.log('checkInstall');
    return sendResponse({
      success: true
    });
  };
  HANDLERS['getLogs'] = function (req, sendResponse) {
    return sendResponse({success: true, data: logger.pool});
  };
  HANDLERS['getApiKey'] = function (req, sendResponse) {
    if (!RQ.can('getApiKey', 2000)) {
      return sendResponse({
        success: false,
        error: 429
      });
    }

    requestGet("https://steamcommunity.com/dev/apikey", (data, err) => {
      if (err) {
        logger.error('getApiKey: fail');
        return sendResponse({
          success: false,
          error: err.status,
          message: err.message,
          steamKey: null,
          steamId: null
        });
      }
      let el = document.createElement('div');
      el.innerHTML = data;
      var steamKey = el.querySelector('#bodyContents_ex').textContent.match(/: ([A-Z0-9]+)/);
      var steamId = data.match(/steamId = ["](\d+)["]/i);

      if (steamId && steamId.hasOwnProperty(1) && steamKey && steamKey.hasOwnProperty(1)) {
        logger.log('getApiKey: ok');
        webApiKeyOk = true;
        webSteamId = steamId[1];
        return sendResponse({
          success: true,
          steamKey: steamKey[1],
          steamId: steamId[1],
          needAuth: false
        });
      } else {
        steamId = $(data).text().match(/steamId = false/i);
        return sendResponse({
          success: false,
          steamKey: null,
          steamId: null,
          needAuth: (steamId && steamId.hasOwnProperty(0))
        });
      }
    });
  };
  HANDLERS['getTradeLink'] = function (req, sendResponse) {
    if (!RQ.can('getTradeLink', 2000)) {
      return sendResponse({
        success: false,
        error: 429
      });
    }
    if (!steamidSteam) {
      return sendResponse({
        success: false,
        message: "need auth"
      });
    }

    requestGet(`https://steamcommunity.com/profiles/${steamidSteam}/tradeoffers/privacy`, (data, err) => {
      if (err) {
        logger.error('getTradeLink: fail');
        return sendResponse({
          success: false,
          error: err.status,
          message: err.message,
        });
      }
      let el = document.createElement('div');
      el.innerHTML = data;
      var tradeOfferUrl = el.querySelector('#trade_offer_access_url').value;
      var steamId = data.match(/steamId = ["](\d+)["]/i);

      if (steamId && steamId.hasOwnProperty(1) && tradeOfferUrl) {
        logger.log('getApiKey: ok');
        return sendResponse({
          success: true,
          tradeOfferUrl: tradeOfferUrl,
          steamId: steamId[1]
        });
      } else {
        steamId = $(data).text().match(/steamId = false/i);
        return sendResponse({
          success: false,
          tradeOfferUrl: null,
          steamId: null,
          needAuth: (steamId && steamId.hasOwnProperty(0))
        });
      }
    });
  };
  HANDLERS['createOffer'] = function (req, sendResponse) {
    if (!RQ.can('createOffer', 3000)) {
      return sendResponse({
        success: false,
        error: 429
      });
    }

    let sId = null;
    requestGet(communityURL, function (data, err) {
      if (err) {
        logger.error('createOffer cant give sessionId');
        return sendResponse({
          success: false,
          error: 999
        });
      }
      // if diff more 10 sec ignore query
      if (req.hasOwnProperty('time') && req.time) {
        logger.log(req);
        let diff = Date.now() - diffTime - req.time;
        if (Math.abs(diff) > 10000) {
          return sendResponse({
            success: false,
            error: 408,
            message: "diff time more 10000ms " + diff
          });
        }
        logger.log('Create offer, diff time', diff);
      }
      let sId = data.match('g_sessionID = ["]([a-zA-Z0-9]+)["]')[1];
      if (!sId) {
        logger.error('cant give sessionId');
        return sendResponse({
          success: false,
          error: 999
        });
      }
      let postData = req.post;
      postData.sessionid = sId;

      let hookerHeaders = (details) => {
        let gotRef = false;
        for (let n in details.requestHeaders) {
          gotRef = details.requestHeaders[n].name.toLowerCase() == "referer";
          if (gotRef) {
            details.requestHeaders[n].value = "https://steamcommunity.com/tradeoffer/new/";
          }
        }
        if (!gotRef) {
          details.requestHeaders.push({name: "Referer", value: "https://steamcommunity.com/tradeoffer/new/"});
        }
        return {requestHeaders: details.requestHeaders};
      };
      chrome.webRequest.onBeforeSendHeaders.addListener(hookerHeaders, {urls: ['https://steamcommunity.com/*']}, ['requestHeaders', 'blocking', 'extraHeaders']);
      let xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://steamcommunity.com/tradeoffer/new/send', true);
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
      xhr.onload = function () {
        chrome.webRequest.onBeforeSendHeaders.removeListener(hookerHeaders);
        if (xhr.status === 200) {
          logger.log('createOffer: ok');
          return sendResponse({
            success: true,
            response: JSON.parse(xhr.responseText)
          });
        } else {
          logger.error('createOffer: fail', xhr.responseText);
          return sendResponse({
            success: false,
            error: xhr.responseText
          });
        }
      };
      xhr.send(toFormData(postData));
    });
  };
  HANDLERS['acceptOffer'] = function (req, sendResponse) {
    if (!RQ.can('acceptOffer', 3000)) {
      return sendResponse({
        success: false,
        error: 429,
        message: 'to many request'
      });
    }
    if (!autoAcceptTrades) return sendResponse({
      success: false,
      error: 400,
      message: 'off auto accept'
    });


    requestGet(communityURL, (data, err) => {
      if (err) {
        logger.error('acceptOffer cant give sessionId');
        return sendResponse({
          success: false,
          error: 999
        });
      }
      let sId = data.match('g_sessionID = ["]([a-zA-Z0-9]+)["]')[1];
      if (!sId) {
        logger.error('acceptOffer cant give sessionId');
        return sendResponse({
          success: false,
          error: 999
        });
      }
      if (req.hasOwnProperty('time') && req.time) {
        let diff = Date.now() - diffTime - req.time;
        if (Math.abs(diff) > 10000) {
          return sendResponse({
            success: false,
            error: 408,
            message: "diff time more 10000ms " + diff
          });
        }
        logger.log('acceptOffer, diff time', diff);
      }

      let postData = req.post;
      postData.sessionid = sId;
      let hookerHeaders = (details) => {
        let gotRef = false;
        for (let n in details.requestHeaders) {
          gotRef = details.requestHeaders[n].name.toLowerCase() == "referer";
          if (gotRef) {
            details.requestHeaders[n].value = "https://steamcommunity.com/tradeoffer/new/";
          }
        }
        if (!gotRef) {
          details.requestHeaders.push({name: "Referer", value: "https://steamcommunity.com/tradeoffer/new/"});
        }
        return {requestHeaders: details.requestHeaders};
      };
      chrome.webRequest.onBeforeSendHeaders.addListener(hookerHeaders, {urls: ["https://steamcommunity.com/*"]}, ['requestHeaders', 'blocking', 'extraHeaders']);

      let xhr = new XMLHttpRequest();
      xhr.open('POST', `https://steamcommunity.com/tradeoffer/${postData.tradeofferid}/accept`, true);
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
      xhr.onload = function () {
        chrome.webRequest.onBeforeSendHeaders.removeListener(hookerHeaders);
        if (xhr.status === 200) {
          logger.log('acceptOffer: ok');
          return sendResponse({
            success: true,
            response: xhr.responseText
          });
        } else {
          logger.error('acceptOffer: fail', xhr.responseText);
          return sendResponse({
            success: false,
            error: xhr.responseText
          });
        }
      };
      xhr.send(toFormData(postData));
    });
  };
  HANDLERS['getSteamId'] = function (req, sendResponse) {
    if (!RQ.can('getSteamId', 2000)) {
      return sendResponse({
        success: false,
        error: 429
      });
    }
    requestGet("https://steamcommunity.com/my/profiles/", function (data, err) {
      if (err) {
        logger.error('getSteamId fail');
        return sendResponse({
          success: false,
          steamId: null
        });
      }
      let el = document.createElement('div');
      el.innerHTML = data;
      let tmVar = el.querySelector('.playerAvatarAutoSizeInner img');
      if (tmVar) ava = tmVar.src;

      tmVar = el.querySelector('.actual_persona_name');
      if (tmVar) nickName = tmVar.textContent;

      let steamId = data.match(/steamId = ["](\d+)["]/i);
      if (steamId && steamId.hasOwnProperty(1)) {
        webSteamId = steamId[1];
        return sendResponse({
          success: true,
          steamId: steamId[1]
        });
      } else {
        steamId = data.match(/steamId = false/i);
        return sendResponse({
          success: false,
          steamId: null,
          needAuth: (steamId && steamId.hasOwnProperty(0))
        });
      }
    })
  };

  let lastCheckAuth = Date.now();
  let intervalCheckSteamAuth = false,
    authToken,
    diffTime = 0;

  // Соединяемся с вебсокетом
  const WSConnect = new WS(ws_url);
  WSConnect.on('connect', () => {
    if (authToken) {
      return WSConnect.authViaJWT(authToken, (res) => {
        authToken = "";
        if (!res || !res.success) {
          return setTimeout(WSConnect.restart, tryInterval.get('reconnect_authOpenId', [60000, 12000, 300000, 600000, 1200000]));
        }
        steamidSteam = res.steamID;
        diffTime = Date.now() - res.timestamp;
        logger.log('diff time:', diffTime)
      })
    }
    return WSConnect.authViaOpenID((res) => {
      if (!res || !res.success) {
        if (res.error === 'need auth') {
          return setTimeout(WSConnect.restart, tryInterval.get('reconnect_authOpenId', [60000, 12000, 300000, 600000, 1200000]));
        }
        return WSConnect.restart();
      }
      steamidSteam = res.steamID;
      diffTime = Date.now() - res.timestamp;
      logger.log('diff time:', diffTime)
    })
  });
  WSConnect.on('authToken', function (res) {
    authToken = res.t;
  });
  WSConnect.on('auth', function (connID) {
    logger.log('auth ok');
    if (!webApiKeyOk) {
      HANDLERS['getApiKey']({}, () => {
      });
    }

    // Проверяем раз в минуту что пользователь сидит под правильным аккаунтом
    lastCheckAuth = Date.now();
    const checkSteamAuth = function () {
      if (lastCheckAuth + 300000 < Date.now()) {
        logger.log('more 300s cant check auth');

        authToken = null;
        WSConnect.close(4002, 'more 300s cant check auth');
        return checkNeedStart();
      }
      HANDLERS.getSteamId({}, function (result) {
        if (result.needAuth) {
          logger.log('check auth: need auth');

          authToken = null;
          WSConnect.close(4002, 'need auth');
          return checkNeedStart();
        }
        // Если пользователь перелогинился в стиме то отключаемся
        if (result.success && result.steamId != steamidSteam) {
          logger.log('check auth: diff steamid');

          authToken = null;
          tryInterval.reset('need_start');
          WSConnect.close(4002, 'diff steamid');
          return checkNeedStart();
        } else if (result.success) {
          logger.log('check auth: ok');
          lastCheckAuth = Date.now();
          if (!WSConnect.isConnected()) WSConnect.connect();
        }
      });
    };
    if (intervalCheckSteamAuth) clearInterval(intervalCheckSteamAuth);
    intervalCheckSteamAuth = setInterval(checkSteamAuth, 60000);
  });
  WSConnect.on('getApiKey', function (data, answer) {
    return HANDLERS['getApiKey']({options: data}, function (result) {
      if (result && result.success && result.steamId == steamidSteam) {
        return answer({success: true, data: result.steamKey, steamId: result.steamId});
      }
      return answer({success: false});
    });
  });
  WSConnect.on('getSteamId', function (data, answer) {
    return HANDLERS['getSteamId']({options: data}, function (result) {
      if (result && result.success && result.steamId == steamidSteam) {
        return answer({success: true, data: result.steamKey, steamId: result.steamId});
      }
      return answer({success: false});
    });
  });
  WSConnect.on('getTradeLink', function (data, answer) {
    if (!answer) answer = function (res) {
    };
    return HANDLERS['getTradeLink'](data, answer);
  });
  WSConnect.on('getLogs', function (data, answer) {
    return HANDLERS['getLogs']({options: data}, function (result) {
      return answer(result);
    });
  });
  WSConnect.on('acceptOffer', function (data, answer) {
    if (!answer) answer = function (res) {
    };
    return HANDLERS['acceptOffer'](data, answer);
  });
  WSConnect.on('sendOffer', function (data, answer) {
    if (!answer) answer = function (res) {
    };
    return HANDLERS['createOffer'](data, answer);
  });
  WSConnect.on('recheckStart', function (data) {
    WSConnect.close(4002, 'recheck start');
    checkNeedStart();
  });
  WSConnect.on('close', function (data) {
    logger.log('ws closed', data.code, data.reason);
    if (intervalCheckSteamAuth) clearInterval(intervalCheckSteamAuth);
    steamidSteam = null;
  });

  let timeOutCheckNeedStart;
  const checkNeedStart = () => {
    if (timeOutCheckNeedStart) clearTimeout(timeOutCheckNeedStart);
    if (!on) return;

    HANDLERS.getSteamId({}, async (res) => {
      needSteamAuth = res.needAuth;
      if (!res.success || !res.steamId) {
        logger.log('checkNeedStart get steamid fail');
        timeOutCheckNeedStart = setTimeout(checkNeedStart, tryInterval.get('need_start', [5000, 60000, 60000, 60000, 180000, 300000]));
        return;
      }

      try {
        // check need auth
        let data = await requestGetAsync('https://market.csgo.com/api/cnds?id=' + res.steamId);
        data = JSON.parse(data);
        if (data && data.success) {
          logger.log('need auth ok');
          return WSConnect.connect();
        }
      } catch (e) {
        logger.error('error', e);
      }
      timeOutCheckNeedStart = setTimeout(checkNeedStart, tryInterval.get('need_start', [5000, 60000, 60000, 60000, 180000, 300000]));
    })
  };

  // WSConnect.connect();
  chrome.runtime.onConnectExternal.addListener(function (port) {
    port.onMessage.addListener(function (req) {
      // Ignore messages which are adressed to a listener from background.js
      if (req.hasOwnProperty('type')) {
        return true;
      }
      let sendResponse = function (data) {
        data.c = req.c;
        port.postMessage(data);
      };
      if (HANDLERS.hasOwnProperty(req.cmd)) {
        return HANDLERS[req.cmd](req, sendResponse);
      } else {
        return sendResponse({
          success: false,
          error: 404,
          message: 'unknown command'
        });
      }
    });
  });
  // =========================================
  // via content page
  chrome.runtime.onMessage.addListener(function (req, sender, handler) {
    // Ignore messages which are adressed to a listener from background.js
    if (req.hasOwnProperty('type')) {
      return true;
    }
    let sendResponse = function (data) {
      data.c = req.c;
      handler(data);
    };
    if (HANDLERS.hasOwnProperty(req.cmd)) {
      HANDLERS[req.cmd](req, sendResponse);
      return true;
    } else {
      sendResponse({
        success: false,
        error: 404,
        message: 'unknown command'
      });
      return true;
    }
  });

  this.start = () => {
    on = true;
    tryInterval.reset('need_start');
    checkNeedStart();
    return true;
  };

  this.stop = () => {
    on = false;
    WSConnect.close();
    return true;
  };

  this.isActive = () => {
    return on;
  };

  this.getAva = () => {
    return ava;
  };

  this.getNickName = () => {
    return nickName;
  };

  this.hasApiKey = () => {
    return webApiKeyOk;
  };

  this.getSteamId64 = () => {
    return webSteamId;
  };

  this.isConnected = () => {
    return WSConnect && WSConnect.isConnected();
  };

  this.needSteamAuth = () => {
    return needSteamAuth;
  }

  this.onAutoAcceptTrades = () => {
    autoAcceptTrades = true;
  }

  this.offAutoAcceptTrades = () => {
    autoAcceptTrades = false;
  }

  this.isAutoAcceptTrades = () => {
    return autoAcceptTrades;
  }
};
MRService = new marketService('wss://appws.dota2.net/', false);
// Start service
MRService.start();
