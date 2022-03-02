var imgExp = /\<img[^\>]+src="([^"]+)"([^\>])*\>/g;
var checkFloatURL = 'https://beta.glws.org/#';
const groupsExp = /^steam:\/\/rungame\/730\/\d+\/[+ ]csgo_econ_action_preview ([SM])(\d+)A(\d+)D(\d+)$/;
const floatData = {};
const floatQueue = [];
let SIH_State = [false, false];

const SIH_BUY = 0, SIH_SELL = 1;

const g_exterior = {
  "Factory new": {
    min: 0.00,
    max: 0.07
  },
  "Minimal Wear": {
    min: 0.07,
    max: 0.15
  },
  "Field-Tested": {
    min: 0.15,
    max: 0.38
  },
  "Well-Worn": {
    min: 0.38,
    max: 0.45
  },
  "Battle-Scarred": {
    min: 0.45,
    max: 1.00
  }
}

var CSGO_ORIGINS = [];

const loadCsgoOriginNames = (callback = () => {
}) => {
  if (Array.isArray(CSGO_ORIGINS) && CSGO_ORIGINS.length > 0) {
    callback();
  } else {
    $J.getJSON(`chrome-extension://${window.SIHID}/assets/json/csgo_origin_names.json`, (data) => {
      CSGO_ORIGINS = data;
      callback();
    });
  }
}
loadCsgoOriginNames();


var COOKIE_ENABLED_SIH = 'enableSIH';
var IS_ENABLED_SIH = GetCookie(COOKIE_ENABLED_SIH);
IS_ENABLED_SIH = IS_ENABLED_SIH === null || IS_ENABLED_SIH === 'true';

const COOKIE_SIH_UNIQUE_INVENTORY_LIST_FILTER_SETTINGS = "SIH_UNIQUE_INVENTORY_LIST_FILTER_SETTINGS";
var g_sihUniqueInventoryListFilterSettings = LocalStorageJSON.get(COOKIE_SIH_UNIQUE_INVENTORY_LIST_FILTER_SETTINGS);
g_sihUniqueInventoryListFilterSettings = g_sihUniqueInventoryListFilterSettings || {
  paintSeed: {},
  float: {}
};


$J('.market_listing_nav_container').append('<div class="market_nav"></div>');
$J('.market_listing_nav_container .market_nav').append($J('.market_listing_nav_container .market_listing_nav'));
$J('.market_listing_nav_container .market_nav').append(`
    <div id="switchPanel">
        <span style="margin-right: 10px;">SIH - Steam Inventory Helper</span>
        <label class="switch">
            <input id="switcher" type="checkbox" ${IS_ENABLED_SIH ? 'checked' : ''}>
            <span class="slider round"></span>
        </label>
    </div>
`);

$J('#switchPanel #switcher').change((e) => {
  const {currentTarget} = e;
  SetCookie(COOKIE_ENABLED_SIH, currentTarget.checked, 365, '/market/listings');
  window.location.reload();
});

// Set Float value for an item
var setFloatValue = function (data) {
  const $item = $J(`#listing_${data.listingId}`);
  const floatDiv = $item.find(`#listing_${data.listingId}_float`);
  if (data && data.success && $item[0]) {
    $item[0].rgItem = {
      info: data.iteminfo,
      elem: $item
    };
    floatDiv.find('.floatbutton').remove();
    floatDiv.find('.spinner').css('display', 'none');
    floatDiv.find('.float_data').css('display', 'block');
    floatDiv.find('.itemfloat .value').html(`${data.iteminfo.floatvalue}`);
    floatDiv.find('.itemseed .value').html(`${data.iteminfo.paintseed || 0}`);

    loadCsgoOriginNames(() => {
      const itemOrigin = CSGO_ORIGINS.find(item => item.origin === data.iteminfo.origin);
      floatDiv.find('.itemorigin .value').html(itemOrigin.name);
    });

    const additionalInfo = $J(`#listing_${data.listingId}`).find('.additional');
    const additionalItems = ['itemid', 'defindex', 'paintindex', 'paintseed', 'quality', 'rarity', 'inventory'];
    const fields = additionalItems.map(item => `<div class="item">${item}: <span class="value">${data.iteminfo[item]}</span></div>`);
    additionalInfo.html(fields.join(''));
  }
};

