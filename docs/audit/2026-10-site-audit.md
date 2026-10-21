# LEVANTER web sitesi — denetim ve yenileme planı (A–F)

**Tarih:** 21 Ekim 2026
**Kapsam:** Vercel'de production'a dağıtılan sürüm: `main` dalı, commit `8ef3c0e` (19 Ekim 2026). Production adresleri `shipping-wheat.vercel.app` ve `shipping-okans-projects-fcf7250e.vercel.app`; projede özel alan adı yok.

> **Bu belgenin ilk sürümü yanlış dalı inceliyordu.** Talepte site URL'si verilmediği için (`[BURAYA SİTE URL'SİNİ EKLE]`) ilk denetim deponun varsayılan dalı (`claude/implement-voyage-estimator-DKL5K`) üzerinden yapılmıştı. Vercel dağıtım geçmişi, production'ın 10 Ekim'den beri `main`'den yayınlandığını gösteriyor. `main` o tarihten önce tanker ve LPG odağıyla baştan yeniden kurulmuştu. PR #3 bu yüzden `main` üzerine yeniden kuruldu ve bu belge canlı sürümü anlatıyor. Önceki çalışmanın commit'leri dal geçmişinde duruyor.

## Yöntem ve sınırlar

| Yapılan                                 | Araç / yöntem                                                                                                                                                                                                      |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Kod incelemesi                          | `main`'in tamamı: 44 HTML sayfa ve RSS, ~13 bin satır kaynak                                                                                                                                                       |
| Production build                        | Vercel production ortamının benzetimi: `VERCEL_ENV=production`, `VERCEL_PROJECT_PRODUCTION_URL=shipping-wheat.vercel.app`, `next build && next start`                                                              |
| Canlı ortam kontrolü                    | Vercel API: proje ayarları, ortam değişkenleri (hiç yok), production dağıtım geçmişi. Production `robots.txt` kimlik doğrulamalı istekle okundu                                                                    |
| Tarama                                  | `sitemap.xml` ve iç bağlantılar üzerinden 45 URL (44 HTML + RSS): durum kodu, title, description, canonical, robots, hreflang, H1/H2 sırası, JSON-LD, `href="#"`, sayfa içi çapalar, gelen iç bağlantı sayısı |
| Tarayıcıda render ve erişilebilirlik    | Playwright/Chromium, masaüstü 1366 px ve mobil (Pixel 7), 18 sayfa × 2 görünüm, axe-core (WCAG 2.1 A/AA ve best-practice), yatay taşma, konsol ve CSP hataları                                                   |
| Etkileşim                               | Mobil menü (aç, Escape ile kapat), LPG dönüştürücü, teklif formu doğrulaması                                                                                                                                     |
| Performans                              | Lighthouse 12.2.1, mobil emülasyon ve simüle ağ kısıtlaması, 6 sayfa, her biri 3 çalıştırma (medyan)                                                                                                            |
| Sektörel ve hukuki içerik doğrulaması   | Kaynaklı web araması: AB Konseyi, Baltic Exchange haftalık raporları, JWC/LMA genelgesi haberleri, gov.uk, Ulaştırma Bakanlığı açıklaması, Montreux Sözleşmesi metni. Kaynaklar sonuç raporunda listelendi        |

**Erişilemeyenler (bu yüzden "doğrulanmadı" olarak işaretlendi):**

- **Production sitenin herkese açık olup olmadığı.** Vercel projesinde Deployment Protection açık ("Vercel Authentication", kapsam `all_except_custom_domains`) ve projede özel alan adı yok. Bu ayar `shipping-wheat.vercel.app` adresini de kapsıyorsa site ziyaretçilere ve arama motorlarına kapalıdır. Bu ortamdan dış ağa çıkış engelli olduğu için doğrulanamadı. **Doğrulama yöntemi:** adresi oturum açılmamış bir tarayıcıda (gizli pencere) açın. Vercel giriş ekranı geliyorsa site kapalıdır.
- Google Search Console, CrUX alan verisi ve Vercel Analytics verisi. Lighthouse sonuçları laboratuvar ölçümüdür, gerçek kullanıcı verisi değildir.
- Anahtar kelime hacimleri: Ahrefs planı ilgili uç noktaya izin vermedi, Semrush hesabında API birimi yok. C bölümündeki kelimeler arama niyetine ve sektör terminolojisine göre seçildi; hacimleri doğrulanmadı.
- Şirketin gerçek bilgileri. `docs/REDESIGN.md` iletişim bilgilerinin, adresin, koordinatların, ofislerin ve sosyal hesapların yer tutucu olduğunu, brokerların da "örnek kişiler" olduğunu yazıyor. Bunları yalnızca şirket doğrulayabilir.

---

## A. Mevcut sitenin genel değerlendirmesi

**Teknoloji:** Next.js 14.2.35 (App Router), TypeScript, Tailwind ve Uiverse tabanlı bileşen kiti (`app/uiverse.css`, MIT), Radix UI, Zod, Vitest, GitHub Actions CI, Vercel. Sayfaların tamamı build sırasında statik HTML olarak üretiliyor; içerik JavaScript çalıştırılmadan okunabiliyor. Framework değiştirmeye gerek yok.

**Güçlü yönler**

- **Odaklı bilgi mimarisi:** tanker ve LPG/amonyak masaları, 9 gemi sınıfı rehberi, rakiplerde olmayan bir Türk Boğazları transit rehberi, yaptırım uyumu sayfası, 13 araştırma notu, 70 terimlik sözlük ve 10 dilde açılış sayfası.
- **Teknik SEO temeli sağlam:** her sayfada tek H1 ve tek `<main>`, başlık sırası atlamıyor, İngilizce açıklamaların tamamı 160 karakterin altında. Ana sayfa ve yerel sayfalarda `hreflang` + `x-default` var. Her sayfanın kendi paylaşım görseli, ayrıca `llms.txt`, RSS ve kapsamlı JSON-LD var. Kırık bağlantı ve `href="#"` yok.
- **Erişilebilirlik çok iyi:** axe 36 görünümde tek bir ihlal buldu: aynı öğe, masaüstü ve mobilde (aşağıda U1). Hiçbir sayfada yatay taşma yok. Mobil menü, form doğrulaması ve hata özeti klavye ve ekran okuyucu düşünülerek yapılmış.
- **Performans iyi:** ilk yüklemede 87–127 kB JS, düşük TBT, CLS 0.
- **"Rakam ilkesi":** canlı navlun, bunker veya tarife rakamı yayınlanmıyor. Eskiyecek fiyat bilgisi bilinçli olarak dışarıda bırakılmış.

**Zayıf yönler (özet)**

1. **Production'da kanonik alan adı yer tutucu.** `NEXT_PUBLIC_SITE_URL` Vercel'de tanımlı değil, kod da `https://levanter.example` adresine düşüyordu. 44 sayfanın 44'ünde canonical, Open Graph adresi ve JSON-LD kimlikleri bu adrese gidiyordu. Production `robots.txt` dosyası da `Sitemap: https://levanter.example/sitemap.xml` diyor (canlı ortamda doğrulandı). `.example` alanı hiçbir zaman çözümlenmez. Arama motorları bu canonical'ları ya yok sayar ya da sayfayı var olmayan bir adrese bağlar.
2. **Dönüşüm yolu çalışmıyor.** Bütün e-posta adresleri `.example` uzantılı, yani teslim edilemez. Telefon ve WhatsApp `000 0000` biçiminde. Teklif formu talebi bu adreslere mailto veya WhatsApp ile gönderiyor. Gerçek bir ziyaretçinin talebi kayboluyor. WhatsApp numarası (+90 533 000 0000) Turkcell formatında; gerçek bir aboneye denk gelip gelmediği doğrulanamadı.
3. **Örnek kişiler gerçek broker gibi sunuluyor.** 9 isim yapılandırılmış veride 23 `Person` varlığı (15 sayfa), makale yazarı ve RSS yazarı olarak yayınlanıyordu. Sınıf sayfalarında "kim bakıyor" satırlarında ve yerel sayfalarda "X ile kendi dilinizde konuşun" bağlantısında da geçiyorlar.
4. **Doğrulanmamış şirket bilgileri yapılandırılmış veride.** "LEVANTER Shipbrokers A.Ş." tüzel kişiliği, 2024 kuruluş yılı, sokak adresi ve harita koordinatı (12 sayfada `ProfessionalService`) ve sosyal profiller yayınlanıyordu. Sosyal profiller (`sameAs`, 44 sayfa) ve `@levanter` X hesabı başka birine ait olabilir.
5. **Sektörel içerikte güncelliğini yitirmiş veya hatalı bilgiler ve kaynaksız rakamlar var.** Karadeniz savaş riski alanı, fiyat tavanı, İngiltere yaptırım listesi, Boğaz kılavuzluğu, Baltic rota tanımları ve iki ters kurulmuş arbitraj mantığı bunlara örnek. Ayrıntılar B3'te.
6. **"60 dakikada ilk yanıt" taahhüdü** 10 dilde ~75 yerde geçiyor. Bazı metinler 60 dakikada yalnızca yanıt değil sonuç (gemi listesi, navlun fikri) vaat ediyor. Taahhüdü şirket doğrulamalı ve ölçmeli.
7. **Güvenlik başlıklarında CSP yok.** HTML'deki referrer etiketi HTTP başlığından daha gevşek.
8. **CI ara sıra düşebilir.** 19 Ekim'de `main`'in GitHub Actions derlemesi Google Fonts yanıtı yüzünden düştü (`next/font`: "Cannot read properties of null"). Next 14'ün font yükleyicisi uzantısız bir font URL'si gelince çöküyor. Aynı kod daha sonra hem Vercel'de hem CI'da derlendi.
9. **Yayın ayarları:** özel alan adı yok, Deployment Protection'ın kapsamı belirsiz (yukarıya bakın).

