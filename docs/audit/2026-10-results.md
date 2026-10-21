# LEVANTER web sitesi — sonuç raporu

**Tarih:** 21 Ekim 2026
**İlgili belge:** [2026-10-site-audit.md](2026-10-site-audit.md): A–F çıktıları ve önem dereceli sorun listesi.
**İncelenen sürüm:** Vercel production'ın yayınladığı `main` dalı (`8ef3c0e`). Değişiklikler PR #3'te.

Ölçümler yerel production build üzerinde yapıldı. Vercel production ortamı benzetildi: `VERCEL_ENV=production`, `VERCEL_PROJECT_PRODUCTION_URL=shipping-wheat.vercel.app`. Lighthouse sonuçları laboratuvar ölçümüdür (mobil emülasyon, 3 çalıştırmanın medyanı). Gerçek kullanıcı verisi (CrUX, Search Console, Vercel Analytics) bu ortamdan erişilebilir değildi.

> **Düzeltmeler.** (1) Bu raporun ilk sürümü, Ekim başında yerini `main`'deki yeniden tasarıma bırakmış eski bir sürümü (deponun varsayılan dalı) inceliyordu. O çalışma dal geçmişinde duruyor; bu rapor canlı sürümü anlatıyor. (2) İlk raporda Türk Boğazları harcı için "net ton başına US$6,70" yazmıştım. Bu yanlıştı. US$6,70, Türkiye'nin 1 Temmuz 2026 – 30 Haziran 2027 için belirlediği **bir Montreux altın frangının dolar değeri**. Harç net ton başına altın frank olarak hesaplanıyor: sağlık 0,075, fener 0,42 (ilk 800 NT) / 0,21 ve can kurtarma 0,10. Bu, büyük bir tanker için yaklaşık net ton başına US$2,6 eder. Canlı sitede bu rakam yer almıyor.

---

## 1. Mevcut durum ve temel problemler

Canlı site iyi kurulmuş: odaklı bir bilgi mimarisi, statik ve hızlı sayfalar, neredeyse kusursuz erişilebilirlik ve sektöre özgü güçlü içerik (Türk Boğazları rehberi, sınıf rehberleri, 70 terimlik sözlük). Yayına hazır olmasını engelleyen sorunlar çoğunlukla teknik ayar ve doğrulanmamış veriden kaynaklanıyordu:

- **Arama motorları için yanlış adres.** `NEXT_PUBLIC_SITE_URL` Vercel'de tanımlı değil. Bu yüzden 44 sayfanın tamamında canonical, Open Graph ve JSON-LD adresleri ile `robots.txt` içindeki sitemap adresi, var olmayan `levanter.example` alanına gidiyordu. Production `robots.txt` dosyası okunarak doğrulandı.
- **Site ziyaretçiye kapalı olabilir.** Vercel Deployment Protection açık ve projede özel alan adı yok. Bu ayarın production adresini kapsayıp kapsamadığı bu ortamdan doğrulanamadı.
- **Talepler kayboluyor.** Bütün e-posta adresleri `.example` uzantılı, telefon ve WhatsApp numaraları yer tutucu. Teklif formu bu adreslere gönderiyor.
- **Örnek veriler gerçek bilgi gibi yayınlanıyordu.** 9 örnek kişi, yapılandırılmış veride broker ve yazar olarak yer alıyordu (23 `Person` varlığı). Doğrulanmamış tüzel kişilik, kuruluş yılı, sokak adresi ve koordinat (12 sayfada yerel işletme bloğu) ve başkasına ait olabilecek sosyal profiller (44 sayfa) de aynı durumdaydı.
- **Sektörel içerikte güncelliğini yitirmiş ve hatalı bilgiler vardı.** Karadeniz savaş riski alanı, fiyat tavanının 2026 durumu, İngiltere yaptırım listesi, Boğaz kılavuzluğu ve iki Baltic rota tanımı hatalıydı. Dört notta kaynaksız veya kaynakla çelişen piyasa rakamları ve ters kurulmuş bir arbitraj mantığı vardı.
- **Küçük teknik eksikler:** CSP yoktu; bir erişilebilirlik ihlali (3,1:1 kontrast) vardı; mobilde 7 font dosyası önyükleniyordu; bir başlık 71 karakterdi.

