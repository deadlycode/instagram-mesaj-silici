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

  // 1. Mesaj kutularını seç
  // Kullanıcının verdiği uzun seçici. Instagram'ın yapısı değiştikçe bu seçicinin güncellenmesi gerekebilir.
  const messageBoxSelector = 'div.x1i10hfl.x1qjc9v5.xjbqb8w.xjqpnuy.xc5r6h4.xqeqjp1.x1phubyo.x13fuv20.x18b5jzi.x1q0q8m5.x1t7ytsu.x972fbf.x10w94by.x1qhh985.x14e42zd.x9f619.x1ypdohk.xdl72j9.x2lah0s.xe8uvvx.x2lwn1j.xeuugli.x1n2onr6.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1q0g3np.x87ps6o.x1lku1pv.x1a2a7pz.x15mokao.x1ga7v0g.x16uus16.xbiv7yw.x1lliihq.xdj266r.x14z9mp.xat24cr.x1lziwak.xg6hnt2.x18wri0h.x1l895ks.x1y1aw1k.xwib8y2.x13jy36j.x64bnmy[role="button"]';
  let messageBoxes = document.querySelectorAll(messageBoxSelector);
  console.log(`${messageBoxes.length} adet mesaj kutusu bulundu.`);

  if (messageBoxes.length === 0) {
    alert("Silinecek mesaj kutusu bulunamadı. Lütfen Instagram mesajlar sayfasında olduğunuzdan emin olun.");
    return;
  }

  // For döngüsü yerine while döngüsü kullanarak dinamik olarak değişen listeyi daha iyi yönetebiliriz.
  // Her silme işleminden sonra listenin ilk elemanını tekrar seçeriz.
  while (document.querySelectorAll(messageBoxSelector).length > 0) {
    const currentMessageBoxes = document.querySelectorAll(messageBoxSelector);
    if (currentMessageBoxes.length === 0) {
        console.log("Silinecek başka mesaj kalmadı.");
        break;
    }
    const messageBox = currentMessageBoxes[0]; // Her zaman listenin ilk mesajını işle

    console.log("Bir sonraki mesaj kutusu işleniyor:", messageBox);
    messageBox.click();
    await sleep(2000); // Sayfanın ve sohbet detaylarının yüklenmesi için bekleme

    // 2. "Sohbeti sil" butonuna tıkla
    // Kullanıcının verdiği seçici: div[role="button"][tabindex="0"] ve içindeki metin "Sohbeti sil"
    // Daha genel bir seçici ve metin kontrolü daha iyi olabilir.
    // Örnek: 'div[role="button"]' ve metin "Sohbeti sil"
    // const deleteChatButtonSelector = 'div[role="button"][tabindex="0"]'; // Bu çok genel, metinle kontrol edelim
    const deleteChatButton = await waitForElementWithText('div[role="button"]', "Sohbeti sil");

    if (deleteChatButton) {
      console.log("'Sohbeti sil' butonu bulundu ve tıklanıyor.");
      deleteChatButton.click();
      await sleep(1000); // Onay popup'ının açılması için bekleme

      // 3. "Sil" onay butonuna tıkla
      // Kullanıcının verdiği seçici: button.xjbqb8w...[tabindex="0"] ve metin "Sil"
      // Örnek: 'button' ve metin "Sil"
      const confirmDeleteButton = await waitForElementWithText('button', "Sil");
      if (confirmDeleteButton) {
        console.log("'Sil' onay butonu bulundu ve tıklanıyor.");
        confirmDeleteButton.click();
        await sleep(2500); // Silme işleminin tamamlanması ve listenin güncellenmesi için bekleme
        console.log("Mesaj silindi, bir sonraki mesaja geçiliyor (eğer varsa).");
      } else {
        console.error("'Sil' onay butonu bulunamadı. Bu mesaj atlanıyor.");
        // Belki ana listeye geri dönmek için bir tıklama gerekebilir.
        // Şimdilik devam ediyoruz, bir sonraki mesaj kutusunu (eğer varsa) işlemeye çalışacak.
        // Eğer takılırsa, burada bir geri dönüş mekanizması eklenebilir.
        // Örneğin, mesaj listesine geri dönen bir butona tıklamak.
        // Bu senaryo için şimdilik bir 'geri' butonu varsaymıyoruz.
        // Tarayıcının geri tuşu gibi bir şey programatik olarak tetiklenemez.
        // Ana mesaj listesi görünür değilse, işlem burada durabilir.
        // Bu nedenle, her adımdan sonra ana mesaj listesinin hala erişilebilir olduğundan emin olmak önemlidir.
        // Şimdilik, eğer silme işlemi başarısız olursa döngü bir sonraki mesaj kutusunu almayı deneyecek.
        // Eğer sayfa yapısı değişirse (örneğin sohbet ekranında kalırsa), messageBoxSelector artık eşleşmeyebilir.
        alert("Silme işlemi sırasında bir sorun oluştu ('Sil' butonu bulunamadı). Lütfen sayfayı kontrol edin.");
        break; // Sorun varsa döngüyü sonlandır.
      }
    } else {
      console.error("'Sohbeti sil' butonu bulunamadı. Bu mesaj atlanıyor.");
      // Eğer 'Sohbeti sil' butonu bulunamazsa, muhtemelen yanlış bir ekrandayızdır veya sohbet yüklenmemiştir.
      // Bu durumda da işlemi durdurmak veya kullanıcıya bilgi vermek iyi olabilir.
      alert("Silme işlemi sırasında bir sorun oluştu ('Sohbeti sil' butonu bulunamadı). Lütfen sayfayı kontrol edin.");
      break; // Sorun varsa döngüyü sonlandır.
    }
  }

  if (document.querySelectorAll(messageBoxSelector).length === 0) {
    console.log("Tüm mesajlar başarıyla silindi.");
    alert("Tüm mesajlar silindi!");
  } else {
    console.log("Bazı mesajlar silinememiş olabilir veya işlem erken durdu.");
    // alert("Mesaj silme işlemi tamamlandı ancak bazı mesajlar kalmış olabilir.");
  }
}

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
