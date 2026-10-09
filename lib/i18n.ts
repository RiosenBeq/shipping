/**
 * Localized landing pages for the major shipping markets.
 *
 * The full site is in English. Each locale below gets one translated landing
 * page at /{code} (e.g. /zh, /el, /no) that summarises both desks and links
 * into the English desk pages. hreflang alternates connect all of them.
 *
 * Translations should be reviewed by a native speaker before launch.
 */

export type Dictionary = {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  eyebrow: string;
  h1: string;
  lead: string;
  ctaInquiry: string;
  desksEyebrow: string;
  desksTitle: string;
  desksIntro: string;
  tankerDesk: { eyebrow: string; title: string; text: string };
  lpgDesk: { eyebrow: string; title: string; text: string };
  explore: string;
  whyEyebrow: string;
  whyTitle: string;
  why: { title: string; text: string }[];
  steps: { title: string; text: string }[];
  faqEyebrow: string;
  faqTitle: string;
  faq: { q: string; a: string }[];
  ctaTitle: string;
  ctaText: string;
  ctaEmail: string;
  /** Shown when a broker speaks the language; `{name}` is replaced. */
  speaker: string;
  whatsappGreeting: string;
};

export type Locale = {
  code: string;
  /** BCP 47 tag for hreflang and the lang attribute. */
  hreflang: string;
  ogLocale: string;
  /** Native name, shown in the language switcher. */
  label: string;
  /** English name of the language as listed in a broker's profile, if any. */
  brokerLanguage?: string;
  dir: "ltr" | "rtl";
  dict: Dictionary;
};