**Lighthouse (mobil, laboratuvar, yerel sunucu, 3 çalıştırmanın medyanı):**

| Sayfa | Performans | Erişilebilirlik | En iyi uygulamalar* | SEO | LCP | TBT |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | 90 | 100 | 96 | 100 | 3,6 sn | 14 ms |
| `/tankers` | 90 | 100 | 96 | 100 | 3,5 sn | 23 ms |
| `/lpg` | 90 | 100 | 96 | 100 | 3,6 sn | 41 ms |
| `/contact` | 90 | 100 | 96 | 100 | 3,5 sn | 43 ms |
| `/turkish-straits` | 90 | 100 | 96 | 100 | 3,6 sn | 46 ms |
| `/research/strait-of-hormuz-…` | 90 | 96 | 96 | 100 | 3,6 sn | 26 ms |

\* Puanı düşüren tek madde, Vercel analitik betiklerinin yerel sunucuda 404 dönmesi; Vercel'de beklenmez. Performans iyi, asıl iyileştirme alanı mobil LCP (laboratuvarda 3,5–3,6 sn). Değişiklik sonrası değerler sonuç raporunda.

---

## B. Tespit edilen sorunlar ve önem dereceleri

Önem: **Kritik** (yayın öncesi mutlaka) · **Yüksek** · **Orta** · **Düşük**. Maliyet: **D** düşük · **O** orta · **Y** yüksek.
"Durum" sütunu bu çalışmada ne yapıldığını gösterir: ✅ uygulandı · 🟡 kısmen · 📋 öneri (karar veya veri gerekiyor) · 🔎 doğrulama gerekiyor.

