/**
 * BeamCast — screen mirroring over WebRTC, paired through Google Apps Script.
 *
 * Apps Script is used ONLY for pairing + signaling (exchanging WebRTC offers/answers).
 * The screen/audio stream itself flows peer-to-peer between the two browsers
 * (or through a TURN relay if you configure one in Script Properties → ICE_SERVERS).
 *
 * Storage: CacheService (script cache). Sessions are short-lived by design.
 * Deploy as a Web App: Execute as "Me", Who has access "Anyone".
 */

const CFG = {
  APP_NAME: 'BeamCast',
  ALPHABET: 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', // no 0/O, 1/I/L
  CODE_LEN: 8,
  PENDING_TTL: 600,        // an unpaired code lives 10 minutes
  REQUEST_TTL: 90,         // an unanswered join request can be replaced after 90 s
  IDLE_TTL: 1800,          // a paired session ends after 30 min with no activity from either side
  CACHE_TTL: 21600,        // CacheService maximum (6 h) = hard session lifetime
  HEARTBEAT_TTL: 90,       // a side counts as "online" if it polled in the last 90 s (background tabs poll slowly)
  MAX_SDP: 60000,
  MAX_QUEUE: 12,
  JOIN_FAILS_PER_MIN: 40,  // global brute-force brake on wrong codes
  CREATES_PER_MIN: 60
};

const DEFAULT_ICE = [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }];

/* ------------------------------------------------------------------ entry points */

