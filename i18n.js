// 1. 定義翻譯字典：以中文為 Key，對應英文
const translations = {
  "en": {
    "早安圖製作工具 ": "Good Morning Image Generator ",
    "介面主題": "Interface Theme",
    "淺色": "Light",
    "深色": "Dark",
    "系統預設": "System Default",
    "語言選單": "Language",
    "系統語言": "System Language",
    "English": "English",
    "畫布檢視與編輯模式": "Canvas View & Edit Mode",
    "檢視": "View",
    "編輯": "Edit",
    "＋": "+",
    "－": "-",
    "重設": "Reset",
    "安全提示": "Security Notice",
    "未匯出就關閉分頁時提醒": "Warn When Closing Tab Without Export",
    "更新設定": "Update Settings",
    "更新之後隱藏更新框": "Hide Update Modal After Viewing",
    "關於本程式與版權資訊": "About & Copyright",
    "更新日誌": "Changelog",
    "回復初始設定": "Reset to Default Settings",
    "匯出": "Export",
    "匯出為 PNG": "Export as PNG",
    "匯出為 JPG": "Export as JPG",
    "匯出為 WebP": "Export as WebP",
    "匯出專案 (.gm)": "Export Project (.gm)",
    "匯入": "Import",
    "匯入專案 (.gm)": "Import Project (.gm)",
    "載入已儲存專案 (.gm)": "Load Saved Project (.gm)",
    "文字圖層": "Text Layers",
    "+新增文字": " +Add Text",
    "+ 新增文字": "+ Add Text",
    "新增時帶入預設文字": "Add default text when creating",
    "自訂新增時的預設文字": "Custom default text when adding",
    "圖片": "Image",
    "點擊重新上傳圖片": "Click to re-upload image",
    "專案存檔": "Project Archive",
    "字型選單管理": "Font Menu",
    "啟用英文字型選單": "Enable English Fonts Menu",
    "畫布比例與裁切": "Canvas Ratio & Crop",
    "進入圖片裁切模式": "Enter Crop Mode",
    "重置視窗拖曳比例": "Reset Splitter Ratio",
    "✂️ 進入圖片裁切模式 ↕️ 重置視窗拖曳比例": "✂️ Enter Crop Mode ↕️ Reset Splitter Ratio",
    "載入自訂字體": "Load Custom Fonts",
    "您可以貼上 Google Fonts 連結，或上傳自己電腦中的字型檔。字體會永久儲存在您的本機瀏覽器中。": "You can paste a Google Fonts link, or upload a font file from your computer. Fonts will be permanently stored in your browser.",
    "Google Fonts 連結": "Google Fonts Link",
    "貼上 Noto / Roboto 連結...": "Paste Noto / Roboto link...",
    "1. Google Fonts 連結": "1. Google Fonts Link",
    "2. 上傳本機字體檔": "2. Upload Local Font File",
    "選擇電腦中的字體檔案 (.ttf, .otf)": "Select font file from computer (.ttf, .otf)",
    "📂 選擇電腦中的字體檔案 (.ttf, .otf)": "📂 Select font file from computer (.ttf, .otf)",
    "我的模板庫": "My Templates",
    "設計好您的排版與文字後，可在下方儲存。下次上傳新圖片時即可一鍵套用！": "After designing your layout and text, save it below. You can apply it with one click when uploading a new image!",
    "輸入模板名稱...": "Enter template name...",
    "儲存設計": "Save Design",
    "手機友善編輯": "Mobile Editing",
    "啟用手機友善編輯模式（Google 相簿風格）": "Enable Mobile Editing Mode (Google Photos Style)",
    "📱 啟用手機友善編輯模式（Google 相簿風格）": "📱 Enable Mobile Editing Mode (Google Photos Style)",
    "開啟後會在畫布下方顯示大按鈕工具列，讓新增文字、裁切與快速編輯更適合手機單手操作。": "When enabled, a large button toolbar will appear below the canvas for easier text addition, cropping and quick editing on mobile.",
    "極不穩定實驗性功能": "Highly Unstable Experimental Feature",
    "快速編輯功能": "Quick Edit",
    "啟用雙擊快速編輯": "Enable Double-click Quick Edit",
    "開啟後，在畫布文字上「快速點擊兩下（雙擊）」即可跳出快速編輯面板": "When enabled, double-clicking on canvas text will open the quick edit panel",
    "日期函數": "Date Functions",
    "啟用 {TODAY()} 與 {TODAY(NOYEAR)} 日期函數": "Enable {TODAY()} and {TODAY(NOYEAR)} Date Functions",
    "在文字內容輸入 {TODAY()} 會自動替換為今天的日期 (YYYY/MM/DD)；{TODAY(NOYEAR)} 則只顯示月/日 (MM/DD)": "Entering {TODAY()} in text content will be automatically replaced with today's date (YYYY/MM/DD); {TODAY(NOYEAR)} shows only month/day (MM/DD)",
    "實驗性操作設定": "Experimental Settings",
    "啟用自適應文字比例": "Enable Adaptive Text Ratio",
    "開啟後，文字尺寸會依圖片寬度等比縮放（保持 100% 滿版），且裁切時文字位置與比例會自動同步，在手機與電腦版皆無需重複調整！": "When enabled, text size will scale proportionally based on image width (maintaining 100% full screen), and text position and ratio will sync automatically during cropping.",
    "手勢縮放（雙指捏合放大縮小文字）": "Gesture Zoom (Pinch to resize text)",
    "🧪 實驗性：手勢縮放（雙指捏合放大縮小文字）": "🧪 Experimental: Gesture Zoom (Pinch)",
    "開啟後，在畫布區域用兩指捏合即可直接放大或縮小文字；此模式會暫時關閉拖曳與文字編輯，不會互相干擾": "When enabled, pinch on canvas area to directly enlarge or shrink text; this mode temporarily disables dragging and text editing.",
    "限制文字拖曳在圖片範圍內": "Constrain Text Drag Within Image",
    "開啟後，文字無法被拖曳到圖片外部；關閉則可自由拖曳至任何位置": "When enabled, text cannot be dragged outside image bounds; disabled allows free positioning.",
    "選取框線與控制點設定": "Selection Border & Control Point Settings",
    "框線粗細": "Border Width",
    "拖曳選取文字圖層時所顯示的虛線外框粗細": "Dragging selection box border width",
    "啟用右下角縮放控制點": "Enable Bottom-right Resize Handle",
    "開啟後，選取文字時右下角會出現一個控制點，可直接拖曳以放大或縮小文字尺寸。": "When enabled, a resize handle appears at bottom-right when selecting text.",
    "編輯文字時顯示內容": "Display When Editing Text",
    "兩個都要": "Both",
    "只顯示外框": "Outline Only",
    "只顯示調整右角縮放點點": "Handle Only",
    "關閉": "Off",
    "縮放控制點大小": "Resize Handle Size",
    "還原預設": "Reset Default",
    "調整選取文字時，右下角縮放控制點的圓圈大小。": "Adjust the circle size of the resize control point when selecting text.",
    "🧪 實驗性：直接在圖片上編輯文字": "🧪 Experimental: Inline Text Edit",
    "僅在進入文字編輯時套用；選取文字時一律顯示外框與縮放控制點。": "Only apply when entering text edit; always show border and resize handle when selecting text. (Resize handle requires enabling the option above)",
    "取消": "Cancel",
    "確定套用": "Confirm Apply",
    "選擇字型會套用到目前選取的圖層": "Selected font will apply to current layer",
    "正在設定：圖層顏色": "Settings for: Layer color",
    "正在設定": "Settings for",
    "HEX 色碼": "HEX Color",
    "推薦色系 (36色)": "Recommended Colors (36)",
    "自訂收藏色系": "My Colors",
    "收藏當前色": "Save Current Color",
    "提示：點擊色塊套用，在自訂色塊上按住（長按）或按滑鼠右鍵即可刪除收藏": "Tip: Click color block to apply, long press or right-click on custom color block to delete",
    "確認送出": "Submit",
    "請輸入文字": "Please enter text",
    "下載與分享": "Download & Share",
    "目前無收藏自訂色，請在上方按收藏增加": "No custom colors saved yet, click 'Save Current Color' above",
    "尚無載入的自訂字體": "No custom fonts loaded",
    "尚無儲存的模板": "No saved templates",
    "確定並返回": "Confirm & Return",
    "文字內容": "Text Content",
    "字體": "Font",
    "大小": "Size",
    "框線粗細（3.5px）": "Border Width (3.5px)",
    "縮放控制點大小 (8px)": "Resize Handle Size (8px)",
    "文字主題色": "Text Color",
    "描邊顏色": "Stroke Color",
    "顯示描邊": "Show Stroke",
    "文字陰影": "Text Shadow",
    "圖層順序調整": "Layer Order Adjustment",
    "🔝 最頂": "Top",
    "🔼 上移": "Move Up",
    "🔽 下移": "Move Down",
    "⤓ 最底": "Bottom",
    "移動特定步數：": "Move N steps:",
    "🔺 往上": "Up",
    "🔻 往下": "Down",
    "大小 (": "Size (",
    "🎨 文字主顏色": "Text Color",
    "🖌️ 描邊顏色": "Stroke Color",
    "圖層 ": "Layer ",
    "📍 回到中間": "📍 Back to Center",
    "▲": "▲",
    "▼": "▼",
    "向左": "Left",
    "向右": "Right",
    "▶": "▶",
    "◀": "◀",
    "快速編輯": "Quick Edit",
    "裁切": "Crop",
    "匯出 PNG": "Export PNG",
    "回到中間": "Back to Center",
    "更多選項": "More Options",
    "設定": "Settings",
    "變更顏色": "Change Color"
  }
};

