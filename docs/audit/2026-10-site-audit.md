# LEVANTER web sitesi — denetim ve yenileme planı (A–F)

**Tarih:** 21 Ekim 2026
**Kapsam:** `riosenbeq/shipping` deposundaki Next.js 14 uygulaması. Talepte site URL'si verilmediği (`[BURAYA SİTE URL'SİNİ EKLE]`) için denetim, bu kod tabanının yerelde alınan **production build'i** (`next build && next start`) üzerinden yapıldı.

## Yöntem ve sınırlar

| Yapılan | Araç / yöntem |
| --- | --- |
| Tüm rotaların ve verinin kod incelemesi | 74 kaynak dosya, 16 bin satır |
| Production build | `next build`: 60 statik sayfa, derleme hatasız |
| Tarama | `sitemap.xml` + iç bağlantılar üzerinden 44 HTML URL; durum kodu, title, description, canonical, H1/H2 sırası, JSON-LD, `href="#"`, sayfa içi çapalar |
| Tarayıcıda render + erişilebilirlik | Playwright/Chromium, masaüstü 1366 px ve mobil (Pixel 7, 412 px), 16 sayfa × 2 görünüm, axe-core (WCAG 2.1 A/AA + best-practice) |
| Performans | Lighthouse 12 (mobil emülasyon, simüle ağ kısıtlaması), 5 önemli sayfa |
| Sektörel veri doğrulaması | EIA (Turkish Straits petrol akışı), T.C. Denizcilik Genel Müdürlüğü verisine dayanan haberler (Boğaz geçişleri), Baltic Exchange rota tanımları, Türk Boğazları geçiş ücreti haberleri |

**Erişilemeyenler (bu nedenle "doğrulanmadı" olarak işaretlendi):**

- Canlı alan adı, hosting paneli, sunucu logları. Canlı sitenin hangi alan adında yayınlandığı bilinmiyor.
- Google Search Console, PageSpeed Insights **alan verisi** (CrUX) ve analitik verisi. Lighthouse sonuçları laboratuvar ölçümüdür, gerçek kullanıcı verisi değildir.
- Anahtar kelime hacimleri: Ahrefs API planı bu uç noktaya izin vermedi ("Insufficient plan"). Semrush hesabında yeterli API birimi yok ([semrush.com/mcp-access](https://www.semrush.com/mcp-access)). Bu yüzden C bölümündeki kelimeler arama niyetine ve sektör terminolojisine göre seçildi; hacimleri doğrulanmadı.
- Şirketin gerçek faaliyet bilgileri. Sitede alan adı `levanter.example`, telefonlar `+90 212 000 0000` biçiminde. Bunlar yer tutucu veri. Broker isimleri, ofis adresleri, üyelikler ve istatistikler de büyük olasılıkla tasarım aşamasından kalma yer tutucular. Bu bilgileri doğrulamanın tek yolu şirketin kendisi.

---

## A. Mevcut sitenin genel değerlendirmesi

**Teknoloji:** Next.js 14 (App Router), TypeScript, Tailwind ve tek parça 4.185 satırlık `globals.css`, Radix UI, Zod, Vitest, GitHub Actions CI. Tüm sayfalar build sırasında statik HTML olarak üretiliyor (SSG). İçerik HTML'in içinde olduğu için **JavaScript render riski düşük**: arama motorları içeriği JS çalıştırmadan görebiliyor.

**Güçlü yönler**

- Sağlam teknik temel: statik üretim, `next/font` ile kendi sunucusundan yüklenen fontlar, düşük JS yükü (çoğu sayfada ilk yükleme ~107 kB).
- Site genelinde metadata, Open Graph, sitemap, robots, RSS, `llms.txt` ve `security.txt` altyapısı kurulu.
- Sektöre özgü, faydalı içerik: sınıf bazlı tanker sayfaları, 38 terimlik chartering sözlüğü, TCE/serbest navlun/bunker hesaplayan voyage estimator, rota rehberleri.
- Tutarlı ve karakterli bir görsel dil: lacivert, kemik beyazı ve pirinç (brass) tonları; serif başlık fontu.
- Birim testleri ve CI (lint, format, test, build) mevcut.

**Zayıf yönler (özet)**

1. **Mobil gezinme bozuk:** 412 px genişlikte her sayfada yatay taşma var. Menü (hamburger) butonu ekranın dışında kalıyor, tema düğmesi iki kez görünüyor.
2. **Çok sayıda ölü bağlantı:** 198 adet `href="#"` (site genelindeki "Client login" dahil) ve 4 kırık sayfa içi çapa.
3. **Kanonik URL riski:** `NEXT_PUBLIC_SITE_URL` tanımlanmazsa canonical, sitemap, Open Graph ve JSON-LD adreslerinin tamamı `https://levanter.example` alanına işaret ediyor.
4. **Yayınlanmayan içerik:** 9 araştırma raporunun 4'ünde metin anahtarı URL slug'ıyla eşleşmediği için yazılmış tam metinler hiç görüntülenmiyor. Bu sayfalar ~110 kelimelik ince sayfalar olarak kalıyor.
5. **Erişilebilirlik:** Pirinç rengi metinler açık zeminde 2.66:1, beyaz-üzeri-pirinç butonlar 3.1:1 kontrastta kalıyor (AA eşiği 4.5:1). axe 32 görünümde 831 kontrast ihlali raporladı. Bunlara ek olarak iç içe `<main>`, iç içe etkileşimli öğeler ve hatalı ARIA kullanımı var.
6. **Doğrulanmamış veya çelişkili iddialar:** "80+ yıl deneyim", "38 ülke, 120+ armatör", "ortalama 42 dk ilk yanıt" ile "medyan 62 dk ilk yanıt" ve "60 dk SLA" birbiriyle çelişiyor. "24/7" ile "22 saat" çelişiyor. Ana sayfada üyelikler "başvuru sürecinde" görünürken ofis sayfaları aynı kurumlara "üye" diyor. Saudi Aramco, ADNOC, Sinopec ve CEPSA gibi şirketler müşteri izlenimi verecek şekilde adlandırılıyor. Değerleri yazılmış "kapanan işler" tablosu ve "bugün" etiketli sabit BDI rakamları da var.
7. **Bilgi mimarisi:** Dry Bulk ve S&P ana menüde yok. Footer yalnızca bir bağlantı satırından ibaret; adres ve iletişim bilgisi içermiyor. Detay sayfalarının her biri yalnızca tek bir iç bağlantı alıyor.
8. **Dönüşüm:** Teklif formu sunucuya gönderim yapmıyor, kullanıcının e-posta uygulamasını açıyor. E-posta istemcisi tanımlı değilse talep kayboluyor, buna rağmen ekranda "Inquiry composed" yazıyor. Doğrulama mesajları İngilizce arayüzde Türkçe çıkıyor.
9. **Gizlilik tutarsızlığı:** Çerez banner'ı "session ve CSRF çerezleri" kullanıldığını söylüyor, ancak sitede oturum yok. Kabul/Reddet düğmeleri hiçbir şeyi değiştirmiyor ve analitik izinden bağımsız yükleniyor.
10. **Sektörel doğruluk:** Bazı denizcilik verileri hatalı. Ayrıntılar B tablosunda.