## 2. Uygulanan tasarım değişiklikleri

Canlı tasarım talepteki yönle zaten uyumlu: lacivert, kemik beyazı, gri ve tek vurgu rengi olarak pirinç. Şablon görünümü yok ve bileşenler erişilebilir. Bu yüzden yeniden tasarım yapılmadı. Yapılan değişiklikler görünümü bozmadan erişilebilirlik ve hızla sınırlı:

- **Kontrast:** araştırma notu imzasındaki baş harf avatarı beyaz-üzeri-pirinç (3,1:1) idi. Broker kartlarında kullanılan kontrast güvenli renk fonksiyonuna geçirildi (4,5:1 üstü). axe'in 36 görünümde bulduğu tek ihlal (aynı öğe, masaüstü ve mobil) giderildi.
- **Font önyüklemesi:** mobilde ilk boyamayla yarışan 7 font dosyası (182 kB; latin-ext ve mono dahil) yerine yalnızca başlık ve gövde fontlarının Latin dosyaları önyükleniyor (2 dosya, 75 kB). Türkçe karakterler (latin-ext) kendi `unicode-range` kuralıyla ihtiyaç anında yükleniyor; build çıktısında 9 latin-ext `@font-face` kuralının durduğu doğrulandı.
- **Sayfa görünümü değişmedi.** Yer tutucu iletişim bilgileri ve örnek ekip sayfalarda duruyor. Bunları gizlemek tasarımı değiştireceği için karar şirkete bırakıldı (bkz. §6).

## 3. Uygulanan teknik SEO iyileştirmeleri

| Kontrol (44 HTML sayfa)                                  | Önce                                       | Sonra                                                   |
| -------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------- |
| Canonical'ı geçerli alan adına giden sayfa              | 0 / 44 (hepsi `levanter.example`)          | 44 / 44 (`shipping-wheat.vercel.app`, Vercel'in production alan adı; preview dağıtımında doğrulandı) |
| `robots.txt` sitemap adresi                              | `https://levanter.example/sitemap.xml`     | production alan adı                                     |
| Preview ve localhost build'leri                          | `index, follow`                            | `noindex`; `robots.txt` her şeyi kapatıyor              |
| JSON-LD'de yer tutucu telefon/e-posta/adres              | 44 sayfa                                   | 0                                                       |
| Yer tutucu adresli yerel işletme bloğu                   | 12 sayfa                                   | 0 (adres doğrulanınca otomatik geri gelir)              |
| Doğrulanmamış `sameAs` / `twitter:site`                  | 44 sayfa                                   | 0                                                       |
| Örnek kişiler için `Person` varlığı                      | 23 (15 sayfa)                              | 0; yazar olarak şirket, RSS'te masa adı                 |
| `security.txt` (teslim edilemeyen adres)                 | yayında                                    | doğrulanana kadar 404                                   |
| CSP                                                      | yok                                        | var; 36 görünümde ve etkileşimde 0 ihlal                |
| HTML referrer etiketi                                    | `origin-when-cross-origin`                 | `strict-origin-when-cross-origin` (başlıkla aynı)       |
| 60 karakteri aşan İngilizce başlık                       | 1 (`/lpg/pressurised`, 71)                 | 0                                                       |
| Önyüklenen font                                          | 7 dosya / 182 kB                           | 2 dosya / 75 kB                                         |
| Kırık bağlantı, `href="#"`, kırık çapa                   | 0                                          | 0                                                       |
| Birim testleri                                           | 47                                         | 53                                                      |

**Nasıl çalışıyor:**