// Set inventoryStickers wear for an item
var setStickersWearValues = function (data) {
  const floatDiv = $J(`#listing_${data.listingId}`).find(`#listing_${data.listingId}_float`);
  if (data && data.success) {
    floatDiv.find('.spinner').css('display', 'none');

    // Find the listing item block
    const listingDiv = $J(`#listing_${data.listingId}`);
    // Find all item's inventoryStickers
    const imagesDiv = listingDiv.find(`.sih-images .sticker-image img`);

    const imagesQty = imagesDiv.length;

    // Increase height of listing block
    if (imagesQty) {
      //listingDiv.css('height', '105px');
    }

    // Add wear info for to each sticker
    for (let i = 0; i < imagesQty; i += 1) {
      const sticker = data.iteminfo.stickers[i];
      // Check if no such sticker in float info then we stop/break this cycle (some exceptional situation)
      if (sticker === undefined) {
        break;
      }

      const wear = (sticker.wear || 0) * 100;

      // Check if wear info already added
      const wearInfoDiv = imagesDiv.eq(i).next('.sticker-wear-info');
      if (!wearInfoDiv || !wearInfoDiv.length) {
        // Add wear info block into DOM after the sticker image
        const $container = imagesDiv.eq(i).parent();
        if (!$container.find('.sticker-wear-info').length) {
          imagesDiv.eq(i).parent().append(`
          <div class="sticker-wear-info">
            <p class="sticker-wear-info-value">${wear === 0 ? 0 : wear.toFixed(2)}%</p>
          </div>
        `);
        }
      }
    }
  }
};

var GetFloat = function (listingId, link) {
  return new Promise((resolve, reject) => {
    if (floatData[listingId].success) {
      resolve(Object.assign({}, floatData[listingId], {listingId}));
    } else {
      chrome.runtime.sendMessage(SIHID, {type: 'floatvalue', data: link}, function (respData) {
        if (respData && respData.success) {
          Object.assign(floatData[listingId], respData);
          Object.assign(respData, {listingId});
          resolve(respData);
        } else {
          reject(respData);
        }
      });
    }
  });
};

var SetPhaseColors = function () {
  if (!window.show_phase_color_listing) return;

  $J('.market_listing_row[id^="listing_"]').each(function () {
    var $row = $J(this);
    var idListing = $J(this).attr('id').substring(8);
    var rgListing = g_rgListingInfo[idListing];
    var asset = null;
    if (rgListing) {
      asset = g_rgListingInfo[idListing].asset;
    } else {
      return;
    }

    var rgItem = g_rgAssets[asset.appid][asset.contextid][asset.id];

    window.InventoryItemRarity.colorizeItem(rgItem, null, true, {
      disableBorderColorization: true,
      onBackGroundColor: ((row) => (color) => row.find('.market_listing_item_img').css('background-color', `#${color}`))($row)
    });
  });
}

const processFloatQueue = function () {
  if (!floatQueue.length) {
    return setTimeout(processFloatQueue, 1000);
  }

  Promise.all(
    floatQueue.map(({listingId, inspectLink, isFloat = true}) => GetFloat(listingId, inspectLink).then((data) => {
      if (isFloat) {
        setFloatValue(data);

        if ($J('.market_sort_arrow').is(':contains("▼")')) sortListingsByFloat(-1);
        else if ($J('.market_sort_arrow').is(':contains("▲")')) sortListingsByFloat(1);
      } else {
        setStickersWearValues(data);
      }
    }).catch((error) => {
      console.error(error);
      var floatDiv = $J(`#listing_${listingId}_float`);
      floatDiv.find('.floatbutton').show();
      floatDiv.find('.wearbutton').show();
      floatDiv.find('.spinner').hide();
    }))
  );

  floatQueue.length = 0;
  processFloatQueue();
};

function loadButtonUp() {
  $J('body').append('<div id="button_up"></div>');

  $J(document).ready(function () {
    const button = $J('#button_up');
    $J(window).scroll(function () {
      if ($J(this).scrollTop() > 300) {
        button.fadeIn();
      } else {
        button.fadeOut();
      }
    });
    button.on('click', function () {
      $J('body, html').animate({
        scrollTop: 0
      }, 800);
      return false;
    });
  });
}

