var priceUtils = document.createElement('script');
priceUtils.src = chrome.runtime.getURL('js/priceutils.script.js');
(document.head || document.documentElement).appendChild(priceUtils);
priceUtils.onload = function () {
  priceUtils.parentNode.removeChild(priceUtils);
};

var sGen = document.createElement('script');
sGen.src = chrome.runtime.getURL('js/lang/_gen.js');
(document.head || document.documentElement).appendChild(sGen);
sGen.onload = function () {
  sGen.parentNode.removeChild(sGen);
};

var sGlobal = document.createElement('script');
sGlobal.src = chrome.runtime.getURL('js/steam/global.js');
(document.head || document.documentElement).appendChild(sGlobal);
sGlobal.onload = function () {
  sGlobal.parentNode.removeChild(sGlobal);
};

var cssPQ = document.createElement('link');
cssPQ.href = chrome.runtime.getURL('css/priceQueue.css');
cssPQ.rel = 'stylesheet';
cssPQ.type = 'text/css';
(document.head || document.documentElement).appendChild(cssPQ);

chrome.storage.sync.get({
  currency: '',
  quickaccept: false,
  quickacceptprompt: true,
  quickrefuse: false,
  quickrefuseprompt: true,
  qadelay: 10,
  qrdelay: 10,
  gpdelayscc: 3000,
  gpdelayerr: 30000,
  agp_hover: true,
  agp_gem: false,
  agp_sticker: true,
  lang: '',
  apikey: ''
}, function (items) {
  var actualCode = [
    `window.quickaccept = ${items.quickaccept};`,
    `window.quickacceptprompt = ${items.quickacceptprompt};`,
    `window.quickrefuse = ${items.quickrefuse};`,
    `window.quickrefuseprompt = ${items.quickrefuseprompt};`,
    `window.qadelay = ${items.qadelay};`,
    `window.qrdelay = ${items.qrdelay};`,
    `window.currency = '${items.currency}';`,
    `window.gpdelayscc = ${items.gpdelayscc};`,
    `window.gpdelayerr = ${items.gpdelayerr};`,
    `window.agp_gem = ${items.agp_gem};`,
    `window.agp_sticker = ${items.agp_sticker};`,
    `window.SIHID = '${chrome.runtime.id}';`,
    `window._apikey = '${items.apikey}';`
  ].join('\r\n');
  var scriptOpt = document.createElement('script');
  scriptOpt.textContent = actualCode;
  (document.head || document.documentElement).appendChild(scriptOpt);
  scriptOpt.onload = function () {
    scriptOpt.parentNode.removeChild(scriptOpt);
  }

  const detectUserLanguage = () => {
    let navLang;
    if (window.navigator.languages && window.navigator.languages.length > 0) {
      [navLang] = window.navigator.languages;
    }
    if (!navLang) {
      navLang = window.navigator.language || window.navigator.userLanguage || '';
    }

    const VALID_LANGUAGES = [
      'bg', 'cs', 'de', 'en', 'es', 'fr', 'it', 'ka', 'lv', 'no', 'pl', 'pt',
      'ro', 'ru', 'sv', 'tr', 'vi', 'uk', 'zh', 'zh-CN', 'zh-TW'
    ];
    return (VALID_LANGUAGES.includes(navLang)) ? navLang : 'en';
  }
  items.lang = items.lang || detectUserLanguage();

  var sLang = document.createElement('script');
  if (items.lang == '') {
    sLang.src = chrome.runtime.getURL('js/lang/' + chrome.i18n.getMessage("langcode") + '.js');
  } else {
    sLang.src = chrome.runtime.getURL('js/lang/' + items.lang + '.js');
  }

  (document.head || document.documentElement).appendChild(sLang);
  sLang.onload = function () {
    sLang.parentNode.removeChild(sLang);
  };
});

var cssF = document.createElement('link');
cssF.href = chrome.runtime.getURL('css/inventscript.css');
cssF.rel = 'stylesheet';
cssF.type = 'text/css';
(document.head || document.documentElement).appendChild(cssF);

cssF = document.createElement('link');
cssF.href = chrome.runtime.getURL('css/tradeoffer.css');
cssF.rel = 'stylesheet';
cssF.type = 'text/css';
(document.head || document.documentElement).appendChild(cssF);

var sPriceQueue = document.createElement('script');
sPriceQueue.src = chrome.runtime.getURL('js/PriceQueue.js');
(document.head || document.documentElement).appendChild(sPriceQueue);
sPriceQueue.onload = function () {
  var sCommon = document.createElement('script');
  sCommon.src = chrome.runtime.getURL('js/hovermod.script.js');
  (document.head || document.documentElement).appendChild(sCommon);
  sCommon.onload = function () {
    var sOffer = document.createElement('script');
    sOffer.src = chrome.runtime.getURL('js/tradeofferrev.script.js');
    (document.head || document.documentElement).appendChild(sOffer);
    sOffer.onload = function () {
      sOffer.parentNode.removeChild(sOffer);
    };
    sCommon.parentNode.removeChild(sCommon);
  };

  sPriceQueue.parentNode.removeChild(sPriceQueue);
};
