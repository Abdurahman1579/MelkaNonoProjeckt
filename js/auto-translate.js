// ============================================
// AUTO-TRANSLATE.JS — Universal Auto-Translator
// Malka Noonoo Project
// ============================================

(function() {
  'use strict';

  console.log('🌐 auto-translate.js loaded');

  // ==========================================
  // CONFIG
  // ==========================================
  const CACHE_PREFIX = 'mn_trans_';
  const LOCAL_CACHE_TTL = 1000 * 60 * 60 * 24 * 30; // 30 days
  const SOURCE_LANG = 'om';
  const BATCH_SIZE = 5;

  // ==========================================
  // STATE
  // ==========================================
  const state = {
    processing: false,
    queue: new Set(),
    localCache: new Map()
  };

  // ==========================================
  // HASH HELPER (simple)
  // ==========================================
  function hashText(text, target) {
    const str = `${SOURCE_LANG}→${target}:${text}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'mn_' + Math.abs(hash).toString(36) + '_' + str.length;
  }

  // ==========================================
  // LOCAL CACHE
  // ==========================================
  function loadLocalCache() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(CACHE_PREFIX)) {
          const data = JSON.parse(localStorage.getItem(key));
          if (data.expires > Date.now()) {
            state.localCache.set(key.substring(CACHE_PREFIX.length), data.value);
          } else {
            localStorage.removeItem(key);
          }
        }
      }
    } catch (err) {
      console.warn('Local cache load error:', err);
    }
  }

  function getFromLocalCache(hash) {
    return state.localCache.get(hash);
  }

  function saveToLocalCache(hash, value) {
    try {
      state.localCache.set(hash, value);
      localStorage.setItem(
        CACHE_PREFIX + hash,
        JSON.stringify({
          value,
          expires: Date.now() + LOCAL_CACHE_TTL
        })
      );
    } catch (err) {
      // LocalStorage full — clear old entries
      console.warn('Local cache full');
    }
  }

  // ==========================================
  // DB CACHE
  // ==========================================
  async function getFromDbCache(hash) {
    try {
      const { data, error } = await db
        .from('mn_translations_cache')
        .select('translation')
        .eq('hash', hash)
        .maybeSingle();

      if (error || !data) return null;

      // Update hit count (fire and forget)
      db.from('mn_translations_cache')
        .update({ hit_count: (data.hit_count || 0) + 1 })
        .eq('hash', hash)
        .then(() => {})
        .catch(() => {});

      return data.translation;
    } catch (err) {
      return null;
    }
  }

  async function saveToDbCache(sourceText, targetLang, translation, hash) {
    try {
      await db.from('mn_translations_cache').insert([{
        source_text: sourceText,
        source_lang: SOURCE_LANG,
        target_lang: targetLang,
        translation: translation,
        hash: hash
      }]);
    } catch (err) {
      // Duplicate — ignore
    }
  }

  // ==========================================
  // TRANSLATE VIA GEMINI
  // ==========================================
  async function translateViaGemini(text, targetLang) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/translate-content`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            text: text,
            source: SOURCE_LANG,
            targets: [targetLang]
          })
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (!data.success || !data.translations?.[targetLang]) {
        throw new Error(data.error || 'Translation failed');
      }

      return data.translations[targetLang];

    } catch (err) {
      console.warn(`⚠️ Gemini translate failed:`, err.message);
      return null;
    }
  }

  // ==========================================
  // MAIN TRANSLATE FUNCTION
  // ==========================================
  async function translateText(text, targetLang) {
    if (!text || !text.trim()) return text;
    if (targetLang === SOURCE_LANG) return text;

    const trimmed = text.trim();
    if (trimmed.length < 2 || trimmed.length > 5000) return text;

    // 1. Check local cache
    const hash = hashText(trimmed, targetLang);
    let cached = getFromLocalCache(hash);
    if (cached) return cached;

    // 2. Check DB cache
    cached = await getFromDbCache(hash);
    if (cached) {
      saveToLocalCache(hash, cached);
      return cached;
    }

    // 3. Call Gemini
    const translation = await translateViaGemini(trimmed, targetLang);
    if (translation) {
      saveToLocalCache(hash, translation);
      saveToDbCache(trimmed, targetLang, translation, hash); // fire & forget
      return translation;
    }

    // 4. Fallback — original text
    return text;
  }

  // ==========================================
  // PROCESS [data-translate] ELEMENTS
  // ==========================================
  async function translateElements(root = document) {
    if (state.processing) return;
    state.processing = true;

    const currentLang = (typeof getCurrentLang === 'function') 
      ? getCurrentLang() 
      : (localStorage.getItem('mn_lang') || SOURCE_LANG);

    // Source lang = target lang — restore original
    if (currentLang === SOURCE_LANG) {
      document.querySelectorAll('[data-translate]').forEach(el => {
        const original = el.dataset.translateOriginal || el.textContent;
        if (el.dataset.translateOriginal) {
          el.textContent = original;
        }
        el.classList.remove('translating');
      });
      state.processing = false;
      return;
    }

    const elements = root.querySelectorAll('[data-translate]');
    if (!elements.length) {
      state.processing = false;
      return;
    }

    console.log(`🌐 Translating ${elements.length} elements to ${currentLang}`);

    // Batch processing
    const list = Array.from(elements);

    for (let i = 0; i < list.length; i += BATCH_SIZE) {
      const batch = list.slice(i, i + BATCH_SIZE);
      
      await Promise.all(batch.map(async (el) => {
        // Store original
        if (!el.dataset.translateOriginal) {
          el.dataset.translateOriginal = el.textContent.trim();
        }

        const original = el.dataset.translateOriginal;
        if (!original) return;

        // Show loading
        el.classList.add('translating');

        // Check DB provided translation first (data-text-am / data-text-en)
        const dbKey = `text${currentLang.charAt(0).toUpperCase() + currentLang.slice(1)}`;
        const dbProvided = el.dataset[dbKey];
        
        if (dbProvided) {
          el.textContent = dbProvided;
          el.classList.remove('translating');
          return;
        }

        // Translate
        const translated = await translateText(original, currentLang);
        el.textContent = translated;
        el.classList.remove('translating');
      }));
    }

    state.processing = false;
    console.log('✅ Translation complete');
  }

  // ==========================================
  // PROCESS [data-translate-placeholder]
  // ==========================================
  async function translatePlaceholders() {
    const currentLang = (typeof getCurrentLang === 'function') 
      ? getCurrentLang() 
      : (localStorage.getItem('mn_lang') || SOURCE_LANG);

    if (currentLang === SOURCE_LANG) {
      document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
        const original = el.dataset.translatePlaceholderOriginal || el.placeholder;
        if (el.dataset.translatePlaceholderOriginal) {
          el.placeholder = original;
        }
      });
      return;
    }

    const elements = document.querySelectorAll('[data-translate-placeholder]');

    for (const el of elements) {
      if (!el.dataset.translatePlaceholderOriginal) {
        el.dataset.translatePlaceholderOriginal = el.placeholder;
      }

      const original = el.dataset.translatePlaceholderOriginal;
      if (!original || original.length < 2) continue;

      const translated = await translateText(original, currentLang);
      el.placeholder = translated;
    }
  }

  // ==========================================
  // INIT
  // ==========================================
  function init() {
    loadLocalCache();

    // Translate on load
    setTimeout(() => {
      translateElements();
      translatePlaceholders();
    }, 500);

    // On language change
    window.addEventListener('languageChanged', (e) => {
      console.log('🌐 Language changed, re-translating...');
      setTimeout(() => {
        translateElements();
        translatePlaceholders();
      }, 200);
    });

    // On DOM changes (dynamic content)
    const observer = new MutationObserver((mutations) => {
      let hasNew = false;
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if (node.nodeType === 1 && (
            node.hasAttribute?.('data-translate') ||
            node.querySelector?.('[data-translate]')
          )) {
            hasNew = true;
          }
        });
      });

      if (hasNew) {
        setTimeout(() => translateElements(), 300);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    console.log('✅ auto-translate ready');
  }

  // ==========================================
  // PUBLIC API
  // ==========================================
  window.autoTranslate = {
    translate: translateText,
    processAll: () => {
      translateElements();
      translatePlaceholders();
    },
    clearCache: () => {
      state.localCache.clear();
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      }
      console.log('🗑️ Cache cleared');
    }
  };

  // Run
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();