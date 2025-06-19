console.log("Instagram Mesaj Silici content script yüklendi.");

// Belirli bir süre beklemek için yardımcı fonksiyon
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Belirli bir seçiciye sahip elementin DOM'da görünür olmasını bekleyen fonksiyon
async function waitForElement(selector, timeout = 5000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const element = document.querySelector(selector);
    if (element) {
      // Elementin görünür olup olmadığını da kontrol edebiliriz (opsiyonel)
      // const style = window.getComputedStyle(element);
      // if (style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
      //   return element;
      // }
      return element;
    }
    await sleep(100); // Kısa bir süre bekle ve tekrar dene
  }
  console.error(`Element bulunamadı: ${selector}`);
  return null;
}

// Metin içeriğine göre element bulma (daha sağlam olabilir)
async function waitForElementWithText(selector, text, timeout = 5000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
            if (element.textContent.trim() === text) {
                // Elementin görünür olup olmadığını da kontrol edebiliriz
                return element;
            }
        }
        await sleep(100);
    }
    console.error(`'${text}' metnine sahip element bulunamadı: ${selector}`);
    return null;
}


async function deleteMessages() {
  console.log("deleteMessages fonksiyonu çağrıldı.");

  const messageBoxSelector = 'div.x1i10hfl.x1qjc9v5.xjbqb8w.xjqpnuy.xc5r6h4.xqeqjp1.x1phubyo.x13fuv20.x18b5jzi.x1q0q8m5.x1t7ytsu.x972fbf.x10w94by.x1qhh985.x14e42zd.x9f619.x1ypdohk.xdl72j9.x2lah0s.xe8uvvx.x2lwn1j.xeuugli.x1n2onr6.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1q0g3np.x87ps6o.x1lku1pv.x1a2a7pz.x15mokao.x1ga7v0g.x16uus16.xbiv7yw.x1lliihq.xdj266r.x14z9mp.xat24cr.x1lziwak.xg6hnt2.x18wri0h.x1l895ks.x1y1aw1k.xwib8y2.x13jy36j.x64bnmy[role="button"]';

  while (document.querySelectorAll(messageBoxSelector).length > 0) {
    const currentMessageBoxes = document.querySelectorAll(messageBoxSelector);
    if (currentMessageBoxes.length === 0) {
        console.log("Silinecek başka mesaj kalmadı.");
        break;
    }
    const messageBox = currentMessageBoxes[0];
    console.log("Bir sonraki mesaj kutusu işleniyor:", messageBox);
    messageBox.click();
    await sleep(1500); // Sohbetin açılması için bekleme

    // YENİ ADIM: "Konuşma Bilgileri" ikonuna tıkla
    const infoIconSelector = 'svg[aria-label="Konuşma Bilgileri"]';
    // Instagram arayüzünde bu ikonun daha spesifik bir parent'ı olabilir, gerekirse seçici güncellenmeli.
    // Örneğin: bir butonun içinde yer alıyorsa 'button svg[aria-label="Konuşma Bilgileri"]' gibi.
    // Şimdilik direkt SVG'nin aria-label'ı ile deniyoruz.
    // waitForElement içinde bir elementin tıklanabilir (visible, non-disabled) olmasını beklemek de eklenebilir.
    const infoIcon = await waitForElement(infoIconSelector, 3000); // Timeout biraz daha kısa olabilir, sohbet açıldıktan sonra hızlıca görünmeli.

    if (infoIcon) {
      console.log("'Konuşma Bilgileri' ikonu bulundu ve tıklanıyor.");
      // SVG elementine doğrudan click() her zaman çalışmayabilir, parent elementine tıklamak daha güvenli olabilir.
      // Eğer infoIcon.click() çalışmazsa, infoIcon.closest('button') || infoIcon.parentElement gibi bir şey denenmeli.
      // Şimdilik direkt deniyoruz.
      infoIcon.click();
      await sleep(1000); // Bilgi panelinin açılması için bekleme
    } else {
      console.error("'Konuşma Bilgileri' ikonu bulunamadı. Bu mesaj atlanıyor veya işlem durduruluyor.");
      alert("Silme işlemi sırasında bir sorun oluştu ('Konuşma Bilgileri' ikonu bulunamadı). Lütfen sayfayı kontrol edin.");
      // Geri dönme mantığı eklenebilir, örneğin bir önceki sayfaya gitmek veya ana mesaj listesine dönmek.
      // Şimdilik döngüyü sonlandırıyoruz.
      break;
    }

    // "Sohbeti sil" butonuna tıkla
    const deleteChatButton = await waitForElementWithText('div[role="button"]', "Sohbeti sil");
    if (deleteChatButton) {
      console.log("'Sohbeti sil' butonu bulundu ve tıklanıyor.");
      deleteChatButton.click();
      await sleep(1000);

      const confirmDeleteButton = await waitForElementWithText('button', "Sil");
      if (confirmDeleteButton) {
        console.log("'Sil' onay butonu bulundu ve tıklanıyor.");
        confirmDeleteButton.click();
        await sleep(2500);
        console.log("Mesaj silindi, bir sonraki mesaja geçiliyor (eğer varsa).");
      } else {
        console.error("'Sil' onay butonu bulunamadı. Bu mesaj atlanıyor.");
        alert("Silme işlemi sırasında bir sorun oluştu ('Sil' butonu bulunamadı). Lütfen sayfayı kontrol edin.");
        break;
      }
    } else {
      console.error("'Sohbeti sil' butonu bulunamadı. Bu mesaj atlanıyor.");
      alert("Silme işlemi sırasında bir sorun oluştu ('Sohbeti sil' butonu bulunamadı). Lütfen sayfayı kontrol edin.");
      break;
    }
  }

  if (document.querySelectorAll(messageBoxSelector).length === 0) {
    console.log("Tüm mesajlar başarıyla silindi.");
    alert("Tüm mesajlar silindi!");
  } else {
    console.log("Bazı mesajlar silinememiş olabilir veya işlem erken durdu.");
  }
}

// chrome.runtime.onMessage.addListener kısmı aynı kalacak
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "startDeleting") {
      console.log("Silme işlemi pop-up'tan tetiklendi...");
      deleteMessages().then(() => {
        sendResponse({status: "Silme işlemi tamamlandı veya durdu."});
      }).catch(error => {
        console.error("Silme işlemi sırasında bir hata oluştu:", error);
        sendResponse({status: "Silme işlemi sırasında hata.", error: error.message});
      });
      return true; // Asenkron response için (deleteMessages async olduğu için)
    }
    return false; // Diğer mesaj türleri için senkron response
  }
);
