/* BeamCast website: language switch (English / Arabic), download details, offline support.
   No outside requests, no cookies; the language choice is stored only in this browser. */
(function () {
  'use strict';

  // Arabic text. **bold** and `code` are turned into elements (never parsed as HTML).
  var AR = {
    skip: 'انتقل إلى المحتوى',
    navLabel: 'القائمة الرئيسية', navDevices: 'الأجهزة', navClassroom: 'الفصل',
    devT: 'احصل على BeamCast على جهازك', devP: 'مجاني على كل الأجهزة، بلا حساب.',
    dOpen: 'افتح عبر الإنترنت',
    dWinT: 'Windows', dWinP: 'شارك شاشتك أو شاهد. للفصول بدون إنترنت، نزّل تطبيق Windows.', dWinBtn: 'تطبيق Windows',
    dWinTip: 'لتثبيت النسخة عبر الإنترنت: اضغط أيقونة التثبيت في شريط العنوان في Chrome أو Edge.',
    dMacT: 'macOS', dMacP: 'شارك شاشة جهاز Mac أو شاهد، في Chrome أو Edge أو Safari.',
    dMacTip: 'للتثبيت: في Safari اختر File › Add to Dock، أو في Chrome اضغط أيقونة التثبيت في شريط العنوان.',
    dIosT: 'iPhone / iPad', dIosP: 'شاهد الشاشات الأخرى، أو أرسل الكاميرا، أو اعرض الشاشة كاملة عبر AirPlay.',
    dIosTip: 'للتثبيت: افتح هذا الموقع في Safari، واضغط «مشاركة» ثم «إضافة إلى الشاشة الرئيسية».',
    dAndT: 'Android', dAndP: 'شاهد الشاشات الأخرى، أو أرسل الكاميرا، أو اعرض الشاشة كاملة على التلفاز.', dAndBtn: 'تطبيق Android (18 ميغابايت)',
    dAndTip: 'إذا طلب Android ذلك، فاسمح بتثبيت التطبيقات من المتصفح. أو في Chrome اضغط ⋮ › تثبيت التطبيق.', navOnline: 'عبر الإنترنت', navSafety: 'الأمان', navHelp: 'مساعدة',
    heroT: 'اعرض شاشتك على أي شاشة',
    heroP: 'اعرض شاشة حاسوب المعلّم على السبورة التفاعلية في الفصل، أو شارك الشاشة مع أي هاتف أو جهاز لوحي أو تلفاز. مجاني، بلا حساب وبلا تتبّع.',
    ctaClass: 'الفصل: بدون إنترنت', ctaOnline: 'افتح BeamCast عبر الإنترنت',
    factsLabel: 'أبرز المزايا',
    fact1: 'لا حاجة إلى إنترنت أو شبكة Wi-Fi في الفصل', fact2: 'بلا تسجيل وبلا إعلانات وبلا تتبّع', fact3: 'اتصال مشفّر',
    classT: 'الفصل: من الحاسوب إلى السبورة بدون إنترنت',
    classP: 'يربط تطبيق BeamCast Desktop المجاني لنظام Windows الحاسوبَ مباشرةً بسبورة Promethean أو التلفاز الذكي أو جهاز العرض، دون الحاجة إلى شبكة المدرسة أو الإنترنت.',
    dlT: 'BeamCast Desktop لنظام Windows',
    dlP: 'لنظامي Windows 10 و11. ملف واحد بلا تثبيت. نزّله من المنزل أو من أي مكان فيه إنترنت، ثم انسخه إلى الحاسوب.',
    dlVersion: 'الإصدار', dlSize: 'الحجم', dlHash: 'بصمة SHA-256', dlBtn: 'تنزيل لنظام Windows',
    howT: 'طريقة الاستخدام في الفصل',
    step1: 'على سبورة Promethean، افتح تطبيق **Screen Share**.',
    step2: 'على الحاسوب، افتح **BeamCastDesktop.exe** واضغط **Find panel**.',
    step3: 'اضغط على اسم السبورة في القائمة، فتظهر شاشة الحاسوب على السبورة.',
    step4: 'للإيقاف، اضغط **Find panel** مرة أخرى واختر **Disconnect**.',
    firstRun: 'في المرة الأولى فقط: إذا ظهرت رسالة «Windows protected your PC»، فاضغط **More info** ثم **Run anyway**. تظهر هذه الرسالة للتطبيقات الجديدة غير المنشورة في متجر.',
    onlineT: 'عبر الإنترنت: أي جهاز وفي أي مكان',
    onlineP: 'عند توفّر الإنترنت، يعمل BeamCast في المتصفح على الحواسيب والهواتف والأجهزة اللوحية والتلفاز، دون أي تثبيت.',
    on1: 'على الجهاز الذي تريد عرضه، افتح BeamCast واختر **Share this screen**. يظهر رمز ورمز QR.',
    on2: 'على الشاشة التي ستعرض، امسح رمز QR، أو افتح BeamCast واختر **Watch on this device** واكتب الرمز.',
    on3: 'تأكّد أن الشاشتين تعرضان الرقم نفسه المكوّن من خانتين، ثم وافق وابدأ المشاركة.',
    openApp: 'افتح BeamCast عبر الإنترنت',
    installTip: 'نصيحة: في Chrome أو Edge، استخدم «تثبيت التطبيق» من شريط العنوان أو القائمة لإضافة BeamCast إلى جهازك، فيفتح حتى بدون إنترنت.',
    safeT: 'آمن من الأساس',
    s1T: 'لا نجمع أي شيء عنك', s1P: 'بلا حسابات وبلا ملفات تعريف ارتباط وبلا إعلانات أو إحصاءات. لا يحمّل هذا الموقع أي شيء من شركات أخرى.',
    s2T: 'فقط من تسمح له', s2P: 'في الفصل، أنت من يختار السبورة. وعبر الإنترنت، يجب الموافقة على كل مشاهد بعد التحقق من رقم مطابق. تنتهي صلاحية الرموز بعد 10 دقائق.',
    s3T: 'مشفّر', s3P: 'يستخدم العرض اللاسلكي اتصال Windows المشفّر المدمج. والبث عبر الإنترنت مشفّر من طرف إلى طرف ويمرّ مباشرة بين الجهازين.',
    s4T: 'تحقّق من الملف', s4P: 'قارن بصمة SHA-256 أعلاه بالملف الذي نزّلته. في PowerShell شغّل: `Get-FileHash BeamCastDesktop.exe`',
    helpT: 'مساعدة',
    h1Q: 'السبورة لا تظهر في القائمة',
    h1A: 'تأكّد أن تطبيق Screen Share مفتوح على السبورة ويسمح بأجهزة Windows / Miracast. شغّل Wi-Fi في Windows (لا يلزم الاتصال بشبكة) وابقَ على بُعد أمتار قليلة من السبورة.',
    h2Q: 'يقول التطبيق إن الحاسوب لا يدعم العرض اللاسلكي',
    h2A: 'استخدم الخيار الثاني في التطبيق: إذا كان الحاسوب والسبورة على شبكة Wi-Fi واحدة، فافتح متصفح السبورة واكتب العنوان والرمز الظاهرين في التطبيق. أو صِل كابل HDMI.',
    h3Q: 'الصورة متأخرة',
    h3A: 'العرض اللاسلكي هو الخيار الأكثر سلاسة. في خيار Wi-Fi، اختر **Picture: Smooth** واقترب من جهاز الراوتر.',
    h4Q: 'هل هذا الموقع متاح دائمًا؟',
    h4A: 'نعم. إنه موقع ثابت بسيط على GitHub Pages باتصال HTTPS آمن ودون خادم قد يتعطّل. بعد زيارتك الأولى يفتح أيضًا بدون إنترنت. ولا يحتاج تطبيق الفصل إلى هذا الموقع بعد تنزيله.',
    foot: 'BeamCast مجاني. لا يستخدم هذا الموقع ملفات تعريف الارتباط ولا يجمع أي بيانات شخصية.',
    offline: 'أنت غير متصل. فُتحت هذه الصفحة من جهازك.',
    title: 'BeamCast: اعرض شاشتك على أي شاشة',
    description: 'يعرض BeamCast شاشة الحاسوب على سبورة الفصل أو التلفاز أو أي جهاز، ويعمل بدون إنترنت. مجاني وخاص وآمن.'
  };
  var LANG_KEY = 'beamcast.site.lang';
  var originals = new Map(), originalAttrs = new Map(), originalTitle = document.title;
  var descMeta = document.querySelector('meta[name="description"]'), originalDesc = descMeta ? descMeta.content : '';

  function rich(el, text) {
    el.textContent = '';
    String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/).forEach(function (part) {
      if (!part) return;
      var m = /^\*\*(.+)\*\*$/.exec(part), c = /^`(.+)`$/.exec(part), node;
      if (m) { node = document.createElement('b'); node.textContent = m[1]; }
      else if (c) { node = document.createElement('code'); node.textContent = c[1]; node.dir = 'ltr'; }
      else node = document.createTextNode(part);
      el.appendChild(node);
    });
  }

  function setLang(lang) {
    var ar = lang === 'ar';
    document.documentElement.lang = ar ? 'ar' : 'en';
    document.documentElement.dir = ar ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      if (!originals.has(el)) originals.set(el, Array.prototype.map.call(el.childNodes, function (n) { return n.cloneNode(true); }));
      if (ar) rich(el, AR[el.getAttribute('data-i18n')] || el.textContent);
      else { el.textContent = ''; originals.get(el).forEach(function (n) { el.appendChild(n.cloneNode(true)); }); }
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      var spec = el.getAttribute('data-i18n-attr').split(':'), attr = spec[0];
      if (!originalAttrs.has(el)) originalAttrs.set(el, el.getAttribute(attr));
      el.setAttribute(attr, ar ? AR[spec[1]] : originalAttrs.get(el));
    });
    document.title = ar ? AR.title : originalTitle;
    if (descMeta) descMeta.content = ar ? AR.description : originalDesc;
    // The button offers the *other* language, written in that language.
    var b = document.getElementById('langBtn');
    b.textContent = ar ? 'English' : 'العربية';
    b.lang = ar ? 'en' : 'ar';
    b.setAttribute('aria-label', ar ? 'View this site in English' : 'عرض الموقع بالعربية');
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* private mode: choice lasts for this visit */ }
  }

  function savedLang() {
    try { var v = localStorage.getItem(LANG_KEY); if (v === 'ar' || v === 'en') return v; } catch (e) { }
    return /^ar\b/i.test(navigator.language || '') ? 'ar' : 'en';
  }

  function formatBytes(n) { return n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.round(n / 1024) + ' KB'; }

  // download.json is written by windows-app/update-website.ps1 every time the app is rebuilt.
  function loadDownloadInfo() {
    fetch('download.json', { cache: 'no-cache', credentials: 'omit' }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    }).then(function (d) {
      if (d.version) document.getElementById('dlVersion').textContent = String(d.version);
      if (d.bytes) document.getElementById('dlSize').textContent = formatBytes(Number(d.bytes));
      if (/^[0-9A-F]{64}$/i.test(d.sha256 || '')) document.getElementById('dlHash').textContent = d.sha256.toUpperCase();
    }).catch(function () { /* details stay as “—”; the download itself still works */ });
  }

  function renderOnline() { document.getElementById('offlineNote').hidden = navigator.onLine; }

  document.getElementById('langBtn').addEventListener('click', function () {
    setLang(document.documentElement.lang === 'ar' ? 'en' : 'ar');
  });
  var initial = savedLang();
  if (initial === 'ar') setLang('ar');
  loadDownloadInfo();
  renderOnline();
  window.addEventListener('online', renderOnline);
  window.addEventListener('offline', renderOnline);

  // Keeps a copy of this site on the device so it opens without internet.
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function () { });
})();
