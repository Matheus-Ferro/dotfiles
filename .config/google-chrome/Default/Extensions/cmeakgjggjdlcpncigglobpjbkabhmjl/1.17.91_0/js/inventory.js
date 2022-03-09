/*global $J, g_ActiveInventory, g_ActiveUser, g_sessionID, UserYou, SellItemDialog*/

var COOKIE_ENABLED_SIH = 'enableSIH';
var IS_ENABLED_SIH = GetCookie(COOKIE_ENABLED_SIH);
IS_ENABLED_SIH = IS_ENABLED_SIH === null || IS_ENABLED_SIH === 'true';

var g_isLocalReloadAllInventory = false;
var g_inventoryData = {}

if (IS_ENABLED_SIH) {
  initRgItems();
  initForm();
}

function initRgItems() {
  setTimeout(function () {

    if (g_ActiveInventory && g_ActiveInventory.appid) {
      const items = $J(`.item.app${g_ActiveInventory.appid}`);
      if (items.length > 0 && items[0].rgItem) {
        loadRgItems();
      } else {
        initRgItems();
      }
    } else {
      initRgItems();
    }
  }, 700);
}

function initForm() {
  setTimeout(function () {
    loadForm();
  }, 700);
}

function loadRgItems() {
  g_isLocalReloadAllInventory = false;
  loadAllInventory();
}

function loadForm() {

  hideGroupInventoryApp();
  disabledControls(true);
  $J('#switcherGroupInventory').change((e) => {
    const {currentTarget} = e;
    $J('#Lnk_Cancel').click();
    g_inventoryData[g_ActiveInventory.appid].isCheckbox = currentTarget.checked
    g_isLocalReloadAllInventory = true;
    g_ActiveInventory.m_iCurrentPage = 0;
    g_ActiveInventory.m_bNeedsReload = true;
    g_ActiveInventory.ReloadIfNeeded();
    loadImprovedInventoryNav()
    if (window.show_trade_unlock_date_badge) {
      ItemTreadLocks.add();
    }
    if (window.extprice) {
      SetupExternalDropdown(g_ActiveInventory.appid);
    }

    if (currentTarget.checked) {

    } else {

    }

  })
}

function loadInventoryData(data) {

  const appid = g_ActiveInventory.appid;

  if (!g_inventoryData[appid]) {
    g_inventoryData[appid] = {
      data: {
        assets: [],
        descriptions: [],
        total_inventory_count: 0,
      },
      profile: {
        rgInventory: [],
        rgDescriptions: []
      },
      isLoadFirst: false,
      isCheckbox: false,
      isLocalReloadAllInventory: false
    }
  }

  if (data && Array.isArray(data.assets)) {
    g_inventoryData[appid].data.assets = g_inventoryData[appid].data.assets.concat(data.assets);
  }
  if (data && Array.isArray(data.descriptions)) {
    g_inventoryData[appid].data.descriptions = g_inventoryData[appid].data.descriptions.concat(data.descriptions);
  }
  g_inventoryData[appid].data.total_inventory_count = data.total_inventory_count;
}

function loadUseCountMarketHashName() {
  const inventories = g_inventoryData[g_ActiveInventory.appid].data.assets;
  const useCount = {};
  inventories.forEach((item) => {
    const marketHashName = item.description.market_hash_name;

    if (useCount[marketHashName]) {
      useCount[marketHashName] += 1
    } else {
      useCount[marketHashName] = 1
    }
  })

  for (const marketHashName in useCount) {
    const items = inventories.filter(x => x.description.market_hash_name === marketHashName);

    items.forEach((item) => {
      if (item) {
        item.description.useCountMarketHashName = useCount[marketHashName];
      }
    });
  }
}

// Load all inventory
function loadAllInventory() {
  if (!g_inventoryData[g_ActiveInventory.appid]) {
    setTimeout(() => {

      if (g_ActiveInventory.m_rgAssets && g_ActiveInventory.m_rgDescriptions) {
        loadInventoryData({
          assets: Object.keys(g_ActiveInventory.m_rgAssets).map(function (k) {
            return g_ActiveInventory.m_rgAssets[k]
          }),
          descriptions: Object.keys(g_ActiveInventory.m_rgDescriptions).map(function (k) {
            return g_ActiveInventory.m_rgDescriptions[k]
          }),
          total_inventory_count: g_ActiveInventory.m_cItems
        })
      }
      loadAllInventory();
      return
    }, 100);
  }

  if (g_inventoryData[g_ActiveInventory.appid] && !g_inventoryData[g_ActiveInventory.appid].isLoadFirst) {
    g_inventoryData[g_ActiveInventory.appid].isLoadFirst = true;
    LoadCompleteAllInventory()
      .then(() => {
        for (let i = 0; i < g_ActiveInventory.m_cPages; i++) {
          g_ActiveInventory.m_rgPages[i].EnsurePageItemsCreated();
          g_ActiveInventory.PreloadPageImages(i);
        }

        loadUseCountMarketHashName();

        loadProfileInventory()
          .done(() => {
            if (window.show_trade_unlock_date_badge) {
              ItemTreadLocks.add();
            }
            disabledControls(false);
          })
          .fail(() => {
            disabledControls(false);
          });

        loadImprovedInventoryNav()
        if (window.extprice) {
          SetupExternalDropdown(g_ActiveInventory.appid);
        }

        loadRightInventoryPanel(g_ActiveInventory.selectedItem);
      })
  }
}

