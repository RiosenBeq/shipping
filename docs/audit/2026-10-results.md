# LEVANTER web sitesi — sonuç raporu

**Tarih:** 21 Ekim 2026
**İlgili belge:** [2026-10-site-audit.md](2026-10-site-audit.md): A–F çıktıları ve önem dereceli sorun listesi.

Ölçümler yerel production build üzerinde yapıldı (`next build && next start`, `NEXT_PUBLIC_SITE_URL` tanımlı). Lighthouse sonuçları laboratuvar ölçümüdür (mobil emülasyon, tek çalıştırma); gerçek kullanıcı verisi (CrUX / Search Console) bu ortamdan erişilebilir değildi.

---

## 1. Mevcut durum ve temel problemler

Site, teknik olarak sağlam bir temele sahip (Next.js 14, tamamı statik HTML, düşük JS yükü). Ancak yayına hazır değildi. Başlıca sorunlar:

- **Mobil kullanılabilirlik bozuktu.** Menü butonu ekran dışındaydı. Buton görünür olsaydı bile menü paneli sıfır yüksekliğe hapsolmuştu. Ayrıca teklif formunda yazılan metin görünmüyordu.
- **Arama motoru temeli kırılgandı.** Ortam değişkeni ayarlanmazsa tüm kanonik URL'ler `levanter.example` alanına gidiyordu. robots.txt CSS/JS dosyalarını engelliyordu. Yapılandırılmış veride geçersiz alanlar vardı. 4 makalenin metni hiç yayınlanmıyordu.
- **Güven sorunu vardı.** 198 ölü bağlantı (çalışmayan "Client login" dahil), birbiriyle çelişen istatistikler, doğrulanmamış üyelikler ve müşteri izlenimi veren şirket adları bulunuyordu. Değerleriyle verilen "kapanan işler" tablosu ve sabit "canlı" piyasa rakamları da aynı kategorideydi.
- **Erişilebilirlik AA seviyesini karşılamıyordu.** Pirinç tonundaki metinler ve butonlarda kontrast yetersizdi (axe: 831 düğüm). İç içe landmark ve etkileşim hataları vardı.
- **Sektörel doğruluk hataları vardı.** Türk Boğazları ücreti 2022 öncesi tarifeden kalmaydı. Baltic rota kodları karışıktı. EU ETS kapsam notu yanlıştı. Tersane listesi ve geri dönüşüm fiyat farkı hatalıydı.

## 2. Uygulanan tasarım değişiklikleri

- **Renk sistemi:** pirinç tonu iki rol için ayrıldı:
  - metin/çizgi (`--accent-brass`): açık zeminde #7F5D22 (5.1:1), koyu zeminde #B8893A;
  - dolgu (`--accent-brass-fill`): #B8893A üzerine lacivert metin (5.3:1).

  Marka rengi korundu; tüm kombinasyonlar WCAG AA'yı geçiyor.
- **Üst menü:** Tankers · Dry Bulk · S&P · Research · Brokers · Offices · Tools ve belirgin bir "Charter inquiry" butonu. Mobil menüde aynı bağlantılara ek olarak doğrudan telefon, WhatsApp ve e-posta kanalları var. Escape tuşu menüyü kapatıyor.
- **Footer:** Hizmetler, Kaynaklar, Şirket, Ofisler ve İletişim sütunları (yasal unvan, adres, telefon, e-posta), yasal satır ve "Cookie settings" bağlantısı. Yıl artık otomatik güncelleniyor.
- **Ana sayfa:**
  - Değer önerisi somutlaştırıldı.
  - "Premium" klişesi kaldırıldı.
  - Sabit navlun rakamları yerine Baltic rota tanımlarını gösteren şerit kondu.
  - Doğrulanamayan sayaçların yerine verilerden türetilen kapsama bandı geldi: 4 masa, 24 saat hafta içi kapsama (çalışma saatlerinden hesaplanıyor), 5 segment, 60 dk yanıt hedefi.
  - Boğaz verileri kaynak gösterilerek yazıldı.
  - Üyelik bölümü yalnızca doğrulanmış kayıt varsa görünüyor.
