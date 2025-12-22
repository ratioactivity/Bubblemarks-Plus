

if (typeof window !== "undefined") {
  const safeStorage = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        console.warn("[Bubblemarks] localStorage unavailable, using memory fallback");
        return window._memoryStorage?.[key] || null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {
        window._memoryStorage = window._memoryStorage || {};
        window._memoryStorage[key] = value;
      }
    },
  };

  let desktopLoadHandlerRegistered = false;

  let pendingResetInvocation = false;

  const resetPetLevelPlaceholder = () => {
    pendingResetInvocation = true;
    console.warn("resetPetLevel is unavailable until the pet widget finishes initializing.");
  };

  window.resetPetLevel = resetPetLevelPlaceholder;

  function initializeBubblemarks() {
    console.log("✅ script validated");

    function createFallbackAudioManager() {
      const cache = new Map();
      return {
        preload(definitions = []) {
          definitions.forEach((definition) => {
            if (!definition || typeof definition !== "object") {
              return;
            }
            const { name, src, volume = 1 } = definition;
            if (!name || !src) {
              return;
            }
            cache.set(name, { src, volume });
          });
        },
        play(name, options = {}) {
          const entry = cache.get(name);
          if (!entry) {
            return false;
          }
          const audio = new Audio(entry.src);
          const desiredVolume =
            typeof options.volume === "number" && options.volume >= 0
              ? options.volume
              : entry.volume;
          audio.volume = desiredVolume;
          if (options.playbackRate) {
            audio.playbackRate = options.playbackRate;
          }
          try {
            audio.currentTime = 0;
          } catch (error) {
            console.warn(`[Bubblemarks] Unable to reset fallback sound "${name}":`, error);
          }
          audio.play().catch(() => {});
          return true;
        },
      };
    }

    const keyboardAudioManager =
      window.BubblemarksAudio?.createManager({ defaultVolume: 0.3 }) ||
      createFallbackAudioManager();

    const KEYBOARD_SOUND_DEFINITIONS = [];
    const KEYBOARD_LETTERS = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
    ];

    KEYBOARD_LETTERS.forEach((letter) => {
      KEYBOARD_SOUND_DEFINITIONS.push({
        name: `key-${letter}`,
        src: `sounds/${letter}.mp3`,
        volume: 0.3,
        allowMultiple: true,
      });
    });

    KEYBOARD_SOUND_DEFINITIONS.push({
      name: "key-other",
      src: "sounds/allothers.mp3",
      volume: 0.3,
      allowMultiple: true,
    });

    keyboardAudioManager.preload(KEYBOARD_SOUND_DEFINITIONS);

    const STORAGE_KEY = "bubblemarks.bookmarks.v1";
const DEFAULT_SOURCE = "bookmarks.json";
const FALLBACK_PALETTES = [
  { background: "#ffe9f6", accent: "#ff80c8", shadow: "#ffc3e4" },
  { background: "#e7f1ff", accent: "#92a9ff", shadow: "#cdd8ff" },
  { background: "#fff5e5", accent: "#ffba6b", shadow: "#ffe3ba" },
  { background: "#e8fff6", accent: "#6ad6a6", shadow: "#c2f7da" },
];
const CATEGORY_STORAGE_KEY = "bubblemarks.categories.v1";
const DEFAULT_CATEGORY_LABEL = "Unsorted";
const DEFAULT_CATEGORY_SLUG = "unsorted";
const CATEGORY_ALIAS_MAP = new Map([
  ["shop", "shop"],
  ["shopping", "shop"],
  ["story", "stories"],
]);
const DEFAULT_CATEGORY_SETTINGS = [
  { key: "ai", label: "AI", color: "#ff80c8" }, // pink
  { key: "av", label: "AV", color: "#92a9ff" }, // lilac/blue
  { key: "games", label: "Games", color: "#ffeaa6" }, // yellow
  { key: "google", label: "Google", color: "#b4f5cf" }, // mint
  { key: "my-content", label: "My Content", color: "#d4ffe9" }, // light mint green
  { key: "pages", label: "Pages", color: "#a9e6f2" }, // pastel teal blue
  { key: "shop", label: "Shop", color: "#ffe1b0" }, // peach
  { key: "stories", label: "Stories", color: "#ffe9cf" }, // soft peach
  { key: "tools", label: "Tools", color: "#b6f3d2" }, // minty green
  { key: "work", label: "Work", color: "#ffc4d6" }, // coral/pink
  { key: DEFAULT_CATEGORY_SLUG, label: DEFAULT_CATEGORY_LABEL, color: "#f7ddff" }, // Unsorted
];
const PREFERENCES_STORAGE_KEY = "bubblemarks.preferences.v1";
const DEFAULT_PET_NAME = "BubblePet";
const LAYOUT_MIN_COUNT = 1;
const LAYOUT_MAX_COUNT = 10;
const DEFAULT_CARDS_PER_ROW = 3;
const DEFAULT_ROWS_PER_PAGE = 2;
const IMAGE_POSITION_OPTIONS = new Set(["top", "center", "bottom"]);

const DEFAULT_AXOLOTL_IMAGE = (() => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="body" x1="0%" x2="100%" y1="0%" y2="100%">
      <stop stop-color="#ffb9dc" offset="0%"/>
      <stop stop-color="#ffdff1" offset="100%"/>
    </linearGradient>
    <radialGradient id="belly" cx="50%" cy="45%" r="60%">
      <stop stop-color="#fff6fb" offset="0%"/>
      <stop stop-color="#ffd0ec" stop-opacity="0.85" offset="100%"/>
    </radialGradient>
  </defs>
  <g fill="none" stroke="#ff89c9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M28 42c10-6 18-10 26-10"/>
    <path d="M212 42c-10-6-18-10-26-10"/>
    <path d="M30 70c9 4 18 6 26 4"/>
    <path d="M210 70c-9 4-18 6-26 4"/>
  </g>
  <g>
    <path d="M60 40c-20 12-32 32-26 52s26 34 70 36c28 1 40-2 56-2 46 0 72-16 74-38s-14-46-40-58c-28-14-84-14-134 10z" fill="url(#body)" stroke="#ff89c9" stroke-width="3"/>
    <ellipse cx="118" cy="78" rx="46" ry="32" fill="url(#belly)"/>
    <g fill="#ff8fb5">
      <circle cx="88" cy="72" r="8"/>
      <circle cx="148" cy="72" r="8"/>
    </g>
    <path d="M102 94c8 10 20 10 28 0" stroke="#ff89c9" stroke-width="4" stroke-linecap="round"/>
    <g stroke="#ff89c9" stroke-width="4" stroke-linecap="round">
      <path d="M90 52c-6-12-18-18-32-18"/>
      <path d="M146 52c6-12 18-18 32-18"/>
    </g>
    <g stroke="#ffb0d9" stroke-width="4" stroke-linecap="round">
      <path d="M82 48c-8-10-20-14-34-12"/>
      <path d="M154 48c8-10 20-14 34-12"/>
    </g>
  </g>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
})();

const AXOLOTL_PRESENCE_MODES = {
  WINDOW: "window",
  ROAMING: "roaming",
  HIDDEN: "hidden",
};

const prefersReducedMotion = (() => {
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-reduced-motion: reduce)");
  }
  return {
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  };
})();
const AXOLOTL_MANIFEST_URL = "bubblemarks://assets/axolotl/manifest.json";
const AXOLOTL_FRAME_EXTENSIONS = [
  "png",
  "webp",
  "gif",
  "PNG",
  "WEBP",
  "GIF",
];
const AXOLOTL_FRAME_PATTERNS = [
  (index, extension) =>
    `bubblemarks://assets/axolotl/frame-${String(index).padStart(2, "0")}.${extension}`,
  (index, extension) => `bubblemarks://assets/axolotl/frame${index}.${extension}`,
  (index, extension) =>
    `bubblemarks://assets/axolotl/frame_${String(index).padStart(2, "0")}.${extension}`,
  (index, extension) => `bubblemarks://assets/axolotl/frame_${index}.${extension}`,
  (index, extension) =>
    `bubblemarks://assets/axolotl/axolotl-${String(index).padStart(2, "0")}.${extension}`,
  (index, extension) => `bubblemarks://assets/axolotl/axolotl${index}.${extension}`,
  (index, extension) =>
    `bubblemarks://assets/axolotl/axolotl_${String(index).padStart(2, "0")}.${extension}`,
  (index, extension) => `bubblemarks://assets/axolotl/axolotl_${index}.${extension}`,
  (index, extension) =>
    `bubblemarks://assets/axolotl/swim-${String(index).padStart(2, "0")}.${extension}`,
  (index, extension) => `bubblemarks://assets/axolotl/swim${index}.${extension}`,
  (index, extension) =>
    `bubblemarks://assets/axolotl/swim_${String(index).padStart(2, "0")}.${extension}`,
  (index, extension) => `bubblemarks://assets/axolotl/swim_${index}.${extension}`,
  (index, extension) =>
    `bubblemarks://assets/axolotl/idle-${String(index).padStart(2, "0")}.${extension}`,
  (index, extension) => `bubblemarks://assets/axolotl/idle${index}.${extension}`,
  (index, extension) =>
    `bubblemarks://assets/axolotl/idle_${String(index).padStart(2, "0")}.${extension}`,
  (index, extension) => `bubblemarks://assets/axolotl/idle_${index}.${extension}`,
  (index, extension) =>
    `bubblemarks://assets/axolotl/frame-(${String(index).padStart(2, "0")}).${extension}`,
  (index, extension) => `bubblemarks://assets/axolotl/frame-(${index}).${extension}`,
  (index, extension) =>
    `bubblemarks://assets/axolotl/frame (${String(index).padStart(2, "0")}).${extension}`,
  (index, extension) => `bubblemarks://assets/axolotl/frame (${index}).${extension}`,
];
const AXOLOTL_SINGLE_ASSETS = [
  "bubblemarks://assets/axolotl/axolotl.gif",
  "bubblemarks://assets/axolotl/axolotl.png",
  "bubblemarks://assets/axolotl/axolotl.webp",
  "bubblemarks://assets/axolotl/swim.gif",
  "bubblemarks://assets/axolotl/swim.png",
  "bubblemarks://assets/axolotl/swim.webp",
  "bubblemarks://assets/axolotl/idle.gif",
  "bubblemarks://assets/axolotl/idle.png",
  "bubblemarks://assets/axolotl/idle.webp",
  "bubblemarks://assets/axolotl/floating.gif",
  "bubblemarks://assets/axolotl/floating.png",
  "bubblemarks://assets/axolotl/floating.webp",
  "bubblemarks://assets/axolotl/resting.gif",
  "bubblemarks://assets/axolotl/resting.png",
  "bubblemarks://assets/axolotl/resting.webp",
  "bubblemarks://assets/axolotl/swimming.gif",
  "bubblemarks://assets/axolotl/swimming.png",
  "bubblemarks://assets/axolotl/swimming.webp",
];
const AXOLOTL_FRAME_LIMIT = 90;
const AXOLOTL_STATE_NAMES = [
  "resting",
  "getup",
  "floating",
  "swimmode",
  "swimming",
];
const CARD_SIZE_OPTIONS = ["cozy", "comfy", "roomy"];
const AXOLOTL_STATE_FRAME_PATTERNS = [
  (state, index, extension) =>
    `bubblemarks://assets/axolotl/${state}-${String(index).padStart(2, "0")}.${extension}`,
  (state, index, extension) =>
    `bubblemarks://assets/axolotl/${state}_${String(index).padStart(2, "0")}.${extension}`,
  (state, index, extension) =>
    `bubblemarks://assets/axolotl/${state}${String(index).padStart(2, "0")}.${extension}`,
  (state, index, extension) =>
    `bubblemarks://assets/axolotl/${state}-${index}.${extension}`,
  (state, index, extension) =>
    `bubblemarks://assets/axolotl/${state}_${index}.${extension}`,
  (state, index, extension) => `bubblemarks://assets/axolotl/${state}${index}.${extension}`,
  (state, index, extension) =>
    `bubblemarks://assets/axolotl/${state}/${state}-${String(index).padStart(2, "0")}.${extension}`,
  (state, index, extension) =>
    `bubblemarks://assets/axolotl/${state}/${state}_${String(index).padStart(2, "0")}.${extension}`,
  (state, index, extension) =>
    `bubblemarks://assets/axolotl/${state}/${state}${String(index).padStart(2, "0")}.${extension}`,
  (state, index, extension) =>
    `bubblemarks://assets/axolotl/${state}/${state}-${index}.${extension}`,
  (state, index, extension) =>
    `bubblemarks://assets/axolotl/${state}/${state}_${index}.${extension}`,
  (state, index, extension) =>
    `bubblemarks://assets/axolotl/${state}/${state}${index}.${extension}`,
  (state, index, extension) =>
    `bubblemarks://assets/axolotl/${state}/${String(index).padStart(2, "0")}.${extension}`,
  (state, index, extension) =>
    `bubblemarks://assets/axolotl/${state}/${index}.${extension}`,
  (state, index, extension) =>
    `bubblemarks://assets/axolotl/${state}/frame-${String(index).padStart(2, "0")}.${extension}`,
  (state, index, extension) =>
    `bubblemarks://assets/axolotl/${state}/frame_${String(index).padStart(2, "0")}.${extension}`,
  (state, index, extension) =>
    `bubblemarks://assets/axolotl/${state}/frame${String(index).padStart(2, "0")}.${extension}`,
  (state, index, extension) =>
    `bubblemarks://assets/axolotl/${state}/${state}-(${String(index).padStart(2, "0")}).${extension}`,
  (state, index, extension) =>
    `bubblemarks://assets/axolotl/${state}/${state}-(${index}).${extension}`,
  (state, index, extension) =>
    `bubblemarks://assets/axolotl/${state}/${state} (${String(index).padStart(2, "0")}).${extension}`,
  (state, index, extension) =>
    `bubblemarks://assets/axolotl/${state}/${state} (${index}).${extension}`,
  (state, index, extension) =>
    `bubblemarks://assets/axolotl/${state}-(${String(index).padStart(2, "0")}).${extension}`,
  (state, index, extension) =>
    `bubblemarks://assets/axolotl/${state}-(${index}).${extension}`,
  (state, index, extension) =>
    `bubblemarks://assets/axolotl/${state} (${String(index).padStart(2, "0")}).${extension}`,
  (state, index, extension) =>
    `bubblemarks://assets/axolotl/${state} (${index}).${extension}`,
];

const imageProbeCache = new Map();

let bookmarks = [];
let activeCategory = "all";
let searchTerm = "";
let categorySettings = loadCategorySettings();
let categoryInfo = new Map();
let preferences = loadPreferences();
let axolotlInitialized = false;
let axolotlController = { enable: () => {}, disable: () => {} };
let axolotlInitPromise = null;

let grid;
let emptyState;
let keyboardContainer;
let categoryBar;
let searchInput;
let clearSearchBtn;
let datalist;
let importBtn;
let exportBtn;
let restoreBtn;
let importInput;
let template;
let addBookmarkBtn;
let bookmarkModal;
let bookmarkForm;
let bookmarkNameInput;
let bookmarkUrlInput;
let bookmarkImageInput;
let bookmarkCategorySelect;
let axolotlLayer;
let axolotlPath;
let axolotlSprite;
let axolotlFigure;
let axolotlFrameDisplay;
let axolotlPresenceMode = AXOLOTL_PRESENCE_MODES.WINDOW;
let petWidgetFrame;
let heroHeading;
let settingsBtn;
let settingsModal;
let settingsForm;
let settingsDialog;
let toggleHeadingInput;
let toggleAxolotlInput;
let petNameInput;
let petNameSaveBtn;
let togglePetVacationInput;
let togglePetSoundsInput;
let togglePetScrollInput;
let resetPetProgressBtn;
let scrollLockToggleInput;
let cardSizeInput;
let customizeCategoriesBtn;
let categoryModal;
let categoryForm;
let categorySettingsList;
let addCategoryBtn;
let categoryItemTemplate;
let cardsPerRowInput;
let rowsPerPageInput;
let paginationControls;
let prevPageBtn;
let nextPageBtn;
let lastRenderedCollection = [];
let pendingResizeFrame = null;
let lastLoggedLayout = { cardsPerRow: null, rowsPerPage: null };
let manageBookmarksBtn;
let manageBookmarksModal;
let manageBookmarksList;
let manageBookmarksTemplate;
let manageBookmarksEmpty;
let activeBookmarkManagerConfirm = null;
const getControlPanels = () =>
  Array.from(document.querySelectorAll("[data-controls-panel]"));

function safeInitialize(sectionName, initializer) {
  try {
    initializer();
  } catch (error) {
    console.error(`[Bubblemarks] Failed to initialize ${sectionName}:`, error);
  }
}

function replaceChildrenSafe(target, nodes) {
  if (!target) {
    return;
  }

  const list = Array.isArray(nodes)
    ? nodes.filter(Boolean)
    : Array.from(nodes || []).filter(Boolean);

  if (typeof target.replaceChildren === "function") {
    target.replaceChildren(...list);
  } else {
    target.innerHTML = "";
    list.forEach((node) => target.appendChild(node));
  }
}

function showBookmarkManagerConfirm(item) {
  if (!item) return;
  if (activeBookmarkManagerConfirm && activeBookmarkManagerConfirm !== item) {
    hideBookmarkManagerConfirm(activeBookmarkManagerConfirm);
  }
  const confirm = item.querySelector(".bookmark-manager-item__confirm");
  const deleteButton = item.querySelector(".bookmark-manager-item__delete");
  if (deleteButton) {
    deleteButton.hidden = true;
  }
  if (confirm) {
    confirm.hidden = false;
    const confirmBtn = confirm.querySelector('[data-manager-action="confirm"]');
    if (confirmBtn) {
      confirmBtn.focus({ preventScroll: true });
    }
  }
  item.dataset.confirming = "true";
  activeBookmarkManagerConfirm = item;
}

function hideBookmarkManagerConfirm(item) {
  if (!item) return;
  const confirm = item.querySelector(".bookmark-manager-item__confirm");
  const deleteButton = item.querySelector(".bookmark-manager-item__delete");
  if (confirm) {
    confirm.hidden = true;
  }
  if (deleteButton) {
    deleteButton.hidden = false;
  }
  item.removeAttribute("data-confirming");
  if (activeBookmarkManagerConfirm === item) {
    activeBookmarkManagerConfirm = null;
  }
}

function resetBookmarkManagerConfirm() {
  if (activeBookmarkManagerConfirm) {
    hideBookmarkManagerConfirm(activeBookmarkManagerConfirm);
  }
}

function renderBookmarkManagerList() {
  if (!manageBookmarksList || !manageBookmarksTemplate) {
    return;
  }

  resetBookmarkManagerConfirm();

  if (!Array.isArray(bookmarks) || bookmarks.length === 0) {
    replaceChildrenSafe(manageBookmarksList, []);
    if (manageBookmarksEmpty) {
      manageBookmarksEmpty.hidden = false;
    }
    return;
  }

  const items = bookmarks
    .map((bookmark) => {
      const node = manageBookmarksTemplate.content?.firstElementChild
        ? manageBookmarksTemplate.content.firstElementChild.cloneNode(true)
        : null;

      if (!node) {
        return null;
      }

      node.dataset.bookmarkId = bookmark.id || "";

      const titleEl = node.querySelector(".bookmark-manager-item__title");
      const categoryEl = node.querySelector(".bookmark-manager-item__category");
      const urlEl = node.querySelector(".bookmark-manager-item__url");
      const confirmEl = node.querySelector(".bookmark-manager-item__confirm");
      const deleteBtn = node.querySelector(".bookmark-manager-item__delete");
      const positionSelect = node.querySelector("[data-pos]");

      const bookmarkTitle = bookmark.name?.trim() || "Untitled bookmark";
      const categoryKey =
        normalizeCategoryKey(bookmark.category || DEFAULT_CATEGORY_LABEL) ||
        DEFAULT_CATEGORY_SLUG;
      const displayCategory = getCategoryLabel(
        categoryKey,
        bookmark.category || DEFAULT_CATEGORY_LABEL
      );
      const normalizedPosition = normalizeImagePosition(bookmark.imagePosition);

      if (titleEl) {
        titleEl.textContent = bookmarkTitle;
      }

      if (categoryEl) {
        categoryEl.textContent = displayCategory;
        applyCategoryStylesToBadge(categoryEl, getCategoryColor(categoryKey));
      }

      if (urlEl) {
        urlEl.textContent = bookmark.url || "";
        urlEl.title = bookmark.url || "";
      }

      if (confirmEl) {
        confirmEl.hidden = true;
      }

      if (deleteBtn) {
        deleteBtn.hidden = false;
        deleteBtn.setAttribute("aria-label", `Delete ${bookmarkTitle}`);
      }

      if (positionSelect instanceof HTMLSelectElement) {
        positionSelect.value = normalizedPosition;
        positionSelect.dataset.bookmarkId = bookmark.id || "";
        positionSelect.setAttribute(
          "aria-label",
          `Set image position for ${bookmarkTitle}`
        );
      }

      return node;
    })
    .filter(Boolean);

  replaceChildrenSafe(manageBookmarksList, items);

  if (manageBookmarksEmpty) {
    manageBookmarksEmpty.hidden = true;
  }
}

function refreshBookmarkManagerUI() {
  if (manageBookmarksModal && !manageBookmarksModal.hidden) {
    renderBookmarkManagerList();
  }
}

function deleteBookmarkById(bookmarkId) {
  if (!bookmarkId) {
    return;
  }

  const index = bookmarks.findIndex((bookmark) => bookmark && bookmark.id === bookmarkId);
  if (index === -1) {
    return;
  }

  const next = bookmarks.slice();
  next.splice(index, 1);

  resetBookmarkManagerConfirm();
  setBookmarks(next, { persist: true });

  if (manageBookmarksModal && !manageBookmarksModal.hidden) {
    window.requestAnimationFrame(() => {
      const nextDelete = manageBookmarksList?.querySelector(
        ".bookmark-manager-item__delete"
      );
      if (nextDelete) {
        nextDelete.focus({ preventScroll: true });
        return;
      }
      const closeBtn = manageBookmarksModal.querySelector(
        ".bookmark-manager-modal__close"
      );
      closeBtn?.focus({ preventScroll: true });
    });
  }

  const items = bookmarks
    .map((bookmark) => {
      const node = manageBookmarksTemplate.content?.firstElementChild
        ? manageBookmarksTemplate.content.firstElementChild.cloneNode(true)
        : null;

      if (!node) {
        return null;
      }

      node.dataset.bookmarkId = bookmark.id || "";

      const titleEl = node.querySelector(".bookmark-manager-item__title");
      const categoryEl = node.querySelector(".bookmark-manager-item__category");
      const urlEl = node.querySelector(".bookmark-manager-item__url");
      const confirmEl = node.querySelector(".bookmark-manager-item__confirm");
      const deleteBtn = node.querySelector(".bookmark-manager-item__delete");

      const bookmarkTitle = bookmark.name?.trim() || "Untitled bookmark";
      const categoryKey =
        normalizeCategoryKey(bookmark.category || DEFAULT_CATEGORY_LABEL) ||
        DEFAULT_CATEGORY_SLUG;
      const displayCategory = getCategoryLabel(
        categoryKey,
        bookmark.category || DEFAULT_CATEGORY_LABEL
      );

      if (titleEl) {
        titleEl.textContent = bookmarkTitle;
      }

      if (categoryEl) {
        categoryEl.textContent = displayCategory;
        applyCategoryStylesToBadge(categoryEl, getCategoryColor(categoryKey));
      }

      if (urlEl) {
        urlEl.textContent = bookmark.url || "";
        urlEl.title = bookmark.url || "";
      }

      if (confirmEl) {
        confirmEl.hidden = true;
      }

      if (deleteBtn) {
        deleteBtn.hidden = false;
        deleteBtn.setAttribute("aria-label", `Delete ${bookmarkTitle}`);
      }

      return node;
    })
    .filter(Boolean);

  replaceChildrenSafe(manageBookmarksList, items);

  if (manageBookmarksEmpty) {
    manageBookmarksEmpty.hidden = true;
  }
}

function refreshBookmarkManagerUI() {
  if (manageBookmarksModal && !manageBookmarksModal.hidden) {
    renderBookmarkManagerList();
  }
}

function deleteBookmarkById(bookmarkId) {
  if (!bookmarkId) {
    return;
  }

  const index = bookmarks.findIndex((bookmark) => bookmark && bookmark.id === bookmarkId);
  if (index === -1) {
    return;
  }

  const next = bookmarks.slice();
  next.splice(index, 1);

  resetBookmarkManagerConfirm();
  setBookmarks(next, { persist: true });

  if (manageBookmarksModal && !manageBookmarksModal.hidden) {
    window.requestAnimationFrame(() => {
      const nextDelete = manageBookmarksList?.querySelector(
        ".bookmark-manager-item__delete"
      );
      if (nextDelete) {
        nextDelete.focus({ preventScroll: true });
        return;
      }
      const closeBtn = manageBookmarksModal.querySelector(
        ".bookmark-manager-modal__close"
      );
      closeBtn?.focus({ preventScroll: true });
    });
  }
}

function createDeleteConfirmationPanel(card, bookmark) {
  const panel = document.createElement("div");
  panel.className = "delete-confirm";
  panel.hidden = true;
  panel.dataset.bookmarkId = bookmark.id || "";

  const message = document.createElement("p");
  message.className = "delete-message";
  const bookmarkName = bookmark.name?.trim() || "this bookmark";
  message.textContent = `Remove "${bookmarkName}"?`;
  panel.appendChild(message);

  const actions = document.createElement("div");
  actions.className = "delete-actions";

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "confirm-no";
  cancelBtn.textContent = "Cancel";

  const confirmBtn = document.createElement("button");
  confirmBtn.type = "button";
  confirmBtn.className = "confirm-yes";
  confirmBtn.textContent = "Delete";

  actions.append(cancelBtn, confirmBtn);
  panel.appendChild(actions);

  panel.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  cancelBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    event.preventDefault();
    hideInlineDeletePanel(panel);
  });

  confirmBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    event.preventDefault();

    if (!Array.isArray(bookmarks) || !bookmark || !bookmark.id) {
      console.warn("Cannot delete bookmark: missing id or store", bookmark);
      hideInlineDeletePanel(panel);
      return;
    }

    const index = bookmarks.findIndex((b) => b && b.id === bookmark.id);
    if (index === -1) {
      console.warn("Bookmark not found in store for deletion", bookmark);
      hideInlineDeletePanel(panel);
      return;
    }

    const next = bookmarks.slice();
    next.splice(index, 1);

    hideInlineDeletePanel(panel);
    setBookmarks(next, { persist: true });
  });

  return panel;
}

