# LEVANTER: İçerik yönetim paneli (Keystatic)

Sitedeki bütün liste ve metin verileri (şirket ve iletişim bilgileri, brokerlar, **blog yazıları**, SSS'ler, sözlük, tanker ve LPG sınıfları, LPG dönüştürücü yoğunlukları, uyum ve Türk Boğazları sayfaları) artık **`/keystatic`** adresindeki yönetim panelinden eklenip düzenlenebilir.

Panel [Keystatic](https://keystatic.com) ile kuruldu (`@keystatic/core` 0.6.9, `@keystatic/next` 5.0.5). Veritabanı ve ayrı bir sunucu yok: içerik depodaki dosyalarda durur (`content/*.json`; blog yazıları `content/blog/*.mdoc`), her kayıt bir Git değişikliğidir.

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
| **Blog posts** | `content/blog/<slug>.mdoc` (yazı başına bir dosya) | `/blog` (ana sayfa, kategori sayfaları, sayfalama), yazı sayfası `/blog/<slug>`, ana sayfadaki "Notes from the desk" şeridi, masa ve sınıf sayfalarındaki not kartları, tam metinli RSS (`/blog/feed.xml`), `llms.txt` / `llms-full.txt`, sitemap, JSON-LD (Blog, BlogPosting, BreadcrumbList). Ayrıntılar §3.1. |
| **Tanker classes** | `content/tanker-classes.json` | `/tankers` ve `/tankers/<sınıf>`: teknik değerler, rotalar (Hormuz işaretiyle), pazarlar, eğilimler, kiralama şekli, sorumlu masa. |
| **LPG classes** | `content/lpg-classes.json` | `/lpg` ve `/lpg/<sınıf>`: kapasite, yük, rotalar, ticaretler, dikkat noktaları, sınıfa özel SSS. |
| **LPG converter cargoes** | `content/lpg-cargoes.json` | `/lpg`'deki cbm ↔ ton dönüştürücüsünün yük listesi ve yoğunlukları (t/m³). |
| **FAQs** | `content/faqs.json` | Ana sayfa, `/tankers`, `/lpg` ve `/about` SSS'leri (FAQ JSON-LD dahil). |
| **Glossary** | `content/glossary.json` | `/glossary` terimleri ve grup başlıkları. |
| **Compliance** | `content/compliance.json` | `/compliance`: son gözden geçirme tarihi, tarama grupları, adımlar, SSS. |
| **Turkish Straits** | `content/turkish-straits.json` | `/turkish-straits`: tarih, kısa bilgiler, bölümler (paragraflar ve isteğe bağlı maddeler), SSS. |

### 3.1 Blog yazıları (Blog posts)

Kasım 2026'da 13 araştırma notu bloga taşındı: adresler aynı kaldı (`/research/<slug>` → `/blog/<slug>`, kalıcı 308 yönlendirme; `/research` → `/blog`, `/research/feed.xml` → `/blog/feed.xml`). Eski `Research notes` bölümü ve `content/research.json` kaldırıldı.

**Yeni yazı:** **Blog posts → Add**. Sol tarafta gövde editörü, sağda alanlar:

| Alan | Açıklama |
| --- | --- |
| **Title** / **URL slug** | Başlık; adres başlıktan otomatik üretilir (`/blog/<slug>`). Yayından sonra slug'ı değiştirmeyin. `category`, `page`, `feed`, `rss`, `tag`, `author` kullanılamaz (bunlar /blog altındaki sayfalardır). |
| **Draft** | İşaretliyse yazı yalnızca geliştirme sunucusunda (`npm run dev`) görünür, üstünde "Draft" etiketiyle; canlı sitede, sitemap'te, RSS'te ve `llms.txt`'de yer almaz. Yayına almak için işareti kaldırıp kaydedin. |
| **Search title** | İsteğe bağlı, en çok 60 karakter. Başlık 60 karakterden uzunsa doldurun (testler kontrol eder). |
| **Search summary** | Meta açıklama ve RSS özeti, en çok 160 karakter. |
| **Dek** | Başlığın altındaki tek cümle (yazı sayfası ve kartlar). |
| **Category** | Chartering guides, Route guides, Risk & regulation, Market notes, News. Kategori sayfası: `/blog/category/<kategori>`. |
| **Format label** | İsteğe bağlı kart etiketi (ör. *Risk brief*, *Route guide*, *Weekly outlook*); boşsa kategoriden gelir. |
| **Desk** | Tankers, LPG & ammonia veya ikisi; masa sayfalarındaki not şeritleri buna göre süzülür. |
| **Author** | Broker listesinden seçilir. Yeni bir broker önce **Brokers** bölümüne eklenmeli, sonra panel sayfası yenilenmeli. Yazar kartı ve JSON-LD'deki `Person` buradan gelir. |
| **Published** / **Last material revision** | Yayın ve (isteğe bağlı) önemli revizyon tarihi; sitemap `lastmod`, RSS ve `dateModified` bunları kullanır. Revizyon, yayından önce olamaz. |
| **Issue**, **Tags** | İsteğe bağlı sayı bilgisi ve etiketler (kapak etiketi, "Filed under", ilgili yazılar). |
| **Reading time** | Boş bırakılırsa metinden hesaplanır (dakikada ~220 kelime). Taşınan notlarda eski değer korundu. |
| **Summary only** + **Summary** | İşaretliyse sayfada özet ve "Full report on request" kutusu görünür; tam rapor e-postayla gönderilir. |
| **Key takeaways** | Yazının başındaki "Key takeaways" kutusu (2–4 kısa madde önerilir). |
| **Cover** | **Type-set cover** (varsayılan): büyük bir **Code** (rota kodu *TD3C*, sınıf *VLGC* veya koordinat *26°34′N*; en çok 12 karakter, **fiyat/navlun yazmayın**), altında küçük **Caption**; kontur çizgileri slug'dan üretilir, **Pattern** sayısı (1–9999) deseni değiştirir. **Photograph**: lisanslı medya kütüphanesinden bir kare seçin veya fotoğraf yükleyin (en az 1600 px genişlik), **Alt text** zorunlu. |
| **FAQ** | İsteğe bağlı soru-cevaplar; yazının sonunda açılır liste ve FAQPage JSON-LD olarak çıkar. |

**Gövde editörü** Markdoc yazar: paragraf, ara başlık (H2/H3; H2'ler soldaki "On this page" listesine girer), kalın/italik, madde ve numaralı liste, bağlantı, alıntı, tablo ve görsel araç çubuğundadır. **+** menüsündeki bileşenler:

- **Callout**: etiketli çerçeveli kutu (ör. *Practical takeaway*, *Update, October 2026*); isteğe bağlı site içi bağlantı (**Link: path** ör. `/compliance` ve **Link: text**, ikisi birlikte).
- **Pull quote**: metinden bir cümle, büyük italik serif; isteğe bağlı kaynak. Yazı başına en çok bir-iki tane.
- **Table with caption**: başlıklı tablo; içine araç çubuğundaki tablo ekleyin. İlk satır başlık, ilk sütun satır adıdır; geniş tablolar kendi içinde kayar.
- **Figure**: başlıklı ve isteğe bağlı kaynaklı görsel.

**Görseller** (kapak fotoğrafı, Figure ve gövdeye eklenen görseller) `public/images/blog/<slug>/` altına kaydedilir; JPG, PNG, WebP veya AVIF kullanın (HEIC değil). Yerelde çalışıyorsanız bu klasörü de commit edin. Yazıyı silince (**Delete entry…**) Keystatic görselleri de siler; boş kalan klasörü silebilirsiniz.

**Önizleme:** `npm run dev` açıkken yazının sayfası `http://localhost:3000/blog/<slug>` (panelde sağ üstteki dış bağlantı simgesi). Taslaklar da görünür; yeni dosyalar sunucuyu yeniden başlatmadan görünür.

### Broker fotoğrafı

Broker penceresinde **Photo → Choose file**. Kare, omuz hizasından, en az 240 × 240 px bir fotoğraf (JPG, PNG, WebP veya AVIF) seçin; iPhone'un HEIC biçimi tarayıcılarda görünmediği için kabul edilmez (derleme hata verir), önce JPG'ye çevirin. Dosya `public/images/brokers/<kısa-id>/photo.<uzantı>` olarak kaydedilir (kısa id addan otomatik üretilir). Fotoğraf varsa broker kartında ve `/brokers` JSON-LD'sinde görünür; yoksa baş harfli yuvarlak avatar kalır. **Remove** fotoğrafı kaldırır. Kişinin yayın için onayını almayı unutmayın.

## 4. Dikkat edilecekler

- **Slug'lar adrestir.** Blog yazısı, tanker ve LPG sınıfı slug'larını yayından sonra değiştirmeyin; eski bağlantılar 404 olur. Gerekirse eski adres için `next.config.mjs`'e yönlendirme eklenmelidir (geliştirici işi).
- **Yazar** listeden seçilir; bir broker silinirse onun yazıları derlemeyi durdurur (§5): önce yazıların yazarını değiştirin.
- **Strait of Hormuz yazısı** (`strait-of-hormuz-disruption-checklist-for-tanker-and-lpg-charterers`) rota tablolarından ve `/compliance`'tan bağlantılıdır; silinemez.
- Kapaklarda ve metinlerde canlı navlun, fiyat veya bunker rakamı vermeyin; tarihli piyasa yorumları yayın tarihine göre okunur.
- **Site URL** alanı yalnızca yedektir: Vercel'de `NEXT_PUBLIC_SITE_URL` tanımlıysa o kullanılır.
- **"Content last updated"** tarihini önemli bir içerik değişikliğinden sonra güncelleyin (sitemap, humans.txt, ai.txt bunu gösterir). Uyum ve Boğazlar sayfalarının kendi tarihleri var.

## 5. Doğrulama

Her içerik dosyası `lib/content/schemas.ts`'teki zod şemasıyla ve dosyalar arası kurallarla (`lib/content/validate.ts`) denetlenir:

- zorunlu alanlar dolu, seçimler geçerli, tarihler `YYYY-AA-GG`, WhatsApp numarası `+` ve rakam;
- sınıf, broker, dönüştürücü yükü ve Boğazlar bölümü kimlikleri tekil;
- blog yazıları: ön bilgi (frontmatter) şeması, Markdoc gövdesi (bilinmeyen bileşen, eksik zorunlu alan), slug biçimi ve ayrılmış adlar, yazar broker listesinde, revizyon tarihi yayından önce değil, kullanılan görseller `public/` altında mevcut;
- Hormuz yazısı mevcut.

Denetim iki yerde çalışır: **`npm test`** (`lib/content/content.test.ts` ve `lib/blog/blog.test.ts`; ayrıca Keystatic'in kendi okuyucusunun her dosyayı açabildiğini ve dosyaların Keystatic'in yazdığı biçimde olduğunu kontrol eder) ve **derleme sırasında** (`app/sitemap.ts` içindeki `assertValidContent()`). Kurala uymayan bir kayıt Vercel derlemesini durdurur; canlı site bozulmaz.

## 6. Kodda kalanlar

Panelden değil, kodda değişir:

- Marka renkleri, paylaşım görseli rotası ve dil kodu (`lib/site.ts`); avatar renk değerleri (`AVATAR_COLOR`) ve masa sırası (`TEAM_ORDER`, `lib/data/brokers.ts`).
- Seçim listeleri (`lib/content/options.ts`): masalar, ofis şehirleri (yeni bir ofis şehri brokerlara atanacaksa buraya eklenir), blog kategorileri ve masaları, sözlük grupları, tanker aileleri. Kategori açıklamaları (kategori sayfasının alt başlığı) `lib/blog/meta.ts`'te.
- Blog sayfalarının sabit metinleri (ör. "Notes from the desk.", masthead açıklaması) `lib/blog/meta.ts`'te.
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
| İçerik dosyaları | `content/*.json`, blog: `content/blog/*.mdoc` |
| Blog veri katmanı (yükleyici, Markdoc, kapaklar, RSS) | `lib/blog/` (`posts.ts`, `markdoc.ts`, `cover.ts`, `feed.ts`, `meta.ts`) |
| Blog sayfaları ve bileşenleri | `app/(site)/blog/`, `components/site/blog/` (`NotesStrip` ana sayfa şeridi) |
| Araştırma → blog taşıma betiği (tek seferlik) | `scripts/migrate-research-to-blog.ts`, eski veri: `lib/blog/__fixtures__/research-legacy.json` |
| zod şemaları, doğrulama, yardımcılar | `lib/content/schemas.ts`, `validate.ts`, `format.ts`, `options.ts` |
| Yükleyiciler (dışa aktarılan adlar ve tipler değişmedi) | `lib/site.ts`, `lib/data/*.ts` |
| Testler | `lib/content/content.test.ts`, `keystatic.test.ts`, `setup-notice.test.tsx`, `lib/blog/blog.test.ts` |

- Yükleyiciler JSON'u **statik olarak** içe aktarır (çalışma zamanında dosya okuma yok, async yok); istemci bileşenleri (`Nav`, `FloatingContact`, `LpgConverter`, `InquiryForm`, `ErrorView`, `global-error`) aynı modülleri kullanmaya devam eder. zod yalnızca testlerde ve sunucu tarafında (sitemap) çalışır, istemci paketlerine girmez.
- Keystatic boş metin alanlarını JSON'a yazmaz; yükleyiciler eksik anahtarı "yok" kabul eder (ör. `seoTitle`, `updated`, `photo`). Boş tablo hücresi `null` olarak yazılır, sayfaya `""` olarak gelir.
- JSON dosyaları Keystatic'in yazdığı biçimdedir (`JSON.stringify(…, null, 2)`); `.prettierignore` bu yüzden `content`'i hariç tutar. Elle düzenlerken de bu biçimi koruyun; test kontrol eder.
- Yeni bir alan eklemek: `keystatic.config.ts` + `lib/content/schemas.ts` + ilgili yükleyici + `content/*.json`, sonra `npm test`.
- Blog yazıları JSON değil: `lib/blog/posts.ts` `content/blog/*.mdoc` dosyalarını derleme sırasında okur (geliştirme sunucusunda dosya değişince yeniden). Ön bilgi Keystatic'in biçimindedir (js-yaml `dump`, tarihler tırnaksız); gövde `Markdoc.format` biçimindedir. Markdoc bileşenlerinin özellikleri `keystatic.config.ts` (`blogComponents`) ile `lib/blog/markdoc.ts` (`BLOG_TAGS`) arasında aynı olmalı; test kontrol eder. Yeni bir bileşen iki yere de eklenir, `blog.css`'e stili yazılır.
- `lib/data/research.ts` eski `Report` biçimini (masa ve sınıf sayfalarındaki `ReportCard` için) bloğa dayalı olarak sürdürür; yeni kod `lib/blog/posts.ts` kullanmalı.