function LoadCompleteAllInventory() {
  return new Promise((resolve, reject) => {
    if (typeof g_ActiveInventory.LoadCompleteInventory == 'function' && !g_ActiveInventory.BIsFullyLoaded()) {
      g_ActiveInventory.LoadCompleteInventory().done(resolve).fail(reject);
    } else {
      resolve();
    }
  });
}

function inventoryAssign(assets, descriptions) {
  assets.forEach((item) => {
    const key = `${item.classid}_${item.instanceid}`;
    item.profile = {
      cacheExpiration: {},
      marketHashName: (descriptions[key] || {}).market_hash_name
    }
    if (descriptions[key] && descriptions[key].cache_expiration) {
      item.profile.cacheExpiration.date = new Date(descriptions[key].cache_expiration);
      item.profile.cacheExpiration.badge = ItemTreadLocks.badgeText(ItemTreadLocks.timeToUnlock(item.profile.cacheExpiration.date));
    }
  })
}

function loadProfileInventory() {
  const {appid, contextid, m_owner} = g_ActiveInventory;

  const url = `https://steamcommunity.com/profiles/${m_owner.strSteamId}/inventory/json/${appid}/${contextid}/`;
  const params = {
    l: 'english'
  };

  return $J.get(url, params
  ).done(function (data) {
    if (data.success && g_inventoryData[appid]) {
      g_inventoryData[appid].profile = data
    }
  });
}

function loadPriceSteamInventory(strMarketName) {
  const {appid} = g_ActiveInventory;
  const currency = typeof (g_rgWalletInfo) != 'undefined' ? g_rgWalletInfo.wallet_currency : 1
  const url = `https://steamcommunity.com/market/priceoverview/`;
  const params = {
    appid: appid,
    country: g_strCountryCode,
    currency: currency,
    market_hash_name: strMarketName
  };

  return $J.get(url, params);
}

function improvedInventoryNav() {
  const renderControls = () => {
    // Get navigation controls block
    const controls = $J('#inventory_pagecontrols');

    controls.addClass('inventory_pagecontrols_nav');
    controls.find('.inventory_loading_indicator > img').css({width: '25px', opacity: 1});

    // Get prev and next buttons
    const prevButton = controls.find('#pagebtn_previous');
    controls.find('#pagebtn_first').remove();
    prevButton.after(`
            <a class="pagecontrol_element pagebtn disabled" id="pagebtn_first" style="margin-right: 3px;"><<</a>
        `);

    const nextButton = controls.find('#pagebtn_next');
    controls.find('#pagebtn_last').remove();
    nextButton.before(`
            <a class="pagecontrol_element pagebtn" id="pagebtn_last" style="margin-left: 3px;">>></a>
        `);


    // Get new buttons

    const lastButton = controls.find('#pagebtn_last');

    const firstButton = controls.find('#pagebtn_first');
    controls.find('#pageinput_index').remove();
    controls.find('#pagebtn_page').remove();
    // Add "Go to specified page" block
    firstButton.after(`
            <input id="pageinput_index" min="1" class="selectableText filter_search_box nav-page-index" type="number"></input>
            <a id="pagebtn_page" class="pagecontrol_element pagebtn" style="margin-left: 3px; float: left;">Go</a>
        `);

    // Get block's controls
    const pageButton = controls.find('#pagebtn_page');
    const pageIndexInput = controls.find('#pageinput_index');

    // Return all $controls
    return {
      controls,
      prevButton,
      nextButton,
      firstButton,
      lastButton,
      pageButton,
      pageIndexInput
    };
  };

  const extendUpdatePageCountsMethod = (inventory, controls) => {
    // Store original method
    const {UpdatePageCounts} = inventory;
    const {firstButton, lastButton, pageIndexInput} = controls;

    // Extend method inventory.UpdatePageCounts
    inventory.UpdatePageCounts = () => {
      const {m_iCurrentPage, m_cPages} = inventory;

      if (m_iCurrentPage === 0) {
        firstButton.addClass('disabled');
      } else {
        firstButton.removeClass('disabled');
      }

      if (m_iCurrentPage < m_cPages - 1) {
        lastButton.removeClass('disabled');
      } else {
        lastButton.addClass('disabled');
      }

      pageIndexInput.val(v_numberformat(m_iCurrentPage + 1));

      UpdatePageCounts.call(inventory);
    }
  };

  const initPageIndexInput = (inventory, {pageIndexInput}) => {
    const {m_iCurrentPage, m_cPages} = inventory;

    pageIndexInput.val(m_iCurrentPage + 1);
    pageIndexInput.attr('max', m_cPages);

    pageIndexInput.change(() => {
      const {m_iCurrentPage, m_cPages} = inventory;
      const value = pageIndexInput.val();

      if (!value.length) return pageIndexInput.val(m_iCurrentPage + 1);
      if (value < 1) return pageIndexInput.val(1);
      if (value > m_cPages) return pageIndexInput.val(m_cPages);
    });
  };

  // Adds click handlers for new buttons
  const addEventListeners = (nav, {firstButton, lastButton, pageButton, pageIndexInput}) => {
    firstButton.click(() => nav.firstPage());
    lastButton.click(() => {
      nav.lastPage()
      loadGroupInventoryDialog();
      loadInventorySelectionFromInventoryGroup()
    });
    pageButton.click(() => {
      nav.page(pageIndexInput.val() - 1);
    });
  };

  try {
    const $controls = renderControls();

    extendUpdatePageCountsMethod(g_ActiveInventory, $controls);
    initPageIndexInput(g_ActiveInventory, $controls);
    addEventListeners(InventoryUtils(g_ActiveInventory).nav, $controls);
  } catch (error) {
    console.error('ImprovedInventoryNav: fail -', error.message);
  }
}