window.addEventListener("DOMContentLoaded", async () => {
  grid = document.getElementById("bookmarks");
  emptyState = document.getElementById("empty-state");
  keyboardContainer = document.getElementById("keyboard");
  categoryBar = document.getElementById("categories");
  searchInput = document.getElementById("search");
  clearSearchBtn = document.getElementById("clear-search");
  datalist = document.getElementById("bookmark-suggestions");
  importBtn = document.getElementById("import-btn");
  exportBtn = document.getElementById("export-btn");
  restoreBtn = document.getElementById("restore-btn");
  importInput = document.getElementById("import-input");
  template = document.getElementById("bookmark-card-template");
  addBookmarkBtn = document.getElementById("add-bookmark");
  bookmarkModal = document.getElementById("bookmark-modal");
  bookmarkForm = document.getElementById("bookmark-form");
  bookmarkNameInput = document.getElementById("bookmark-name");
  bookmarkUrlInput = document.getElementById("bookmark-url");
  bookmarkImageInput = document.getElementById("bookmark-image");
  bookmarkCategorySelect = document.getElementById("bookmark-category");
  manageBookmarksBtn = document.getElementById("manage-bookmarks");
  manageBookmarksModal = document.getElementById("manage-bookmarks-modal");
  manageBookmarksList = document.getElementById("bookmark-manager-list");
  manageBookmarksTemplate = document.getElementById("bookmark-manager-item-template");
  manageBookmarksEmpty = document.getElementById("bookmark-manager-empty");
  axolotlLayer = document.querySelector(".axolotl-layer");
  axolotlPath = document.getElementById("axolotl-path");
  axolotlSprite = document.getElementById("axolotl-sprite");
  axolotlFigure = document.getElementById("axolotl-figure");
  axolotlFrameDisplay = axolotlFigure
    ? createAxolotlFrameDisplay(axolotlFigure)
    : null;
  heroHeading = document.getElementById("app-heading");
  settingsBtn = document.getElementById("settings-btn");
  settingsModal = document.getElementById("settings-modal");
  settingsForm = document.getElementById("settings-form");
  settingsDialog = document.querySelector(".settings-modal__dialog");
  petWidgetFrame = document.querySelector("#pet-widget iframe");

  const petLevelUpProxy = (amount = 1) => {
    const petWindow = petWidgetFrame?.contentWindow;

    if (!petWindow || typeof petWindow.petLevelUp !== "function") {
      console.warn("petLevelUp is unavailable until the pet widget finishes initializing.");
      return;
    }

    petWindow.petLevelUp(amount);
  };

  window.petLevelUp = petLevelUpProxy;

  const resetPetLevelProxy = () => {
    if (!petWidgetFrame) {
      console.warn("resetPetLevel is unavailable: pet widget iframe is missing.");
      return;
    }

    const petWindow = petWidgetFrame.contentWindow;

    if (!petWindow) {
      console.warn("resetPetLevel will run after the pet widget finishes loading.");
      petWidgetFrame.addEventListener("load", resetPetLevelProxy, { once: true });
      return;
    }

    if (typeof petWindow.resetPetLevel === "function") {
      petWindow.resetPetLevel();
      return;
    }

    petWindow.postMessage({ type: "bubblepet:reset-level" }, "*");
  };

  window.resetPetLevel = resetPetLevelProxy;

  toggleHeadingInput = document.getElementById("toggle-heading");
  toggleAxolotlInput = document.getElementById("toggle-axolotl");
  petNameInput = document.getElementById("pet-name-input");
  petNameSaveBtn = document.getElementById("pet-name-save");
  togglePetVacationInput = document.getElementById("toggle-vacation");
  togglePetSoundsInput = document.getElementById("toggle-pet-sounds");
  togglePetScrollInput = document.getElementById("toggle-pet-scroll");
  resetPetProgressBtn = document.getElementById("reset-pet-progress");
  cardSizeInput = document.getElementById("card-size");
  cardsPerRowInput = document.getElementById("cards-per-row");
  rowsPerPageInput = document.getElementById("rows-per-page");
  customizeCategoriesBtn = document.getElementById("customize-categories");
  categoryModal = document.getElementById("category-modal");
  categoryForm = document.getElementById("category-form");
  categorySettingsList = document.getElementById("category-settings-list");
  addCategoryBtn = document.getElementById("add-category");
  categoryItemTemplate = document.getElementById("category-item-template");
  paginationControls = document.getElementById("pagination-controls");
  prevPageBtn = document.getElementById("prev-page");
  nextPageBtn = document.getElementById("next-page");
  const bubblewarpOverlay = document.getElementById("bubblewarp-overlay");
  const bubblewarpClose = document.getElementById("bubblewarp-close");
  const bubblewarpBackdrop = bubblewarpOverlay?.querySelector("[data-bubblewarp-dismiss]");
  const bubblewarpFrameContainer = bubblewarpOverlay?.querySelector(
    ".bubblewarp-overlay__frame"
  );
  const bubblewarpFrame = bubblewarpFrameContainer?.querySelector("iframe");
  const bubblewarpMenuModal = document.getElementById("bubblewarp-menu-modal");
  const bubblewarpMenuTrigger = document.getElementById("bubblewarp-menu-trigger");
  const bubblewarpMenuBackdrop = bubblewarpMenuModal?.querySelector(
    "[data-bubblewarp-menu-dismiss]"
  );
  const bubblewarpMenuClose = bubblewarpMenuModal?.querySelector(
    ".bubblewarp-menu-modal__close"
  );
  const bubblewarpMenuButtons = bubblewarpMenuModal
    ? Array.from(bubblewarpMenuModal.querySelectorAll(".bubblewarp-menu-modal__button"))
    : [];
  const sketchpadOverlay = document.getElementById("sketchpad-overlay");
  const sketchpadClose = sketchpadOverlay?.querySelector(".sketchpad-overlay__close");
  const sketchpadBackdrop = sketchpadOverlay?.querySelector("[data-sketchpad-dismiss]");
  const sketchpadCanvas = sketchpadOverlay?.querySelector(".sketchpad-overlay__canvas");
  const sketchpadToolbar = sketchpadOverlay?.querySelector(".sketchpad-overlay__toolbar");
  const playgroundOverlay = document.getElementById("playground-overlay");
  const playgroundPanel = playgroundOverlay?.querySelector(".playground-overlay__panel");
  const playgroundClose = playgroundOverlay?.querySelector(".playground-overlay__close");
  const playgroundClearAllButton = playgroundOverlay?.querySelector(
    "[data-playground-action=\"clear-all\"]"
  );
  const playgroundStopAllButton = playgroundOverlay?.querySelector(
    "[data-playground-action=\"stop-all\"]"
  );
  const playgroundMuteToggle = playgroundOverlay?.querySelector(
    "[data-playground-toggle=\"mute\"]"
  );
  const playgroundBubbleGridToggle = playgroundOverlay?.querySelector(
    "[data-playground-toggle=\"bubble-grid\"]"
  );
  const playgroundBubbleGridSoundToggle = playgroundOverlay?.querySelector(
    "[data-playground-toggle=\"bubble-grid-sound\"]"
  );
  const playgroundBubbleGridColorToggle = playgroundOverlay?.querySelector(
    "[data-playground-toggle=\"bubble-grid-color\"]"
  );
  const playgroundBubbleGridAutoToggle = playgroundOverlay?.querySelector(
    "[data-playground-toggle=\"bubble-grid-auto\"]"
  );
  const playgroundSparkleFieldToggle = playgroundOverlay?.querySelector(
    "[data-playground-toggle=\"sparkle-field\"]"
  );
  const playgroundSparkleCountSlider = playgroundOverlay?.querySelector(
    "[data-playground-slider=\"sparkle-count\"]"
  );
  const playgroundSparkleSpeedSlider = playgroundOverlay?.querySelector(
    "[data-playground-slider=\"sparkle-speed\"]"
  );
  const playgroundSparkleCountOutput = playgroundOverlay?.querySelector(
    "[data-playground-output=\"sparkle-count\"]"
  );
  const playgroundSparkleSpeedOutput = playgroundOverlay?.querySelector(
    "[data-playground-output=\"sparkle-speed\"]"
  );
  const playgroundPlayArea = playgroundOverlay?.querySelector(
    ".playground-overlay__play-area"
  );
  const playgroundParticleCanvas = playgroundOverlay?.querySelector(
    ".playground-overlay__particle-canvas"
  );
  const playgroundBubbleGrid = playgroundOverlay?.querySelector(
    ".playground-overlay__bubble-grid"
  );
  const imageFridgeOverlay = document.getElementById("image-fridge-overlay");
  const imageFridgeClose = imageFridgeOverlay?.querySelector(
    ".image-fridge-overlay__close"
  );
  const imageFridgeHeader = imageFridgeOverlay?.querySelector(
    ".image-fridge-overlay__header"
  );
  const imageFridgeDropzone = imageFridgeOverlay?.querySelector(
    ".image-fridge-overlay__dropzone"
  );
  const imageFridgeGrid = imageFridgeOverlay?.querySelector(
    ".image-fridge-overlay__grid"
  );
  const imageFridgeEmpty = imageFridgeOverlay?.querySelector(
    ".image-fridge-overlay__empty"
  );
  const imageFridgeTileTemplate = document.getElementById("image-fridge-tile-template");
  const imageFridgePreview = document.getElementById("image-fridge-preview");
  const imageFridgePreviewBackdrop = imageFridgePreview?.querySelector(
    "[data-image-fridge-preview-dismiss]"
  );
  const imageFridgePreviewClose = imageFridgePreview?.querySelector(
    ".image-fridge-preview__close"
  );
  const imageFridgePreviewControls = imageFridgePreview
    ? Array.from(imageFridgePreview.querySelectorAll("[data-image-fridge-zoom]"))
    : [];
  const imageFridgePreviewViewer = imageFridgePreview?.querySelector(
    ".image-fridge-preview__viewer"
  );
  const imageFridgePreviewImage = imageFridgePreview?.querySelector(
    ".image-fridge-preview__image"
  );

  const appShell = document.querySelector(".app-shell");
  const petWidget = document.getElementById("pet-widget");
  const bubblewarpRestoreTargets = [appShell, petWidget].filter(Boolean);
  let bubblewarpPreviousVisibility = new Map();
  const sketchpadRestoreTargets = [appShell, petWidget].filter(Boolean);
  let sketchpadPreviousVisibility = new Map();
  const playgroundRestoreTargets = [appShell, petWidget].filter(Boolean);
  let playgroundPreviousVisibility = new Map();
  let playgroundLastFocus = null;
  let playgroundMuted = false;
  const bubbleGridState = {
    enabled: false,
    soundEnabled: true,
    colorMode: false,
    autoReplenish: false,
  };
  const sparkleFieldState = {
    enabled: false,
    particleCount: 40,
    speedMultiplier: 1,
  };
  let playgroundAnimationsPaused = false;
  let bubbleGridAutoTimer = null;
  let sparkleAnimationId = null;
  let sparkleParticles = [];
  let sparkleLastFrameTime = null;
  let sparkleCanvasSize = { width: 0, height: 0, dpr: 1 };
  let sparkleCanvasContext = null;

  const createPlaygroundAudioManager = () => {
    if (window.BubblemarksAudio?.createManager) {
      return window.BubblemarksAudio.createManager({ defaultVolume: 0.35 });
    }
    const cache = new Map();
    return {
      preload(definitions = []) {
        definitions.forEach((definition) => {
          if (!definition || typeof definition !== "object") {
            return;
          }
          const { name, src, volume = 1 } = definition;
          if (!name || !src) {
            return;
          }
          const audio = new Audio(src);
          audio.preload = "auto";
          audio.volume = volume;
          cache.set(name, { audio, volume });
        });
      },
      play(name, options = {}) {
        const entry = cache.get(name);
        if (!entry) {
          return false;
        }
        const { audio, volume } = entry;
        const allowOverlap = options.allowOverlap === true;
        const targetAudio = allowOverlap ? audio.cloneNode(true) : audio;
        const desiredVolume =
          typeof options.volume === "number" && options.volume >= 0
            ? options.volume
            : volume;
        targetAudio.volume = desiredVolume;
        if (options.playbackRate) {
          targetAudio.playbackRate = options.playbackRate;
        }
        try {
          targetAudio.currentTime = 0;
        } catch (error) {
          console.warn(`[Playground] Unable to reset sound "${name}":`, error);
        }
        const playPromise = targetAudio.play();
        if (allowOverlap) {
          const cleanup = () => {
            targetAudio.removeEventListener("ended", cleanup);
            targetAudio.removeEventListener("error", cleanup);
            if (typeof targetAudio.remove === "function") {
              targetAudio.remove();
            }
          };
          targetAudio.addEventListener("ended", cleanup);
          targetAudio.addEventListener("error", cleanup);
        }
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
        return true;
      },
      stop(name) {
        const entry = cache.get(name);
        if (!entry) {
          return false;
        }
        entry.audio.pause();
        try {
          entry.audio.currentTime = 0;
        } catch (error) {
          console.warn(`[Playground] Unable to reset sound "${name}":`, error);
        }
        return true;
      },
      stopAll() {
        cache.forEach((_, name) => {
          this.stop(name);
        });
      },
    };
  };

  const playgroundAudioManager = createPlaygroundAudioManager();
  const bubblePopSoundNames = [
    ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "allothers",
  ].map((entry) => `bubble-pop-${entry}`);
  const bubblePopSoundDefinitions = [
    ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "allothers",
  ].map((entry) => ({
    name: `bubble-pop-${entry}`,
    src: `sounds/${entry}.mp3`,
    volume: 0.35,
    allowMultiple: true,
  }));
  playgroundAudioManager.preload(bubblePopSoundDefinitions);

  const bubbleGridCount = 60;

  const getRandomBubblePopSound = () => {
    const index = Math.floor(Math.random() * bubblePopSoundNames.length);
    return bubblePopSoundNames[index];
  };

  const applyBubbleColorMode = (bubble) => {
    if (!bubble) {
      return;
    }
    if (bubbleGridState.colorMode) {
      const hue = Math.floor(200 + Math.random() * 140);
      bubble.style.setProperty("--bubble-hue", String(hue));
      bubble.classList.add("playground-overlay__bubble--colorful");
    } else {
      bubble.style.removeProperty("--bubble-hue");
      bubble.classList.remove("playground-overlay__bubble--colorful");
    }
  };

  const handleBubblePop = (bubble) => {
    if (!bubble || bubble.classList.contains("is-popping")) {
      return;
    }
    bubble.classList.add("is-popping");
    bubble.disabled = true;
    if (bubbleGridState.soundEnabled && !playgroundMuted) {
      const soundName = getRandomBubblePopSound();
      playgroundAudioManager.play(soundName, { allowOverlap: true });
    }
    window.setTimeout(() => {
      bubble.remove();
      if (playgroundBubbleGrid && bubbleGridState.enabled) {
        if (playgroundBubbleGrid.children.length === 0) {
          buildBubbleGrid();
        }
      }
    }, 260);
  };

  const createBubbleElement = () => {
    const bubble = document.createElement("button");
    bubble.type = "button";
    bubble.className = "playground-overlay__bubble";
    bubble.setAttribute("aria-label", "Pop bubble");
    applyBubbleColorMode(bubble);
    bubble.addEventListener("click", () => handleBubblePop(bubble));
    return bubble;
  };

  const buildBubbleGrid = () => {
    if (!playgroundBubbleGrid) {
      return;
    }
    playgroundBubbleGrid.innerHTML = "";
    if (!bubbleGridState.enabled) {
      playgroundBubbleGrid.classList.remove("is-active");
      return;
    }
    playgroundBubbleGrid.classList.add("is-active");
    for (let i = 0; i < bubbleGridCount; i += 1) {
      playgroundBubbleGrid.appendChild(createBubbleElement());
    }
  };

  const updateBubbleGridColorMode = () => {
    if (!playgroundBubbleGrid) {
      return;
    }
    Array.from(playgroundBubbleGrid.children).forEach((bubble) => {
      if (!(bubble instanceof HTMLElement)) {
        return;
      }
      applyBubbleColorMode(bubble);
    });
  };

  const setBubbleGridAutoReplenish = (shouldAuto) => {
    bubbleGridState.autoReplenish = shouldAuto;
    if (bubbleGridAutoTimer) {
      window.clearInterval(bubbleGridAutoTimer);
      bubbleGridAutoTimer = null;
    }
    if (!shouldAuto) {
      return;
    }
    bubbleGridAutoTimer = window.setInterval(() => {
      if (!bubbleGridState.enabled || !playgroundBubbleGrid) {
        return;
      }
      if (playgroundAnimationsPaused) {
        return;
      }
      const currentCount = playgroundBubbleGrid.children.length;
      if (currentCount < bubbleGridCount) {
        playgroundBubbleGrid.appendChild(createBubbleElement());
      }
    }, 2000);
  };

  const updateSparkleCountLabel = () => {
    if (!playgroundSparkleCountOutput) {
      return;
    }
    playgroundSparkleCountOutput.textContent = String(sparkleFieldState.particleCount);
  };

  const updateSparkleSpeedLabel = () => {
    if (!playgroundSparkleSpeedOutput) {
      return;
    }
    playgroundSparkleSpeedOutput.textContent = `${sparkleFieldState.speedMultiplier.toFixed(1)}x`;
  };

  const resizeSparkleCanvas = () => {
    if (!(playgroundParticleCanvas instanceof HTMLCanvasElement) || !playgroundPlayArea) {
      return false;
    }
    const rect = playgroundPlayArea.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return false;
    }
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.floor(rect.width * dpr));
    const height = Math.max(1, Math.floor(rect.height * dpr));
    if (
      sparkleCanvasSize.width === width &&
      sparkleCanvasSize.height === height &&
      sparkleCanvasSize.dpr === dpr
    ) {
      return true;
    }
    sparkleCanvasSize = { width, height, dpr };
    playgroundParticleCanvas.width = width;
    playgroundParticleCanvas.height = height;
    sparkleCanvasContext = playgroundParticleCanvas.getContext("2d");
    return true;
  };

  const createSparkleParticle = (origin = null) => {
    const { width, height } = sparkleCanvasSize;
    const size = 2 + Math.random() * 4.5;
    const baseSpeed = 10 + Math.random() * 18;
    const angle = Math.random() * Math.PI * 2;
    const drift = {
      x: Math.cos(angle) * baseSpeed,
      y: Math.sin(angle) * baseSpeed,
    };
    const palette = [
      "rgba(255, 255, 255, 0.85)",
      "rgba(196, 184, 255, 0.75)",
      "rgba(255, 221, 249, 0.8)",
      "rgba(182, 224, 255, 0.75)",
    ];
    const point = origin || {
      x: Math.random() * width,
      y: Math.random() * height,
    };
    return {
      x: point.x,
      y: point.y,
      radius: size,
      opacity: 0.35 + Math.random() * 0.45,
      drift,
      color: palette[Math.floor(Math.random() * palette.length)],
      shimmer: Math.random() * Math.PI * 2,
    };
  };

  const syncSparkleParticles = (targetCount) => {
    if (targetCount <= 0) {
      sparkleParticles = [];
      return;
    }
    if (sparkleParticles.length > targetCount) {
      sparkleParticles = sparkleParticles.slice(0, targetCount);
      return;
    }
    while (sparkleParticles.length < targetCount) {
      sparkleParticles.push(createSparkleParticle());
    }
  };

  const updateSparkleParticles = (deltaSeconds) => {
    const { width, height } = sparkleCanvasSize;
    if (!width || !height) {
      return;
    }
    const speedScale = sparkleFieldState.speedMultiplier;
    sparkleParticles.forEach((particle) => {
      particle.x += particle.drift.x * deltaSeconds * speedScale;
      particle.y += particle.drift.y * deltaSeconds * speedScale;
      particle.shimmer += deltaSeconds * 2.5;

      if (particle.x > width + 20) {
        particle.x = -20;
      } else if (particle.x < -20) {
        particle.x = width + 20;
      }

      if (particle.y > height + 20) {
        particle.y = -20;
      } else if (particle.y < -20) {
        particle.y = height + 20;
      }
    });
  };

  const renderSparkleParticles = () => {
    if (!sparkleCanvasContext) {
      return;
    }
    const { width, height } = sparkleCanvasSize;
    sparkleCanvasContext.clearRect(0, 0, width, height);
    sparkleParticles.forEach((particle) => {
      const shimmerBoost = 0.2 + 0.8 * Math.sin(particle.shimmer);
      sparkleCanvasContext.shadowColor = "rgba(160, 132, 255, 0.45)";
      sparkleCanvasContext.shadowBlur = 12;
      sparkleCanvasContext.beginPath();
      sparkleCanvasContext.fillStyle = particle.color.replace(
        /rgba\\(([^,]+),([^,]+),([^,]+),[^)]+\\)/,
        `rgba($1,$2,$3,${particle.opacity * shimmerBoost})`
      );
      sparkleCanvasContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      sparkleCanvasContext.fill();
    });
    sparkleCanvasContext.shadowBlur = 0;
  };

  const animateSparkles = (timestamp) => {
    if (!sparkleFieldState.enabled) {
      sparkleAnimationId = null;
      sparkleLastFrameTime = null;
      return;
    }
    if (playgroundAnimationsPaused) {
      sparkleAnimationId = window.requestAnimationFrame(animateSparkles);
      return;
    }
    if (!sparkleLastFrameTime) {
      sparkleLastFrameTime = timestamp;
    }
    const deltaSeconds = Math.min(0.05, (timestamp - sparkleLastFrameTime) / 1000);
    sparkleLastFrameTime = timestamp;
    updateSparkleParticles(deltaSeconds);
    renderSparkleParticles();
    sparkleAnimationId = window.requestAnimationFrame(animateSparkles);
  };

  const ensureSparkleCanvasReady = () => {
    if (!sparkleFieldState.enabled) {
      return;
    }
    const didResize = resizeSparkleCanvas();
    if (!didResize) {
      window.requestAnimationFrame(ensureSparkleCanvasReady);
      return;
    }
    syncSparkleParticles(sparkleFieldState.particleCount);
    renderSparkleParticles();
    if (!sparkleAnimationId) {
      sparkleAnimationId = window.requestAnimationFrame(animateSparkles);
    }
  };

  const setSparkleFieldEnabled = (isEnabled) => {
    sparkleFieldState.enabled = Boolean(isEnabled);
    if (playgroundPlayArea) {
      playgroundPlayArea.classList.toggle(
        "is-sparkle-active",
        sparkleFieldState.enabled
      );
    }
    if (!sparkleFieldState.enabled) {
      if (sparkleAnimationId) {
        window.cancelAnimationFrame(sparkleAnimationId);
        sparkleAnimationId = null;
      }
      sparkleLastFrameTime = null;
      renderSparkleParticles();
      return;
    }
    window.requestAnimationFrame(ensureSparkleCanvasReady);
  };

  const updateSparkleParticleCount = (count) => {
    sparkleFieldState.particleCount = count;
    updateSparkleCountLabel();
    syncSparkleParticles(sparkleFieldState.particleCount);
  };

  const updateSparkleSpeed = (speed) => {
    sparkleFieldState.speedMultiplier = speed;
    updateSparkleSpeedLabel();
  };

  const spawnSparkleBurst = (event) => {
    if (!sparkleFieldState.enabled || !(playgroundParticleCanvas instanceof HTMLCanvasElement)) {
      return;
    }
    if (!sparkleCanvasSize.width || !sparkleCanvasSize.height) {
      resizeSparkleCanvas();
    }
    const rect = playgroundParticleCanvas.getBoundingClientRect();
    const dpr = sparkleCanvasSize.dpr || 1;
    const origin = {
      x: (event.clientX - rect.left) * dpr,
      y: (event.clientY - rect.top) * dpr,
    };
    const burstCount = 8 + Math.floor(Math.random() * 6);
    for (let i = 0; i < burstCount; i += 1) {
      sparkleParticles.push(createSparkleParticle(origin));
    }
  };

  const pausePlaygroundAnimations = (shouldPause) => {
    playgroundAnimationsPaused = Boolean(shouldPause);
    if (!playgroundAnimationsPaused && sparkleFieldState.enabled && !sparkleAnimationId) {
      sparkleAnimationId = window.requestAnimationFrame(animateSparkles);
    }
  };
  const imageFridgeRestoreTargets = [appShell, petWidget].filter(Boolean);
  let imageFridgePreviousVisibility = new Map();

  const toggleBubblewarpView = (shouldShow) => {
    if (!bubblewarpOverlay) {
      return;
    }

    if (shouldShow) {
      bubblewarpPreviousVisibility = new Map(
        bubblewarpRestoreTargets.map((target) => [target, target.hidden])
      );
      bubblewarpOverlay.removeAttribute("hidden");

      bubblewarpRestoreTargets.forEach((target) => {
        target.hidden = true;
      });

      window.requestAnimationFrame(() => {
        bubblewarpClose?.focus({ preventScroll: true });
      });

      return;
    }

    bubblewarpOverlay.setAttribute("hidden", "");

    bubblewarpRestoreTargets.forEach((target) => {
      const originalState = bubblewarpPreviousVisibility.get(target);
      target.hidden = Boolean(originalState);
    });

    window.requestAnimationFrame(() => {
      bubblewarpMenuTrigger?.focus({ preventScroll: true });
    });
  };

  if (bubblewarpOverlay) {
    bubblewarpClose?.addEventListener("click", () => toggleBubblewarpView(false));
    bubblewarpBackdrop?.addEventListener("click", () => toggleBubblewarpView(false));
  }

  const toggleImageFridgeView = async (shouldShow) => {
    if (!imageFridgeOverlay) {
      return;
    }

    if (shouldShow) {
      closeMenuModal();
      imageFridgePreviousVisibility = new Map(
        imageFridgeRestoreTargets.map((target) => [target, target.hidden])
      );
      imageFridgeOverlay.removeAttribute("hidden");
      document.body.classList.add("image-fridge-open");
      document.documentElement.classList.add("image-fridge-open");

      imageFridgeRestoreTargets.forEach((target) => {
        target.hidden = true;
      });

      await hydrateImageFridge();

      window.requestAnimationFrame(() => {
        imageFridgeClose?.focus({ preventScroll: true });
      });

      return;
    }

    closeImageFridgePreview();
    imageFridgeOverlay.setAttribute("hidden", "");
    document.body.classList.remove("image-fridge-open");
    document.documentElement.classList.remove("image-fridge-open");

    imageFridgeRestoreTargets.forEach((target) => {
      const originalState = imageFridgePreviousVisibility.get(target);
      target.hidden = Boolean(originalState);
    });

    window.requestAnimationFrame(() => {
      bubblewarpMenuTrigger?.focus({ preventScroll: true });
    });
  };

  const closeImageFridgePreview = () => {
    if (!imageFridgePreview) {
      return;
    }
    imageFridgePreview.setAttribute("hidden", "");
    if (imageFridgePreviewImage) {
      imageFridgePreviewImage.src = "";
      imageFridgePreviewImage.alt = "";
    }
    resetImageFridgePreviewZoom();
  };

  const openImageFridgePreview = (item) => {
    if (!imageFridgePreview || !imageFridgePreviewImage) {
      return;
    }
    imageFridgePreviewImage.src = item.dataUrl;
    imageFridgePreviewImage.alt = item.name || "Expanded image";
    imageFridgePreview.removeAttribute("hidden");
    resetImageFridgePreviewZoom();
    window.requestAnimationFrame(() => {
      imageFridgePreviewClose?.focus({ preventScroll: true });
    });
  };

  let imageFridgePreviewScale = 1;
  let imageFridgePreviewTranslate = { x: 0, y: 0 };
  let imageFridgePreviewDrag = {
    isDragging: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  };

  const applyImageFridgePreviewTransform = () => {
    if (!imageFridgePreviewImage) {
      return;
    }
    imageFridgePreviewImage.style.transform = `translate(${imageFridgePreviewTranslate.x}px, ${imageFridgePreviewTranslate.y}px) scale(${imageFridgePreviewScale})`;
  };

  const resetImageFridgePreviewZoom = () => {
    imageFridgePreviewScale = 1;
    imageFridgePreviewTranslate = { x: 0, y: 0 };
    applyImageFridgePreviewTransform();
  };

  const zoomImageFridgePreview = (nextScale, originX, originY) => {
    if (!imageFridgePreviewViewer) {
      return;
    }
    const clampedScale = clamp(nextScale, 1, 4);
    const previousScale = imageFridgePreviewScale;
    if (clampedScale === previousScale) {
      return;
    }
    imageFridgePreviewScale = clampedScale;
    const scaleRatio = clampedScale / previousScale;
    imageFridgePreviewTranslate = {
      x: originX - (originX - imageFridgePreviewTranslate.x) * scaleRatio,
      y: originY - (originY - imageFridgePreviewTranslate.y) * scaleRatio,
    };
    applyImageFridgePreviewTransform();
  };

  if (imageFridgePreview) {
    imageFridgePreviewBackdrop?.addEventListener("click", closeImageFridgePreview);
    imageFridgePreviewClose?.addEventListener("click", closeImageFridgePreview);
    imageFridgePreviewControls.forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.imageFridgeZoom;
        if (!imageFridgePreviewViewer) {
          return;
        }
        const viewerRect = imageFridgePreviewViewer.getBoundingClientRect();
        const originX = viewerRect.width / 2;
        const originY = viewerRect.height / 2;
        if (action === "in") {
          zoomImageFridgePreview(imageFridgePreviewScale + 0.5, originX, originY);
          return;
        }
        if (action === "out") {
          zoomImageFridgePreview(imageFridgePreviewScale - 0.5, originX, originY);
          return;
        }
        if (action === "reset") {
          resetImageFridgePreviewZoom();
        }
      });
    });
    imageFridgePreviewViewer?.addEventListener(
      "wheel",
      (event) => {
        if (!imageFridgePreviewViewer) {
          return;
        }
        event.preventDefault();
      const viewerRect = imageFridgePreviewViewer.getBoundingClientRect();
      const originX = event.clientX - viewerRect.left;
      const originY = event.clientY - viewerRect.top;
      const delta = event.deltaY > 0 ? -0.2 : 0.2;
        zoomImageFridgePreview(imageFridgePreviewScale + delta, originX, originY);
      },
      { passive: false }
    );
    imageFridgePreviewViewer?.addEventListener("pointerdown", (event) => {
      if (!imageFridgePreviewImage) {
        return;
      }
      imageFridgePreviewDrag = {
        isDragging: true,
        startX: event.clientX,
        startY: event.clientY,
        originX: imageFridgePreviewTranslate.x,
        originY: imageFridgePreviewTranslate.y,
      };
      imageFridgePreviewImage.classList.add("is-dragging");
      imageFridgePreviewViewer.setPointerCapture(event.pointerId);
    });
    imageFridgePreviewViewer?.addEventListener("pointermove", (event) => {
      if (!imageFridgePreviewDrag.isDragging) {
        return;
      }
      const dx = event.clientX - imageFridgePreviewDrag.startX;
      const dy = event.clientY - imageFridgePreviewDrag.startY;
      imageFridgePreviewTranslate = {
        x: imageFridgePreviewDrag.originX + dx,
        y: imageFridgePreviewDrag.originY + dy,
      };
      applyImageFridgePreviewTransform();
    });
    imageFridgePreviewViewer?.addEventListener("pointerup", (event) => {
      if (!imageFridgePreviewDrag.isDragging) {
        return;
      }
      imageFridgePreviewDrag.isDragging = false;
      imageFridgePreviewImage?.classList.remove("is-dragging");
      imageFridgePreviewViewer.releasePointerCapture(event.pointerId);
    });
    imageFridgePreviewViewer?.addEventListener("pointercancel", (event) => {
      if (!imageFridgePreviewDrag.isDragging) {
        return;
      }
      imageFridgePreviewDrag.isDragging = false;
      imageFridgePreviewImage?.classList.remove("is-dragging");
      imageFridgePreviewViewer.releasePointerCapture(event.pointerId);
    });
  }

  const toggleSketchpadView = (shouldShow) => {
    if (!sketchpadOverlay) {
      return;
    }

    if (shouldShow) {
      sketchpadPreviousVisibility = new Map(
        sketchpadRestoreTargets.map((target) => [target, target.hidden])
      );
      sketchpadOverlay.removeAttribute("hidden");
      document.body.classList.add("sketchpad-open");

      sketchpadRestoreTargets.forEach((target) => {
        target.hidden = true;
      });

      window.requestAnimationFrame(() => {
        resizeSketchpadCanvas();
        sketchpadClose?.focus({ preventScroll: true });
      });

      return;
    }

    sketchpadOverlay.setAttribute("hidden", "");
    document.body.classList.remove("sketchpad-open");

    sketchpadRestoreTargets.forEach((target) => {
      const originalState = sketchpadPreviousVisibility.get(target);
      target.hidden = Boolean(originalState);
    });

    window.requestAnimationFrame(() => {
      bubblewarpMenuTrigger?.focus({ preventScroll: true });
    });
  };

  const togglePlaygroundView = (shouldShow) => {
    if (!playgroundOverlay) {
      return;
    }

    if (shouldShow) {
      playgroundPreviousVisibility = new Map(
        playgroundRestoreTargets.map((target) => [target, target.hidden])
      );
      playgroundLastFocus =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      playgroundOverlay.removeAttribute("hidden");
      document.body.classList.add("playground-open");

      playgroundRestoreTargets.forEach((target) => {
        target.hidden = true;
      });

      window.requestAnimationFrame(() => {
        playgroundPanel?.focus({ preventScroll: true });
        resizeSparkleCanvas();
        if (sparkleFieldState.enabled) {
          syncSparkleParticles(sparkleFieldState.particleCount);
          renderSparkleParticles();
          if (!sparkleAnimationId) {
            sparkleAnimationId = window.requestAnimationFrame(animateSparkles);
          }
        }
      });

      return;
    }

    playgroundOverlay.setAttribute("hidden", "");
    document.body.classList.remove("playground-open");

    playgroundRestoreTargets.forEach((target) => {
      const originalState = playgroundPreviousVisibility.get(target);
      target.hidden = Boolean(originalState);
    });

    window.requestAnimationFrame(() => {
      if (playgroundLastFocus && document.contains(playgroundLastFocus)) {
        playgroundLastFocus.focus({ preventScroll: true });
        return;
      }
      bubblewarpMenuTrigger?.focus({ preventScroll: true });
    });
  };

  let sketchpadContext = null;
  let sketchpadPointerId = null;
  let sketchpadIsDrawing = false;
  let sketchpadHasMoved = false;
  let sketchpadLastPoint = null;
  let sketchpadStrokeDistance = 0;
  let sketchpadHistory = [];
  let sketchpadRedoStack = [];
  let sketchpadRestoreToken = 0;
  let sketchpadToolbarActions = null;
  let sketchpadIsDirty = false;

  const SKETCHPAD_PALETTES = {
    rainbow: [
      { label: "Red", value: "#ff4b5c" },
      { label: "Orange", value: "#ff8a3d" },
      { label: "Yellow", value: "#ffd166" },
      { label: "Green", value: "#4cd964" },
      { label: "Blue", value: "#3b82f6" },
      { label: "Purple", value: "#7c3aed" },
      { label: "Brown", value: "#8b5e3c" },
      { label: "Gray", value: "#8a8a8a" },
      { label: "Black", value: "#111111" },
      { label: "White", value: "#ffffff" },
    ],
    pastel: [
      { label: "Pastel Red", value: "#ff9aa2" },
      { label: "Pastel Orange", value: "#ffb68a" },
      { label: "Pastel Yellow", value: "#ffe29a" },
      { label: "Pastel Green", value: "#b7f5c1" },
      { label: "Pastel Blue", value: "#a8d5ff" },
      { label: "Pastel Purple", value: "#cbb3ff" },
      { label: "Pastel Brown", value: "#d8b4a0" },
      { label: "Pastel Gray", value: "#d0d0d0" },
      { label: "Soft Black", value: "#3b3b3b" },
      { label: "Soft White", value: "#ffffff" },
    ],
  };

  const sketchpadToolbarState = {
    colorMode: "rainbow-palette",
    penSize: 4,
    isEraser: false,
    pickerColor: "#ff7dbf",
    paletteColor: SKETCHPAD_PALETTES.rainbow[0].value,
  };
  const sketchpadBackgroundColor = "#ffffff";
  const sketchpadToastDuration = 2400;

  const showSketchpadToast = (message) => {
    let stack = document.getElementById("sketchpad-toast-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.id = "sketchpad-toast-stack";
      stack.className = "quicklaunch-toast-stack";
      stack.setAttribute("role", "status");
      stack.setAttribute("aria-live", "polite");
      stack.setAttribute("aria-atomic", "true");
      document.body.appendChild(stack);
    }
    const toast = document.createElement("div");
    toast.className = "quicklaunch-toast";
    toast.textContent = message;
    stack.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("quicklaunch-toast--visible");
    });

    window.setTimeout(() => {
      toast.classList.remove("quicklaunch-toast--visible");
      toast.addEventListener(
        "transitionend",
        () => {
          toast.remove();
        },
        { once: true }
      );
    }, sketchpadToastDuration);
  };

  const formatSketchpadTimestamp = (date) => {
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(
      date.getHours()
    )}${pad(date.getMinutes())}`;
  };

  const updateSketchpadHistoryButtons = () => {
    if (!sketchpadToolbarActions) {
      return;
    }
    const { undoButton, redoButton } = sketchpadToolbarActions;
    if (undoButton) {
      undoButton.disabled = sketchpadHistory.length <= 1;
    }
    if (redoButton) {
      redoButton.disabled = sketchpadRedoStack.length === 0;
    }
  };

  const captureSketchpadSnapshot = () => {
    if (!sketchpadCanvas) {
      return null;
    }
    try {
      return sketchpadCanvas.toDataURL("image/png");
    } catch (error) {
      console.warn("Unable to capture sketchpad snapshot.", error);
      return null;
    }
  };

  const clearSketchpadCanvas = () => {
    if (!sketchpadContext || !sketchpadCanvas) {
      return;
    }
    sketchpadContext.save();
    sketchpadContext.setTransform(1, 0, 0, 1, 0, 0);
    sketchpadContext.clearRect(0, 0, sketchpadCanvas.width, sketchpadCanvas.height);
    sketchpadContext.fillStyle = sketchpadBackgroundColor;
    sketchpadContext.fillRect(0, 0, sketchpadCanvas.width, sketchpadCanvas.height);
    sketchpadContext.restore();
  };

  const restoreSketchpadSnapshot = (snapshot) => {
    if (!snapshot || !sketchpadCanvas || !sketchpadContext) {
      return;
    }
    const token = (sketchpadRestoreToken += 1);
    const image = new Image();
    image.onload = () => {
      if (token !== sketchpadRestoreToken) {
        return;
      }
      clearSketchpadCanvas();
      const dpr = window.devicePixelRatio || 1;
      const width = sketchpadCanvas.width / dpr;
      const height = sketchpadCanvas.height / dpr;
      sketchpadContext.drawImage(image, 0, 0, width, height);
    };
    image.src = snapshot;
  };

  const pushSketchpadHistory = (snapshot) => {
    if (!snapshot) {
      return;
    }
    const lastSnapshot = sketchpadHistory[sketchpadHistory.length - 1];
    if (snapshot === lastSnapshot) {
      return;
    }
    sketchpadHistory = [...sketchpadHistory, snapshot];
    sketchpadRedoStack = [];
    updateSketchpadHistoryButtons();
  };

  const requestSketchpadClose = () => {
    if (sketchpadIsDirty) {
      const shouldDiscard = window.confirm(
        "You have unsaved sketchpad changes. Discard them?"
      );
      if (!shouldDiscard) {
        return;
      }
    }
    toggleSketchpadView(false);
  };

  const requestPlaygroundClose = () => {
    togglePlaygroundView(false);
  };

  const clearAll = () => {
    console.log("[Playground] clearAll requested");
    buildBubbleGrid();
  };

  const setMuted = (isMuted) => {
    console.log(`[Playground] setMuted(${isMuted}) requested`);
    playgroundMuted = Boolean(isMuted);
    pausePlaygroundAnimations(playgroundMuted);
  };

  const stopAll = () => {
    console.log("[Playground] stopAll requested");
    setMuted(true);
    playgroundAudioManager.stopAll();
    if (playgroundMuteToggle instanceof HTMLInputElement) {
      playgroundMuteToggle.checked = true;
    }
  };

  if (sketchpadOverlay) {
    sketchpadClose?.addEventListener("click", () => requestSketchpadClose());
    sketchpadBackdrop?.addEventListener("click", () => requestSketchpadClose());
  }

  if (playgroundOverlay) {
    playgroundClose?.addEventListener("click", () => requestPlaygroundClose());
    playgroundClearAllButton?.addEventListener("click", () => clearAll());
    playgroundStopAllButton?.addEventListener("click", () => stopAll());
    playgroundMuteToggle?.addEventListener("change", (event) => {
      const target = event.currentTarget;
      if (!(target instanceof HTMLInputElement)) {
        return;
      }
      setMuted(target.checked);
    });
    playgroundBubbleGridToggle?.addEventListener("change", (event) => {
      const target = event.currentTarget;
      if (!(target instanceof HTMLInputElement)) {
        return;
      }
      bubbleGridState.enabled = target.checked;
      buildBubbleGrid();
    });
    playgroundBubbleGridSoundToggle?.addEventListener("change", (event) => {
      const target = event.currentTarget;
      if (!(target instanceof HTMLInputElement)) {
        return;
      }
      bubbleGridState.soundEnabled = target.checked;
    });
    playgroundBubbleGridColorToggle?.addEventListener("change", (event) => {
      const target = event.currentTarget;
      if (!(target instanceof HTMLInputElement)) {
        return;
      }
      bubbleGridState.colorMode = target.checked;
      updateBubbleGridColorMode();
    });
    playgroundBubbleGridAutoToggle?.addEventListener("change", (event) => {
      const target = event.currentTarget;
      if (!(target instanceof HTMLInputElement)) {
        return;
      }
      setBubbleGridAutoReplenish(target.checked);
    });
    playgroundSparkleFieldToggle?.addEventListener("change", (event) => {
      const target = event.currentTarget;
      if (!(target instanceof HTMLInputElement)) {
        return;
      }
      setSparkleFieldEnabled(target.checked);
    });
    playgroundSparkleCountSlider?.addEventListener("input", (event) => {
      const target = event.currentTarget;
      if (!(target instanceof HTMLInputElement)) {
        return;
      }
      const nextValue = Number.parseInt(target.value, 10);
      if (Number.isNaN(nextValue)) {
        return;
      }
      updateSparkleParticleCount(nextValue);
    });
    playgroundSparkleSpeedSlider?.addEventListener("input", (event) => {
      const target = event.currentTarget;
      if (!(target instanceof HTMLInputElement)) {
        return;
      }
      const nextValue = Number.parseFloat(target.value);
      if (Number.isNaN(nextValue)) {
        return;
      }
      updateSparkleSpeed(nextValue);
    });
    playgroundPlayArea?.addEventListener("click", (event) => {
      if (!(event instanceof MouseEvent)) {
        return;
      }
      spawnSparkleBurst(event);
    });
    window.addEventListener("resize", () => {
      resizeSparkleCanvas();
    });
    bubbleGridState.enabled = Boolean(playgroundBubbleGridToggle?.checked);
    bubbleGridState.soundEnabled = Boolean(playgroundBubbleGridSoundToggle?.checked);
    bubbleGridState.colorMode = Boolean(playgroundBubbleGridColorToggle?.checked);
    setBubbleGridAutoReplenish(Boolean(playgroundBubbleGridAutoToggle?.checked));
    sparkleFieldState.enabled = Boolean(playgroundSparkleFieldToggle?.checked);
    if (playgroundSparkleCountSlider instanceof HTMLInputElement) {
      const initialCount = Number.parseInt(playgroundSparkleCountSlider.value, 10);
      sparkleFieldState.particleCount = Number.isNaN(initialCount)
        ? sparkleFieldState.particleCount
        : initialCount;
    }
    if (playgroundSparkleSpeedSlider instanceof HTMLInputElement) {
      const initialSpeed = Number.parseFloat(playgroundSparkleSpeedSlider.value);
      sparkleFieldState.speedMultiplier = Number.isNaN(initialSpeed)
        ? sparkleFieldState.speedMultiplier
        : initialSpeed;
    }
    updateSparkleCountLabel();
    updateSparkleSpeedLabel();
    setSparkleFieldEnabled(sparkleFieldState.enabled);
    buildBubbleGrid();
  }

  const requestImageFridgeClose = () => {
    toggleImageFridgeView(false);
  };

  if (imageFridgeOverlay) {
    imageFridgeClose?.addEventListener("click", () => requestImageFridgeClose());
  }

  const IMAGE_FRIDGE_DB_NAME = "bubblemarks-image-fridge";
  const IMAGE_FRIDGE_DB_VERSION = 1;
  const IMAGE_FRIDGE_STORE = "images";
  const imageFridgeToastDuration = 2200;
  let imageFridgeDbPromise = null;

  const showImageFridgeToast = (message) => {
    let stack = document.getElementById("image-fridge-toast-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.id = "image-fridge-toast-stack";
      stack.className = "quicklaunch-toast-stack";
      stack.setAttribute("role", "status");
      stack.setAttribute("aria-live", "polite");
      stack.setAttribute("aria-atomic", "true");
      document.body.appendChild(stack);
    }
    const toast = document.createElement("div");
    toast.className = "quicklaunch-toast";
    toast.textContent = message;
    stack.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("quicklaunch-toast--visible");
    });

    window.setTimeout(() => {
      toast.classList.remove("quicklaunch-toast--visible");
      toast.addEventListener(
        "transitionend",
        () => {
          toast.remove();
        },
        { once: true }
      );
    }, imageFridgeToastDuration);
  };

  const openImageFridgeDatabase = () => {
    if (!("indexedDB" in window)) {
      console.warn("IndexedDB is unavailable; Image Fridge storage disabled.");
      return Promise.resolve(null);
    }
    if (imageFridgeDbPromise) {
      return imageFridgeDbPromise;
    }
    imageFridgeDbPromise = new Promise((resolve) => {
      const request = indexedDB.open(IMAGE_FRIDGE_DB_NAME, IMAGE_FRIDGE_DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(IMAGE_FRIDGE_STORE)) {
          db.createObjectStore(IMAGE_FRIDGE_STORE, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn("Unable to open Image Fridge database.", request.error);
        resolve(null);
      };
    });
    return imageFridgeDbPromise;
  };

  const fetchImageFridgeItems = async () => {
    const db = await openImageFridgeDatabase();
    if (!db) {
      return [];
    }
    return new Promise((resolve) => {
      const transaction = db.transaction(IMAGE_FRIDGE_STORE, "readonly");
      const store = transaction.objectStore(IMAGE_FRIDGE_STORE);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => {
        console.warn("Unable to read Image Fridge items.", request.error);
        resolve([]);
      };
    });
  };

  const saveImageFridgeItem = async (item) => {
    console.log("✅ script validated");
    const db = await openImageFridgeDatabase();
    if (!db) {
      return false;
    }
    return new Promise((resolve) => {
      const transaction = db.transaction(IMAGE_FRIDGE_STORE, "readwrite");
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => {
        console.warn("Unable to save Image Fridge item.", transaction.error);
        resolve(false);
      };
      const store = transaction.objectStore(IMAGE_FRIDGE_STORE);
      store.put(item);
    });
  };

  const generateImageFridgeId = () => {
    if (window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }
    return `image-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const readImageFile = (file) =>
    new Promise((resolve) => {
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => {
        console.warn("Unable to read image file.", reader.error);
        resolve(null);
      };
      reader.readAsDataURL(file);
    });

  const createDataUrlFromArrayBuffer = (buffer, type = "application/octet-stream") => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    const base64 = window.btoa(binary);
    return `data:${type};base64,${base64}`;
  };

  const readImageBlob = async (blob) => {
    if (!blob) {
      return null;
    }
    if (typeof FileReader !== "undefined") {
      return readImageFile(blob);
    }
    if (typeof blob.arrayBuffer === "function") {
      try {
        const buffer = await blob.arrayBuffer();
        return createDataUrlFromArrayBuffer(buffer, blob.type || "image/png");
      } catch (error) {
        console.warn("Unable to read image blob.", error);
        return null;
      }
    }
    return null;
  };

  const formatImageFridgeTimestamp = (date) => {
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(
      date.getHours()
    )}${pad(date.getMinutes())}`;
  };

  const sanitizeImageFridgeFilename = (value) =>
    value
      .replace(/\.[^.]+$/, "")
      .replace(/[^\w-]+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^-+|-+$/g, "")
      .trim();

  const getImageFridgeFilename = (item, blobType) => {
    const baseName = sanitizeImageFridgeFilename(item?.name || "");
    const extension =
      blobType?.split("/")[1] || item?.type?.split("/")[1] || "png";
    const timestamp = formatImageFridgeTimestamp(new Date());
    return `${baseName || "image-fridge"}-${timestamp}.${extension}`;
  };

  const fetchImageFridgeBlob = async (item) => {
    if (!item?.dataUrl) {
      return null;
    }
    try {
      const response = await fetch(item.dataUrl);
      return await response.blob();
    } catch (error) {
      console.warn("Unable to read Image Fridge blob.", error);
      return null;
    }
  };

  const deleteImageFridgeItem = async (id) => {
    const db = await openImageFridgeDatabase();
    if (!db) {
      return false;
    }
    return new Promise((resolve) => {
      const transaction = db.transaction(IMAGE_FRIDGE_STORE, "readwrite");
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => {
        console.warn("Unable to delete Image Fridge item.", transaction.error);
        resolve(false);
      };
      const store = transaction.objectStore(IMAGE_FRIDGE_STORE);
      store.delete(id);
    });
  };

  const downloadImageFridgeItem = async (item) => {
    console.log("✅ script validated");
    const blob = await fetchImageFridgeBlob(item);
    if (!blob) {
      showImageFridgeToast("Unable to save image");
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = getImageFridgeFilename(item, blob.type);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const copyImageFridgeItem = async (item) => {
    if (!navigator.clipboard || typeof window.ClipboardItem === "undefined") {
      showImageFridgeToast("Copy unavailable");
      return;
    }
    const blob = await fetchImageFridgeBlob(item);
    if (!blob) {
      showImageFridgeToast("Copy failed");
      return;
    }
    const clipboardItem = new ClipboardItem({
      [blob.type || "image/png"]: blob,
    });
    try {
      await navigator.clipboard.write([clipboardItem]);
      showImageFridgeToast("Copied!");
    } catch (error) {
      console.warn("Unable to copy Image Fridge image.", error);
      showImageFridgeToast("Copy failed");
    }
  };

  const updateImageFridgeEmptyState = () => {
    if (!imageFridgeGrid || !imageFridgeEmpty) {
      return;
    }
    const hasTiles = imageFridgeGrid.childElementCount > 0;
    imageFridgeEmpty.hidden = hasTiles;
  };

  const createImageFridgeTile = (item) => {
    if (!imageFridgeGrid) {
      return;
    }
    const tile = imageFridgeTileTemplate?.content?.firstElementChild
      ? imageFridgeTileTemplate.content.firstElementChild.cloneNode(true)
      : document.createElement("div");
    tile.className = "image-fridge-overlay__tile";
    tile.setAttribute("role", "listitem");
    tile.dataset.imageFridgeId = item.id;

    const image =
      tile.querySelector(".image-fridge-overlay__thumb") || document.createElement("img");
    image.className = "image-fridge-overlay__thumb";
    image.src = item.dataUrl;
    image.alt = item.name || "Saved image";
    image.loading = "lazy";

    const caption =
      tile.querySelector(".image-fridge-overlay__caption") ||
      document.createElement("span");
    caption.className = "image-fridge-overlay__caption";
    caption.textContent = item.name || "Untitled image";

    const actions =
      tile.querySelector(".image-fridge-overlay__actions") || document.createElement("div");
    actions.className = "image-fridge-overlay__actions";

    if (!tile.contains(image) || !tile.contains(caption)) {
      tile.append(image, caption);
    }
    if (!tile.contains(actions)) {
      const expandButton = document.createElement("button");
      expandButton.type = "button";
      expandButton.textContent = "Expand";
      expandButton.className = "image-fridge-overlay__action image-fridge__action-btn";
      expandButton.dataset.imageFridgeAction = "expand";

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "Delete";
      deleteButton.className = "image-fridge-overlay__action image-fridge__action-btn";
      deleteButton.dataset.imageFridgeAction = "delete";

      const saveButton = document.createElement("button");
      saveButton.type = "button";
      saveButton.textContent = "Save";
      saveButton.className = "image-fridge-overlay__action image-fridge__action-btn";
      saveButton.dataset.imageFridgeAction = "save";

      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.textContent = "Copy";
      copyButton.className = "image-fridge-overlay__action image-fridge__action-btn";
      copyButton.dataset.imageFridgeAction = "copy";

      actions.append(expandButton, deleteButton, saveButton, copyButton);
      tile.append(actions);
    }

    const actionButtons = tile.querySelectorAll("[data-image-fridge-action]");
    actionButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const action = button.dataset.imageFridgeAction;
        if (action === "delete") {
          const deleted = await deleteImageFridgeItem(item.id);
          if (deleted) {
            tile.remove();
            updateImageFridgeEmptyState();
          } else {
            showImageFridgeToast("Unable to delete image");
          }
          return;
        }
        if (action === "save") {
          console.log("✅ script validated");
          await downloadImageFridgeItem(item);
          return;
        }
        if (action === "copy") {
          await copyImageFridgeItem(item);
          return;
        }
        if (action === "expand") {
          openImageFridgePreview(item);
          return;
        }
      });
    });

    imageFridgeGrid.appendChild(tile);
    updateImageFridgeEmptyState();
  };

  const hydrateImageFridge = async () => {
    if (!imageFridgeGrid) {
      return;
    }
    imageFridgeGrid.replaceChildren();
    updateImageFridgeEmptyState();
    const items = await fetchImageFridgeItems();
    items
      .slice()
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
      .forEach((item) => {
        if (item?.id && item?.dataUrl) {
          createImageFridgeTile(item);
        }
      });
    updateImageFridgeEmptyState();
  };

  const handleImageFridgeFiles = async (files) => {
    if (!Array.isArray(files) || files.length === 0) {
      return;
    }
    let hadUnsupported = false;
    for (const file of files) {
      if (!file || !file.type || !file.type.startsWith("image/")) {
        hadUnsupported = true;
        continue;
      }
      const dataUrl = await readImageBlob(file);
      if (!dataUrl) {
        continue;
      }
      const item = {
        id: generateImageFridgeId(),
        name: file.name,
        type: file.type,
        dataUrl,
        createdAt: Date.now(),
      };
      const saved = await saveImageFridgeItem(item);
      if (!saved) {
        showImageFridgeToast("Unable to save image");
      }
      createImageFridgeTile(item);
    }
    if (hadUnsupported) {
      showImageFridgeToast("Unsupported file");
    }
  };

  if (imageFridgeDropzone) {
    imageFridgeDropzone.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "copy";
      }
    });
    imageFridgeDropzone.addEventListener("drop", (event) => {
      event.preventDefault();
      const files = Array.from(event.dataTransfer?.files || []);
      handleImageFridgeFiles(files);
    });
  }

  if (imageFridgeOverlay) {
    updateImageFridgeEmptyState();
  }

  const isImageFridgeVisible = () =>
    Boolean(imageFridgeOverlay) && !imageFridgeOverlay.hasAttribute("hidden");

  const normalizeClipboardImageFile = (file, index) => {
    if (!file) {
      return null;
    }
    if (file.name) {
      return file;
    }
    const extension = file.type?.split("/")[1] || "png";
    const timestamp = Date.now();
    return new File([file], `pasted-image-${timestamp}-${index}.${extension}`, {
      type: file.type || "image/png",
    });
  };

  const handleImageFridgePaste = async (event) => {
    if (!isImageFridgeVisible()) {
      return;
    }
    const clipboardItems = Array.from(event.clipboardData?.items || []);
    const clipboardFiles = Array.from(event.clipboardData?.files || []);
    const images = [...clipboardFiles];

    clipboardItems.forEach((item) => {
      if (!item?.type || !item.type.startsWith("image/")) {
        return;
      }
      const file = item.getAsFile?.();
      if (file) {
        images.push(file);
      }
    });

    if (images.length === 0) {
      return;
    }
    event.preventDefault();
    const normalizedImages = images
      .map((file, index) => normalizeClipboardImageFile(file, index))
      .filter(Boolean);
    await handleImageFridgeFiles(normalizedImages);
  };

  document.addEventListener("paste", (event) => {
    void handleImageFridgePaste(event);
  });

  const copySketchpadToClipboard = () => {
    if (!sketchpadCanvas) {
      return;
    }
    if (!navigator.clipboard || typeof window.ClipboardItem === "undefined") {
      showSketchpadToast("Copy unavailable");
      return;
    }
    sketchpadCanvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const item = new ClipboardItem({ "image/png": blob });
      navigator.clipboard
        .write([item])
        .then(() => {
          showSketchpadToast("Copied!");
          sketchpadIsDirty = false;
        })
        .catch((error) => {
          console.warn("Unable to copy sketchpad image.", error);
          showSketchpadToast("Copy failed");
        });
    });
  };

  const saveSketchpadImage = () => {
    if (!sketchpadCanvas) {
      return;
    }
    sketchpadCanvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sketchpad-${formatSketchpadTimestamp(new Date())}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      sketchpadIsDirty = false;
    });
  };

  const resetSketchpadHistory = () => {
    sketchpadHistory = [];
    sketchpadRedoStack = [];
    clearSketchpadCanvas();
    const snapshot = captureSketchpadSnapshot();
    if (snapshot) {
      sketchpadHistory.push(snapshot);
    }
    updateSketchpadHistoryButtons();
    sketchpadIsDirty = false;
  };

  const undoSketchpad = () => {
    if (sketchpadHistory.length <= 1) {
      return;
    }
    const currentSnapshot = sketchpadHistory.pop();
    if (currentSnapshot) {
      sketchpadRedoStack.push(currentSnapshot);
    }
    const previousSnapshot = sketchpadHistory[sketchpadHistory.length - 1];
    restoreSketchpadSnapshot(previousSnapshot);
    updateSketchpadHistoryButtons();
  };

  const redoSketchpad = () => {
    if (sketchpadRedoStack.length === 0) {
      return;
    }
    const nextSnapshot = sketchpadRedoStack.pop();
    if (!nextSnapshot) {
      return;
    }
    sketchpadHistory.push(nextSnapshot);
    restoreSketchpadSnapshot(nextSnapshot);
    updateSketchpadHistoryButtons();
  };

  const getSketchpadHue = () =>
    (sketchpadStrokeDistance * 0.15 + window.performance.now() * 0.01) % 360;

  const getSketchpadStrokeStyle = () => {
    if (sketchpadToolbarState.isEraser) {
      return sketchpadBackgroundColor;
    }
    if (sketchpadToolbarState.colorMode === "picker") {
      return sketchpadToolbarState.pickerColor;
    }
    if (sketchpadToolbarState.colorMode === "rainbow-palette") {
      return sketchpadToolbarState.paletteColor;
    }
    if (sketchpadToolbarState.colorMode === "pastel-palette") {
      return sketchpadToolbarState.paletteColor;
    }
    if (sketchpadToolbarState.colorMode === "rainbow-shuffle") {
      const hue = getSketchpadHue();
      return `hsl(${hue}, 80%, 55%)`;
    }
    return sketchpadToolbarState.paletteColor;
  };

  const applySketchpadStrokeStyle = () => {
    if (!sketchpadContext) {
      return;
    }
    sketchpadContext.lineWidth = sketchpadToolbarState.penSize;
    sketchpadContext.strokeStyle = getSketchpadStrokeStyle();
  };

  const updateSketchpadPaletteOptions = (elements) => {
    if (!elements) {
      return;
    }
    const { paletteSelect } = elements;
    if (!paletteSelect) {
      return;
    }
    const paletteKey =
      sketchpadToolbarState.colorMode === "pastel-palette" ? "pastel" : "rainbow";
    const options = SKETCHPAD_PALETTES[paletteKey];
    paletteSelect.innerHTML = "";
    options.forEach((entry) => {
      const opt = document.createElement("option");
      opt.value = entry.value;
      opt.textContent = entry.label;
      paletteSelect.appendChild(opt);
    });
    if (!options.some((entry) => entry.value === sketchpadToolbarState.paletteColor)) {
      sketchpadToolbarState.paletteColor = options[0].value;
    }
    paletteSelect.value = sketchpadToolbarState.paletteColor;
  };

  const updateSketchpadToolbarUI = (elements) => {
    if (!elements) {
      return;
    }
    const { modeSelect, pickerInput, paletteSelect, sizeInput, sizeValue, eraserToggle } =
      elements;
    modeSelect.value = sketchpadToolbarState.colorMode;
    sizeInput.value = String(sketchpadToolbarState.penSize);
    sizeValue.textContent = `${sketchpadToolbarState.penSize}px`;
    eraserToggle.checked = sketchpadToolbarState.isEraser;
    pickerInput.value = sketchpadToolbarState.pickerColor;
    const usesPicker = sketchpadToolbarState.colorMode === "picker";
    const usesPalette =
      sketchpadToolbarState.colorMode === "rainbow-palette" ||
      sketchpadToolbarState.colorMode === "pastel-palette";
    pickerInput.hidden = !usesPicker;
    paletteSelect.hidden = !usesPalette;
    if (usesPalette) {
      updateSketchpadPaletteOptions(elements);
    }
  };

  const initializeSketchpadToolbar = () => {
    if (!sketchpadToolbar || sketchpadToolbar.dataset.ready === "true") {
      return null;
    }

    const modeLabel = document.createElement("label");
    modeLabel.textContent = "Color";
    const modeSelect = document.createElement("select");
    [
      { value: "rainbow-palette", label: "Rainbow palette" },
      { value: "pastel-palette", label: "Pastel palette" },
      { value: "rainbow-shuffle", label: "Rainbow shuffle" },
      { value: "picker", label: "Picker" },
    ].forEach((option) => {
      const opt = document.createElement("option");
      opt.value = option.value;
      opt.textContent = option.label;
      modeSelect.appendChild(opt);
    });
    modeLabel.appendChild(modeSelect);

    const pickerInput = document.createElement("input");
    pickerInput.type = "color";
    pickerInput.value = sketchpadToolbarState.pickerColor;

    const paletteSelect = document.createElement("select");

    const sizeLabel = document.createElement("label");
    sizeLabel.textContent = "Pen";
    const sizeInput = document.createElement("input");
    sizeInput.type = "range";
    sizeInput.min = "1";
    sizeInput.max = "120";
    sizeInput.value = String(sketchpadToolbarState.penSize);
    const sizeValue = document.createElement("span");
    sizeValue.textContent = `${sketchpadToolbarState.penSize}px`;
    sizeLabel.append(sizeInput, sizeValue);

    const eraserLabel = document.createElement("label");
    const eraserToggle = document.createElement("input");
    eraserToggle.type = "checkbox";
    eraserLabel.append(eraserToggle, document.createTextNode("Eraser"));

    const undoButton = document.createElement("button");
    undoButton.type = "button";
    undoButton.textContent = "Undo";

    const redoButton = document.createElement("button");
    redoButton.type = "button";
    redoButton.textContent = "Redo";

    const restartButton = document.createElement("button");
    restartButton.type = "button";
    restartButton.textContent = "Restart";

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.textContent = "Copy";

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.textContent = "Save";

    sketchpadToolbar.append(
      modeLabel,
      paletteSelect,
      pickerInput,
      sizeLabel,
      eraserLabel,
      undoButton,
      redoButton,
      restartButton,
      copyButton,
      saveButton
    );
    sketchpadToolbar.dataset.ready = "true";

    const toolbarElements = {
      modeSelect,
      pickerInput,
      paletteSelect,
      sizeInput,
      sizeValue,
      eraserToggle,
    };

    sketchpadToolbarActions = {
      undoButton,
      redoButton,
      restartButton,
      copyButton,
      saveButton,
    };

    modeSelect.addEventListener("change", () => {
      sketchpadToolbarState.colorMode = modeSelect.value;
      updateSketchpadToolbarUI(toolbarElements);
    });

    pickerInput.addEventListener("input", () => {
      sketchpadToolbarState.pickerColor = pickerInput.value;
    });

    paletteSelect.addEventListener("change", () => {
      sketchpadToolbarState.paletteColor = paletteSelect.value;
    });

    sizeInput.addEventListener("input", () => {
      const nextSize = Number.parseInt(sizeInput.value, 10);
      sketchpadToolbarState.penSize = Number.isFinite(nextSize) ? nextSize : 4;
      updateSketchpadToolbarUI(toolbarElements);
    });

    eraserToggle.addEventListener("change", () => {
      sketchpadToolbarState.isEraser = eraserToggle.checked;
    });

    undoButton.addEventListener("click", () => {
      undoSketchpad();
    });

    redoButton.addEventListener("click", () => {
      redoSketchpad();
    });

    restartButton.addEventListener("click", () => {
      resetSketchpadHistory();
    });

    copyButton.addEventListener("click", () => {
      copySketchpadToClipboard();
    });

    saveButton.addEventListener("click", () => {
      saveSketchpadImage();
    });

    updateSketchpadToolbarUI(toolbarElements);
    updateSketchpadHistoryButtons();
    return toolbarElements;
  };

  const getSketchpadPoint = (event) => {
    if (!sketchpadCanvas) {
      return null;
    }
    const rect = sketchpadCanvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const resizeSketchpadCanvas = () => {
    if (!sketchpadCanvas) {
      return;
    }
    const rect = sketchpadCanvas.getBoundingClientRect();
    const width = Math.max(0, rect.width);
    const height = Math.max(0, rect.height);

    if (!width || !height) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    sketchpadCanvas.style.width = `${width}px`;
    sketchpadCanvas.style.height = `${height}px`;
    sketchpadCanvas.width = Math.round(width * dpr);
    sketchpadCanvas.height = Math.round(height * dpr);

    const context = sketchpadCanvas.getContext("2d");
    if (!context) {
      return;
    }

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = sketchpadToolbarState.penSize;
    sketchpadContext = context;
    if (sketchpadHistory.length > 0) {
      restoreSketchpadSnapshot(sketchpadHistory[sketchpadHistory.length - 1]);
    } else {
      clearSketchpadCanvas();
    }
  };

  if (sketchpadCanvas) {
    initializeSketchpadToolbar();
    sketchpadCanvas.style.touchAction = "none";
    resizeSketchpadCanvas();
    resetSketchpadHistory();
    window.addEventListener("resize", resizeSketchpadCanvas);

    sketchpadCanvas.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }
      if (!sketchpadContext) {
        return;
      }
      sketchpadPointerId = event.pointerId;
      sketchpadIsDrawing = true;
      sketchpadHasMoved = false;
      sketchpadStrokeDistance = 0;
      sketchpadLastPoint = getSketchpadPoint(event);
      if (!sketchpadLastPoint) {
        return;
      }
      sketchpadCanvas.setPointerCapture(event.pointerId);
      applySketchpadStrokeStyle();
      sketchpadContext.beginPath();
      sketchpadContext.moveTo(sketchpadLastPoint.x, sketchpadLastPoint.y);
    });

    sketchpadCanvas.addEventListener("pointermove", (event) => {
      if (!sketchpadIsDrawing || event.pointerId !== sketchpadPointerId) {
        return;
      }
      if (!sketchpadContext || !sketchpadLastPoint) {
        return;
      }
      const point = getSketchpadPoint(event);
      if (!point) {
        return;
      }
      const deltaX = point.x - sketchpadLastPoint.x;
      const deltaY = point.y - sketchpadLastPoint.y;
      const distance = Math.hypot(deltaX, deltaY);
      sketchpadStrokeDistance += distance;
      applySketchpadStrokeStyle();
      sketchpadHasMoved = true;
      sketchpadContext.lineTo(point.x, point.y);
      sketchpadContext.stroke();
      sketchpadLastPoint = point;
    });

    const stopSketchpadStroke = (event) => {
      if (event.pointerId !== sketchpadPointerId) {
        return;
      }
      const didDraw = sketchpadHasMoved;
      sketchpadIsDrawing = false;
      sketchpadPointerId = null;
      sketchpadLastPoint = null;
      sketchpadHasMoved = false;
      if (sketchpadCanvas.hasPointerCapture(event.pointerId)) {
        sketchpadCanvas.releasePointerCapture(event.pointerId);
      }
      if (didDraw) {
        const snapshot = captureSketchpadSnapshot();
        pushSketchpadHistory(snapshot);
        sketchpadIsDirty = true;
      }
    };

    sketchpadCanvas.addEventListener("pointerup", stopSketchpadStroke);
    sketchpadCanvas.addEventListener("pointercancel", stopSketchpadStroke);
    sketchpadCanvas.addEventListener("pointerleave", stopSketchpadStroke);
  }

  let bubblewarpMenuNoticeTimeout;
  let bubblewarpMenuCloseTimeout;

  function openMenuModal() {
    if (!bubblewarpMenuModal) {
      return;
    }

    bubblewarpMenuModal.removeAttribute("hidden");
    bubblewarpMenuTrigger?.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-modal-open");
    window.requestAnimationFrame(() => {
      bubblewarpMenuClose?.focus({ preventScroll: true });
    });
  }

  function closeMenuModal() {
    if (!bubblewarpMenuModal) {
      return;
    }

    const notice = bubblewarpMenuModal.querySelector(".bubblewarp-menu-modal__notice");
    if (notice) {
      notice.hidden = true;
    }
    window.clearTimeout(bubblewarpMenuNoticeTimeout);
    window.clearTimeout(bubblewarpMenuCloseTimeout);
    bubblewarpMenuModal.setAttribute("hidden", "");
    bubblewarpMenuTrigger?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-modal-open");
    window.requestAnimationFrame(() => {
      bubblewarpMenuTrigger?.focus({ preventScroll: true });
    });
  }

  if (bubblewarpMenuTrigger && bubblewarpMenuModal) {
    bubblewarpMenuTrigger.addEventListener("click", openMenuModal);
    bubblewarpMenuBackdrop?.addEventListener("click", closeMenuModal);
    bubblewarpMenuClose?.addEventListener("click", closeMenuModal);

    const bubblewarpMenuPrimary = bubblewarpMenuModal.querySelector(
      "[data-bubblewarp-menu-action=\"bubblewarp\"]"
    );
    const sketchpadMenuButton = bubblewarpMenuModal.querySelector(
      "[data-bubblewarp-menu-action=\"sketchpad\"]"
    );
    const imageFridgeMenuButton = bubblewarpMenuModal.querySelector(
      "[data-bubblewarp-menu-action=\"image-fridge\"]"
    );
    const playgroundMenuButton = bubblewarpMenuModal.querySelector(
      "[data-bubblewarp-menu-action=\"playground\"]"
    );
    const bubblewarpMenuDialog = bubblewarpMenuModal.querySelector(
      ".bubblewarp-menu-modal__dialog"
    );
    const bubblewarpMenuGrid = bubblewarpMenuModal.querySelector(
      ".bubblewarp-menu-modal__grid"
    );

    const ensureBubblewarpMenuNotice = () => {
      if (!bubblewarpMenuDialog || !bubblewarpMenuGrid) {
        return null;
      }

      let notice = bubblewarpMenuDialog.querySelector(
        ".bubblewarp-menu-modal__notice"
      );
      if (!notice) {
        notice = document.createElement("p");
        notice.className = "bubblewarp-menu-modal__notice";
        notice.setAttribute("role", "status");
        notice.setAttribute("aria-live", "polite");
        notice.hidden = true;
        bubblewarpMenuDialog.insertBefore(notice, bubblewarpMenuGrid);
      }

      return notice;
    };

    const showBubblewarpPlaceholderNotice = () => {
      const notice = ensureBubblewarpMenuNotice();
      if (!notice) {
        return;
      }

      notice.textContent = "Not implemented yet";
      notice.hidden = false;
      window.clearTimeout(bubblewarpMenuNoticeTimeout);
      bubblewarpMenuNoticeTimeout = window.setTimeout(() => {
        notice.hidden = true;
      }, 2000);
    };

    bubblewarpMenuPrimary?.addEventListener("click", () => {
      closeMenuModal();
      toggleBubblewarpView(true);
    });

    sketchpadMenuButton?.addEventListener("click", () => {
      closeMenuModal();
      toggleSketchpadView(true);
    });

    imageFridgeMenuButton?.addEventListener("click", () => {
      closeMenuModal();
      toggleImageFridgeView(true);
    });

    playgroundMenuButton?.addEventListener("click", () => {
      closeMenuModal();
      togglePlaygroundView(true);
    });

    bubblewarpMenuButtons.forEach((button) => {
      if (
        button === bubblewarpMenuPrimary ||
        button === sketchpadMenuButton ||
        button === imageFridgeMenuButton ||
        button === playgroundMenuButton
      ) {
        return;
      }

      if (button.dataset.bubblewarpMenuAction === "placeholder") {
        button.addEventListener("click", () => {
          showBubblewarpPlaceholderNotice();
          window.clearTimeout(bubblewarpMenuCloseTimeout);
          bubblewarpMenuCloseTimeout = window.setTimeout(() => {
            closeMenuModal();
          }, 800);
        });
        return;
      }

      button.addEventListener("click", closeMenuModal);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !bubblewarpMenuModal.hasAttribute("hidden")) {
        closeMenuModal();
      }
    });
  }

  if (sketchpadOverlay) {
    document.addEventListener("keydown", (event) => {
      if (sketchpadOverlay.hasAttribute("hidden")) {
        return;
      }
      if (event.key === "Escape") {
        requestSketchpadClose();
        return;
      }
      if (!(event.ctrlKey || event.metaKey) || event.altKey) {
        return;
      }
      const key = event.key.toLowerCase();
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        undoSketchpad();
        return;
      }
      if (key === "y" || (key === "z" && event.shiftKey)) {
        event.preventDefault();
        redoSketchpad();
      }
    });
  }

  if (imageFridgeOverlay) {
    document.addEventListener("keydown", (event) => {
      if (imageFridgeOverlay.hasAttribute("hidden")) {
        return;
      }
      if (event.key === "Escape") {
        requestImageFridgeClose();
      }
    });
  }

  if (playgroundOverlay) {
    document.addEventListener("keydown", (event) => {
      if (playgroundOverlay.hasAttribute("hidden")) {
        return;
      }
      if (event.key === "Escape") {
        requestPlaygroundClose();
      }
    });
  }

  if (!grid) console.error("Missing #bookmarks element in DOM");
  if (!keyboardContainer) console.error("Missing #keyboard element in DOM");

  preferences = loadPreferences();
  applyScrollLock(preferences.scrollLocked);
  applyPreferences({ syncInputs: false, lazyAxolotl: true });

  if (petWidgetFrame) {
    petWidgetFrame.addEventListener("load", () => {
      notifyPetWidgetVacation(preferences.petVacation === true);
      updatePetWidgetName(preferences.petName);
      notifyPetWidgetSoundEnabled(preferences.petSoundEnabled !== false);
      notifyPetWidgetScroll(preferences.petScrollDisabled === true);
    });
  }

  safeInitialize("control tabs", setupControlTabs);
  safeInitialize("search", setupSearch);
  safeInitialize("keyboard", setupKeyboard);
  safeInitialize("settings menu", setupSettingsMenu);
  safeInitialize("data tools", setupDataTools);
  safeInitialize("bookmark creation", setupBookmarkCreation);
  safeInitialize("bookmark management", setupBookmarkManagement);
  safeInitialize("category customization", setupCategoryCustomization);
  safeInitialize("layout controls", setupLayoutControls);
  safeInitialize("axolotl travel controls", () =>
    setupAxolotlTravelControls(petWidgetFrame)
  );

  applyPreferences({ lazyAxolotl: true });

  console.log("✅ script validated");

  if (preferences.showAxolotl !== false) {
    ensureAxolotlInitialized();
  } else if (axolotlLayer) {
    axolotlLayer.hidden = true;
  }

  await hydrateData();
});


async function hydrateData() {
  setLoading(true);
  let hasRendered = false;

  try {
    const stored = loadStoredBookmarks();
    if (stored.length) {
      setBookmarks(stored, { persist: false });
      hasRendered = true;
    }

    const response = await fetch(DEFAULT_SOURCE, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Unable to load bookmarks.json");
    }

    const remote = sanitizeBookmarks(await response.json());
    if (remote.length) {
      setBookmarks(remote, { persist: true });
      hasRendered = true;
    } else if (!hasRendered) {
      renderBookmarks([]);
    }
  } catch (error) {
    console.error("Error loading bookmarks:", error);
    if (!hasRendered) {
      renderBookmarks([]);
    }
  } finally {
    setLoading(false);
  }
}

function loadStoredBookmarks() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = safeStorage.get(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return sortBookmarksAlphabetically(sanitizeBookmarks(parsed));
  } catch (error) {
    console.warn("Unable to load stored bookmarks", error);
    return [];
  }
}

function setupControlTabs() {
  const buttons = Array.from(document.querySelectorAll("[data-controls-tab]"));
  const panels = getControlPanels();

  if (!buttons.length || !panels.length) return;

  const activateControlTab = (name, focus = false) => {
    panels.forEach((panel) => {
      const isActive = panel.dataset.controlsPanel === name;
      panel.hidden = !isActive;
      panel.setAttribute("aria-hidden", isActive ? "false" : "true");
    });

    buttons.forEach((button) => {
      const isActive = button.dataset.controlsTab === name;
      button.setAttribute("aria-selected", isActive ? "true" : "false");
      button.setAttribute("tabindex", isActive ? "0" : "-1");
      button.classList.toggle("controls__tab--active", isActive);

      if (isActive && focus) {
        button.focus();
      }
    });

    if (name === "keyboard") {
      const searchInput = document.getElementById("search");
      if (searchInput) {
        window.requestAnimationFrame(() => {
          searchInput.focus();
        });
      }
    }
  };

  const focusTabAtIndex = (index) => {
    const button = buttons[index];
    if (!button) return;
    activateControlTab(button.dataset.controlsTab, true);
  };

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      activateControlTab(button.dataset.controlsTab);
    });

    button.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (index + direction + buttons.length) % buttons.length;
        focusTabAtIndex(nextIndex);
      } else if (event.key === "Home") {
        event.preventDefault();
        focusTabAtIndex(0);
      } else if (event.key === "End") {
        event.preventDefault();
        focusTabAtIndex(buttons.length - 1);
      }
    });
  });

  const defaultTab = buttons.find((button) => button.dataset.controlsTab === "bookmarks");
  const initial = defaultTab || buttons[0];
  if (initial) {
    activateControlTab(initial.dataset.controlsTab);
  }
}

function normalizeImagePosition(value) {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (IMAGE_POSITION_OPTIONS.has(normalized)) {
      return normalized;
    }
  }
  return "center";
}

function sanitizeBookmarks(entries) {
  if (!Array.isArray(entries)) return [];

  return entries
    .map((entry, index) => {
      const name = String(entry.name ?? "Untitled").trim();
      const url = String(entry.url ?? "").trim();
      const category = entry.category ? String(entry.category).trim() : "Unsorted";
      const image = entry.image ? String(entry.image).trim() : "";
      const imagePosition = normalizeImagePosition(entry.imagePosition);
      const idValue =
        typeof entry.id === "string" && entry.id.trim()
          ? entry.id.trim()
          : `${url || "bookmark"}::${index}`;

      return {
        id: idValue,
        name,
        url,
        category,
        image,
        imagePosition,
      };
    })
    .filter((entry) => entry.name && entry.url);
}

function sortBookmarksAlphabetically(entries) {
  if (!Array.isArray(entries)) {
    return [];
  }

  return [...entries].sort((a, b) => {
    const nameA = a?.name ?? "";
    const nameB = b?.name ?? "";
    return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
  });
}


function getDefaultCategorySettings() {
  return DEFAULT_CATEGORY_SETTINGS.map((item) => ({ ...item }));
}

function mergeCategorySettingsWithDefaults(current) {
  const defaults = getDefaultCategorySettings();
  const normalizedCurrent = Array.isArray(current)
    ? current
        .map((entry) => normalizeCategorySetting(entry))
        .filter(Boolean)
    : [];

  const currentMap = new Map(normalizedCurrent.map((entry) => [entry.key, entry]));
  const defaultKeys = new Set(defaults.map((entry) => entry.key));
  const merged = defaults.map((entry) => {
    const existing = currentMap.get(entry.key);
    if (!existing) {
      return { ...entry };
    }

    const existingLabel = typeof existing.label === "string" ? existing.label.trim() : "";

    return {
      key: entry.key,
      label: existingLabel || entry.label,
      color: ensureHexColor(existing.color) || entry.color,
      isExtra: false,
    };
  });

  normalizedCurrent.forEach((entry) => {
    if (!defaultKeys.has(entry.key)) {
      const existingLabel = typeof entry.label === "string" ? entry.label.trim() : "";

      merged.push({
        key: entry.key,
        label: existingLabel || prettifyCategoryKey(entry.key),
        color: ensureHexColor(entry.color) || pickCategoryColor(entry.key),
        isExtra: Boolean(entry.isExtra),
      });
    }
  });

  return merged;
}

function loadCategorySettings() {
  const defaults = getDefaultCategorySettings();

  if (typeof window === "undefined") {
    return defaults;
  }

  try {
    const raw = safeStorage.get(CATEGORY_STORAGE_KEY);
    if (!raw) {
      safeStorage.set(CATEGORY_STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      safeStorage.set(CATEGORY_STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }

    const deduped = [];
    const seen = new Set();

    parsed.forEach((entry) => {
      const normalized = normalizeCategorySetting(entry);
      if (!normalized || seen.has(normalized.key)) {
        return;
      }
      seen.add(normalized.key);
      deduped.push(normalized);
    });

    if (!deduped.length) {
      safeStorage.set(CATEGORY_STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }

    const merged = mergeCategorySettingsWithDefaults(deduped);
    const stored = JSON.stringify(deduped);
    const desired = JSON.stringify(merged);
    if (stored !== desired) {
      safeStorage.set(CATEGORY_STORAGE_KEY, desired);
    }

    return merged;
  } catch (error) {
    console.warn("Unable to load category settings", error);
    return defaults;
  }
}

function saveCategorySettings() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    safeStorage.set(CATEGORY_STORAGE_KEY, JSON.stringify(categorySettings));
  } catch (error) {
    console.warn("Unable to save category preferences", error);
  }
}

function resetCategorySettingsToDefaults() {
  categorySettings = getDefaultCategorySettings();
  saveCategorySettings();
  updateCategoryBar();
  applyFilters();

  if (categoryModal && !categoryModal.hidden) {
    renderCategorySettingsEditor();
  }
}

function normalizeCardSize(value) {
  if (typeof value === "string") {
    const trimmed = value.trim().toLowerCase();
    if (CARD_SIZE_OPTIONS.includes(trimmed)) {
      return trimmed;
    }
  }
  return "comfy";
}

function cardSizeToIndex(size) {
  const index = CARD_SIZE_OPTIONS.indexOf(size);
  return index >= 0 ? index : CARD_SIZE_OPTIONS.indexOf("comfy");
}

function indexToCardSize(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "comfy";
  }
  return CARD_SIZE_OPTIONS[numeric] || "comfy";
}

function normalizeLayoutCount(value, fallback) {
  const fallbackNumber = Number.isFinite(fallback) ? fallback : DEFAULT_CARDS_PER_ROW;
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return clamp(Math.round(numeric), LAYOUT_MIN_COUNT, LAYOUT_MAX_COUNT);
  }
  return clamp(Math.round(fallbackNumber), LAYOUT_MIN_COUNT, LAYOUT_MAX_COUNT);
}

function normalizePageIndex(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return 0;
  }
  return Math.max(0, Math.floor(numeric));
}

function getDefaultPreferences() {
  return {
    showHeading: true,
    showAxolotl: true,
    scrollLocked: false,
    cardSize: "comfy",
    cardsPerRow: DEFAULT_CARDS_PER_ROW,
    rowsPerPage: DEFAULT_ROWS_PER_PAGE,
    pageIndex: 0,
    petName: DEFAULT_PET_NAME,
    petVacation: false,
    petSoundEnabled: true,
    petScrollDisabled: false,
  };
}

function normalizePreferences(value) {
  const defaults = getDefaultPreferences();
  if (!value || typeof value !== "object") {
    return { ...defaults };
  }

  const cardsPerRow = normalizeLayoutCount(value.cardsPerRow, defaults.cardsPerRow);
  const rowsPerPage = normalizeLayoutCount(value.rowsPerPage, defaults.rowsPerPage);
  const petName = normalizePetName(value.petName);

  return {
    showHeading: value.showHeading !== false,
    showAxolotl: value.showAxolotl !== false,
    scrollLocked: value.scrollLocked === true,
    cardSize: normalizeCardSize(value.cardSize),
    cardsPerRow,
    rowsPerPage,
    pageIndex: normalizePageIndex(value.pageIndex),
    petName,
    petVacation: value.petVacation === true,
    petSoundEnabled: value.petSoundEnabled !== false,
    petScrollDisabled: value.petScrollDisabled === true,
  };
}

function normalizePetName(value) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed) {
      return trimmed.slice(0, 64);
    }
  }
  return DEFAULT_PET_NAME;
}

function loadPreferences() {
  if (typeof window === "undefined") {
    return getDefaultPreferences();
  }

  try {
    const raw = safeStorage.get(PREFERENCES_STORAGE_KEY);
    if (!raw) {
      return getDefaultPreferences();
    }
    const parsed = JSON.parse(raw);
    return normalizePreferences(parsed);
  } catch (error) {
    console.warn("Unable to load preferences", error);
    return getDefaultPreferences();
  }
}

function savePreferences() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    safeStorage.set(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.warn("Unable to save preferences", error);
  }
}

function normalizeCategorySetting(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const key = typeof entry.key === "string" ? normalizeCategoryKey(entry.key) : null;
  if (!key) {
    return null;
  }

  const label = typeof entry.label === "string" ? entry.label.trim() : "";
  const color = ensureHexColor(entry.color);
  const isExtra = Boolean(entry.isExtra);

  return { key, label, color, isExtra };
}

function ensureHexColor(value) {
  if (typeof value !== "string") {
    return "";
  }

  let trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
    trimmed = `#${trimmed.slice(1).split("").map((char) => char + char).join("")}`;
  }

  if (/^[0-9a-f]{6}$/i.test(trimmed)) {
    trimmed = `#${trimmed}`;
  }

  if (!/^#[0-9a-f]{6}$/i.test(trimmed)) {
    return "";
  }

  return trimmed.toLowerCase();
}