- Kök adres build sırasında şu sırayla belirleniyor: `NEXT_PUBLIC_SITE_URL` → Vercel'in production alan adı → localhost. Özel alan adı eklendiğinde Vercel değişkeni kendiliğinden o adrese döner. Yine de `NEXT_PUBLIC_SITE_URL` ayarlanmalı; ayarlanmazsa build uyarı veriyor.
- `lib/site.ts` içindeki `COMPANY_DETAILS_CONFIRMED` bayrağı `false` olduğu sürece tüzel kişilik, kuruluş yılı, sokak adresi, telefon ve e-postalar JSON-LD'ye, `llms.txt`'ye, `humans.txt`'ye ve `ai.txt`'ye girmiyor. `lib/site.test.ts`, yer tutucular duruyorken bayrak `true` yapılırsa testi düşürüyor.
- Sosyal profiller ve brokerlar için `verified` alanları var. Yalnızca doğrulananlar yapılandırılmış veride ve AI dosyalarında isimle yer alıyor.

## 4. İçerik ve sayfa mimarisi değişiklikleri

**Mimari ve URL'ler değişmedi.** Mevcut yönlendirmeler korundu, yeni URL eklenmedi.

**Düzeltilen bilgiler** (kaynaklar en altta):

- **Karadeniz savaş riski:** JWC genelgesi JWLA-035 (16 Eylül 2026) ile liste alanı, Türkiye, Bulgaristan, Romanya ve Gürcistan karasuları dışında neredeyse tüm Karadeniz'i kapsıyor. Boğazlar rehberi, uyum sayfası ve sözlük güncellendi.
- **Fiyat tavanı:** AB ve İngiltere ham petrol tavanını Şubat 2026'da düşürdü. AB, 21. yaptırım paketiyle (Temmuz 2026) otomatik ayarlamayı 15 Temmuz 2027'ye kadar durdurdu. Kurucunun "eskiyecek rakam yok" kuralı gereği tarihler yazıldı, tavan rakamı yazılmadı. Beyan zinciri düzeltildi: beyanı kiracı verir; düzenleyiciler sigorta kulübü "onaylamaz".
- **İngiltere listesi:** OFSI Konsolide Listesi 28 Ocak 2026'da kapandı; tek kaynak UK Sanctions List.
- **Türk Boğazları:** Montreux'ye göre transit gemilerde kılavuzluk ve römorkaj isteğe bağlı ama şiddetle tavsiye ediliyor; Boğaz limanlarına uğrayanlarda kılavuzluk zorunlu. Harcın net ton başına altın frank üzerinden hesaplandığı ve doların her 1 Temmuz'da güncellendiği açıklandı.
- **Baltic rotaları:** TD6 = 135.000 mt CPC → Augusta, ~1.250 nm (sitede ~2.400 nm yazıyordu). TD19 = 80.000 mt Akdeniz içi, Ceyhan → Lavera. TD22, Ümit Burnu üzerinden ~14.000–15.000 nm (11.800 değil). TC17 Doğu Afrika ithal terminallerine gidiyor.
- **Diğer:** Suezmax su çekimi, Malakka geçiş süresi, EUA'nın ton CO₂e karşılığı olması, VLGC'de propanın taşınma sıcaklığı (~−42 °C), EU ETS spot metnindeki %70/%100 çelişkisi, scrubber'lı geminin HSFO yakması ve TD7'nin yaklaşık bir haftalık sefer olması düzeltildi.
- **Kaynaksız rakamlar kaldırıldı:** Suezmax notundaki "Ocak rekorunun %3 yakınında" ifadesi kaynaklarla çelişiyordu (Ocak yüklemeleri plandan ~%45 düşüktü). Aynı nottaki "2026'da 18 teslimat" da çelişiyordu (kaynak: 50 planlı). Pozisyon listesi 26/41, TD15 "%70–80", TD7 "8–12 bin $/gün" ve şirketin "piyasa ortalamasının %10–15 üstü" performans iddiası da kaldırıldı. Brent–Dubai arbitraj mantığı iki notta ters kurulmuştu; düzeltildi.
- **Müşteri izlenimi:** "Tipik kiracılar" altındaki Saudi Aramco, ADNOC, KPC, CEPSA (artık Moeve), Saras ve Repsol kategori adlarıyla değiştirildi.
- **Taahhüt dili:** "60 dakika" yalnızca ilk yanıt için kullanılıyor ("mesai saatlerinde"); gemi listesi ve navlun fikri vaatleri bundan ayrıldı.
- **Koşullar ve gizlilik:** koşullardaki tarama yasağı AI tarayıcı politikasıyla uyumlu hâle getirildi; var olmayan LinkedIn bağlantısı ve açık kaynak lisansı düzeltildi. Gizlilik metni Vercel Inc.'i (ABD) ve işlenen veriyi (IP adresi, tarayıcı bilgisi) belirtiyor; doğrulanamayan "sizi tanımlamaz" güvencesi kaldırıldı. Gizlilik politikası özetindeki doğrulanmamış "GDPR/KVKK uyumlu" ifadesi çıkarıldı.