function hideGroupInventoryApp() {
  if (g_ActiveInventory && g_ActiveInventory.appid === 730) {
    // $J('#switchGroupInventory').show()
  } else {
    $J('#switchGroupInventory').hide()
  }
}

function disabledControls(isDisabled) {

  /* $J('#Lnk_Reload').prop('disabled', isDisabled);
   $J('#Bt_GetFloat').prop('disabled', isDisabled);
   $J('#Lnk_Sellmulti').prop('disabled', isDisabled);
   $J('#Lnk_Sellall').prop('disabled', isDisabled);
   $J('#Lnk_Cancel').prop('disabled', isDisabled);
   $J('#Lnk_TurnIntoGems').prop('disabled', isDisabled);
   $J('#Lnk_SendGifts').prop('disabled', isDisabled);
   $J('#Lnk_Unpack').prop('disabled', isDisabled);
   $J('#Lnk_ShowSellMulti').prop('disabled', isDisabled);
   $J('#cb_ExternalPrices').prop('disabled', isDisabled);*/

  if (isDisabled) {
    $J('#switchGroupInventory').addClass('sih-disabled');

    /* $J('#Lnk_SortItems').addClass('sih-disabled');
     $J('#inventory_pagecontrols').addClass('sih-disabled');
     $J('#active_inventory_page .inventory_page_left').addClass('sih-disabled');
     $J('#active_inventory_page .inventory_page_right').addClass('sih-disabled');*/
  } else {
    $J('#switchGroupInventory').removeClass('sih-disabled');

    /* $J('#Lnk_SortItems').removeClass('sih-disabled');
     $J('#inventory_pagecontrols').removeClass('sih-disabled');
     $J('#active_inventory_page .inventory_page_left').removeClass('sih-disabled');
     $J('#active_inventory_page .inventory_page_right').removeClass('sih-disabled');*/
  }

}

function isUniqueInventory(tags) {
  return tags.find(x => x.category.toUpperCase() === 'WEAPON' || x.internal_name.toUpperCase() === 'TYPE_HANDS');
}

function loadGroupInventoryDialog() {
  const switcherGroupInventory = $J('#switcherGroupInventory').is(":checked");
  if (switcherGroupInventory) {
    setTimeout(() => {
      $J('.inventory_page:visible').find(`div.item.app${g_ActiveInventory.appid}`)
        .each((idx, elem) => {
          if (elem.rgItem.description.useCountMarketHashName > 1) {
            $J(elem).append(`<div class="group_inventory_flag">x${elem.rgItem.description.useCountMarketHashName}</div>`);
          }
        });
    }, 0);
  }
}

function loadInventorySelectionFromInventoryGroup() {
  const switcherGroupInventory = $J('#switcherGroupInventory').is(":checked");
  if (switcherGroupInventory) {

    $J('.inventory_page .group_inventory_sell_button').remove();
    $J(`.inventory_page:visible div.item.app${g_ActiveInventory.appid}`)
      .each((idx, elem) => {
        if (elem.rgItem.description.useCountMarketHashName > 1) {
          const isWeapon = isUniqueInventory(elem.rgItem.description.tags);
          $J(elem).append(`<div class="group_inventory_sell_button">
                    <div>
                    <button class="group_inventory_select_multiple_for_cell_btn">${SIHLang.selectMultiple}</button>
                     <button class="group_inventory_choose_all_for_cell_btn">${SIHLang.chooseAll}</button>
                    </div>
                </div>`);


          $J(elem).find('.group_inventory_select_multiple_for_cell_btn').click(function () {
            GroupInventoryDialog.Show(elem, isWeapon, true)
          });

          $J(elem).find('.group_inventory_choose_all_for_cell_btn').click(function () {
            $J(elem).parent().find('.selectedSell').remove();
            $J(elem).addClass('group_inventory_master_selected_sell');
            elem.rgItem.groupInventories.forEach((item, i) => {
              item.isSelectedForSell = true;
              addSell(elem, item, i);
            })
            sellBtn();
            loadNumberSelectedInventory(elem.rgItem)
          })

          $J(elem).on({
            mouseenter: function () {
              if (selectmode) {
                $J(this).find('.group_inventory_sell_button').css('display', 'table');
              }
            },
            mouseleave: function () {
              $J(this).find('.group_inventory_sell_button').css('display', 'none');
            }
          });
        }
      });
  }
}

function addSell(elem, data, index) {
  const newElem = $J(elem).clone(true);
  data.itemIndex = index;
  $(newElem)[0].rgItem = Object.assign({}, data);
  $(newElem)[0].rgItem.element = $(newElem)[0];
  $(newElem).addClass('selectedSell similar-item group_inventory_selected_sell');
  $J(elem).after(newElem);
}

function loadQuickSellForInventoryItem(marketHashName) {

  if (window.quicksellbuttons
    && g_ActiveInventory.selectedItem
    && g_ActiveInventory.selectedItem.description.lowestPrice &&
    marketHashName === g_ActiveInventory.selectedItem.description.market_hash_name
  ) {
    QuickSellForInventoryItem.addButton(g_ActiveInventory.selectedItem, g_elActions);
  }
}

function loadInstantSellForInventoryItem(rgItem) {
  const bIsTrading = typeof (g_bIsTrading) != 'undefined' && g_bIsTrading;
  if (!bIsTrading &&
    window.instantsellbuttons &&
    !selectmode) {
    addInstantSellButton(rgItem, g_elActions);
  }
}