function normalizeCategoryKey(name) {
  if (typeof name !== "string") {
    return "";
  }

  const base = name.trim().toLowerCase();
  if (!base) {
    return "";
  }

  const slug = base.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || DEFAULT_CATEGORY_SLUG;
}

function prettifyCategoryKey(key) {
  if (!key) {
    return DEFAULT_CATEGORY_LABEL;
  }

  return key
    .split(/[-_]+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ") || DEFAULT_CATEGORY_LABEL;
}

function findCategorySetting(key) {
  return categorySettings.find((setting) => setting.key === key) || null;
}

function getCategoryLabel(key, fallback = DEFAULT_CATEGORY_LABEL) {
  const setting = findCategorySetting(key);
  if (setting && setting.label) {
    return setting.label;
  }
  const info = categoryInfo.get(key);
  if (info?.originalLabel) {
    return info.originalLabel;
  }
  if (fallback) {
    return fallback;
  }
  return prettifyCategoryKey(key);
}

function getCategoryColor(key) {
  const setting = findCategorySetting(key);
  const color = ensureHexColor(setting?.color);
  if (color) {
    return color;
  }
  return pickCategoryColor(key);
}

function pickCategoryColor(seed) {
  const palette = pickFallbackPalette(seed || "category");
  return palette.accent || "#ff99da";
}

function generateCategoryKey(label, existingKeys) {
  const existing = new Set(existingKeys ?? []);
  existing.add("all");
  let base = normalizeCategoryKey(label);
  if (!base) {
    base = "category";
  }

  let candidate = base;
  let counter = 2;
  while (!candidate || existing.has(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }
  existing.add(candidate);
  return candidate;
}

function collectCategoryInfo() {
  const info = new Map();

  bookmarks.forEach((bookmark) => {
    const raw = bookmark.category || DEFAULT_CATEGORY_LABEL;
    const key = normalizeCategoryKey(raw) || DEFAULT_CATEGORY_SLUG;
    if (!info.has(key)) {
      info.set(key, {
        key,
        originalLabel: raw || DEFAULT_CATEGORY_LABEL,
      });
    }
  });

  if (!info.has(DEFAULT_CATEGORY_SLUG)) {
    info.set(DEFAULT_CATEGORY_SLUG, {
      key: DEFAULT_CATEGORY_SLUG,
      originalLabel: DEFAULT_CATEGORY_LABEL,
    });
  }

  return info;
}

function computeCategoryDescriptors() {
  const info = collectCategoryInfo();
  categoryInfo = info;

  const sanitized = [];
  const seenKeys = new Set();
  let mutated = false;

  categorySettings.forEach((entry) => {
    const normalized = normalizeCategorySetting(entry);
    if (!normalized || seenKeys.has(normalized.key)) {
      mutated = true;
      return;
    }
    seenKeys.add(normalized.key);
    sanitized.push({ ...normalized });
  });

  const descriptors = [];
  const used = new Set();

  sanitized.forEach((entry) => {
    const details = info.get(entry.key);
    const color = ensureHexColor(entry.color) || pickCategoryColor(entry.key);
    const label = entry.label || details?.originalLabel || prettifyCategoryKey(entry.key);
    const isExtra = entry.isExtra || !details;
    descriptors.push({
      key: entry.key,
      label,
      color,
      isExtra,
      originalLabel: details?.originalLabel || null,
    });

    if (entry.label !== label || entry.color !== color || entry.isExtra !== isExtra) {
      entry.label = label;
      entry.color = color;
      entry.isExtra = isExtra;
      mutated = true;
    }

    used.add(entry.key);
  });

  info.forEach((details, key) => {
    if (used.has(key)) {
      return;
    }
    const color = pickCategoryColor(key);
    descriptors.push({
      key,
      label: details.originalLabel,
      color,
      isExtra: false,
      originalLabel: details.originalLabel,
    });
    sanitized.push({ key, label: details.originalLabel, color, isExtra: false });
    mutated = true;
  });

  categorySettings = sanitized;

  if (mutated) {
    saveCategorySettings();
  }

  return descriptors;
}

function applyCategoryStylesToPill(pill, color) {
  const base = parseHexColor(color) || parseHexColor(pickCategoryColor(pill.dataset.category));
  if (!base) {
    return;
  }
  const soft = toRgba(mixWithWhite(base, 0.75), 0.45);
  const border = toRgba(mixWithWhite(base, 0.55), 0.7);
  const strongStart = toRgba(mixWithWhite(base, 0.1), 0.95);
  const strongEnd = toRgba(mixWithWhite(base, 0.4), 0.95);
  const shadow = toRgba(mixWithBlack(base, 0.35), 0.35);
  const shadowStrong = toRgba(mixWithBlack(base, 0.2), 0.45);
  const contrast = getContrastColor(rgbToHex(mixWithWhite(base, 0.15)));
  const quiet = toRgba(mixWithBlack(base, 0.5), 0.72);

  pill.style.setProperty("--category-color-soft", soft);
  pill.style.setProperty("--category-color-border", border);
  pill.style.setProperty(
    "--category-color-strong",
    `linear-gradient(135deg, ${strongStart}, ${strongEnd})`
  );
  pill.style.setProperty("--category-color-contrast", contrast);
  pill.style.setProperty("--category-color-shadow", shadow);
  pill.style.setProperty("--category-color-shadow-strong", shadowStrong);
  pill.style.setProperty("--category-color-text", quiet);
}

function applyCategoryStylesToBadge(element, color) {
  const base = parseHexColor(color);
  if (!base) {
    return;
  }
  const background = toRgba(mixWithWhite(base, 0.35), 0.88);
  const border = toRgba(mixWithWhite(base, 0.18), 0.94);
  const textColor = getContrastColor(rgbToHex(mixWithWhite(base, 0.05)));

  element.style.setProperty("--category-chip-bg", background);
  element.style.setProperty("--category-chip-border", border);
  element.style.setProperty("--category-chip-text", textColor);
}

function mixWithWhite(rgb, amount) {
  return {
    r: Math.round(rgb.r + (255 - rgb.r) * amount),
    g: Math.round(rgb.g + (255 - rgb.g) * amount),
    b: Math.round(rgb.b + (255 - rgb.b) * amount),
  };
}

function mixWithBlack(rgb, amount) {
  return {
    r: Math.round(rgb.r * (1 - amount)),
    g: Math.round(rgb.g * (1 - amount)),
    b: Math.round(rgb.b * (1 - amount)),
  };
}

function toRgba(rgb, alpha = 1) {
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.min(Math.max(alpha, 0), 1)})`;
}

function parseHexColor(hex) {
  if (typeof hex !== "string") {
    return null;
  }
  const normalized = ensureHexColor(hex);
  if (!normalized) {
    return null;
  }
  const value = normalized.slice(1);
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHex(rgb) {
  const clamp = (channel) => Math.min(255, Math.max(0, Math.round(channel)));
  return `#${clamp(rgb.r).toString(16).padStart(2, "0")}${clamp(rgb.g)
    .toString(16)
    .padStart(2, "0")}${clamp(rgb.b).toString(16).padStart(2, "0")}`;
}

function getContrastColor(hex) {
  const rgb = parseHexColor(hex);
  if (!rgb) {
    return "#2b1f33";
  }
  const luminance =
    0.2126 * srgbComponent(rgb.r) + 0.7152 * srgbComponent(rgb.g) + 0.0722 * srgbComponent(rgb.b);
  return luminance > 0.6 ? "#2b1f33" : "#ffffff";
}

function srgbComponent(value) {
  const channel = value / 255;
  if (channel <= 0.03928) {
    return channel / 12.92;
  }
  return ((channel + 0.055) / 1.055) ** 2.4;
}

function setupBookmarkCreation() {
  if (!addBookmarkBtn || !bookmarkModal || !bookmarkForm) {
    return;
  }

  const focusableSelector = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(", ");

  const getFocusableElements = () =>
    Array.from(bookmarkModal.querySelectorAll(focusableSelector)).filter((element) => {
      if (element.hasAttribute("hidden")) return false;
      if (element.getAttribute("aria-hidden") === "true") return false;
      if (element.tabIndex < 0) return false;
      const style = window.getComputedStyle(element);
      if (style.display === "none" || style.visibility === "hidden") {
        return false;
      }
      return true;
    });

  const closeBookmarkModal = ({ restoreFocus = true } = {}) => {
    bookmarkModal.hidden = true;
    document.body.classList.remove("modal-open");
    bookmarkForm.reset();
    if (restoreFocus) {
      window.setTimeout(() => {
        addBookmarkBtn?.focus();
      }, 20);
    }
  };

  const openBookmarkModal = () => {
    bookmarkForm.reset();
    const preferredKey = activeCategory !== "all" ? activeCategory : bookmarkCategorySelect?.value;
    renderBookmarkCategoryOptions(preferredKey);
    bookmarkModal.hidden = false;
    document.body.classList.add("modal-open");
    window.setTimeout(() => {
      bookmarkNameInput?.focus({ preventScroll: true });
    }, 20);
  };

  addBookmarkBtn.addEventListener("click", () => {
    openBookmarkModal();
  });

  bookmarkModal.addEventListener("click", (event) => {
    const target = event.target;
    if (target && target.dataset && target.dataset.bookmarkDismiss === "true") {
      closeBookmarkModal();
    }
  });

  bookmarkModal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeBookmarkModal();
      return;
    }

    if (event.key === "Tab") {
      const focusable = getFocusableElements();
      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first || !bookmarkModal.contains(document.activeElement)) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  bookmarkForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(bookmarkForm);
    const nameValue = String(formData.get("name") ?? "").trim();
    const urlValue = String(formData.get("url") ?? "").trim();
    const imageValue = String(formData.get("image") ?? "").trim();
    const categoryKey = normalizeCategoryKey(String(formData.get("category") ?? DEFAULT_CATEGORY_SLUG));

    const categoryLabel = getCategoryLabel(
      categoryKey,
      prettifyCategoryKey(categoryKey || DEFAULT_CATEGORY_SLUG)
    );

    const sanitized = sanitizeBookmarks([
      {
        name: nameValue,
        url: urlValue,
        category: categoryLabel,
        image: imageValue,
      },
    ]);

    if (!sanitized.length) {
      alert("Please add a name and link so we can save your bookmark.");
      return;
    }

    const [bookmark] = sanitized;
    const nextCategoryKey = categoryKey || DEFAULT_CATEGORY_SLUG;
    setBookmarks([bookmark, ...bookmarks], { persist: true });
    setActiveCategory(nextCategoryKey);
    closeBookmarkModal({ restoreFocus: false });
    window.requestAnimationFrame(() => {
      const firstCard = grid?.querySelector(".card");
      if (firstCard) {
        firstCard.focus();
      }
    });
  });
}

function setupBookmarkManagement() {
  if (
    !manageBookmarksBtn ||
    !manageBookmarksModal ||
    !manageBookmarksList ||
    !manageBookmarksTemplate
  ) {
    return;
  }

  const focusableSelector = [
    'button:not([disabled])',
    '[href]:not([aria-hidden="true"])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(", ");

  const getFocusableElements = () =>
    Array.from(manageBookmarksModal.querySelectorAll(focusableSelector)).filter((element) => {
      if (element.hasAttribute("hidden")) return false;
      if (element.getAttribute("aria-hidden") === "true") return false;
      if (element.tabIndex < 0) return false;
      const style = window.getComputedStyle(element);
      if (style.display === "none" || style.visibility === "hidden") {
        return false;
      }
      return true;
    });

  const closeManageModal = ({ restoreFocus = true } = {}) => {
    manageBookmarksModal.hidden = true;
    document.body.classList.remove("modal-open");
    resetBookmarkManagerConfirm();
    if (restoreFocus) {
      window.setTimeout(() => {
        manageBookmarksBtn?.focus();
      }, 20);
    }
  };

  const openManageModal = () => {
    renderBookmarkManagerList();
    manageBookmarksModal.hidden = false;
    document.body.classList.add("modal-open");
    if (manageBookmarksList) {
      manageBookmarksList.scrollTop = 0;
    }
    window.setTimeout(() => {
      const firstDelete = manageBookmarksList?.querySelector(
        ".bookmark-manager-item__delete"
      );
      if (firstDelete) {
        firstDelete.focus({ preventScroll: true });
        return;
      }
      const closeBtn = manageBookmarksModal.querySelector(
        ".bookmark-manager-modal__close"
      );
      closeBtn?.focus({ preventScroll: true });
    }, 20);
  };

  manageBookmarksBtn.addEventListener("click", () => {
    openManageModal();
  });

  manageBookmarksModal.addEventListener("click", (event) => {
    const target = event.target;
    if (target && target.dataset && target.dataset.managerDismiss === "true") {
      closeManageModal();
    }
  });

  manageBookmarksModal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeManageModal();
      return;
    }

    if (event.key === "Tab") {
      const focusable = getFocusableElements();
      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first || !manageBookmarksModal.contains(document.activeElement)) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  manageBookmarksList.addEventListener("change", (event) => {
    const select = event.target;
    if (!(select instanceof HTMLSelectElement) || !select.hasAttribute("data-pos")) {
      return;
    }

    const item = select.closest(".bookmark-manager-item");
    if (!item) {
      return;
    }

    const bookmarkId = select.dataset.bookmarkId || item.dataset.bookmarkId || "";
    if (!bookmarkId) {
      return;
    }

    const normalizedValue = normalizeImagePosition(select.value);
    if (select.value !== normalizedValue) {
      select.value = normalizedValue;
    }

    const bookmarkIndex = bookmarks.findIndex((bookmark) => bookmark && bookmark.id === bookmarkId);
    if (bookmarkIndex === -1) {
      return;
    }

    const currentValue = normalizeImagePosition(bookmarks[bookmarkIndex]?.imagePosition);
    if (currentValue === normalizedValue) {
      return;
    }

    const next = bookmarks.slice();
    next[bookmarkIndex] = {
      ...next[bookmarkIndex],
      imagePosition: normalizedValue,
    };

    hideBookmarkManagerConfirm(item);
    setBookmarks(next, { persist: true });

    window.requestAnimationFrame(() => {
      const updatedSelect = Array.from(
        manageBookmarksList?.querySelectorAll("[data-pos]") || []
      ).find(
        (element) =>
          element instanceof HTMLSelectElement && element.dataset.bookmarkId === bookmarkId
      );
      updatedSelect?.focus({ preventScroll: true });
    });
  });

  manageBookmarksList.addEventListener("click", (event) => {
    const button = event.target?.closest?.("button");
    if (!button) {
      return;
    }

    const item = button.closest(".bookmark-manager-item");
    if (!item) {
      return;
    }

    if (button.classList.contains("bookmark-manager-item__delete")) {
      event.preventDefault();
      showBookmarkManagerConfirm(item);
      return;
    }

    const action = button.dataset.managerAction;
    if (action === "confirm") {
      event.preventDefault();
      deleteBookmarkById(item.dataset.bookmarkId || "");
      return;
    }

    if (action === "cancel") {
      event.preventDefault();
      hideBookmarkManagerConfirm(item);
      const deleteBtn = item.querySelector(".bookmark-manager-item__delete");
      deleteBtn?.focus({ preventScroll: true });
    }
  });
}

function setupCategoryCustomization() {
  if (!customizeCategoriesBtn || !categoryModal || !categoryForm || !categorySettingsList) {
    return;
  }

  customizeCategoriesBtn.addEventListener("click", () => {
    openCategoryModal();
  });

  categoryModal.addEventListener("click", (event) => {
    const target = event.target;
    if (target && target.dataset && target.dataset.modalDismiss === "true") {
      closeCategoryModal();
    }
  });

  categoryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleCategoryFormSubmit();
  });

  if (addCategoryBtn) {
    addCategoryBtn.addEventListener("click", () => {
      addNewCategoryRow();
    });
  }

  categorySettingsList.addEventListener("click", handleCategoryListClick);
  document.addEventListener("keydown", handleCategoryModalKeydown);
}

function openCategoryModal() {
  renderCategorySettingsEditor();
  categoryModal.hidden = false;
  document.body.classList.add("modal-open");
  const firstInput = categorySettingsList.querySelector('input[name="label"]');
  if (firstInput) {
    window.setTimeout(() => firstInput.focus(), 20);
  }
}

function closeCategoryModal() {
  categoryModal.hidden = true;
  document.body.classList.remove("modal-open");
}

function handleCategoryModalKeydown(event) {
  if (event.key === "Escape" && !categoryModal.hidden) {
    event.preventDefault();
    closeCategoryModal();
  }
}

  function renderCategorySettingsEditor() {
    if (!categorySettingsList) {
      return;
    }
    const descriptors = computeCategoryDescriptors();
    const rows = descriptors.map((descriptor) => createCategorySettingRow(descriptor));
    replaceChildrenSafe(categorySettingsList, rows);
  }

function createCategorySettingRow(descriptor) {
  const node = categoryItemTemplate?.content?.firstElementChild
    ? categoryItemTemplate.content.firstElementChild.cloneNode(true)
    : document.createElement("div");

  if (!node.classList.contains("category-setting")) {
    node.className = "category-setting";
    node.innerHTML =
      '<div class="category-setting__inputs">\n        <label class="category-setting__label">\n          <span>Name</span>\n          <input type="text" name="label" required />\n        </label>\n        <label class="category-setting__color">\n          <span>Color</span>\n          <input type="color" name="color" value="#ff80c8" />\n        </label>\n      </div>\n      <div class="category-setting__actions">\n        <button type="button" class="category-setting__move" data-direction="up" aria-label="Move up">▲</button>\n        <button type="button" class="category-setting__move" data-direction="down" aria-label="Move down">▼</button>\n        <button type="button" class="category-setting__remove" aria-label="Remove category">Remove</button>\n      </div>';
  }

  node.dataset.categoryKey = descriptor.key || "";

  const labelInput = node.querySelector('input[name="label"]');
  const colorInput = node.querySelector('input[name="color"]');
  const removeBtn = node.querySelector(".category-setting__remove");

  if (labelInput) {
    labelInput.value = descriptor.label || "";
    labelInput.placeholder = descriptor.originalLabel || descriptor.label || "Category";
  }

  if (colorInput) {
    colorInput.value = ensureHexColor(descriptor.color) || pickCategoryColor(descriptor.key || "custom");
  }

  if (descriptor.isExtra) {
    node.dataset.extra = "true";
    if (removeBtn) {
      removeBtn.disabled = false;
      removeBtn.removeAttribute("aria-hidden");
      removeBtn.tabIndex = 0;
      removeBtn.style.display = "";
    }
  } else {
    node.dataset.fixed = "true";
    if (removeBtn) {
      removeBtn.disabled = true;
      removeBtn.setAttribute("aria-hidden", "true");
      removeBtn.tabIndex = -1;
      removeBtn.style.display = "none";
    }
  }

  return node;
}

function handleCategoryListClick(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const setting = target.closest(".category-setting");
  if (!setting) {
    return;
  }

  if (target.classList.contains("category-setting__remove")) {
    if (setting.dataset.extra === "true") {
      setting.remove();
    }
    return;
  }

  if (target.classList.contains("category-setting__move")) {
    const direction = target.dataset.direction;
    if (direction === "up" && setting.previousElementSibling) {
      categorySettingsList.insertBefore(setting, setting.previousElementSibling);
    } else if (direction === "down" && setting.nextElementSibling) {
      categorySettingsList.insertBefore(setting.nextElementSibling, setting);
    }
  }
}

function addNewCategoryRow() {
  const descriptor = {
    key: "",
    label: "",
    color: pickCategoryColor(`custom-${Date.now()}`),
    isExtra: true,
    originalLabel: "",
  };

  const node = createCategorySettingRow(descriptor);
  node.dataset.new = "true";
  categorySettingsList.appendChild(node);

  const labelInput = node.querySelector('input[name="label"]');
  if (labelInput) {
    window.setTimeout(() => {
      labelInput.focus();
      labelInput.select();
    }, 20);
  }
}

function handleCategoryFormSubmit() {
  const rows = Array.from(categorySettingsList.querySelectorAll(".category-setting"));
  if (!rows.length) {
    categorySettings = [];
    saveCategorySettings();
    updateCategoryBar();
    applyFilters();
    closeCategoryModal();
    return;
  }

  const nextSettings = [];
  const existingKeys = new Set();

  rows.forEach((row, index) => {
    const labelInput = row.querySelector('input[name="label"]');
    const colorInput = row.querySelector('input[name="color"]');
    const isExtra = row.dataset.extra === "true";
    const labelValue = labelInput?.value.trim() || `Category ${index + 1}`;
    let key = row.dataset.categoryKey;

    if (!key || isExtra) {
      key = generateCategoryKey(labelValue, existingKeys);
      row.dataset.categoryKey = key;
    }

    existingKeys.add(key);
    const color = ensureHexColor(colorInput?.value) || pickCategoryColor(key);

    nextSettings.push({
      key,
      label: labelValue,
      color,
      isExtra,
    });
  });

  categorySettings = nextSettings;
  saveCategorySettings();
  updateCategoryBar();
  applyFilters();
  closeCategoryModal();
}

function setBookmarks(next, { persist } = { persist: true }) {
  bookmarks = sortBookmarksAlphabetically(sanitizeBookmarks(next));
  categoryInfo = collectCategoryInfo();
  if (persist) {
    try {
      safeStorage.set(STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (error) {
      console.warn("Unable to save bookmarks", error);
    }
  }
  updateCategoryBar();
  updateSuggestions();
  if (searchTerm.trim() || activeCategory !== "all") {
    applyFilters();
  } else {
    renderBookmarks(bookmarks);
  }
  refreshBookmarkManagerUI();
}

function setupSearch() {
  if (!searchInput || !clearSearchBtn || !datalist) {
    console.error("Search UI is missing required elements");
    return;
  }

  searchInput.addEventListener("input", (event) => {
    searchTerm = event.target.value;
    applyFilters();
  });

  clearSearchBtn.addEventListener("click", () => {
    searchTerm = "";
    searchInput.value = "";
    applyFilters();
    searchInput.focus();
  });
}

function applyPreferences({ syncInputs = true, lazyAxolotl = false } = {}) {
  const showHeading = preferences.showHeading !== false;
  const showAxolotl = preferences.showAxolotl !== false;
  const scrollLocked = preferences.scrollLocked === true;
  const cardSize = normalizeCardSize(preferences.cardSize);
  const petName = normalizePetName(preferences.petName);
  const petVacation = preferences.petVacation === true;
  const petSoundEnabled = preferences.petSoundEnabled !== false;
  const petScrollDisabled = preferences.petScrollDisabled === true;
  const cardsPerRow = normalizeLayoutCount(preferences.cardsPerRow, DEFAULT_CARDS_PER_ROW);
  const rowsPerPage = normalizeLayoutCount(preferences.rowsPerPage, DEFAULT_ROWS_PER_PAGE);

  preferences.cardsPerRow = cardsPerRow;
  preferences.rowsPerPage = rowsPerPage;
  preferences.pageIndex = normalizePageIndex(preferences.pageIndex);

  preferences.cardSize = cardSize;
  preferences.scrollLocked = scrollLocked;
  preferences.petName = petName;
  preferences.petVacation = petVacation;
  preferences.petSoundEnabled = petSoundEnabled;
  preferences.petScrollDisabled = petScrollDisabled;

  if (heroHeading) {
    heroHeading.hidden = !showHeading;
  }

  if (syncInputs) {
    if (toggleHeadingInput) {
      toggleHeadingInput.checked = showHeading;
    }
    if (toggleAxolotlInput) {
      toggleAxolotlInput.checked = showAxolotl;
    }
    if (petNameInput) {
      petNameInput.value = petName;
    }
    if (togglePetVacationInput) {
      togglePetVacationInput.checked = petVacation;
    }
    if (togglePetSoundsInput) {
      togglePetSoundsInput.checked = !petSoundEnabled;
    }
    if (togglePetScrollInput) {
      togglePetScrollInput.checked = petScrollDisabled;
    }
    if (scrollLockToggleInput) {
      scrollLockToggleInput.checked = scrollLocked;
    }
    if (cardSizeInput) {
      cardSizeInput.value = String(cardSizeToIndex(cardSize));
    }
    if (cardsPerRowInput) {
      cardsPerRowInput.value = String(cardsPerRow);
    }
    if (rowsPerPageInput) {
      rowsPerPageInput.value = String(rowsPerPage);
    }
  }

  if (axolotlLayer) {
    axolotlLayer.hidden = !showAxolotl;
  }

  if (document.body) {
    document.body.setAttribute("data-card-size", cardSize);
  }

  applyGridLayout(cardsPerRow, rowsPerPage);
  applyScrollLock(scrollLocked);
  applyPetVacationMode(petVacation);
  applyPetSoundPreference(petSoundEnabled);
  applyPetScrollPreference(petScrollDisabled);
  updatePetWidgetName(petName);

  if (showAxolotl) {
    if (!lazyAxolotl) {
      ensureAxolotlInitialized();
    }
  } else {
    axolotlController?.disable?.();
  }
}

function applyPetVacationMode(enabled) {
  const vacationEnabled = enabled === true;

  if (document.body) {
    document.body.dataset.petVacation = vacationEnabled ? "true" : "false";
  }

  notifyPetWidgetVacation(vacationEnabled);
}

function applyPetSoundPreference(enabled) {
  const soundEnabled = enabled !== false;
  notifyPetWidgetSoundEnabled(soundEnabled);
}

function applyPetScrollPreference(disabled) {
  const scrollDisabled = disabled === true;

  const petDoc = petWidgetFrame?.contentDocument;

  if (petDoc?.body) {
    petDoc.body.classList.toggle("pet-scroll-disabled", scrollDisabled);
  }

  if (petDoc) {
    const aquariumContainer = petDoc.querySelector(".aquarium-container");
    if (aquariumContainer) {
      aquariumContainer.style.overflowY = scrollDisabled ? "hidden" : "auto";
    }
  }

  notifyPetWidgetScroll(scrollDisabled);
}

function notifyPetWidgetVacation(vacationEnabled) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = {
    source: "bubblemarks",
    type: "set-vacation-mode",
    payload: { vacation: vacationEnabled },
  };

  try {
    const targetWindow = petWidgetFrame?.contentWindow;
    if (targetWindow) {
      targetWindow.postMessage(payload, window.location.origin || "*");
    }
  } catch (error) {
    console.warn("Unable to notify pet widget about vacation mode", error);
  }
}

function notifyPetWidgetScroll(scrollDisabled) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = {
    source: "bubblemarks",
    type: "set-pet-scroll",
    payload: { disabled: scrollDisabled === true },
  };

  try {
    const targetWindow = petWidgetFrame?.contentWindow;
    if (targetWindow) {
      targetWindow.postMessage(payload, "*");
    }
  } catch (error) {
    console.warn("Unable to notify pet widget about scroll mode", error);
  }
}

function notifyPetWidgetSoundEnabled(soundEnabled) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = {
    source: "bubblemarks",
    type: "set-pet-sound-enabled",
    payload: { enabled: soundEnabled },
  };

  try {
    const targetWindow = petWidgetFrame?.contentWindow;
    if (targetWindow) {
      targetWindow.postMessage(payload, window.location.origin || "*");
    }
  } catch (error) {
    console.warn("Unable to notify pet widget about pet sounds", error);
  }
}

function updatePetWidgetName(nextName) {
  if (typeof window === "undefined") {
    return;
  }

  const petName = normalizePetName(nextName);

  try {
    const petDoc = petWidgetFrame?.contentDocument;
    if (petDoc) {
      petDoc.querySelectorAll(".pet-name").forEach((el) => {
        el.textContent = petName;
      });
    }
  } catch (error) {
    console.warn("Unable to update pet name inside widget", error);
  }

  const payload = {
    source: "bubblemarks",
    type: "set-pet-name",
    payload: { name: petName },
  };

  try {
    const targetWindow = petWidgetFrame?.contentWindow;
    if (targetWindow) {
      targetWindow.postMessage(payload, window.location.origin || "*");
    }
  } catch (error) {
    console.warn("Unable to notify pet widget about pet name", error);
  }
}

function ensureAxolotlInitialized() {
  if (preferences.showAxolotl === false) {
    axolotlController?.disable?.();
    return;
  }

  if (axolotlInitialized) {
    axolotlController?.enable?.();
    return;
  }

  return initAxolotlMascot();
}

function setAxolotlPresenceMode(mode) {
  if (!Object.values(AXOLOTL_PRESENCE_MODES).includes(mode)) {
    return axolotlPresenceMode;
  }
  axolotlPresenceMode = mode;
  if (axolotlLayer) {
    axolotlLayer.dataset.axolotlPresenceMode = mode;
  }
  return axolotlPresenceMode;
}

function setupKeyboard() {
  const container = keyboardContainer || document.getElementById("keyboard");
  if (!container) {
    console.error("Cannot set up on-screen keyboard without #keyboard element");
    return;
  }

  const buttons = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "-",
    ".",
    "/",
  ];

  container.innerHTML = "";

  function playKeySound(keyLabel) {
    if (!keyboardAudioManager) {
      return;
    }
    const upper = String(keyLabel || "").toUpperCase();
    const soundKey = /^[A-Z]$/.test(upper) ? `key-${upper}` : "key-other";
    keyboardAudioManager.play(soundKey, { allowOverlap: true });
  }

  buttons.forEach((key) => {
    const label = typeof key === "string" ? key : key.label;
    const action = typeof key === "string" ? null : key.action;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "key-btn";
    button.textContent = label;
    button.setAttribute("aria-label", `Type ${label}`);
    button.addEventListener("click", () => {
      const search = searchInput || document.getElementById("search");
      if (!search) return;
      if (action === "backspace") {
        search.value = search.value.slice(0, -1);
        search.dispatchEvent(new Event("input", { bubbles: true }));
        search.focus({ preventScroll: true });
        playKeySound(label);
        return;
      }
      search.value += label;
      search.dispatchEvent(new Event("input", { bubbles: true }));
      search.focus({ preventScroll: true });
      playKeySound(label);
    });
    container.appendChild(button);
  });

  // Add a backspace key at the end of the keyboard
  const backspaceBtn = document.createElement("button");
  backspaceBtn.type = "button";
  backspaceBtn.className = "key-btn key-btn--backspace";
  backspaceBtn.textContent = "⌫";
  backspaceBtn.setAttribute("aria-label", "Backspace");

  backspaceBtn.addEventListener("click", () => {
    const search = searchInput || document.getElementById("search");
    if (!search) return;

    // Remove the last character from the search input
    search.value = search.value.slice(0, -1);
    search.dispatchEvent(new Event("input", { bubbles: true }));
    search.focus({ preventScroll: true });

    // Optional: reuse "allothers" sound for backspace
    try {
      playKeySound("backspace");
    } catch (_) {}
  });

  container.appendChild(backspaceBtn);
}

function setupSettingsMenu() {
  if (typeof window === "undefined" || !settingsBtn || !settingsModal) {
    return;
  }

  settingsBtn.setAttribute("aria-expanded", "false");

  const focusableSelector = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
  ].join(", ");

  const getFocusableElements = () =>
    Array.from(settingsModal.querySelectorAll(focusableSelector)).filter((element) => {
      if (element.hasAttribute("hidden")) return false;
      if (element.getAttribute("aria-hidden") === "true") return false;
      if (element.tabIndex < 0) return false;
      const style = window.getComputedStyle(element);
      if (style.visibility === "hidden" || style.display === "none") {
        return false;
      }
      return true;
    });

  const openSettings = () => {
    applyPreferences({ lazyAxolotl: true });
    settingsModal.hidden = false;
    settingsBtn.setAttribute("aria-expanded", "true");
    document.body.classList.add("modal-open");
    window.setTimeout(() => {
      const focusable = getFocusableElements();
      if (focusable.length) {
        focusable[0].focus();
      } else if (settingsDialog) {
        settingsDialog.focus({ preventScroll: true });
      }
    }, 20);
  };

  const closeSettings = () => {
    settingsModal.hidden = true;
    settingsBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("modal-open");
    window.setTimeout(() => {
      settingsBtn.focus();
    }, 20);
  };

  settingsBtn.addEventListener("click", () => {
    if (settingsModal.hidden) {
      openSettings();
    } else {
      closeSettings();
    }
  });

  settingsModal.addEventListener("click", (event) => {
    const target = event.target;
    if (target && target.dataset && target.dataset.settingsDismiss === "true") {
      closeSettings();
    }
  });

  settingsModal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeSettings();
      return;
    }

    if (event.key === "Tab") {
      const focusable = getFocusableElements();
      if (!focusable.length) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey) {
        if (document.activeElement === first || !settingsModal.contains(document.activeElement)) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  if (settingsForm) {
    settingsForm.addEventListener("submit", (event) => {
      event.preventDefault();
    });
  }

  if (toggleHeadingInput) {
    toggleHeadingInput.addEventListener("change", (event) => {
      preferences.showHeading = event.target.checked;
      savePreferences();
      applyPreferences({ syncInputs: false });
    });
  }

  if (toggleAxolotlInput) {
    toggleAxolotlInput.addEventListener("change", (event) => {
      preferences.showAxolotl = event.target.checked;
      savePreferences();
      applyPreferences({ syncInputs: false });
    });
  }

  if (petNameInput) {
    const commitPetNameUpdate = () => {
      const nextName = normalizePetName(petNameInput.value);
      preferences.petName = nextName;
      petNameInput.value = nextName;
      savePreferences();
      updatePetWidgetName(nextName);
    };

    if (petNameSaveBtn) {
      petNameSaveBtn.addEventListener("click", () => {
        commitPetNameUpdate();
      });
    }

    petNameInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        commitPetNameUpdate();
      }
    });
  }

  if (togglePetVacationInput) {
    togglePetVacationInput.addEventListener("change", (event) => {
      preferences.petVacation = event.target.checked;
      savePreferences();
      applyPetVacationMode(preferences.petVacation);
    });
  }

  if (togglePetSoundsInput) {
    togglePetSoundsInput.addEventListener("change", (event) => {
      preferences.petSoundEnabled = !event.target.checked;
      savePreferences();
      applyPetSoundPreference(preferences.petSoundEnabled);
    });
  }

  if (togglePetScrollInput) {
    togglePetScrollInput.addEventListener("change", (event) => {
      preferences.petScrollDisabled = event.target.checked;
      savePreferences();
      applyPetScrollPreference(preferences.petScrollDisabled);
    });
  }

  if (resetPetProgressBtn) {
    resetPetProgressBtn.addEventListener("click", () => {
      if (!confirm("Reset BubblePet level to 0 and clear unlocked discs?")) {
        return;
      }

      try {
        resetPetLevel();
      } catch (error) {
        console.error("[Bubblemarks] Failed to reset pet progress:", error);
      }
    });
  }

  const displaySection = settingsForm?.querySelector(".settings-section");
  if (displaySection && !displaySection.querySelector('[data-preference="scroll-lock"]')) {
    const scrollLockLabel = document.createElement("label");
    scrollLockLabel.className = "settings-toggle";
    scrollLockLabel.dataset.preference = "scroll-lock";

    const scrollLockCheckbox = document.createElement("input");
    scrollLockCheckbox.type = "checkbox";
    scrollLockCheckbox.checked = preferences.scrollLocked === true;
    scrollLockCheckbox.addEventListener("change", () => {
      preferences.scrollLocked = scrollLockCheckbox.checked;
      savePreferences();
      applyScrollLock(preferences.scrollLocked);
    });

    const scrollLockText = document.createElement("span");
    scrollLockText.textContent = "Disable scrolling";

    scrollLockLabel.append(scrollLockCheckbox, scrollLockText);

    const insertBeforeTarget =
      displaySection.querySelector(".settings-slider") ||
      displaySection.querySelector(".settings-layout");
    if (insertBeforeTarget) {
      displaySection.insertBefore(scrollLockLabel, insertBeforeTarget);
    } else {
      displaySection.appendChild(scrollLockLabel);
    }

    scrollLockToggleInput = scrollLockCheckbox;
  }

  if (cardSizeInput) {
    cardSizeInput.addEventListener("input", (event) => {
      const nextSize = indexToCardSize(event.target.value);
      preferences.cardSize = nextSize;
      savePreferences();
      applyPreferences({ syncInputs: false });
    });
  }
}

function setupLayoutControls() {
  if (cardsPerRowInput) {
    cardsPerRowInput.min = String(LAYOUT_MIN_COUNT);
    cardsPerRowInput.max = String(LAYOUT_MAX_COUNT);
    cardsPerRowInput.step = "1";
    cardsPerRowInput.addEventListener("change", handleLayoutSettingChange);
  }

  if (rowsPerPageInput) {
    rowsPerPageInput.min = String(LAYOUT_MIN_COUNT);
    rowsPerPageInput.max = String(LAYOUT_MAX_COUNT);
    rowsPerPageInput.step = "1";
    rowsPerPageInput.addEventListener("change", handleLayoutSettingChange);
  }

  if (prevPageBtn) {
    prevPageBtn.addEventListener("click", () => changePage(-1));
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener("click", () => changePage(1));
  }

  updatePaginationUI(normalizePageIndex(preferences.pageIndex), 0);

  window.addEventListener("resize", handleLayoutResize);
}

function setupAxolotlTravelControls(petWidgetFrame) {
  if (typeof window === "undefined") {
    return;
  }

  let widgetWindow = petWidgetFrame?.contentWindow || null;

  const updateWidgetWindowRef = () => {
    if (petWidgetFrame?.contentWindow) {
      widgetWindow = petWidgetFrame.contentWindow;
    }
  };

  if (petWidgetFrame) {
    petWidgetFrame.addEventListener("load", updateWidgetWindowRef);
    updateWidgetWindowRef();
  }

  const handleTravelMessage = (event) => {
    if (widgetWindow && event.source !== widgetWindow) {
      return;
    }

    const data = event.data;
    if (!data || data.source !== "bubblepet" || data.type !== "roam-state") {
      return;
    }

    if (!widgetWindow) {
      widgetWindow = event.source;
    }

    const isRoaming = Boolean(data.payload?.roaming);
    if (isRoaming) {
      setAxolotlPresenceMode(AXOLOTL_PRESENCE_MODES.ROAMING);
    } else {
      if (axolotlPresenceMode === AXOLOTL_PRESENCE_MODES.ROAMING) {
        setAxolotlPresenceMode(AXOLOTL_PRESENCE_MODES.WINDOW);
      }
    }
  };

  window.addEventListener("message", handleTravelMessage);
}

function handleLayoutSettingChange() {
  const nextCardsPerRow = normalizeLayoutCount(
    cardsPerRowInput ? cardsPerRowInput.value : preferences.cardsPerRow,
    preferences.cardsPerRow
  );
  const nextRowsPerPage = normalizeLayoutCount(
    rowsPerPageInput ? rowsPerPageInput.value : preferences.rowsPerPage,
    preferences.rowsPerPage
  );

  const layoutChanged =
    nextCardsPerRow !== preferences.cardsPerRow || nextRowsPerPage !== preferences.rowsPerPage;

  preferences.cardsPerRow = nextCardsPerRow;
  preferences.rowsPerPage = nextRowsPerPage;

  if (cardsPerRowInput) {
    cardsPerRowInput.value = String(nextCardsPerRow);
  }
  if (rowsPerPageInput) {
    rowsPerPageInput.value = String(nextRowsPerPage);
  }

  let shouldLogPageReset = false;
  if (layoutChanged) {
    const previousPageIndex = normalizePageIndex(preferences.pageIndex);
    preferences.pageIndex = 0;
    shouldLogPageReset = previousPageIndex !== 0;
  }

  savePreferences();

  if (shouldLogPageReset) {
    console.log(`[Bubblemarks] Page changed → ${preferences.pageIndex + 1}`);
  }

  refreshBookmarksView();
}

function handleVirtualKey(key) {
  const cursorPosition = searchInput.selectionStart ?? searchInput.value.length;
  const value = searchInput.value;

  switch (key) {
    case "backspace": {
      const nextValue = value.slice(0, Math.max(cursorPosition - 1, 0)) + value.slice(cursorPosition);
      updateSearchValue(nextValue, Math.max(cursorPosition - 1, 0));
      break;
    }
    case "clear": {
      updateSearchValue("", 0);
      break;
    }
    case "space": {
      const nextValue = value.slice(0, cursorPosition) + " " + value.slice(cursorPosition);
      updateSearchValue(nextValue, cursorPosition + 1);
      break;
    }
    default: {
      const nextValue = value.slice(0, cursorPosition) + key + value.slice(cursorPosition);
      updateSearchValue(nextValue, cursorPosition + key.length);
    }
  }
}

function updateSearchValue(nextValue, caretPosition) {
  searchInput.value = nextValue;
  searchTerm = nextValue;
  requestAnimationFrame(() => {
    searchInput.setSelectionRange(caretPosition, caretPosition);
  });
  applyFilters();
}

  function renderBookmarkCategoryOptions(preferredKey, descriptors) {
    if (!bookmarkCategorySelect) {
      return;
    }

    const options = Array.isArray(descriptors) ? descriptors : computeCategoryDescriptors();

    const optionNodes = options.map((descriptor) => {
      const option = document.createElement("option");
      option.value = descriptor.key;
      option.textContent = descriptor.label;
      return option;
    });

    if (!optionNodes.length) {
      const fallbackOption = document.createElement("option");
      fallbackOption.value = DEFAULT_CATEGORY_SLUG;
      fallbackOption.textContent = DEFAULT_CATEGORY_LABEL;
      replaceChildrenSafe(bookmarkCategorySelect, [fallbackOption]);
      bookmarkCategorySelect.value = DEFAULT_CATEGORY_SLUG;
      return;
    }

    replaceChildrenSafe(bookmarkCategorySelect, optionNodes);

    const existingValues = Array.from(bookmarkCategorySelect.options).map((option) => option.value);
    const normalizedPreferred = normalizeCategoryKey(preferredKey || "");
    let selection = existingValues[0];

  if (normalizedPreferred && existingValues.includes(normalizedPreferred)) {
    selection = normalizedPreferred;
  } else if (activeCategory !== "all" && existingValues.includes(activeCategory)) {
    selection = activeCategory;
  }

  bookmarkCategorySelect.value = selection;
}

function updateCategoryBar() {
  if (!categoryBar) {
    console.error("Cannot render categories without #categories element");
    return;
  }

  const descriptors = computeCategoryDescriptors();
  const availableKeys = new Set(descriptors.map((descriptor) => descriptor.key));

    if (activeCategory !== "all" && !availableKeys.has(activeCategory)) {
      activeCategory = "all";
    }

    const allDescriptor = {
      key: "all",
      label: "All",
      color: pickCategoryColor("all"),
    };

    const pills = [createCategoryPill(allDescriptor), ...descriptors.map((descriptor) => createCategoryPill(descriptor))];
    replaceChildrenSafe(categoryBar, pills);
    syncActiveCategoryVisuals();
    renderBookmarkCategoryOptions(bookmarkCategorySelect?.value || activeCategory, descriptors);
  }

function createCategoryPill(descriptor) {
  const pill = document.createElement("button");
  pill.type = "button";
  pill.className = "filter-pill";
  pill.dataset.category = descriptor.key;
  pill.textContent = descriptor.label;
  applyCategoryStylesToPill(pill, descriptor.color);
  pill.addEventListener("click", () => {
    setActiveCategory(descriptor.key);
  });
  return pill;
}

function setActiveCategory(nextKey) {
  activeCategory = nextKey;
  syncActiveCategoryVisuals();
  applyFilters();
}

function syncActiveCategoryVisuals() {
  const pills = categoryBar.querySelectorAll(".filter-pill");
  pills.forEach((pill) => {
    const key = pill.dataset.category;
    const isActive = key === activeCategory || (activeCategory === "all" && key === "all");
    pill.classList.toggle("active", isActive);
    pill.setAttribute("aria-pressed", String(isActive));
  });
}

  function updateSuggestions() {
    if (!datalist) {
      return;
    }

    const options = bookmarks.map((bookmark) => {
      const option = document.createElement("option");
      option.value = bookmark.name;
      return option;
    });

    replaceChildrenSafe(datalist, options);
  }

  function applyFilters() {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filtered = bookmarks.filter((bookmark) => {
    const categoryKey = normalizeCategoryKey(bookmark.category || DEFAULT_CATEGORY_LABEL) ||
      DEFAULT_CATEGORY_SLUG;
    const matchesCategory = activeCategory === "all" || categoryKey === activeCategory;
    if (!matchesCategory) return false;

    if (!normalizedSearch) return true;

    const categoryLabel = getCategoryLabel(categoryKey, bookmark.category ?? DEFAULT_CATEGORY_LABEL);
    const haystack = `${bookmark.name} ${bookmark.category ?? ""} ${categoryLabel}`.toLowerCase();
    return haystack.includes(normalizedSearch);
  });

  renderBookmarks(filtered);
}

function renderBookmarks(collection) {
  if (!grid) {
    console.error("Cannot render bookmarks without #bookmarks element");
    return;
  }

  if (!template?.content?.firstElementChild) {
    console.error("Missing bookmark card template");
    return;
  }

  // Take a clean copy of the collection
  lastRenderedCollection = Array.isArray(collection) ? [...collection] : [];
  const layout = getCurrentLayout();
  const pageSize = Math.max(layout.cardsPerRow * layout.rowsPerPage, 1);

  if (!lastRenderedCollection.length) {
    replaceChildrenSafe(grid, []);
    showEmptyState(
      "No bookmarks match that vibe yet. Try a different search or category!"
    );
    applyGridLayout(layout.cardsPerRow, layout.rowsPerPage);
    updatePaginationUI(0, 0);
    console.log("[Bubblemarks] Pagination update → no bookmarks to display");
    return;
  }

  hideEmptyState();

  const totalItems = lastRenderedCollection.length;
  const previousIndex = normalizePageIndex(preferences.pageIndex);
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  const pageIndex = clampPageIndex(previousIndex, totalItems, layout);

  if (pageIndex !== previousIndex) {
    preferences.pageIndex = pageIndex;
    savePreferences();
    console.log(`[Bubblemarks] Page changed → ${pageIndex + 1}`);
  }

  const start = pageIndex * pageSize;
  const end = Math.min(start + pageSize, totalItems);
  const visible = lastRenderedCollection.slice(start, end);

  const cards = visible.map((bookmark) => {
    const card = template.content.firstElementChild.cloneNode(true);
    const imageEl = card.querySelector(".card-image");
    const mediaEl = card.querySelector(".card-media");
    const titleEl = card.querySelector(".card-title");
    const categoryEl = card.querySelector(".card-category");

    const bookmarkTitle = bookmark.name?.trim() || "Untitled bookmark";
    const imagePosition = normalizeImagePosition(bookmark.imagePosition);
    const backgroundPosition =
      imagePosition === "center" ? "center center" : `center ${imagePosition}`;

    if (card instanceof HTMLElement) {
      card.title = bookmarkTitle;
      card.dataset.imagePosition = imagePosition;
      card.style.backgroundPosition = backgroundPosition;
    }

    if (imageEl) {
      applyBookmarkImage(imageEl, bookmark);
      imageEl.alt = bookmarkTitle;
      imageEl.style.objectPosition = backgroundPosition;
    }

    if (titleEl) {
      titleEl.textContent = bookmarkTitle;
    }

    if (card instanceof HTMLAnchorElement && bookmark.url) {
      card.href = bookmark.url;
      card.target = "_blank";
      card.rel = "noopener noreferrer";
    } else if (card instanceof HTMLAnchorElement) {
      card.removeAttribute("href");
      card.removeAttribute("target");
      card.removeAttribute("rel");
      card.classList.add("card--disabled");
      card.tabIndex = -1;
      if (mediaEl) {
        mediaEl.classList.add("card-media--no-link");
      }
    }

    const categoryKey =
      normalizeCategoryKey(bookmark.category || DEFAULT_CATEGORY_LABEL) ||
      DEFAULT_CATEGORY_SLUG;
    const displayLabel = getCategoryLabel(
      categoryKey,
      bookmark.category || DEFAULT_CATEGORY_LABEL
    );

    if (categoryEl) {
      categoryEl.textContent = displayLabel;
      applyCategoryStylesToBadge(categoryEl, getCategoryColor(categoryKey));
    }

    return card;
  });

  replaceChildrenSafe(grid, cards);
  applyGridLayout(layout.cardsPerRow, layout.rowsPerPage);
  updatePaginationUI(pageIndex, totalPages);
  console.log(
    `[Bubblemarks] Pagination update → page ${pageIndex + 1} of ${totalPages} (showing ${visible.length} of ${totalItems})`
  );
}

function getCurrentLayout() {
  const cardsPerRow = normalizeLayoutCount(preferences.cardsPerRow, DEFAULT_CARDS_PER_ROW);
  const rowsPerPage = normalizeLayoutCount(preferences.rowsPerPage, DEFAULT_ROWS_PER_PAGE);
  preferences.cardsPerRow = cardsPerRow;
  preferences.rowsPerPage = rowsPerPage;
  return { cardsPerRow, rowsPerPage };
}

function clampPageIndex(index, totalItems, layout) {
  const normalizedIndex = normalizePageIndex(index);
  const pageSize = Math.max(layout.cardsPerRow * layout.rowsPerPage, 1);
  if (totalItems <= 0 || pageSize <= 0) {
    return 0;
  }
  const totalPages = Math.ceil(totalItems / pageSize);
  return clamp(normalizedIndex, 0, Math.max(totalPages - 1, 0));
}

function updatePaginationUI(pageIndex, totalPages) {
  const hasMultiplePages = totalPages > 1;
  if (paginationControls) {
    paginationControls.hidden = !hasMultiplePages;
  }
  if (prevPageBtn) {
    const showPrev = totalPages > 0 && pageIndex > 0;
    prevPageBtn.hidden = !showPrev;
    prevPageBtn.disabled = !showPrev;
  }
  if (nextPageBtn) {
    const showNext = totalPages > 0 && pageIndex < totalPages - 1;
    nextPageBtn.hidden = !showNext;
    nextPageBtn.disabled = !showNext;
  }
}

function refreshBookmarksView() {
  renderBookmarks(lastRenderedCollection);
}

function handleLayoutResize() {
  if (pendingResizeFrame) {
    window.cancelAnimationFrame(pendingResizeFrame);
  }
  pendingResizeFrame = window.requestAnimationFrame(() => {
    pendingResizeFrame = null;
    refreshBookmarksView();
  });
}

function changePage(delta) {
  if (!Number.isFinite(delta) || delta === 0) {
    return;
  }
  const layout = getCurrentLayout();
  const totalItems = lastRenderedCollection.length;
  const pageSize = Math.max(layout.cardsPerRow * layout.rowsPerPage, 1);
  if (totalItems <= 0 || pageSize <= 0) {
    return;
  }
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) {
    updatePaginationUI(0, totalPages);
    return;
  }
  const currentIndex = clamp(normalizePageIndex(preferences.pageIndex), 0, totalPages - 1);
  const nextIndex = clamp(currentIndex + delta, 0, totalPages - 1);
  if (nextIndex === currentIndex) {
    updatePaginationUI(nextIndex, totalPages);
    return;
  }
  preferences.pageIndex = nextIndex;
  savePreferences();
  console.log(`[Bubblemarks] Page changed → ${nextIndex + 1}`);
  renderBookmarks(lastRenderedCollection);
}

function applyGridLayout(cardsPerRow, rowsPerPage) {
  if (!grid) {
    return;
  }
  const normalizedCards = normalizeLayoutCount(cardsPerRow, DEFAULT_CARDS_PER_ROW);
  const normalizedRows = normalizeLayoutCount(rowsPerPage, DEFAULT_ROWS_PER_PAGE);
  grid.style.gridTemplateColumns = `repeat(${normalizedCards}, 1fr)`;
  if (
    lastLoggedLayout.cardsPerRow !== normalizedCards ||
    lastLoggedLayout.rowsPerPage !== normalizedRows
  ) {
    console.log(`[Bubblemarks] Layout set → ${normalizedCards} columns × ${normalizedRows} rows`);
    lastLoggedLayout = { cardsPerRow: normalizedCards, rowsPerPage: normalizedRows };
  }
}

function applyScrollLock(isLocked) {
  const app = document.querySelector(".app-shell") || document.body;

  if (!app) {
    return;
  }

  const wasLocked = app.classList.contains("scroll-locked");

  if (isLocked) {
    app.classList.add("scroll-locked");
    if (document.body && app !== document.body) {
      document.body.classList.add("scroll-locked");
    }
    if (!wasLocked) {
      const centerTarget = Math.max((document.body.scrollHeight - window.innerHeight) / 2, 0);
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: centerTarget, behavior: "smooth" });
      });
    }
  } else {
    app.classList.remove("scroll-locked");
    if (document.body) {
      document.body.classList.remove("scroll-locked");
    }
  }
}

function applyBookmarkImage(imageEl, bookmark) {
  imageEl.classList.remove("is-fallback");
  imageEl.referrerPolicy = "no-referrer";
  imageEl.decoding = "async";
  const primarySource = bookmark.image || buildFaviconUrl(bookmark.url);

  const handleError = () => {
    imageEl.src = createFallbackImage(bookmark);
    imageEl.classList.add("is-fallback");
    imageEl.style.objectPosition = "center center";
  };

  imageEl.addEventListener("error", handleError, { once: true });
  imageEl.src = primarySource;
}

function createFallbackImage(bookmark) {
  const title = bookmark.name?.trim() || "?";
  const initials = title
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const displayInitials = initials || "☆";
  const palette = pickFallbackPalette(title + (bookmark.category ?? ""));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" role="img" aria-label="Bookmark placeholder">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.background}" />
          <stop offset="100%" stop-color="${palette.shadow}" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="${palette.shadow}" flood-opacity="0.65" />
        </filter>
      </defs>
      <rect width="160" height="160" rx="36" fill="url(#grad)" />
      <g filter="url(#shadow)">
        <circle cx="50" cy="42" r="10" fill="rgba(255, 255, 255, 0.7)" />
        <circle cx="108" cy="34" r="14" fill="rgba(255, 255, 255, 0.4)" />
        <circle cx="124" cy="110" r="12" fill="rgba(255, 255, 255, 0.4)" />
      </g>
      <text x="50%" y="55%" text-anchor="middle" font-size="64" font-family="'Bigbesty', 'Papernotes', 'Comic Sans MS', 'Segoe UI', sans-serif" fill="${palette.accent}" dominant-baseline="middle">${displayInitials}</text>
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function pickFallbackPalette(seed) {
  const index = Math.abs(hashString(seed)) % FALLBACK_PALETTES.length;
  return FALLBACK_PALETTES[index];
}

function hashString(value) {
  let hash = 0;
  const stringValue = String(value);
  for (let i = 0; i < stringValue.length; i += 1) {
    hash = (hash << 5) - hash + stringValue.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function buildFaviconUrl(url) {
  try {
    const domain = new URL(url).origin;
    return `https://www.google.com/s2/favicons?sz=256&domain=${encodeURIComponent(domain)}`;
  } catch (error) {
    return "https://www.google.com/s2/favicons?sz=256&domain=https://example.com";
  }
}