function marketListingsRequestOnSuccessBefore(url, data, transport) {

}

function marketListingsRequestOnSuccessAfter(url, data, transport) {
  SIH?.controlPanelForTableUniqueInventories?.load();
  SIH?.paginationForTableUniqueInventories?.load();
  SIH?.priceDisplayUniqueInventory?.load();
}

function getCurrencyCode() {
  try {
    return window.GetCurrencyCode(window.currencyId) || undefined;
  } catch (e) {
    return undefined;
  }
}

function parseItemData() {
  const contextId = 2;
  const appId = +Object.entries(g_rgAppContextData)?.[0]?.[0];
  if (!appId) return false;

  const item = Object.values(g_rgAssets?.[appId]?.[contextId] || {})?.[0];
  if (!item) return false;

  return {
    appId,
    uid: window?.SIH_TOKEN,
    marketHashName: item.market_hash_name,
    link: location.href,
    country: window?.g_strCountryCode,
    lang: window?.g_strLanguage,
    currency: getCurrencyCode(),
    itemType: item.type
  };
}

function registerViewItemEvent() {
  const item = parseItemData();

  if (!item) return;

  const data = {
    type: 'view-item',
    payload: item
  };
  chrome.runtime.sendMessage(SIHID, {type: "EVENT_STORE", data});
}


