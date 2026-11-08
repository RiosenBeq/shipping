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
  /** Hero desk card: eyebrow and reply-time footer. */
  deskLinesTitle: string;
  deskNote: string;
  /** Process timeline heading. */
  stepsEyebrow: string;
  stepsTitle: string;
  /** Screen-reader hint after links that open WhatsApp in a new tab. */
  newTab: string;
  /** Floating WhatsApp button label (its accessible name starts with this text). */
  fab: string;
  /** Under the hero buttons: the inquiry form itself is English-only. */
  formNote: string;
  /** Section rail on the homepage stage: its accessible name and two waypoint labels. */
  rail: { label: string; overview: string; contact: string };
  /**
   * The V2 homepage (DESIGN-V2 §7, §12): the strings it adds to the ones above.
   * The other sections reuse them (why → the four facts, tankerDesk/lpgDesk →
   * desk rows 1–2, steps → how we work, faq → the FAQ, cta → the letter).
   */
  home: {
    /** Hero headline, at most three lines at 46px on a 390px phone (§12). */
    heroLines: string[];
    /** One word or phrase of the headline set in brass. */
    heroAccent?: string;
    heroSub: string;
    /** The ghost button next to the inquiry button. */
    whatsapp: string;
    /** Mono scene labels: hero ("Dawn · outbound") and who. */
    sceneHero: string;
    sceneWho: string;
    pause: { pause: string; play: string };
    /** Rail waypoint names, in section order. */
    rail: {
      hero: string;
      who: string;
      desks: string;
      ships: string;
      process: string;
      reach: string;
      team: string;
      notes: string;
      letter: string;
    };
    /** "— sub" lines (how we work uses `stepsEyebrow`). */
    subs: {
      who: string;
      desks: string;
      ships: string;
      reach: string;
      team: string;
      notes: string;
      contact: string;
    };
    /** The Who statement (h2), filled word by word. */
    statement: string;
    about: string;
    /** Next to the sonar ping, after the coordinates. */
    pin: string;
    /** Link labels of the four facts (`why`). */
    factLinks: string[];
    desksLines: string[];
    desksLead: string;
    howWeWork: string;
    /** Desk row 3. */
    straits: { title: string; text: string };
    /** Desk row 4. */
    postTitle: string;
    postText: string;
    /** Link labels and still captions of the four desk rows. */
    rowLinks: string[];
    captions: string[];
    /** Spoken on a closed row's button. */
    open: string;
    ships: {
      title: string;
      tanker: string;
      gas: string;
      classGuide: string;
      prev: string;
      next: string;
      /** Accessible name of the Tankers | Gas control. */
      family: string;
    };
    reachLines: string[];
    /** Captions of the four counters (60, 9, 3, 2): evergreen facts, no prices or rates. */
    counters: string[];
    localTime: string;
    mapLabel: string;
    lanesLabel: string;
    teamLines: string[];
    teamLead: string;
    /** Button to the (English) team page. */
    teamCta: string;
    /** "Email {name}" on a team card. */
    email: string;
    notesTitle: string;
    allPosts: string;
    askDesk: string;
    /** The letter's label ("From the Bosphorus"); its headline and line are ctaTitle/ctaText. */
    letterLabel: string;
    dutyTitle: string;
    /** `{number}` is replaced with the duty WhatsApp number. */
    dutyText: string;
    /** "Phone · Istanbul" in the contact column. */
    phone: string;
    /**
     * The freight calculator's entry points: the card under the desk rows and
     * the second link on each class card (the calculator page is in English).
     */
    calc: { label: string; title: string; text: string; cta: string; estimate: string };
  };
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
      deskLinesTitle: "业务部门直线联系",
      deskNote: "工作时间内，经纪人60分钟内回复。",
      stepsEyebrow: "工作方式",
      stepsTitle: "四个步骤，同一位经纪人全程负责。",
      newTab: "（在新标签页中打开）",
      fab: "通过WhatsApp联系经纪人",
      formNote: "询盘表格为英文。",
      rail: { label: "本页内容", overview: "概览", contact: "联系我们" },
      home: {
        heroLines: ["油轮与气体船，", "立足博斯普鲁斯", "专业经纪。"],
        heroAccent: "博斯普鲁斯",
        heroSub: "伊斯坦布尔油轮与LPG船舶经纪",
        whatsapp: "WhatsApp联系业务部",
        sceneHero: "黎明 · 出港",
        sceneWho: "本地深度 · 博斯普鲁斯测深",
        pause: {
          pause: "暂停动画",
          play: "播放动画",
        },
        rail: {
          hero: "启航",
          who: "本地深度",
          desks: "业务部门",
          ships: "船型",
          process: "工作方式",
          reach: "覆盖范围",
          team: "团队",
          notes: "研究笔记",
          letter: "联系",
        },
        subs: {
          who: "我们是谁",
          desks: "业务与服务",
          ships: "我们经纪的船型",
          reach: "我们的业务范围",
          team: "我们的团队",
          notes: "来自业务一线",
          contact: "联系我们",
        },
        statement:
          "只做液货，别无其他。我们在博斯普鲁斯海峡旁经纪油轮和气体运输船，因此每位经纪人都深入了解船舶、码头和海峡。",
        about: "关于LEVANTER（英文）",
        pin: "伊斯坦布尔业务部",
        factLinks: ["土耳其海峡指南", "压力式LPG船指南", "认识团队", "Worldscale与TCE详解"],
        desksLines: ["两个业务部门，", "同一个标准。"],
        desksLead:
          "我们刻意保持专注：只经纪油轮和气体运输船——航次租船、期租和COA，直至装卸时间和索赔。",
        howWeWork: "工作方式",
        straits: {
          title: "土耳其海峡",
          text: "过峡时间、等待和海峡规则，计入我们报出的每一笔黑海租船。",
        },
        postTitle: "成交后服务",
        postText: "航次跟踪、装卸时间、滞期费和索赔，由完成成交的同一位经纪人负责。",
        rowLinks: ["油轮部", "LPG与氨部", "土耳其海峡指南", "装卸时间与滞期费指南"],
        captions: ["油轮部 · 伊斯坦布尔", "LPG与氨部", "博斯普鲁斯 · 卡拉柯伊", "卸货港 · 黄昏"],
        open: "展开",
        ships: {
          title: "从VLCC到压力式LPG船。",
          tanker: "油轮",
          gas: "气体船",
          classGuide: "船型指南",
          prev: "上一船型",
          next: "下一船型",
          family: "船舶类别",
        },
        reachLines: ["三个办公室，", "一个团队。"],
        counters: [
          "分钟内首次回复（工作时间）",
          "种船型，从VLCC到压力式LPG船",
          "个办公室，横跨三个时区",
          "个业务部门：油轮、LPG与氨",
        ],
        localTime: "当地时间",
        mapLabel: "从欧洲到新加坡的业务地图，标出从伊斯坦布尔出发的航线和我们的三个办公室",
        lanesLabel: "我们的航线",
        teamLines: ["直接对话经纪人，", "而不是总机。"],
        teamLead: "两个业务部门的九位经纪人，每一位都可以通过电子邮件或WhatsApp直接联系。",
        teamCta: "认识团队（英文）",
        email: "给{name}发邮件",
        notesTitle: "来自业务一线的笔记。",
        allPosts: "全部文章（英文）",
        askDesk: "咨询业务部",
        letterLabel: "来自博斯普鲁斯",
        dutyTitle: "非工作时间有实时成交？",
        dutyText: "通过WhatsApp联系值班经纪人——{number}。晚间和周末均有人回复。",
        phone: "电话 · 伊斯坦布尔",
        calc: {
          label: "运费计算器",
          title: "估算一个航次。",
          text: "输入港口、船型和货物，即可得到航程、航行天数和航次费用的初步估算——联系经纪人之前先心中有数。",
          cta: "打开计算器（英文）",
          estimate: "估算航次",
        },
      },
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
      deskLinesTitle: "デスク直通窓口",
      deskNote: "営業時間内は60分以内にブローカーが返信します。",
      stepsEyebrow: "進め方",
      stepsTitle: "4つのステップを、同じブローカーが一貫して担当。",
      newTab: "（新しいタブで開きます）",
      fab: "WhatsAppでブローカーに相談",
      formNote: "引き合いフォームは英語です。",
      rail: { label: "このページの内容", overview: "概要", contact: "お問い合わせ" },
      home: {
        heroLines: ["ボスポラスの", "タンカー・", "ガス船仲介。"],
        heroAccent: "ボスポラス",
        heroSub: "イスタンブールのタンカー＆LPGシップブローカー",
        whatsapp: "WhatsAppでデスクへ",
        sceneHero: "夜明け · 出港",
        sceneWho: "地元の深さ · ボスポラスの測深",
        pause: {
          pause: "動きを停止",
          play: "動きを再生",
        },
        rail: {
          hero: "出航",
          who: "地元の深さ",
          desks: "デスク",
          ships: "船型",
          process: "進め方",
          reach: "拠点",
          team: "チーム",
          notes: "ノート",
          letter: "お問い合わせ",
        },
        subs: {
          who: "私たちについて",
          desks: "デスクとサービス",
          ships: "扱う船型",
          reach: "活動エリア",
          team: "チーム",
          notes: "デスクから",
          contact: "お問い合わせ",
        },
        statement:
          "扱うのは液体貨物だけ。ボスポラス海峡のデスクからタンカーとガス船を仲介するため、どのブローカーも船、ターミナル、海峡を深く理解しています。",
        about: "LEVANTERについて（英語）",
        pin: "イスタンブール・デスク",
        factLinks: [
          "トルコ海峡ガイド",
          "加圧式LPG船ガイド",
          "チームを見る",
          "WorldscaleとTCEの解説",
        ],
        desksLines: ["2つのデスク、", "1つの基準。"],
        desksLead:
          "あえて専門を絞っています。扱うのはタンカーとガス船だけ。スポット、定期傭船、COAから、レイタイムやクレームまで対応します。",
        howWeWork: "進め方",
        straits: {
          title: "トルコ海峡",
          text: "通航時間、待機、海峡の規則を、黒海のすべての見積りに織り込みます。",
        },
        postTitle: "成約後の対応",
        postText:
          "航海のフォロー、レイタイム、デマレージ、クレームを、成約したブローカー本人が担当します。",
        rowLinks: [
          "タンカーデスク",
          "LPG・アンモニアデスク",
          "トルコ海峡ガイド",
          "レイタイムとデマレージのガイド",
        ],
        captions: [
          "タンカーデスク · イスタンブール",
          "LPG・アンモニアデスク",
          "ボスポラス · カラキョイ",
          "揚げ地 · 夕暮れ",
        ],
        open: "開く",
        ships: {
          title: "VLCCから加圧式LPG船まで。",
          tanker: "タンカー",
          gas: "ガス船",
          classGuide: "船型ガイド",
          prev: "前の船型",
          next: "次の船型",
          family: "船の種類",
        },
        reachLines: ["3つの拠点、", "1つのデスク。"],
        counters: [
          "分以内に初回返信（営業時間内）",
          "の船型、VLCCから加圧式LPG船まで",
          "つの拠点、3つのタイムゾーン",
          "つのデスク：タンカー、LPG・アンモニア",
        ],
        localTime: "現地時間",
        mapLabel:
          "ヨーロッパからシンガポールまでの活動エリアの地図。イスタンブールからの航路と3つの拠点を示しています",
        lanesLabel: "主な航路",
        teamLines: ["交換台ではなく、", "ブローカーと直接。"],
        teamLead: "2つのデスクの9人のブローカー。全員にメールやWhatsAppで直接連絡できます。",
        teamCta: "チームを見る（英語）",
        email: "{name}にメール",
        notesTitle: "デスクからのノート。",
        allPosts: "すべての記事（英語）",
        askDesk: "デスクに質問",
        letterLabel: "ボスポラスから",
        dutyTitle: "営業時間外の成約案件ですか？",
        dutyText: "当番ブローカーにWhatsAppで——{number}。夜間・週末も対応します。",
        phone: "電話 · イスタンブール",
        calc: {
          label: "運賃計算ツール",
          title: "航海を見積もる。",
          text: "港・船型・貨物を入力すると、距離、航海日数、航海費用の目安がわかります。デスクに相談する前の最初の目安に。",
          cta: "計算ツールを開く（英語）",
          estimate: "航海を見積もる",
        },
      },
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
      deskLinesTitle: "데스크 직통 연락처",
      deskNote: "영업시간 중에는 60분 이내에 브로커가 회신합니다.",
      stepsEyebrow: "진행 방식",
      stepsTitle: "네 단계, 처음부터 끝까지 한 명의 브로커.",
      newTab: "(새 탭에서 열림)",
      fab: "WhatsApp으로 브로커와 상담",
      formNote: "문의 양식은 영어로 되어 있습니다.",
      rail: { label: "이 페이지의 내용", overview: "개요", contact: "문의" },
      home: {
        heroLines: ["보스포루스의", "유조선·가스선", "중개."],
        heroAccent: "보스포루스의",
        heroSub: "이스탄불 유조선 & LPG 선박 중개",
        whatsapp: "WhatsApp으로 데스크 연락",
        sceneHero: "새벽 · 출항",
        sceneWho: "현지의 깊이 · 보스포루스 수심",
        pause: {
          pause: "움직임 일시정지",
          play: "움직임 재생",
        },
        rail: {
          hero: "출항",
          who: "현지의 깊이",
          desks: "데스크",
          ships: "선형",
          process: "진행 방식",
          reach: "사무소",
          team: "팀",
          notes: "노트",
          letter: "문의",
        },
        subs: {
          who: "회사 소개",
          desks: "데스크와 서비스",
          ships: "중개하는 선형",
          reach: "활동 지역",
          team: "팀",
          notes: "데스크에서",
          contact: "문의",
        },
        statement:
          "액체 화물만, 그 외에는 없습니다. 보스포루스의 데스크에서 유조선과 가스선을 중개하기에 모든 브로커가 선박, 터미널, 해협을 깊이 압니다.",
        about: "LEVANTER 소개 (영문)",
        pin: "이스탄불 데스크",
        factLinks: ["터키 해협 가이드", "가압식 LPG선 가이드", "팀 소개", "Worldscale과 TCE 설명"],
        desksLines: ["두 개의 데스크,", "하나의 기준."],
        desksLead:
          "일부러 좁게 집중합니다. 유조선과 가스선만 중개합니다. 스팟, 정기용선, COA부터 정박 기간과 클레임까지.",
        howWeWork: "진행 방식",
        straits: {
          title: "터키 해협",
          text: "통항 시간, 대기, 해협 규정을 모든 흑해 견적에 반영합니다.",
        },
        postTitle: "성약 이후",
        postText: "항해 관리, 정박 기간, 체선료, 클레임까지 성약한 브로커가 직접 처리합니다.",
        rowLinks: [
          "유조선 데스크",
          "LPG·암모니아 데스크",
          "터키 해협 가이드",
          "정박 기간과 체선료 가이드",
        ],
        captions: [
          "유조선 데스크 · 이스탄불",
          "LPG·암모니아 데스크",
          "보스포루스 · 카라쾨이",
          "양하항 · 해 질 녘",
        ],
        open: "펼치기",
        ships: {
          title: "VLCC부터 가압식 LPG선까지.",
          tanker: "유조선",
          gas: "가스선",
          classGuide: "선형 가이드",
          prev: "이전 선형",
          next: "다음 선형",
          family: "선박 종류",
        },
        reachLines: ["세 개의 사무소,", "하나의 데스크."],
        counters: [
          "분 이내 첫 회신 (영업시간)",
          "개 선형, VLCC부터 가압식 LPG선까지",
          "개 사무소, 세 개의 시간대",
          "개 데스크: 유조선, LPG·암모니아",
        ],
        localTime: "현지 시각",
        mapLabel:
          "유럽에서 싱가포르까지의 활동 지역 지도. 이스탄불에서 출발하는 항로와 세 사무소를 표시합니다",
        lanesLabel: "주요 항로",
        teamLines: ["교환대가 아닌", "브로커와 직접."],
        teamLead:
          "두 데스크의 브로커 아홉 명, 모두 이메일이나 WhatsApp으로 직접 연락할 수 있습니다.",
        teamCta: "팀 소개 (영문)",
        email: "{name}에게 이메일",
        notesTitle: "데스크에서 온 노트.",
        allPosts: "모든 글 (영문)",
        askDesk: "데스크에 문의",
        letterLabel: "보스포루스에서",
        dutyTitle: "영업시간 외 진행 중인 성약?",
        dutyText: "당직 브로커에게 WhatsApp — {number}. 저녁과 주말에도 응답합니다.",
        phone: "전화 · 이스탄불",
        calc: {
          label: "운임 계산기",
          title: "항차를 견적해 보세요.",
          text: "항구, 선형, 화물을 입력하면 거리, 항해 일수, 항차 비용의 대략적인 견적이 나옵니다. 데스크에 문의하기 전 첫 감을 잡아 보세요.",
          cta: "계산기 열기 (영문)",
          estimate: "항차 견적",
        },
      },
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
      deskLinesTitle: "Απευθείας γραμμές τμημάτων",
      deskNote: "Ένας μεσίτης απαντά μέσα σε 60 λεπτά τις εργάσιμες ώρες.",
      stepsEyebrow: "Πώς δουλεύουμε",
      stepsTitle: "Τέσσερα βήματα, ένας μεσίτης από την αρχή ως το τέλος.",
      newTab: "(ανοίγει σε νέα καρτέλα)",
      fab: "Μιλήστε με μεσίτη στο WhatsApp",
      formNote: "Η φόρμα ερωτήματος είναι στα αγγλικά.",
      rail: { label: "Σε αυτή τη σελίδα", overview: "Επισκόπηση", contact: "Επικοινωνία" },
      home: {
        heroLines: ["Δεξαμενόπλοια", "& αέρια, από", "τον Βόσπορο."],
        heroAccent: "Βόσπορο.",
        heroSub: "Ναυλομεσίτες δεξαμενόπλοιων & LPG, Κωνσταντινούπολη",
        whatsapp: "WhatsApp στο γραφείο",
        sceneHero: "Αυγή · απόπλους",
        sceneWho: "Τοπικό βάθος · βυθομετρήσεις Βοσπόρου",
        pause: {
          pause: "Παύση κίνησης",
          play: "Αναπαραγωγή κίνησης",
        },
        rail: {
          hero: "Απόπλους",
          who: "Τοπικό βάθος",
          desks: "Τμήματα",
          ships: "Πλοία",
          process: "Πώς δουλεύουμε",
          reach: "Εμβέλεια",
          team: "Ομάδα",
          notes: "Σημειώσεις",
          letter: "Επικοινωνία",
        },
        subs: {
          who: "Ποιοι είμαστε",
          desks: "Τμήματα & υπηρεσίες",
          ships: "Τα πλοία μας",
          reach: "Πού δουλεύουμε",
          team: "Η ομάδα μας",
          notes: "Από το γραφείο",
          contact: "Επικοινωνία",
        },
        statement:
          "Υγρά φορτία, τίποτε άλλο. Ναυλώνουμε δεξαμενόπλοια και υγραεριοφόρα από ένα γραφείο στον Βόσπορο, ώστε κάθε μεσίτης να γνωρίζει σε βάθος τα πλοία, τους τερματικούς σταθμούς και τα Στενά.",
        about: "Σχετικά με τη LEVANTER (αγγλικά)",
        pin: "Γραφείο Κωνσταντινούπολης",
        factLinks: [
          "Οδηγός Τουρκικών Στενών",
          "Οδηγός LPG υπό πίεση",
          "Η ομάδα",
          "Worldscale & TCE",
        ],
        desksLines: ["Δύο τμήματα.", "Ένα πρότυπο."],
        desksLead:
          "Μένουμε εστιασμένοι σκόπιμα: μόνο δεξαμενόπλοια και υγραεριοφόρα — spot, χρονοναυλώσεις και COA, μέχρι το laytime και τις απαιτήσεις.",
        howWeWork: "Πώς δουλεύουμε",
        straits: {
          title: "Τουρκικά Στενά",
          text: "Χρόνος διέλευσης, αναμονή και κανόνες των Στενών, σε κάθε ναύλωση Μαύρης Θάλασσας που προτείνουμε.",
        },
        postTitle: "Μετά το κλείσιμο",
        postText:
          "Παρακολούθηση ταξιδιού, laytime, επισταλίες και απαιτήσεις, από τον μεσίτη που έκλεισε το πλοίο.",
        rowLinks: [
          "Τμήμα δεξαμενόπλοιων",
          "Τμήμα LPG & αμμωνίας",
          "Οδηγός Τουρκικών Στενών",
          "Οδηγός laytime & επισταλιών",
        ],
        captions: [
          "Δεξαμενόπλοια · Κωνσταντινούπολη",
          "Τμήμα LPG & αμμωνίας",
          "Βόσπορος · Καράκιοϊ",
          "Λιμάνι εκφόρτωσης · σούρουπο",
        ],
        open: "Άνοιγμα",
        ships: {
          title: "Από VLCC έως LPG υπό πίεση.",
          tanker: "Δεξαμενόπλοια",
          gas: "Αέρια",
          classGuide: "Οδηγός τύπου",
          prev: "Προηγούμενος τύπος",
          next: "Επόμενος τύπος",
          family: "Κατηγορία πλοίου",
        },
        reachLines: ["Τρία γραφεία.", "Ένα τμήμα."],
        counters: [
          "λεπτά για πρώτη απάντηση, τις εργάσιμες ώρες",
          "τύποι πλοίων, από VLCC έως LPG υπό πίεση",
          "γραφεία σε τρεις ζώνες ώρας",
          "τμήματα — δεξαμενόπλοια, LPG & αμμωνία",
        ],
        localTime: "τοπική ώρα",
        mapLabel:
          "Χάρτης της περιοχής μας από την Ευρώπη έως τη Σιγκαπούρη, με τα δρομολόγια από την Κωνσταντινούπολη και τα τρία γραφεία μας",
        lanesLabel: "Δρομολόγια που δουλεύουμε",
        teamLines: ["Μιλήστε με τον μεσίτη,", "όχι με τηλεφωνικό κέντρο."],
        teamLead:
          "Εννέα μεσίτες σε δύο τμήματα, ο καθένας προσβάσιμος απευθείας με email ή WhatsApp.",
        teamCta: "Η ομάδα (στα αγγλικά)",
        email: "Email στον/στην {name}",
        notesTitle: "Σημειώσεις από το γραφείο.",
        allPosts: "Όλα τα άρθρα (αγγλικά)",
        askDesk: "Ρωτήστε το γραφείο",
        letterLabel: "Από τον Βόσπορο",
        dutyTitle: "Ζωντανή ναύλωση εκτός ωραρίου;",
        dutyText: "WhatsApp στον μεσίτη υπηρεσίας — {number}. Απαντά βράδια και Σαββατοκύριακα.",
        phone: "Τηλέφωνο · Κωνσταντινούπολη",
        calc: {
          label: "Υπολογιστής ναύλου",
          title: "Εκτιμήστε ένα ταξίδι.",
          text: "Λιμάνια, πλοίο και φορτίο — απόσταση, ημέρες στη θάλασσα και μια ενδεικτική εκτίμηση του ταξιδιού, πριν ρωτήσετε το γραφείο.",
          cta: "Ο υπολογιστής (στα αγγλικά)",
          estimate: "Εκτίμηση ταξιδιού",
        },
      },
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
      deskLinesTitle: "Direktelinjer til deskene",
      deskNote: "En megler svarer innen 60 minutter i arbeidstiden.",
      stepsEyebrow: "Slik jobber vi",
      stepsTitle: "Fire steg, én megler hele veien.",
      newTab: "(åpnes i ny fane)",
      fab: "Kontakt en megler på WhatsApp",
      formNote: "Forespørselsskjemaet er på engelsk.",
      rail: { label: "På denne siden", overview: "Oversikt", contact: "Kontakt" },
      home: {
        heroLines: ["Tank og gass,", "meglet fra", "Bosporos."],
        heroAccent: "Bosporos.",
        heroSub: "Skipsmeglere for tank og LPG, Istanbul",
        whatsapp: "WhatsApp desken",
        sceneHero: "Daggry · utgående",
        sceneWho: "Lokal dybde · lodding i Bosporos",
        pause: {
          pause: "Stopp bevegelse",
          play: "Spill av bevegelse",
        },
        rail: {
          hero: "Avgang",
          who: "Lokal dybde",
          desks: "Desker",
          ships: "Skip",
          process: "Slik jobber vi",
          reach: "Rekkevidde",
          team: "Team",
          notes: "Notater",
          letter: "Kontakt",
        },
        subs: {
          who: "Hvem vi er",
          desks: "Desker og tjenester",
          ships: "Skip vi slutter",
          reach: "Hvor vi jobber",
          team: "Teamet vårt",
          notes: "Fra desken",
          contact: "Kontakt",
        },
        statement:
          "Flytende last, ikke noe annet. Vi megler tankskip og gasskip fra en desk ved Bosporos, så hver megler kjenner skipene, terminalene og stredene i dybden.",
        about: "Om LEVANTER (engelsk)",
        pin: "Istanbul-desken",
        factLinks: [
          "Guide til De tyrkiske stredene",
          "Guide til trykksatte LPG-skip",
          "Møt teamet",
          "Worldscale og TCE forklart",
        ],
        desksLines: ["To desker.", "Én standard."],
        desksLead:
          "Vi holder oss smale med vilje: tankskip og gasskip er alt vi megler — spot, timecharter og COA, helt til liggetid og krav.",
        howWeWork: "Slik jobber vi",
        straits: {
          title: "De tyrkiske stredene",
          text: "Transittid, venting og stredenes regler regnes inn i hver Svartehavs-fiksering vi gir tall på.",
        },
        postTitle: "Etter slutning",
        postText:
          "Reiseoppfølging, liggetid, overliggedager og krav, håndtert av megleren som sluttet skipet.",
        rowLinks: [
          "Tankdesken",
          "LPG- og ammoniakkdesken",
          "Guide til De tyrkiske stredene",
          "Guide til liggetid og overligg",
        ],
        captions: [
          "Tankdesk · Istanbul",
          "LPG- og ammoniakkdesk",
          "Bosporos · Karaköy",
          "Lossehavn · skumring",
        ],
        open: "Vis",
        ships: {
          title: "Fra VLCC til trykksatt LPG.",
          tanker: "Tank",
          gas: "Gass",
          classGuide: "Klasseguide",
          prev: "Forrige klasse",
          next: "Neste klasse",
          family: "Skipstype",
        },
        reachLines: ["Tre kontorer.", "Én desk."],
        counters: [
          "minutter til første svar, i arbeidstiden",
          "skipsklasser, fra VLCC til trykksatt LPG",
          "kontorer i tre tidssoner",
          "desker — tank, og LPG og ammoniakk",
        ],
        localTime: "lokal tid",
        mapLabel:
          "Kart over området vårt fra Europa til Singapore, med ruter fra Istanbul og våre tre kontorer",
        lanesLabel: "Ruter vi jobber med",
        teamLines: ["Snakk med megleren,", "ikke et sentralbord."],
        teamLead: "Ni meglere på to desker, alle direkte tilgjengelige på e-post eller WhatsApp.",
        teamCta: "Møt teamet (engelsk)",
        email: "E-post til {name}",
        notesTitle: "Notater fra desken.",
        allPosts: "Alle innlegg (engelsk)",
        askDesk: "Spør desken",
        letterLabel: "Fra Bosporos",
        dutyTitle: "Levende slutning etter arbeidstid?",
        dutyText: "WhatsApp vaktmegleren — {number}. Besvares kvelder og helger.",
        phone: "Telefon · Istanbul",
        calc: {
          label: "Fraktkalkulator",
          title: "Beregn en reise.",
          text: "Havner, skip og last inn — distanse, dager i sjøen og et veiledende reiseestimat ut. En første pekepinn før du spør desken.",
          cta: "Åpne kalkulatoren (engelsk)",
          estimate: "Beregn en reise",
        },
      },
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
      deskLinesTitle: "Direkte linjer til deskene",
      deskNote: "En mægler svarer inden for 60 minutter i arbejdstiden.",
      stepsEyebrow: "Sådan arbejder vi",
      stepsTitle: "Fire trin, én mægler hele vejen.",
      newTab: "(åbner i en ny fane)",
      fab: "Skriv til en mægler på WhatsApp",
      formNote: "Forespørgselsformularen er på engelsk.",
      rail: { label: "På denne side", overview: "Oversigt", contact: "Kontakt" },
      home: {
        heroLines: ["Tank og gas,", "mæglet fra", "Bosporus."],
        heroAccent: "Bosporus.",
        heroSub: "Skibsmæglere for tank og LPG, Istanbul",
        whatsapp: "WhatsApp desken",
        sceneHero: "Daggry · udgående",
        sceneWho: "Lokal dybde · lodskud i Bosporus",
        pause: {
          pause: "Stop bevægelse",
          play: "Afspil bevægelse",
        },
        rail: {
          hero: "Afgang",
          who: "Lokal dybde",
          desks: "Desks",
          ships: "Skibe",
          process: "Sådan arbejder vi",
          reach: "Rækkevidde",
          team: "Team",
          notes: "Noter",
          letter: "Kontakt",
        },
        subs: {
          who: "Hvem vi er",
          desks: "Desks og ydelser",
          ships: "Skibe vi lukker",
          reach: "Hvor vi arbejder",
          team: "Vores team",
          notes: "Fra desken",
          contact: "Kontakt",
        },
        statement:
          "Flydende last, intet andet. Vi mægler tankskibe og gastankskibe fra en desk ved Bosporus, så hver mægler kender skibene, terminalerne og strædet i dybden.",
        about: "Om LEVANTER (engelsk)",
        pin: "Istanbul-desken",
        factLinks: [
          "Guide til De Tyrkiske Stræder",
          "Guide til LPG-trykskibe",
          "Mød teamet",
          "Worldscale og TCE forklaret",
        ],
        desksLines: ["To desks.", "Én standard."],
        desksLead:
          "Vi holder os smalle med vilje: tankskibe og gastankskibe er alt, vi mægler — spot, tidsbefragtning og COA, helt til liggetid og krav.",
        howWeWork: "Sådan arbejder vi",
        straits: {
          title: "De tyrkiske stræder",
          text: "Transittid, ventetid og strædernes regler indgår i hver befragtning i Sortehavet, vi regner på.",
        },
        postTitle: "Efter lukning",
        postText:
          "Rejseopfølgning, liggetid, overliggetid og krav, håndteret af mægleren, der lukkede skibet.",
        rowLinks: [
          "Tankdesken",
          "LPG- og ammoniakdesken",
          "Guide til De Tyrkiske Stræder",
          "Guide til liggetid og overliggetid",
        ],
        captions: [
          "Tankdesk · Istanbul",
          "LPG- og ammoniakdesk",
          "Bosporus · Karaköy",
          "Lossehavn · skumring",
        ],
        open: "Vis",
        ships: {
          title: "Fra VLCC til tryk-LPG.",
          tanker: "Tank",
          gas: "Gas",
          classGuide: "Klasseguide",
          prev: "Forrige klasse",
          next: "Næste klasse",
          family: "Skibstype",
        },
        reachLines: ["Tre kontorer.", "Én desk."],
        counters: [
          "minutter til første svar, i arbejdstiden",
          "skibsklasser, fra VLCC til tryk-LPG",
          "kontorer i tre tidszoner",
          "desks — tank, og LPG og ammoniak",
        ],
        localTime: "lokal tid",
        mapLabel:
          "Kort over vores område fra Europa til Singapore, med ruter fra Istanbul og vores tre kontorer",
        lanesLabel: "Ruter vi arbejder med",
        teamLines: ["Tal med mægleren,", "ikke et omstillingsbord."],
        teamLead: "Ni mæglere på to desks, alle direkte tilgængelige på e-mail eller WhatsApp.",
        teamCta: "Mød teamet (engelsk)",
        email: "E-mail til {name}",
        notesTitle: "Noter fra desken.",
        allPosts: "Alle indlæg (engelsk)",
        askDesk: "Spørg desken",
        letterLabel: "Fra Bosporus",
        dutyTitle: "Aktiv befragtning uden for arbejdstid?",
        dutyText: "WhatsApp vagtmægleren — {number}. Besvares aftener og weekender.",
        phone: "Telefon · Istanbul",
        calc: {
          label: "Fragtberegner",
          title: "Beregn en rejse.",
          text: "Havne, skib og last ind — distance, dage til søs og et vejledende rejseestimat ud. Et første bud, før du spørger desken.",
          cta: "Åbn beregneren (engelsk)",
          estimate: "Beregn en rejse",
        },
      },
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
      deskLinesTitle: "Direktlinjer till deskarna",
      deskNote: "En mäklare svarar inom 60 minuter under arbetstid.",
      stepsEyebrow: "Så arbetar vi",
      stepsTitle: "Fyra steg, en mäklare hela vägen.",
      newTab: "(öppnas i en ny flik)",
      fab: "Kontakta en mäklare på WhatsApp",
      formNote: "Förfrågningsformuläret är på engelska.",
      rail: { label: "På den här sidan", overview: "Översikt", contact: "Kontakt" },
      home: {
        heroLines: ["Tank och gas,", "mäklat från", "Bosporen."],
        heroAccent: "Bosporen.",
        heroSub: "Skeppsmäklare för tank och LPG, Istanbul",
        whatsapp: "WhatsApp desken",
        sceneHero: "Gryning · utgående",
        sceneWho: "Lokalt djup · lodningar i Bosporen",
        pause: {
          pause: "Pausa rörelse",
          play: "Spela rörelse",
        },
        rail: {
          hero: "Avgång",
          who: "Lokalt djup",
          desks: "Desker",
          ships: "Fartyg",
          process: "Så arbetar vi",
          reach: "Räckvidd",
          team: "Team",
          notes: "Anteckningar",
          letter: "Kontakt",
        },
        subs: {
          who: "Vilka vi är",
          desks: "Desker och tjänster",
          ships: "Fartyg vi avslutar",
          reach: "Var vi arbetar",
          team: "Vårt team",
          notes: "Från desken",
          contact: "Kontakt",
        },
        statement:
          "Flytande last, inget annat. Vi mäklar tankfartyg och gastankfartyg från en desk vid Bosporen, så varje mäklare känner fartygen, terminalerna och sunden på djupet.",
        about: "Om LEVANTER (engelska)",
        pin: "Istanbul-desken",
        factLinks: [
          "Guide till Turkiska sunden",
          "Guide till trycksatt LPG",
          "Möt teamet",
          "Worldscale och TCE förklarat",
        ],
        desksLines: ["Två desker.", "En standard."],
        desksLead:
          "Vi håller oss smala med avsikt: tankfartyg och gastankfartyg är allt vi mäklar — spot, tidsbefraktning och COA, ända till liggetid och krav.",
        howWeWork: "Så arbetar vi",
        straits: {
          title: "Turkiska sunden",
          text: "Transittid, väntan och sundens regler räknas in i varje befraktning i Svarta havet som vi offererar.",
        },
        postTitle: "Efter avslut",
        postText:
          "Resuppföljning, liggetid, överliggetid och krav, hanterade av mäklaren som avslutade fartyget.",
        rowLinks: [
          "Tankdesken",
          "LPG- och ammoniakdesken",
          "Guide till Turkiska sunden",
          "Guide till liggetid och överliggetid",
        ],
        captions: [
          "Tankdesk · Istanbul",
          "LPG- och ammoniakdesk",
          "Bosporen · Karaköy",
          "Lossningshamn · skymning",
        ],
        open: "Visa",
        ships: {
          title: "Från VLCC till trycksatt LPG.",
          tanker: "Tank",
          gas: "Gas",
          classGuide: "Klassguide",
          prev: "Föregående klass",
          next: "Nästa klass",
          family: "Fartygstyp",
        },
        reachLines: ["Tre kontor.", "En desk."],
        counters: [
          "minuter till första svar, under arbetstid",
          "fartygsklasser, från VLCC till trycksatt LPG",
          "kontor i tre tidszoner",
          "desker — tank, och LPG och ammoniak",
        ],
        localTime: "lokal tid",
        mapLabel:
          "Karta över vårt område från Europa till Singapore, med rutter från Istanbul och våra tre kontor",
        lanesLabel: "Rutter vi arbetar med",
        teamLines: ["Tala med mäklaren,", "inte en växel."],
        teamLead: "Nio mäklare på två desker, alla nåbara direkt via e-post eller WhatsApp.",
        teamCta: "Möt teamet (engelska)",
        email: "E-post till {name}",
        notesTitle: "Anteckningar från desken.",
        allPosts: "Alla inlägg (engelska)",
        askDesk: "Fråga desken",
        letterLabel: "Från Bosporen",
        dutyTitle: "Pågående avslut efter arbetstid?",
        dutyText: "WhatsApp jourmäklaren — {number}. Besvaras kvällar och helger.",
        phone: "Telefon · Istanbul",
        calc: {
          label: "Fraktkalkylator",
          title: "Uppskatta en resa.",
          text: "Hamnar, fartyg och last in — distans, dagar till sjöss och en vägledande reseuppskattning ut, innan du frågar desken.",
          cta: "Öppna kalkylatorn (engelska)",
          estimate: "Uppskatta en resa",
        },
      },
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
      deskLinesTitle: "Direkte Leitungen zu den Desks",
      deskNote: "Ein Makler antwortet innerhalb von 60 Minuten während der Geschäftszeiten.",
      stepsEyebrow: "So arbeiten wir",
      stepsTitle: "Vier Schritte, ein Makler von Anfang bis Ende.",
      newTab: "(öffnet in einem neuen Tab)",
      fab: "Makler per WhatsApp kontaktieren",
      formNote: "Das Anfrageformular ist auf Englisch.",
      rail: { label: "Auf dieser Seite", overview: "Überblick", contact: "Kontakt" },
      home: {
        heroLines: ["Tanker & Gas,", "vermittelt", "vom Bosporus."],
        heroAccent: "Bosporus.",
        heroSub: "Schiffsmakler für Tanker & LPG, Istanbul",
        whatsapp: "Desk per WhatsApp",
        sceneHero: "Morgengrauen · auslaufend",
        sceneWho: "Lokale Tiefe · Lotungen im Bosporus",
        pause: {
          pause: "Bewegung anhalten",
          play: "Bewegung abspielen",
        },
        rail: {
          hero: "Abfahrt",
          who: "Lokale Tiefe",
          desks: "Desks",
          ships: "Schiffe",
          process: "So arbeiten wir",
          reach: "Reichweite",
          team: "Team",
          notes: "Notizen",
          letter: "Kontakt",
        },
        subs: {
          who: "Wer wir sind",
          desks: "Desks & Leistungen",
          ships: "Schiffe, die wir befrachten",
          reach: "Wo wir arbeiten",
          team: "Unser Team",
          notes: "Vom Desk",
          contact: "Kontakt",
        },
        statement:
          "Flüssige Ladung, nichts anderes. Wir vermitteln Tanker und Gastanker von einem Desk am Bosporus aus – so kennt jeder Makler die Schiffe, die Terminals und die Meerengen im Detail.",
        about: "Über LEVANTER (Englisch)",
        pin: "Desk Istanbul",
        factLinks: [
          "Leitfaden Türkische Meerengen",
          "Leitfaden Druckgastanker",
          "Das Team",
          "Worldscale & TCE erklärt",
        ],
        desksLines: ["Zwei Desks.", "Ein Standard."],
        desksLead:
          "Wir bleiben bewusst schmal: Tanker und Gastanker sind alles, was wir vermitteln – Spot, Zeitcharter und COA, bis zu Liegezeit und Claims.",
        howWeWork: "So arbeiten wir",
        straits: {
          title: "Türkische Meerengen",
          text: "Transitzeiten, Wartezeiten und die Regeln der Meerengen fließen in jede Schwarzmeer-Befrachtung ein, die wir anbieten.",
        },
        postTitle: "Nach dem Abschluss",
        postText:
          "Reisebegleitung, Liegezeit, Liegegeld und Claims – vom Makler, der das Schiff befrachtet hat.",
        rowLinks: [
          "Tanker-Desk",
          "LPG- & Ammoniak-Desk",
          "Leitfaden Türkische Meerengen",
          "Leitfaden Liegezeit & Liegegeld",
        ],
        captions: [
          "Tanker-Desk · Istanbul",
          "LPG- & Ammoniak-Desk",
          "Bosporus · Karaköy",
          "Löschhafen · Abenddämmerung",
        ],
        open: "Öffnen",
        ships: {
          title: "Vom VLCC bis zum Druckgastanker.",
          tanker: "Tanker",
          gas: "Gas",
          classGuide: "Klassenleitfaden",
          prev: "Vorige Klasse",
          next: "Nächste Klasse",
          family: "Schiffstyp",
        },
        reachLines: ["Drei Büros.", "Ein Desk."],
        counters: [
          "Minuten bis zur ersten Antwort, zu Bürozeiten",
          "Schiffsklassen, vom VLCC bis zum Druckgastanker",
          "Büros in drei Zeitzonen",
          "Desks — Tanker sowie LPG & Ammoniak",
        ],
        localTime: "Ortszeit",
        mapLabel:
          "Karte unseres Fahrtgebiets von Europa bis Singapur, mit Routen ab Istanbul und unseren drei Büros",
        lanesLabel: "Routen, die wir bedienen",
        teamLines: ["Sprechen Sie mit dem Makler,", "nicht mit der Zentrale."],
        teamLead: "Neun Makler an zwei Desks, jeder direkt per E-Mail oder WhatsApp erreichbar.",
        teamCta: "Das Team (Englisch)",
        email: "E-Mail an {name}",
        notesTitle: "Notizen vom Desk.",
        allPosts: "Alle Beiträge (Englisch)",
        askDesk: "Den Desk fragen",
        letterLabel: "Vom Bosporus",
        dutyTitle: "Laufender Abschluss nach Feierabend?",
        dutyText:
          "WhatsApp an den diensthabenden Makler — {number}. Abends und am Wochenende erreichbar.",
        phone: "Telefon · Istanbul",
        calc: {
          label: "Frachtrechner",
          title: "Eine Reise abschätzen.",
          text: "Häfen, Schiff und Ladung rein — Distanz, Seetage und eine unverbindliche Reiseschätzung raus, bevor Sie den Desk fragen.",
          cta: "Zum Rechner (Englisch)",
          estimate: "Reise schätzen",
        },
      },
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
      deskLinesTitle: "Líneas directas de las mesas",
      deskNote: "Un corredor responde en 60 minutos en horario laboral.",
      stepsEyebrow: "Cómo trabajamos",
      stepsTitle: "Cuatro pasos, un mismo corredor de principio a fin.",
      newTab: "(se abre en una pestaña nueva)",
      fab: "Escriba a un corredor por WhatsApp",
      formNote: "El formulario de consulta está en inglés.",
      rail: { label: "En esta página", overview: "Resumen", contact: "Contacto" },
      home: {
        heroLines: ["Petroleros y", "gaseros, desde", "el Bósforo."],
        heroAccent: "Bósforo.",
        heroSub: "Corredores de petroleros y GLP, Estambul",
        whatsapp: "WhatsApp a la mesa",
        sceneHero: "Amanecer · zarpando",
        sceneWho: "Profundidad local · sondeos del Bósforo",
        pause: {
          pause: "Pausar movimiento",
          play: "Reanudar movimiento",
        },
        rail: {
          hero: "Salida",
          who: "Profundidad local",
          desks: "Mesas",
          ships: "Buques",
          process: "Cómo trabajamos",
          reach: "Alcance",
          team: "Equipo",
          notes: "Notas",
          letter: "Contacto",
        },
        subs: {
          who: "Quiénes somos",
          desks: "Mesas y servicios",
          ships: "Buques que fletamos",
          reach: "Dónde trabajamos",
          team: "Nuestro equipo",
          notes: "Desde la mesa",
          contact: "Contacto",
        },
        statement:
          "Cargas líquidas, nada más. Fletamos petroleros y gaseros desde una mesa en el Bósforo, así que cada corredor conoce a fondo los buques, las terminales y los Estrechos.",
        about: "Sobre LEVANTER (en inglés)",
        pin: "Mesa de Estambul",
        factLinks: [
          "Guía de los Estrechos turcos",
          "Guía de GLP presurizado",
          "Conozca al equipo",
          "Worldscale y TCE explicados",
        ],
        desksLines: ["Dos mesas.", "Un mismo estándar."],
        desksLead:
          "Nos mantenemos enfocados a propósito: solo petroleros y gaseros — spot, time charter y COA, hasta las estadías y las reclamaciones.",
        howWeWork: "Cómo trabajamos",
        straits: {
          title: "Estrechos turcos",
          text: "Tiempos de tránsito, esperas y normas de los estrechos, incluidos en cada fletamento del mar Negro que cotizamos.",
        },
        postTitle: "Posfijación",
        postText:
          "Seguimiento del viaje, estadías, sobrestadías y reclamaciones, a cargo del corredor que fijó el buque.",
        rowLinks: [
          "Mesa de petroleros",
          "Mesa de GLP y amoníaco",
          "Guía de los Estrechos turcos",
          "Guía de estadías y sobrestadías",
        ],
        captions: [
          "Mesa de petroleros · Estambul",
          "Mesa de GLP y amoníaco",
          "El Bósforo · Karaköy",
          "Puerto de descarga · anochecer",
        ],
        open: "Abrir",
        ships: {
          title: "Del VLCC al GLP presurizado.",
          tanker: "Petroleros",
          gas: "Gaseros",
          classGuide: "Guía del tipo",
          prev: "Tipo anterior",
          next: "Tipo siguiente",
          family: "Tipo de buque",
        },
        reachLines: ["Tres oficinas.", "Una mesa."],
        counters: [
          "minutos hasta la primera respuesta, en horario laboral",
          "tipos de buque, del VLCC al GLP presurizado",
          "oficinas en tres husos horarios",
          "mesas: petroleros, y GLP y amoníaco",
        ],
        localTime: "hora local",
        mapLabel:
          "Mapa de nuestra zona de Europa a Singapur, con rutas desde Estambul y nuestras tres oficinas",
        lanesLabel: "Rutas que trabajamos",
        teamLines: ["Hable con el corredor,", "no con una centralita."],
        teamLead:
          "Nueve corredores en dos mesas, todos localizables directamente por correo o WhatsApp.",
        teamCta: "Conozca al equipo (en inglés)",
        email: "Correo a {name}",
        notesTitle: "Notas desde la mesa.",
        allPosts: "Todas las notas (en inglés)",
        askDesk: "Pregunte a la mesa",
        letterLabel: "Desde el Bósforo",
        dutyTitle: "¿Fijación en curso fuera de horario?",
        dutyText: "WhatsApp al corredor de guardia — {number}. Atiende tardes y fines de semana.",
        phone: "Teléfono · Estambul",
        calc: {
          label: "Calculadora de fletes",
          title: "Estime un viaje.",
          text: "Puertos, buque y carga: distancia, días de mar y una estimación orientativa del viaje, antes de consultar a la mesa.",
          cta: "Abrir la calculadora (en inglés)",
          estimate: "Estimar un viaje",
        },
      },
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
      deskLinesTitle: "خطوط مباشرة إلى الأقسام",
      deskNote: "يرد وسيط خلال 60 دقيقة أثناء ساعات العمل.",
      stepsEyebrow: "طريقة عملنا",
      stepsTitle: "أربع خطوات، ووسيط واحد طوال الطريق.",
      newTab: "(يفتح في علامة تبويب جديدة)",
      fab: "راسل وسيطًا عبر واتساب",
      formNote: "نموذج الطلب باللغة الإنجليزية.",
      rail: { label: "في هذه الصفحة", overview: "نظرة عامة", contact: "اتصل بنا" },
      home: {
        heroLines: ["النفط والغاز،", "بوساطة من", "البوسفور."],
        heroAccent: "البوسفور.",
        heroSub: "وساطة ناقلات النفط والغاز المسال، إسطنبول",
        whatsapp: "واتساب القسم",
        sceneHero: "الفجر · إبحار",
        sceneWho: "عمق محلي · أعماق البوسفور",
        pause: {
          pause: "إيقاف الحركة",
          play: "تشغيل الحركة",
        },
        rail: {
          hero: "الإبحار",
          who: "عمق محلي",
          desks: "الأقسام",
          ships: "السفن",
          process: "طريقة عملنا",
          reach: "النطاق",
          team: "الفريق",
          notes: "مقالات",
          letter: "اتصل بنا",
        },
        subs: {
          who: "من نحن",
          desks: "الأقسام والخدمات",
          ships: "السفن التي نؤجرها",
          reach: "أين نعمل",
          team: "فريقنا",
          notes: "من المكتب",
          contact: "اتصل بنا",
        },
        statement:
          "الشحنات السائلة فقط، ولا شيء غيرها. نتوسط في تأجير ناقلات النفط والغاز من مكتب على البوسفور، لذا يعرف كل وسيط السفن والمحطات والمضائق معرفةً عميقة.",
        about: "عن LEVANTER (بالإنجليزية)",
        pin: "مكتب إسطنبول",
        factLinks: [
          "دليل المضائق التركية",
          "دليل ناقلات الغاز المضغوط",
          "تعرّف على الفريق",
          "شرح Worldscale وTCE",
        ],
        desksLines: ["قسمان.", "ومعيار واحد."],
        desksLead:
          "نبقى متخصصين عن قصد: ناقلات النفط والغاز فقط — الرحلة الفورية والتأجير الزمني وعقود COA، حتى زمن الرسو والمطالبات.",
        howWeWork: "طريقة عملنا",
        straits: {
          title: "المضائق التركية",
          text: "نُدرج زمن العبور والانتظار وقواعد المضائق في كل عرض تأجير نقدمه في البحر الأسود.",
        },
        postTitle: "ما بعد الإبرام",
        postText:
          "متابعة الرحلة وزمن الرسو وغرامات التأخير والمطالبات، يتولاها الوسيط الذي أبرم الصفقة.",
        rowLinks: [
          "قسم ناقلات النفط",
          "قسم الغاز المسال والأمونيا",
          "دليل المضائق التركية",
          "دليل زمن الرسو وغرامات التأخير",
        ],
        captions: [
          "قسم ناقلات النفط · إسطنبول",
          "قسم الغاز المسال والأمونيا",
          "البوسفور · كاراكوي",
          "ميناء التفريغ · الغسق",
        ],
        open: "عرض",
        ships: {
          title: "من VLCC إلى ناقلات الغاز المضغوط.",
          tanker: "ناقلات النفط",
          gas: "ناقلات الغاز",
          classGuide: "دليل الفئة",
          prev: "الفئة السابقة",
          next: "الفئة التالية",
          family: "نوع السفينة",
        },
        reachLines: ["ثلاثة مكاتب.", "وقسم واحد."],
        counters: [
          "دقيقة حتى أول رد، في ساعات العمل",
          "فئات سفن، من VLCC إلى الغاز المضغوط",
          "مكاتب في ثلاث مناطق زمنية",
          "قسمان: ناقلات النفط، والغاز المسال والأمونيا",
        ],
        localTime: "التوقيت المحلي",
        mapLabel:
          "خريطة منطقة عملنا من أوروبا إلى سنغافورة، مع المسارات من إسطنبول ومكاتبنا الثلاثة",
        lanesLabel: "المسارات التي نعمل عليها",
        teamLines: ["تحدث إلى الوسيط،", "لا إلى مقسم هاتف."],
        teamLead:
          "تسعة وسطاء في قسمين، يمكن التواصل مع كل منهم مباشرة عبر البريد الإلكتروني أو واتساب.",
        teamCta: "تعرّف على الفريق (بالإنجليزية)",
        email: "راسل {name}",
        notesTitle: "مقالات من المكتب.",
        allPosts: "كل المقالات (بالإنجليزية)",
        askDesk: "اسأل القسم",
        letterLabel: "من البوسفور",
        dutyTitle: "صفقة جارية خارج ساعات العمل؟",
        dutyText: "راسل الوسيط المناوب عبر واتساب — {number}. نرد في المساء وعطلات نهاية الأسبوع.",
        phone: "الهاتف · إسطنبول",
        calc: {
          label: "حاسبة أجرة الشحن",
          title: "قدِّر رحلة بحرية.",
          text: "أدخل الموانئ والسفينة والشحنة، واحصل على المسافة وأيام الإبحار وتقديرٍ استرشادي للرحلة قبل أن تسأل المكتب.",
          cta: "افتح الحاسبة (بالإنجليزية)",
          estimate: "قدِّر رحلة",
        },
      },
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