function setLoading(isLoading) {
  if (grid) {
    grid.setAttribute("aria-busy", String(isLoading));
  }
}

function showEmptyState(message) {
  if (!emptyState) return;
  emptyState.textContent = message;
  emptyState.hidden = false;
}

function hideEmptyState() {
  if (!emptyState) return;
  emptyState.hidden = true;
}

async function initAxolotlMascot() {
  if (axolotlInitialized) {
    axolotlController?.enable?.();
    return;
  }

  if (axolotlInitPromise) {
    return axolotlInitPromise;
  }

  if (!axolotlPath || !axolotlSprite || !axolotlFigure) {
    axolotlInitialized = true;
    axolotlController = { enable: () => {}, disable: () => {} };
    return;
  }

  axolotlInitPromise = (async () => {
    try {
      const discovery = await discoverAxolotlFrames();
      let stopFrameAnimation = null;
      let stateAnimator = null;
      let stopSwimming = null;
      let isSwimming = false;
      let swimTransitionPromise = null;
      let clearStateTimersRef = () => {};

      const stopFrameAnimationIfNeeded = () => {
        if (typeof stopFrameAnimation === "function") {
          stopFrameAnimation();
          stopFrameAnimation = null;
        }
      };

      const destroyStateAnimatorIfNeeded = () => {
        if (stateAnimator) {
          stateAnimator.destroy();
          stateAnimator = null;
        }
      };

      const settleMascot = () => {
        const width = window.innerWidth || document.documentElement.clientWidth || 0;
        const height = window.innerHeight || document.documentElement.clientHeight || 0;
        const targetX = clamp(width * 0.72, 80, Math.max(width - 110, 80));
        const targetY = clamp(height * 0.68, 90, Math.max(height - 150, 90));
        axolotlPath.style.transitionDuration = "0ms";
        axolotlPath.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
        axolotlSprite.style.setProperty("--axolotl-flip", "0deg");
        axolotlSprite.style.setProperty("--axolotl-tilt", "0deg");
      };

      const stopSwim = () => {
        if (typeof stopSwimming === "function") {
          stopSwimming();
          stopSwimming = null;
        }
        isSwimming = false;
        swimTransitionPromise = null;
        clearStateTimersRef();
      };

      if (discovery.mode === "states") {
        const preloadTargets = new Set();
        for (const frames of Object.values(discovery.states || {})) {
          if (Array.isArray(frames)) {
            frames.forEach((frame) => preloadTargets.add(frame));
          }
        }
        await preloadImages([...preloadTargets]);

        axolotlFigure.classList.remove("axolotl--fallback");
        axolotlFrameDisplay.clearFallback();
        stateAnimator = createAxolotlStateAnimator(
          axolotlFigure,
          discovery.states,
          undefined,
          axolotlFrameDisplay
        );

        if (!stateAnimator.hasAny()) {
          destroyStateAnimatorIfNeeded();
          axolotlFigure.classList.add("axolotl--fallback");
          axolotlFrameDisplay.useFallback(DEFAULT_AXOLOTL_IMAGE);
          axolotlController = { enable: () => {}, disable: () => {} };
          return;
        }

        const findAvailableState = (candidates) =>
          candidates.find((name) => stateAnimator.hasState(name)) || null;

        const restState = findAvailableState(["resting", "floating", "swimming"]);
        const floatState = findAvailableState(["floating", "resting", "swimming"]);
        const swimState = findAvailableState(["swimming", "floating", "resting"]);
        const prepState = stateAnimator.hasState("swimmode") ? "swimmode" : null;
        const wakeState = stateAnimator.hasState("getup") ? "getup" : null;

        const stateTimers = new Set();
        const clearStateTimers = () => {
          stateTimers.forEach((id) => window.clearTimeout(id));
          stateTimers.clear();
        };
        const scheduleStateTimer = (fn, delay) => {
          const id = window.setTimeout(() => {
            stateTimers.delete(id);
            fn();
          }, delay);
          stateTimers.add(id);
          return id;
        };

        clearStateTimersRef = clearStateTimers;

        isSwimming = false;
        swimTransitionPromise = null;

        const showStill = () => {
          isSwimming = false;
          clearStateTimers();
          if (restState && stateAnimator.showState(restState)) {
            return;
          }
          if (floatState && stateAnimator.showState(floatState)) {
            return;
          }
          if (swimState) {
            stateAnimator.showState(swimState);
          }
        };

        const playFloatingLoop = () => {
          clearStateTimers();
          if (isSwimming) {
            return;
          }
          if (
            floatState &&
            stateAnimator.playLoop(floatState, floatState === "floating" ? 240 : 260)
          ) {
            return;
          }
          if (restState) {
            stateAnimator.playLoop(restState, 320);
          } else if (swimState) {
            stateAnimator.playLoop(swimState, 180);
          }
        };

        const scheduleRestingCycle = () => {
          if (!restState || restState === floatState || isSwimming) {
            return;
          }
          scheduleStateTimer(() => {
            if (!restState || isSwimming) return;
            stateAnimator.playLoop(restState, 320);
            if (wakeState) {
              scheduleStateTimer(() => {
                if (isSwimming) return;
                stateAnimator.playOnce(wakeState, {
                  interval: 200,
                  holdLast: true,
                  onComplete: () => {
                    if (isSwimming) return;
                    playFloatingLoop();
                  },
                });
              }, 3200);
            } else if (floatState) {
              scheduleStateTimer(() => {
                if (isSwimming) return;
                playFloatingLoop();
              }, 3600);
            }
          }, 9000);
        };

        const playIdleCycle = () => {
          if (isSwimming) {
            return;
          }
          clearStateTimers();
          if (restState && restState !== floatState) {
            stateAnimator.playLoop(restState, 320);
            if (wakeState) {
              scheduleStateTimer(() => {
                if (isSwimming) return;
                stateAnimator.playOnce(wakeState, {
                  interval: 200,
                  holdLast: true,
                  onComplete: () => {
                    if (isSwimming) return;
                    playFloatingLoop();
                    scheduleRestingCycle();
                  },
                });
              }, 3600);
            } else {
              scheduleStateTimer(() => {
                if (isSwimming) return;
                playFloatingLoop();
                scheduleRestingCycle();
              }, 4000);
            }
          } else {
            playFloatingLoop();
            scheduleRestingCycle();
          }
        };

        const playOnceAndWait = (stateName, options = {}) => {
          if (!stateName || !stateAnimator.hasState(stateName)) {
            return Promise.resolve(false);
          }
          return stateAnimator.playOnceAsync(stateName, options);
        };

        const transitionToSwim = () => {
          if (isSwimming) {
            return Promise.resolve();
          }
          if (swimTransitionPromise) {
            return swimTransitionPromise;
          }

          clearStateTimers();
          isSwimming = true;

          swimTransitionPromise = (async () => {
            let currentState = stateAnimator.getCurrentState();

            if (currentState === restState && wakeState) {
              await playOnceAndWait(wakeState, { interval: 210, holdLast: true });
              currentState = stateAnimator.getCurrentState();
            }

            if (floatState) {
              if (currentState !== floatState) {
                await playOnceAndWait(floatState, { interval: 230, holdLast: true });
                currentState = floatState;
              }
            }

            if (prepState) {
              await playOnceAndWait(prepState, { interval: 200, holdLast: false });
            }

            if (swimState) {
              stateAnimator.playLoop(swimState, 210);
            } else if (floatState) {
              stateAnimator.playLoop(floatState, floatState === "floating" ? 240 : 260);
            } else if (restState) {
              stateAnimator.playLoop(restState, 320);
            }
          })()
            .catch((error) => {
              isSwimming = false;
              throw error;
            })
            .finally(() => {
              swimTransitionPromise = null;
            });

          return swimTransitionPromise;
        };

        const settleAfterSwim = () => {
          isSwimming = false;
          playFloatingLoop();
          scheduleRestingCycle();
        };

        const startSwim = () => {
          stopSwim();
          stopSwimming = startAxolotlSwim(axolotlPath, axolotlSprite, {
            onSwimStart: transitionToSwim,
            onSwimStop: settleAfterSwim,
          });
        };

        const handleMotionPreference = () => {
          if (prefersReducedMotion.matches) {
            stopSwim();
            settleMascot();
            showStill();
          } else {
            if (!stopSwimming) {
              startSwim();
            }
            playIdleCycle();
          }
        };

        handleMotionPreference();

        addMotionPreferenceListener(() => {
          handleMotionPreference();
        });

        window.addEventListener("resize", () => {
          if (prefersReducedMotion.matches) {
            settleMascot();
            showStill();
          }
        });

        document.addEventListener("visibilitychange", () => {
          if (document.hidden) {
            stopSwim();
            showStill();
          } else if (!prefersReducedMotion.matches) {
            if (!stopSwimming) {
              startSwim();
            }
            playIdleCycle();
          }
        });

        axolotlController = {
          enable: () => {
            if (prefersReducedMotion.matches) {
              settleMascot();
              showStill();
            } else {
              startSwim();
              playIdleCycle();
            }
          },
          disable: () => {
            stopSwim();
            clearStateTimers();
            showStill();
            settleMascot();
          },
        };

        return;
      }

      destroyStateAnimatorIfNeeded();

      const frames = discovery.frames || [];

      await preloadImages(frames);

      const startFrameAnimation = () => {
        stopFrameAnimationIfNeeded();
        if (frames.length > 1) {
          stopFrameAnimation = createAxolotlFrameAnimator(
            axolotlFigure,
            frames,
            180,
            axolotlFrameDisplay
          );
        }
      };

      const syncFramesWithMotionPreference = () => {
        if (frames.length <= 1) return;
        if (prefersReducedMotion.matches) {
          stopFrameAnimationIfNeeded();
        } else if (!stopFrameAnimation) {
          startFrameAnimation();
        }
      };

      if (frames.length === 0) {
        axolotlFigure.classList.add("axolotl--fallback");
        axolotlFrameDisplay.useFallback(DEFAULT_AXOLOTL_IMAGE);
      } else if (frames.length === 1) {
        axolotlFigure.classList.remove("axolotl--fallback");
        axolotlFrameDisplay.clearFallback();
        axolotlFrameDisplay.showFrame(frames[0], { immediate: true }).catch(() => {});
      } else {
        axolotlFigure.classList.remove("axolotl--fallback");
        axolotlFrameDisplay.clearFallback();
        startFrameAnimation();
      }

      const startSwim = () => {
        stopSwim();
        stopSwimming = startAxolotlSwim(axolotlPath, axolotlSprite, {
          onSwimStop: () => {
            if (prefersReducedMotion.matches) {
              settleMascot();
            }
          },
        });
      };

      const handleMotionPreference = () => {
        if (prefersReducedMotion.matches) {
          stopSwim();
          settleMascot();
        } else if (!stopSwimming) {
          startSwim();
        }
        syncFramesWithMotionPreference();
      };

      handleMotionPreference();

      addMotionPreferenceListener(() => {
        handleMotionPreference();
      });

      window.addEventListener("resize", () => {
        if (prefersReducedMotion.matches) {
          settleMascot();
        }
      });

      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          stopSwim();
        } else if (!prefersReducedMotion.matches && !stopSwimming) {
          startSwim();
        }
      });

      axolotlController = {
        enable: () => {
          if (prefersReducedMotion.matches) {
            stopFrameAnimationIfNeeded();
            settleMascot();
          } else {
            startFrameAnimation();
            startSwim();
          }
        },
        disable: () => {
          stopSwim();
          stopFrameAnimationIfNeeded();
          settleMascot();
        },
      };
    } catch (error) {
      console.warn("Axolotl mascot could not be initialized", error);
      axolotlFigure.classList.add("axolotl--fallback");
      axolotlFrameDisplay.useFallback(DEFAULT_AXOLOTL_IMAGE);
      axolotlController = { enable: () => {}, disable: () => {} };
    } finally {
      axolotlInitialized = true;
      axolotlInitPromise = null;
    }
  })();

  return axolotlInitPromise;
}