if (IS_ENABLED_SIH) {

  $J(function () {

    registerViewItemEvent();

    ExchangeRates.GetRate((isLoad) => {
      SIH?.inventoryInfoWarning?.load();
      SIH?.stickersUnderInventoryAvatar?.load();
      SIH?.blockOfMarketplaces?.load();
      SIH?.favoritesButton?.load();
      SIH?.accordionInventoryDescription?.load();
      SIH?.buttonInspectInGame?.load();
      SIH?.blockBestOfferOfMarketplace?.load();
      SIH?.marketCommodityOrderBlock?.load();

    });

    loadButtonUp();

    if (typeof (g_oSearchResults) != 'undefined' && g_oSearchResults.OnAJAXComplete) {

      g_oSearchResults.OnAJAXComplete = function () {
        g_oSearchResults.m_bLoading = false;
        SIH?.inventoryStickers?.loadInTable()
        SetPhaseColors();
        marketListingsRequestOnSuccessAfter();
        SIH?.priceDisplayUniqueInventory?.load()
      };

      if (window.noOfRows && window.noOfRows != 10) {
        g_oSearchResults.m_cPageSize = window.noOfRows;
        g_oSearchResults.GoToPage(0, true);
      } else {
        SIH?.inventoryStickers?.loadInTable();
        SetPhaseColors();
        marketListingsRequestOnSuccessAfter();
        //marketListingPage.filterUniqueInventory.load();
      }

      var btReload = $J(`<a href="#" class="btn_grey_white_innerfade btn_small" accesskey="r"><span>${SIHLang.market.reloadlistings}</span></a>`);
      const $searchResultsTable = $J("#searchResultsTable");
      const $doc = $J([document.documentElement, document.body]);
      btReload.click(function () {
        g_oSearchResults.m_cMaxPages = g_oSearchResults.m_iCurrentPage + 1;
        g_oSearchResults.GoToPage(g_oSearchResults.m_iCurrentPage, true);

        // Scroll lo search results table
        $doc.animate({scrollTop: $searchResultsTable.offset().top}, 10);

        return false;
      });
      if ($J('.market_listing_filter_clear_button_container').length == 0) {
        $J('#market_listing_filter_form').append('<div class="market_listing_filter_clear_button_container">');
      }
      $J('.market_listing_filter_clear_button_container').prepend(btReload);
      $J('#listings').on('click', '.sih-images img', function () {
        let hashStickerName = $J(this).prop('title');
        var link = g_strLanguage === 'english'
          ? 'https://steamcommunity.com/market/listings/730/' + encodeURIComponent(hashStickerName)
          : 'https://steamcommunity.com/market/search?q=' + encodeURIComponent(hashStickerName);
        window.open(link, '_blank');
      });


      $J('body').on('click', '#allfloatbutton', function () {
        $J('.market_listing_row[id^="listing_"]:has(.floatbutton)').each(function () {
          var listingId = $J(this).attr('id').substring(8);
          const floatDiv = $J(`#listing_${listingId}`).find(`#listing_${listingId}_float`);
          floatDiv.find('.floatbutton').hide();
          floatDiv.find('.spinner').show();
          floatQueue.push({listingId, inspectLink: floatData[listingId].link});
        });
      });

      $J('body').on('click', '#allstickerwearbutton', function () {
        $J('.market_listing_row[id^="listing_"]:has(.wear_and_price_button)').each(function () {

          var listingId = $J(this).attr('id').substring(8);
          const floatDiv = $J(`#listing_${listingId}`).find(`#listing_${listingId}_float`);
          //floatDiv.find('.wear_and_price_button').hide();
          floatDiv.find('.spinner').show();
          floatQueue.push({listingId, inspectLink: floatData[listingId].link, isFloat: false});
        });
      });

      $J('body').on('click', '#sortlistings', function () {
        var order = 1;
        $this = $J(this);
        if ($this.find('.market_sort_arrow').is(':contains("▲")')) {
          order = -1;
          $this.find('.market_sort_arrow').text('▼');
        } else {
          $this.find('.market_sort_arrow').text('▲');
        }
        sortListingsByFloat(order);
      });

      // выбираем целевой элемент
      var target = document.getElementById('market_buynow_dialog');

      // создаём экземпляр MutationObserver
      var observer = new MutationObserver(function (mutations) {
        const isVisible = $J('#market_buynow_dialog').is(':visible');
        if (isVisible) {
          $J('#market_buynow_dialog .market_listing_game_name').show();
          $J('#market_buynow_dialog .sih-market-action').hide();
          if ($J('#market_buynow_dialog .float_block').find('.floatbutton').length) {
            $J('#market_buynow_dialog .float_block').hide();
          }
        }
      });

      // конфигурация нашего observer:
      var config = {attributes: true};

      // передаём в качестве аргументов целевой элемент и его конфигурацию
      observer.observe(target, config);

      processFloatQueue();
    }

  });

  // Prototype Steam

  let AjaxRequestMaster = Ajax.Request;
  Ajax.Request = function (url, data) {

    data.sihData = data.sihData || {}

    const onSuccess = data.onSuccess;
    data.onSuccess = function (transport) {
      if (url.indexOf('/market/listings') > -1) {
        marketListingsRequestOnSuccessBefore(url, data, transport);
      }
      onSuccess(transport)
      if (url.indexOf('/market/listings') > -1) {
        marketListingsRequestOnSuccessAfter(url, data, transport);
      }
    }

    const onFailure = data.onFailure;
    data.onFailure = function (transport) {
      onFailure(transport);
    }

    new AjaxRequestMaster(url, data);
  }
  Ajax.Request.__proto__ = AjaxRequestMaster;

  var BuildHoverMaster = BuildHover;
  var BuildHover = (prefix, item, owner) => {
    BuildHoverMaster(prefix, item, owner);

    if (item.appid !== 440) {
      getLowestPriceHandler(item, prefix);
    }
  }

  const AjaxMaster = $J.ajax;
  $J.ajax = function (req) {

    if (req.url.includes('/market/itemordershistogram')) {
      SIH?.marketCommodityOrderBlock?.setItemNameID(req.data.item_nameid);
      req.data.currency = SIH?.marketCommodityOrderBlock?.getCurrency() || req.data.currency;


    }

    return AjaxMaster(req)
      .success(res => {
        if (req.url.includes('/market/itemordershistogram')) {
          SIH?.marketCommodityOrderBlock?.showButtonFromData('buy', res.buy_order_graph);
          SIH?.marketCommodityOrderBlock?.showButtonFromData('sell', res.sell_order_graph);

          res.sell_order_table = SIH?.marketCommodityOrderBlock?.getOrderHtmlTable(
            'sell',
            res,
            true);

          res.buy_order_table = SIH?.marketCommodityOrderBlock?.getOrderHtmlTable(
            'buy',
            res,
            false);
        }
        return res
      })
      .error(err => {
        return err
      })
  }
}