- **Hareket:** Sürekli çalışan dekoratif SVG animasyonları kaldırıldı. `prefers-reduced-motion` tüm animasyonları durduruyor.
- **Erişilebilirlik:**
  - Görünür breadcrumb ve `aria-current` eklendi.
  - Atlama bağlantısı artık `<main>` öğesine gidiyor.
  - Başlık seviyeleri düzeltildi.
  - Ofis kartlarındaki iç içe etkileşim giderildi.
  - Filtrelerde `aria-pressed` ve `fieldset` kullanılıyor.
  - Formda alan–hata ilişkisi kuruldu, adım değişince odak taşınıyor.
  - Kaydırılabilir tablolar klavyeyle erişilebilir.

## 3. Uygulanan teknik SEO iyileştirmeleri

| Alan | Önce | Sonra |
| --- | --- | --- |
| Kanonik alan adı | Ortam değişkeni yoksa `levanter.example` | `NEXT_PUBLIC_SITE_URL`, yoksa Vercel üretim alan adı, yoksa localhost. Localhost'a düşen build ve Vercel önizlemeleri otomatik `noindex` alıyor |
| robots.txt | `/_next/` (CSS/JS) engelli | Engel kaldırıldı; önizleme ortamında `Disallow: /` |
| Sitemap | 44 URL, tümünde `lastmod` = build anı | 41 indekslenebilir URL, gerçek içerik tarihleri; noindex Pro raporlar sitemap dışında |
| Yapılandırılmış veri | `Product` (hatalı), ISO olmayan tarihler, metin biçiminde `openingHours`, `Place → Organization`, tek başına `ContactPoint`, sahte `Person.image`, 32 px logo | `Service`, `ProfessionalService` (adres ve `OpeningHoursSpecification` ile), `ProfilePage`/`Person`, `Article` (yazar ve tarih), `ItemList` (URL), `DefinedTermSet` (terim çapaları), 512 px logo. Otomatik kontrolde 0 sorun |
| Title / meta | 4 title'da marka tekrarı; 13 title 60 karakteri, 6 description 160 karakteri aşıyordu | Sayfaya özgü title ve description: marka tekrarı yok, description'ların hepsi ≤160 karakter, title'ların 5'i hariç hepsi ≤60 karakter (o 5'i 61–62). H1'ler konu kelimesi içeriyor |
| URL | `/offices/ist` vb. | `/offices/istanbul` vb.; eski adresler **301** ile yönleniyor |
| İç linkleme | Sitemap URL'si başına ortalama 12,5 iç bağlantı, en az 1 | Ortalama 25,6, en az 2: profiller, ilgili raporlar, sınıf sayfaları ve footer |
| Güvenlik başlıkları | Yok; `X-Powered-By` görünüyor | CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS; `X-Powered-By` kapalı |
| Performans | Ana sayfa TBT 460 ms | 50 ms (SMIL animasyonları kaldırıldı, mono font preload'u kapatıldı) |

## 4. İçerik ve sayfa mimarisi değişiklikleri

- **Yayınlanmayan makaleler:** 4 makalenin içerik anahtarı düzeltildi. Bu sayfalar ~110 kelimeden ~400–450 kelimeye çıktı. Tekrar yaşanmaması için test eklendi.
- **Doğrulanamayan iddialar kaldırıldı veya gizlendi:** "80+ yıl", "38 fixture", "6 COA", "42/62 dk", "38 ülke / 120+ armatör", "%38 CPC" gibi istatistikler kaldırıldı. Üyelikler ve sosyal profiller `verified` bayrağıyla gizlendi; şirket onayladığında tek satırla açılabilir.
- **Müşteri izlenimi veren şirket adları** (Saudi Aramco, ADNOC, CEPSA, Sinopec vb.) genel segment ifadeleriyle değiştirildi.
- **S&P:** değerleriyle verilen işlem tablosu, değer içermeyen "tipik yetki türleri" listesine dönüştürüldü. "Onlarca yıldır tanıdığımız" iddiası kaldırıldı.
- **Dry bulk:** "bugün" etiketli sabit BDI rakamları kaldırıldı (uydurma veri ve Baltic veri lisansı riski). Yerine endeks açıklamaları kondu. Rota kodları düzeltildi: S1B Çanakkale, S8, P6_82; uydurma "HS" kodları silindi.
- **Sektörel düzeltmeler:**
  - Türk Boğazları ücreti 1 Temmuz 2026'dan itibaren 6,70 $/NT olarak güncellendi (sözlük, hesaplayıcı tarifeleri, Karadeniz rotası varsayılanı).
  - Boğaz geçiş sayısı 2025 verisiyle güncellendi (40.172).
  - EIA'ya dayanan petrol akışı ifadesi eklendi.
  - EU ETS kapsam notu düzeltildi.
  - Tersane listesi düzeltildi (NACKS Çin'de; HD Hyundai, Hanwha Ocean, JMU vb. eklendi).
  - Aliağa ile Hint alt kıtası arasındaki fiyat farkı doğru yansıtıldı.
  - "portage" ve "deck-level" gibi terim hataları düzeltildi.
- **İtibar riski:** "every Russian Urals barrel heading west" pazarlama ifadesi yeniden yazıldı.
- **Form:**
  - Kargo tipine göre gemi sınıfları sunuluyor.
  - Not/CP alanı eklendi.
  - Zorunlu alanlar yalnızca isim, şirket ve e-posta.
  - URL'den ön seçim yapılabiliyor (`?cargo=`, `?term=`, `?notes=`).
  - E-postaya okunabilir etiketler gidiyor.
  - E-posta istemcisi yoksa "metni kopyala" yedeği var.
  - Gönderim butonu artık ne yaptığını söylüyor ("Compose email to the desk").
  - KVKK/GDPR bilgilendirme notu eklendi.
  - Doğrulama mesajları İngilizce.
- **Gizlilik ve çerezler:**
  - Analitik yalnızca açık onaydan sonra yükleniyor; onay öncesi 0 istek ölçüldü.
  - Gizlilik metni gerçek veri akışına göre yeniden yazıldı: form sunucuya gönderim yapmıyor, çerez yok, local storage kullanımı, hosting sağlayıcısı, haklar ve KVKK şikâyet yolu.
- **Dürüst metinler:**
  - "The desk has been notified" ifadesi kaldırıldı (bildirim mekanizması yok).
  - "Sign in" ve "desk clients are added automatically" kaldırıldı (giriş yok).
  - "Unsubscribe in one click" ve "Tariffs updated weekly" düzeltildi.
- **Thin/gated içerik:** yalnızca özeti görünen 3 Pro rapor `noindex` yapıldı.

## 5. Test sonuçları ve doğrulanamayan konular

**Otomatik kontroller (hepsi geçti):** `next lint` (0 uyarı), `tsc`, Prettier, Vitest (**67 test**: önceden 51; yeni testler kapsama hesabı, rapor–içerik eşleşmesi, sözlük çapaları, SEO yardımcıları, form şemaları), `next build` (61 statik sayfa).

**Tarama (45 URL):**

| Ölçüt | Önce | Sonra |
| --- | --- | --- |
| `href="#"` ölü bağlantı | 198 | **0** |
| Kırık sayfa içi çapa | 4 (+4 JS ile çalışan) | **0** |
| Birden fazla `<main>` | 1 sayfa | **0** |
| Başlık seviyesi atlaması | 6 sayfa | **0** |
| JSON-LD sorunları | 9 tür | **0** |
| 160 karakteri aşan description | 6 | **0** |
| 60 karakteri aşan title | 13 | **5** (61–62 karakter; yalnızca "— LEVANTER" eki kesilebilir) |
| Markası iki kez geçen title | 4 | **0** |

**Tarayıcı (16 sayfa × masaüstü + mobil = 32 görünüm):**

| Ölçüt | Önce | Sonra |
| --- | --- | --- |
| Mobil yatay taşma | 16/16 sayfa | **0** |
| axe ihlali | 12 kural, 880+ düğüm (831 kontrast) | **0** (son düzeltmeden sonraki taramada) |
| Konsol hatası (Vercel betikleri hariç) | 0 | 0 |

**Lighthouse (mobil, laboratuvar):**

| Sayfa | Performans | Erişilebilirlik | En iyi uygulamalar | SEO | LCP | TBT |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | 81 → **95** | 94 → **100** | 96 → **100** | 100 | 3,2 → 2,9 sn | 460 → **50 ms** |
| `/tankers` | 95 → 95 | 95 → **100** | 96 → **100** | 100 | 2,8 → 2,9 sn | 90 → 10 ms |
| `/contact` | 94 → 95 | 94 → **100** | 96 → **100** | 100 | 3,1 → 2,9 sn | 40 → 50 ms |
| `/voyage-estimator` | 94 → 95 | 91 → **100** | 96 → **100** | 100 | 3,0 → 2,8 sn | 110 → 110 ms |
| `/research` | 97 → 94 | 90 → **100** | 96 → **100** | 100 | 2,6 → 3,0 sn | 40 → 40 ms |

`/research` performans puanındaki düşüş tek çalıştırmalık laboratuvar ölçümünün oynaklığı ve sayfaya eklenen içerikle uyumlu. LCP tüm sayfalarda hâlâ 2,5 sn'nin biraz üzerinde (bkz. 6. bölüm). "En iyi uygulamalar" puanındaki artışın bir kısmı, analitik betiklerinin artık onaysız yüklenmemesinden geliyor (yerelde 404 dönüyorlardı).

**Uçtan uca akışlar (Playwright):** Mobil menü açılıp kapanıyor ve yönlendiriyor. Form ön-doldurma, alanlar arası doğrulama, odak yönetimi, başarı ekranı ve panoya kopyalama çalışıyor. Analitik onay öncesi 0, onay sonrası 2 istek yapıyor. Çerez ayarları footer'dan yeniden açılabiliyor. Eski ofis URL'leri 301 dönüyor.

**Doğrulanamayanlar (doğrulama yöntemiyle):**

- Canlı alan adı, hosting ve DNS — erişim yok. Vercel/hosting panelinden ve `curl -I https://alanadi` ile kontrol edilmeli.
- Search Console, CrUX, analitik verisi — erişim yok. Search Console mülkü açılıp sitemap gönderilmeli; 28 günlük CWV ve kapsama raporları izlenmeli.
- Anahtar kelime hacimleri — Ahrefs API planı uç noktaya izin vermedi ("Insufficient plan"); Semrush hesabında API birimi yok ([semrush.com/mcp-access](https://www.semrush.com/mcp-access)). Search Console sorguları veya bir anahtar kelime aracıyla doğrulanmalı.
- Brokerların gerçekliği ve rızası, ofis adresleri, telefonlar, üyelikler, araştırma notlarındaki piyasa rakamları, 60 dk yanıt taahhüdü — yalnızca şirket doğrulayabilir.
- Gizlilik metnindeki hukuki ifadeler — hukuk incelemesi gerekiyor (KVKK aydınlatma metni, VERBİS, yurt dışı aktarım).
- Harici EIA bağlantısı arama dizininden alındı; bu ortamdan dış siteye istek atılamadığı için tarayıcıda bir kez açılıp kontrol edilmeli.

## 6. Öncelikli kalan işler

1. **(Yayın öncesi, kritik)**
   - `NEXT_PUBLIC_SITE_URL` gerçek alan adıyla ayarlanmalı.
   - `lib/site.ts` ve `lib/data/offices.ts` içindeki yer tutucu iletişim bilgileri değiştirilmeli.
   - Broker kadrosu doğrulanmalı; açık rıza alınmalı; gerçek biyografi ve fotoğraf eklenmeli.
2. **(Yayın öncesi)**
   - Üyelikler belgelenip `verified: true` yapılmalı.
   - Hakkımızda / Şirket sayfası eklenmeli: ticaret sicili, MERSİS, yönetim, yaptırım uyum politikası.
3. **(1–3 ay)**
   - Sunucu taraflı form gönderimi (e-posta servisi veya CRM). Ücretli servis ve gizli anahtar gerektirdiği için ayrıca karar verilmeli.
   - Editoryal takvim ve adlandırılmış yazarlar ("weekly" vaadi Nisan 2026'dan beri yerine getirilmiyor).
   - Türkçe yerelleştirme ve `hreflang`.
   - Demurrage/laytime ile Türk Boğazları geçiş rehberleri.
4. **(Performans)** LCP'yi 2,5 sn'nin altına indirmek için önce alan verisi incelenmeli. Gerekirse başlık fontu alt kümelenmeli veya `display: optional` denenmeli.
5. **(Teknik borç)** 4.400+ satırlık `globals.css` ve satır içi stiller bileşenlere taşınmalı. CI'a Playwright + axe testi eklenmeli. Next.js 15 değerlendirilmeli.

## 7. Ölçülebilir başarı göstergeleri ve takip planı

Ölçümler yayından sonra başlamalı ve sıralama ya da trafik için hedef rakam verilmemeli. Aşağıdaki göstergeler önce bir başlangıç (baseline) değeri almak, sonra trendi izlemek içindir.

| Gösterge | Kaynak | Sıklık | Beklenen yön / eşik |
| --- | --- | --- | --- |
| İndekslenen sayfa / sitemap'teki sayfa | Search Console → Sayfalar | Haftalık (ilk ay) | 41 URL'nin tamamı indekste; "Taranıyor, indekslenmedi" sayısı azalmalı |
| Yapılandırılmış veri hataları | Search Console → Geliştirmeler | Aylık | 0 |
| Core Web Vitals (alan) | Search Console / CrUX | Aylık | LCP ≤ 2,5 sn, INP ≤ 200 ms, CLS ≤ 0,1 (%75'lik dilim) |
| Organik gösterim / tıklama ve marka dışı sorgular | Search Console → Performans | Aylık | Başlangıç değerine göre trend |
| Hedef sayfaların sorgu eşleşmesi (ör. "tanker chartering", "shipbroker Istanbul", "voyage estimator") | Search Console | Aylık | Doğru sayfanın görünmesi (yamyamlık olmaması) |
| Teklif dönüşümü: `inquiry_composed`, `inquiry_copied`, `contact_click` (kanal bazında) | Vercel Web Analytics (yalnızca onay veren ziyaretçiler) | Haftalık | Başlangıç değerine göre trend; olaylar onay oranıyla birlikte yorumlanmalı |
| Gelen kutusuna düşen gerçek talep sayısı ve ilk yanıt süresi | Masa e-postası / CRM | Haftalık | 60 dk yanıt taahhüdünün gerçekten tutulduğunun kanıtı |
| Erişilebilirlik regresyonu | Lighthouse / axe (CI'a eklenmesi önerilir) | Her PR | axe 0 ihlal, Lighthouse erişilebilirlik 100 |

**Kaynaklar (sektörel doğrulamalar):**

- [US EIA — World Oil Transit Chokepoints](https://www.eia.gov/international/content/analysis/special_topics/World_Oil_Transit_Chokepoints)
- [Türkiye Today — 84,640 ships transit Türkiye straits in 2025](https://www.turkiyetoday.com/business/84640-ships-transit-turkiye-straits-in-2025-3214197)
- [GMK Center — Turkish Straits fee +15% (Haziran 2026)](https://gmk.center/en/news/turkey-is-increasing-the-fee-for-ships-passing-through-the-bosphorus-and-the-dardanelles-by-15-per-cent/)
- [Turkish Minute — Ankara to raise strait transit fees (2026)](https://turkishminute.com/2026/06/19/ankara-to-raise-ship-transit-fees-through-turkish-straits-by-15-pct/)
- [Baltic Exchange — dry services / route list](https://www.balticexchange.com/en/data-services/market-information0/dry-services.html)
- [BMTI — Baltic Supramax Index route definitions](https://www.bmti-report.com/baltic-supramax-index-bsi/)
- [BMTI — Baltic Panamax Index](https://www.bmti-report.com/?p=286)