function startAxolotlSwim(pathEl, spriteEl, callbacks = {}) {
  const { onSwimStart, onSwimStop } = callbacks || {};
  let swimTimer = null;
  let currentX = 0;
  let currentY = 0;
  let awaitingTransition = false;
  const restWindow = { min: 1600, max: 3200 };

  const clearSwimTimer = () => {
    if (swimTimer !== null) {
      clearTimeout(swimTimer);
      swimTimer = null;
    }
  };

  const queueNextSwim = (delay) => {
    const range = restWindow.max - restWindow.min;
    const baseDelay =
      typeof delay === "number"
        ? delay
        : restWindow.min + Math.random() * (range > 0 ? range : 0);
    clearSwimTimer();
    swimTimer = window.setTimeout(swim, Math.max(0, baseDelay));
  };

  const handleTransitionEnd = (event) => {
    if (event?.target !== pathEl || event.propertyName !== "transform") {
      return;
    }
    if (awaitingTransition) {
      awaitingTransition = false;
      spriteEl.style.setProperty("--axolotl-tilt", "0deg");
      const stopResult = typeof onSwimStop === "function" ? onSwimStop() : null;
      Promise.resolve(stopResult)
        .catch(() => {})
        .finally(() => {
          queueNextSwim();
        });
    }
  };

  pathEl.addEventListener("transitionend", handleTransitionEnd);

  const applyTransform = (x, y, duration) => {
    pathEl.style.setProperty("--axolotl-duration", `${duration}ms`);
    pathEl.style.transitionDuration = `${duration}ms`;
    pathEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    if (awaitingTransition && duration <= 0) {
      awaitingTransition = false;
      if (typeof onSwimStop === "function") {
        onSwimStop();
      }
    }
  };

  const choosePoint = () => {
    const width = window.innerWidth || document.documentElement.clientWidth || 0;
    const height = window.innerHeight || document.documentElement.clientHeight || 0;
    const marginX = Math.max(width * 0.18, 140);
    const marginY = Math.max(height * 0.22, 160);
    const safeWidth = Math.max(width - marginX, 0);
    const safeHeight = Math.max(height - marginY, 0);
    const x = safeWidth > 0 ? marginX / 2 + Math.random() * safeWidth : width / 2;
    const y = safeHeight > 0 ? marginY / 2 + Math.random() * safeHeight : height / 2;
    const duration = 9000 + Math.random() * 7000;
    return { x, y, duration };
  };

  const swim = () => {
    clearSwimTimer();
    const { x, y, duration } = choosePoint();
    spriteEl.style.setProperty("--axolotl-flip", "0deg");
    const tiltRange = 8;
    const direction = x < currentX ? -1 : 1;
    const tilt = (Math.random() * tiltRange + 4) * direction;
    spriteEl.style.setProperty("--axolotl-tilt", `${tilt}deg`);

    const hasDuration = duration > 0;

    const startMovement = () => {
      awaitingTransition = hasDuration;
      applyTransform(x, y, duration);
      currentX = x;
      currentY = y;
      if (!hasDuration) {
        queueNextSwim();
      }
    };

    const response =
      hasDuration && typeof onSwimStart === "function"
        ? onSwimStart()
        : null;

    if (response && typeof response.then === "function") {
      response.then(startMovement).catch(startMovement);
    } else {
      startMovement();
    }
  };

  const handleResize = () => {
    if (swimTimer === null && !awaitingTransition) return;
    const width = window.innerWidth || document.documentElement.clientWidth || 0;
    const height = window.innerHeight || document.documentElement.clientHeight || 0;
    const marginX = Math.max(width * 0.18, 140);
    const marginY = Math.max(height * 0.22, 160);
    const clampedX = clamp(currentX, marginX / 2, Math.max(width - marginX / 2, marginX / 2));
    const clampedY = clamp(currentY, marginY / 2, Math.max(height - marginY / 2, marginY / 2));
    applyTransform(clampedX, clampedY, 0);
    currentX = clampedX;
    currentY = clampedY;
  };

  window.addEventListener("resize", handleResize);

  const first = choosePoint();
  currentX = first.x;
  currentY = first.y;
  spriteEl.style.setProperty("--axolotl-flip", "0deg");
  spriteEl.style.setProperty("--axolotl-tilt", "0deg");
  applyTransform(first.x, first.y, 0);
  queueNextSwim(1200 + Math.random() * 1800);

  return () => {
    clearSwimTimer();
    window.removeEventListener("resize", handleResize);
    pathEl.removeEventListener("transitionend", handleTransitionEnd);
    if (awaitingTransition) {
      awaitingTransition = false;
      spriteEl.style.setProperty("--axolotl-tilt", "0deg");
      const stopResult = typeof onSwimStop === "function" ? onSwimStop() : null;
      Promise.resolve(stopResult).catch(() => {});
    }
  };
}

