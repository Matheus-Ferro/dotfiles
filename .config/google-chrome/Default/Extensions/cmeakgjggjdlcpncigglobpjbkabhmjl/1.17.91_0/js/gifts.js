var sGen = document.createElement('script');
sGen.src = chrome.runtime.getURL('js/lang/_gen.js');
(document.head || document.documentElement).appendChild(sGen);
sGen.onload = function () {
  sGen.parentNode.removeChild(sGen);
};

chrome.storage.sync.get({
  lang: ''
}, function (items) {

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

var script = document.createElement('script');
script.textContent = `window.SIHID = '${chrome.runtime.id}'`;
(document.head || document.documentElement).appendChild(script);
script.parentNode.removeChild(script);

var sOffer = document.createElement('script');
sOffer.src = chrome.runtime.getURL('js/gifts.script.js');
(document.head || document.documentElement).appendChild(sOffer);
sOffer.onload = function () {
  sOffer.parentNode.removeChild(sOffer);
};