## 5. Test sonuçları ve doğrulanamayan konular

**Testler**

- `npm run lint`, `npm run format:check`, `npm run test` (53 test), `npm run build`: temiz. GitHub Actions CI, birleştirme ve düzeltme commit'lerinde başarılı (run #10 ve #11).
- **Tarama (45 URL):** tamamı 200. Her sayfada tek H1 ve tek `<main>`, başlık atlaması yok, kırık bağlantı veya çapa yok. Canonical'ların tamamı production alan adına gidiyor. JSON-LD'de yer tutucu veya doğrulanmamış kişi yok.
- **Tarayıcı ve axe (18 sayfa × masaüstü/mobil):** 0 ihlal (önce 1 öğe, 2 görünümde). 0 yatay taşma. 0 konsol veya CSP hatası; yalnızca Vercel analitik betikleri yerel sunucuda 404 veriyor, bu Vercel'de beklenmez.
- **Etkileşim:** mobil menü açılıyor ve Escape ile kapanıyor. LPG dönüştürücü 84.000 cbm propan için 47.910 t veriyor. Teklif formu boş gönderimde 9 alanı işaretliyor.
- **Lighthouse (mobil, laboratuvar, 3 çalıştırmanın medyanı):**

Soldaki değer `main`, sağdaki bu PR. Her iki sürüm aynı makinede, sırayla dönüşümlü çalıştırıldı.

| Sayfa | Performans | Erişilebilirlik | En iyi uygulamalar* | SEO | LCP | TBT |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | 90 → 93 | 100 → 100 | 96 → 96 | 100 → 100 | 3,6 sn → 3,1 sn | 14 → 33 ms |
| `/tankers` | 90 → 93 | 100 → 100 | 96 → 96 | 100 → 100 | 3,5 sn → 3,1 sn | 23 → 34 ms |
| `/lpg` | 90 → 93 | 100 → 100 | 96 → 96 | 100 → 100 | 3,6 sn → 3,0 sn | 41 → 34 ms |
| `/contact` | 90 → 95 | 100 → 100 | 96 → 96 | 100 → 100 | 3,5 sn → 2,8 sn | 43 → 33 ms |
| `/turkish-straits` | 90 → 95 | 100 → 100 | 96 → 96 | 100 → 100 | 3,6 sn → 2,9 sn | 46 → 35 ms |
| `/research/strait-of-hormuz-…` | 90 → 94 | 96 → 100 | 96 → 96 | 100 → 100 | 3,6 sn → 2,9 sn | 26 → 32 ms |

\* "En iyi uygulamalar" puanını düşüren tek madde, Vercel Analytics ve Speed Insights betiklerinin yerel sunucuda 404 dönmesi; Vercel'de bu hata beklenmez. LCP, simüle edilmiş yavaş 4G bağlantıda hesaplanan laboratuvar değeridir; yerel ölçümde sayfalar ~0,2 sn'de boyanıyor. Gerçek kullanıcı LCP'si yayından sonra Vercel Speed Insights'ta izlenmeli. TBT her iki tarafta 50 ms'nin altında; aradaki fark ölçüm gürültüsü düzeyinde.