function sellBtn() {
  const itC = $J('.selectedSell').length;
  if (itC > 0) {
    $J('#Lnk_ShowSellMulti').html((itC > 1 ? SIHLang.sellnitem.replace('$1', itC) : SIHLang.sell1item));
    $J('#Lnk_ShowSellMulti').show();
    if (g_ActiveInventory.appid == 753) {
      $J('#Lnk_TurnIntoGems').show();
      $J('#Lnk_SendGifts').show();
      $J('#Lnk_Unpack').show();
    }
  } else {
    $J('#Lnk_ShowSellMulti').hide();
    $J('#Lnk_TurnIntoGems').hide();
    $J('#Lnk_SendGifts').hide();
    $J('#Lnk_Unpack').hide();
  }
}

function loadNumberSelectedInventory(rgItem) {
  const $elem = $J(rgItem.element).parent();
  $elem.find('.number_selected_inventory').remove();
  const $elemFirst = $elem.find(':first');
  const number = rgItem.groupInventories.filter(x => x.isSelectedForSell).length;

  $elemFirst.removeClass('group_inventory_master_selected_sell');
  if (number > 0) {
    $elemFirst.addClass('group_inventory_master_selected_sell');
    $elemFirst.append(`<div class="number_selected_inventory">x${number}</div>`);
  }
}

function loadImprovedInventoryNav() {
  if (window.show_improved_inventory_nav) {
    improvedInventoryNav();
  }
}

function agpGem(sItem) {
  if (window.agp_gem && sItem.description.type !== "Rare Inscribed Gem" && sItem.appid == 570) {
    const cc = g_strCountryCode || getStoreRegionCountryCode() || g_rgWalletInfo.wallet_country;
    let isGenuine = false;

    for (let i = 0; i < sItem.description.descriptions.length; i++) {
      let d = sItem.description.descriptions[i];
      if (d.app_data && !d.app_data.is_itemset_name && !d.app_data.price && !d.app_data.limited) {
        getSetLink(d, sItem.description, isGenuine);
      }
      if (d.insgems) {
        break;
      }

      let ematch, gidx = 0;
      d.insgems = [];

      while ((ematch = insGemExp.exec(d.value))) {
        let gemLink = window.location.protocol + '//steamcommunity.com/market/priceoverview/?appid=570&country=' + cc + '&currency=' + currencyId + '&market_hash_name=Inscribed ' + ematch[1];
        d.insgems.push({name: 'Inscribed ' + ematch[1]});

        PriceQueue.GetPrice({
          method: "GET",
          url: gemLink,
          pars: {gemidx: gidx},
          success: function (response, $this) {
            let lp = 0, nfp = 0;
            if (response.success) {
              lp = response.lowest_price;
              nfp = response.median_price;

              d.insgems[$this.gemidx].lowestPrice = lp;
              d.insgems[$this.gemidx].nofeePrice = nfp;

              if (sItem === g_ActiveInventory.selectedItem) {
                reloadDes();
              }
            }
          },
          error: function () {

          }
        });
        gidx++;
      }

      while (ematch = kinGemExp.exec(d.value)) {
        let gemLink = window.location.protocol + '//steamcommunity.com/market/priceoverview/?appid=570&country=' + cc + '&currency=' + currencyId + '&market_hash_name=Kinetic: ' + ematch[1];

        d.insgems.push({name: 'Kinetic: ' + ematch[1]});

        PriceQueue.GetPrice({
          method: "GET",
          url: gemLink,
          pars: {gemidx: gidx},
          success: function (response, $this) {
            let lp = 0, nfp = 0;
            if (response.success) {
              lp = response.lowest_price;
              nfp = response.median_price;

              d.insgems[$this.gemidx].lowestPrice = lp;
              d.insgems[$this.gemidx].nofeePrice = nfp;

              if (sItem === g_ActiveInventory.selectedItem)
                reloadDes();
            }
          },
          error: function () {
          }
        });
        gidx++;
      }

      while (ematch = masGemExp.exec(d.value)) {
        var gemLink = window.location.protocol + '//steamcommunity.com/market/priceoverview/?appid=570&country=' + cc + '&currency=' + currencyId + '&market_hash_name=Rune%20of%20the%20Duelist%20Indomitable';
        d.insgems.push({name: 'Rune%20of%20the%20Duelist%20Indomitable'});

        PriceQueue.GetPrice({
          method: "GET",
          url: gemLink,
          pars: {gemidx: gidx},
          success: function (response, $this) {
            var lp = 0, nfp = 0;
            if (response.success) {
              lp = response.lowest_price;
              nfp = response.median_price;

              d.insgems[$this.gemidx].lowestPrice = lp;
              d.insgems[$this.gemidx].nofeePrice = nfp;

              if (sItem === g_ActiveInventory.selectedItem)
                reloadDes();
            }
          },
          error: function () {
          }
        });
        gidx++;
      }

      while (ematch = corGemExp.exec(d.value)) {
        var gemLink = window.location.protocol + '//steamcommunity.com/market/priceoverview/?appid=570&country=' + cc + '&currency=' + currencyId + '&market_hash_name=Foulfell Shard';

        d.insgems.push({name: 'Foulfell Shard'});

        PriceQueue.GetPrice({
          method: "GET",
          url: gemLink,
          pars: {gemidx: gidx},
          success: function (response, $this) {
            var lp = 0, nfp = 0;
            if (response.success) {
              lp = response.lowest_price;
              nfp = response.median_price;

              d.insgems[$this.gemidx].lowestPrice = lp;
              d.insgems[$this.gemidx].nofeePrice = nfp;

              if (sItem === g_ActiveInventory.selectedItem)
                reloadDes();
            }
          },
          error: function () {
          }
        });
        gidx++;
      }

      while (ematch = ethGemExp.exec(d.value)) {
        var gemLink = window.location.protocol + '//steamcommunity.com/market/priceoverview/?appid=570&country=' + cc + '&currency=' + currencyId + '&market_hash_name=Ethereal: ' + ematch[1];

        d.insgems.push({name: 'Ethereal: ' + ematch[1]});

        PriceQueue.GetPrice({
          method: "GET",
          url: gemLink,
          pars: {gemidx: gidx},
          success: function (response, $this) {
            var lp = 0, nfp = 0;
            if (response.success) {
              lp = response.lowest_price;
              nfp = response.median_price;

              d.insgems[$this.gemidx].lowestPrice = lp;
              d.insgems[$this.gemidx].nofeePrice = nfp;

              if (sItem === g_ActiveInventory.selectedItem)
                reloadDes();
            }
          },
          error: function () {
          }
        });
        gidx++;
      }

      while (ematch = priGemExp.exec(d.value)) {
        var gemLink = window.location.protocol + '//steamcommunity.com/market/priceoverview/?appid=570&country=' + cc + '&currency=' + currencyId + '&market_hash_name=Prismatic: ' + ematch[1];

        d.insgems.push({name: 'Prismatic: ' + ematch[1]});

        PriceQueue.GetPrice({
          method: "GET",
          url: gemLink,
          pars: {gemidx: gidx},
          success: function (response, $this) {
            var lp = 0, nfp = 0;
            if (response.success) {
              lp = response.lowest_price;
              nfp = response.median_price;

              d.insgems[$this.gemidx].lowestPrice = lp;
              d.insgems[$this.gemidx].nofeePrice = nfp;

              if (sItem === g_ActiveInventory.selectedItem)
                reloadDes();
            }
          },
          error: function () {
          }
        });
        gidx++;
      }

      if (gidx > 0) {
      } else {
        delete d.insgems;
      }
    }
  }
}