function doGet(e) {
  const p = (e && e.parameter) || {};
  const t = HtmlService.createTemplateFromFile('Index');
  t.execUrl = ScriptApp.getService().getUrl() || '';
  t.joinCode = normCode_(p.join) || '';
  t.appUrl = appUrl_();
  return t.evaluate()
    .setTitle(CFG.APP_NAME + ' — Screen Mirroring')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

/** JSON API for the standalone (downloaded / self-hosted) copy, which cannot use google.script.run. */
function doPost(e) {
  let out;
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    out = api(body.fn, body.args);
  } catch (err) {
    out = fail_('BAD_REQUEST', 'Malformed request.');
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

/** Single public entry point for google.script.run. Never throws; always returns {ok, data|error}. */
function api(fn, args) {
  const handler = Object.prototype.hasOwnProperty.call(API_, fn) ? API_[fn] : null;
  if (!handler) return fail_('BAD_REQUEST', 'Unknown action.');
  try {
    return { ok: true, data: handler(args && typeof args === 'object' ? args : {}) };
  } catch (err) {
    if (err && err.isApiError) return fail_(err.code, err.message);
    console.error(fn, err && err.stack || err);
    return fail_('SERVER', 'The pairing server hit an unexpected error. Please retry.');
  }
}

/* ------------------------------------------------------------------ actions */

const API_ = {
  config: function () {
    return {
      iceServers: iceServers_(),
      pendingTtl: CFG.PENDING_TTL,
      appName: CFG.APP_NAME,
      now: Date.now()
    };
  },

  /** Sharing device: create a fresh pairing code. */
  create: function (a) {
    throttle_('create', CFG.CREATES_PER_MIN, 'Too many new codes were requested. Wait a minute and try again.');
    const cache = cache_();
    let code = '';
    for (let i = 0; i < 6 && !code; i++) {
      const c = randomCode_();
      if (!cache.get(key_(c))) code = c;
    }
    if (!code) throw err_('SERVER', 'Could not allocate a code. Please retry.');
    const now = Date.now();
    const s = {
      v: 1, code: code, state: 'waiting',
      hostTok: token_(), hostName: cleanName_(a.name) || 'Sharing device',
      rxTok: '', rxName: '', reqAt: 0,
      created: now, exp: now + CFG.PENDING_TTL * 1000, touched: now,
      seq: 0, toHost: [], toRx: []
    };
    save_(s);
    beat_(code, 'host');
    return { code: code, token: s.hostTok, role: 'host', expiresAt: s.exp, now: now };
  },

  /** Receiving device: ask to join with a code. The sharing device must approve. */
  join: function (a) {
    const code = normCode_(a.code);
    if (!code) throw err_('INVALID_CODE', 'That code is not valid. Codes have 8 letters/digits, e.g. ABCD-2345.');
    return withLock_(function () {
      const s = load_(code);
      if (!s) {
        throttle_('joinfail', CFG.JOIN_FAILS_PER_MIN, 'Too many wrong codes were tried. Wait a minute and try again.');
        throw err_('INVALID_CODE', 'No active session uses that code. Check it, or ask for a new code on the sharing device.');
      }
      const now = Date.now();
      if (s.state === 'waiting' && now > s.exp) throw err_('EXPIRED', 'This code has expired. Generate a new code on the sharing device.');
      if (s.state === 'paired') throw err_('BUSY', 'Another device is already connected to this session.');
      if (s.state === 'requested' && now - s.reqAt < CFG.REQUEST_TTL * 1000) {
        throw err_('BUSY', 'Another device is already waiting for approval. Try again in a minute.');
      }
      if (!alive_(code, 'host')) throw err_('HOST_GONE', 'The sharing device is not responding. Make sure its page is still open.');
      s.state = 'requested';
      s.rxTok = token_();
      s.rxName = cleanName_(a.name) || 'Viewer';
      s.reqAt = now;
      // Short check number shown on both screens so the sharer approves the right device.
      s.pin = String(10 + (randomBytes_(1)[0] % 90));
      s.toRx = [];
      push_(s, 'host', { t: 'join-request', name: s.rxName });
      s.touched = now;
      save_(s);
      beat_(code, 'rx');
      return { code: code, token: s.rxTok, role: 'rx', hostName: s.hostName, pin: s.pin, now: now };
    });
  },

  /** Sharing device: accept or reject the pending request. */
  approve: function (a) {
    const accept = a.accept === true;
    return withLock_(function () {
      const s = auth_(a, 'host');
      if (s.state !== 'requested') throw err_('NO_REQUEST', 'There is no pending request (it may have been cancelled).');
      if (accept) {
        s.state = 'paired';
        push_(s, 'rx', { t: 'approved', name: s.hostName });
      } else {
        push_(s, 'rx', { t: 'rejected' });
        s.state = 'waiting';
        s.rxTok = 'x';          // keep the rejected device able to read its rejection once
        s.rxName = '';
        s.exp = Math.max(s.exp, Date.now() + 60000);
      }
      s.touched = Date.now();
      save_(s);
      return { state: s.state };
    });
  },

  /** Relay a signaling message to the other side. */
  send: function (a) {
    const m = a.msg || {};
    const type = String(m.t || '');
    if (['offer', 'answer', 'restart'].indexOf(type) < 0) throw err_('BAD_REQUEST', 'Unsupported message.');
    const gen = Number(m.gen);
    if (!isFinite(gen) || gen <= 0) throw err_('BAD_REQUEST', 'Bad generation.');
    const clean = { t: type, gen: gen };
    if (type === 'offer' || type === 'answer') {
      if (typeof m.sdp !== 'string' || m.sdp.length > CFG.MAX_SDP || m.sdp.indexOf('v=0') !== 0) {
        throw err_('BAD_REQUEST', 'Invalid session description.');
      }
      clean.sdp = m.sdp;
    }
    return withLock_(function () {
      const r = authAny_(a);
      const s = r.s;
      if (s.state !== 'paired') throw err_('NOT_PAIRED', 'The devices are not paired anymore.');
      if (type === 'offer' && r.role !== 'host') throw err_('FORBIDDEN', 'Only the sharing device can send offers.');
      if (type === 'answer' && r.role !== 'rx') throw err_('FORBIDDEN', 'Only the viewer can send answers.');
      if (type === 'restart' && r.role !== 'rx') throw err_('FORBIDDEN', 'Only the viewer can request a restart.');
      push_(s, r.role === 'host' ? 'rx' : 'host', clean);
      s.touched = Date.now();
      save_(s);
      beat_(s.code, r.role);
      return { seq: s.seq };
    });
  },

  /** Read new messages + session state. Lock-free (read only) except for the heartbeat key. */
  poll: function (a) {
    const code = normCode_(a.code);
    const tok = String(a.token || '');
    if (!code || !tok) throw err_('BAD_REQUEST', 'Missing session.');
    const s = load_(code);
    if (!s) throw err_('ENDED', 'This session has ended or expired.');
    let role = '';
    if (tok === s.hostTok) role = 'host';
    else if (s.rxTok && s.rxTok !== 'x' && tok === s.rxTok) role = 'rx';
    else {
      // A device that was rejected or replaced gets a clear answer instead of a generic error.
      if (s.toRx.some(function (m) { return m.t === 'rejected'; }) || (s.state !== 'paired' && s.rxTok === 'x')) {
        throw err_('REJECTED', 'The sharing device declined the connection.');
      }
      throw err_('FORBIDDEN', 'This device is no longer part of the session.');
    }
    const now = Date.now();
    if (s.state === 'waiting' && now > s.exp) throw err_('EXPIRED', 'The pairing code expired.');
    if (s.state === 'paired' && now - s.touched > CFG.IDLE_TTL * 1000 && !alive_(code, 'host') && !alive_(code, 'rx')) {
      throw err_('ENDED', 'The session timed out.');
    }
    beat_(code, role);
    const since = Number(a.since) || 0;
    const q = role === 'host' ? s.toHost : s.toRx;
    const other = role === 'host' ? 'rx' : 'host';
    // Throttled write so idle-timeout tracking works without taking the lock on every poll.
    if (now - s.touched > 60000) touch_(code);
    return {
      state: s.state,
      msgs: q.filter(function (m) { return m.seq > since; }),
      peerName: role === 'host' ? s.rxName : s.hostName,
      pin: s.state === 'requested' || s.state === 'paired' ? (s.pin || '') : '',
      peerOnline: s.state === 'paired' || role === 'host' ? alive_(code, other) : true,
      expiresAt: s.state === 'waiting' ? s.exp : 0,
      lifetimeEnds: s.created + CFG.CACHE_TTL * 1000,
      now: now
    };
  },

  /** Leave the session. Host leaving ends it; viewer leaving frees it for a new device. */
  leave: function (a) {
    return withLock_(function () {
      let r;
      try { r = authAny_(a); } catch (e) { return { left: true }; }
      const s = r.s;
      if (r.role === 'host') {
        cache_().remove(key_(s.code));
        return { left: true };
      }
      s.state = 'waiting';
      s.rxTok = ''; s.rxName = ''; s.toRx = [];
      s.exp = Math.max(s.exp, Date.now() + CFG.PENDING_TTL * 1000);
      push_(s, 'host', { t: 'peer-left' });
      s.touched = Date.now();
      save_(s);
      return { left: true };
    });
  },

  /** Returns the fully rendered page so the user can keep a copy that opens without a connection. */
  offlineCopy: function () {
    const t = HtmlService.createTemplateFromFile('Index');
    t.execUrl = ScriptApp.getService().getUrl() || '';
    t.joinCode = '';
    t.appUrl = appUrl_();
    return { html: t.evaluate().getContent() };
  }
};

/* ------------------------------------------------------------------ helpers */

function cache_() { return CacheService.getScriptCache(); }
function key_(code) { return 'bc:s:' + code; }

function load_(code) {
  const raw = cache_().get(key_(code));
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

function save_(s) {
  let json = JSON.stringify(s);
  // CacheService values are limited to 100 KB — drop the oldest queued messages if needed.
  while (json.length > 95000 && (s.toHost.length || s.toRx.length)) {
    (s.toHost.length >= s.toRx.length ? s.toHost : s.toRx).shift();
    json = JSON.stringify(s);
  }
  const left = Math.floor((s.created + CFG.CACHE_TTL * 1000 - Date.now()) / 1000);
  if (left < 30) { cache_().remove(key_(s.code)); throw err_('ENDED', 'This session reached its maximum lifetime (6 hours). Pair again.'); }
  cache_().put(key_(s.code), json, Math.min(CFG.CACHE_TTL, left));
}

function touch_(code) {
  try {
    withLock_(function () {
      const s = load_(code);
      if (s) { s.touched = Date.now(); save_(s); }
    }, 1500);
  } catch (e) { /* best effort */ }
}

function push_(s, to, msg) {
  const q = to === 'host' ? s.toHost : s.toRx;
  // Only the newest offer/answer matters; older ones would just waste cache space.
  if (msg.t === 'offer' || msg.t === 'answer') {
    for (let i = q.length - 1; i >= 0; i--) if (q[i].t === msg.t) q.splice(i, 1);
  }
  s.seq += 1;
  msg.seq = s.seq;
  msg.at = Date.now();
  q.push(msg);
  while (q.length > CFG.MAX_QUEUE) q.shift();
}

function beat_(code, role) { cache_().put('bc:hb:' + role + ':' + code, String(Date.now()), CFG.HEARTBEAT_TTL); }
function alive_(code, role) { return !!cache_().get('bc:hb:' + role + ':' + code); }

function auth_(a, role) {
  const r = authAny_(a);
  if (r.role !== role) throw err_('FORBIDDEN', 'Not allowed for this device.');
  return r.s;
}

function authAny_(a) {
  const code = normCode_(a.code);
  const tok = String(a.token || '');
  if (!code || !/^[a-f0-9]{64}$/.test(tok)) throw err_('BAD_REQUEST', 'Missing or malformed session token.');
  const s = load_(code);
  if (!s) throw err_('ENDED', 'This session has ended or expired.');
  if (tok === s.hostTok) return { s: s, role: 'host' };
  if (s.rxTok && tok === s.rxTok) return { s: s, role: 'rx' };
  throw err_('FORBIDDEN', 'This device is not part of the session.');
}

function withLock_(fn, waitMs) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(waitMs || 8000)) throw err_('BUSY_SERVER', 'The pairing server is busy. Retrying usually helps.');
  try { return fn(); } finally { lock.releaseLock(); }
}

function throttle_(name, max, msg) {
  const k = 'bc:rl:' + name + ':' + Math.floor(Date.now() / 60000);
  const c = cache_();
  const n = Number(c.get(k) || 0) + 1;
  c.put(k, String(n), 120);
  if (n > max) throw err_('RATE_LIMITED', msg);
}

function randomBytes_(n) {
  // Utilities.getUuid() is backed by a cryptographically strong generator (Java UUID v4).
  const out = [];
  while (out.length < n) {
    const hex = Utilities.getUuid().replace(/-/g, '');
    for (let i = 0; i < hex.length; i += 2) {
      if (i === 12) continue;                 // skip the fixed version nibble byte
      if (i === 16) continue;                 // skip the variant byte
      out.push(parseInt(hex.substr(i, 2), 16));
    }
  }
  return out.slice(0, n);
}

function randomCode_() {
  const A = CFG.ALPHABET;
  const lim = 256 - (256 % A.length);         // rejection sampling → no modulo bias
  let s = '';
  while (s.length < CFG.CODE_LEN) {
    const bytes = randomBytes_(16);
    for (let i = 0; i < bytes.length && s.length < CFG.CODE_LEN; i++) if (bytes[i] < lim) s += A[bytes[i] % A.length];
  }
  return s;
}

function token_() {
  return randomBytes_(32).map(function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
}

function normCode_(c) {
  const s = String(c == null ? '' : c).toUpperCase().replace(/[\s-]/g, '');
  if (s.length !== CFG.CODE_LEN) return '';
  for (let i = 0; i < s.length; i++) if (CFG.ALPHABET.indexOf(s[i]) < 0) return '';
  return s;
}

function cleanName_(n) {
  return String(n == null ? '' : n).replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);
}

/** Optional Script Property APP_URL: where the installable app shell is hosted (e.g. GitHub Pages). */
function appUrl_() {
  const u = String(PropertiesService.getScriptProperties().getProperty('APP_URL') || '').trim();
  return /^https:\/\/[^\s"'<>\\]+$/.test(u) ? u : '';
}

function iceServers_() {
  const raw = PropertiesService.getScriptProperties().getProperty('ICE_SERVERS');
  if (!raw) return DEFAULT_ICE;
  try {
    const list = JSON.parse(raw);
    if (Array.isArray(list) && list.length) return list;
  } catch (e) {
    console.error('ICE_SERVERS script property is not valid JSON; using default STUN.');
  }
  return DEFAULT_ICE;
}

function err_(code, message) {
  const e = new Error(message);
  e.isApiError = true;
  e.code = code;
  return e;
}

function fail_(code, message) { return { ok: false, error: { code: code, message: message } }; }