**Doğrulanamayanlar ve doğrulama yöntemi**

| Konu                                                   | Neden doğrulanamadı                    | Nasıl doğrulanır                                                                          |
| ------------------------------------------------------ | -------------------------------------- | ----------------------------------------------------------------------------------------- |
| Production'ın herkese açık olup olmadığı               | Bu ortamdan dış ağa çıkış engelli      | `shipping-wheat.vercel.app` adresini gizli pencerede açın; Vercel girişi geliyorsa kapalıdır |
| Gerçek kullanıcı performansı (LCP, INP, CLS)           | CrUX ve Analytics erişimi yok          | Vercel Speed Insights ve Search Console → Core Web Vitals                                  |
| Anahtar kelime hacimleri                               | Ahrefs/Semrush planı yetersiz          | Search Console sorgu verisi (yayından 4–6 hafta sonra) veya ücretli araç                  |
| Şirket bilgileri, ekip, ofisler, 60 dk taahhüdü        | Yalnızca şirket bilebilir              | Ticaret sicili/MERSİS, iş sözleşmeleri, yanıt süresi kaydı                                |
| +90 533 000 0000'ın gerçek bir aboneye ait olup olmadığı | Bu ortamdan aranamaz                   | Numara değiştirilene kadar WhatsApp ve telefon bağlantılarını kullanmayın                 |
| TD3C, TD8, TD20, TD23 mesafeleri                       | Ticari mesafe tablosu erişilemedi      | Netpas, BP Shipping Marine Distances veya Worldscale mesafeleri                           |
| EU ETS "tam rapor"unun varlığı                         | Depoda yok                             | Araştırma masası                                                                          |
| KVKK ve GDPR yeterliliği                               | Hukuki değerlendirme gerektirir        | Hukuk incelemesi (§6)                                                                     |

## 6. Öncelikli kalan işler

1. **Yayın öncesi, kritik (şirket):**
   - Production adresinin herkese açık olup olmadığını kontrol edin. Özel alan adı ekleyip Vercel'de `NEXT_PUBLIC_SITE_URL`'yi bu adrese ayarlayın.
   - Gerçek e-posta gelen kutularını (masalar, `security@`, gizlilik başvuruları), telefon ve WhatsApp numaralarını ve adresi `lib/site.ts`'e girin; ardından `COMPANY_DETAILS_CONFIRMED = true` yapın. O zamana kadar WhatsApp ve telefon bağlantılarının gizlenmesi değerlendirilebilir; özellikle "Send via WhatsApp" talebin tamamını yer tutucu numaraya hazırlıyor.
2. **Yayın öncesi (şirket):**
   - Örnek ekibi gerçek kişilerle (yazılı rıza ile) değiştirin ve `verified: true` yapın. Sınıf sayfalarındaki "Desk" satırları ve yerel sayfalardaki ana dil bağlantısı da isim içeriyor.
   - London ve Singapur ofislerini, tüzel kişiliği ve kuruluş yılını, "her fixture taranır" ifadesini ve 60 dakika taahhüdünü teyit edin. Doğrulanmayanları metinden çıkarın.
   - Sosyal profilleri doğrulayıp `SOCIAL_PROFILES` içinde `verified: true` yapın.
