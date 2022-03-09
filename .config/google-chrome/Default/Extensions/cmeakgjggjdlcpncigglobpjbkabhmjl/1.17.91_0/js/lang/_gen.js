var SIHLang = {};
var BaseSIHLang = {
  noreload: "No inventory reloading when sell item",
  quickbuy: "Quick buy",
  reloadinvent: "Reload inventory (alt + R)",
  selectitem: "Select items",
  selectall: "Select all",
  turngems: "Turn into gems",
  sendgifts: "Send gifts",
  cancel: "Cancel",
  total: "Total price",
  loading: "Loading...",
  inventvalue: "Inventory value",
  steamprice: "Steam Price",
  sold24h: "sold in the last 24 hours",
  numowned: "Number owned",
  sell1item: "Sell 1 item",
  sellnitem: "Sell $1 items",
  quicksell: "Quick sell this at $1",
  noitemstoconvertintogems: "There is no items to convert into gems (selected items are not convertible).",
  confirmitemconversionintogems: "Did you want to convert these items into Gems? It cannot be undone.",
  instantsell: "Instant sell this at $1",
  buymissing: "Buy missing items",
  autoaccept: "Accept all items automatically",
  autoadjust: "Autoadjust prices by market",
  historynoselect: "Select item",
  sponsors: "SIH's Sponsors",
  functions: "Functions",
  externalprices: "External prices",
  showpriceproviders: "Show price providers",
  hidepriceproviders: "Hide price providers",
  maxnumprovidersselectedwarn: "Due to the size of the item’s cell, it is impossible to select more than 5 price providers at the same time.",
  adjusterrormessage: "WARNING! When calculating the value of an item for a buyer, a rounding operation is applied on the Steam side. In this regard, for some values of the item value fields, the difference between the expected value and the total item value on the marketplace may differ by several cents.",
  adjusterrormessagetooltip: "You can turn off the display of this warning in the SIH settings: Inventory / Show price difference warning in bulk sale window",
  buysetoutofstock: "Currently out of stock",
  info: {
    viewcm: "View in Community Market",
    startingAt: "Starting at",
    nosales: "There are no listings currently available for this item.",
    last24: "%1$s sold in the last 24 hours",
    volume: "Volume",
    sell: "Sell",
    noproviders: "Unfortunately we don't have any price providers for this game. Please send us the message with a link to provider to whom you trust and whom you would like to see in the prices in our application. We will surely add their prices if its possible."
  },
  market: {
    selectoverpriced: "Select all overpriced",
    removeselected: "Remove selected",
    remove: "Remove",
    reloadlistings: "Reload listings (alt + R)",
    hidelistings: "Hide listings",
    showlistings: "Show listings",
    total: "Total",
    minimum: "Min.price",
    addbookmarks: "Add to bookmarks",
    mybookmarks: "My bookmarks",
    general: "General",
    all: "All",
    addcategory: "Add category",
    sortfloat: "Sort By Float",
    viewglws: "View on glws",
    getfloat: "Get Float",
    priceMarketFrom: "from",
    priceMarketBestPrice: "BEST PRICE",
    priceSteamBestPrice: "STEAM Price",
    priceMarketButton: "GO TO OFFERS",
    accordionInventoryDescription: "Description",
    inventoryOfferText: "offers from",
    inventoryLots: "Lots",
    marketServiceCommission: 'Service commission is already in the price',
    exteriorFN: 'Factory new',
    exteriorMW: 'Minimal Wear',
    exteriorFT: 'Field-Tested',
    exteriorWW: 'Well-Worn',
    exteriorBS: 'Battle-Scarred',
    sentenceBlockSettings: 'Sentence block settings',
    currencyPrice: 'Currency price',
    informationFromSites: 'Information from sites',
    averagePriceOfSiteOffers: 'Average price of lots',
    numberOfLots: 'Number of lots',
    numberOfLotsAlert: 'The number of lots put up for sale at the same time, in each of the stores',
    tradingPlatformCommissions: 'Trading platform commisions, % + fixed fee, $',
    getFloatAndStickerWear: 'Get float and sticker wear',
    stickerPriceButton: 'Get sticker prices',
    getAutoFloatAndStickerWear: 'Get float and wear stickers by default',
    goPage: 'go',
    pageFrom: 'from',
    exchangePrice: 'Trade price',
    commissionFeesAlert: 'Commission fees (for depositing an account, tax on exchanging skins in the exchanger). Set in % for buying or exchanging an item.',
    betaVersion: 'Beta',

    feedbackButton: 'I found an error',

    feedbackStep1Title: 'What happened?',
    feedbackStep1AppTitle: 'Problems with the offer',
    feedbackStep1AppDescription: 'For example, the price does not match the actual offer from the market',
    feedbackStep1SIHTitle: 'SIH errors',
    feedbackStep1SIHDescription: 'Write to us if you find a bug or think that some functionality is not working correctly',

    feedbackStep2AppTitle: 'Problems with the offer',
    feedbackStep2AppSelectMarketTitle: 'Select the marketplace you are having trouble with:',
    feedbackStep2AppOption1: 'Price does not match',
    feedbackStep2AppOption2: 'The market does not work in my country',
    feedbackStep2AppOption3: 'Link leads to another subject',
    feedbackStep2AppOption4: 'Other',

    feedbackStep2CancelButton: 'BACK',
    feedbackStep2OkButton: 'COMPLAIN',

    feedbackStep2SIHTitle: 'SIH errors',
    feedbackStep2SIHOption1: 'I found an error',

    feedbackStepDescriptionPlaceholder: 'Tell us more',

    favoritesButton: 'TO FAVORITES',
    blockBestOfferOfMarketplaceTabs1Title: 'Description',
    blockBestOfferOfMarketplaceTabs2Title: 'Lots from',
    blockBestOfferOfMarketplaceSteamTitle: 'STEAM PRICE from',
    blockBestOfferOfMarketplaceSteamButton: 'BUY NOW',
    blockBestOfferOfMarketplaceMarketTitle: 'BEST PRICE ON MARKETS from',
    blockBestOfferOfMarketplaceMarketCommission: 'commission',
    blockBestOfferOfMarketplaceMarketButton: 'TO STORE',
    blockBestOfferOfMarketplaceStatsTitle: 'Sold on Steam',
    blockBestOfferOfMarketplaceStatsDay: ' - per day',
    blockBestOfferOfMarketplaceStatsWeek: ' - per week',
    blockBestOfferOfMarketplaceStatsMonth: ' - per month',

    marketCommodityOrderSpreadAccordionButtonDown: 'SHOW MORE ORDERS',
    marketCommodityOrderSpreadAccordionButtonUp: 'SHOW Less ORDERS',

    marketCommodityOrderSpreadMarginTD: 'Margin',
    marketCommodityOrderSpreadWithoutFeesTD: 'Without fees',
    marketCommodityOrderSpreadPriceTD: 'Price',
    marketCommodityOrderSpreadQuantityTD: 'Quantity',

    marketCommodityOrderSpreadSettingsDialogInfo: 'Need more data?',
    marketCommodityOrderSpreadSettingsDialogButton: 'Settings',
    marketCommodityOrderSpreadSettingsDialogTitle: 'Setting up a table',
    marketCommodityOrderSpreadSettingsDialogDescription: 'Set the display of the columns you want',
    marketCommodityOrderSpreadSettingsDialogCancelButton: 'Cancel',
    marketCommodityOrderSpreadSettingsDialogSaveButton: 'Save',

    viewLotsProfitability: 'Show profitability of lots',

    searchPaintSeedBlockTitle: 'Marking by Paint Seed',
    searchFloatBlockTitle: 'Float marking',
    searchPaintSeedAndFloatBlockButtonTitle: 'SEARCH BY PAINT SEED AND FLOAT',

    searchPaintSeedAndFloatBlockSavedFiltersTitle: 'Your filters',
    searchPaintSeedAndFloatBlockEditingFilterLink: 'Edit',
    searchPaintSeedAndFloatBlockCreatedFilterLink: '+ Save to filter',
    searchPaintSeedAndFloatBlockDefaultName: 'Filter',
    searchPaintSeedAndFloatBlockNotFilters: 'You don\'t have any saved filters yet',

    searchPaintSeedAndFloatBlockDeletedFilterLink: 'Delete',
    searchPaintSeedAndFloatBlockCreatedValueLink: '+ Add field',
    searchPaintSeedAndFloatBlockSaveLink: 'Save',
    searchPaintSeedAndFloatBlockCancelLink: 'Cancel',
    searchPaintSeedAndFloatBlockApplyLink: 'Apply',

    searchPaintSeedBlockValueTitle1: 'Enter the pattern value (1 - 999)',
    searchPaintSeedBlockValueTitle2: 'Applied "$1"',
    searchFloatBlockValueTitle: 'Enter extreme float values',
    searchFloatBlockValueFromName: 'from',
    searchFloatBlockValueToName: 'to',

  },
  queue: {
    items: "Items",
    withfee: "Total",
    withoutfee: "Without comission",
    manualsell: "Manual selling",
    autosell: "Auto-selling",
    removeitem: "Remove from queue",
    removelower: "Remove lower",
    removehigher: "Remove higher",
    removeintrade: "Remove in-trade",
    removeequipped: "Remove equipped",
    takelower: "Take lower",
    takehigher: "Take higher",
    emptyprice: "Remove no price"
  },
  sort: {
    sortitem: "Sort items",
    price: "By Price",
    name: "By Name",
    float: "By Float",
    blocking: "By Blocking time"
  },
  tradingcards: {
    buyall: "Buy all",
    reload: "Reload list",
    dialogtitle: "Buy missing cards",
    showpopup: "Show buy cards dialog"
  },
  profile: {
    communityban: "Community banned",
    tradeban: "Trade banned",
    vacban: "VAC banned",
    none: "None",
    banned: "Banned"
  },
  tradeoffers: {
    removeall: "Remove all",
    takeall: "Take all",
    totalprice: "Get total",
    notrash: "No trash",
    skipintrade: "Skip in-trade items",
    noduplicate: "No duplicate",
    noofitems: "Number of items",
    recount: "Recount",
    youritems: "Your items",
    theiritem: "Their items"
  },
  nontradable: {
    counter: "items not tradable yet",
    startdate: "First ones at",
    lastdate: "Last ones at",
    totalprice: "Total price"
  },
  selectMultiple: "Select multiple",
  chooseAll: "Choose all",
  howManyDoYouWantToChoose: "How many do you want to choose?",
  selectItemCount: "Select $1 items",
  filtrationHistoryMarketName: "Event filter",
  uploadHistoryMarket: "Upload $1",
  collapseHistoryMarket: "COLLAPSE ADDITIONAL LINES",
  historySaleSlotPlaced: "Lot posted",
  historySaleSlotRemoved: "Lot removed",
  historySaleSlotPurchased: "Lot bought",
  historySaleSlotSold: "Lot sold",

  filterPaintSeedBtn: 'Filter by Paint Seed',
  filterPaintSeedState: 'Apply filters by Paint Seed',
  filterPaintSeedPlaceHolderNewFilter: 'Enter the title',
  filterPaintSeedNewBtn: 'Create filter',
  filterPaintSeedSelectLabel: 'Select a saved filter',
  filterPaintSeedSettingLabel: 'Enter the pattern, separated by commas:',
  filterPaintSeedNewSettingBtn: 'Add field',

  filterFloatBtn: 'Filter by Float',
  filterFloatGlobalBtn: 'Global',
  filterFloatState: 'Apply filters by Float',
  filterFloatPlaceHolderNewFilter: 'Enter the title',
  filterFloatNewBtn: 'Create filter',
  filterFloatSelectLabel: 'Select a saved filter',
  filterFloatSettingLabel: '"Factory New" float value 0 - 0.07:',
  filterFloatSettingLabelFrom: 'from',
  filterFloatSettingLabelTo: 'to',
  filterFloatNewSettingBtn: 'Add field'

};

