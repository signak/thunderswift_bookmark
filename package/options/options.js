const DEFAULT_CAPACITY = 5;
const DEFAULT_SCKEY = "q";

const OPT = {};

OPT._container = document.getElementById("options");
OPT._loading = document.getElementById("loading");
OPT._snackbar = document.getElementById("snackbar");
OPT._storage = chrome.storage.local;

OPT._lastModifiedTextFieldId = null;
OPT.setLastModifiedTextFieldId = function (id) {
  OPT._lastModifiedTextFieldId = id;
};
OPT.getLastModifiedTextFieldId = function () {
  return OPT._lastModifiedTextFieldId;
};
OPT.hasLastModifiedTextFieldId = function () {
  return OPT._lastModifiedTextFieldId ? true : false;
};
OPT.clearLastModifiedTextFieldId = function () {
  OPT._lastModifiedTextFieldId = null;
};

OPT.log = function (obj) {
  console.log(obj);
};

OPT.loadOptions = async function () {
  const raw = await OPT._storage.get([
    "opt:key",
    "opt:site",
    "opt:stocks:enabled",
    "opt:stocks:capacity",
    "url:current",
    "url:stocks",
  ]);

  const data = {
    shortcutKey: !raw["opt:key"] ? DEFAULT_SCKEY : raw["opt:key"],
    availableSite: !raw["opt:site"] ? "" : raw["opt:site"],
    isStocksEnabled: !raw["opt:stocks:enabled"]
      ? false
      : raw["opt:stocks:enabled"],
    stocksCapacity: !raw["opt:stocks:capacity"]
      ? DEFAULT_CAPACITY
      : parseInt(raw["opt:stocks:capacity"]),
    currentUrl: !raw["url:current"]
      ? "https://google.co.jp/"
      : raw["url:current"],
    stocks: !raw["url:stocks"] ? [] : raw["url:stocks"],
  };

  // OPT.log("[OPT.loadOptions]");
  // OPT.log(raw);
  // OPT.log(data);

  return data;
};

OPT.loadStocks = async function () {
  const raw = await OPT._storage.get(["url:stocks"]);
  return !raw["url:stocks"] ? [] : raw["url:stocks"];
};

OPT._getInputCapacity = function () {
  const inputValue = document.getElementById("opt:stocks:capacity").value;
  if (!inputValue) {
    return DEFAULT_CAPACITY;
  }
  try {
    return parseInt(inputValue);
  } catch (error) {
    return DEFAULT_CAPACITY;
  }
};

OPT._getInputShortcutKey = function () {
  const inputValue = document.getElementById("opt:key").value;
  if (!inputValue) {
    return DEFAULT_SCKEY;
  }
  try {
    return inputValue.toLowerCase();
  } catch (error) {
    return DEFAULT_SCKEY;
  }
};

OPT._getInputAvailableSite = function () {
  const inputValue = document.getElementById("opt:site").value;
  return inputValue ? inputValue : "";
};

OPT._getInputCurrentUrl = function (isStocksEnabled) {
  let currentUrl = null;
  if (isStocksEnabled) {
    const stocks = document.getElementsByName("url:stocks");
    for (let i = 0; i < stocks.length; i++) {
      if (stocks[i].checked) {
        currentUrl = stocks[i].value;
        break;
      }
    }
  }
  if (!currentUrl) {
    currentUrl = document.getElementById("url:current").value;
  }
  return currentUrl;
};

OPT.saveSettings = async function () {
  const scKey = OPT._getInputShortcutKey();
  const availableSite = OPT._getInputAvailableSite();
  const isStocksEnabled = OPT.isStocksEnabled();
  const capacity = OPT._getInputCapacity();
  const currentUrl = OPT._getInputCurrentUrl(isStocksEnabled);

  const data = {
    "opt:key": scKey,
    "opt:site": availableSite,
    "opt:stocks:enabled": isStocksEnabled,
    "opt:stocks:capacity": capacity,
    "url:current": currentUrl,
  };

  // OPT.log(data);

  await OPT._storage.set(data);
};

OPT.initializeSettings = async function () {
  const data = {
    "opt:key": DEFAULT_SCKEY,
    "opt:site": "",
    "opt:stocks:enabled": false,
    "opt:stocks:capacity": DEFAULT_CAPACITY,
    "url:current": "https://www.google.com/",
    "url:stocks": [],
  };

  await OPT._storage.set(data);
};

OPT._showSnackbar = function () {
  OPT._snackbar.classList.add("show");
};
OPT._hideSnackbar = function () {
  OPT._snackbar.classList.remove("show");
};