**Lighthouse (mobil, laboratuvar, yerel sunucu, öncesi):**

| Sayfa | Performans | Erişilebilirlik | En iyi uygulamalar | SEO | LCP | TBT |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | 81 | 94 | 96* | 100 | 3,2 sn | 460 ms |
| `/tankers` | 95 | 95 | 96* | 100 | 2,8 sn | 90 ms |
| `/contact` | 94 | 94 | 96* | 100 | 3,1 sn | 40 ms |
| `/voyage-estimator` | 94 | 91 | 96* | 100 | 3,0 sn | 110 ms |
| `/research` | 97 | 90 | 96* | 100 | 2,6 sn | 40 ms |

\* "En iyi uygulamalar" puanını düşüren konsol hataları, Vercel Analytics/Speed Insights betiklerinin yerelde 404 dönmesinden kaynaklanıyor. Vercel üzerinde bu hata beklenmez.
Ana sayfadaki yüksek TBT'nin ana nedeni sürekli çalışan SVG/SMIL animasyonları (yıldız parıltısı, dalga halkaları): stil, yerleşim ve boyama işleri ana iş parçacığında ~3,5 sn sürüyor. Lighthouse SEO puanının 100 olması kanonik alan adı sorununu yakalamıyor; bu kontrol yalnızca etiketin geçerli olup olmadığına bakıyor.

---

## B. Tespit edilen sorunlar ve önem dereceleri

Önem: **Kritik** (yayın öncesi mutlaka) · **Yüksek** · **Orta** · **Düşük**. Maliyet: **D** düşük · **O** orta · **Y** yüksek.
"Durum" sütunu bu çalışmada ne yapıldığını gösterir: ✅ uygulandı · 🟡 kısmen · 📋 öneri (karar veya veri gerekiyor) · 🔎 doğrulama gerekiyor.

### B1. Teknik ve SEO

