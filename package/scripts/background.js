const TSB = {};

TSB._url = null;
TSB._scKey = null;
TSB._site = null;

TSB._storage = chrome.storage.local;

TSB.log = function (obj) {
  console.log(obj);
};

TSB._loadSettings = async function () {
  const data = await TSB._storage.get(["opt:key", "opt:site", "url:current"]);
  TSB._url = !data["url:current"] ? "" : data["url:current"];
  TSB._site = !data["opt:site"] ? "" : data["opt:site"];
  TSB._scKey = !data["opt:key"] ? "q" : data["opt:key"];
};

TSB.url = async function () {
  if (!TSB._url) {
    await TSB._loadSettings();
    // TSB.log("[TSB.url] get on storage: " + TSB._url);
  } else {
    // TSB.log("[TSB.url] get on memory: " + TSB._url);
  }
  return TSB._url;
};

TSB.scKey = async function () {
  if (!TSB._scKey) {
    await TSB._loadSettings();
    // TSB.log("[TSB.url] get on storage: " + TSB._scKey);
  } else {
    // TSB.log("[TSB.url] get on memory: " + TSB._scKey);
  }
  return TSB._scKey;
};

TSB.availableSite = async function () {
  if (!TSB._site) {
    await TSB._loadSettings();
    // TSB.log("[TSB.availableSite] get on storage: " + TSB._site);
  } else {
    // TSB.log("[TSB.availableSite] get on memory: " + TSB._site);
  }
  return TSB._site;
};

TSB.reloadSettings = async function () {
  await TSB._loadSettings();
};

TSB.settings = async function () {
  const data = {};
  data.shortcutKey = await TSB.scKey();
  data.availableSite = await TSB.availableSite();
  data.currentUrl = await TSB.url();

  // TSB.log(data);
  return data;
};

TSB._getStocks = async function () {
  const data = await TSB._storage.get([
    "opt:stocks:enabled",
    "opt:stocks:capacity",
    "url:stocks",
  ]);
  // TSB.log(data);

  const isStockEnabled = !data["opt:stocks:enabled"]
    ? false
    : data["opt:stocks:enabled"];

  if (isStockEnabled) {
    const stockCapacity = !data["opt:stocks:capacity"]
      ? 5
      : parseInt(data["opt:stocks:capacity"]);
    const stocks = !data["url:stocks"] ? [] : data["url:stocks"];
    return {
      isEnabled: isStockEnabled,
      capacity: stockCapacity,
      data: stocks,
    };
  } else {
    return {
      isEnabled: isStockEnabled,
      capacity: 0,
      data: [],
    };
  }
};

TSB.push = async function (url, name) {
  const stocks = await TSB._getStocks();
  // TSB.log(stocks);

  if (!stocks.isEnabled) return;

  let isContains = false;
  for (const item of stocks.data) {
    if (item.url === url) {
      isContains = true;
      item.name = name;
      item.updated_at = new Date().toLocaleString();
      break;
    }
  }

  if (!isContains) {
    stocks.data.push({
      url: url,
      name: name,
      updated_at: new Date().toLocaleString(),
    });
  }

  // TSB.log(`[TSB.push] ${url}`);
  // TSB.log(stocks.data.slice(-(stocks.capacity)));

  await TSB._storage.set({ "url:stocks": stocks.data.slice(-stocks.capacity) });
};

TSB.item = async function (idx) {
  const stocks = await TSB._getStocks();

  if (idx < stocks.data.length) {
    // TSB.log(`[TSB.item] [${idx}] ${stocks.data[idx].url}`);
    return stocks.data[idx];
  }

  // TSB.log(`[TSB.item] [${idx}] is null`);
  return null;
};

TSB.update = async function (url) {
  await TSB._storage.set({ "url:current": url });
  TSB._url = url;

  // TSB.log(`[TSB.update] ${url}`);
};

// async function getCurrentTab() {
//   let queryOptions = { active: true, lastFocusedWindow: true };
//   // `tab` will either be a `tabs.Tab` instance or `undefined`.
//   let [tab] = await chrome.tabs.query(queryOptions);
//   return tab;
// }

async function save(url, name) {
  await TSB.push(url, name);
  await TSB.update(url);
}

// async function change(idx) {
//   const item = TSB.item(idx);
//   if (!item) return;

//   await TSB.update(item.url);
// }

function load(tabId, url) {
  chrome.tabs.update(tabId, { url: url });
}

// chrome.runtime.onInstalled.addListener(() => {
//   console.log("installed");
// });

const OBSERVATION_KEYS = ["opt:key", "url:current", "opt:site"];

chrome.storage.onChanged.addListener((changes, namespace) => {
  // TSB.log("[storage.onChanged(changes, namespace)]");
  // TSB.log(changes);
  // TSB.log(namespace);
  const needReloadSettings = Object.keys(changes).find((k) =>
    OBSERVATION_KEYS.includes(k)
  );
  if (needReloadSettings) {
    TSB.reloadSettings();
    // TSB.settings().then((opts) => {
    //   TSB.log(`[ReloadSettingsOnStorageChanged] key: ${opts.shortcutKey}, url: ${opts.shortcutKey}, site: ${opts.availableSite}`);
    // });
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  const url = tab.url;
  const title = tab.title;
  // console.log(`[ExtensionIcon.onClicked] ${url}`);
  save(url, title);
});

function isAvailableSite(url, availableSite) {
  return !availableSite || url.startsWith(availableSite);
}

chrome.runtime.onMessage.addListener((requestData, sender, sendResponse) => {
  // console.log(action)
  // console.log(sender)

  if (requestData.event === "validate") {
    TSB.settings().then((opts) => {
      if (
        requestData.key === opts.shortcutKey &&
        isAvailableSite(requestData.url, opts.availableSite)
      ) {
        sendResponse(opts);
      } else {
        sendResponse(false);
      }
    });
    // Return True to wait for sendResponse executing.
    return true;
  } else if (requestData.event === "quick_access") {
    // TSB.log("[onMessage] key: " + requestData.key + ", useModifierKey: " + requestData.useModifierKey + ", title: " + sender.tab.title + ", url: " + sender.url);
    if (requestData.useModifierKey) {
      save(requestData.url, requestData.title).then((_) => {
        sendResponse(true);
      });
    } else {
      load(sender.tab.id, requestData.opts.currentUrl);
    }
    // Return True to wait for sendResponse executing.
    return true;
  }

  // Returns False because no need to wait for sendResponse executing.
  return false;
});