export const LOCALES: Locale[] = [
  {
    code: "zh",
    hreflang: "zh-Hans",
    ogLocale: "zh_CN",
    label: "中文",
    brokerLanguage: "Mandarin",
    dir: "ltr",
    dict: {
      metaTitle: "LEVANTER — 伊斯坦布尔油轮与液化石油气（LPG）船舶经纪",
      metaDescription:
        "总部位于伊斯坦布尔的油轮与LPG船舶经纪公司。原油、成品油、液化石油气和氨的航次租船、期租及包运合同（COA）。直接对接经纪人，60分钟内首次回复。",
      keywords: ["油轮经纪", "LPG船舶经纪", "VLGC租船", "油轮租船", "伊斯坦布尔船舶经纪"],
      eyebrow: "伊斯坦布尔 · 油轮与LPG船舶经纪",
      h1: "立足博斯普鲁斯海峡的油轮与LPG租船经纪。",
      lead: "原油、成品油、液化石油气和氨——航次租船、期租及COA。直接与负责您业务的经纪人沟通，60分钟内首次回复。",
      ctaInquiry: "发送询盘",
      desksEyebrow: "两个业务部门，一个专注",
      desksTitle: "只做液货船。",
      desksIntro: "我们只经纪油轮和气体运输船，因此每个部门都深入了解其船舶、码头和租家。",
      tankerDesk: {
        eyebrow: "油轮部",
        title: "原油与成品油轮",
        text: "黑海与CPC的苏伊士型油轮、地中海内的阿芙拉型油轮、运往亚洲的VLCC以及大西洋的MR油轮。",
      },
      lpgDesk: {
        eyebrow: "LPG与氨部",
        title: "液化石油气、氨与石化气",
        text: "按波罗的海指数报价的VLGC、运输氨的MGC，以及地中海的小型压力式LPG船。",
      },
      explore: "查看部门详情（英文）",
      whyEyebrow: "为什么选择LEVANTER",
      whyTitle: "具有本地深度的精品经纪团队。",
      why: [
        {
          title: "扼守土耳其海峡",
          text: "我们的伊斯坦布尔团队就在博斯普鲁斯海峡旁。每一份黑海航次估算都计入过峡时间和等待。",
        },
        {
          title: "小型LPG船专家",
          text: "地中海与黑海的压力式和半冷式LPG船——大型经纪行往往忽视的市场。",
        },
        { title: "资深经纪人全程负责", text: "从最初报价到租约执行后，您始终与同一位经纪人沟通。" },
        { title: "数字透明可查", text: "我们公开每个运价建议背后的TCE、航线和港口时间假设。" },
      ],
      steps: [
        { title: "需求", text: "货物、港口、受载期——或您的空船及船位。" },
        { title: "市场", text: "经过合规审查的船舶或货源短名单。" },
        { title: "成交", text: "谈判主要条款和租船合同，直至干净成交。" },
        { title: "成交后", text: "航次跟踪、装卸时间、滞期费及索赔。" },
      ],
      faqEyebrow: "常见问题",
      faqTitle: "与油轮和LPG经纪人合作",
      faq: [
        {
          q: "油轮和LPG船舶经纪人做什么？",
          a: "船舶经纪人撮合货物与船舶：为客户寻找合适的运力，谈判运费和租约条款，并跟进航次直至装卸时间、滞期费和索赔结算。",
        },
        {
          q: "你们覆盖哪些船型？",
          a: "原油轮（VLCC、苏伊士型、阿芙拉型）、成品油轮（LR2、LR1、MR）以及从VLGC、MGC到灵便型和小型压力式船的气体运输船。",
        },
        {
          q: "多久能收到回复？",
          a: "在伊斯坦布尔、伦敦和新加坡的工作时间内，经纪人会在60分钟内回复。",
        },
        { q: "佣金由谁支付？", a: "经纪佣金通常由船东按运费或租金的一定比例支付。发送询盘免费。" },
      ],
      ctaTitle: "有货物或船舶需要成交？",
      ctaText: "发送货物、港口和受载期。工作时间内经纪人60分钟内回复。我们使用英文工作。",
      ctaEmail: "电子邮件",
      speaker: "可用中文与 {name} 沟通。",
      whatsappGreeting: "您好，LEVANTER，我想咨询一笔租船业务。",
    },
  },
  {
    code: "ja",
    hreflang: "ja",
    ogLocale: "ja_JP",
    label: "日本語",
    brokerLanguage: "Japanese",
    dir: "ltr",
    dict: {
      metaTitle: "LEVANTER — イスタンブールのタンカー・LPG船シップブローカー",
      metaDescription:
        "イスタンブールを拠点とするタンカーおよびLPG船のシップブローカー。原油、石油製品、LPG、アンモニアの航海傭船・定期傭船・COA。担当ブローカーに直接つながり、60分以内に初回返信。",
      keywords: [
        "タンカー ブローカー",
        "LPG船 傭船",
        "VLGC 傭船",
        "シップブローカー イスタンブール",
      ],
      eyebrow: "イスタンブール · タンカー＆LPGシップブローカー",
      h1: "ボスポラス海峡から、タンカーとLPG船の傭船仲介を。",
      lead: "原油、石油製品、LPG、アンモニア——航海傭船、定期傭船、COA。案件を担当するブローカーと直接やり取りでき、初回返信は60分以内です。",
      ctaInquiry: "引き合いを送る",
      desksEyebrow: "2つのデスク、1つの専門",
      desksTitle: "液体貨物だけを扱います。",
      desksIntro:
        "タンカーとガス船に特化しているため、各デスクが船舶、ターミナル、傭船者を深く理解しています。",
      tankerDesk: {
        eyebrow: "タンカーデスク",
        title: "原油・石油製品タンカー",
        text: "黒海・CPCのスエズマックス、地中海域内のアフラマックス、アジア向けVLCC、大西洋のMR。",
      },
      lpgDesk: {
        eyebrow: "LPG・アンモニアデスク",
        title: "LPG、アンモニア、石化ガス",
        text: "バルチック指標のVLGC、アンモニア輸送のMGC、地中海の小型加圧式LPG船。",
      },
      explore: "デスク詳細（英語）",
      whyEyebrow: "LEVANTERが選ばれる理由",
      whyTitle: "地域に根ざしたブティック型デスク。",
      why: [
        {
          title: "トルコ海峡の目の前",
          text: "イスタンブールのデスクはボスポラス海峡沿いにあります。黒海の見積りには通航時間と待機を必ず織り込みます。",
        },
        {
          title: "小型LPG船のスペシャリスト",
          text: "地中海・黒海の加圧式・半冷凍式LPG船——大手が手薄になりがちな市場です。",
        },
        {
          title: "全案件をシニアブローカーが担当",
          text: "最初の提案からポストフィクスチャーまで、同じブローカーが対応します。",
        },
        {
          title: "検証できる数字",
          text: "すべての運賃提案について、TCE、航路、港湾日数の前提を開示します。",
        },
      ],
      steps: [
        { title: "ご依頼", text: "貨物、港、レイキャン——または空船とポジション。" },
        { title: "市場調査", text: "コンプライアンス確認済みの船舶・貨物の候補リスト。" },
        { title: "成約", text: "主要条件と傭船契約を交渉し、クリーンフィクスチャーへ。" },
        { title: "成約後", text: "航海フォロー、停泊期間、滞船料、クレーム処理。" },
      ],
      faqEyebrow: "よくある質問",
      faqTitle: "タンカー・LPGブローカーとの取引",
      faq: [
        {
          q: "シップブローカーの役割は？",
          a: "貨物と船舶をマッチングします。適切な船腹を探し、顧客のために運賃と傭船契約条件を交渉し、停泊期間、滞船料、クレームの精算まで航海をフォローします。",
        },
        {
          q: "どの船型を扱っていますか？",
          a: "原油タンカー（VLCC、スエズマックス、アフラマックス）、プロダクトタンカー（LR2、LR1、MR）、そしてVLGC・MGCからハンディサイズ、小型加圧式船までのガス船です。",
        },
        {
          q: "返信までの時間は？",
          a: "イスタンブール、ロンドン、シンガポールの営業時間内であれば、60分以内にブローカーが返信します。",
        },
        {
          q: "手数料は誰が支払いますか？",
          a: "ブローカー手数料は通常、運賃または傭船料に対する割合で船主が支払います。引き合いの送付は無料です。",
        },
      ],
      ctaTitle: "貨物や船舶の成約をお考えですか？",
      ctaText:
        "貨物、港、レイキャンをお送りください。営業時間内に60分以内で返信します。業務は英語で行います。",
      ctaEmail: "メール",
      speaker: "{name} とは日本語でご相談いただけます。",
      whatsappGreeting: "LEVANTER御中、傭船の件でご相談したいです。",
    },
  },
  {
    code: "ko",
    hreflang: "ko",
    ogLocale: "ko_KR",
    label: "한국어",
    dir: "ltr",
    dict: {
      metaTitle: "LEVANTER — 이스탄불 유조선·LPG선 선박 중개",
      metaDescription:
        "이스탄불 기반의 유조선 및 LPG선 선박 중개 회사. 원유, 석유제품, LPG, 암모니아의 항해용선, 정기용선, COA. 담당 브로커와 직접 소통하며 60분 이내 첫 회신.",
      keywords: ["유조선 브로커", "LPG선 용선", "VLGC 용선", "선박 중개 이스탄불"],
      eyebrow: "이스탄불 · 유조선 & LPG 선박 중개",
      h1: "보스포루스에서 중개하는 유조선과 LPG선 용선.",
      lead: "원유, 석유제품, LPG, 암모니아 — 항해용선, 정기용선, COA. 거래를 담당하는 브로커와 직접 소통하고, 60분 이내에 첫 회신을 받으세요.",
      ctaInquiry: "문의 보내기",
      desksEyebrow: "두 개의 데스크, 하나의 집중",
      desksTitle: "액체 화물만 다룹니다.",
      desksIntro:
        "유조선과 가스선만 중개하기 때문에 각 데스크가 선박, 터미널, 용선주를 깊이 이해하고 있습니다.",
      tankerDesk: {
        eyebrow: "유조선 데스크",
        title: "원유 및 석유제품 유조선",
        text: "흑해·CPC 수에즈막스, 지중해 역내 아프라막스, 아시아행 VLCC, 대서양 MR.",
      },
      lpgDesk: {
        eyebrow: "LPG·암모니아 데스크",
        title: "LPG, 암모니아, 석유화학 가스",
        text: "발틱 지수 기준의 VLGC, 암모니아 운송 MGC, 지중해의 소형 가압식 LPG선.",
      },
      explore: "데스크 상세 정보 (영문)",
      whyEyebrow: "LEVANTER를 선택하는 이유",
      whyTitle: "현지 전문성을 갖춘 부티크 데스크.",
      why: [
        {
          title: "터키 해협 바로 앞",
          text: "이스탄불 데스크는 보스포루스 해협에 있습니다. 모든 흑해 견적에 통항 시간과 대기를 반영합니다.",
        },
        {
          title: "소형 LPG선 전문",
          text: "지중해와 흑해의 가압식·반냉동식 LPG선 — 대형 중개사가 소홀히 하는 시장입니다.",
        },
        {
          title: "모든 거래에 시니어 브로커",
          text: "첫 제안부터 성약 후 업무까지 같은 브로커가 담당합니다.",
        },
        {
          title: "검증 가능한 숫자",
          text: "모든 운임 제안의 TCE, 항로, 항만 체류 가정을 공개합니다.",
        },
      ],
      steps: [
        { title: "요청", text: "화물, 항구, 레이캔 — 또는 공선과 위치." },
        { title: "시장", text: "컴플라이언스 검토를 마친 선박 또는 화물 후보." },
        { title: "성약", text: "주요 조건과 용선계약을 협상해 깔끔하게 성약." },
        { title: "성약 후", text: "항해 관리, 정박기간, 체선료, 클레임." },
      ],
      faqEyebrow: "자주 묻는 질문",
      faqTitle: "유조선·LPG 브로커와 일하기",
      faq: [
        {
          q: "선박 중개인은 어떤 일을 하나요?",
          a: "화물과 선박을 연결합니다. 적합한 선복을 찾고, 고객을 대신해 운임과 용선계약 조건을 협상하며, 정박기간, 체선료, 클레임 정산까지 항해를 관리합니다.",
        },
        {
          q: "어떤 선형을 다루나요?",
          a: "원유 유조선(VLCC, 수에즈막스, 아프라막스), 제품 유조선(LR2, LR1, MR), 그리고 VLGC·MGC부터 핸디사이즈와 소형 가압식 선박까지의 가스선입니다.",
        },
        {
          q: "회신은 얼마나 빠른가요?",
          a: "이스탄불, 런던, 싱가포르 영업시간 중에는 60분 이내에 브로커가 회신합니다.",
        },
        {
          q: "수수료는 누가 내나요?",
          a: "중개 수수료는 보통 선주가 운임 또는 용선료의 일정 비율로 지급합니다. 문의는 무료입니다.",
        },
      ],
      ctaTitle: "성약할 화물이나 선박이 있으신가요?",
      ctaText:
        "화물, 항구, 레이캔을 보내주세요. 영업시간 중 60분 이내에 회신합니다. 업무는 영어로 진행합니다.",
      ctaEmail: "이메일",
      speaker: "{name}와 한국어로 상담하실 수 있습니다.",
      whatsappGreeting: "안녕하세요 LEVANTER, 용선 건으로 문의드립니다.",
    },
  },
  {
    code: "el",
    hreflang: "el",
    ogLocale: "el_GR",
    label: "Ελληνικά",
    brokerLanguage: "Greek",
    dir: "ltr",
    dict: {
      metaTitle: "LEVANTER — Ναυλομεσίτες δεξαμενόπλοιων και υγραεριοφόρων LPG",
      metaDescription:
        "Ναυλομεσίτες δεξαμενόπλοιων και υγραεριοφόρων με έδρα την Κωνσταντινούπολη. Αργό, προϊόντα, LPG και αμμωνία — ναυλώσεις ταξιδιού, χρονοναυλώσεις και COA. Απευθείας επαφή με τον μεσίτη, πρώτη απάντηση σε 60 λεπτά.",
      keywords: ["ναυλομεσίτης δεξαμενόπλοια", "ναυλώσεις LPG", "ναύλωση VLGC", "ναυλομεσίτες"],
      eyebrow: "Κωνσταντινούπολη · Ναυλομεσίτες δεξαμενόπλοιων & LPG",
      h1: "Ναυλώσεις δεξαμενόπλοιων και LPG, από τον Βόσπορο.",
      lead: "Αργό, καθαρά προϊόντα, LPG και αμμωνία — ναύλωση ταξιδιού, χρονοναύλωση και COA. Μιλήστε απευθείας με τον μεσίτη που χειρίζεται τη δουλειά σας, με πρώτη απάντηση μέσα σε 60 λεπτά.",
      ctaInquiry: "Στείλτε ερώτημα",
      desksEyebrow: "Δύο τμήματα, μία εστίαση",
      desksTitle: "Μόνο υγρά φορτία.",
      desksIntro:
        "Ασχολούμαστε μόνο με δεξαμενόπλοια και υγραεριοφόρα, οπότε κάθε τμήμα γνωρίζει σε βάθος τα πλοία, τους τερματικούς σταθμούς και τους ναυλωτές του.",
      tankerDesk: {
        eyebrow: "Τμήμα δεξαμενόπλοιων",
        title: "Δεξαμενόπλοια αργού και προϊόντων",
        text: "Suezmax Μαύρης Θάλασσας και CPC, Aframax εντός Μεσογείου, VLCC προς Ασία και MR στον Ατλαντικό.",
      },
      lpgDesk: {
        eyebrow: "Τμήμα LPG & αμμωνίας",
        title: "LPG, αμμωνία και πετροχημικά αέρια",
        text: "VLGC στους δείκτες Baltic, MGC για αμμωνία και μικρά υγραεριοφόρα υπό πίεση στη Μεσόγειο.",
      },
      explore: "Λεπτομέρειες τμήματος (στα αγγλικά)",
      whyEyebrow: "Γιατί LEVANTER",
      whyTitle: "Ένα boutique γραφείο με τοπική εμβάθυνση.",
      why: [
        {
          title: "Πάνω στα Στενά",
          text: "Το γραφείο μας βρίσκεται στον Βόσπορο. Ο χρόνος διέλευσης και αναμονής μπαίνει σε κάθε εκτίμηση για τη Μαύρη Θάλασσα.",
        },
        {
          title: "Ειδικοί στα μικρά LPG",
          text: "Υγραεριοφόρα υπό πίεση και ημι-ψυχόμενα στη Μεσόγειο και τη Μαύρη Θάλασσα — αγορές που οι μεγάλοι οίκοι συχνά παραμελούν.",
        },
        {
          title: "Έμπειροι μεσίτες σε κάθε δουλειά",
          text: "Μιλάτε με τον μεσίτη που χειρίζεται το φορτίο σας, από την πρώτη ιδέα μέχρι το post-fixture.",
        },
        {
          title: "Αριθμοί που ελέγχονται",
          text: "Δείχνουμε τις παραδοχές TCE, δρομολογίου και χρόνου στο λιμάνι πίσω από κάθε πρόταση ναύλου.",
        },
      ],
      steps: [
        {
          title: "Ενημέρωση",
          text: "Φορτίο, λιμάνια, laycan — ή το ελεύθερο πλοίο σας και η θέση του.",
        },
        { title: "Αγορά", text: "Λίστα πλοίων ή φορτίων με ολοκληρωμένο έλεγχο συμμόρφωσης." },
        {
          title: "Κλείσιμο",
          text: "Διαπραγμάτευση κύριων όρων και ναυλοσυμφώνου μέχρι καθαρό fixture.",
        },
        {
          title: "Μετά το κλείσιμο",
          text: "Παρακολούθηση ταξιδιού, σταλίες, επισταλίες και απαιτήσεις.",
        },
      ],
      faqEyebrow: "Συχνές ερωτήσεις",
      faqTitle: "Συνεργασία με ναυλομεσίτη δεξαμενόπλοιων & LPG",
      faq: [
        {
          q: "Τι κάνει ένας ναυλομεσίτης;",
          a: "Συνδέει φορτία με πλοία: βρίσκει κατάλληλη χωρητικότητα, διαπραγματεύεται ναύλο και όρους ναυλοσυμφώνου για τον πελάτη και παρακολουθεί το ταξίδι μέχρι τις σταλίες, τις επισταλίες και τις απαιτήσεις.",
        },
        {
          q: "Ποιους τύπους πλοίων καλύπτετε;",
          a: "Δεξαμενόπλοια αργού (VLCC, Suezmax, Aframax), δεξαμενόπλοια προϊόντων (LR2, LR1, MR) και υγραεριοφόρα από VLGC και MGC έως Handysize και μικρά πλοία υπό πίεση.",
        },
        {
          q: "Πόσο γρήγορα απαντάτε;",
          a: "Ένας μεσίτης απαντά μέσα σε 60 λεπτά τις εργάσιμες ώρες σε Κωνσταντινούπολη, Λονδίνο και Σιγκαπούρη.",
        },
        {
          q: "Ποιος πληρώνει την προμήθεια;",
          a: "Η μεσιτεία καταβάλλεται συνήθως από τον πλοιοκτήτη ως ποσοστό επί του ναύλου ή του μισθώματος. Η αποστολή ερωτήματος είναι δωρεάν.",
        },
      ],
      ctaTitle: "Έχετε φορτίο ή πλοίο για κλείσιμο;",
      ctaText:
        "Στείλτε φορτίο, λιμάνια και laycan. Ένας μεσίτης απαντά μέσα σε 60 λεπτά τις εργάσιμες ώρες.",
      ctaEmail: "Email",
      speaker: "Μιλήστε ελληνικά με τον {name}.",
      whatsappGreeting: "Καλημέρα LEVANTER, θα ήθελα να συζητήσουμε μια ναύλωση.",
    },
  },
  {
    code: "no",
    hreflang: "no",
    ogLocale: "nb_NO",
    label: "Norsk",
    brokerLanguage: "Danish",
    dir: "ltr",
    dict: {
      metaTitle: "LEVANTER — Skipsmeglere for tankskip og LPG i Istanbul",
      metaDescription:
        "Skipsmeglere for tankskip og LPG-skip med base i Istanbul. Råolje, produkter, LPG og ammoniakk — reisebefraktning, tidsbefraktning og COA. Direkte kontakt med megleren og første svar innen 60 minutter.",
      keywords: ["skipsmegler tankskip", "LPG skipsmegler", "VLGC befraktning", "befraktning"],
      eyebrow: "Istanbul · Skipsmeglere for tank og LPG",
      h1: "Befraktning av tankskip og LPG, meglet fra Bosporos.",
      lead: "Råolje, rene produkter, LPG og ammoniakk — spot, tidsbefraktning og COA. Snakk direkte med megleren som jobber med din last, og få første svar innen 60 minutter.",
      ctaInquiry: "Send forespørsel",
      desksEyebrow: "To desker, ett fokus",
      desksTitle: "Bare flytende last.",
      desksIntro:
        "Vi megler kun tankskip og gasskip, så hver desk kjenner sine skip, terminaler og befraktere i dybden.",
      tankerDesk: {
        eyebrow: "Tankdesk",
        title: "Råolje- og produkttankere",
        text: "Suezmax fra Svartehavet og CPC, Aframax i Middelhavet, VLCC til Asia og MR i Atlanterhavet.",
      },
      lpgDesk: {
        eyebrow: "LPG- og ammoniakkdesk",
        title: "LPG, ammoniakk og petrokjemiske gasser",
        text: "VLGC på Baltic-referansene, MGC for ammoniakk og små trykksatte LPG-skip i Middelhavet.",
      },
      explore: "Om desken (engelsk)",
      whyEyebrow: "Hvorfor LEVANTER",
      whyTitle: "En boutique-desk med lokal dybde.",
      why: [
        {
          title: "Ved De tyrkiske stredene",
          text: "Istanbul-desken ligger ved Bosporos. Transittid og venting er med i hvert estimat for Svartehavet.",
        },
        {
          title: "Spesialister på små LPG-skip",
          text: "Trykksatte og semi-nedkjølte LPG-skip i Middelhavet og Svartehavet — markeder de store meglerhusene ofte nedprioriterer.",
        },
        {
          title: "Erfarne meglere på alle oppdrag",
          text: "Du snakker med megleren som jobber med lasten din, fra første idé til etteroppgjør.",
        },
        {
          title: "Tall du kan kontrollere",
          text: "Vi viser TCE-, rute- og havnetidsforutsetningene bak hvert fraktforslag.",
        },
      ],
      steps: [
        {
          title: "Forespørsel",
          text: "Last, havner, laycan — eller ditt ledige skip og posisjon.",
        },
        { title: "Marked", text: "Kortliste over skip eller laster, ferdig compliance-sjekket." },
        {
          title: "Slutning",
          text: "Hovedvilkår og certeparti forhandlet frem til en ren slutning.",
        },
        {
          title: "Etter slutning",
          text: "Oppfølging av reisen, liggetid, overliggedager og krav.",
        },
      ],
      faqEyebrow: "Spørsmål og svar",
      faqTitle: "Å jobbe med en tank- og LPG-megler",
      faq: [
        {
          q: "Hva gjør en skipsmegler?",
          a: "En skipsmegler kobler last og skip: vi finner egnet tonnasje, forhandler frakt og certepartivilkår for kunden og følger reisen frem til liggetid, overliggedager og krav er gjort opp.",
        },
        {
          q: "Hvilke skip dekker dere?",
          a: "Råoljetankere (VLCC, Suezmax, Aframax), produkttankere (LR2, LR1, MR) og gasskip fra VLGC og MGC til Handysize og små trykksatte skip.",
        },
        {
          q: "Hvor raskt svarer dere?",
          a: "En megler svarer innen 60 minutter i arbeidstiden i Istanbul, London og Singapore.",
        },
        {
          q: "Hvem betaler kommisjonen?",
          a: "Meglerkommisjon betales normalt av rederiet som en prosent av frakt eller hyre. Det er gratis å sende en forespørsel.",
        },
      ],
      ctaTitle: "Har du en last eller et skip som skal sluttes?",
      ctaText:
        "Send last, havner og laycan. En megler svarer innen 60 minutter i arbeidstiden. Vi jobber på engelsk.",
      ctaEmail: "E-post",
      speaker: "Snakk skandinavisk med {name}.",
      whatsappGreeting: "Hei LEVANTER, jeg vil gjerne diskutere en befraktning.",
    },
  },
  {
    code: "da",
    hreflang: "da",
    ogLocale: "da_DK",
    label: "Dansk",
    brokerLanguage: "Danish",
    dir: "ltr",
    dict: {
      metaTitle: "LEVANTER — Skibsmæglere for tankskibe og LPG i Istanbul",
      metaDescription:
        "Skibsmæglere for tankskibe og LPG-skibe med base i Istanbul. Råolie, produkter, LPG og ammoniak — rejsebefragtning, tidsbefragtning og COA. Direkte kontakt med mægleren og første svar inden for 60 minutter.",
      keywords: ["skibsmægler tankskibe", "LPG skibsmægler", "VLGC befragtning", "befragtning"],
      eyebrow: "Istanbul · Skibsmæglere for tank og LPG",
      h1: "Befragtning af tankskibe og LPG, mæglet fra Bosporus.",
      lead: "Råolie, rene produkter, LPG og ammoniak — spot, tidsbefragtning og COA. Tal direkte med den mægler, der arbejder med din last, og få første svar inden for 60 minutter.",
      ctaInquiry: "Send forespørgsel",
      desksEyebrow: "To desks, ét fokus",
      desksTitle: "Kun flydende last.",
      desksIntro:
        "Vi mægler kun tankskibe og gastankskibe, så hver desk kender sine skibe, terminaler og befragtere i dybden.",
      tankerDesk: {
        eyebrow: "Tankdesk",
        title: "Råolie- og produkttankskibe",
        text: "Suezmax fra Sortehavet og CPC, Aframax i Middelhavet, VLCC til Asien og MR i Atlanten.",
      },
      lpgDesk: {
        eyebrow: "LPG- og ammoniakdesk",
        title: "LPG, ammoniak og petrokemiske gasser",
        text: "VLGC på Baltic-benchmarks, MGC til ammoniak og små trykskibe til LPG i Middelhavet.",
      },
      explore: "Om desken (engelsk)",
      whyEyebrow: "Hvorfor LEVANTER",
      whyTitle: "En boutique-desk med lokal dybde.",
      why: [
        {
          title: "Ved De Tyrkiske Stræder",
          text: "Vores Istanbul-desk ligger ved Bosporus. Transittid og ventetid indgår i hvert estimat for Sortehavet.",
        },
        {
          title: "Specialister i små LPG-skibe",
          text: "Tryk- og semi-kølede LPG-skibe i Middelhavet og Sortehavet — markeder, de store mæglerhuse ofte overser.",
        },
        {
          title: "Erfarne mæglere på hver handel",
          text: "Du taler med den mægler, der arbejder med din last, fra første idé til post-fixture.",
        },
        {
          title: "Tal, du kan kontrollere",
          text: "Vi viser TCE-, rute- og havnetidsantagelserne bag hvert fragtforslag.",
        },
      ],
      steps: [
        { title: "Forespørgsel", text: "Last, havne, laycan — eller dit åbne skib og position." },
        { title: "Marked", text: "En kortliste over skibe eller laster, compliance-tjekket." },
        { title: "Lukning", text: "Hovedvilkår og certeparti forhandlet til en ren lukning." },
        { title: "Efter lukning", text: "Opfølgning på rejsen, liggetid, overliggepenge og krav." },
      ],
      faqEyebrow: "Spørgsmål og svar",
      faqTitle: "At arbejde med en tank- og LPG-mægler",
      faq: [
        {
          q: "Hvad laver en skibsmægler?",
          a: "En skibsmægler matcher last og skibe: vi finder egnet tonnage, forhandler fragt og certepartivilkår for kunden og følger rejsen til liggetid, overliggepenge og krav er afregnet.",
        },
        {
          q: "Hvilke skibe dækker I?",
          a: "Råolietankskibe (VLCC, Suezmax, Aframax), produkttankskibe (LR2, LR1, MR) og gastankskibe fra VLGC og MGC til Handysize og små trykskibe.",
        },
        {
          q: "Hvor hurtigt svarer I?",
          a: "En mægler svarer inden for 60 minutter i arbejdstiden i Istanbul, London og Singapore.",
        },
        {
          q: "Hvem betaler kommissionen?",
          a: "Mæglerkommission betales normalt af rederiet som en procentdel af fragt eller hyre. Det er gratis at sende en forespørgsel.",
        },
      ],
      ctaTitle: "Har du en last eller et skib, der skal lukkes?",
      ctaText:
        "Send last, havne og laycan. En mægler svarer inden for 60 minutter i arbejdstiden. Vi arbejder på engelsk.",
      ctaEmail: "E-mail",
      speaker: "Tal dansk med {name}.",
      whatsappGreeting: "Hej LEVANTER, jeg vil gerne drøfte en befragtning.",
    },
  },
  {
    code: "sv",
    hreflang: "sv",
    ogLocale: "sv_SE",
    label: "Svenska",
    brokerLanguage: "Danish",
    dir: "ltr",
    dict: {
      metaTitle: "LEVANTER — Skeppsmäklare för tankfartyg och LPG i Istanbul",
      metaDescription:
        "Skeppsmäklare för tankfartyg och LPG-fartyg med bas i Istanbul. Råolja, produkter, LPG och ammoniak — resebefraktning, tidsbefraktning och COA. Direkt kontakt med mäklaren och första svar inom 60 minuter.",
      keywords: [
        "skeppsmäklare tankfartyg",
        "LPG skeppsmäklare",
        "VLGC befraktning",
        "befraktning",
      ],
      eyebrow: "Istanbul · Skeppsmäklare för tank och LPG",
      h1: "Befraktning av tankfartyg och LPG, mäklad från Bosporen.",
      lead: "Råolja, rena produkter, LPG och ammoniak — spot, tidsbefraktning och COA. Prata direkt med mäklaren som arbetar med din last och få första svar inom 60 minuter.",
      ctaInquiry: "Skicka förfrågan",
      desksEyebrow: "Två desker, ett fokus",
      desksTitle: "Bara flytande last.",
      desksIntro:
        "Vi mäklar bara tankfartyg och gastankfartyg, så varje desk känner sina fartyg, terminaler och befraktare på djupet.",
      tankerDesk: {
        eyebrow: "Tankdesk",
        title: "Tankfartyg för råolja och produkter",
        text: "Suezmax från Svarta havet och CPC, Aframax i Medelhavet, VLCC till Asien och MR i Atlanten.",
      },
      lpgDesk: {
        eyebrow: "LPG- och ammoniakdesk",
        title: "LPG, ammoniak och petrokemiska gaser",
        text: "VLGC på Baltic-referenserna, MGC för ammoniak och små trycksatta LPG-fartyg i Medelhavet.",
      },
      explore: "Om desken (engelska)",
      whyEyebrow: "Varför LEVANTER",
      whyTitle: "En boutique-desk med lokalt djup.",
      why: [
        {
          title: "Vid Turkiska sunden",
          text: "Vår Istanbul-desk ligger vid Bosporen. Transittid och väntan ingår i varje kalkyl för Svarta havet.",
        },
        {
          title: "Specialister på små LPG-fartyg",
          text: "Trycksatta och halvkylda LPG-fartyg i Medelhavet och Svarta havet — marknader som de stora mäklarhusen ofta förbiser.",
        },
        {
          title: "Erfarna mäklare i varje affär",
          text: "Du pratar med mäklaren som arbetar med din last, från första idé till efterhantering.",
        },
        {
          title: "Siffror du kan kontrollera",
          text: "Vi visar antagandena om TCE, rutt och hamntid bakom varje fraktförslag.",
        },
      ],
      steps: [
        {
          title: "Förfrågan",
          text: "Last, hamnar, laycan — eller ditt lediga fartyg och position.",
        },
        {
          title: "Marknad",
          text: "En kortlista med fartyg eller laster, compliance-kontrollerad.",
        },
        { title: "Avslut", text: "Huvudvillkor och certeparti förhandlade till ett rent avslut." },
        { title: "Efter avslut", text: "Uppföljning av resan, liggetid, överliggetid och krav." },
      ],
      faqEyebrow: "Frågor och svar",
      faqTitle: "Att arbeta med en tank- och LPG-mäklare",
      faq: [
        {
          q: "Vad gör en skeppsmäklare?",
          a: "En skeppsmäklare matchar last och fartyg: vi hittar lämpligt tonnage, förhandlar frakt och certepartivillkor för kunden och följer resan tills liggetid, överliggetid och krav är reglerade.",
        },
        {
          q: "Vilka fartyg täcker ni?",
          a: "Råoljetankfartyg (VLCC, Suezmax, Aframax), produkttankfartyg (LR2, LR1, MR) och gastankfartyg från VLGC och MGC till Handysize och små trycksatta fartyg.",
        },
        {
          q: "Hur snabbt svarar ni?",
          a: "En mäklare svarar inom 60 minuter under arbetstid i Istanbul, London och Singapore.",
        },
        {
          q: "Vem betalar kommissionen?",
          a: "Mäklarkommission betalas normalt av redaren som en procentandel av frakt eller hyra. Det är gratis att skicka en förfrågan.",
        },
      ],
      ctaTitle: "Har du en last eller ett fartyg att avsluta?",
      ctaText:
        "Skicka last, hamnar och laycan. En mäklare svarar inom 60 minuter under arbetstid. Vi arbetar på engelska.",
      ctaEmail: "E-post",
      speaker: "Prata skandinaviska med {name}.",
      whatsappGreeting: "Hej LEVANTER, jag vill gärna diskutera en befraktning.",
    },
  },
  {
    code: "de",
    hreflang: "de",
    ogLocale: "de_DE",
    label: "Deutsch",
    dir: "ltr",
    dict: {
      metaTitle: "LEVANTER — Schiffsmakler für Tanker und LPG in Istanbul",
      metaDescription:
        "Schiffsmakler für Tanker und LPG-Gastanker mit Sitz in Istanbul. Rohöl, Produkte, LPG und Ammoniak — Reisecharter, Zeitcharter und COA. Direkter Kontakt zum Makler, erste Antwort innerhalb von 60 Minuten.",
      keywords: [
        "Schiffsmakler Tanker",
        "LPG Schiffsmakler",
        "VLGC Befrachtung",
        "Tanker Befrachtung",
      ],
      eyebrow: "Istanbul · Schiffsmakler für Tanker & LPG",
      h1: "Tanker- und LPG-Befrachtung, vermittelt vom Bosporus.",
      lead: "Rohöl, saubere Produkte, LPG und Ammoniak — Spot, Zeitcharter und COA. Sprechen Sie direkt mit dem Makler, der Ihr Geschäft betreut — erste Antwort innerhalb von 60 Minuten.",
      ctaInquiry: "Anfrage senden",
      desksEyebrow: "Zwei Desks, ein Fokus",
      desksTitle: "Nur flüssige Ladung.",
      desksIntro:
        "Wir vermitteln ausschließlich Tanker und Gastanker. Jeder Desk kennt seine Schiffe, Terminals und Charterer im Detail.",
      tankerDesk: {
        eyebrow: "Tanker-Desk",
        title: "Rohöl- und Produktentanker",
        text: "Suezmax aus dem Schwarzen Meer und CPC, Aframax im Mittelmeer, VLCC nach Asien und MR im Atlantik.",
      },
      lpgDesk: {
        eyebrow: "LPG- & Ammoniak-Desk",
        title: "LPG, Ammoniak und petrochemische Gase",
        text: "VLGC auf Basis der Baltic-Benchmarks, MGC für Ammoniak und kleine Druckgastanker im Mittelmeer.",
      },
      explore: "Zum Desk (Englisch)",
      whyEyebrow: "Warum LEVANTER",
      whyTitle: "Ein Boutique-Desk mit lokaler Tiefe.",
      why: [
        {
          title: "Direkt an den Meerengen",
          text: "Unser Istanbul-Desk liegt am Bosporus. Transitzeit und Wartezeit fließen in jede Kalkulation für das Schwarze Meer ein.",
        },
        {
          title: "Spezialisten für kleine LPG-Schiffe",
          text: "Druck- und halbgekühlte LPG-Tanker im Mittelmeer und Schwarzen Meer — Märkte, die große Maklerhäuser oft vernachlässigen.",
        },
        {
          title: "Erfahrene Makler bei jedem Abschluss",
          text: "Sie sprechen mit dem Makler, der Ihre Ladung betreut — von der ersten Idee bis zur Abwicklung.",
        },
        {
          title: "Nachprüfbare Zahlen",
          text: "Wir legen die Annahmen zu TCE, Route und Hafenzeit hinter jedem Frachtvorschlag offen.",
        },
      ],
      steps: [
        {
          title: "Anfrage",
          text: "Ladung, Häfen, Laycan — oder Ihr freies Schiff und seine Position.",
        },
        { title: "Markt", text: "Eine Shortlist von Schiffen oder Ladungen, Compliance geprüft." },
        {
          title: "Abschluss",
          text: "Hauptbedingungen und Chartervertrag bis zum sauberen Fixture verhandelt.",
        },
        {
          title: "Nach dem Abschluss",
          text: "Reiseverfolgung, Liegezeit, Liegegeld und Ansprüche.",
        },
      ],
      faqEyebrow: "Häufige Fragen",
      faqTitle: "Zusammenarbeit mit einem Tanker- & LPG-Makler",
      faq: [
        {
          q: "Was macht ein Schiffsmakler?",
          a: "Ein Schiffsmakler bringt Ladung und Schiffe zusammen: Wir finden passenden Schiffsraum, verhandeln Fracht und Charterbedingungen für unseren Kunden und begleiten die Reise bis zur Abrechnung von Liegezeit, Liegegeld und Ansprüchen.",
        },
        {
          q: "Welche Schiffstypen decken Sie ab?",
          a: "Rohöltanker (VLCC, Suezmax, Aframax), Produktentanker (LR2, LR1, MR) und Gastanker von VLGC und MGC bis Handysize und kleinen Druckgastankern.",
        },
        {
          q: "Wie schnell antworten Sie?",
          a: "Ein Makler antwortet innerhalb von 60 Minuten während der Geschäftszeiten in Istanbul, London und Singapur.",
        },
        {
          q: "Wer zahlt die Kommission?",
          a: "Die Maklerkommission zahlt in der Regel der Reeder als Prozentsatz von Fracht oder Charterrate. Eine Anfrage ist kostenlos.",
        },
      ],
      ctaTitle: "Haben Sie eine Ladung oder ein Schiff zu befrachten?",
      ctaText:
        "Senden Sie Ladung, Häfen und Laycan. Ein Makler antwortet innerhalb von 60 Minuten während der Geschäftszeiten. Wir arbeiten auf Englisch.",
      ctaEmail: "E-Mail",
      speaker: "Sprechen Sie mit {name}.",
      whatsappGreeting: "Hallo LEVANTER, ich möchte über eine Befrachtung sprechen.",
    },
  },
  {
    code: "es",
    hreflang: "es",
    ogLocale: "es_ES",
    label: "Español",
    dir: "ltr",
    dict: {
      metaTitle: "LEVANTER — Corredores de fletamento de petroleros y GLP en Estambul",
      metaDescription:
        "Corredores marítimos de petroleros y buques de GLP con sede en Estambul. Crudo, productos, GLP y amoníaco: fletamento por viaje, por tiempo y COA. Contacto directo con el corredor y primera respuesta en 60 minutos.",
      keywords: [
        "corredor de fletamentos",
        "broker GLP",
        "fletamento VLGC",
        "fletamento de petroleros",
      ],
      eyebrow: "Estambul · Corredores de petroleros y GLP",
      h1: "Fletamento de petroleros y GLP, desde el Bósforo.",
      lead: "Crudo, productos limpios, GLP y amoníaco: spot, fletamento por tiempo y COA. Hable directamente con el corredor que gestiona su operación y reciba la primera respuesta en 60 minutos.",
      ctaInquiry: "Enviar consulta",
      desksEyebrow: "Dos mesas, un enfoque",
      desksTitle: "Solo cargas líquidas.",
      desksIntro:
        "Solo fletamos petroleros y buques gaseros, así que cada mesa conoce a fondo sus buques, terminales y fletadores.",
      tankerDesk: {
        eyebrow: "Mesa de petroleros",
        title: "Petroleros de crudo y productos",
        text: "Suezmax del mar Negro y CPC, Aframax en el Mediterráneo, VLCC hacia Asia y MR en el Atlántico.",
      },
      lpgDesk: {
        eyebrow: "Mesa de GLP y amoníaco",
        title: "GLP, amoníaco y gases petroquímicos",
        text: "VLGC sobre las referencias del Baltic, MGC para amoníaco y pequeños buques presurizados de GLP en el Mediterráneo.",
      },
      explore: "Ver la mesa (en inglés)",
      whyEyebrow: "Por qué LEVANTER",
      whyTitle: "Una mesa boutique con conocimiento local.",
      why: [
        {
          title: "Junto a los Estrechos turcos",
          text: "Nuestra mesa de Estambul está en el Bósforo. El tiempo de tránsito y de espera entra en cada estimación del mar Negro.",
        },
        {
          title: "Especialistas en GLP pequeño",
          text: "Buques de GLP presurizados y semirrefrigerados en el Mediterráneo y el mar Negro, mercados que las grandes casas suelen desatender.",
        },
        {
          title: "Corredores sénior en cada operación",
          text: "Habla con el corredor que trabaja su carga, desde la primera idea hasta el post-fixture.",
        },
        {
          title: "Números verificables",
          text: "Mostramos los supuestos de TCE, ruta y tiempo en puerto detrás de cada idea de flete.",
        },
      ],
      steps: [
        { title: "Consulta", text: "Carga, puertos, laycan, o su buque libre y su posición." },
        {
          title: "Mercado",
          text: "Lista corta de buques o cargas, con la verificación de cumplimiento hecha.",
        },
        {
          title: "Cierre",
          text: "Negociación de términos principales y póliza hasta un cierre limpio.",
        },
        { title: "Post-cierre", text: "Seguimiento del viaje, plancha, demoras y reclamaciones." },
      ],
      faqEyebrow: "Preguntas frecuentes",
      faqTitle: "Trabajar con un corredor de petroleros y GLP",
      faq: [
        {
          q: "¿Qué hace un corredor marítimo?",
          a: "Une cargas y buques: buscamos el tonelaje adecuado, negociamos el flete y las condiciones de la póliza para nuestro cliente y seguimos el viaje hasta liquidar plancha, demoras y reclamaciones.",
        },
        {
          q: "¿Qué buques cubren?",
          a: "Petroleros de crudo (VLCC, Suezmax, Aframax), de productos (LR2, LR1, MR) y gaseros desde VLGC y MGC hasta Handysize y pequeños buques presurizados.",
        },
        {
          q: "¿En cuánto tiempo responden?",
          a: "Un corredor responde en 60 minutos en horario laboral de Estambul, Londres y Singapur.",
        },
        {
          q: "¿Quién paga la comisión?",
          a: "La comisión de corretaje la paga normalmente el armador como porcentaje del flete o del alquiler. Enviar una consulta es gratis.",
        },
      ],
      ctaTitle: "¿Tiene una carga o un buque para cerrar?",
      ctaText:
        "Envíe la carga, los puertos y el laycan. Un corredor responde en 60 minutos en horario laboral. Trabajamos en inglés.",
      ctaEmail: "Correo",
      speaker: "Hable con {name}.",
      whatsappGreeting: "Hola LEVANTER, me gustaría hablar de un fletamento.",
    },
  },
  {
    code: "ar",
    hreflang: "ar",
    ogLocale: "ar_AE",
    label: "العربية",
    brokerLanguage: "Arabic",
    dir: "rtl",
    dict: {
      metaTitle: "LEVANTER — وساطة تأجير ناقلات النفط وناقلات الغاز المسال في إسطنبول",
      metaDescription:
        "وسطاء بحريون لناقلات النفط وناقلات غاز البترول المسال مقرهم إسطنبول. النفط الخام والمنتجات والغاز المسال والأمونيا — تأجير بالرحلة وتأجير زمني وعقود نقل طويلة الأجل. تواصل مباشر مع الوسيط ورد أول خلال 60 دقيقة.",
      keywords: [
        "وسيط ناقلات النفط",
        "وسيط غاز البترول المسال",
        "تأجير ناقلات VLGC",
        "وساطة بحرية",
      ],
      eyebrow: "إسطنبول · وساطة ناقلات النفط والغاز المسال",
      h1: "وساطة تأجير ناقلات النفط والغاز المسال من البوسفور.",
      lead: "النفط الخام والمنتجات النظيفة وغاز البترول المسال والأمونيا — تأجير بالرحلة وتأجير زمني وعقود نقل. تحدث مباشرة مع الوسيط الذي يتولى صفقتك، مع رد أول خلال 60 دقيقة.",
      ctaInquiry: "أرسل طلبك",
      desksEyebrow: "قسمان وتركيز واحد",
      desksTitle: "الشحنات السائلة فقط.",
      desksIntro:
        "نعمل فقط في ناقلات النفط وناقلات الغاز، لذا يعرف كل قسم سفنه ومحطاته ومستأجريه بعمق.",
      tankerDesk: {
        eyebrow: "قسم ناقلات النفط",
        title: "ناقلات النفط الخام والمنتجات",
        text: "ناقلات سويزماكس من البحر الأسود وCPC، وأفراماكس داخل المتوسط، وVLCC إلى آسيا، وMR عبر الأطلسي.",
      },
      lpgDesk: {
        eyebrow: "قسم الغاز المسال والأمونيا",
        title: "غاز البترول المسال والأمونيا والغازات البتروكيماوية",
        text: "ناقلات VLGC وفق مؤشرات البلطيق، وMGC للأمونيا، وناقلات صغيرة مضغوطة للغاز المسال في المتوسط.",
      },
      explore: "تفاصيل القسم (بالإنجليزية)",
      whyEyebrow: "لماذا LEVANTER",
      whyTitle: "مكتب متخصص بخبرة محلية عميقة.",
      why: [
        {
          title: "على المضائق التركية",
          text: "يقع مكتبنا في إسطنبول على البوسفور. نُدخل وقت العبور والانتظار في كل تقدير لرحلات البحر الأسود.",
        },
        {
          title: "متخصصون في الناقلات الصغيرة",
          text: "ناقلات الغاز المسال المضغوطة وشبه المبردة في المتوسط والبحر الأسود — أسواق تهملها كبرى شركات الوساطة غالبًا.",
        },
        {
          title: "وسطاء كبار في كل صفقة",
          text: "تتحدث مع الوسيط الذي يعمل على شحنتك من الفكرة الأولى حتى ما بعد إبرام العقد.",
        },
        {
          title: "أرقام يمكن التحقق منها",
          text: "نوضح افتراضات العائد اليومي (TCE) والمسار ووقت الميناء وراء كل عرض شحن.",
        },
      ],
      steps: [
        { title: "الطلب", text: "الشحنة والموانئ ونافذة التحميل — أو سفينتك المتاحة وموقعها." },
        { title: "السوق", text: "قائمة مختصرة بالسفن أو الشحنات بعد التحقق من الامتثال." },
        { title: "الإبرام", text: "التفاوض على الشروط الرئيسية وعقد التأجير حتى إبرام نظيف." },
        { title: "ما بعد الإبرام", text: "متابعة الرحلة ووقت التحميل وغرامات التأخير والمطالبات." },
      ],
      faqEyebrow: "الأسئلة الشائعة",
      faqTitle: "العمل مع وسيط ناقلات النفط والغاز المسال",
      faq: [
        {
          q: "ما عمل الوسيط البحري؟",
          a: "يطابق الوسيط بين الشحنات والسفن: نجد الحمولة المناسبة، ونتفاوض على أجرة الشحن وشروط عقد التأجير نيابة عن العميل، ونتابع الرحلة حتى تسوية وقت التحميل وغرامات التأخير والمطالبات.",
        },
        {
          q: "ما أنواع السفن التي تغطونها؟",
          a: "ناقلات النفط الخام (VLCC وسويزماكس وأفراماكس) وناقلات المنتجات (LR2 وLR1 وMR) وناقلات الغاز من VLGC وMGC إلى هاندي سايز والسفن الصغيرة المضغوطة.",
        },
        {
          q: "ما سرعة الرد؟",
          a: "يرد وسيط خلال 60 دقيقة أثناء ساعات العمل في إسطنبول ولندن وسنغافورة.",
        },
        {
          q: "من يدفع العمولة؟",
          a: "يدفع مالك السفينة عادةً عمولة الوساطة كنسبة من أجرة الشحن أو الإيجار. إرسال الطلب مجاني.",
        },
      ],
      ctaTitle: "هل لديك شحنة أو سفينة للتأجير؟",
      ctaText: "أرسل الشحنة والموانئ ونافذة التحميل. يرد وسيط خلال 60 دقيقة أثناء ساعات العمل.",
      ctaEmail: "البريد الإلكتروني",
      speaker: "تحدث بالعربية مع {name}.",
      whatsappGreeting: "مرحبًا LEVANTER، أود مناقشة عملية تأجير.",
    },
  },
];

export const LOCALE_CODES = LOCALES.map((l) => l.code);

export function getLocale(code: string): Locale | undefined {
  return LOCALES.find((l) => l.code === code);
}

/** hreflang map for the homepage family: English root + every localized landing page. */
export function homeLanguages(): Record<string, string> {
  return {
    en: "/",
    ...Object.fromEntries(LOCALES.map((l) => [l.hreflang, `/${l.code}`])),
  };
}
