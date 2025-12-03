window.addEventListener("DOMContentLoaded", () => {
  console.log("✅ script validated");

  const STORAGE_KEY = "bubblepet.widget.state";
  const STAT_BOUNDS = {
    hunger: [0, 10],
    sleepiness: [0, 10],
    boredom: [0, 10],
    overstimulation: [0, 10],
    affection: [0, 10],
  };

  const DEFAULT_STATS = {
    hunger: 4,
    sleepiness: 2,
    boredom: 6,
    overstimulation: 3,
    affection: 5,
  };

  const ACTION_STAT_EFFECTS = {
    feed: { hunger: -5 },
    pet: { affection: 5 },
    rest: { overstimulation: -10 },
    swim: { boredom: -5, overstimulation: 1 },
  };

  const ACTION_XP_MAP = {
    feed: 5,
    sleep: 5,
    swim: 5,
    rest: 5,
    pet: 3,
    roam: 2,
  };

  function clampStatValue(key, value) {
    const bounds = STAT_BOUNDS[key] || [0, 100];
    const [min, max] = bounds;
    return Math.max(min, Math.min(max, Math.round(value)));
  }

  function calculateHappiness(stats) {
    if (!stats) return 0;
    const { hunger = 0, sleepiness = 0, boredom = 0, overstimulation = 0, affection = 0 } = stats;
    const needsTotal = hunger + sleepiness + boredom + overstimulation;
    return Math.round(10 - needsTotal + affection);
  }

  function applyStatChanges(state, deltaMap = {}) {
    let changed = false;
    const nextStats = { ...state.stats };

    Object.entries(deltaMap).forEach(([key, delta]) => {
      if (!Object.prototype.hasOwnProperty.call(nextStats, key)) return;
      if (typeof delta !== "number" || Number.isNaN(delta)) return;
      const current = nextStats[key];
      const nextValue = clampStatValue(key, current + delta);
      if (nextValue !== current) {
        nextStats[key] = nextValue;
        changed = true;
      }
    });

    if (changed) {
      state.stats = nextStats;
    }

    const happiness = calculateHappiness(state.stats);
    const happinessChanged = happiness !== state.happiness;

    if (changed || happinessChanged) {
      state.happiness = happiness;
    }
  }

  function xpNeeded(level) {
    return Math.floor(30 * Math.pow(level, 1.4));
  }

  function checkLevelUp(state) {
    let needed = xpNeeded(state.level);
    let leveled = false;

    while (state.xp >= needed) {
      state.xp -= needed;
      state.level += 1;
      leveled = true;
      needed = xpNeeded(state.level);
    }

    return leveled;
  }

  function gainXP(state, amount) {
    if (!Number.isFinite(amount)) return;
    if (state.happiness < -15) return;
    if (state.stats.hunger === 10 || state.stats.sleepiness === 10) return;

    let awarded = amount;
    if (state.stats.overstimulation > 8) {
      awarded = amount / 2;
    }

    state.xp += awarded;
    checkLevelUp(state);
  }

  function adjustStatsFor(state, actionName) {
    const delta = ACTION_STAT_EFFECTS[actionName];
    if (delta) {
      applyStatChanges(state, delta);
    }
  }

  function saveWidgetState(state) {
    const payload = {
      name: state.name,
      level: state.level,
      xp: state.xp,
      hunger: state.stats.hunger,
      sleepiness: state.stats.sleepiness,
      happiness: state.happiness,
      boredom: state.stats.boredom,
      overstimulation: state.stats.overstimulation,
      affection: state.stats.affection,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      localStorage.setItem("petLevel", String(state.level));
      localStorage.setItem("petXP", String(state.xp));
      localStorage.setItem("petName", state.name);
    } catch (error) {
      console.warn("[Widget] Unable to save widget state", error);
    }
  }

  function loadWidgetState() {
    let stored = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      stored = raw ? JSON.parse(raw) || {} : {};
    } catch (error) {
      console.warn("[Widget] Unable to parse stored widget state", error);
    }

    const fallbackLevel = Number(localStorage.getItem("petLevel"));
    const fallbackXP = Number(localStorage.getItem("petXP"));
    const fallbackName = localStorage.getItem("petName");

    const stats = {
      ...DEFAULT_STATS,
      hunger: Number.isFinite(stored.hunger) ? clampStatValue("hunger", stored.hunger) : DEFAULT_STATS.hunger,
      sleepiness: Number.isFinite(stored.sleepiness)
        ? clampStatValue("sleepiness", stored.sleepiness)
        : DEFAULT_STATS.sleepiness,
      boredom: Number.isFinite(stored.boredom) ? clampStatValue("boredom", stored.boredom) : DEFAULT_STATS.boredom,
      overstimulation: Number.isFinite(stored.overstimulation)
        ? clampStatValue("overstimulation", stored.overstimulation)
        : DEFAULT_STATS.overstimulation,
      affection: Number.isFinite(stored.affection)
        ? clampStatValue("affection", stored.affection)
        : DEFAULT_STATS.affection,
    };

    const happinessValue = Number.isFinite(stored.happiness)
      ? clampStatValue("affection", stored.happiness)
      : calculateHappiness(stats);

    return {
      name: typeof stored.name === "string" && stored.name.trim() ? stored.name.trim() : fallbackName || "BubblePet",
      level: Number.isFinite(stored.level) && stored.level > 0 ? stored.level : fallbackLevel > 0 ? fallbackLevel : 1,
      xp: Number.isFinite(stored.xp) && stored.xp >= 0 ? stored.xp : Number.isFinite(fallbackXP) ? fallbackXP : 0,
      stats,
      happiness: happinessValue,
    };
  }

  function createStatBar(label) {
    const wrapper = document.createElement("div");
    wrapper.style.marginBottom = "8px";

    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.alignItems = "center";
    row.style.marginBottom = "4px";

    const labelEl = document.createElement("span");
    labelEl.textContent = label;
    labelEl.style.fontSize = "12px";
    labelEl.style.color = "#dfe7ff";

    const valueEl = document.createElement("span");
    valueEl.style.fontSize = "12px";
    valueEl.style.color = "#dfe7ff";

    row.appendChild(labelEl);
    row.appendChild(valueEl);

    const bar = document.createElement("div");
    bar.style.width = "100%";
    bar.style.height = "8px";
    bar.style.background = "rgba(255,255,255,0.1)";
    bar.style.borderRadius = "4px";
    bar.style.overflow = "hidden";

    const fill = document.createElement("div");
    fill.style.height = "100%";
    fill.style.width = "0%";
    fill.style.background = "linear-gradient(90deg, #6dd5ed, #2193b0)";
    fill.style.transition = "width 0.2s ease";

    bar.appendChild(fill);

    wrapper.appendChild(row);
    wrapper.appendChild(bar);

    return { wrapper, valueEl, fill };
  }

  function render(state, ui) {
    ui.nameEl.textContent = state.name;
    ui.levelEl.textContent = `Lv. ${state.level}`;

    const hungerPercent = Math.min(100, (clampStatValue("hunger", state.stats.hunger) / 10) * 100);
    const sleepPercent = Math.min(100, (clampStatValue("sleepiness", state.stats.sleepiness) / 10) * 100);
    const happinessPercent = Math.min(100, (clampStatValue("affection", state.happiness) / 10) * 100);

    ui.hungerBar.fill.style.width = `${hungerPercent}%`;
    ui.sleepBar.fill.style.width = `${sleepPercent}%`;
    ui.happinessBar.fill.style.width = `${happinessPercent}%`;

    ui.hungerBar.valueEl.textContent = `${state.stats.hunger}/10`;
    ui.sleepBar.valueEl.textContent = `${state.stats.sleepiness}/10`;
    ui.happinessBar.valueEl.textContent = `${state.happiness}/10`;
  }

  function createUI(state) {
    const root = document.getElementById("pet-widget-root");
    if (!root) return null;

    const container = document.createElement("div");
    container.style.fontFamily = "'Inter', system-ui, sans-serif";
    container.style.background = "rgba(9, 20, 40, 0.9)";
    container.style.color = "#eef5ff";
    container.style.border = "1px solid rgba(255,255,255,0.15)";
    container.style.borderRadius = "12px";
    container.style.padding = "12px";
    container.style.width = "260px";
    container.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.35)";
    container.style.boxSizing = "border-box";

    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";
    header.style.marginBottom = "8px";

    const nameEl = document.createElement("div");
    nameEl.style.fontSize = "16px";
    nameEl.style.fontWeight = "700";
    nameEl.textContent = state.name;

    const levelEl = document.createElement("div");
    levelEl.style.fontSize = "12px";
    levelEl.style.padding = "2px 8px";
    levelEl.style.borderRadius = "999px";
    levelEl.style.background = "rgba(255,255,255,0.08)";
    levelEl.textContent = `Lv. ${state.level}`;

    header.appendChild(nameEl);
    header.appendChild(levelEl);

    const sprite = document.createElement("img");
    sprite.src = "./assets/resting.gif";
    sprite.alt = "BubblePet";
    sprite.style.display = "block";
    sprite.style.width = "120px";
    sprite.style.height = "120px";
    sprite.style.objectFit = "contain";
    sprite.style.margin = "0 auto 8px";

    const barsContainer = document.createElement("div");
    barsContainer.style.marginBottom = "12px";

    const hungerBar = createStatBar("Hunger");
    const sleepBar = createStatBar("Sleepiness");
    const happinessBar = createStatBar("Happiness");

    barsContainer.appendChild(hungerBar.wrapper);
    barsContainer.appendChild(sleepBar.wrapper);
    barsContainer.appendChild(happinessBar.wrapper);

    const buttonRow = document.createElement("div");
    buttonRow.style.display = "grid";
    buttonRow.style.gridTemplateColumns = "repeat(3, 1fr)";
    buttonRow.style.gap = "8px";

    const actions = [
      { label: "Feed", action: "feed" },
      { label: "Pet", action: "pet" },
      { label: "Swim", action: "swim" },
      { label: "Roam", action: "roam" },
      { label: "Sleep", action: "sleep" },
    ];

    actions.forEach((entry) => {
      const btn = document.createElement("button");
      btn.textContent = entry.label;
      btn.style.border = "none";
      btn.style.background = "linear-gradient(135deg, #58a6ff, #5ac8fa)";
      btn.style.color = "#041326";
      btn.style.padding = "8px 6px";
      btn.style.borderRadius = "8px";
      btn.style.fontWeight = "700";
      btn.style.cursor = "pointer";
      btn.style.transition = "transform 0.1s ease, box-shadow 0.1s ease";
      btn.addEventListener("mouseenter", () => {
        btn.style.transform = "translateY(-1px)";
        btn.style.boxShadow = "0 6px 16px rgba(90, 200, 250, 0.25)";
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "none";
        btn.style.boxShadow = "none";
      });
      btn.addEventListener("click", () => {
        handleAction(entry.action);
      });
      buttonRow.appendChild(btn);
    });

    container.appendChild(header);
    container.appendChild(sprite);
    container.appendChild(barsContainer);
    container.appendChild(buttonRow);

    root.innerHTML = "";
    root.appendChild(container);

    return {
      nameEl,
      levelEl,
      hungerBar,
      sleepBar,
      happinessBar,
    };
  }

  const state = loadWidgetState();
  const ui = createUI(state);

  function handleAction(actionName) {
    if (!actionName || !ui) return;
    const normalized = actionName.toLowerCase();

    adjustStatsFor(state, normalized);

    if (ACTION_XP_MAP[normalized]) {
      gainXP(state, ACTION_XP_MAP[normalized]);
    }

    saveWidgetState(state);
    render(state, ui);
  }

  if (ui) {
    render(state, ui);
  }
});