function marketPriceOverviewDone(transport, sihData = {}) {

  const rgItem = sihData.rgItem;
  if (!rgItem) {
    return;
  }

  if (transport && transport.responseJSON && transport.responseJSON.success && transport.request) {
    transport.responseJSON.priceDateMs = transport.responseJSON.priceDateMs || Date.now();
    const marketPrice = transport.responseJSON;

    rgItem.description.transport = {
      responseJSON: transport.responseJSON,
      request: {
        url: transport.request.url
      }
    };

    rgItem.description.lowestPrice = marketPrice.lowest_price;
    rgItem.description.lowestPriceW = marketPrice.lowest_price;
    rgItem.description.nofeePrice = marketPrice.median_price;
    rgItem.description.nofeePriceW = marketPrice.median_price;
    rgItem.description.priceDateMs = marketPrice.priceDateMs;
    if (marketPrice.volume) {
      rgItem.description.volume = marketPrice.volume;
    }
    if (marketPrice.providerName) {
      rgItem.description.providerName = marketPrice.providerName;
    }


    setSIHPrice(transport.request.url, rgItem.description.lowestPrice);

    if (!sihData.isSellInventory) {
      if (g_bViewingOwnProfile) {
        if (g_ActiveInventory.selectedItem) {
          if (!rgItem.countGroupInventory || rgItem.countGroupInventory === 1) {
            setTimeout(() => {
              const strMarketName = GetMarketHashName(rgItem.description);
              loadQuickSellForInventoryItem(strMarketName);
              loadInstantSellForInventoryItem(rgItem);
            }, 500);
          }
        }
      }
    }
  }

  loadRightInventoryPanel(rgItem);
}

function loadRightInventoryPanel(gitem = null) {
  const sItem = gitem || g_ActiveInventory.selectedItem;
  if (sItem.appid == 753 && !sItem.description.marketable && !checkIfItemWillBeMarketable()) {
    return;
  }
  if (!sItem.description.market_hash_name) {
    sItem.description.market_hash_name = sItem.description.name;
  }
  let isGenuine = false;

  $J.each(sItem.description.tags, function () {
    isGenuine = (isGenuine || (this.category == 'Quality' && this.internal_name == 'genuine'));
    if (isGenuine) return false;
  });

  if (sItem.description.descriptions === undefined) sItem.description.descriptions = [{type: 'html', value: ''}];

  floatInventoryButton(sItem);

  agpGem(sItem);

  SIH?.stickerPrices?.load(sItem);

  if (g_inventoryData[g_ActiveInventory.appid].isLoadFirst) {
    selectAllInventory(sItem);
  }

  PriceQueue.GenPriceDescription(sItem.description);

  setTimeout(() => {
    reloadDes();

    if (selectmode) {
      $J(`.item_market_actions`).hide();
    }
    const marketLink = window.location.protocol + "//steamcommunity.com/market/listings/" + sItem.appid + "/" + encodeURIComponent(sItem.description.market_hash_name);
    $J('.dd_price').find('a').attr('href', marketLink);
  }, 0);


}

