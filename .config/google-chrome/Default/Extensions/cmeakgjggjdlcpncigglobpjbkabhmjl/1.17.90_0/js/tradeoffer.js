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

var sHelper = document.createElement('script');
sHelper.src = chrome.runtime.getURL('js/helper.js');
(document.head || document.documentElement).appendChild(sHelper);
sHelper.onload = function () {
  sHelper.parentNode.removeChild(sHelper);
};

var cssFontello = document.createElement('link');
cssFontello.href = chrome.runtime.getURL('css/fontello.css');
cssFontello.rel = 'stylesheet';
cssFontello.type = 'text/css';
(document.head || document.documentElement).appendChild(cssFontello);

var cssPQ = document.createElement('link');
cssPQ.href = chrome.runtime.getURL('css/priceQueue.css');
cssPQ.rel = 'stylesheet';
cssPQ.type = 'text/css';
(document.head || document.documentElement).appendChild(cssPQ);

var sKnifePhaseDetector = document.createElement('script');
sKnifePhaseDetector.src = chrome.runtime.getURL('js/knifephasedetector.script.js');
(document.head || document.documentElement).appendChild(sKnifePhaseDetector);
sKnifePhaseDetector.onload = function () {
  sKnifePhaseDetector.parentNode.removeChild(sKnifePhaseDetector);

  var sInventoryItemRarity = document.createElement('script');
  sInventoryItemRarity.src = chrome.runtime.getURL('js/inventoryitemrarity.script.js');
  (document.head || document.documentElement).appendChild(sInventoryItemRarity);
  sInventoryItemRarity.onload = function () {
    sInventoryItemRarity.parentNode.removeChild(sInventoryItemRarity);
  };
};

var cssInventoryItemRarity = document.createElement('link');
cssInventoryItemRarity.href = chrome.runtime.getURL('css/colorizeinventoryitem.css');
cssInventoryItemRarity.rel = 'stylesheet';
cssInventoryItemRarity.type = 'text/css';
(document.head || document.documentElement).appendChild(cssInventoryItemRarity);

chrome.storage.sync.get({
  offerdelayinterval: 100,
  offerdelay: true,
  autocheckofferprice: true,
  currency: '',
  usevector: false,
  lang: '',
  gpdelayscc: 3000,
  gpdelayerr: 30000,
  agp_hover: true,
  agp_gem: false,
  agp_sticker: true,
  apikey: '',
  custombuttons: null,
  extprice: true,
  extbgcolor: '#0000FF',
  exttextcolor: '#FFFFFF',
  extcustom: [],
  userUrl: '//steamcommunity.com/my/',
  offertotalprice: false,
  show_inventory_rarity_color_tradeoffer: true,
  show_phase_color_tradeoffer: true
}, function (items) {
  // modStyle({extbgcolor: items.extbgcolor, exttextcolor: items.exttextcolor});
  if (items.custombuttons == null) {
    items.custombuttons = {
      "440": {
        "Keys": {"Type": "TF_T"},
        "Craft items": {"Type": "Craft Item"}
      },
      "570": {
        "Rares": {"Quality": "unique", "Rarity": "Rarity_Rare", "Type": "wearable"},
        "Keys": {"Type": "DOTA_WearableType_Treasure_Key"}
      },
      "730": {
        "Keys": {"Type": "CSGO_Tool_WeaponCase_KeyTag"}
      },
      "753": {
        "Trading cards": {"item_class": "item_class_2"}
      }
    };
  }
  //console.log(JSON.stringify(items.custombuttons));
  var actualCode = ['window.offerdelayinterval = ' + (items.offerdelayinterval || '100') + ';',
    'window.offerdelay = ' + (items.offerdelay || 'true') + ';',
    'window.autocheckofferprice = ' + items.autocheckofferprice + ';',
    'window.currency = \'' + items.currency + '\';',
    'window._apikey = \'' + items.apikey + '\';',
    'window.usevector = ' + items.usevector + ';',
    'window.takeButtonsJson = window.custombuttons = ' + JSON.stringify(items.custombuttons) + ';',
    'window.gpdelayscc = ' + items.gpdelayscc + ';',
    'window.gpdelayerr = ' + items.gpdelayerr + ';',
    'window.agp_gem = ' + items.agp_gem + ';',
    'window.agp_sticker = ' + items.agp_sticker + ';',
    'window.extprice = ' + items.extprice + ';',
    'window.extcustom = ' + items.extcustom.length + ';',
    'window.SIHID = \'' + chrome.runtime.id + '\';',
    'window.userUrl = \'' + items.userUrl + '\';',
    'window.userLanguage = \'' + items.lang + '\';',
    'window.offertotalprice = ' + items.offertotalprice + ';',
    'window.show_inventory_rarity_color_tradeoffer = ' + items.show_inventory_rarity_color_tradeoffer + ';',
    'window.show_phase_color_tradeoffer = ' + items.show_phase_color_tradeoffer + ';'
  ].join('\r\n');

  chrome.storage.local.get({
    bookmarks: []
  }, function (subitems) {
    var actualCode = [
      'window.bookmarkeditems = ' + (JSON.stringify(subitems.bookmarks)) + ';'
    ].join('\r\n');

    var scriptsub = document.createElement('script');
    scriptsub.textContent = actualCode;
    (document.head || document.documentElement).appendChild(scriptsub);
    scriptsub.parentNode.removeChild(scriptsub);
  });
  var scriptOpt = document.createElement('script');
  scriptOpt.textContent = actualCode;
  (document.head || document.documentElement).appendChild(scriptOpt);
  scriptOpt.parentNode.removeChild(scriptOpt);

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

var sTradeOffer = document.createElement('script');
sTradeOffer.src = chrome.runtime.getURL('js/siteExt/tradeOffer.bundle.js');
(document.head || document.documentElement).appendChild(sTradeOffer);
sTradeOffer.onload = function () {

  var sPriceQueue = document.createElement('script');
  sPriceQueue.src = chrome.runtime.getURL('js/PriceQueue.js');
  (document.head || document.documentElement).appendChild(sPriceQueue);
  sPriceQueue.onload = function () {
    var sCommon = document.createElement('script');
    sCommon.src = chrome.runtime.getURL('js/hovermod.script.js');
    (document.head || document.documentElement).appendChild(sCommon);
    sCommon.onload = function () {
      var sOffer = document.createElement('script');
      sOffer.src = chrome.runtime.getURL('js/tradeoffer.script.js');
      (document.head || document.documentElement).appendChild(sOffer);
      sOffer.onload = function () {
        sOffer.parentNode.removeChild(sOffer);
      };
      sCommon.parentNode.removeChild(sCommon);
    };
    sPriceQueue.parentNode.removeChild(sPriceQueue);
  };

  sTradeOffer.parentNode.removeChild(sTradeOffer);
}

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