| # | Sorun | Kanıt | Önem | SEO etkisi | UX etkisi | Maliyet | Durum |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T1 | `NEXT_PUBLIC_SITE_URL` yoksa canonical, sitemap, OG ve JSON-LD adresleri `levanter.example` alanına gidiyor | Taranan 44 sayfanın tamamında canonical `https://levanter.example/...` | Kritik | Çok yüksek: yanlış kanonik, indekslenmeme | — | D | ✅ |
| T2 | robots.txt tüm botlar için `/_next/` yolunu engelliyor; CSS/JS'e erişim kapanıyor | `/robots.txt` çıktısı | Yüksek | Render ve mobil uyumluluk değerlendirmesi | — | D | ✅ |
| T3 | 4 araştırma makalesinin gövdesi yayınlanmıyor (slug ile anahtar eşleşmiyor) | `waf-east…`, `td7-…-short-haul…`, `g7-…-desk-level…`, `aframax-5-year-old…` sayfaları ~110 kelime | Yüksek | İnce içerik, kaybedilen sıralama fırsatı | Okuyucu metni göremiyor | D | ✅ (+ test) |
| T4 | 198 adet `href="#"` ve 4 kırık çapa (`#inquiry`, `#read`, `#download`, `#contact`) | Tarama | Yüksek | Tarama bütçesi, kalite sinyali | Güven kaybı | D–O | ✅ |
| T5 | Mobil başlık taşması: `.nav-right { display:flex }`, Tailwind'in `hidden` sınıfını eziyor | 412 px'te `scrollWidth` 461; menü butonu ekran dışında | Kritik | Mobil kullanılabilirlik | Mobilde menü açılamıyor | D | ✅ |
| T6 | Geçersiz veya yanıltıcı yapılandırılmış veri: `Product` (offers/review yok), ItemList'te ISO olmayan tarih ("28 APR 2026"), `openingHours` "07:00 – 21:00 daily" biçiminde, `Place.containedInPlace → Organization`, sayfa düzeyinde tek başına `ContactPoint`, `Person.image` = genel OG görseli, yinelenen breadcrumb URL'si, Organization logosu 32×32 (Google en az 112×112 istiyor), glossary `@id` alan adına sabit kodlanmış | JSON-LD analizi | Yüksek | Search Console hataları, zengin sonuç kaybı | — | D | ✅ |
| T7 | Güvenlik başlıkları yok, `X-Powered-By: Next.js` görünüyor | `curl -I` | Orta | Dolaylı | Güvenlik | D | ✅ |
| T8 | Başlıkta marka tekrarı ve uzun title'lar | "Istanbul Office — LEVANTER Istanbul Desk — LEVANTER"; tanker sınıfı title'ları 65–71 karakter | Orta | CTR | — | D | ✅ |
| T9 | H1'ler slogan odaklı; konu kelimesi içermiyor | `/brokers` "Direct access. Real brokers." vb. | Orta | Alaka sinyali | Netlik | D | ✅ |
| T10 | Zayıf iç linkleme: ana sayfadaki broker ve rapor kartları liste sayfasına gidiyor; ofis ekibi profillere bağlanmıyor | Her detay sayfası yalnızca 1 iç bağlantı alıyor | Orta | Otorite dağılımı | Keşif | D | ✅ |
| T11 | Sitemap'te tüm statik sayfaların `lastmod` değeri build anı | `sitemap.xml` | Düşük | Güvenilmez tazelik sinyali | — | D | ✅ |
| T12 | Ofis URL'leri anlamsız kısaltmalar (`/offices/ist`) | — | Düşük | Yerel aramalarda küçük etki | — | D | ✅ `/offices/istanbul` + 301 |
| T13 | `security.txt` içinde 404 dönen `Policy` ve `Acknowledgments` adresleri | `/security-policy` 404 | Düşük | — | — | D | ✅ |
| T14 | Hesaplayıcıda "çalışıyor gibi görünen" sınıf hatası: `view${…}` → `viewactive` | Kod | Düşük | — | Yazdırma stili bozuk | D | ✅ |
| T15 | Ana sayfa TBT 460 ms: sürekli SMIL animasyonları, `prefers-reduced-motion` desteği yok | Lighthouse | Orta | Core Web Vitals (INP/TBT) | Hareket hassasiyeti | D | ✅ |
| T16 | Mono font için gereksiz 3 font preload | HTML | Düşük | LCP rekabeti | — | D | ✅ |
| T17 | `hreflang` yok, site yalnızca İngilizce; KVKK aydınlatma metni Türkçe değil | — | Orta | TR pazarı | — | O | 📋 |
| T18 | `SoftwareApplication` şeması puan/yorum olmadan zengin sonuç üretmez | — | Düşük | — | — | — | 📋 Sahte puan **eklenmemeli** |

### B2. Erişilebilirlik ve UX