async function discoverAxolotlFrames() {
  const manifest = await loadAxolotlManifest();
  if (manifest) {
    return manifest;
  }

  const tested = new Map();

  const stateFrames = await discoverAxolotlStateFrames(tested);
  if (stateFrames) {
    return { mode: "states", states: stateFrames };
  }

  const single = await discoverAxolotlSingleFrame(tested);
  if (single.length) {
    return { mode: "frames", frames: single };
  }

  const sequential = await discoverAxolotlSequentialFrames(tested);
  if (sequential.length) {
    return { mode: "frames", frames: sequential };
  }

  return { mode: "frames", frames: [] };
}

async function loadAxolotlManifest() {
  try {
    const response = await fetch(AXOLOTL_MANIFEST_URL, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    const payload = await response.json();
    return normalizeAxolotlManifest(payload);
  } catch (error) {
    return null;
  }
}

function normalizeAxolotlManifest(payload) {
  if (!payload) {
    return null;
  }

  if (Array.isArray(payload)) {
    const frames = payload
      .map((entry) => normalizeAxolotlFramePath(entry))
      .filter(Boolean);
    return frames.length ? { mode: "frames", frames } : null;
  }

  if (Array.isArray(payload?.frames)) {
    const frames = payload.frames
      .map((entry) => normalizeAxolotlFramePath(entry))
      .filter(Boolean);
    return frames.length ? { mode: "frames", frames } : null;
  }

  const stateSource = extractStateMap(payload);
  if (stateSource) {
    const states = {};
    let total = 0;
    for (const name of AXOLOTL_STATE_NAMES) {
      if (!Array.isArray(stateSource[name])) {
        continue;
      }
      const frames = stateSource[name]
        .map((entry) => normalizeAxolotlFramePath(entry))
        .filter(Boolean);
      if (frames.length) {
        states[name] = frames;
        total += frames.length;
      }
    }
    if (total) {
      return { mode: "states", states };
    }
  }

  if (Array.isArray(payload?.sequence)) {
    const frames = payload.sequence
      .map((entry) => normalizeAxolotlFramePath(entry))
      .filter(Boolean);
    return frames.length ? { mode: "frames", frames } : null;
  }

  return null;
}

function extractStateMap(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if (payload.states && typeof payload.states === "object") {
    return payload.states;
  }

  let found = false;
  const direct = {};
  for (const name of AXOLOTL_STATE_NAMES) {
    if (Array.isArray(payload[name])) {
      direct[name] = payload[name];
      found = true;
    }
  }

  return found ? direct : null;
}

async function discoverAxolotlSingleFrame(tested) {
  for (const single of AXOLOTL_SINGLE_ASSETS) {
    if (await checkAxolotlCandidate(single, tested)) {
      return [single];
    }
  }
  return [];
}

async function discoverAxolotlSequentialFrames(tested) {
  for (const extension of AXOLOTL_FRAME_EXTENSIONS) {
    for (const pattern of AXOLOTL_FRAME_PATTERNS) {
      const frames = [];
      for (let index = 1; index <= AXOLOTL_FRAME_LIMIT; index += 1) {
        const candidate = pattern(index, extension);
        if (await checkAxolotlCandidate(candidate, tested)) {
          frames.push(candidate);
        } else if (index === 1) {
          frames.length = 0;
          break;
        } else {
          break;
        }
      }
      if (frames.length) {
        return frames;
      }
    }
  }

  return [];
}

async function discoverAxolotlStateFrames(tested) {
  const discovered = {};
  let total = 0;

  for (const state of AXOLOTL_STATE_NAMES) {
    let frames = [];

    for (const extension of AXOLOTL_FRAME_EXTENSIONS) {
      for (const pattern of AXOLOTL_STATE_FRAME_PATTERNS) {
        const candidates = [];
        for (let index = 1; index <= AXOLOTL_FRAME_LIMIT; index += 1) {
          const candidate = pattern(state, index, extension);
          if (await checkAxolotlCandidate(candidate, tested)) {
            candidates.push(candidate);
          } else if (index === 1) {
            candidates.length = 0;
            break;
          } else {
            break;
          }
        }

        if (candidates.length) {
          frames = candidates;
          break;
        }
      }
      if (frames.length) {
        break;
      }
    }

    if (frames.length) {
      discovered[state] = frames;
      total += frames.length;
    }
  }

  return total ? discovered : null;
}

async function checkAxolotlCandidate(candidate, tested) {
  if (tested.has(candidate)) {
    return tested.get(candidate);
  }
  const exists = await imageExists(candidate);
  tested.set(candidate, exists);
  return exists;
}

function normalizeAxolotlFramePath(entry) {
  if (typeof entry !== "string" || !entry.trim()) {
    return null;
  }
  const trimmed = entry.trim();
  if (/^https?:/i.test(trimmed)) {
    return trimmed;
  }
  const sanitized = trimmed.replace(/^\/+/, "");
  if (/^assets\//i.test(sanitized)) {
    return sanitized;
  }
  return `bubblemarks://assets/axolotl/${sanitized}`;
}

function imageExists(source) {
  return probeImage(source).then(Boolean);
}

function probeImage(source) {
  if (!source) {
    return Promise.resolve(false);
  }
  if (imageProbeCache.has(source)) {
    return imageProbeCache.get(source);
  }
  const promise = new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = source;
  });
  imageProbeCache.set(source, promise);
  return promise;
}