// 2. DFS 深度遍歷所有 Text Node 進行暴力翻譯
function translateTextNode(node) {
  if (!node || !node.parentNode) return;

  let text = node.nodeValue.trim();
  if (!text || text.length === 0) return;

  // 嘗試完全匹配
  let translated = translations['en'][text];
  
  // 若無完全匹配，嘗試包含匹配
  if (!translated) {
    for (const [key, value] of Object.entries(translations['en'])) {
      if (text.includes(key) || key.includes(text)) {
        translated = value;
        break;
      }
    }
  }
  
  if (translated && translated !== text) {
    node.nodeValue = node.nodeValue.replace(text, translated);
  }
}

// 3. 處理動態值的翻譯（如框線粗細(Npx)）
function translateDynamicText(element) {
  const walker = document.createTreeWalker(
    element || document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        const parent = node.parentNode;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.nodeType === 1 ? parent.tagName.toLowerCase() : '';
        if (tag === 'script' || tag === 'style' || tag === 'textarea' || tag === 'input') {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    },
    false
  );

  let node;
  while (node = walker.nextNode()) {
    if (!node.parentNode) continue;
    
    const text = node.nodeValue.trim();
    
    // 處理「大小 (Npx)」格式
    if (text.match(/大小 \(([\d.]+px)\)/)) {
      const match = text.match(/大小 \(([\d.]+px)\)/);
      if (match) {
        node.nodeValue = node.nodeValue.replace(/大小 \(([\d.]+px)\)/, 'Size (' + match[1] + ')');
      }
    }
    // 處理「框線粗細（Nx）」格式
    else if (text.match(/框線粗細（[\d.]+px）/)) {
      const match = text.match(/框線粗細（([\d.]+px)）/);
      if (match) {
        node.nodeValue = node.nodeValue.replace(/框線粗細（([\d.]+px)）/, 'Border Width (' + match[1] + ')');
      }
    }
    // 處理「縮放控制點大小 (Npx)」格式
    else if (text.match(/縮放控制點大小 \([\d.]+px\)/)) {
      const match = text.match(/縮放控制點大小 \(([\d.]+px)\)/);
      if (match) {
        node.nodeValue = node.nodeValue.replace(/縮放控制點大小 \(([\d.]+px)\)/, 'Resize Handle Size (' + match[1] + ')');
      }
    }
    // 處理「裁切外框粗細（Nx）」格式
    else if (text.match(/裁切外框粗細（[\d.]+px）/)) {
      const match = text.match(/裁切外框粗細（([\d.]+px)）/);
      if (match) {
        node.nodeValue = node.nodeValue.replace(/裁切外框粗細（([\d.]+px)）/, 'Crop Border Width (' + match[1] + ')');
      }
    }
    // 處理「裁切把手大小（Nx）」格式
    else if (text.match(/裁切把手大小（[\d.]+px）/)) {
      const match = text.match(/裁切把手大小（([\d.]+px)）/);
      if (match) {
        node.nodeValue = node.nodeValue.replace(/裁切把手大小（([\d.]+px)）/, 'Crop Handle Size (' + match[1] + ')');
      }
    }
  }
}