function ReloadLang() {
  SIHLang = jQuery.extend(true, {}, BaseSIHLang, SIHLang);
  jQuery('[data-lang]').each(function (e, i) {
    var code = jQuery(this).data('lang').split('.');
    var msg = SIHLang[code[0]];
    for (var i = 1; i < code.length; i++) {
      msg = msg[code[i]];
    }

    if (msg != null && msg)
      jQuery(this).html(msg);
  });
}

function formatNumber(totalPrice) {
  if (v_currencyformat && GetCurrencyCode && (typeof (currencyId) != 'undefined' || typeof (g_rgWalletInfo) != 'undefined')) {
    if (typeof (currencyId) != 'undefined') {
      return v_currencyformat(totalPrice * 100, GetCurrencyCode(parseInt(currencyId)));
    } else {
      return v_currencyformat(totalPrice * 100, GetCurrencyCode(g_rgWalletInfo['wallet_currency']));
    }
  }

  var totalStr = totalPrice.toFixed(2) + '';
  if (totalStr.lastIndexOf('.') == -1) totalStr += '.00';
  //totalStr = totalStr.replace(/(\d)(\d{3})([,\.])/, '$1,$2$3');
  return totalStr;
}

function getNumber(priceStr) {
  // var pp = /([\d\.,]+)/.exec(price.replace(/\&#.+?;/g, '').replace(' p&#1091;&#1073;.', '').replace(/\s/, '').replace(/[^\d,\.]/g, '').replace(/[^\d]$/g, ''));
  // pp = pp ? pp[1].replace(/,(\d\d)$/g, '.$1').replace(/\.(\d\d\d)/g, '$1').replace(/,(\d\d\d)/g, '$1') : 0;
  const pp = priceStr
    .replace(',', '.')
    .replace(/[^\d.]/g, '')
    .trim();
  return pp;
}