function preloadImages(sources = []) {
  if (!Array.isArray(sources) || !sources.length) {
    return Promise.resolve();
  }
  const tasks = sources.map((source) => probeImage(source));
  return Promise.all(tasks).then(() => {});
}

function createAxolotlFrameDisplay(container) {
  if (!container) {
    return {
      showFrame: () => Promise.resolve(),
      useFallback: () => {},
      clearFallback: () => {},
    };
  }

  const front = container.querySelector(".axolotl-frame--front");
  const back = container.querySelector(".axolotl-frame--back");

  if (!front || !back) {
    return {
      showFrame: (url) => {
        container.style.backgroundImage = url ? `url('${url}')` : "";
        return Promise.resolve();
      },
      useFallback: (url) => {
        container.style.backgroundImage = url ? `url('${url}')` : "";
      },
      clearFallback: () => {
        container.style.backgroundImage = "";
      },
    };
  }

  let visibleEl = front;
  let hiddenEl = back;
  let queue = Promise.resolve();

  visibleEl.classList.add("is-visible");
  hiddenEl.classList.remove("is-visible");

  const loadInto = (el, url) =>
    new Promise((resolve) => {
      if (!url) {
        el.style.backgroundImage = "";
        delete el.dataset.src;
        resolve();
        return;
      }

      if (el.dataset.src === url) {
        resolve();
        return;
      }

      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        el.dataset.src = url;
        el.style.backgroundImage = `url('${url}')`;
        resolve();
      };
      img.onerror = () => resolve();
      img.src = url;
    });

  const enqueue = (task) => {
    queue = queue.then(() => task()).catch(() => {});
    return queue;
  };

  const performSwap = async (url) => {
    await loadInto(hiddenEl, url);
    const previousVisible = visibleEl;
    previousVisible.classList.remove("is-visible");
    hiddenEl.classList.add("is-visible");
    visibleEl = hiddenEl;
    hiddenEl = previousVisible;
    container.style.backgroundImage = "";
  };

  const showFrame = (url, { immediate = false } = {}) => {
    if (immediate) {
      const immediateTask = performSwap(url);
      queue = immediateTask.then(() => {}).catch(() => {});
      return immediateTask;
    }
    return enqueue(() => performSwap(url));
  };

  const useFallback = (url) => {
    queue = Promise.resolve();
    front.classList.remove("is-visible");
    back.classList.remove("is-visible");
    delete front.dataset.src;
    delete back.dataset.src;
    visibleEl = front;
    hiddenEl = back;
    container.style.backgroundImage = url ? `url('${url}')` : "";
  };

  const clearFallback = () => {
    container.style.backgroundImage = "";
    if (!front.classList.contains("is-visible") && !back.classList.contains("is-visible")) {
      visibleEl = front;
      hiddenEl = back;
      visibleEl.classList.add("is-visible");
      hiddenEl.classList.remove("is-visible");
    }
  };

  return { showFrame, useFallback, clearFallback };
}