| # | Sorun | Kanıt | Önem | Maliyet | Durum |
| --- | --- | --- | --- | --- | --- |
| U1 | Pirinç metin/açık zemin 2.66:1; beyaz/pirinç buton 3.14:1; `ink-fog` metin 2.28:1 | axe: 831 düğüm | Yüksek | O | ✅ |
| U2 | `/brokers` sayfasında iki `<main>`; başlık seviyesi atlamaları (h2→h4, h1→h3) | axe, tarama | Orta | D | ✅ |
| U3 | Ofis kartları `role="button"` olup içlerinde bağlantı barındırıyor (iç içe etkileşim); harita pinlerine klavyeyle erişilemiyor | axe | Orta | D | ✅ |
| U4 | Araştırma filtresi Radix Tabs ile yapılmış ama panel yok (`aria-controls` boşa işaret ediyor); hesaplayıcıdaki segment kontrolünde rol hatası; sıralama seçicisinin erişilebilir adı yok | axe (critical) | Yüksek | D | ✅ |
| U5 | Form: doğrulama mesajları Türkçe; "Skip anything" denmesine rağmen alanlar zorunlu; dry bulk seçen kullanıcıya tanker sınıfları sunuluyor; serbest not alanı yok (ana sayfa "CP şartlarınızı gönderin" diyor); adım değişince odak taşınmıyor; e-postaya kodlar (`blk-cpc`, `voy`) gidiyor | Kod | Yüksek | O | ✅ |
| U6 | Form sunucuya göndermiyor; e-posta istemcisi yoksa talep kayboluyor | Kod | Yüksek | O–Y | 🟡 Dürüst akış ve "metni kopyala" yedeği eklendi. Sunucu tarafı gönderim 📋 |
| U7 | Hata sayfasında "The desk has been notified" yazıyor, oysa bildirim mekanizması yok. "Desk clients are added automatically", "unsubscribe in one click" ifadeleri de gerçeği yansıtmıyor | Kod | Orta | D | ✅ |
| U8 | Çerez banner'ı gerçeği yansıtmıyor, seçim analitiği etkilemiyor | Kod | Yüksek (KVKK/GDPR) | D | ✅ Analitik izne bağlandı |
| U9 | *(Uygulama sırasında bulundu)* Teklif formunda yazılan metin açık zeminde görünmüyordu: hesaplayıcının koyu panel stili tüm `.field input` öğelerine sızıyordu | Playwright'ta hesaplanan stil: `rgb(241,236,220)` metin, krem zemin | Kritik | D | ✅ Stil `.calc-panel` kapsamına alındı |
| U10 | *(Uygulama sırasında bulundu)* Mobil menü paneli hiç görünmüyordu: başlıktaki `backdrop-filter`, `position: fixed` paneli sıfır yüksekliğe hapsediyordu (menü butonu da ekran dışında olduğu için fark edilmiyordu) | Ekran görüntüsü | Kritik | D | ✅ Panel `<header>` dışına taşındı |
| U11 | *(Uygulama sırasında bulundu)* Voyage estimator mobilde yatay taşıyordu (554 px / 412 px) | Playwright | Orta | D | ✅ Izgara hücreleri ve duyarlılık tablosu küçülebilir/kaydırılabilir yapıldı |

### B3. İçerik, iddialar ve sektörel doğruluk

