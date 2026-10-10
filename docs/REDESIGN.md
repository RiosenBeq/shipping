# LEVANTER: Tanker ve LPG odaklı yeniden tasarım

Bu doküman, sitenin **tanker ve LPG/amonyak brokerliğinde öne çıkmak** amacıyla nasıl yeniden yapılandırıldığını özetler: rakip analizi, sadeleştirme, canlı veri gerektiren araçların kaldırılması, çok dilli açılış sayfaları, Uiverse tabanlı tasarım sistemi, SEO, altyapı, kalite kontrol süreci ve önce/sonra ekran görüntüleri.

Kurucunun ürün kuralları:

- Site sade kalır; odak **tanker + LPG/amonyak**.
- **Canlı piyasa verisi yok.** Navlun tablosu, rate board veya güncel veri gerektiren hesaplayıcı yok. Tek araç, fiziksel sabitlerle çalışan LPG cbm ↔ ton dönüştürücüsü.
- Eskiyecek fiyat rakamı yok.
- Güçlü SEO: sayfa başına tek H1, metadata, JSON-LD, hreflang.
- Her UI/UX detayı cilalı: yükleniyor, hover, odak, hata ve boş durumlar.

## 1. Piyasadaki örnekler (rakip taraması)

Taranan firmalar: Poten & Partners, Braemar, Clarksons, Gibson, Fearnleys, BRS, SSY, McQuilling. Bilgiler firmaların kendi sayfalarının arama sonuçlarındaki özetlerinden alındı. Siteler bu ortamdan doğrudan açılamadığı için görsel tasarım özellikleri doğrulanamadı.

| Firma | Konumlandırma | Tanker ve LPG nasıl sunuluyor |
| --- | --- | --- |
| Poten & Partners | Enerji ve taşımacılık piyasalarında brokerlik, danışmanlık, analiz | LNG, LPG ve Oil Tanker brokerliği ayrı sayfalarda; haftalık LPG ve tanker raporları |
| Braemar | "Expert advisors in investment, chartering and risk management" | Deep Sea Tankers ile LPG & Petrochemicals ayrı sayfalarda; LPG sayfasında sayılarla kanıt |
| Clarksons | Gaz brokerliği: LPG, LNG ve amonyak | Segment başına (VLGC/LGC, PCG, NH3) isimli sorumlu; herkese açık sözlük |
| Gibson | 1893'ten beri faaliyette, %100 çalışan sahipliğinde | Tankers ile "LPG, Ammonia & Petrochemical Gases" ayrı; "Find a Broker" dizini; ücretsiz haftalık rapor |
| Fearnleys | 1869'a dayanan geçmiş | Fearntank ve Fearngas ayrı markalar; masa başına telefon hattı |
| BRS | Her fixture'da uyum kontrolü | Tanker ve Gas iş kolları; pressurised'dan VLGC'ye kadar sınıflar |

**Benimsenen ortak kalıplar**

- **Segment bazlı menü.** Tanker ve LPG/amonyak ayrı; altında VLCC…MR ve VLGC…Pressurised sınıf sayfaları.
- **LPG ile amonyak birlikte.** Amonyak ve petrokimya gazları LPG masasında.
- **Masaya göre broker dizini.** Doğrudan e-posta ve WhatsApp.
- **Hizmet döngüsünün tamamı.** Spot, TC ve COA'dan post-fixture'a (laytime, demuraj, claim) kadar.
- **Uyum (compliance) mesajı.** Her fixture öncesi yaptırım taraması.
- **Ücretsiz, indekslenebilir araştırma notları ve sözlük.**

**LEVANTER'ı farklılaştıranlar**

- **Türk Boğazları uzmanlığı.** Karadeniz tahminlerine boğaz geçiş ve bekleme süresi ekleniyor.
- **Küçük LPG gemileri.** Akdeniz, Karadeniz ve Türkiye'de pressurised ve semi-ref gemiler; büyük brokerların ikinci planda tuttuğu bir niş.
- **Hız sözü.** 60 dakikada ilk yanıt; WhatsApp.
- **Şeffaf hesap.** Teklifler TCE ile karşılaştırılabilir sunuluyor. Sitede ücretsiz LPG cbm ↔ ton dönüştürücü var; fiziksel yoğunluklarla çalıştığı için eskimiyor.
- **Çok dilli açılış sayfaları.** Denizcilikte öne çıkan pazarlar için.