function floatInventoryButton(sItem) {
  const index = sItem.description.descriptions.findIndex(x => x.isFloat);

  if (index > -1) {
    sItem.description.descriptions.splice(index, 1);
  }

  if (selectmode) {
    return;
  }

  const isWeapon = checkWeapon(sItem.description.tags);
  const isStack = Array.isArray(sItem.groupInventories) && sItem.groupInventories.length > 1;

  if (!isStack && isWeapon && sItem.description.actions && sItem.description.actions.length) {
    const btnGetFloat = `
            <div class="float_block">
                <a class="item_market_action_button item_market_action_button_green floatbutton" href="javascript:void(0);">
                    <span class="item_market_action_button_edge item_market_action_button_left"></span>
                    <span class="item_market_action_button_contents">${SIHLang.market.getfloat}</span>
                    <span class="item_market_action_button_edge item_market_action_button_right"></span>
                    <span class="item_market_action_button_preload"></span>
                </a>
                <div class="spinner"></div>
            </div>
        `;
    sItem.description.descriptions.unshift({
      isFloat: true,
      type: 'html',
      value: btnGetFloat
    });
  }
}

function selectAllInventory(sItem) {

  const index = sItem.description.descriptions.findIndex(x => x.iscount);

  if (index > -1) {
    sItem.description.descriptions.splice(index, 1);
  }

  const similarCount = g_bViewingOwnProfile ? `(<a href="javascript:selectSimilar('${sItem.description.market_hash_name}')">${SIHLang.selectall}</a>)` : '';
  sItem.description.descriptions.unshift({
    iscount: true,
    type: 'html',
    value: `<div class="select_all_inventory">${SIHLang.numowned}: <i style="color: rgb(153, 204, 255); font-size: 16px">${sItem.description.useCountMarketHashName}</i> ${similarCount}</div>`
  });
}

function setSIHPrice(url, lowestPrice) {
  const appid = expAppID.exec(url)[1];
  const currency = PriceQueue._getCurrencyCodeSteam();
  const name = expMarketHashName.exec(url)[1];
  const data = {
    url,
    body: {
      appid, name, currency, price: getPriceAsInt(lowestPrice)
    }
  };

  chrome.runtime.sendMessage(SIHID, {type: 'SET_STEAM_PRICE', data}, (e) => {
  });
}