| # | Sorun | Önem | Durum |
| --- | --- | --- | --- |
| C1 | Doğrulanamayan istatistikler: "80+ years", "38 active VLCC fixtures", "6 Suezmax COAs", "42/62 min", "38 countries", "120+ owners", "~38% of YTD Suezmax fixtures" | Kritik | ✅ Kaldırıldı. Yerlerine yalnızca sitenin kendi verisinden türetilebilen yapısal bilgiler kondu (ofis sayısı, kapsanan segmentler, çalışma saatleri). Gerçek rakamlar doğrulanırsa geri eklenebilir |
| C2 | Üyelik ve akreditasyon iddiaları kendi içinde çelişkili ("application in progress" ile "member"); USFMC OTI lisansı ve "Lloyd's" etiketi gibi düzenleyici iddialar | Kritik | ✅ `siteConfig.memberships` altına taşındı, `verified: false`. Doğrulanana kadar hiçbir yerde gösterilmiyor 🔎 |
| C3 | Müşteri izlenimi veren adlandırılmış şirketler (Saudi Aramco, ADNOC, Kuwait Petroleum, CEPSA, Saras, Repsol, Sinopec, CNOOC, Unipec) | Kritik | ✅ Genel segment ifadeleriyle değiştirildi |
| C4 | S&P "What the desk has been closing" tablosu, değerleriyle birlikte (~$83 m, ~$540/LDT …) | Yüksek | ✅ Değersiz "tipik yetki türleri" listesine dönüştürüldü |
| C5 | Dry bulk sayfasında "bugün" etiketli sabit BDI/BCI/BPI/BSI değerleri (uydurma veri ve Baltic veri lisansı riski) | Yüksek | ✅ Sayılar kaldırıldı, endeks açıklamaları eklendi |
| C6 | Rota kodu hataları: "S1B Indonesia → ECI" (doğrusu S8; S1B Çanakkale çıkışlıdır), "P6 USEC → ARA" (P6_82 Singapur çıkışlı, Atlantik üzerinden round voyage), "S10 S. China → Singapore", uydurma "HS" kodları | Yüksek | ✅ |
| C7 | Türk Boğazları ücreti "≈$28.5k sabit" yazıyor. Gerçekte ücret net ton başına alınıyor (1 Temmuz 2025'ten itibaren 5,83 $/NT) | Yüksek | ✅ |
| C8 | "48,000 ships" ifadesi eski. 2025'te İstanbul Boğazı'ndan 40.172 geçiş yapıldı | Orta | ✅ Kaynakla güncellendi |
| C9 | "3% of the world's oil flow" ifadesinin kaynağı yok. EIA'ya göre Türk Boğazları 2025'in ilk yarısında ~3,7 milyon varil/gün taşıdı | Orta | ✅ Kaynaklı ifadeye çevrildi |
| C10 | EU ETS 2024 notu yanlış ("intra-EEA seferlerin yarısı muaf"). Doğrusu: EEA içi seferlerin %100'ü, EEA dışına/dışından seferlerin %50'si kapsamda | Orta | ✅ |
| C11 | NACKS hem Japon hem Çin tersanesi olarak listeleniyor. "Kamsarmax … geared survey 2030" gibi anlamsız terim. Aliağa ile Alang arasındaki fiyat farkı "30–60 $/LDT" olarak eksik gösteriliyor. Dry bulk COA'ları arasında "CPC" geçiyor (CPC ham petrol terminalidir). "deck-level" yazım hatası | Orta | ✅ |
| C12 | Pazarlama metninde "every Russian Urals barrel heading west" ifadesi yaptırım hassasiyeti açısından itibar riski taşıyor | Orta | ✅ Yeniden yazıldı |
| C13 | Araştırma bölümü "her pazartesi" ve "weekly" vaat ediyor, ama son yayın Nisan 2026 (6 ay önce). Raporlarda yazar adı yok | Yüksek | 📋 Editoryal takvim, adlandırılmış yazarlar |
| C14 | 14 broker profilinin gerçek kişiler olup olmadığı, ofis adresleri ve telefonlar doğrulanmadı. Kişisel veri için açık rıza gerekiyor (KVKK/GDPR) | Kritik | 🔎 Şirket onayı gerekiyor |
| C15 | Broker profilleri ince içerik (~50 kelime): biyografi, deneyim ve dil bilgisi yok | Orta | 📋 Gerçek biyografiler |
| C16 | "Hakkımızda" sayfası yok. Ticaret sicili, MERSİS, yönetim ve uyum politikası gibi E-E-A-T sinyalleri eksik | Yüksek | 📋 Şirket verisiyle |

---

## C. SEO ve içerik iyileştirme tablosu

> Arama hacimleri doğrulanmadı (bkz. Yöntem). Title önerileri "%s — LEVANTER" şablonuyla birlikte ~60 karakteri aşmayacak şekilde yazıldı.

| URL | Arama niyeti | Ana kelime | İkincil kelimeler | Title (uygulandı) | Meta description (uygulandı, özet) | H1 (uygulandı) | İç link önerileri |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Ticari / navigasyonel | shipbroker Istanbul | tanker chartering, dry bulk chartering, ship S&P, Bosphorus shipbroker | LEVANTER — Tanker & Dry Bulk Shipbrokers, Istanbul | Istanbul merkezli tanker, dry bulk ve S&P broker'lığı; Londra, Singapur, Houston masaları; charter inquiry | Tanker and dry bulk shipbroking. From the Bosphorus to the world. | Hizmet sayfaları, son 3 rapor (doğrudan), broker profilleri, `/offices/istanbul`, `/contact` |
| `/tankers` | Ticari | tanker chartering | VLCC/Suezmax/Aframax chartering, clean tanker chartering, LR1, MR | Tanker Chartering — Crude & Clean, VLCC to MR | Spot, TC ve COA; MEG, WAF, Karadeniz/CPC, USG, Akdeniz | Crude and clean tanker chartering, VLCC to MR. | 5 sınıf sayfası, TD3C ve Suezmax raporları, sözlük, hesaplayıcı |
| `/tankers/vlcc` | Bilgi + ticari | VLCC chartering | very large crude carrier, VLCC dwt, TD3C, TD15, TD22 | VLCC Chartering — Very Large Crude Carrier | Boyut, kapasite, rotalar, charter yapısı | VLCC chartering — the Very Large Crude Carrier | TD3C rehberi, WAF–East raporu, ilgili broker profilleri |
| `/tankers/suezmax` | Bilgi + ticari | Suezmax chartering | Suezmax size, TD20, TD6, CPC | Suezmax Chartering — 130–160k dwt Crude Tankers | — | Suezmax chartering — the Suez Canal-max crude tanker | Suezmax raporu, `/offices/istanbul` |
| `/tankers/aframax` | Bilgi + ticari | Aframax chartering | LR2 tanker, TD7, TD19, Black Sea Aframax | Aframax & LR2 Chartering — 80–115k dwt Tankers | — | Aframax / LR2 chartering — short-haul crude and coated tonnage | TD7 rehberi, Aframax S&P raporu |
| `/tankers/lr1` | Bilgi + ticari | LR1 tanker | LR1 chartering, TC5, TC8 | LR1 Tanker Chartering — 55–80k dwt Clean Products | — | LR1 chartering — Long Range 1 clean products tankers | MR sayfası, sözlük |
| `/tankers/mr` | Bilgi + ticari | MR tanker | MR tanker size, TC2, TC14, TC17 | MR Tanker Chartering — 40–55k dwt Clean Products | — | MR chartering — Medium Range clean products tankers | Houston ofisi |
| `/dry-bulk` | Ticari | dry bulk chartering | Capesize, Panamax/Kamsarmax, Supramax/Ultramax, Handysize, dry bulk COA | Dry Bulk Chartering — Capesize to Handysize | Demir cevherinden tahıla; spot, TC, COA | Dry bulk chartering: iron ore to grains, Capesize to Handysize. | Bulk broker profilleri, sözlük, contact (bulk ön seçili) |
| `/sale-purchase` | Ticari | ship sale and purchase | S&P broker, ship valuation, newbuilding, ship recycling (HKC) | Ship Sale & Purchase — Valuations & Recycling | Yeni inşa, ikinci el, geri dönüşüm; aralık bazlı değerleme | Ship sale & purchase: newbuilding, second-hand and recycling. | S&P broker'ları, VLCC NB raporu |
| `/research` | Bilgi | tanker market research | shipping market outlook, route guide, EU ETS shipping | Tanker Market Research & Route Guides | Haftalık görünüm, rota rehberleri, düzenleme analizleri | Tanker market research, route guides and regulation. | Tüm rapor sayfaları, RSS |
| `/research/[slug]` | Bilgi | Rapora özgü (ör. "TD3C route") | — | Rapor başlığı | Rapor özeti | Rapor başlığı | İlgili raporlar, ilgili sınıf sayfası |
| `/brokers` | Navigasyonel | shipbroker contact | tanker broker, dry bulk broker, S&P broker | Shipbrokers — Tanker, Dry Bulk & S&P Desks | Sektör, sınıf ve ofise göre filtre | Shipbrokers by desk: tankers, dry bulk, chemicals and S&P. | Profiller, ofisler |
| `/offices` | Navigasyonel / yerel | shipbroker offices | Istanbul, London, Singapore, Houston shipbroker | Offices — Istanbul, London, Singapore, Houston | Dört masa, çalışma saatleri | Shipbroking offices in Istanbul, London, Singapore and Houston. | 4 ofis sayfası |
| `/offices/istanbul` (eski `/offices/ist`) | Yerel / ticari | shipbroker Istanbul | Bosphorus tanker broker, Black Sea chartering | Istanbul Shipbrokers — Bosphorus Headquarters | — | LEVANTER Istanbul — shipbroking headquarters on the Bosphorus | Istanbul broker'ları, Suezmax/Aframax |
| `/offices/london`, `/singapore`, `/houston` | Yerel / ticari | {şehir} shipbroker | — | {Şehir} Shipbroking Desk — … | — | LEVANTER {şehir} — {odak} | İlgili broker'lar |
| `/contact` | İşlemsel | charter inquiry | shipbroker contact | Charter Inquiry — Contact the Desk | 4 adım, ilk yanıt taahhüdü | Send a charter inquiry. | — |
| `/voyage-estimator` | Bilgi / araç | voyage estimator | TCE calculator, Worldscale calculator, bunker cost, EU ETS cost | Voyage Estimator & TCE Calculator for Tankers | — | Tanker voyage estimator & TCE calculator. | Sözlük (TCE, WS), rota rehberleri |
| `/glossary` | Bilgi | chartering glossary | Worldscale meaning, demurrage, laytime, TCE meaning, COA | Chartering Glossary — Shipping Terms Explained | — | Chartering glossary: shipping terms explained. | Hesaplayıcı, ilgili rehberler |

**Önerilen içerik kümeleri (şirketin faaliyetleri doğrulandıktan sonra):**

1. **Tanker chartering:** `/tankers` → sınıf sayfaları → rota rehberleri (TD3C, TD20, TD6, TD7, TD19, TC2, TC14) → sözlük terimleri.
2. **Voyage economics:** voyage estimator, TCE ve Worldscale açıklamaları, **demurrage & laytime rehberi** ve olası bir laytime hesaplayıcı, EU ETS maliyet rehberi.
3. **Karadeniz ve Türk Boğazları:** Boğaz geçiş rehberi (net tona göre ücret, geçiş kuralları), CPC ihracatı, Istanbul masası. Istanbul merkezli bir broker için en güçlü konu otoritesi alanı.
4. **Dry bulk:** sınıf sayfaları (Capesize, Kamsarmax, Ultramax, Handysize) ve Baltic rota rehberleri (C3, C5, P6_82, S1B Çanakkale).
5. **Düzenleme ve uyum:** EU ETS, G7 fiyat tavanı, CII/EEXI, Hong Kong Sözleşmesi.
6. **S&P:** değerleme yöntemi, yeni inşa slot rehberi, HKC uyumlu geri dönüşüm rehberi.

**Anahtar kelime yamyamlığı / tekrar riski:** Glossary ile hesaplayıcıdaki "Reference" sekmesi aynı tanımları tekrarlıyor. Sözlük `/glossary` sayfasında kanonik olarak kalmalı; hesaplayıcı yalnızca özet göstermeli. `/tankers` sayfasındaki "Recent crude views" kartları araştırma kayıtlarının kopyasıydı; artık doğrudan rapor sayfalarına bağlanıyor.

---

## D. Yeni site mimarisi ve menü

```
/                         Ana sayfa
├── /tankers              Tanker chartering (hub)
│   ├── /tankers/vlcc  /suezmax  /aframax  /lr1  /mr
├── /dry-bulk             Dry bulk chartering
├── /sale-purchase        Sale & Purchase
├── /research             Araştırma (hub) → /research/[slug], /research/feed.xml
├── /voyage-estimator     Araç
├── /glossary             Sözlük
├── /brokers              Ekip → /brokers/[slug]
├── /offices              Ofisler → /offices/istanbul|london|singapore|houston  (eski kısaltmalar 301)
├── /contact              Charter inquiry
├── /privacy  /terms      Yasal
└── (öneri) /about, /compliance, /markets/black-sea-turkish-straits, /tr/…
```

**Üst menü (uygulandı):** Logo · Tankers · Dry Bulk · S&P · Research · Brokers · Offices · Tools · **[Charter inquiry]** birincil butonu · tema düğmesi. Mobil çekmece menüde aynı bağlantılar, birincil buton ve doğrudan telefon/WhatsApp/e-posta kanalları bulunuyor. İşlevi olmayan "Client login" kaldırıldı.

**Footer (uygulandı):** Hizmetler · Kaynaklar · Şirket · İletişim (yasal unvan, adres, telefon, e-posta) · yasal satır (Privacy, Terms, çerez tercihleri, dinamik yıl).

**Breadcrumb:** Tüm iç sayfalarda görünür breadcrumb ile `BreadcrumbList` JSON-LD aynı hiyerarşiyi izliyor.

---

## E. Tasarım sistemi ve ana sayfa yaklaşımı

**Renk (token'lar `app/globals.css`):**

| Token | Açık tema | Koyu tema / koyu bölüm | Kullanım |
| --- | --- | --- | --- |
| `--ink-deep-petrol` | #0A1F33 | — | Ana metin, koyu bölümler |
| `--bg` / `--surface-*` | #F1ECDC / #FAF6EC / #F4EEDD | #04101A / #0A1F33 | Zeminler |
| `--muted` | #4A5E6E (5.7:1) | #8FA0AC | İkincil metin |
| `--accent-brass` | **#7F5D22** (açık zeminde 5.1:1) | #B8893A (koyu zeminde ≥5.3:1) | Vurgu metni, bağlantı, çerçeve. Bulunduğu bağlama göre değer değiştirir |
| `--accent-brass-fill` | #B8893A | #B8893A | Buton dolgusu; üzerindeki metin lacivert (5.3:1) |

**Tipografi:** Source Serif 4 başlıklar için, Manrope gövde metni için, IBM Plex Mono veri ve etiketler için (preload kapalı). Ölçek: H1 40–60 px, H2 28–44 px, gövde 16–18 px, etiket 11–12 px.
**Boşluk ve ızgara:** 8 px tabanlı ölçek, 1320 px konteyner, mobilde 20 px kenar boşluğu.
**Hareket:** Yalnızca anlam taşıyan geçişler kalıyor. Dekoratif sonsuz animasyonlar kaldırıldı; `prefers-reduced-motion` tüm animasyonları durduruyor.
**Odak ve klavye:** Görünür 2 px odak halkası, "Skip to content" bağlantısı, tüm etkileşimli öğeler klavyeyle kullanılabiliyor.
**Bileşenler:** Button (primary/outline/ghost/bone), Eyebrow, Section head, Card/Panel, Data table, Callout, Breadcrumb, Contact CTA, Notice.

**Ana sayfa akışı (uygulandı):**

1. **Hero:** net değer önerisi, iki CTA (Charter inquiry / Voyage estimator) ve ofislerin listesi.
2. **Gösterge niteliğinde navlun şeridi:** "Illustrative levels, not live market data" olarak açıkça etiketli.
3. **Kapsam bandı:** doğrulanabilir yapısal bilgiler (4 ofis, segmentler, sınıf aralığı, hafta içi kapsama).
4. **Hizmetler:** Tankers, Dry Bulk, S&P, Research & tools.
5. **Boğaz uzmanlığı:** kaynaklı veriler (EIA, Denizcilik Genel Müdürlüğü).
6. **Broker önizlemesi:** profillere doğrudan bağlantı, çalışan iletişim kanalları.
7. **Araştırma:** tarihli, rapor sayfalarına doğrudan bağlantı.
8. **Üyelikler:** yalnızca `verified: true` olanlar gösteriliyor; şu an gizli.
9. **Son CTA** ve tam footer.

**Görseller:** Şu anda yalnızca SVG illüstrasyonlar kullanılıyor (hızlı ve marka ile uyumlu). Gerçek fotoğraf gerekiyorsa şirketin kendi ofisi, Boğaz ve faaliyet gösterdiği gemi tiplerine ait **lisanslı** görseller kullanılmalı; ilgisiz stok gemi fotoğraflarından kaçınılmalı. Görseller AVIF/WebP formatında, `next/image` ile, açıklayıcı dosya adları ve alt metinle eklenmeli.

---

## F. Uygulama öncelik sırası

**Faz 0: Bu çalışmada uygulandı (güvenli ve geri alınabilir)**

1. Kanonik alan adı çözümlemesi, robots.txt, sitemap `lastmod`, güvenlik başlıkları, 301 yönlendirmeleri.
2. Mobil başlık taşması, ölü bağlantılar, kırık çapalar.
3. Yayınlanmayan 4 makale ve buna karşı test.
4. JSON-LD düzeltmeleri, Organization logosu.
5. Kontrast token'ları, ARIA ve landmark düzeltmeleri, odak yönetimi, `prefers-reduced-motion`.
6. Doğrulanamayan iddiaların kaldırılması veya yapılandırma ile gizlenmesi; sektörel veri düzeltmeleri.
7. Menü, footer, iç linkleme, title/H1/meta düzenlemeleri.
8. Form akışının dürüstleştirilmesi; çerez onayı ile analitiğin bağlanması; dönüşüm olayları (yalnızca izin varsa).

**Faz 1: Yayın öncesi, şirket girdisi gerekiyor (1–2 hafta)**

1. Gerçek alan adı ve iletişim bilgileri: `NEXT_PUBLIC_SITE_URL`, telefonlar, e-postalar, adresler (NAP tutarlılığı).
2. Broker kadrosunun doğrulanması; kişisel veri için açık rıza; gerçek biyografi ve fotoğraflar.
3. Üyelik ve lisansların belgelenmesi, ardından `siteConfig.memberships` içinde `verified: true`.
4. Hakkımızda sayfası: yasal unvan, ticaret sicil ve MERSİS no, yönetim, uyum (yaptırım taraması) politikası.
5. Gizlilik metni ve KVKK aydınlatma metni için hukuk incelemesi (Türkçe metin, VERBİS durumu, yurt dışı aktarım).

**Faz 2: Büyüme (1–3 ay)**

1. Sunucu taraflı form gönderimi: bir e-posta servisi veya CRM gerekiyor. Ücretli servis ve gizli anahtar gerektirdiği için ayrıca onaylanmalı.
2. Search Console ve Bing Webmaster kurulumu, sitemap gönderimi, Google İşletme Profili (Istanbul HQ).
3. Editoryal takvim: haftalık görünüm vaadi ya gerçekten yerine getirilmeli ya da metinden kaldırılmalı; raporlara adlandırılmış yazar eklenmeli.
4. İçerik kümeleri: demurrage/laytime rehberi, Türk Boğazları geçiş rehberi, dry bulk sınıf sayfaları.
5. Türkçe yerelleştirme (`/tr`) ve `hreflang`.
6. Canlı piyasa verisi istenirse Baltic Exchange veya Worldscale veri lisansı.

**Faz 3: Teknik borç**

1. `globals.css` (4.185 satır) ve sayfalardaki satır içi stillerin bileşen veya modüllere bölünmesi.
2. Next.js 15 yükseltmesi değerlendirilmesi (14.2.35 güvenlik yamalı ama bakım modunda).
3. Görsel regresyon ve erişilebilirlik testlerinin CI'a eklenmesi (Playwright + axe).