## 2. Sadeleştirme

Adresi olan kaldırılmış sayfalar kalıcı yönlendirme (308) ile ilgili sayfaya bağlanır. Böylece gelen bağlantılar ve arama değeri korunur.

| Kaldırılan | Yerine |
| --- | --- |
| Dry Bulk, Sale & Purchase sayfaları | `/dry-bulk`, `/sale-purchase` → `/` (odak: tanker ve LPG) |
| Offices + şehir sayfaları | Ofisler `/contact` sayfasında; `/offices`, `/offices/:city` → `/contact` |
| 14 ayrı, içeriği zayıf broker profil sayfası | Masalara göre gruplanmış tek `/brokers` sayfası; `/brokers/:slug` → `/brokers` |
| `/gas` | `/lpg` |
| **Voyage estimator** | `/voyage-estimator` → `/tankers` (bkz. bölüm 3) |
| **Rate board'lar, piyasa tabloları ve fiyat rakamları** | Kaldırıldı; ayrı adresleri olmadığı için yönlendirme gerekmedi (bkz. bölüm 3) |
| Eskimiş üç araştırma notu (Aframax 5 yaşlı piyasası, VLCC yeni inşa slot fiyatları, 2026 ham petrol görünümü) | `/research` |
| Türkçe (`/tr`) açılış sayfası | Kaldırıldı; adres artık gerçek 404 döndürüyor |
| Filtre ve sıralama içeren broker dizini, sekmeli araştırma portalı | Sunucuda oluşturulan basit listeler |
| 4 adımlı teklif sihirbazı | Tek sayfalık form: e-posta veya WhatsApp'ı hazır doldurulmuş açar |
| Karanlık mod, çerez banner'ı, sahte "Client login" | Kaldırıldı (Vercel Analytics çerez kullanmıyor) |
| 4.185 satırlık global CSS | Kısa bir `app/globals.css` + Tailwind + `app/uiverse.css` bileşen kiti |

## 3. Canlı veri gerektiren araçlar kaldırıldı

Navlun, bunker ve liman/kanal tarifeleri her hafta değişir. Güncellenmeyen bir rakam, bir broker sitesinde hiç rakam olmamasından daha kötüdür. Bu yüzden:

- **Voyage estimator kaldırıldı.** Doğru sonuç vermesi için canlı navlun, bunker ve tarife verisi gerekiyordu. Adres `/tankers`'a yönlenir. Hesap artık brokerdan istenir: tanker sayfasındaki SSS, tekliflerin Worldscale ve TCE olarak nasıl sunulduğunu anlatır.
- **Rate board'lar kaldırıldı.** "Illustrative" uyarısıyla gösterilen örnek piyasa tablosu (`lib/data/market.ts`, VLGC BLPG1–3 benchmark tablosu dahil) ve estimator'ın bunker ve tarife verileri artık yok. Baltic BLPG1–3 ve TD rotaları sınıf rehberlerinde yalnızca rota referansı olarak, rakamsız anılıyor.
- **Eskiyecek fiyat rakamları kaldırıldı.** Sözlükteki Süveyş, Panama ve Boğaz geçiş ücretleri ile liman masrafı (DA) tutarları çıkarıldı; tanımlar rakamsız ve kalıcı.
- **Sadece LPG cbm ↔ ton dönüştürücü kaldı** (`app/(site)/lpg/(hub)/LpgConverter.tsx`, `/lpg` sayfasında):
  - **Fizik sabitleri:** Atmosferik kaynama noktasındaki sıvı yoğunlukları (`lib/data/lpg-classes.ts` → `LPG_CARGO_DENSITY`). Propan 0,582, n-bütan 0,601, amonyak 0,682, propilen 0,612, bütadien 0,65, VCM 0,969 t/m³. Doluluk sınırı (filling limit, varsayılan %98) ayrı bir alan.
  - **İki yön:** cbm → ton ve ton → cbm. Yön değişince sonuç iki ondalıkla girişe taşınır, böylece ileri geri çevirince değer kaymaz (84.000 cbm propan, %98 doluluk → 47.910,24 t → 84.000 cbm).
  - **Yerele duyarlı sayı okuma** (`lib/number.ts`, testleri `lib/number.test.ts`'te): `84,000`, `84 000`, `84.000`, `84.000,5` ve `97,5` doğru okunur. Telefonu Türkçe, Almanca veya Yunanca olan kullanıcıların ondalık tuşu virgüldür; bu yüzden virgüllü ondalık istisna değil, olağan durum.
  - **Durumlar:** Boş alan sonucu sadece boşaltır. Hatalı değerde alanın altında açıklayıcı hata çıkar ("Enter a positive number, e.g. 84,000"). Sonuç ekran okuyucuya gecikmeli duyurulur (her tuşta değil). Altta "indicative only" uyarısı var.
  - **Dönüşüm yolu:** "Find a ship for this parcel" bağlantısı, parti miktarını ve segmenti iletişim formuna hazır doldurur.

## 4. İçerik

- **`/tankers`:** Tanker masası: VLCC, Suezmax, Aframax/LR2, LR1 ve MR; Karadeniz, CPC, Akdeniz ve uzun mesafe hatlar; spot, period ve COA.
- **`/tankers/vlcc`, `/suezmax`, `/aframax`, `/lr1`, `/mr`:** Sınıf rehberleri; rotalar, izlenecek konular ve SSS.
- **`/lpg`:** LPG ve amonyak masası: hizmetler, kargolar, odak bölgeler ve LPG dönüştürücü.
- **`/lpg/vlgc`, `/mgc`, `/handysize`, `/pressurised`:** Sınıf rehberleri; her birinde rotalar, izlenecek konular ve SSS.
- **`/research`:** Masalardan 9 araştırma notu (VLGC'de Panama mı Cape mi, Akdeniz ve Karadeniz'de küçük LPG, MGC'de amonyak, TD3C, TD7, EU ETS, G7 fiyat tavanı vb.) ve RSS (`/research/feed.xml`).
- **`/glossary`:** 46 tanker ve LPG terimi; harf/konu çipleriyle sayfa içi gezinme.
- **`/brokers`:** Masalara göre gruplanmış 9 broker (LPG & amonyak, ham petrol, temiz ürün); doğrudan e-posta ve WhatsApp.
- **`/contact`:** Tek sayfalık talep formu (aşağıda) + masa e-postaları, telefon, WhatsApp, çalışma saatleri ve ofisler.
- **`/privacy`, `/terms`:** Yasal sayfalar.

## 5. Çok dilli açılış sayfaları

Denizcilikte öne çıkan pazarlar için 10 dilde açılış sayfası. Sitenin geri kalanı İngilizce. Dil menüsü bunu açıkça söyler ("Overview page in your language — the rest of the site is in English").

| Kod | Dil | `<html>` |
| --- | --- | --- |
| `/zh` | Çince (basitleştirilmiş) | `lang="zh-Hans"` |
| `/ja` | Japonca | `lang="ja"` |
| `/ko` | Korece | `lang="ko"` |
| `/el` | Yunanca | `lang="el"` |
| `/no` | Norveççe | `lang="no"` |
| `/da` | Danca | `lang="da"` |
| `/sv` | İsveççe | `lang="sv"` |
| `/de` | Almanca | `lang="de"` |
| `/es` | İspanyolca | `lang="es"` |
| `/ar` | Arapça | `lang="ar" dir="rtl"` |

Her dilin `hreflang` ve `dir` değeri `lib/i18n.ts`'teki `LOCALES` listesinden gelir.

- **Ayrı root layout:** Dil sayfaları `app/[lang]/layout.tsx` ile kendi kök düzenine sahip. Böylece `<html lang>` ve `dir` sunucu HTML'inde doğru geliyor; Arapça sayfa baştan sona sağdan sola. İngilizce sayfalar `app/(site)/layout.tsx` altında `<html lang="en">` ile.
- **Tek kaynak:** Tüm çeviriler `lib/i18n.ts`'te. CJK ve Arapça tipografisi ayrıca ayarlandı.
- **Türkçe sayfa kaldırıldı.** `/tr` artık 404. Dil listesi yukarıdaki 10 dil + İngilizce.
- Bilinmeyen tek parçalı adresler (`/foo`) İngilizce düzende 404 sayfasına düşer.

## 6. Tasarım sistemi: Uiverse kiti

Arayüz parçaları [Uiverse.io](https://uiverse.io)'daki açık kaynak (MIT) öğelerden uyarlandı ve `app/uiverse.css`'te toplandı. Her öğe lacivert + pirinç paletine göre yeniden renklendirildi, WCAG AA kontrast ve görünür `:focus-visible` için düzenlendi; tüm hareketler `prefers-reduced-motion` ile kapatılabiliyor. Yazar, kaynak dosya ve lisans listesi: [`docs/UIVERSE-CREDITS.md`](UIVERSE-CREDITS.md).

`uiverse.css` Tailwind'den sonra yüklenir. Bir kit stilini geçersiz kılmak için Tailwind sınıfına `!` eklenir.

**Palet**

| Ad | Renk | Kullanım |
| --- | --- | --- |
| navy | `#0A1F33` | Ana renk, koyu bantlar, metin |
| brass | `#B8893A` | Birincil buton, vurgu |
| brass-ink | `#8A6420` | Açık zeminde pirinç metin (AA kontrast) |
| brass-light | `#D9B071` | Koyu zeminde pirinç metin |
| sand | `#F3EFE4` | İkincil bölüm zemini |
| line | `#E4DDCC` | Çizgiler, kart kenarları |
| slate | `#4A5E6E` | İkincil metin |
| fog | `#A9B6BF` | Koyu zeminde ikincil metin |
| bg | `#FBFAF7` | Sayfa zemini |

**Kit sınıfları ve kullanıldığı bileşenler**

| Sınıf | Kullanım yeri |
| --- | --- |
| `uv-btn`, `uv-btn-outline`, `uv-btn-ghost-light` | Nav, CTA bantları, form, 404/hata ekranları; koyu kahramanlarda ikincil buton (`ghost-light`); meşgul durumda küçük loader |
| `uv-card` (`--dark`, `--hover`) | `DeskCard`, `CoverageCard`, `BrokerCard`, `ReportCard`, `NotFoundView` |
| `uv-field` | İletişim formu ve LPG dönüştürücü: kayan etiketli alanlar, ortadan açılan odak çizgisi |
| `uv-segmented` | Dönüştürücüde yön ve kargo seçimi; formda kanal, masa, kiralama tipi |
| `uv-chip` | Sınıf etiketleri, sözlük/araştırma/broker sayfalarında sayfa içi gezinme |
| `uv-accordion` | `Faq` (artı/eksi ikon dönüşümü) |
| `uv-link`, `uv-nav-link` | Gövde bağlantıları, üst menü ve footer (animasyonlu alt çizgi) |
| `uv-loader`, `uv-skeleton` | `PageSkeleton` (route yükleniyor ekranı), meşgul butonlar, hata ekranı |
| `uv-toast`, `uv-tooltip` | Form gönderim bildirimi; iletişim bilgilerinde "kopyalandı" ipucu |
| `uv-fab` | `FloatingContact`: kaydırınca beliren "broker ile konuş" düğmesi; footer ve CTA bantlarında gizlenir, `/contact`'ta hiç görünmez |
| `uv-hero-pattern` | `PageHeader`, `CtaBand`, `Section`, `LightGraticule`: deniz haritası ızgarası deseni |

**Yeniden tasarlanan bileşenler ve durumlar**

- **Nav:** Animasyonlu alt çizgili menü, dil menüsü, erişilebilir mobil çekmece; mobilde "Inquiry" butonu her zaman görünür.
- **Kartlar:** Masa, kapsam, broker ve araştırma kartları tek kart dilinde. Gemi çizimleri (`VesselArt`) sınıfa göre yenilendi; pressurised gemilerde silindirik güverte tankları var.
- **İletişim formu:** Kayan etiketler, segment kontrolleri, alan bazlı hata mesajları ve hata özeti, toast. Taslak sekme kapanana kadar `sessionStorage`'da tutulur. Gönderince e-posta veya WhatsApp hazır doldurulmuş açılır; sitede veri saklanmaz.
- **Yükleniyor:** Statik sayfaların yanında `loading.tsx` + `PageSkeleton`. Koyu kahramanlı sayfalarda koyu iskelet çıkar; kısa geçişlerde hiç görünmez.
- **Hata ve 404:** `ErrorView` ("Try again" + ana sayfa) ve `NotFoundView` (ana sayfa ve talep butonları + en sık hedeflere kartlar). Her iki root layout'un kendi `error.tsx` ve `not-found.tsx` dosyası, ayrıca `app/global-error.tsx` var.
- **Boş ve hata durumları:** Dönüştürücüde boş alan sonucu boşaltır, hata vermez; hatalı değer alanın altında açıklanır. Formda zorunlu alanlar gönderimde işaretlenir ve kaç alanın düzeltilmesi gerektiği özetlenir.
- **Odak ve hareket:** Tüm etkileşimli öğelerde görünür odak halkası; animasyonlar `prefers-reduced-motion`'da kapalı.

## 7. SEO

- **Her sayfada tek H1**, benzersiz title ve description, canonical (`lib/seo.ts`). Ekran görüntüsü alınan 12 sayfanın hepsinde masaüstü ve mobilde tek H1 doğrulandı.
- **hreflang:** `en` + 10 dil + `x-default`. Hem HTML'de hem sitemap'te.
- **JSON-LD** (`components/site/JsonLd.tsx`):
  - Organization ve WebSite
  - ProfessionalService: İstanbul; adres, geo, iletişim noktaları ve çalışma saatleri ile
  - Service + OfferCatalog: masalar ve sınıflar
  - BreadcrumbList, FAQPage, Article, ItemList (Person), DefinedTermSet
- **Anahtar kelime hedefleri:** "LPG shipbroker", "tanker broker Istanbul", "VLGC chartering", "MGC charter", "Aframax chartering Mediterranean", "Black Sea tanker broker", "ammonia carrier chartering".
- **Sitemap** (`app/sitemap.ts`): 37 URL (ana sayfalar, 10 dil sayfası, 9 sınıf rehberi, 9 araştırma notu). Sahte "şimdi" tarihi yerine gerçek `lastModified`.
- **robots.txt** (`app/robots.ts`): Arama motorlarına ve AI arama botlarına (GPTBot, ClaudeBot, PerplexityBot vb.) açık; yalnızca `/api/` ve `/_next/` kapalı.
- **llms.txt ve llms-full.txt:** `lib/pages.ts` sayfa kataloğundan üretiliyor; `ai.txt`, `humans.txt`, `.well-known/security.txt` de var.
- **Gerçek 404:** Bilinmeyen adresler HTTP 404 ve `noindex` döner (soft 404 yok).
- **Paylaşım görselleri:** Kodla üretilen Open Graph ve Twitter görselleri, ikon ve apple-icon.

## 8. Altyapı

- **Güvenlik başlıkları** (`next.config.mjs`): HSTS (preload), X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy. `poweredByHeader` kapalı.
- **Yönlendirmeler:** Kaldırılan tüm sayfalar için kalıcı 308 yönlendirme (bölüm 2'deki tablo).
- **Route grupları ve iki root layout:**
  - `app/(site)/`: İngilizce sayfalar, `<html lang="en">`.
  - `app/[lang]/`: Dil sayfaları, kendi `lang`/`dir` değeriyle.
  - `(home)`, `lpg/(hub)`, `tankers/(hub)`, `research/(index)` grupları her sayfanın kendi `loading.tsx`'ini taşır. Site genelinde bir `loading.tsx` bilerek yok: üstteki bir Suspense sınırı `notFound()`'u HTTP 200'e (soft 404) çevirirdi.
  - `app/(site)/[...slug]/page.tsx`: İki root layout olduğu için uygulama düzeyinde not-found yok. Bu catch-all, bilinmeyen her adresi stilli 404 sayfasına ve gerçek 404 durum koduna gönderir.
- **Statik çıktı:** Build 53 statik çıktı üretiyor (sayfalar ve metin/görsel rotaları); backend yok. Paylaşılan JS 87,3 kB; çoğu sayfada ilk yükleme 96,2 kB (`/lpg` 107 kB, `/contact` 127 kB).
- **Doğrulama:** TypeScript, ESLint, Prettier, 33 Vitest testi (sayı okuma, form şemaları, slug) ve production build temiz.

## 9. Kalite kontrol süreci

Tasarım, ekran görüntüsü üzerinden turlar halinde gözden geçirildi. Her turda masaüstü (1440 px, tam sayfa) ve mobil (390 px) görüntüler üç ayrı bakış açısıyla incelendi:

1. **Görsel tasarım ve marka:** Palet dışı renkler, hizalama, tipografi ve satır kırılımları, kartların tutarlılığı.
2. **UX ve erişilebilirlik:** Odak, kontrast, klavye ve ekran okuyucu davranışı, form ve hata durumları, yükleniyor/boş/404 ekranları, axe taraması.
3. **İçerik, SEO ve teknik doğruluk:** Tek H1, `lang`/`dir`, JSON-LD geçerliliği, hreflang, durum kodları, metin hataları ve eskiyecek rakamlar.

Bulgular önem derecesiyle kaydedildi, düzeltildi ve bir sonraki turda yeniden çekilen görüntülerle doğrulandı. Örnekler: sınıf sayfalarında "a Aframax" ve "Suezmaxs" gibi şablon dil hataları, palet dışı avatar renkleri, sözlükte eskiyecek kanal ücretleri, dönüştürücünün 0 değerini kabul etmesi, mobilde gizli kalan "Inquiry" butonu, soft 404 riski.

Son turda 12 sayfa × 2 görünümde tek H1, yatay taşma olmaması, doğru `lang`/`dir` ve 404 sayfasının HTTP 404 döndüğü otomatik olarak kontrol edildi.

## 10. Ekran görüntüleri

### Önce

| Sayfa | Masaüstü | Mobil |
| --- | --- | --- |
| Ana sayfa | ![](screenshots/before/home-desktop.webp) | ![](screenshots/before/home-mobile.webp) |
| Tankers | ![](screenshots/before/tankers-desktop.webp) | ![](screenshots/before/tankers-mobile.webp) |
| İletişim | ![](screenshots/before/contact-desktop.webp) | ![](screenshots/before/contact-mobile.webp) |

### Sonra

Masaüstü 1440 px tam sayfa, mobil 390 × 844 ilk ekran.

| Sayfa | Masaüstü | Mobil |
| --- | --- | --- |
| Ana sayfa | ![](screenshots/after/home-desktop.webp) | ![](screenshots/after/home-mobile.webp) |
| LPG & Amonyak | ![](screenshots/after/lpg-desktop.webp) | ![](screenshots/after/lpg-mobile.webp) |
| VLGC | ![](screenshots/after/lpg_vlgc-desktop.webp) | ![](screenshots/after/lpg_vlgc-mobile.webp) |
| Tankers | ![](screenshots/after/tankers-desktop.webp) | ![](screenshots/after/tankers-mobile.webp) |
| İletişim | ![](screenshots/after/contact-desktop.webp) | ![](screenshots/after/contact-mobile.webp) |
| Ekip | ![](screenshots/after/brokers-desktop.webp) | ![](screenshots/after/brokers-mobile.webp) |
| Araştırma | ![](screenshots/after/research-desktop.webp) | ![](screenshots/after/research-mobile.webp) |
| Sözlük | ![](screenshots/after/glossary-desktop.webp) | ![](screenshots/after/glossary-mobile.webp) |
| 中文 | ![](screenshots/after/zh-desktop.webp) | ![](screenshots/after/zh-mobile.webp) |
| Ελληνικά | ![](screenshots/after/el-desktop.webp) | ![](screenshots/after/el-mobile.webp) |
| العربية | ![](screenshots/after/ar-desktop.webp) | ![](screenshots/after/ar-mobile.webp) |
| 404 | ![](screenshots/after/not-found-desktop.webp) | ![](screenshots/after/not-found-mobile.webp) |

## 11. Yayından önce yapılması gerekenler

1. **Alan adı:** Vercel'de `NEXT_PUBLIC_SITE_URL` ortam değişkenine gerçek alan adını girin. Şu an `https://levanter.example`. Canonical, sitemap, robots, llms.txt ve JSON-LD bu değeri kullanır.
2. **İletişim bilgileri:** Telefon, WhatsApp, masa e-postaları, adres, koordinatlar, ofisler ve sosyal hesaplar `lib/site.ts`'te. Şu an yer tutucu değerler var.
3. **Ekip:** İsim, unvan, dil ve iletişim satırları `lib/data/brokers.ts`'te. Şu an örnek kişiler var; gerçek ekiple değiştirin.
4. **Çeviriler:** `lib/i18n.ts`'teki 10 dilin metnini ana dili o dil olan birer kişiye kontrol ettirin (özellikle denizcilik terimleri).