### B1. Teknik ve SEO

| #   | Sorun                                                                                                                                       | Önem   | Maliyet | Durum                                                                                                                                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| T1  | Production'da canonical, sitemap, `robots.txt`, OG ve JSON-LD adresleri `levanter.example`                                                   | Kritik | D       | ✅ Kök adres build sırasında belirleniyor: `NEXT_PUBLIC_SITE_URL` → Vercel production alan adı → localhost. Preview ve localhost build'leri `noindex`, `robots.txt` onları tamamen kapatıyor. Değişken eksikse build uyarı veriyor           |
| T2  | Production'ın Deployment Protection arkasında olup olmadığı belirsiz; özel alan adı yok                                                    | Kritik | D       | 🔎 / 📋 Gizli pencerede kontrol edin. Özel alan adı eklenip `NEXT_PUBLIC_SITE_URL` bu adrese ayarlanmalı                                                                                                                                    |
| T3  | JSON-LD'de yer tutucu adres, telefon, e-posta ve `ProfessionalService` (yerel işletme) bloğu                                                | Yüksek | D       | ✅ `COMPANY_DETAILS_CONFIRMED` bayrağı (`lib/site.ts`) doğrulanana kadar bunları ve yerel işletme bloğunu yapılandırılmış veriden, `llms.txt`'ten, `humans.txt`'ten ve `ai.txt`'ten çıkarıyor                                              |
| T4  | `sameAs` ve `twitter:site` doğrulanmamış profillere gidiyor                                                                                | Yüksek | D       | ✅ Yalnızca `verified: true` olan profiller yayınlanıyor                                                                                                                                                                                   |
| T5  | Örnek brokerlar `Person` varlığı, makale yazarı ve RSS yazarı                                                                               | Yüksek | D       | ✅ Broker başına `verified` bayrağı. Doğrulanmamış isimler yapılandırılmış veride, RSS'te ve `llms-full.txt` imzalarında yer almıyor; yazar olarak masa gösteriliyor. Sayfalardaki görünüm değişmedi (B3, C22)                             |
| T6  | CSP yok; HTML referrer etiketi (`origin-when-cross-origin`) başlıktan gevşek                                                                | Orta   | D       | ✅ CSP eklendi (yalnızca kendi kaynakları; Vercel araç çubuğu yalnızca preview'da). Referrer `strict-origin-when-cross-origin` olarak eşitlendi. 36 görünümde ve etkileşim testlerinde CSP ihlali yok                                        |
| T7  | `security.txt` iletişim adresi teslim edilemez (`security@levanter.example`)                                                                | Orta   | D       | ✅ Gerçek gelen kutusu tanımlanana kadar 404. Çalışmayan iletişim bilgisi vermek hiç vermemekten kötü                                                                                                                                       |
| T8  | `/lpg/pressurised` başlığı 71 karakter                                                                                                      | Düşük  | D       | ✅ 56 karakter (`seoTitle`)                                                                                                                                                                                                               |
| T9  | Yerel sayfalarda iki başlık 67 karakter (es, ar), 7 dilde açıklama 201–214 karakter                                                        | Düşük  | O       | 📋 Ana dili konuşan biri tarafından kısaltılmalı                                                                                                                                                                                          |
| T10 | Kaldırılan bölümler (`/dry-bulk`, `/sale-purchase`) ana sayfaya yönleniyor                                                                  | Düşük  | D       | 📋 Google ilgisiz sayfaya giden yönlendirmeyi "soft 404" sayabilir. Eşdeğer içerik olmadığı için kabul edilebilir; istenirse 410 dönülebilir                                                                                               |
| T11 | 5 araştırma notu yalnızca 2 iç bağlantı alıyor                                                                                              | Orta   | O       | 📋 Notlar arasında konu bazlı "ilgili notlar" ve sınıf rehberlerinden bağlantı                                                                                                                                                             |
| T12 | Build sırasında Google Fonts'a bağımlılık; Next 14 font yükleyicisi uzantısız URL'de çöküyor                                                | Düşük  | O       | 📋 Tekrar ederse fontlar `next/font/local` ile depoya alınmalı                                                                                                                                                                            |
| T13 | Mobilde kritik yolda 7 font dosyası önyükleniyor (182 kB; latin-ext ve mono dahil)                                                          | Orta   | D       | ✅ Yalnızca başlık ve gövde fontlarının Latin dosyaları önyükleniyor (2 dosya, 75 kB). Türkçe karakterler (latin-ext) ihtiyaç olunca yükleniyor                                                                                             |
| T14 | HSTS `preload` yönergesi `vercel.app` alt alanında                                                                                          | Düşük  | D       | 📋 Etkisiz ama zararsız. Özel alan adında preload listesine başvuru ancak tüm alt alanlar HTTPS'e hazırsa yapılmalı                                                                                                                         |

### B2. Erişilebilirlik ve UX

| #   | Sorun                                                                                                                    | Önem             | Maliyet | Durum                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------ | ---------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| U1  | Araştırma notu imzasındaki baş harfler beyaz-üzeri-pirinç, 3,1:1                                                         | Orta             | D       | ✅ Broker kartlarındaki kontrast güvenli renk fonksiyonu kullanılıyor (4,5:1 üstü). axe: 0 ihlal                                             |
| U2  | WhatsApp ve telefon bağlantıları yer tutucu numaralara gidiyor; "Send via WhatsApp" talebin tamamını (ad, şirket, e-posta, telefon, yük) bu numaraya hazırlıyor | Kritik (yayın) | D (veri) | 📋 Gerçek numara gelene kadar bu bağlantılar gizlenebilir; tasarımı değiştireceği için karar şirkete bırakıldı                            |
| U3  | Mailto hedefleri `.example`: talepler sessizce kayboluyor                                                                 | Kritik (yayın)   | D (veri) | 📋 Gerçek masa gelen kutuları                                                                                                               |
| U4  | Istanbul merkezli bir firmada Türkçe sayfa yok (`/tr` yeniden tasarımda kaldırılmış)                                     | Orta             | O       | 📋 Türk armatör ve kiracılar için ve KVKK aydınlatmasının Türkçe sunulması için değerlendirilmeli                                          |
| U5  | Araştırma sayfası "Weekly" not vaat ediyor; son haftalık not 28 Nisan 2026 tarihli                                        | Orta             | O       | 📋 Ya düzenli yayın ya da vaadin kaldırılması                                                                                              |
| U6  | Mobil menü, form doğrulaması, hata özeti, dönüştürücü                                                                     | —                | —       | ✅ Test edildi, sorun yok: menü açılıyor ve Escape ile kapanıyor, form 9 alanı işaretliyor, dönüştürücü 84.000 cbm propan için 47.910 t veriyor |

### B3. İçerik, iddialar ve sektörel doğruluk

| #   | Konum                                                    | Sorun                                                                                                                                                                   | Durum                                                                                                                                                       |
| --- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Boğazlar rehberi, uyum sayfası, sözlük                   | Savaş riski: "Karadeniz'in bazı bölümleri". JWC genelgesi JWLA-035 (16 Eylül 2026) ile liste alanı Türkiye, Bulgaristan, Romanya ve Gürcistan karasuları dışında neredeyse tüm Karadeniz | ✅                                                                                                                                                          |
| C2  | Uyum sayfası, fiyat tavanı notu, sözlük                  | "OFSI ve İngiltere konsolide listesi": OFSI Konsolide Listesi 28 Ocak 2026'da kapandı; tek kaynak UK Sanctions List                                                     | ✅                                                                                                                                                          |
| C3  | Fiyat tavanı notu, sözlük                                | "AB/İngiltere tavanı periyodik olarak yenileniyor": tavan Şubat 2026'da düşürüldü, AB 21. paketle (Temmuz 2026) otomatik ayarlamayı 15 Temmuz 2027'ye kadar durdurdu      | ✅ Kurucunun "eskiyecek rakam yok" kuralına uyularak tarihlerle, rakamsız                                                                                    |
| C4  | Fiyat tavanı notu                                        | Beyan zinciri yanlış: armatörün beyan verdiği ve "OFAC/OFSI onaylı kulüp" yazıyordu. Beyanı kiracı verir; düzenleyiciler kulüp onaylamaz                                 | ✅                                                                                                                                                          |
| C5  | Boğazlar rehberi ve SSS                                  | "Kılavuzluk bazı gemiler için zorunlu": Montreux'ye göre transit gemilerde kılavuzluk ve römorkaj isteğe bağlı (şiddetle tavsiye edilir), Boğaz limanlarına uğrayanlarda zorunlu | ✅                                                                                                                                                          |
| C6  | Boğazlar rehberi                                         | Harç mekanizması eksikti: net ton başına altın frank, doları her 1 Temmuz'da güncelleniyor                                                                              | ✅ Rakamsız açıklandı                                                                                                                                         |
| C7  | Suezmax rehberi                                          | TD6 "Novorossiysk/CPC → Augusta veya Trieste, ~2.400 nm": Baltic tanımı 135.000 mt CPC → Augusta; mesafe ~1.250 nm                                                     | ✅                                                                                                                                                          |
| C8  | Aframax rehberi                                          | TD19 "C. Med → Med; CPC, Karadeniz aktarma": Baltic tanımı 80.000 mt Akdeniz içi, Ceyhan → Lavera                                                                       | ✅                                                                                                                                                          |
| C9  | VLCC rehberi                                             | TD22 "Ümit Burnu üzerinden ~11.800 nm": Ümit Burnu rotası ~14.000–15.000 nm (11.800 Panama rotasına yakın; VLCC Panama'dan geçemez)                                      | ✅ Aralık olarak düzeltildi; 🔎 mesafe tablosuyla teyit                                                                                                     |
| C10 | Suezmax rehberi                                          | Su çekimi "17 m (Süveyş yüklü sınırı)": kanalın sınırı daha yüksek; 17 m tipik tasarım su çekimi                                                                        | ✅                                                                                                                                                          |
| C11 | MR rehberi                                               | TC17 "Doğu Afrika rafinerilerine": bölgeye ürün ithal terminallerine gidiyor                                                                                            | ✅                                                                                                                                                          |
| C12 | Sözlük                                                   | Malakka "~12 saatte geçilir": ~500 nm, yaklaşık 1,5–2 gün                                                                                                                | ✅                                                                                                                                                          |
| C13 | Sözlük                                                   | EUA "ton CO₂ başına": 2026'dan itibaren metan ve N₂O dahil, "ton CO₂e"                                                                                                   | ✅                                                                                                                                                          |
| C14 | VLGC rehberi                                             | "~−50 °C": bu tank tasarım sıcaklığı; propan ~−42 °C'de taşınır                                                                                                         | ✅                                                                                                                                                          |
| C15 | EU ETS notu                                              | Spot metin "2026'da %70" diyor, gövde "%100": 2026 emisyonlarının %100'ü kapsamda                                                                                         | ✅                                                                                                                                                          |
| C16 | TD3C notu                                                | "Scrubber'lı VLCC … VLSFO": scrubber'lı gemi HSFO yakar                                                                                                                  | ✅                                                                                                                                                          |
| C17 | Suezmax ve WAF–East notları                              | Brent–Dubai mantığı ters: dar makas Atlantik petrolünü Asya'ya açar, geniş makas kapatır                                                                                | ✅                                                                                                                                                          |
| C18 | Suezmax, WAF–East, TD7 notları                           | Kaynaksız veya kaynakla çelişen rakamlar: CPC programı "Ocak rekorunun %3 yakınında" (kaynaklar Ocak yüklemelerinin plandan ~%45 düşük olduğunu söylüyor), "2026'da 18 teslimat" (kaynak: 50 planlı), pozisyon listesi 26/41, TD15 "%70–80", TD7 "8–12 bin $/gün", "piyasa ortalamasının %10–15 üstü" | ✅ Rakamlar kaldırıldı, metin nitel hâle getirildi. "%10–15 üstü" şirketin performans iddiasıydı                                           |
| C19 | VLCC ve Suezmax rehberleri                               | "Tipik kiracılar" başlığı altında Saudi Aramco, ADNOC, KPC, CEPSA, Saras, Repsol: müşteri izlenimi veriyor (CEPSA'nın adı da 2024'te Moeve oldu)                        | ✅ Kategori adlarıyla değiştirildi                                                                                                                           |
| C20 | ~75 yer, 10 dil                                          | "60 dakikada ilk yanıt"; bazı yerlerde 60 dakikada gemi ve navlun fikri vaadi                                                                                            | 🟡 Sonuç vaatleri "60 dakikada yanıt, ardından …" olarak ayrıldı; iletişim sayfası açıklamasına "mesai saatlerinde" eklendi. 📋 Taahhüdü şirket doğrulamalı |
| C21 | Sınıf rehberleri, TD3C ve TD7 notları                    | Diğer mesafeler (TD3C 6.300, TD8, TD20, TD23) bağımsız tahminlere göre %15–25 sapıyor olabilir; TD7 "14 günlük sefer" (Hound Point–Wilhelmshaven ~450 nm)              | ✅ TD7 düzeltildi. 🔎 Diğerleri Netpas veya BP mesafe tablosuyla teyit edilmeli                                                                              |
| C22 | Ana sayfa, Hakkımızda, iletişim, footer, yerel sayfalar  | Doğrulanmamış şirket iddiaları: London ve Singapur ofisleri, "A.Ş.", kuruluş 2024, 9 broker, "her işte kıdemli broker", "her fixture taranır", ana dili konuşan broker | 📋 Şirket doğrulamalı. Makine tarafından okunan çıktılardan çıkarıldı (T3–T5); sayfa metni yer tutucu tasarım olarak duruyor                              |
| C23 | EU ETS notu                                              | "Tam rapor talep üzerine" deniyor; depoda böyle bir rapor yok                                                                                                           | 🔎 Rapor yoksa vaat kaldırılmalı                                                                                                                             |
| C24 | Gizlilik                                                 | Vercel'in güvencesi aynen aktarılıyordu ("sizi kişisel olarak tanımlamaz")                                                                                             | ✅ Vercel Inc. (ABD) ve işlediği veri (IP adresi, tarayıcı bilgisi) yazıldı. 📋 KVKK eksikleri hukuk incelemesine (sonuç raporu §6)                        |
| C25 | Kullanım koşulları                                        | Toplu kopyalama ve ticari tarama yasağı, `robots.txt` ve `ai.txt`'teki "AI eğitimine açık" politikayla çelişiyordu; var olmayan LinkedIn bağlantısından söz ediyordu; Uiverse bileşenlerinin MIT lisansı belirtilmiyordu | ✅                                                                                                                                                          |

---

## C. SEO ve içerik iyileştirme tablosu

Kelimeler arama niyetine ve sektör terminolojisine göre seçildi; hacimleri doğrulanmadı (araçlar erişilebilir değildi). Sayfa başına tek ana niyet hedeflendi ve aynı niyetin iki sayfaya bölünmemesine dikkat edildi.

| Sayfa                                       | Ana niyet / kelimeler                                                                          | İkincil kelimeler                                                                                   | Durum                                                                     |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `/`                                         | shipbroker Istanbul, tanker broker Istanbul, LPG shipbroker                                    | Black Sea tanker broker, VLGC chartering, ammonia carrier chartering                                | Başlık ve açıklama uygun; canonical düzeltildi                           |
| `/tankers`                                  | tanker chartering, crude tanker broker, product tanker chartering                              | Aframax chartering Mediterranean, Suezmax CPC, tanker charter types                                 | Uygun                                                                     |
| `/tankers/vlcc` … `/tankers/mr`             | "{sınıf} chartering", "{sınıf} broker"                                                         | Baltic rota kodları (TD3C, TD6, TD19, TD20, TC2…), sınıf ölçüleri                                   | Rota tanımları düzeltildi (C7–C11)                                        |
| `/lpg`                                      | LPG shipbroker, VLGC chartering, ammonia shipping broker                                        | LPG cbm to tonnes, propane density                                                                  | Uygun; dönüştürücü uzun kuyruk trafiği için değerli                      |
| `/lpg/vlgc` … `/lpg/pressurised`            | "{sınıf} charter", pressurised LPG carrier, semi-refrigerated LPG                              | BLPG1–3, small LPG Mediterranean                                                                    | Başlık uzunluğu düzeltildi (T8)                                           |
| `/turkish-straits`                          | Turkish Straits transit, Bosphorus transit tanker, Bosphorus daylight transit                  | Montreux dues, Turkish Straits clause, Bosphorus waiting time                                       | Bilgiler güncellendi (C1, C5, C6). En özgün sayfa, iç bağlantılarla öne çıkarılmalı |
| `/compliance`                               | sanctions screening shipping, price cap attestation                                            | OFAC vessel screening, shadow fleet screening                                                       | Bilgiler güncellendi (C2–C4)                                              |
| `/research` ve notlar                       | laytime and demurrage guide, Worldscale explained, TCE calculation, LPG time charter vs COA   | Hormuz charterer checklist, EU ETS shipping cost allocation                                         | Hatalar düzeltildi (C15–C18); yayın takvimi gerekiyor (U5)                |
| `/glossary`                                 | chartering glossary, tanker terms                                                              | Terim düzeyinde soru sorguları ("what is Worldscale", "JWC listed area")                           | Düzeltildi (C1, C12, C13)                                                 |
| `/brokers`, `/about`                        | Marka ve uzmanlık (E-E-A-T)                                                                    | —                                                                                                   | 📋 Gerçek kişiler ve şirket bilgileri gerekiyor                           |
| `/contact`                                  | charter inquiry, tanker broker contact                                                         | —                                                                                                   | 📋 Gerçek iletişim bilgileri gerekiyor                                    |
| `/zh` … `/ar`                               | Yerel dilde "tanker ve LPG brokerı" sorguları                                                  | —                                                                                                   | 📋 Ana dili konuşan kontrolü (T9), Türkçe sayfa kararı (U4)               |

---

## D. Site mimarisi ve menü

Canlı mimari sade ve iyi kurulmuş; **URL yapısı değiştirilmedi**. Mevcut kalıcı yönlendirmeler (`/dry-bulk`, `/offices/*`, `/brokers/*`, `/voyage-estimator` vb.) korunuyor.

```
/                      Ana sayfa
├── /tankers           Tanker masası → /tankers/{vlcc, suezmax, aframax, lr1, mr}
├── /lpg               LPG ve amonyak masası (+ cbm ↔ ton dönüştürücü) → /lpg/{vlgc, mgc, handysize, pressurised}
├── /research          Araştırma (13 not) → /research/{slug}, /research/feed.xml
├── /brokers           Ekip (masalara göre)
├── /glossary          Sözlük (70 terim)
├── /turkish-straits   Türk Boğazları rehberi
├── /compliance        Yaptırım ve uyum taraması
├── /about             Hakkımızda
├── /contact           Teklif formu
├── /privacy, /terms
└── /{zh, ja, ko, el, no, da, sv, de, es, ar}   Yerel açılış sayfaları
```

Ana menü: Tankers · LPG & Ammonia · Research · Team · Glossary · dil seçici · "Send inquiry". Footer: About, Turkish Straits guide, Compliance, Contact, Privacy, Terms ve masa iletişim bilgileri.

**Öneriler (📋):**

- Türk Boğazları rehberi firmanın en özgün içeriği. Footer ve ana sayfadan bağlantı alıyor (43 iç bağlantı), ancak ana menüde yok. Menüye "Turkish Straits" eklenmesi değerlendirilmeli.
- Türkçe açılış sayfası (U4).
- Gerçek ekip geldiğinde broker profil sayfaları yeniden açılabilir. Şu an `/brokers/:slug` adresleri `/brokers`'a yönleniyor; bu yönlendirmeler korunmalı.

---

## E. Tasarım sistemi ve ana sayfa yaklaşımı

Canlı tasarım, talepteki yönle (lacivert, beyaz/kemik, gri ve tek vurgu rengi) zaten uyumlu. Yeniden tasarıma gerek görülmedi; değişiklikler erişilebilirlik ve performansla sınırlı tutuldu.

| Öğe            | Değer                                                                                                                       |
| -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Ana renkler    | Navy `#0A1F33` (deep `#051624`, soft `#13304A`), zemin `#FBFAF7`, sand `#F3EFE4`, çizgi `#E4DDCC`, slate `#4A5E6E`, fog `#A9B6BF` |
| Vurgu          | Pirinç `#B8893A` dolgu ve dekor için; açık zeminde metin için `brass-ink` `#8A6420`; koyu zeminde `brass-light` `#D9B071`     |
| Tipografi      | Source Serif 4 (başlık), Manrope (gövde), IBM Plex Mono (etiketler, koordinat)                                              |
| Bileşenler     | Uiverse kitinden uyarlanmış buton, kart, çip, akordeon; dalga ızgarası (graticule) deseni; sınıf çizimleri                  |
| Erişilebilirlik | axe 36 görünümde 0 ihlal (değişiklik sonrası), odak halkaları belirgin, `prefers-reduced-motion` destekli                   |

**Bu çalışmada:** imza baş harflerinin kontrastı düzeltildi (U1). Font önyüklemesi 7 dosyadan 2'ye indi (T13).

**Öneriler (📋):** CI'a Playwright + axe kontrolü eklenmesi. Gerçek ekip fotoğrafları geldiğinde baş harf avatarlarının yerini alması. Ana sayfadaki "kanıt" şeridinin (60 dk, üç ofis, taranmış fixture) yalnızca doğrulanmış maddelerle bırakılması.

---

## F. Uygulama öncelik sırası

| Sıra | İş                                                                                                                     | Kim          | Durum |
| ---- | ---------------------------------------------------------------------------------------------------------------------- | ------------ | ----- |
| 1    | Canonical ve indeks ayarları (T1), yapılandırılmış verideki yer tutucular (T3–T5), CSP (T6), `security.txt` (T7)      | Kod          | ✅    |
| 2    | Sektörel düzeltmeler ve kaynaksız rakamların temizlenmesi (C1–C19, C21'in bir kısmı)                                   | Kod / içerik | ✅    |
| 3    | Kontrast ve font önyüklemesi (U1, T13), başlık uzunluğu (T8), koşullar ve gizlilik düzeltmeleri (C24, C25)              | Kod          | ✅    |
| 4    | Production'ın herkese açık olup olmadığını doğrulamak, özel alan adı eklemek, `NEXT_PUBLIC_SITE_URL` ayarlamak (T2)      | Şirket       | 📋    |
| 5    | Gerçek iletişim bilgileri ve gelen kutuları; ardından `COMPANY_DETAILS_CONFIRMED = true` (U2, U3)                     | Şirket       | 📋    |
| 6    | Gerçek ekip (rıza ile) ve `verified: true`; doğrulanmış sosyal profiller (C22, T4)                                    | Şirket       | 📋    |
| 7    | Taahhütlerin teyidi: 60 dakika, ofisler, "her fixture taranır" (C20, C22); EU ETS raporu (C23)                        | Şirket       | 📋    |
| 8    | KVKK ve GDPR hukuk incelemesi; Türkçe sayfa kararı (U4)                                                               | Şirket/hukuk | 📋    |
| 9    | Yayın takvimi, notlar arası bağlantılar, yerel metinlerin kontrolü (U5, T11, T9)                                     | İçerik       | 📋    |
| 10   | Mesafelerin tabloyla teyidi (C21), Google Fonts bağımlılığı (T12), CI'a axe                                            | Kod / içerik | 📋    |