function createAxolotlFrameAnimator(target, frames, interval = 160, display = null) {
  if ((!target && !display) || !frames.length) {
    return () => {};
  }

  const frameDisplay = display || createAxolotlFrameDisplay(target);
  let frameIndex = 0;
  let timerId = null;

  const showCurrentFrame = (immediate = false) => {
    const frame = frames[frameIndex];
    if (!frame) {
      return;
    }
    if (frameDisplay && typeof frameDisplay.showFrame === "function") {
      frameDisplay.showFrame(frame, { immediate }).catch(() => {});
    } else if (target) {
      target.style.backgroundImage = `url('${frame}')`;
    }
  };

  const step = () => {
    frameIndex = (frameIndex + 1) % frames.length;
    showCurrentFrame();
    timerId = window.setTimeout(step, interval);
  };

  showCurrentFrame(true);

  if (frames.length > 1) {
    timerId = window.setTimeout(step, interval);
  }

  const handleVisibility = () => {
    if (document.hidden) {
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
    } else if (!timerId && frames.length > 1) {
      timerId = window.setTimeout(step, interval);
    }
  };

  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}

function createAxolotlStateAnimator(target, states, defaultInterval = 200, display = null) {
  const normalized = {};
  for (const [name, frames] of Object.entries(states || {})) {
    if (Array.isArray(frames) && frames.length) {
      normalized[name] = [...frames];
    }
  }

  let timerId = null;
  let current = null;
  let visibilityPaused = false;
  const frameDisplay = display || createAxolotlFrameDisplay(target);

  const clearTimer = () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  const applyFrame = (frames, index, immediate = false) => {
    if (!frames.length) {
      return;
    }
    const frame = frames[Math.max(0, Math.min(index, frames.length - 1))];
    if (frameDisplay && typeof frameDisplay.showFrame === "function") {
      frameDisplay.showFrame(frame, { immediate }).catch(() => {});
    } else if (target) {
      target.style.backgroundImage = `url('${frame}')`;
    }
  };

  const scheduleNext = () => {
    if (!current || document.hidden) {
      visibilityPaused = !!current;
      return;
    }
    clearTimer();
    timerId = window.setTimeout(step, current.interval);
  };

  const finalize = () => {
    const complete = current?.onComplete;
    current = null;
    clearTimer();
    if (typeof complete === "function") {
      complete();
    }
  };

  const step = () => {
    if (!current) {
      return;
    }
    const frames = current.frames;
    if (!frames.length) {
      finalize();
      return;
    }

    current.index += 1;

    if (current.index >= frames.length) {
      if (current.loop) {
        current.index = 0;
      } else {
        if (current.holdLast) {
          current.index = frames.length - 1;
          applyFrame(frames, current.index, true);
        }
        finalize();
        return;
      }
    }

    applyFrame(frames, current.index);
    scheduleNext();
  };

  const playState = (stateName, options = {}) => {
    const frames = normalized[stateName];
    if (!frames || !frames.length) {
      return false;
    }

    const {
      loop = false,
      interval = defaultInterval,
      holdLast = false,
      onComplete,
      restart = false,
    } = options;

    const resolvedInterval = Number.isFinite(interval) ? interval : defaultInterval;
    const currentInterval = Number.isFinite(current?.interval)
      ? current.interval
      : defaultInterval;

    if (
      !restart &&
      current &&
      current.stateName === stateName &&
      current.loop &&
      loop &&
      Math.abs(currentInterval - resolvedInterval) < 1
    ) {
      return true;
    }

    clearTimer();
    current = {
      stateName,
      frames,
      loop,
      holdLast,
      onComplete,
      interval: resolvedInterval,
      index: 0,
    };

    applyFrame(frames, 0, true);

    if (frames.length > 1) {
      scheduleNext();
    } else if (!loop) {
      const complete = current.onComplete;
      current = null;
      if (typeof complete === "function") {
        window.setTimeout(complete, resolvedInterval);
      }
    }

    return true;
  };

  const showState = (stateName) => {
    const frames = normalized[stateName];
    if (!frames || !frames.length) {
      return false;
    }
    clearTimer();
    current = null;
    applyFrame(frames, 0, true);
    return true;
  };

  const stop = () => {
    current = null;
    clearTimer();
  };

  const handleVisibility = () => {
    if (document.hidden) {
      if (timerId) {
        clearTimer();
        visibilityPaused = true;
      }
    } else if (visibilityPaused) {
      visibilityPaused = false;
      if (current && (current.loop || current.index < current.frames.length - 1)) {
        scheduleNext();
      }
    }
  };

  document.addEventListener("visibilitychange", handleVisibility);

  return {
    playLoop: (stateName, interval = defaultInterval) =>
      playState(stateName, { loop: true, interval }),
    playOnce: (stateName, options = {}) =>
      playState(stateName, { loop: false, ...options }),
    playOnceAsync: (stateName, options = {}) =>
      new Promise((resolve) => {
        const success = playState(stateName, {
          loop: false,
          ...options,
          onComplete: () => {
            if (typeof options.onComplete === "function") {
              options.onComplete();
            }
            resolve(true);
          },
        });

        if (!success) {
          resolve(false);
        }
      }),
    showState,
    stop,
    destroy: () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    },
    hasState: (stateName) => Array.isArray(normalized[stateName]) && normalized[stateName].length > 0,
    hasAny: () => Object.values(normalized).some((frames) => frames.length > 0),
    getCurrentState: () => current?.stateName || null,
    isLooping: (stateName) =>
      !!(current && current.loop && (!stateName || current.stateName === stateName)),
  };
}

function addMotionPreferenceListener(listener) {
  if (typeof prefersReducedMotion.addEventListener === "function") {
    prefersReducedMotion.addEventListener("change", listener);
  } else if (typeof prefersReducedMotion.addListener === "function") {
    prefersReducedMotion.addListener(listener);
  }
}

function removeMotionPreferenceListener(listener) {
  if (typeof prefersReducedMotion.removeEventListener === "function") {
    prefersReducedMotion.removeEventListener("change", listener);
  } else if (typeof prefersReducedMotion.removeListener === "function") {
    prefersReducedMotion.removeListener(listener);
  }
}

function clamp(value, min, max) {
  if (Number.isNaN(value) || Number.isNaN(min) || Number.isNaN(max)) {
    return value;
  }
  if (min > max) {
    return Math.min(Math.max(value, max), min);
  }
  return Math.min(Math.max(value, min), max);
}

function setupDataTools() {
  if (!importBtn || !exportBtn || !restoreBtn || !importInput) {
    console.error("Data management controls are missing from the DOM");
    return;
  }

  importBtn.addEventListener("click", () => importInput.click());

  importInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const sanitized = sanitizeBookmarks(parsed);
      if (!sanitized.length) {
        alert("We couldn't find any bookmarks in that file. Please check the format and try again.");
        return;
      }
      setBookmarks(sanitized, { persist: true });
      alert(`Imported ${sanitized.length} sparkly bookmarks!`);
    } catch (error) {
      console.error("Import failed", error);
      alert("Import failed. Make sure you're using a valid JSON backup file.");
    } finally {
      importInput.value = "";
    }
  });

  exportBtn.addEventListener("click", () => {
    if (!bookmarks.length) {
      alert("There are no bookmarks to export just yet.");
      return;
    }

    const blob = new Blob([JSON.stringify(bookmarks, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bubblemarks-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  });

  restoreBtn.addEventListener("click", async () => {
    if (
      !confirm(
        "Restore bookmarks from bookmarks.json? This will replace your current list."
      )
    ) {
      return;
    }

    await hydrateData();
    resetCategorySettingsToDefaults();
  });
}

// === Adaptive Layout Hook for Notion Embeds === //
(function handleNotionResize() {
  window.addEventListener("DOMContentLoaded", () => {
    const slider = document.getElementById("card-size");

    if (!grid) {
      console.warn("❌ Grid not found in DOM for adaptive layout");
      return;
    }

    if (slider) {
      slider.addEventListener("input", () => {
        handleLayoutResize();
        console.log("Grid layout refresh requested for Notion embed context");
      });
    }
  });
})();

    if (!desktopLoadHandlerRegistered) {
      window.addEventListener("load", () => {
        console.log("[Bubblemarks] Desktop app load complete");
        renderBookmarks(bookmarks || []);
      });
      desktopLoadHandlerRegistered = true;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    try {
      initializeBubblemarks();
    } catch (err) {
      console.error("[Bubblemarks] Initialization failed:", err);
    }
  });

  window.addEventListener("DOMContentLoaded", () => {
    const notesList = document.getElementById("notes-list");
    const notesEmpty = document.getElementById("notes-empty");
    const notesAddButton = document.getElementById("notes-add");
    const notesModal = document.getElementById("notes-modal");
    const notesDialog = notesModal?.querySelector(".notes-modal__dialog");
    const notesForm = document.getElementById("notes-form");
    const notesTitleInput = document.getElementById("note-title");
    const notesBodyInput = document.getElementById("note-body");
    const notesError = document.getElementById("notes-error");
    const notesTemplate = document.getElementById("note-item-template");

    if (
      !notesList ||
      !notesAddButton ||
      !notesModal ||
      !notesDialog ||
      !notesForm ||
      !notesTitleInput ||
      !notesBodyInput ||
      !notesTemplate ||
      !notesEmpty ||
      !notesError
    ) {
      console.warn("[Bubblemarks] Notes widget elements missing");
      return;
    }

    const STORAGE_KEY = "bubblemarks.notes.v1";
    let notes = [];
    let editingId = null;
    let lastFocus = null;

    const getFocusableElements = () => {
      const elements = notesDialog.querySelectorAll(
        'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      return Array.from(elements).filter((element) => !element.hasAttribute("disabled"));
    };

    const trapFocus = (event) => {
      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusableElements();
      if (!focusable.length) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const persistNotes = (payload) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (error) {
        console.warn("[Bubblemarks] Unable to save notes", error);
      }
    };

    const loadNotes = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        notes = stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.warn("[Bubblemarks] Unable to load notes", error);
        notes = [];
      }
    };

    const getPreview = (content) => {
      if (!content) {
        return "";
      }
      const normalized = content.replace(/\s+/g, " ").trim();
      return normalized.length > 120 ? `${normalized.slice(0, 117)}...` : normalized;
    };

    const renderNotes = () => {
      notesList.innerHTML = "";

      if (!notes.length) {
        notesEmpty.hidden = false;
        return;
      }

      notesEmpty.hidden = true;

      notes
        .slice()
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .forEach((note) => {
          const fragment = notesTemplate.content.cloneNode(true);
          const item = fragment.querySelector(".note-item");
          const title = fragment.querySelector(".note-item__title");
          const preview = fragment.querySelector(".note-item__preview");

          if (item) {
            item.dataset.noteId = String(note.id);
          }

          if (title) {
            title.textContent = note.title;
          }

          if (preview) {
            preview.textContent = getPreview(note.body);
          }

          notesList.appendChild(fragment);
        });
    };

    const closeNotesModal = () => {
      notesModal.hidden = true;
      notesForm.reset();
      notesError.textContent = "";
      editingId = null;
      document.removeEventListener("keydown", trapFocus);
      document.removeEventListener("keydown", handleEscapeClose, true);
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }
    };

    const handleEscapeClose = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeNotesModal();
      }
    };

    const openNotesModal = (existingNote = null) => {
      lastFocus = document.activeElement;
      notesModal.hidden = false;
      notesError.textContent = "";
      editingId = existingNote?.id ?? null;

      notesTitleInput.value = existingNote?.title || "";
      notesBodyInput.value = existingNote?.body || "";

      document.addEventListener("keydown", trapFocus);
      document.addEventListener("keydown", handleEscapeClose, true);

      window.setTimeout(() => {
        notesDialog.focus();
        notesTitleInput.focus();
      }, 0);
    };

    const upsertNote = (payload) => {
      const trimmedTitle = payload.title.trim();
      const trimmedBody = payload.body.trim();

      if (!trimmedTitle || !trimmedBody) {
        notesError.textContent = "Please add both a title and body.";
        (trimmedTitle ? notesBodyInput : notesTitleInput).focus();
        return;
      }

      const timestamp = Date.now();
      if (editingId !== null) {
        notes = notes.map((note) =>
          note.id === editingId ? { ...note, title: trimmedTitle, body: trimmedBody, updatedAt: timestamp } : note
        );
      } else {
        notes.push({ id: timestamp, title: trimmedTitle, body: trimmedBody, updatedAt: timestamp });
      }

      persistNotes(notes);
      renderNotes();
      closeNotesModal();
    };

    notesAddButton.addEventListener("click", () => openNotesModal());

    notesList.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const actionButton = target.closest("[data-note-action]");
      const noteElement = target.closest("[data-note-id]");
      if (!actionButton || !noteElement) {
        return;
      }

      const noteId = Number(noteElement.getAttribute("data-note-id"));
      const note = notes.find((entry) => entry.id === noteId);
      if (!note) {
        return;
      }

      const action = actionButton.getAttribute("data-note-action");
      if (action === "edit") {
        openNotesModal(note);
        return;
      }

      if (action === "delete") {
        notes = notes.filter((entry) => entry.id !== noteId);
        persistNotes(notes);
        renderNotes();
      }
    });

    notesForm.addEventListener("submit", (event) => {
      event.preventDefault();
      upsertNote({
        title: notesTitleInput.value,
        body: notesBodyInput.value,
      });
    });

    notesModal.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof Element && target.hasAttribute("data-notes-dismiss")) {
        closeNotesModal();
      }
    });

    notesDialog.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
      }
    });

    loadNotes();
    renderNotes();
  });

  window.addEventListener("DOMContentLoaded", () => {
    const widget = document.getElementById("quicklaunch-widget");

    if (!widget) {
      console.warn("[Bubblemarks] Quicklaunch widget missing from DOM");
      return;
    }

    const getToastStack = () => {
      let stack = document.querySelector(".quicklaunch-toast-stack");
      if (!stack) {
        stack = document.createElement("div");
        stack.className = "quicklaunch-toast-stack";
        document.body.appendChild(stack);
      }
      return stack;
    };

    const showNotice = (message) => {
      const stack = getToastStack();
      const toast = document.createElement("div");
      toast.className = "quicklaunch-toast";
      toast.textContent = message;
      stack.appendChild(toast);

      requestAnimationFrame(() => {
        toast.classList.add("quicklaunch-toast--visible");
      });

      window.setTimeout(() => {
        toast.classList.remove("quicklaunch-toast--visible");
        toast.addEventListener(
          "transitionend",
          () => {
            toast.remove();
          },
          { once: true }
        );
      }, 3400);
    };

    const handleLaunch = async (deeplink, label) => {
      if (!deeplink) {
        showNotice(`${label} shortcut is missing its app path.`);
        return;
      }

      const quicklaunchApi = window.quicklaunch;

      if (!quicklaunchApi || typeof quicklaunchApi.open !== "function") {
        showNotice(
          `Couldn't open ${label}. Allow app launches or configure your OS/app path to proceed.`
        );
        return;
      }

      try {
        const result = await quicklaunchApi.open(deeplink);

        if (result?.success) {
          return;
        }

        const message = result?.error
          ? `${label} didn't open. Check your OS/app path settings and try again when ready.`
          : `Couldn't open ${label}. Allow app launches or configure your OS/app path to proceed.`;

        showNotice(message);
      } catch (error) {
        console.warn(`[Bubblemarks] Quicklaunch failed for ${label}:`, error);
        showNotice(
          `${label} didn't open. Check your OS/app path settings and try again when ready.`
        );
      }
    };

    const fallbackIconSrc = "bubblemarks://assets/icon128.png";

    widget.querySelectorAll(".quicklaunch-button__icon").forEach((icon) => {
      icon.addEventListener("error", () => {
        if (icon.dataset.fallbackApplied === "true") {
          return;
        }

        icon.dataset.fallbackApplied = "true";
        icon.src = fallbackIconSrc;
        icon.classList.add("quicklaunch-button__icon--fallback");
      });
    });

    widget.querySelectorAll("[data-quicklaunch-url]").forEach((button) => {
      const label =
        button.getAttribute("data-quicklaunch-label") ||
        button.textContent?.trim() ||
        "App";
      const deeplink = button.getAttribute("data-quicklaunch-url");
      button.setAttribute("aria-label", `Open ${label}`);

      button.addEventListener("click", async () => {
        await handleLaunch(deeplink, label);
      });
    });
  });

  window.addEventListener("DOMContentLoaded", () => {
    console.log("✅ script validated");

    const monthEl = document.getElementById("clock-month");
    const timeEl = document.getElementById("clock-time");
    const dateEl = document.getElementById("clock-date");
    const calendarEl = document.getElementById("clock-calendar");

    if (!monthEl || !timeEl || !dateEl || !calendarEl) {
      console.warn("[Bubblemarks] Clock widget missing required elements");
      return;
    }

    const weekdayLabels = ["S", "M", "T", "W", "Th", "F", "Sa"];

    const renderCalendar = (targetDate) => {
      const year = targetDate.getFullYear();
      const monthIndex = targetDate.getMonth();
      const todayDate = targetDate.getDate();
      const startDay = new Date(year, monthIndex, 1).getDay();
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

      const grid = document.createElement("div");
      grid.className = "cal-grid";

      const headerRow = document.createElement("div");
      headerRow.className = "cal-row";
      weekdayLabels.forEach((label) => {
        const cell = document.createElement("div");
        cell.className = "cal-cell";
        cell.textContent = label;
        headerRow.appendChild(cell);
      });
      grid.appendChild(headerRow);

      let currentDay = 1 - startDay;
      while (currentDay <= daysInMonth) {
        const row = document.createElement("div");
        row.className = "cal-row";

        for (let i = 0; i < 7; i += 1) {
          const cell = document.createElement("div");
          cell.className = "cal-cell";

          if (currentDay < 1 || currentDay > daysInMonth) {
            cell.classList.add("cal-empty");
            cell.setAttribute("aria-hidden", "true");
          } else {
            cell.textContent = currentDay;
            if (currentDay === todayDate) {
              cell.classList.add("cal-today");
              cell.setAttribute("aria-label", "Today");
            }
          }

          row.appendChild(cell);
          currentDay += 1;
        }

        grid.appendChild(row);
      }

      calendarEl.innerHTML = "";
      calendarEl.appendChild(grid);
    };

    const updateClock = () => {
      const now = new Date();
      monthEl.textContent = now.toLocaleDateString([], { month: "long", year: "numeric" });
      timeEl.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      dateEl.textContent = now.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      renderCalendar(now);
    };

    updateClock();
    window.setInterval(updateClock, 60000);
  });
}
