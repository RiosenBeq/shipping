# LEVANTER: İçerik yönetim paneli (Keystatic)

Sitedeki bütün liste ve metin verileri (şirket ve iletişim bilgileri, brokerlar, araştırma notları, SSS'ler, sözlük, tanker ve LPG sınıfları, LPG dönüştürücü yoğunlukları, uyum ve Türk Boğazları sayfaları) artık **`/keystatic`** adresindeki yönetim panelinden eklenip düzenlenebilir.

Panel [Keystatic](https://keystatic.com) ile kuruldu (`@keystatic/core` 0.6.9, `@keystatic/next` 5.0.5). Veritabanı ve ayrı bir sunucu yok: içerik depodaki JSON dosyalarında (`content/*.json`) durur, her kayıt bir Git değişikliğidir.

- **Kendi bilgisayarınızda** (`npm run dev`): panel dosyaları doğrudan diske yazar.
- **Canlı sitede** (Vercel): panel her kaydı GitHub'daki `RiosenBeq/shipping` deposuna commit olarak gönderir, Vercel siteyi yeniden yayınlar.

## 1. Kendi bilgisayarınızda düzenleme

```bash
npm install
npm run dev
```

Tarayıcıda **http://localhost:3000/keystatic** adresini açın. Giriş gerekmez.

1. Soldaki menüden bölümü seçin (ör. **Brokers**).
2. Listedeki bir satıra tıklayınca düzenleme penceresi açılır; **Add** yeni kayıt ekler, çöp kutusu siler, soldaki tutamaçla sürükleyerek sıra değişir.
3. Pencerede **Done**, sonra sağ üstteki **Save**. **Done** yalnızca pencereyi kapatır; değişiklik **Save**'e basılana kadar dosyaya yazılmaz (başlığın yanında "Unsaved" görünür).
4. Kayıt `content/` altındaki ilgili JSON dosyasını günceller. Açık olan site sayfası (ör. `http://localhost:3000/brokers`) yenilendiğinde değişikliği gösterir.
5. Değişikliği yayına almak için dosyaları commit edip GitHub'a gönderin (veya PR açın). Broker fotoğrafı eklediyseniz `public/images/brokers/` klasörünü de commit edin.

Kayıttan sonra kontrol için: `npm test` (içerik kurallarını da denetler, bkz. §5).

## 2. Canlı sitede düzenleme (GitHub modu)

Canlı sitede panel, GitHub'a bir **GitHub App** üzerinden bağlanır. Kurulum bir kez yapılır.

### 2.1 GitHub App'i oluşturun (yerelde, bir kez)

Bunu depoya **yazma yetkisi olan** bir GitHub hesabıyla yapın.

```bash
KEYSTATIC_STORAGE=github npm run dev
```

1. **http://localhost:3000/keystatic** adresini açın (Keystatic bu modda adresi `http://127.0.0.1:3000` yapar) ve **Log in with GitHub**'a tıklayın. Uygulama henüz olmadığı için **Keystatic Setup** ekranı açılır.
2. **Deployed App URL** alanına canlı sitenin adresini yazın (ör. `https://www.levanter.com.tr`). Böylece canlı sitenin giriş dönüş adresi (`/api/keystatic/github/oauth/callback`) uygulamaya eklenir. Uygulama bir GitHub organizasyonunda olacaksa organizasyon adını da girin.
3. **Create GitHub App** → GitHub'da uygulamaya bir ad verin (ör. `levanter-cms`) ve oluşturun.
4. GitHub, uygulamayı bir depoya kurmanızı ister: **Only select repositories → `RiosenBeq/shipping`**.
5. Keystatic dört değeri projenin kökündeki **`.env`** dosyasına yazar. Bu dosya Git'e girmez (`.gitignore`), içindekiler gizlidir; kimseyle paylaşmayın.

Canlı alan adı sonradan değişirse GitHub'da **Settings → Developer settings → GitHub Apps → (uygulama) → Callback URL** listesine `https://<yeni-alan-adı>/api/keystatic/github/oauth/callback` adresini ekleyin.

### 2.2 Değişkenleri Vercel'e ekleyin

Vercel'de projeyi açın: **Settings → Environment Variables**. `.env` dosyasındaki dört değeri **Production** ortamına ekleyin:

| Değişken | Ne işe yarar |
| --- | --- |
| `KEYSTATIC_GITHUB_CLIENT_ID` | GitHub App'in istemci kimliği |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | GitHub App'in gizli anahtarı (gizli) |
| `KEYSTATIC_SECRET` | Oturum çerezlerini imzalayan rastgele anahtar (gizli) |
| `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | Uygulamanın GitHub'daki kısa adı (ör. `levanter-cms`) |

Ardından **Deployments → son yayın → Redeploy**. `NEXT_PUBLIC_…` değişkeni derleme sırasında koda gömüldüğü için yeniden yayın şart.

Bu değişkenler yokken `/keystatic` hata vermez; eksik değişkenlerin **adlarını** (değerlerini değil) listeleyen bir kurulum notu gösterir. `/api/keystatic/…` aynı durumda 503 döner.

### 2.3 Kim giriş yapabilir

`https://<alan-adı>/keystatic` → **Log in with GitHub**. Giriş yapabilenler, `RiosenBeq/shipping` deposuna **yazma (write) yetkisi olan GitHub kullanıcılarıdır**. Yeni bir editör eklemek için: GitHub'da depo → **Settings → Collaborators → Add people**, rolü en az **Write**. Yetkiyi geri almak için aynı yerden kaldırın.

### 2.4 Kaydedince ne olur

- **Save**, değişikliği doğrudan **`main`** dalına commit eder (commit yazarı giriş yapan kişidir; geçmiş GitHub'da görünür, gerekirse geri alınabilir). Panel her zaman `main` dalında açılır (`/keystatic` → `/keystatic/branch/main`), çünkü deponun GitHub'daki varsayılan dalı şu an `main` değil, eski bir dal (`claude/implement-voyage-estimator-DKL5K`). Yine de GitHub'da **Settings → General → Default branch** ile varsayılan dalı `main` yapmak önerilir (PR'lar ve klonlar için).
- Vercel `main`'deki yeni commit'i görür ve siteyi **yaklaşık 1–2 dakikada** yeniden yayınlar. O süre içinde canlı sitede eski içerik görünür.
- Paneldeki dal (branch) menüsünden yeni bir dal açıp orada çalışabilirsiniz; o dalın Vercel önizlemesi oluşur, sonra GitHub'da PR ile `main`'e alınır. Basit düzeltmeler için `main` yeterli.
- Kayıt içerik kurallarına uymuyorsa (§5) Vercel derlemesi hata verir ve **canlı site eski haliyle kalır**; hata, Vercel'deki derleme kaydında hangi dosyada neyin yanlış olduğunu yazar. Paneldeki zorunlu alanlar ve seçim listeleri çoğu hatayı kayıttan önce engeller.

## 3. Bölümler: hangi ekran neyi düzenler

| Paneldeki bölüm | Dosya | Sitede nerede görünür |
| --- | --- | --- |
| **Site settings** | `content/site.json` | Şirket adı, slogan, açıklama, site adresi, tüzel kişilik, kuruluş yılı, "içerik güncellendi" tarihi; ana e-posta, telefon, WhatsApp (wa.me bağlantısı için `+905…` biçiminde) ve görünen hali; çalışma saatleri; masa e-postaları (tanker, LPG, araştırma); adres ve harita konumu; ofisler; X/Twitter ve LinkedIn. Üst menü, alt bilgi, iletişim sayfası, yüzen iletişim düğmesi, hata sayfaları, JSON-LD, `llms.txt`, `humans.txt`, `ai.txt`, `security.txt`. |
| **Brokers** | `content/brokers.json` | Her broker: ad, unvan, masa, ofis, uzmanlık etiketleri, diller, baş harfler, avatar rengi (masa şefi: pirinç, broker: lacivert) ve **isteğe bağlı fotoğraf**. Sıra, `/brokers` ve ana sayfalardaki sıradır. Altta masa adları. |
| **Research notes** | `content/research.json` | Her not tek kayıt: adres (slug), başlık, arama başlığı, özet (en çok 160 karakter), masa, kategori, yayın ve revizyon tarihi, yazar, okuma süresi, "gated", kart etiketleri, giriş cümlesi (dek), gated özeti ve **gövde**. `/research`, not sayfaları, RSS (`/research/feed.xml`), `llms-full.txt`, JSON-LD (Article). |
| **Tanker classes** | `content/tanker-classes.json` | `/tankers` ve `/tankers/<sınıf>`: teknik değerler, rotalar (Hormuz işaretiyle), pazarlar, eğilimler, kiralama şekli, sorumlu masa. |
| **LPG classes** | `content/lpg-classes.json` | `/lpg` ve `/lpg/<sınıf>`: kapasite, yük, rotalar, ticaretler, dikkat noktaları, sınıfa özel SSS. |
| **LPG converter cargoes** | `content/lpg-cargoes.json` | `/lpg`'deki cbm ↔ ton dönüştürücüsünün yük listesi ve yoğunlukları (t/m³). |
| **FAQs** | `content/faqs.json` | Ana sayfa, `/tankers`, `/lpg` ve `/about` SSS'leri (FAQ JSON-LD dahil). |
| **Glossary** | `content/glossary.json` | `/glossary` terimleri ve grup başlıkları. |
| **Compliance** | `content/compliance.json` | `/compliance`: son gözden geçirme tarihi, tarama grupları, adımlar, SSS. |
| **Turkish Straits** | `content/turkish-straits.json` | `/turkish-straits`: tarih, kısa bilgiler, bölümler (paragraflar ve isteğe bağlı maddeler), SSS. |

### Araştırma notu gövdesi

Gövde bloklardan oluşur; **Add** ile blok türü seçilir, sürükleyerek sıralanır:

- **Paragraph**: düz metin paragraf.
- **Heading**: ara başlık (sayfada H2).
- **Bullet list / Numbered list**: madde listesi; her madde ayrı satır.
- **Callout box**: çerçeveli kutu: etiket, metin ve isteğe bağlı site içi bağlantı (yol, ör. `/compliance`, ve bağlantı metni; ikisi birlikte doldurulur).
- **Table**: başlık (caption), sütun başlıkları ve satırlar; her satırda sütun sayısı kadar hücre. Boş hücre olabilir.

Metinlerde Markdown veya HTML kullanılmaz; yazılan aynen görünür.

### Broker fotoğrafı

Broker penceresinde **Photo → Choose file**. Kare, omuz hizasından, en az 240 × 240 px bir fotoğraf (JPG, PNG, WebP veya AVIF) seçin; iPhone'un HEIC biçimi tarayıcılarda görünmediği için kabul edilmez (derleme hata verir), önce JPG'ye çevirin. Dosya `public/images/brokers/<kısa-id>/photo.<uzantı>` olarak kaydedilir (kısa id addan otomatik üretilir). Fotoğraf varsa broker kartında ve `/brokers` JSON-LD'sinde görünür; yoksa baş harfli yuvarlak avatar kalır. **Remove** fotoğrafı kaldırır. Kişinin yayın için onayını almayı unutmayın.

## 4. Dikkat edilecekler

- **Slug'lar adrestir.** Araştırma notu, tanker ve LPG sınıfı slug'larını yayından sonra değiştirmeyin; eski bağlantılar 404 olur. Gerekirse eski adres için `next.config.mjs`'e yönlendirme eklenmelidir (geliştirici işi).
- **Yazar adı** broker listesindeki adla birebir aynı olmalı (Türkçe karakterler dahil).
- **Strait of Hormuz notu** (`strait-of-hormuz-disruption-checklist-for-tanker-and-lpg-charterers`) rota tablolarından ve `/compliance`'tan bağlantılıdır; silinemez.
- **Site URL** alanı yalnızca yedektir: Vercel'de `NEXT_PUBLIC_SITE_URL` tanımlıysa o kullanılır.
- **"Content last updated"** tarihini önemli bir içerik değişikliğinden sonra güncelleyin (sitemap, humans.txt, ai.txt bunu gösterir). Uyum ve Boğazlar sayfalarının kendi tarihleri var.

## 5. Doğrulama

Her içerik dosyası `lib/content/schemas.ts`'teki zod şemasıyla ve dosyalar arası kurallarla (`lib/content/validate.ts`) denetlenir:

- zorunlu alanlar dolu, seçimler geçerli, tarihler `YYYY-AA-GG`, WhatsApp numarası `+` ve rakam;
- not, sınıf, broker, dönüştürücü yükü ve Boğazlar bölümü kimlikleri tekil;
- her notun yazarı broker listesinde; revizyon tarihi yayın tarihinden önce değil;
- Hormuz notu mevcut.

Denetim iki yerde çalışır: **`npm test`** (`lib/content/content.test.ts`; ayrıca Keystatic'in kendi okuyucusunun her dosyayı açabildiğini ve dosya biçimini kontrol eder) ve **derleme sırasında** (`app/sitemap.ts` içindeki `assertValidContent()`). Kurala uymayan bir kayıt Vercel derlemesini durdurur; canlı site bozulmaz.

## 6. Kodda kalanlar

Panelden değil, kodda değişir:

- Marka renkleri, paylaşım görseli rotası ve dil kodu (`lib/site.ts`); avatar renk değerleri (`AVATAR_COLOR`) ve masa sırası (`TEAM_ORDER`, `lib/data/brokers.ts`).
- Seçim listeleri (`lib/content/options.ts`): masalar, ofis şehirleri (yeni bir ofis şehri brokerlara atanacaksa buraya eklenir), araştırma kategorileri, sözlük grupları, tanker aileleri.
- Sayfa metinleri (başlıklar, giriş paragrafları, ana sayfa bölümleri) `app/(site)/…` sayfalarında; 10 dilin metni `lib/i18n.ts`'te; sayfa kataloğu `lib/pages.ts`'te.

## 7. Güvenlik ve dizinleme

- `/keystatic` kendi kök düzenine (`app/keystatic/layout.tsx`) sahiptir: `noindex, nofollow`; `robots.txt` hem `/api/` hem `/keystatic` için `Disallow` içerir; sitemap, `llms.txt` ve `llms-full.txt`'de yer almaz; `/api/keystatic/…` yanıtları `X-Robots-Tag: noindex, nofollow` taşır. Bunlar `lib/content/keystatic.test.ts` ile korunur.
- **Yerel mod girişsizdir**, bu yüzden yalnızca geliştirme sunucusunda kullanılır. Vercel'de `KEYSTATIC_STORAGE=local` tanımlansa bile yok sayılır (`lib/content/storage.ts`). Kendi sunucunuzda `next start` ile çalıştırırken bu değişkeni tanımlamayın.
- GitHub App yalnızca `RiosenBeq/shipping` deposuna kurulmalı. İzinleri: içerik yazma, metadata ve PR okuma.

### Content-Security-Policy (PR #3 birleşirse)

PR #3 tüm sitede `default-src 'self'` ve `connect-src 'self' https://vitals.vercel-insights.com` içeren bir CSP ekliyor. Keystatic'in tarayıcı tarafı GitHub modunda şu adreslere bağlanır; bunlar engellenirse panel açılmaz veya giriş sonrası boş kalır:

- `connect-src`: `https://api.github.com` (GraphQL ve dosya içerikleri), `https://raw.githubusercontent.com`
- `img-src`: `https://avatars.githubusercontent.com` (kullanıcı avatarı), `blob:` ve `data:` (fotoğraf önizlemesi)
- `style-src`: `https://fonts.googleapis.com` ve `font-src`: `https://fonts.gstatic.com` (panelin Inter yazı tipi; engellenirse yalnızca yazı tipi değişir)

Bu izinleri tüm siteye açmak yerine yalnızca `/keystatic` için ayrı bir başlık tanımlayın. Next.js'te aynı başlığı birden fazla kural ayarlarsa **sonraki kural kazanır**, bu yüzden `/keystatic` kuralı genel kuraldan sonra gelmeli (`next.config.mjs`, PR #3'teki `contentSecurityPolicy` dizisinin yanına):

```js
const keystaticCsp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://avatars.githubusercontent.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://api.github.com https://raw.githubusercontent.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self' https://github.com",
  "object-src 'none'",
].join("; ");

async headers() {
  return [
    { source: "/:path*", headers: securityHeaders },
    // After the site-wide rule: the last matching header wins.
    { source: "/keystatic/:path*", headers: [{ key: "Content-Security-Policy", value: keystaticCsp }] },
  ];
}
```

`/keystatic/:path*` kalıbı `/keystatic`'in kendisini de kapsar. GitHub girişi ve OAuth dönüşü `/api/keystatic/…` üzerinden sunucu tarafında yapılır; ona ek CSP izni gerekmez. Değişiklikten sonra panelde giriş yapıp bir kayıt deneyin ve tarayıcı konsolunda CSP hatası olmadığını kontrol edin.

### PR #3 ile çakışma

PR #3 `lib/site.ts` ve `lib/data/*.ts` dosyalarındaki içeriği doğrudan düzeltiyor ve yeni alanlar ekliyor (`COMPANY_DETAILS_CONFIRMED`, brokerlarda ve sosyal hesaplarda `verified`). Bu dosyalar artık yalnızca `content/*.json`'u okuyan yükleyiciler olduğu için PR birleştirilirken:

1. İçerik düzeltmeleri (Karadeniz savaş riski, yaptırım listeleri, TD6/TD19 vb.) `content/*.json`'a, panelden veya JSON'u düzenleyerek aktarılmalı;
2. Yeni alanlar `keystatic.config.ts`'e (ör. `fields.checkbox`), `lib/content/schemas.ts`'e ve ilgili yükleyiciye eklenmeli, `content/*.json`'a varsayılan değerleriyle yazılmalı;
3. `npm test` çalıştırılmalı.

## 8. Geliştirici notları

| Ne | Nerede |
| --- | --- |
| Panel şeması (alanlar, etiketler, menü) | `keystatic.config.ts` |
| Depolama modu ve GitHub değişkenleri | `lib/content/storage.ts` |
| Panel sayfası, kurulum notu, kök düzen | `app/keystatic/` |
| Keystatic API | `app/api/keystatic/[...params]/route.ts` |
| İçerik dosyaları | `content/*.json` |
| zod şemaları, doğrulama, yardımcılar | `lib/content/schemas.ts`, `validate.ts`, `format.ts`, `options.ts` |
| Yükleyiciler (dışa aktarılan adlar ve tipler değişmedi) | `lib/site.ts`, `lib/data/*.ts` |
| Testler | `lib/content/content.test.ts`, `keystatic.test.ts`, `setup-notice.test.tsx` |

- Yükleyiciler JSON'u **statik olarak** içe aktarır (çalışma zamanında dosya okuma yok, async yok); istemci bileşenleri (`Nav`, `FloatingContact`, `LpgConverter`, `InquiryForm`, `ErrorView`, `global-error`) aynı modülleri kullanmaya devam eder. zod yalnızca testlerde ve sunucu tarafında (sitemap) çalışır, istemci paketlerine girmez.
- Keystatic boş metin alanlarını JSON'a yazmaz; yükleyiciler eksik anahtarı "yok" kabul eder (ör. `seoTitle`, `updated`, `photo`). Boş tablo hücresi `null` olarak yazılır, sayfaya `""` olarak gelir.
- JSON dosyaları Keystatic'in yazdığı biçimdedir (`JSON.stringify(…, null, 2)`); `.prettierignore` bu yüzden `content`'i hariç tutar. Elle düzenlerken de bu biçimi koruyun; test kontrol eder.
- Yeni bir alan eklemek: `keystatic.config.ts` + `lib/content/schemas.ts` + ilgili yükleyici + `content/*.json`, sonra `npm test`.