OPT.showMessage = function (msg, durationMsec = 3000) {
  OPT._showSnackbar();
  OPT._snackbar.innerText = msg;
  setTimeout(OPT._hideSnackbar, durationMsec);
};

OPT.isStocksEnabled = function () {
  return document.getElementById("opt:stocks:enabled").checked;
};

OPT.updateStockTitle = function (id) {
  OPT.loadStocks().then((stocks) => {
    try {
      const idx = parseInt(id.substring(id.indexOf("[") + 1, id.length - 1));
      const stock = stocks[idx];

      stocks[idx] = {
        url: stock.url,
        name: document.getElementById(id).value,
        updated_at: new Date().toLocaleString(),
      };

      const data = {
        "url:stocks": stocks,
      };

      OPT._storage.set(data).then(() => {
        OPT.showMessage(
          `${OPT.getLocalizedMessage("optStockItemTitleUpdatedMessage")}`
        );
      });
    } catch (error) {
      OPT.log(`error on updateStockTitle: ${error}`);
    }
  });
};

OPT.updateAvailableSite = function () {
  const availableSite = OPT._getInputAvailableSite();
  const data = {
    "opt:site": availableSite,
  };

  OPT._storage.set(data).then(() => {
    OPT.showMessage(
      `${OPT.getLocalizedMessage("optAvailableSiteUpdatedMessage")}`
    );
  });
};

OPT.updateShortcutKey = function () {
  const scKey = OPT._getInputShortcutKey();
  const data = {
    "opt:key": scKey,
  };

  OPT._storage.set(data).then(() => {
    OPT.showMessage(
      `${OPT.getLocalizedMessage("optShortcutKeyUpdatedMessage")}`
    );
  });
};

OPT.updateStocksCapacity = function () {
  const capacity = OPT._getInputCapacity();
  const data = {
    "opt:stocks:capacity": capacity,
  };

  OPT._storage.set(data).then(() => {
    OPT.showMessage(
      `${OPT.getLocalizedMessage("optStocksCapacityUpdatedMessage")}`
    );
  });
};

OPT.updateCurrentUrl = function () {
  const url = OPT._getInputCurrentUrl(OPT.isStocksEnabled());
  const data = {
    "url:current": url,
  };

  OPT._storage.set(data).then(() => {
    OPT.showMessage(
      `${OPT.getLocalizedMessage("optCurrentUrlUpdatedMessage")}`
    );
    OPT._setText(document.getElementById("url:current"), url);
  });
};

OPT.updateStocksEnabled = function (checked) {
  const data = {
    "opt:stocks:enabled": checked,
  };

  OPT._storage.set(data).then(() => {
    OPT.showMessage(
      `${OPT.getLocalizedMessage("optStocksEnabledUpdatedMessage")}`
    );
  });
};

OPT.getLocalizedMessage = function (msgKey) {
  return chrome.i18n.getMessage(msgKey);
};

OPT._setMessage = function (target, msgKey) {
  OPT._setText(target, OPT.getLocalizedMessage(msgKey));
};

OPT._setText = function (target, text) {
  target.innerText = text;
};

OPT._setupGeneralOptions = function (data) {
  const template = document.querySelector("#general-template");
  const box = template.content.cloneNode(true);

  // Section Title, Instruction
  OPT._setMessage(box.getElementById("formTitle"), "optFormTitle");
  OPT._setMessage(box.getElementById("formInstruction"), "optFormInstruction");
  OPT._setMessage(box.getElementById("opt-general:label"), "optGeneralLabel");

  // Current URL
  OPT._setMessage(
    box.getElementById("url:current:label"),
    "optCurrentUrlLabel"
  );

  const currentUrl = box.getElementById("url:current");
  OPT._setText(currentUrl, data.currentUrl);

  // Shortcut Key
  OPT._setMessage(box.getElementById("opt:key:label"), "optShortcutKeyLabel");

  const scKey = box.getElementById("opt:key");
  scKey.value = data.shortcutKey;
  scKey.setAttribute(
    "placeholder",
    OPT.getLocalizedMessage("optShortcutKeyLabel")
  );
  scKey.addEventListener("input", onTextInputValueChanged);

  OPT._setMessage(box.getElementById("opt:key:hint"), "optShortcutKeyHint");

  // Available Site URL
  OPT._setMessage(
    box.getElementById("opt:site:label"),
    "optAvailableSiteLabel"
  );

  const site = box.getElementById("opt:site");
  site.value = data.availableSite;
  site.setAttribute(
    "placeholder",
    OPT.getLocalizedMessage("optAvailableSiteLabel")
  );
  site.addEventListener("input", onTextInputValueChanged);

  OPT._setMessage(box.getElementById("opt:site:hint"), "optAvailableSiteHint");

  return box;
};