function dfsTranslate(element) {
  const walker = document.createTreeWalker(
    element || document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        const parent = node.parentNode;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.nodeType === 1 ? parent.tagName.toLowerCase() : '';
        if (tag === 'script' || tag === 'style' || tag === 'textarea' || tag === 'input') {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    },
    false
  );

  const nodes = [];
  let node;
  while (node = walker.nextNode()) {
    nodes.push(node);
  }

  nodes.forEach(translateTextNode);

  document.querySelectorAll('[placeholder]').forEach(el => {
    const ph = el.getAttribute('placeholder');
    if (ph && ph.trim()) {
      const translated = translations['en'][ph];
      if (translated && translated !== ph) {
        el.setAttribute('placeholder', translated);
      }
    }
  });

  document.querySelectorAll('[title]').forEach(el => {
    const title = el.getAttribute('title');
    if (title && title.trim()) {
      const translated = translations['en'][title];
      if (translated && translated !== title) {
        el.setAttribute('title', translated);
      }
    }
  });
}

// 4. 偵測瀏覽器語言
function getBrowserLang() {
  const savedLang = localStorage.getItem('gm_lang');
  if (savedLang && (savedLang === 'zh-TW' || savedLang === 'en')) {
    return savedLang;
  }
  
  if (savedLang === 'system' || !savedLang) {
    const browserLang = navigator.language || navigator.userLanguage || 'en';
    const langCode = browserLang.toLowerCase();
    if (langCode.includes('zh') && (langCode.includes('tw') || langCode.includes('hant') || langCode === 'zh')) {
      return 'zh-TW';
    }
    return 'en';
  }

  const browserLang = navigator.language || navigator.userLanguage || 'en';
  const langCode = browserLang.toLowerCase();
  if (langCode.includes('zh') && (langCode.includes('tw') || langCode.includes('hant') || langCode === 'zh')) {
    return 'zh-TW';
  }
  return 'en';
}