3. **Hukuk:** KVKK aydınlatma metni, MERSİS ve ticaret sicili bilgileri, KEP adresi, başvuru kanalları, yurt dışı aktarım (Vercel ve Meta ABD'de), saklama süreleri, analitiğe itiraz yolu, bülten için İYS ve AB temsilcisi (GDPR md. 27) ihtiyacı.
4. **İçerik (1–3 ay):** yayın takvimi ("Weekly" vaadi Nisan'dan beri tutulmuyor). Notlar arası iç bağlantılar (5 not yalnızca 2 bağlantı alıyor). Yerel metinlerin ana dili konuşan biri tarafından kontrolü. Türkçe sayfa kararı. EU ETS raporu yoksa vaadin kaldırılması. Mesafelerin tabloyla teyidi.
5. **Teknik:**
   - CI derlemesi Google Fonts'a bağlı. Hata tekrar ederse fontlar `next/font/local` ile depoya alınmalı.
   - CI'a Playwright + axe kontrolü eklenmeli.
   - Gerekirse `/dry-bulk` ve `/sale-purchase` için 410 dönülebilir.
   - Next.js 15'e geçiş ayrı bir iş olarak değerlendirilmeli.

## 7. Ölçülebilir başarı göstergeleri ve takip planı

Sıralama veya trafik için hedef rakam verilmiyor; aşağıdakiler önce bir başlangıç değeri almak, sonra trendi izlemek içindir. Ölçüm, site herkese açık ve kendi alan adında yayına girdikten sonra başlamalı.

| Gösterge                                                     | Kaynak                                   | Sıklık             | Beklenen yön / eşik                                                       |
| ------------------------------------------------------------ | ---------------------------------------- | ------------------ | ------------------------------------------------------------------------- |
| İndekslenen sayfa / sitemap'teki sayfa                       | Search Console → Sayfalar                | Haftalık (ilk ay)  | 44 URL'nin tamamı indekste; "Taranıyor, indekslenmedi" azalmalı           |
| Canonical uyuşmazlığı ("Google farklı bir canonical seçti") | Search Console → Sayfalar                | Haftalık (ilk ay)  | 0                                                                         |
| Yapılandırılmış veri hataları                                | Search Console → Geliştirmeler           | Aylık              | 0                                                                         |
| Core Web Vitals (alan)                                       | Search Console, Vercel Speed Insights    | Aylık              | LCP ≤ 2,5 sn, INP ≤ 200 ms, CLS ≤ 0,1 (%75'lik dilim)                     |
| Organik gösterim, tıklama, marka dışı sorgular               | Search Console → Performans              | Aylık              | Başlangıç değerine göre trend                                             |
| Doğru sayfa eşleşmesi ("Turkish Straits transit", "VLGC chartering", "laytime demurrage guide") | Search Console | Aylık | İlgili rehberin görünmesi; aynı sorguda iki sayfa yarışmaması |
| Gelen gerçek talep sayısı ve ilk yanıt süresi                | Masa gelen kutusu / CRM                  | Haftalık           | 60 dk taahhüdünün kayıtla kanıtlanması                                    |
| AI asistanlarında atıf                                       | Örnek sorgularla elle kontrol            | Aylık              | Doğru bilgiyle ve site bağlantısıyla anılma                               |
| Erişilebilirlik regresyonu                                   | axe / Lighthouse (CI'a eklenmesi önerilir) | Her PR            | axe 0 ihlal, Lighthouse erişilebilirlik 100                               |

**Kaynaklar**

- [Baltic Exchange — UK and EU announce further reduction in price cap on Russian crude oil](https://www.balticexchange.com/en/news-and-events/news/member-news/2026/UK-and-EU-announce-further-reduction-in-price-cap-on-Russian-crude-oil.html)
- [Skuld — Oil price cap update, 15 January 2026](https://www.skuld.com/topics/legal/sanctions/russia/recent-uk-and-eu-sanctions-imposed-against-russia-eus-18th-sanctions-package/)
- [Interfax — EU 21st package: price cap adjustment paused until 15 July 2027](https://interfax.com/newsroom/top-stories/118495/)
- [gCaptain — London marine insurers widen Black Sea high-risk zone](https://gcaptain.com/londons-marine-insurers-widen-black-sea-high-risk-zone-as-shipping-attacks-surge/)
- [Odessa Journal — War-risk zone expands to cover almost entire Black Sea](https://odessa-journal.com/war-risk-zone-expands-to-cover-almost-entire-black-sea)
- [GOV.UK — The UK Sanctions List](https://gov.uk/government/publications/the-uk-sanctions-list)
- [Strong & Herd — Moving to a single list for UK sanctions designations, 28 January 2026](https://www.strongandherd.co.uk/moving-to-a-single-list-for-uk-sanctions-designations-28-january-2026)
- [Turkish Minute — Ankara to raise ship transit fees through Turkish Straits by 15 pct](https://turkishminute.com/2026/06/19/ankara-to-raise-ship-transit-fees-through-turkish-straits-by-15-pct/)
- [CIA Reading Room — The problem of the Turkish Straits (Montreux Annex I tarifesi)](https://www.cia.gov/readingroom/document/cia-rdp08c01297r000500030004-2)
- [Montreux Convention (1936), Madde 2 — kılavuzluk ve römorkaj isteğe bağlı](https://en.wikisource.org/wiki/Montreux_Convention)
- [The DCN — Baltic Exchange Weekly Report, 21 August 2026 (TD6 135,000mt CPC/Augusta, TD19 Ceyhan–Lavera)](https://www.thedcn.com.au/news/baltic-exchange-weekly-report-21-august-2026)
- [MNI — CPC Blend shipments in January seen 45% below initial expectation](https://mnimarkets.com/articles/cpc-blend-shipments-in-january-now-seen-45percent-below-initial-expectation-1768316276225)
- [Ifchor Galbraiths — Suezmax Monthly, July 2026 (2026 teslimat programı)](https://shippingcourse.ifchorgalbraiths.com/wp-content/uploads/2026/07/Suezmax-Monthly-July-2026.pdf)
- [European Commission — FAQ: maritime transport in EU ETS](https://climate.ec.europa.eu/areas-action/transport-decarbonisation/reducing-emissions-shipping-sector/faq-maritime-transport-eu-emissions-trading-system-ets_en)

---

## Kısa versiyon (kopyala)

```
LEVANTER sitesi: denetim ve düzeltmeler (21 Ekim 2026, PR #3)

İncelenen: Vercel production'ın yayınladığı main dalı (tanker + LPG sitesi).

Düzeltilenler
- Canonical, sitemap ve robots.txt yer tutucu levanter.example alanına gidiyordu; artık
  production alan adına gidiyor. Preview'lar noindex.
- Yer tutucu iletişim bilgileri, tüzel kişilik, örnek brokerlar ve doğrulanmamış sosyal
  profiller yapılandırılmış veriden ve AI dosyalarından çıkarıldı (doğrulanınca bayrakla geri gelir).
- Sektörel hatalar: Karadeniz savaş riski alanı (JWLA-035), 2026 fiyat tavanı ve dondurulması,
  UK Sanctions List, Boğaz kılavuzluğu, TD6/TD19/TD22 rotaları, kaynaksız piyasa rakamları,
  müşteri izlenimi veren şirket adları.
- CSP, kontrast (axe 1 → 0 ihlal), font önyüklemesi (7 → 2 dosya), başlık uzunluğu. Testler 47 → 53.
- Lighthouse mobil (lab, 3 çalıştırma medyanı): performans 90 → 93–95, LCP 3,5–3,6 → 2,8–3,1 sn.

Şirketin yapması gerekenler (yayın öncesi)
1. Production adresinin herkese açık olduğunu doğrula; özel alan adı ekle, NEXT_PUBLIC_SITE_URL ayarla.
2. Gerçek e-posta, telefon, WhatsApp ve adresi gir; COMPANY_DETAILS_CONFIRMED = true.
3. Örnek ekibi gerçek kişilerle (rıza ile) değiştir; ofisleri, A.Ş. ve 60 dk taahhüdünü teyit et.
4. KVKK/GDPR hukuk incelemesi.

Not: Önceki raporda Boğaz harcı için yazılan "net ton başına 6,70 $" yanlıştı; 6,70 $ altın frangın
değeri, büyük tankerde etkin harç ~2,6 $/NT.
```
