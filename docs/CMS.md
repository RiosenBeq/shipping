# OBM Shipping: İçerik yönetim paneli (Keystatic)

Sitedeki bütün liste ve metin verileri (**ana sayfa — bölümlerin sırası dahil**, **medya kütüphanesi — videolar, posterler, fotoğraflar**, şirket ve iletişim bilgileri, brokerlar, **blog yazıları**, SSS'ler, sözlük, tanker ve LPG sınıfları, LPG dönüştürücü yoğunlukları, uyum ve Türk Boğazları sayfaları) artık **`/keystatic`** adresindeki yönetim panelinden eklenip düzenlenebilir.

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
2. **Deployed App URL** alanına canlı sitenin adresini yazın (ör. `https://obmshipping.example`). Böylece canlı sitenin giriş dönüş adresi (`/api/keystatic/github/oauth/callback`) uygulamaya eklenir. Uygulama bir GitHub organizasyonunda olacaksa organizasyon adını da girin.
3. **Create GitHub App** → GitHub'da uygulamaya bir ad verin (ör. `obmshipping-cms`) ve oluşturun.
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
| `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | Uygulamanın GitHub'daki kısa adı (ör. `obmshipping-cms`) |

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
| **Pages → Homepage** | `content/home.json` | İngilizce ana sayfa (`/`): hero ve altındaki bölümlerin **sırası**, görünürlüğü ve tüm metinleri; 10 dilin ana sayfaları sırayı ve görünürlüğü buradan alır. Ayrıntılar §3.2. |
| **Media → Media library** | `content/media.json` | Sahnenin altı video plakası (ana sayfa, masa sayfaları, Boğazlar, iletişim, footer, 404) ve dokuz fotoğraf (masa satırları, rotalar, ofis pencereleri, iç sayfalar, blog kapakları): yükleme veya başka siteden bağlantı, derecelendirme, kadraj. Ayrıntılar §3.3. |
| **Site settings** | `content/site.json` | Şirket adı, slogan, açıklama, site adresi, tüzel kişilik, kuruluş yılı, "içerik güncellendi" tarihi; ana e-posta, telefon, WhatsApp (wa.me bağlantısı için `+905…` biçiminde) ve görünen hali; çalışma saatleri; masa e-postaları (tanker, LPG, araştırma); adres ve harita konumu; ofisler; X/Twitter ve LinkedIn. Üst menü, alt bilgi, iletişim sayfası, yüzen iletişim düğmesi, hata sayfaları, JSON-LD, `llms.txt`, `humans.txt`, `ai.txt`, `security.txt`. |
| **Brokers** | `content/brokers.json` | Her broker: ad, unvan, masa, ofis, uzmanlık etiketleri, diller, baş harfler, avatar rengi (masa şefi: pirinç, broker: lacivert) ve **isteğe bağlı fotoğraf**. Sıra, `/brokers` ve ana sayfalardaki sıradır. Altta masa adları. |
| **Blog posts** | `content/blog/<slug>.mdoc` (yazı başına bir dosya) | `/blog` (ana sayfa, kategori sayfaları, sayfalama), yazı sayfası `/blog/<slug>`, ana sayfadaki "Notes from the desk" şeridi, masa ve sınıf sayfalarındaki not kartları, tam metinli RSS (`/blog/feed.xml`), `llms.txt` / `llms-full.txt`, sitemap, JSON-LD (Blog, BlogPosting, BreadcrumbList). Ayrıntılar §3.1. |
| **Guides** | `content/guides/<slug>.mdoc` (sayfa başına bir dosya) | `/guides` (rehber ana sayfası) ve `/guides/<slug>`: İngilizce ve Türkçe rehberler ve masa (hizmet) sayfaları; sitemap, `llms.txt` / `llms-full.txt`, paylaşım görselleri (`/og/guides/<slug>`), masa ve sınıf sayfalarındaki "Related" bağlantıları. Ayrıntılar §3.5. |
| **Tanker classes** | `content/tanker-classes.json` | `/tankers` ve `/tankers/<sınıf>`: teknik değerler, rotalar (Hormuz işaretiyle), pazarlar, eğilimler, kiralama şekli, sorumlu masa. |
| **LPG classes** | `content/lpg-classes.json` | `/lpg` ve `/lpg/<sınıf>`: kapasite, yük, rotalar, ticaretler, dikkat noktaları, sınıfa özel SSS. |
| **LPG converter cargoes** | `content/lpg-cargoes.json` | `/lpg`'deki cbm ↔ ton dönüştürücüsünün yük listesi ve yoğunlukları (t/m³): kaynama noktasında (soğutmalı taşıma) ve isteğe bağlı 15 °C'de (tam basınçlı taşıma; navlun hesaplayıcının pressurised sınıfı bunu kullanır). |
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

### 3.2 Ana sayfa (Homepage)

**Pages → Homepage** iki kısımdan oluşur:

1. **Hero (always first)** — sayfanın ilk ekranı; her zaman en üstte. Alanlar: rail adı, **Footage** (hero'nun arkasındaki video plakası; altı plakadan biri, ne oynattığı Media library'de), başlık (h1; en çok 48 karakter, en çok 3 satır — satırı bölmek istediğiniz yerde Enter), vurgu kelimesi (başlıkta geçen ve pirinç renkte yazılan kelime, ör. *Bosphorus.*), alt satır, giriş, iki düğme metni ve sağ alttaki mono sahne etiketi.
2. **Sections (drag to reorder)** — hero'dan sonra gelen bölümler, **yukarıdan aşağı sayfadaki sırayla**. Sol tutamaçtan sürükleyerek sırayı değiştirin; satıra tıklayıp bölümün metnini düzenleyin; **Show …** kutusunun işaretini kaldırmak bölümü metni silinmeden gizler (listede "(hidden)" yazar). Çöp kutusu bölümü listeden kaldırır (metni de gider); **Add** ile kaldırılmış bir bölüm geri eklenir (metni yeniden yazılır). Her bölüm türü en fazla bir kez kullanılabilir.

| Bölüm | Ne düzenlenir | Notlar |
| --- | --- | --- |
| Who we are | Alt satır, kaydırdıkça dolan cümle (h2, ≤ 220), /about bağlantı metni, sonar etiketi, sahne etiketi, **tam 4 madde** (ikon, başlık, satır, bağlantı), isteğe bağlı uyum satırı | Arka plan batimetri çizgileri (P-bathy). |
| Desks & services | Başlık (Enter ile iki satır), giriş, **tam 4 satır** (başlık, giriş ≤ 140, bağlantı, sınıf çipleri, fotoğraf, alt yazı), **Estimate a voyage** kartı | Kart `/freight-calculator`'a gider; "Show the calculator card" ile gizlenir. Fotoğraflar Media library'den seçilir. |
| Ships we fix | Başlık, sekme adları, kart bağlantı metni, **her karttaki hesaplayıcı bağlantı metni** | 9 sınıf kartı Tanker/LPG classes'tan gelir; her kart `/freight-calculator?class=<sınıf>` bağlantısı taşır. |
| How we work | **Footage** (reel plakası), başlık, **tam 4 adım** | Kâğıttan tam ekrana açılan video penceresi. |
| Reach | Başlık, **tam 4 sayaç** (yalnız sabit sayılar; para birimi, oran, yüzde yazılamaz), **tam 6 rota** (kod, satır, bağlantı, fotoğraf) | Ofis saatleri Site settings → Offices'taki saat dilimlerinden. |
| Team | Başlık, giriş, /brokers bağlantı metni | Kartlar Brokers'tan. |
| Notes + FAQ | Başlık, gösterilen yazı sayısı (1–6), SSS başlığı ve soru sayısı (0 gizler) | Yazılar blogdan, sorular FAQs → Home page'den; altında blog kategorilerine bağlantılar. |
| Contact letter | **Footage**, mektup etiketi, başlığı ve satırı, düğme | E-posta, masa hatları ve nöbetçi hattı Site settings'ten. |

**Rail ve numaralar** sırayı izler: soldaki rail'in durakları ve sahne etiketlerindeki "02 / 09" sayıları sıra veya görünürlük değişince kendiliğinden güncellenir. Sahne, sayfadaki pencerelere göre hangi videonun ne zaman yükleneceğine kendisi karar verir; sıralama için başka bir ayar gerekmez.

**Sınırlar** panelde sayaçla gösterilir ve kayıttan önce denetlenir; ayrıca `npm test` ve derleme sırasında yeniden denetlenir (§5). Bağlantılar (madde, satır, rota) var olan bir sayfaya gitmelidir: `/tankers`, `/lpg/vlgc`, `/blog/<slug>`, `/blog/category/<kategori>`, `/freight-calculator` gibi.

**10 dil:** `/zh`, `/de`, `/ar`… sayfaları aynı sırayı ve görünürlüğü kullanır; metinleri `lib/i18n.ts`'tedir (geliştirici işi). Panelde İngilizce bir metni değiştirmek yerel sayfaları değiştirmez.

### 3.3 Medya kütüphanesi (Media library)

**Media → Media library**, sitenin arkasındaki altı video plakasını ve dokuz fotoğrafı yönetir. **Bir kaydın bütün alanları boşsa sitede gelen lisanslı dosya kullanılır** (kaynaklar `docs/MEDIA-CREDITS.md`). Bir plakayı değiştirmek, o plakayı kullanan her sayfayı değiştirir:

| Plaka | Nerede |
| --- | --- |
| V-hero | Ana sayfa hero'su (varsayılan), `/tankers` başlığı |
| V-gas | `/lpg` başlığı |
| V-reel | Ana sayfa "How we work" penceresi |
| V-strait | `/turkish-straits` başlığı |
| V-night | Ana sayfa mektubu, `/contact` |
| V-ocean | Footer (her sayfa), 404 |

Ana sayfada hangi bölümün hangi plakayı kullandığı Homepage → **Footage** alanlarından seçilir.

**Bir plakanın alanları:**

- **Video file (upload)** — MP4 (H.264) veya WebM, **sessiz**, 8–20 sn döngü, 1920×1080, en çok ~10 MB. Dosya `public/media/uploads/plates/<plaka>/videoFile.<uzantı>` olarak kaydedilir (yerelde bu klasörü de commit edin). Daha büyük dosyalar için bağlantı kullanın; GitHub modunda çok büyük dosyalar kaydedilemeyebilir.
- **…or video link** — başka bir sitedeki **doğrudan video dosyasının** https adresi (`.mp4`, `.webm`, `.m4v`, `.mov` ile biten; sonunda `?…` sorgu olabilir). YouTube/Vimeo izleme sayfaları dosya değildir, kabul edilmez. Yükleme ile bağlantı aynı anda doldurulamaz.
- **Phone video** (isteğe bağlı) — telefonlar için dikey 720×1280 kesim (yükleme veya bağlantı). Boşsa telefon ana videoyu (veya gelen dikey dosyayı) oynatır.
- **Poster** (isteğe bağlı) — videonun ilk karesi, JPG/WebP, 1600 px genişlik; video başlamadan ve hareket kapalıyken görünür, hero'da sayfanın ilk görseli (LCP) budur. Boşsa: gelen videoda gelen poster; yeni videoda **videonun ilk karesi** gösterilir (yüklenene kadar lacivert zemin). Hızlı ilk açılış için yeni videoya poster eklemeniz önerilir.
- **Grade** — her karenin geçtiği renk işlemi: *dawn* (lacivertten kuma, hero), *day*, *dusk* (pirinç ışıklar), *night*, *deep* (koyu deniz). Aynı plakanın posteri ve videosu aynı derecelendirmeden geçer. *None — original colours (testing only)* videoyu (ve posterini) kendi renkleriyle gösterir: başka çekimleri olduğu gibi karşılaştırmak için; yayında kullanmayın — tasarımda görüntü hiçbir zaman ham gösterilmez ve metin kontrastı derecelendirmeye göre ölçüldü.
- **Focal point (%)** — ekran görüntüyü kırptığında görünür kalacak nokta: soldan (0) sağa (100) ve yukarıdan (0) aşağıya (100). İkisi birlikte doldurulur. Boşsa: gelen videonun kendi odağı, yeni videoda merkez. **Phone focal** dikey dosyanın karesinde.
- **Mirror** — *As shipped* (gelen dosyanın ayarı; yeni videoda kapalı), *Mirror*, *Never mirror*. Yalnız kara, yazı veya logo olmayan açık deniz görüntülerinde aynalayın.
- **Horizon (%)** — ufkun karedeki yüksekliği (masaüstünde ekranın iki yanındaki ince çizgi onu izler). Boşsa gelen videonun değeri; yeni videoda çizgi yok.
- **Credit**, **Licence URL** — yeni dosyanın kaynağı ve lisans sayfası (yayından önce doldurun).

**Fotoğraflar** (tankerBow, galata, portDusk…): **Image** (yükleme, `public/media/uploads/stills/<ad>/imageFile.<uzantı>`) veya **…or image link** (https, `.jpg/.png/.webp/.avif`), yeni görselde **Alt text** zorunlu, Grade (gelen fotoğraf kendi derecelendirmesiyle gelir; başka bir ön ayar seçilirse ham dosya o derecelendirmeyle gösterilir), Focal point, Credit, Licence URL. Fotoğrafın nerede kullanıldığı Homepage → masa satırları ve rotalarda seçilir; iç sayfalar ve blog kapakları da aynı kayıtları kullanır.

#### Başka sitelerden video ile test etmek

Siteyi başka videolarla denemek için (ör. referans sitelerdeki çekimler) yalnız **bağlantıyı** yapıştırmanız yeterli; dosyayı indirip depoya eklemeyin:

1. Tarayıcıda videonun oynadığı sayfayı açın, geliştirici araçlarında (**F12 → Network → Media**) oynayan `.mp4`/`.webm` dosyasının adresini kopyalayın (sayfanın adresini değil).
2. **Media library → ilgili plaka → …or video link** alanına yapıştırın, **Save**. Yerelde sayfayı yenileyin; canlıda Vercel yeniden yayınlayınca görünür.
3. Geri almak için alanı boşaltıp kaydedin: lisanslı dosya geri gelir.

Bu yalnız **test** içindir: başkasının videosunu canlı sitede yayınlamadan önce hak sahibinden izin alın veya lisanslı bir dosya kullanın; Credit ve Licence URL alanlarını doldurun.

**Neden bazı videolar "düz" oynar (CORS).** Sahne videoyu WebGL ile çizer (derecelendirme, metin altındaki sakin bölgeler, gren, geçişler). Tarayıcı, başka bir sitedeki dosyanın WebGL'de kullanılmasına ancak o site `Access-Control-Allow-Origin` başlığıyla izin verirse göz yumar. Site bu yüzden yeni bağlantıları açılışta kendisi dener:

- **İzin varsa** (çoğu CDN, ör. Mixkit, Pexels, Cloudinary, S3/CloudFront'ta CORS açıksa): video sahnenin içinden oynar.
- **İzin yoksa** (çoğu kurumsal site, WordPress yüklemeleri) veya dosya WebGL'de açılamazsa: sayfa poster moduna geçer ve videoyu **düz bir `<video>` öğesi** olarak, aynı derecelendirmenin SVG filtresi ve metin altındaki koyu katmanlarla oynatır (tarayıcı konsolunda bir CORS uyarısı görünmesi normaldir; `<html data-stage-why="remote-media">`). Sayfanın diğer WebGL efektleri (batimetri çizgileri, 3B gemi planı) o sayfada durağan görsellere döner.
- **Dosya hiç açılamazsa** (yanlış adres, silinmiş dosya, desteklenmeyen biçim): poster, yoksa lacivert zemin görünür — siyah ekran olmaz.
- Hareketi azalt tercihi, "Pause motion", veri tasarrufu veya yavaş bağlantıda videolar oynamaz; poster (posteri yoksa ilk kare) görünür.

Not: ileride siteye bir Content-Security-Policy eklenirse (§7, PR #3) başka sitelerden video ve görsel için `media-src` ve `img-src` izinleri de eklenmelidir.

### 3.4 Navlun hesaplayıcı (Freight calculator)

`/freight-calculator` bir sefer tahmini (voyage estimate) yapar: balast, yüklü ve isteğe bağlı dönüş balast bacakları; Türk Boğazları ve kanallar; VLSFO/MGO; liman masrafları, komisyonlar ve AB ETS → TCE, başabaş navlun (breakeven) ve duyarlılık tablosu. Ters modda hedef TCE için gereken navlunu bulur. Sayfanın açıldığı bütün başlangıç değerleri **Tools → Freight calculator data** ekranından (`content/freight.json`) düzenlenir. Ziyaretçi her değeri kendi hesabı için değiştirebilir; panel yalnızca başlangıç değerlerini ve referans fiyatları belirler.

| Alan | Ne işe yarar |
| --- | --- |
| **Note next to the reference prices** | Fiyatların yanında ve "How the estimate is built" bölümünde **ziyaretçilere** görünen not. Gelen dosyada "Example values, not live market prices." yazar (örnek değerler). Gerçek referans fiyatları girdiğinizde notu da değiştirin, ör. "Desk reference prices, Rotterdam–Fujairah–Singapore average." Buraya editöre yönelik not yazmayın: "admin", "Keystatic", "TODO" gibi ifadeler içeren bir notu doğrulama (validate) hata olarak bildirir. |
| **Sources and method** | Mesafelerin ve masrafların kaynağı; sayfadaki "How the estimate is built" bölümünde ve `llms-full.txt`'de görünür. |
| **Flag prices older than (days)** | "As of" tarihi bundan eski bir fiyat sayfada uyarıyla ("check it") gösterilir (varsayılan 30 gün). Fiyatın yaşı ziyaretçinin o günkü tarihine göre hesaplanır, yani sayfa yeniden yayınlanmasa da eskiyen fiyat işaretlenir. |
| **Bunker prices** | VLSFO, MGO ve HSFO ($/t) ve her birinin **As of** tarihi. Tarih fiyatın yanında yazar; fiyatı güncellerken tarihi de güncelleyin. |
| **EU ETS** | EUA fiyatı (€/t CO₂) ve tarihi, EUR/USD kuru ve tarihi, **Phase-in**: yılın emisyonlarının teslim edilen payı (2024 %40, 2025 %70, 2026'dan itibaren %100). |
| **Calculator defaults** | Sayfanın açıldığı gemi sınıfı, hava payı (%, deniz süresine eklenir), adres komisyonu ve brokerage (%), liman başına ek süre (saat; liman süresi yükleme hızından hesaplanırken eklenir: NOR, yanaşma, evrak), gaz gemileri için doldurma sınırı (%), **tam basınçlı (pressurised) gemiler için doldurma sınırı** (%; yük ortam sıcaklığında taşınır, IGC yükleme sınırı propan için yaklaşık %88), AB ETS kapsamı (Auto = limanlara göre; 5.000 GT altındaki sınıflar bu ayardan bağımsız olarak %0 ile açılır). |
| **Class presets** | 9 sınıfın her biri için DWT, kapasite (tanker: ton, gaz gemisi: cbm), **tam boy (LOA, m)** (200 m altındaki gemilere Türk Boğazları'nın yalnız gündüz ve tek yönlü geçiş kuralı uygulanmaz: geçişin küçük gemi beklemesi kullanılır), **gros tonaj (GT)** (5.000 GT altı AB ETS ve MRV dışındadır: sınıf %0 ETS ile açılır), yüklü/balast hız, tüketimler (yüklü, balast, limanda yük operasyonu, beklemede), ana yakıt, **port and passage cost factor** (liman ve geçiş masrafları Aframax boyu için girilir, her sınıf bu katsayıyla ölçekler: VLCC 2.4, MR 0.55 gibi), liman günü, yükleme hızı (t/saat), örnek demuraj ($/gün), varsayılan yük (t), gaz yükü (yalnız gaz gemileri, ör. `propane`), **örnek navlun ($/t)** ve tipik rota (açık pozisyon, yükleme ve tahliye limanı). Sınıf sayfalarındaki "Estimate a voyage for this class" bağlantısı hesaplayıcıyı bu rotayla açar. |
| **Ports** | **Id** (mesafelerde ve preset'lerde kullanılır; kullanıldıktan sonra değiştirmeyin), ad, ülke kodu, bölge (açılır listedeki grup), enlem/boylam (mesafe denetimi için), **EU / EEA port** (AB ETS: AB'ye giriş veya çıkış seferi %50, AB limanları arası ve AB rıhtımında %100), **0.10% S fuel at berth** (rıhtımda MGO: ECA limanları, AB limanları, Türkiye), Aframax boyu liman masrafı ($) ve isteğe bağlı not (liman seçilince altında görünür, ör. yaptırım uyarısı). |
| **Passages** | Boğazlar ve kanallar: Aframax boyu yüklü ve balast maliyet ($), beklenen bekleme/gecikme (gün) ve isteğe bağlı **Waiting, ships under 200 m** (200 m altı gemiler için bekleme; Türk Boğazları'nda gelen değerler 0,25 / 0,15 / 0,1 gün; boyun fark etmediği geçişlerde boş bırakın); not geçişin altında görünür. Bab el-Mandeb ve Hormuz 0 maliyetle gelir: savaş riski ek primini (AWRP) maliyet olarak girebilirsiniz. |
| **Distances** | Liman çiftleri arası deniz mesafesi (nm). Her çift bir kez yazılır; hesaplayıcı iki yönde de okur. Aynı çift için iki rota (ör. Süveyş ve Ümit Burnu) farklı **Via** ile iki satırdır: hesaplayıcı geminin kullanabildiği en kısa rotayla açar (yüklü VLCC Süveyş'ten, hiçbir VLCC Panama'dan geçemez; bu kural kodda), diğerini seçtirir. **Passages**: rotadaki geçiş id'leri, From limanından başlayarak sırayla ve virgülle (ör. `turkish-straits, gibraltar`). **ECA share**: rotanın SOx Emisyon Kontrol Alanları içindeki yüzdesi (bu kısımda MGO yakılır; Akdeniz 1 Mayıs 2025'ten beri ECA). |

**Gelen değerler örnektir.** Fiyatlar 6 Kasım 2026 tarihli örnek değerlerdir; mesafeler OBM Shipping'in standart deniz yolu noktaları (trafik ayırım şemaları, burunlar, boğazlar, kanal girişleri) arasındaki büyük daire bacaklarından hesaplanmıştır ve yaygın tablolarla yaklaşık ±%2 uyuşur; liman ve geçiş masrafları da örnektir. Canlıya almadan önce fiyatları ve tarihlerini, notu ve masrafları güncelleyin. Worldscale düz fiyatları (flat rate) Worldscale Association lisansıyla yayımlandığı için sitede yoktur; ziyaretçi kendi tablosundan girer.

**Bir fiyatı güncellemek:** **Tools → Freight calculator data → Bunker prices → VLSFO 0.50% S** altında **Price** ve **As of**'u değiştirin, **Save**. `/freight-calculator` yenilendiğinde yeni fiyat, tarihi ve "x days ago" görünür. "Copy link" ile paylaşılmış hesaplar kendi fiyatlarını taşıdığından değişmez; adres çubuğundaki bağlantıda ziyaretçinin değiştirmediği fiyatlar güncel referansla açılır.

**Kurallar** (kayıttan sonra `npm test` ve derleme sırasında denetlenir, §5): id'ler tekil; preset'lerin ve mesafelerin andığı her liman ve geçiş listede olmalı; bir mesafe iki limanın enlem/boylamından hesaplanan büyük daire mesafesinden kısa olamaz (yanlış yazılmış bir rakamı yakalar); aynı çift aynı **Via** ile iki kez yazılamaz; gaz yükü **LPG converter cargoes** listesinde olmalı. Bir limanı silmeden önce onu kullanan mesafe ve preset satırlarını silin veya değiştirin. Kodda kalanlar: yakıtların emisyon katsayıları (VLSFO 3.151, MGO 3.206, HSFO 3.114 t CO₂/t), kanal sınırları ve hesap yöntemi (`lib/freight/`).

### 3.5 Rehberler (Guides)

Google'da aranan sorulara cevap veren kalıcı sayfalar: rehberler (ör. *How to charter a tanker*) ve bir pazar ya da yük için masa sayfaları (ör. *Tanker kiralama*). **Guides → Add** ile yeni sayfa açılır; gövde editörü blogdakiyle aynıdır (Callout, Table with caption, Figure, Pull quote).

| Alan | Açıklama |
| --- | --- |
| **Title** / **URL slug** | Sayfanın h1'i; aranan soruyu arayanın kelimeleriyle söyleyin. Adres `/guides/<slug>`; Türkçe sayfalarda slug'da ç, ğ, ı, ö, ş, ü kullanmayın (`tanker-kiralama`). Yayından sonra değiştirmeyin. |
| **Search title** / **Search summary** | Google başlığı (en çok 60 karakter; 45 karakteri geçmezse sonuna "· OBM Shipping" eklenir) ve 140–160 karakterlik açıklama. Her sayfada farklı olmalı. |
| **Lead** | Başlığın altındaki bir-iki cümle. |
| **Target search query** / **More keywords** | Sayfanın hedeflediği arama (ör. `tanker kiralama`); görünmez, anahtar kelime olarak kullanılır. |
| **Page type** | *Guide* (rehber, TechArticle) veya *Service page* (masa sayfası; ayrıca Service JSON-LD). |
| **Language** | English veya Türkçe. Türkçe sayfalar `lang="tr"` ve Türkçe arayüz metinleriyle (içindekiler, SSS, düğmeler, kapanış mektubu) yayımlanır. |
| **Same page in the other language** | Yalnızca gerçek karşılığı varsa (aynı konu, aynı cevaplar). İki sayfa birbirine hreflang ile bağlanır; birinde seçmek yeterli. |
| **Desk** / **Cargo on the inquiry form** | Düğmelerin yazdığı masa e-postası ve talep formunda önceden seçilen yük. |
| **Author** / **Published** / **Last reviewed** | İmza (broker listesinden) ve tarihler. Sayfayı her kontrol ettiğinizde **Last reviewed**'u güncelleyin; sitemap `lastmod` buradan gelir. |
| **Link to this page from** | Sayfaya bağlantı verecek mevcut sayfalar (masa sayfaları, Turkish Straits, sınıf sayfaları): bağlantı onların "Related" listesinde en başta çıkar. |
| **Related guides** | Sayfanın sonundaki "Related guides" kartları (boşlukları aynı masa ve dildeki rehberler doldurur). |
| **FAQ** | 4–6 soru-cevap; sayfada açılır liste ve FAQPage JSON-LD. |
| **Closing letter** | İsteğe bağlı kapanış başlığı ve metni; boşsa dile göre varsayılan metin. |

**Yazım kuralları** (testler kontrol eder, §5): gövde, sorunun cevabıyla (2–3 cümle) açılır; ara başlıkların (H2) çoğu soru biçimindedir; rehberler 900–1.600, masa sayfaları 600–900 kelime; uydurma navlun, liman ölçüsü, istatistik veya mevzuat yazılmaz; bir rakam önemliyse nasıl belirlendiği anlatılır ya da resmi kaynak adıyla anılır. Gövdedeki site içi bağlantılar var olan bir sayfaya gitmelidir; yoksa derleme hata verir.

**Önizleme:** `npm run dev` açıkken `http://localhost:3000/guides/<slug>`. **Draft** işaretli sayfalar yalnızca geliştirme sunucusunda görünür.

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
- Hormuz yazısı mevcut;
- ana sayfa: hero başlığı ≤ 48 karakter ve ≤ 3 satır, cümle ≤ 220, satır girişi ≤ 140, sayaç alt yazısı ≤ 48; sayaçlarda, rota kodlarında ve hesaplayıcı kartında **para birimi, oran, yüzde yok**; vurgu kelimesi başlıkta geçmeli; her bölüm türü en fazla bir kez; maddeler 4, satırlar 4, adımlar 4, sayaçlar 4, rotalar 6; tüm bağlantılar var olan sayfalara;
- medya kütüphanesi: bağlantılar https ve doğrudan dosya (video: `.mp4/.webm/.m4v/.mov`, görsel: `.jpg/.png/.webp/.avif`), yükleme ile bağlantı aynı anda yok, odak değerleri 0–100 ve ikisi birlikte, yeni fotoğrafta alt metin, yüklenen dosyalar `public/` altında mevcut.

Denetim iki yerde çalışır: **`npm test`** (`lib/content/content.test.ts` ve `lib/blog/blog.test.ts`; ayrıca Keystatic'in kendi okuyucusunun her dosyayı açabildiğini ve dosyaların Keystatic'in yazdığı biçimde olduğunu kontrol eder) ve **derleme sırasında** (`app/sitemap.ts` içindeki `assertValidContent()`). Kurala uymayan bir kayıt Vercel derlemesini durdurur; canlı site bozulmaz.

## 6. Kodda kalanlar

Panelden değil, kodda değişir:

- Marka renkleri, paylaşım görseli rotası ve dil kodu (`lib/site.ts`); avatar renk değerleri (`AVATAR_COLOR`) ve masa sırası (`TEAM_ORDER`, `lib/data/brokers.ts`).
- Seçim listeleri (`lib/content/options.ts`): masalar, ofis şehirleri (yeni bir ofis şehri brokerlara atanacaksa buraya eklenir), blog kategorileri ve masaları, sözlük grupları, tanker aileleri. Kategori açıklamaları (kategori sayfasının alt başlığı) `lib/blog/meta.ts`'te.
- Blog sayfalarının sabit metinleri (ör. "Notes from the desk.", masthead açıklaması) `lib/blog/meta.ts`'te.
- İç sayfa metinleri (başlıklar, giriş paragrafları) `app/(site)/…` sayfalarında; ana sayfanın İngilizce metni ve sırası panelde (§3.2), 10 dilin ana sayfa metni `lib/i18n.ts`'te; sayfa kataloğu `lib/pages.ts`'te.
- Ana sayfa bölüm türleri (yeni bir bölüm türü eklemek geliştirici işidir: `lib/content/options.ts` → `HOME_BLOCK_KINDS`, şema, panel ve bileşen), plakalar ve derecelendirme ön ayarları.

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
| Panel şeması (alanlar, etiketler, menü) | `keystatic.config.ts`; Homepage ve Media library: `lib/content/keystatic-home.ts` (config'e yayılır) |
| Ana sayfa ve medya şemaları (zod) | `lib/content/home-schema.ts` |
| Ana sayfa yükleyicisi (bölüm sırası) ve görünüm | `lib/data/home.ts`, `components/site/home/view.ts` |
| Medya kütüphanesinin uygulanması (sevkiyat manifestosu + kayıtlar) | `lib/media.ts` (`videos`, `stills`; ham manifesto `shippedVideos`, `shippedStills`) |
| Başka sitedeki videolar: CORS denemesi, düz `<video>` yedeği, SVG derecelendirme | `components/site/stage/runtime.ts`, `gl/compositor.ts`, `GradeFilters.tsx`; sözleşme `docs/STAGE.md` §12 |
| Depolama modu ve GitHub değişkenleri | `lib/content/storage.ts` |
| Panel sayfası, kurulum notu, kök düzen | `app/keystatic/` |
| Keystatic API | `app/api/keystatic/[...params]/route.ts` |
| İçerik dosyaları | `content/*.json`, blog: `content/blog/*.mdoc` |
| Blog veri katmanı (yükleyici, Markdoc, kapaklar, RSS) | `lib/blog/` (`posts.ts`, `markdoc.ts`, `cover.ts`, `feed.ts`, `meta.ts`) |
| Blog sayfaları ve bileşenleri | `app/(site)/blog/`, `components/site/blog/` (`NotesStrip` ana sayfa şeridi) |
| Araştırma → blog taşıma betiği (tek seferlik) | `scripts/migrate-research-to-blog.ts`, eski veri: `lib/blog/__fixtures__/research-legacy.json` |
| zod şemaları, doğrulama, yardımcılar | `lib/content/schemas.ts`, `validate.ts`, `format.ts`, `options.ts` |
| Yükleyiciler (dışa aktarılan adlar ve tipler değişmedi) | `lib/site.ts`, `lib/data/*.ts` |
| Testler | `lib/content/content.test.ts`, `keystatic.test.ts`, `setup-notice.test.tsx`, `lib/blog/blog.test.ts`, `components/site/home/home.test.ts` (ana sayfa), `lib/media.test.ts` (medya kütüphanesi) |

- Yükleyiciler JSON'u **statik olarak** içe aktarır (çalışma zamanında dosya okuma yok, async yok); istemci bileşenleri (`Nav`, `FloatingContact`, `LpgConverter`, `InquiryForm`, `ErrorView`, `global-error`) aynı modülleri kullanmaya devam eder. zod yalnızca testlerde ve sunucu tarafında (sitemap) çalışır, istemci paketlerine girmez.
- Keystatic boş metin alanlarını JSON'a yazmaz; yükleyiciler eksik anahtarı "yok" kabul eder (ör. `seoTitle`, `updated`, `photo`). Boş tablo hücresi `null` olarak yazılır, sayfaya `""` olarak gelir.
- JSON dosyaları Keystatic'in yazdığı biçimdedir (`JSON.stringify(…, null, 2)`); `.prettierignore` bu yüzden `content`'i hariç tutar. Elle düzenlerken de bu biçimi koruyun; test kontrol eder.
- Yeni bir alan eklemek: `keystatic.config.ts` + `lib/content/schemas.ts` + ilgili yükleyici + `content/*.json`, sonra `npm test`.
- Blog yazıları JSON değil: `lib/blog/posts.ts` `content/blog/*.mdoc` dosyalarını derleme sırasında okur (geliştirme sunucusunda dosya değişince yeniden). Ön bilgi Keystatic'in biçimindedir (js-yaml `dump`, tarihler tırnaksız); gövde `Markdoc.format` biçimindedir. Markdoc bileşenlerinin özellikleri `keystatic.config.ts` (`blogComponents`) ile `lib/blog/markdoc.ts` (`BLOG_TAGS`) arasında aynı olmalı; test kontrol eder. Yeni bir bileşen iki yere de eklenir, `blog.css`'e stili yazılır.
- `lib/data/research.ts` eski `Report` biçimini (sınıf sayfalarındaki ilgili notlar ve Hormuz notu bağlantısı için) bloğa dayalı olarak sürdürür; yeni kod `lib/blog/posts.ts` kullanmalı.