// 5. 初始化翻譯
function initI18n() {
  const urlParams = new URLSearchParams(window.location.search);
  let lang = urlParams.get('lang');

  if (!lang) {
    lang = getBrowserLang();
  }

  document.documentElement.lang = lang;

  if (lang === 'en') {
    dfsTranslate(document.body);
    translateDynamicText(document.body);
  }
}

// 6. 語言選擇器
function initLanguageSelect() {
  const langSelect = document.getElementById('langSelect');
  if (!langSelect) return;

  const savedLang = localStorage.getItem('gm_lang') || 'system';
  if (savedLang === 'system' || savedLang === 'en' || savedLang === 'zh-TW') {
    langSelect.value = savedLang;
  } else {
    langSelect.value = 'system';
  }
}

function changeLanguage(lang) {
  localStorage.setItem('gm_lang', lang);
  
  const url = new URL(window.location.href);
  if (lang === 'system') {
    url.searchParams.delete('lang');
  } else {
    url.searchParams.set('lang', lang);
  }
  window.location.href = url.toString();
}

// 7. DOM 載入後執行
document.addEventListener('DOMContentLoaded', () => {
  initI18n();
  initLanguageSelect();
});

// 8. 翻譯輔助函式 - 用於動態內容
function t(text) {
  if (!text) return text;

  const currentLang = document.documentElement.lang || 'zh-TW';
  if (currentLang !== 'en') {
    // 如果當前語言不是英文，直接返回原始中文文字
    return text;
  }
  
  // 處理框線粗細（Nxpx）格式
  if (text.match(/框線粗細（[\d.]+px）/)) {
    const match = text.match(/框線粗細（([\d.]+px)）/);
    if (match) {
      return 'Border Width (' + match[1] + ')';
    }
  }
  // 處理縮放控制點大小 (Npx) 格式
  if (text.match(/縮放控制點大小 \([\d.]+px\)/)) {
    const match = text.match(/縮放控制點大小 \(([\d.]+px)\)/);
    if (match) {
      return 'Resize Handle Size (' + match[1] + ')';
    }
  }
  // 處理裁切外框粗細（Nx）格式
  if (text.match(/裁切外框粗細（[\d.]+px）/)) {
    const match = text.match(/裁切外框粗細（([\d.]+px)）/);
    if (match) {
      return 'Crop Border Width (' + match[1] + ')';
    }
  }
  // 處理裁切把手大小（Nx）格式
  if (text.match(/裁切把手大小（[\d.]+px）/)) {
    const match = text.match(/裁切把手大小（([\d.]+px)）/);
    if (match) {
      return 'Crop Handle Size (' + match[1] + ')';
    }
  }
  
  return translations['en'][text] || text;
}