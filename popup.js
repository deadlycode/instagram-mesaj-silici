document.getElementById('startDeleteButton').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id},
      files: ['content.js']
    }, () => {
      chrome.tabs.sendMessage(tabs[0].id, {action: "startDeleting"}, (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          // Kullanıcıya hata mesajı gösterilebilir
        } else if (response) {
          console.log(response.status);
          // Kullanıcıya başarı mesajı gösterilebilir
        }
      });
    });
  });
});