OPT._setupStockUrls = function (data, parent) {
  const container = parent.getElementById("opt-stock-urls");
  const template = document.querySelector("#stock-card");

  const currentUrl = data.currentUrl;

  if (data.stocks.length === 0) {
    const p = document.createElement("p");
    OPT._setText(p, "(None)");
    container.appendChild(p);
    return;
  }

  for (let i = 0; i < data.stocks.length; i++) {
    const stock = data.stocks[i];
    const box = template.content.cloneNode(true);

    // Radio Button
    const radio = box.getElementById("url:stocks");
    radio.id = `url:stocks[${i}]`;
    radio.value = stock.url;
    if (stock.url === currentUrl) {
      radio.setAttribute("checked", "checked");
    }
    radio.addEventListener("change", onCurrentStockItemChanged);

    // Title (name)
    const title = box.getElementById("url:stocks:name");
    title.id = `url:stocks:name[${i}]`;
    const name = stock.name ?? `URL [${i + 1}]`;
    title.value = name;
    title.addEventListener("input", onTextInputValueChanged);

    // URL
    const urlText = box.getElementById("url:stocks:url");
    urlText.id = `url:stocks:url[${i}]`;
    OPT._setText(urlText, stock.url);

    container.appendChild(box);
  }
};

OPT._setupStocksOptions = function (data) {
  const template = document.querySelector("#stocks-template");
  const box = template.content.cloneNode(true);

  OPT._setMessage(box.getElementById("opt-stocks:label"), "optStocksLabel");

  // Stocks Enabled
  const stocksEnabled = box.getElementById("opt:stocks:enabled");
  if (data.isStocksEnabled) {
    stocksEnabled.setAttribute("checked", "checked");
  }
  stocksEnabled.addEventListener("change", onStocksEnabledChanged);

  OPT._setMessage(
    box.getElementById("opt:stocks:enabled:label"),
    "optStocksEnabledLabel"
  );

  // Capacity of Stocks
  OPT._setMessage(
    box.getElementById("opt:stocks:capacity:label"),
    "optStocksCapacityLabel"
  );

  const capacity = box.getElementById("opt:stocks:capacity");
  capacity.value = data.stocksCapacity;
  capacity.setAttribute(
    "placeholder",
    OPT.getLocalizedMessage("optStocksCapacityLabel")
  );
  capacity.addEventListener("input", onTextInputValueChanged);

  const capacitySaveButton = box.getElementById(
    "opt-stocks-capacity-save-button"
  );
  OPT._setMessage(capacitySaveButton, "optStocksCapacitySaveButton");
  capacitySaveButton.addEventListener("click", OPT.updateStocksCapacity);

  OPT._setMessage(
    box.getElementById("opt:stocks:capacity:hint"),
    "optStocksCapacityHint"
  );

  // Stock URLs
  OPT._setupStockUrls(data, box);

  return box;
};

OPT._setupFooter = function () {
  const template = document.querySelector("#footer-template");
  const box = template.content.cloneNode(true);

  // Reset Button
  const resetButton = box.getElementById("reset");
  OPT._setMessage(resetButton, "optResetButtonText");
  resetButton.addEventListener("click", onResetButtonClicked);

  return box;
};

/* ---- Modal Dialog ---- */
OPT._invisible = function (id) {
  const element = document.getElementById(id);
  if (!element.classList.contains("d-invisible")) {
    element.classList.add("d-invisible");
  }
};

OPT._visible = function (id) {
  const element = document.getElementById(id);
  if (element.classList.contains("d-invisible")) {
    element.classList.remove("d-invisible");
  }
};

OPT.showModalDialog = function (titleKey, msgKey, applyCallback, useCancel) {
  const dialog = document.getElementById("modal-dialog");
  dialog.className = "modal active";

  const title = document.getElementById("modal-dialog-title");
  const content = document.getElementById("modal-dialog-content");

  OPT._setMessage(title, titleKey);
  OPT._setMessage(content, msgKey);

  // Cancel Button: Show/Hide
  if (useCancel) {
    OPT._visible("modal-dialog-cancel-button");
  } else {
    OPT._invisible("modal-dialog-cancel-button");
  }

  const applyButton = document.getElementById("modal-dialog-apply-button");
  applyButton.addEventListener("click", applyCallback);
};

OPT.hideModalDialog = function () {
  const dialog = document.getElementById("modal-dialog");
  dialog.className = "modal";
};

