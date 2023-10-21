const onKeyDown = (event) => {
  try {
    if (!chrome.runtime.sendMessage) return;
    if (!event.key.toLowerCase) return;
  } catch (error) {
    return;
  }

  const keyValue = event.key.toLowerCase();
  const eventData = {
    event: "validate",
    key: keyValue,
    url: document.URL,
  };

  chrome.runtime.sendMessage(null, eventData, (opts) => {
    if (opts) {
      const element = document.activeElement;
      const tagName = element.tagName.toUpperCase();

      if (
        tagName === "INPUT" ||
        tagName === "SELECT" ||
        tagName === "TEXTAREA" ||
        element.isContentEditable
      ) {
        return;
      }

      const actionData = {
        event: "quick_access",
        url: document.URL,
        title: document.title,
        useModifierKey: event.shiftKey || event.ctrlKey || event.altKey,
        key: keyValue,
        opts: opts,
      };

      chrome.runtime.sendMessage(null, actionData, (result) => {
        // console.log(result);
      });
    }
  });
};

window.addEventListener("keydown", onKeyDown);