const addInstantSellButton = (item, elActions) => {
  $J(elActions).find('#instantsellbtn').remove();
  var instantSellBt = CreateMarketActionButton('green', 'javascript:void(0);', SIHLang.instantsell.replace('$1', '---'));
  instantSellBt.id = 'instantsellbtn';
  elActions.appendChild(instantSellBt);
  $J(elActions).find('#instantsellbtn').addClass('sih-disabled');

  const strMarketName = GetMarketHashName(item.description);
  const marketListingsURL = window.location.protocol + '//steamcommunity.com/market/listings/' + item.appid + '/' + encodeURIComponent(strMarketName);

  RequestCacher.get({
    type: 'GET',
    url: marketListingsURL
  }).then((response) => {
    var nameid = response.match(/Market_LoadOrderSpread\( (\d+)/)[1];

    RequestCacher.get({
      url: `${window.location.protocol}//steamcommunity.com/market/itemordershistogram`,
      type: 'GET',
      data: {
        country: g_strCountryCode,
        language: 'english',
        currency: (g_rgWalletInfo && g_rgWalletInfo.wallet_currency ? g_rgWalletInfo.wallet_currency : 1),
        item_nameid: nameid,
        two_factor: 0
      }
    }).then((data) => {
      if (data.success && data.highest_buy_order) {
        var nAmount = parseInt(data.highest_buy_order, 10);
        var publisherFee = window.PriceUtils.publisherFee(item, g_rgWalletInfo);
        var feeInfo = CalculateFeeAmount(nAmount, publisherFee);
        nAmount = nAmount - feeInfo.fees;
        if (nAmount <= 0) nAmount = 1;

        var info = CalculateAmountToSendForDesiredReceivedAmount(nAmount, publisherFee);
        var inputValue = info.amount;
        var sellingPrice = v_currencyformat(inputValue, GetCurrencyCode(g_rgWalletInfo.wallet_currency));

        if (g_ActiveInventory.selectedItem.description.market_hash_name === item.description.market_hash_name) {
          $J(elActions).find('#instantsellbtn').remove();
          var instantSellBt = CreateMarketActionButton('green', 'javascript:void(0);', SIHLang.instantsell.replace('$1', sellingPrice));
          instantSellBt.id = 'instantsellbtn';
          $J(elActions).find('#instantsellbtn').removeClass('sih-disabled');

          const elPriceInfoContent = $J('.item_market_actions:visible').find('div div:last');
          $J(instantSellBt).click(function () {
            elPriceInfoContent.html('<img src="' + window.location.protocol + '//steamcommunity-a.akamaihd.net/public/images/login/throbber.gif" alt="Working...">');
            SellItemDialog.m_item = item;
            $J.ajax({
              url: 'https://steamcommunity.com/market/sellitem/',
              type: 'POST',
              data: {
                sessionid: g_sessionID,
                appid: item.appid,
                contextid: item.contextid,
                assetid: item.assetid,
                amount: 1,
                price: nAmount
              },
              crossDomain: true,
              xhrFields: {withCredentials: true}
            }).done(function (data) {
              SellItemDialog.OnSuccess({responseJSON: data});
            }).fail(function (jqxhr) {
              // jquery doesn't parse json on fail
              elPriceInfoContent.html('Error...');
              var data = $J.parseJSON(jqxhr.responseText);
              SellItemDialog.OnFailure({responseJSON: data});
            });
          });

          elActions.appendChild(instantSellBt);
        }
      } else {
        console.log('nothing');
      }
    });
  });
}

function ajaxDataLoadingProcess(isLoad, marketHashName = '') {
  let $elem = $J('#_priceQueueContV2');

  if ($elem.length === 0) {
    const cnt = $J('<div id="_priceQueueContV2" class="pq-container"><div class="pq-timer"><div class="pq-progress">&nbsp;</div></div><div class="pq-info">&nbsp;</div></div>');
    $J('body').append(cnt);
  }
  $elem = $J('#_priceQueueContV2');

  if (isLoad) {
    $elem.find('.pq-progress').stop().css({width: '1%'}).animate({width: '100%'}, 800);
    $elem.find('.pq-info').html(`${marketHashName} <br /> 1 items remain - 0 errors`);
    $elem.show();
  } else {
    $elem.hide();
  }
}

function copyDuplicateInventory(rgItem) {
  const rgAssets = Object.keys(g_ActiveInventory.m_rgAssets).map(function (k) {
    return g_ActiveInventory.m_rgAssets[k]
  });
  const item = rgAssets.find(item => item.description.market_hash_name === rgItem.description.market_hash_name && item.description.lowestPrice);

  if (item) {
    rgItem.description.transport = item.description.transport;
    rgItem.description.lowestPrice = item.description.lowestPrice;
    rgItem.description.lowestPriceW = item.description.lowestPriceW;
    rgItem.description.nofeePrice = item.description.nofeePrice;
    rgItem.description.nofeePriceW = item.description.nofeePriceW;
    rgItem.description.volume = item.description.volume;
    rgItem.description.providerName = item.description.providerName;
  }
}

if (typeof (window.fastdelta) == 'undefined') window.fastdelta = -0.01;
if (typeof (window.delaylistings) == 'undefined') window.delaylistings = 200;
if (typeof (window.quicksellbuttons) == 'undefined') window.quicksellbuttons = true;
if (typeof (window.buysetbuttons) == 'undefined') window.buysetbuttons = true;

// Prototype Steam
if (IS_ENABLED_SIH) {
  var ShowItemInventoryMaster = ShowItemInventory;
  var ShowItemInventory = (appid, contextid, assetid, bLoadCompleted) => {
    hideGroupInventoryApp();
    const isChecked = g_inventoryData[g_ActiveInventory.appid] ? g_inventoryData[g_ActiveInventory.appid].isCheckbox : false;
    $J('#switcherGroupInventory').prop('checked', isChecked);
    if (!g_inventoryData[appid]) {
      g_isLocalReloadAllInventory = false;
      disabledControls(true);
    }
    const res = ShowItemInventoryMaster(appid, contextid, assetid, bLoadCompleted);


    if (window.extprice) {
      SetupExternalDropdown(g_ActiveInventory.appid);
    }

    return res;
  }

  CInventory.prototype.MakeActiveMaster = CInventory.prototype.MakeActive
  CInventory.prototype.MakeActive = function () {

    if (this.m_bPerformedInitialLoad) {
      loadImprovedInventoryNav();
    }
    this.MakeActiveMaster()
  }

  CInventory.prototype.LoadMoreAssetsMaster = CInventory.prototype.LoadMoreAssets;
  CInventory.prototype.LoadMoreAssets = function (count) {
    if (g_isLocalReloadAllInventory) {

      this.m_$Inventory.addClass('loading');

      this.m_owner.ShowLoadingIndicator();

      this.m_bPerformedInitialLoad = true;
      this.m_$Inventory.removeClass('loading');

      this.AddInventoryData(Object.assign({}, g_inventoryData[g_ActiveInventory.appid].data));
      this.m_tsLastError = 0;
      this.HideInventoryLoadError();
      this.m_SingleResponsivePage.EnsurePageItemsCreated();

      if (this.m_parentInventory)
        this.m_parentInventory.m_SingleResponsivePage.EnsurePageItemsCreated();

      this.m_owner.HideLoadingIndicator();

      for (var i = 0; i < this.m_rgOnItemsLoadedCallbacks.length; i++)
        this.m_rgOnItemsLoadedCallbacks[i]();

      return null;

    } else {
      count = 5000;

      return this.LoadMoreAssetsMaster(count).done(() => {
        loadAllInventory()
      });
    }
  }

  CInventory.prototype.AddInventoryDataMaster = CInventory.prototype.AddInventoryData;
  CInventory.prototype.AddInventoryData = function (data) {

    if (!g_isLocalReloadAllInventory) {
      loadInventoryData(data);
    }

    data.assets.forEach((item) => {
      delete item.groupInventories;
    });

    const switcherGroupInventory = $J('#switcherGroupInventory').is(":checked");
    let assets = {};
    if (switcherGroupInventory) {

      inventoryAssign(data.assets, g_inventoryData[g_ActiveInventory.appid].profile.rgDescriptions);

      data.assets.forEach((item) => {

        const key = `${item.profile.marketHashName}_${item.profile.cacheExpiration.date ? 'ce' : ''}`;

        if (!assets[key]) {
          assets[key] = [];
        }
        assets[key].push(item);
      })
      data.assets = [];
      for (const i in assets) {
        assets[i].sort((a, b) => ((a.profile.cacheExpiration.date || 0) > (b.profile.cacheExpiration.date || 0)) ? 1 : (((b.profile.cacheExpiration.date || 0) > (a.profile.cacheExpiration.date || 0)) ? -1 : 0));
        assets[i].forEach((x) => {
          x.countGroupInventory = assets[i].length;
          x.groupInventories = assets[i];
        })
        const item = assets[i][0];
        data.assets.push(item);
      }
      data.total_inventory_count = data.assets.length;
    }

    data.descriptions.forEach((item) => {
      const objs = [kStandardTag_Tradable, kStandardTag_Untradable, kStandardTag_Marketable, kStandardTag_Unmarketable];
      if (Array.isArray(item.tags)) {
        for (const i in objs) {
          const obj = objs[i];
          const ind = item.tags.findIndex(x => x.internal_name == obj.internal_name && x.category == obj.category);
          if (ind > -1) {
            item.tags.splice(ind, 1);
          }
        }
      }
    })

    this.AddInventoryDataMaster(data);

    if (switcherGroupInventory) {
      data.assets.forEach((item) => {
        item.description.useCountMarketHashName = item.countGroupInventory
      })
      loadGroupInventoryDialog();
    }
  }

  var InventoryNextPageMaster = InventoryNextPage;
  var InventoryNextPage = () => {
    InventoryNextPageMaster();
    loadGroupInventoryDialog();
    loadInventorySelectionFromInventoryGroup();
  }

  var InventoryPreviousPageMaster = InventoryPreviousPage;
  var InventoryPreviousPage = () => {
    InventoryPreviousPageMaster();
    loadGroupInventoryDialog();
    loadInventorySelectionFromInventoryGroup();
  }

  var g_elActions = null;
  var PopulateMarketActionsMaster = PopulateMarketActions;
  var PopulateMarketActions = (elActions, item) => {
    PopulateMarketActionsMaster(elActions, item);
    g_elActions = elActions

    if (g_bViewingOwnProfile) {
      if (item.countGroupInventory > 1) {
        const $itemMarketActions = $J('#active_inventory_page .item_market_actions');
        $itemMarketActions.find('.item_market_action_button').remove();

        const isWeapon = isUniqueInventory(item.description.tags);
        $itemMarketActions.append(`<div>
                    <button class="group_inventory_select_multiple_for_cell_btn">${SIHLang.selectMultiple}</button>
                    <button class="group_inventory_choose_all_for_cell_btn" style="margin-left: 10px;">${SIHLang.chooseAll}</button>
                    </div>`);

        $itemMarketActions.find('.group_inventory_select_multiple_for_cell_btn').click(function () {
          if (!selectmode) {
            $J('#Lnk_Sellmulti').click();
          }
          GroupInventoryDialog.Show(item.element, isWeapon, true);
        });

        $itemMarketActions.find('.group_inventory_choose_all_for_cell_btn').click(function () {
          if (!selectmode) {
            $J('#Lnk_Sellmulti').click();
          }
          $J(item.element).parent().find('.selectedSell').remove();
          $J(item.element).addClass('group_inventory_master_selected_sell');
          item.element.rgItem.groupInventories.forEach((data, i) => {
            data.isSelectedForSell = true;
            addSell(item.element, data, i);
          })
          sellBtn();
          loadNumberSelectedInventory(item.element.rgItem);
        })
      }
    }
  }

  var g_sih_isSelectItem = false;
  var g_sih_selectItem = null
  CInventory.prototype.SelectItemMaster = CInventory.prototype.SelectItem;
  CInventory.prototype.SelectItem = function (event, elItem, rgItem, bUserAction) {
    g_sih_isSelectItem = true;
    g_sih_selectItem = rgItem;
    return this.SelectItemMaster(event, elItem, rgItem, bUserAction);
  }


  let AjaxRequestMaster = Ajax.Request;
  Ajax.Request = function (url, data) {
    data.sihData = data.sihData || {}

    const onSuccess = data.onSuccess;
    data.onSuccess = function (transport) {

      if (url.indexOf('/market/priceoverview') > -1) {
        ajaxDataLoadingProcess(false, data.parameters.market_hash_name);
        marketPriceOverviewDone(transport, data.sihData);
      }

      onSuccess(transport);
    }

    const onFailure = data.onFailure;
    data.onFailure = function (transport) {
      if (url.indexOf('/market/priceoverview') > -1) {
        ajaxDataLoadingProcess(false, data.parameters.market_hash_name);
      }
      onFailure(transport);
    }

    if (url.indexOf('/market/priceoverview') > -1) {
      ajaxDataLoadingProcess(true, data.parameters.market_hash_name);
      QuickSellForInventoryItem.removeButton(g_elActions);
      $J(g_elActions).find('#instantsellbtn').remove();

      const rgItem = g_sih_selectItem ? g_sih_selectItem : data.sihData.rgItem;
      data.sihData.rgItem = rgItem;
      g_sih_selectItem = null;

      if (selectmode) {
        if (g_sih_isSelectItem) {
          g_sih_isSelectItem = false;
          data.onSuccess(rgItem.description.transport || {
            responseJSON: {
              success: true
            }
          });
          return;
        } else {
          g_sih_isSelectItem = false;
        }
      } else {
        g_sih_isSelectItem = false;

        if (rgItem && !rgItem.description.lowestPrice) {
          copyDuplicateInventory(rgItem);
        }

        if (rgItem && rgItem.description.lowestPrice) {
          data.onSuccess(rgItem.description.transport);
          return;
        }
      }
    }

    new AjaxRequestMaster(url, data);
  }
  Ajax.Request.__proto__ = AjaxRequestMaster;
}


/*let AjaxRequestMaster = Ajax.Request;
Ajax.Request = function (url, data) {
  $J.ajax({
    url: url,
    type: data.method,
    data: data.parameters,
    error: function (error) {
      data.onSuccess(error);
    },
    success: function (response) {
      data.onSuccess({responseJSON: response});
    }
  });
}*/