OPT._setupModalDialog = function () {
  const template = document.querySelector("#modal-dialog-template");
  const box = template.content.cloneNode(true);

  for (const id of [
    "modal-dialog-barrier",
    "modal-dialog-x-button",
    "modal-dialog-cancel-button",
  ]) {
    const item = box.getElementById(id);
    item.addEventListener("click", OPT.hideModalDialog);
  }

  return box;
};
/* ------ */

OPT.setupUI = function (data) {
  const generalOptBox = OPT._setupGeneralOptions(data);
  const stocksOptBox = OPT._setupStocksOptions(data);
  const footerBox = OPT._setupFooter();
  const modalDialog = OPT._setupModalDialog();

  OPT._container.appendChild(generalOptBox);
  OPT._container.appendChild(stocksOptBox);
  OPT._container.appendChild(footerBox);
  OPT._container.appendChild(modalDialog);

  OPT._container.addEventListener("submit", onFormSubmitted);
};

OPT.setupTitle = function () {
  const title = document.getElementsByTagName("title")[0];
  OPT._setMessage(title, "optPageTitle");
};

OPT.hideContainer = function () {
  OPT._container.style.display = "none";
};

OPT.showContainer = function () {
  OPT._container.style.display = "";
};

OPT.removeLoading = function () {
  OPT._loading.remove();
};

async function _getCurrentTab() {
  const queryOptions = { active: true, lastFocusedWindow: true };
  const tabs = await chrome.tabs.query(queryOptions);
  return tabs ? tabs[0] : null;
}

function reloadCurrentTab() {
  _getCurrentTab().then((tab) => {
    if (tab) {
      chrome.tabs.reload(tab.id);
    }
  });
}

// TODO: add save on press enter key at short cut key filed

function onFormSubmitted(event) {
  const submitterId = event.submitter.id;
  OPT.log(`on submit: by ${submitterId}`);

  if (OPT.hasLastModifiedTextFieldId()) {
    const id = OPT.getLastModifiedTextFieldId();
    if (id.startsWith("url:stocks:name")) {
      OPT.updateStockTitle(id);
    } else if (id === "opt:site") {
      OPT.updateAvailableSite();
    } else if (id === "opt:key") {
      OPT.updateShortcutKey();
    } else if (id === "opt:stocks:capacity") {
      OPT.updateStocksCapacity();
    }
  }
  OPT.clearLastModifiedTextFieldId();

  event.preventDefault();
  return false;
}

function onTextInputValueChanged(event) {
  const TEXT_FIELDS = ["opt:site", "opt:key", "opt:stocks:capacity"];

  if (event.target && event.target.id) {
    const id = event.target.id;
    if (id.startsWith("url:stocks:name")) {
      // Edit: url:stocks:name (stock item title)
      OPT.setLastModifiedTextFieldId(event.target.id);
      OPT.log(`[onStockTitleChanged] ${event.target.name}`);
    } else if (TEXT_FIELDS.includes(id)) {
      // Edit: other text field
      OPT.setLastModifiedTextFieldId(event.target.id);
      OPT.log(`[opt:site] ${event.target.name}`);
    }
  }
}

function onCurrentStockItemChanged(_) {
  if (OPT.isStocksEnabled()) {
    OPT.updateCurrentUrl();
  }
}

function onStocksEnabledChanged(event) {
  OPT.updateStocksEnabled(event.target.checked);
}

function onApplyButtonClicked(_) {
  // OPT.log("[onApplyButtonClicked] raised.");

  OPT.saveSettings().then((_) => {
    // OPT.log("[onApplyButtonClicked] settings were saved.");
    OPT.showModalDialog(
      "optSaveCompletionDialogTitle",
      "optSaveCompletionDialogMessage",
      reloadCurrentTab,
      false
    );
  });
}

function doResetSettings(_) {
  OPT.initializeSettings().then((_) => {
    // OPT.log("[doResetSettings] load defaults.");
    OPT.showModalDialog(
      "optResetCompletionDialogTitle",
      "optResetCompletionDialogMessage",
      reloadCurrentTab,
      false
    );
  });
}

function onResetButtonClicked(_) {
  // OPT.log("[onResetButtonClicked] raised.");
  OPT.showModalDialog(
    "optResetConfirmationDialogTitle",
    "optResetConfirmationDialogMessage",
    doResetSettings,
    true
  );
}

function constructOptions() {
  // Hide UI
  OPT.hideContainer();

  OPT.loadOptions().then((data) => {
    OPT.setupTitle();

    // Setup UI elements
    OPT.setupUI(data);

    // Remove Loading Animation & Show UI
    OPT.removeLoading();
    OPT.showContainer();
  });
}

// Initialize the page by constructing the color options
constructOptions();
