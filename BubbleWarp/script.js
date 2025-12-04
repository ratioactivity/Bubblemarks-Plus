window.addEventListener("DOMContentLoaded", () => {
  const logo = document.getElementById("logo");
  if (logo) {
    const duplicateLogos = Array.from(document.querySelectorAll("#logo"))
      .filter(node => node !== logo);
    duplicateLogos.forEach(node => node.remove());
  }
  const bubblesContainer = document.getElementById("bubbles-container");
  const noItch = document.getElementById("no-itch");
  const footerIcon = document.getElementById("footer-icon");
  const soundToggle = document.getElementById("sound-toggle");
  const whaleOverlay = document.getElementById("whale-overlay");
  const favoritesBtn = document.getElementById("favorites-button");
  const favoritesOverlay = document.getElementById("favorites-overlay");
  const favoritesList = document.getElementById("favorites-list");
  const closeFavorites = document.getElementById("close-favorites");
  const addFavBtn = document.getElementById("add-favorite-button");
  const defaultFavBtnLabel = addFavBtn.textContent;
  const menuButton = document.getElementById("menu-button");
  const menuModal = document.getElementById("menu-modal");
  const menuBackdrop = document.getElementById("menu-backdrop");
  const menuClose = document.getElementById("menu-close");
  const menuTabs = Array.from(document.querySelectorAll(".menu-tab"));
  const menuPanels = Array.from(document.querySelectorAll(".menu-panel"));
  const menuNormalList = document.getElementById("menu-normal-list");
  const menuDeepDiveList = document.getElementById("menu-deepdive-list");
  const menuRadioactiveList = document.getElementById("menu-radioactive-list");
  let deepDiveMode = JSON.parse(localStorage.getItem("deepDiveMode") || "false");
  let nuclearMode = JSON.parse(localStorage.getItem("nuclearMode") || "false");
  let favBtnResetTimer = null;
  let latestLink = null;

  const deepDiveTopicOverlay = document.createElement("div");
  deepDiveTopicOverlay.id = "deepdive-topic-overlay";
  deepDiveTopicOverlay.innerHTML = `
    <div class="deepdive-topic-bubble">
      <button class="topic-overlay-close" aria-label="Close deep dive topic">✖</button>
      <p class="topic-overlay-title">🌊 Deep Dive Topic</p>
      <p class="topic-overlay-body"></p>
      <div class="topic-overlay-actions">
        <button class="topic-overlay-search">Search This Topic</button>
        <button class="topic-overlay-dismiss">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(deepDiveTopicOverlay);
  const topicOverlayBody = deepDiveTopicOverlay.querySelector(".topic-overlay-body");
  const topicOverlaySearch = deepDiveTopicOverlay.querySelector(".topic-overlay-search");
  const topicOverlayClose = deepDiveTopicOverlay.querySelector(".topic-overlay-close");
  const topicOverlayDismiss = deepDiveTopicOverlay.querySelector(".topic-overlay-dismiss");

  function hideTopicOverlay() {
    deepDiveTopicOverlay.classList.remove("active");
  }

  function showTopicOverlay() {
    const topic = topics[Math.floor(Math.random() * topics.length)];
    topicOverlayBody.textContent = topic;
    topicOverlaySearch.onclick = () => {
      const q = encodeURIComponent(topic);
      window.open(`https://www.google.com/search?q=${q}`, "_blank");
    };
    deepDiveTopicOverlay.classList.add("active");
  }

  deepDiveTopicOverlay.addEventListener("click", event => {
    if (event.target === deepDiveTopicOverlay) {
      hideTopicOverlay();
    }
  });

  topicOverlayClose?.addEventListener("click", hideTopicOverlay);
  topicOverlayDismiss?.addEventListener("click", hideTopicOverlay);

  const nuclearMenuOverlay = document.createElement("div");
  nuclearMenuOverlay.id = "nuclear-menu-overlay";
  nuclearMenuOverlay.innerHTML = `
    <div class="nuclear-menu-card">
      <button class="nuclear-overlay-close" aria-label="Close nuclear menu">✖</button>
      <p class="nuclear-overlay-title">☢ Select Your Search ☢</p>
      <div class="nuclear-overlay-grid"></div>
    </div>
  `;
  document.body.appendChild(nuclearMenuOverlay);

  const nuclearGrid = nuclearMenuOverlay.querySelector(".nuclear-overlay-grid");
  const nuclearOverlayClose = nuclearMenuOverlay.querySelector(".nuclear-overlay-close");
  const nuclearCategoryLinks = {
    MAIN: [
      "https://www.ebay.com/sch/i.html?_nkw=radium&_sacat=0&_from=R40&_trksid=p2334524.m570.l1313&_fsrp=1&rt=nc&Time%2520Period%2520Manufactured=1900%252D1919|1920%252D1949|1950%252D1959|1960%252D1969|1970%252D1979&_odkw=antique+clock&_osacat=0&_dcat=261602",
      "https://www.ebay.com/sch/i.html?_dcat=261602&_fsrp=1&rt=nc&_from=R40&_nkw=antique+clock&_sacat=0&Time%2520Period%2520Manufactured=1900%252D1919|1920%252D1949|1950%252D1959|1960%252D1969|1970%252D1979",
      "https://www.ebay.com/sch/i.html?_dcat=3937&_fsrp=1&rt=nc&_from=R40&_nkw=antique+pocket+watch&_sacat=0&Year%2520Manufactured=1900%252D1909|1910%252D1919|1920%252D1929|1930%252D1939|1940%252D1949|1950%252D1959|1960%252D1969|1970%252D1979",
      "https://www.ebay.com/sch/i.html?_dcat=31387&_fsrp=1&rt=nc&_from=R40&_nkw=antique+watch&_sacat=0&Year%2520Manufactured=1920%252D1929|1930%252D1939|1940%252D1949|1950%252D1959|1960%252D1969|1970%252D1979|Pre%252D1920",
      "https://www.ebay.com/sch/i.html?_nkw=antique+westclox&_sacat=0&_from=R40&_trksid=p2334524.m570.l1313&_fsrp=1&rt=nc&_odkw=antique+watch&_osacat=0&Year%2520Manufactured=1920%252D1929|1930%252D1939|1940%252D1949|1950%252D1959|1960%252D1969|1970%252D1979|Pre%252D1920&_dcat=31387",
      "https://www.ebay.com/sch/i.html?_nkw=antique%20mechanical%20watches"
    ],
    LOTS: [
      "https://www.ebay.com/sch/i.html?_nkw=vintage%20pocket%20watch%20lot",
      "https://www.ebay.com/sch/i.html?_nkw=antique%20pocket%20watch%20lot",
      "https://www.ebay.com/sch/i.html?_nkw=vintage%20watch%20lot",
      "https://www.ebay.com/sch/i.html?_nkw=vintage%20clock%20lot",
      "https://www.ebay.com/sch/i.html?_nkw=antique%20clock%20lot"
    ],
    BRANDS: [
      "https://www.ebay.com/sch/i.html?_nkw=biltmore%20pocket%20watch",
      "https://www.ebay.com/sch/i.html?_nkw=radiolite",
      "https://www.ebay.com/sch/i.html?_nkw=antique%20seth%20thomas",
      "https://www.ebay.com/sch/i.html?_nkw=antique%20westclox",
      "https://www.ebay.com/sch/i.html?_nkw=glo-ben",
      "https://www.ebay.com/sch/i.html?_nkw=antique%20telechron",
      "https://www.ebay.com/sch/i.html?_nkw=antique%20general%20electric%20clock",
      "https://www.ebay.com/sch/i.html?_nkw=antique%20pocket%20ben",
      "https://www.ebay.com/sch/i.html?_nkw=antique%20big%20ben",
      "https://www.ebay.com/sch/i.html?_nkw=antique%20baby%20ben"
    ],
    "MISC DIALS": [
      "https://www.ebay.com/sch/i.html?_nkw=antique%20stopwatch",
      "https://www.ebay.com/sch/i.html?_nkw=8%20day%20clock",
      "https://www.ebay.com/sch/i.html?_nkw=antique%20auto%20clock",
      "https://www.ebay.com/sch/i.html?_nkw=antique+darkroom+timer&_sacat=0&_from=R40&_trksid=p2334524.m570.l1313&_odkw=darkroom+timer",
      "https://www.ebay.com/sch/i.html?_dcat=261605&_fsrp=1&rt=nc&_nkw=antique+desk+clock&Time%2520Period%2520Manufactured=1920%252D1949%7C1900%252D1919%7C1950%252D1959%7C1960%252D1969%7C1970%252D1979",
      "https://www.ebay.com/sch/i.html?_dcat=261605&_fsrp=1&rt=nc&_from=R40&_nkw=antique+mantle+clock&_sacat=0&Time%2520Period%2520Manufactured=1920%252D1949%7C1900%252D1919%7C1950%252D1959%7C1960%252D1969%7C1970%252D1979",
      "https://www.ebay.com/sch/i.html?_nkw=antique%20timer",
      "https://www.ebay.com/sch/i.html?_nkw=antique+lensatic+compass&_sacat=0&_from=R40&_trksid=p2334524.m570.l1313&_odkw=lensatic+compass",
      "https://www.ebay.com/sch/i.html?_nkw=antique%20compass",
      "https://www.ebay.com/sch/i.html?_dcat=31387&_fsrp=1&rt=nc&_from=R40&_nkw=antique+divers+watch&_sacat=0&Year%2520Manufactured=Pre%252D1920%7C1920%252D1929%7C1930%252D1939%7C1940%252D1949%7C1950%252D1959%7C1960%252D1969%7C1970%252D1979"
    ],
    MILITARY: [
      "https://www.ebay.com/sch/i.html?_nkw=antique%20anti-submarine%20dial",
      "https://www.ebay.com/sch/i.html?_nkw=antique%20anti-aircraft%20dial",
      "https://www.ebay.com/sch/i.html?_nkw=military%20maritime%20instrument",
        "https://www.ebay.com/sch/i.html?_nkw=military%20aeronautical%20instrument",
        "https://www.ebay.com/sch/i.html?_nkw=military%20aviation%20instrument",
        "https://www.ebay.com/sch/i.html?_nkw=WW2%20gauge",
        "https://www.ebay.com/sch/i.html?_nkw=military%20gauge",
      "https://www.ebay.com/sch/i.html?_nkw=antique+swiss+military+watch&_sacat=0&_from=R40&_trksid=p2334524.m570.l1313&_odkw=swiss+military+watch",
      "https://www.ebay.com/sch/i.html?_nkw=antique%20soviet%20watch",
      "https://www.ebay.com/sch/i.html?_nkw=antique+military+watch+hands&_sacat=0&_from=R40&_trksid=p2334524.m570.l1313&_odkw=military+watch+hands",
      "https://www.ebay.com/sch/i.html?_nkw=antique+USSR+watch&_sacat=0&_from=R40&_trksid=p2334524.m570.l1313&_odkw=USSR+watch",
      "https://www.ebay.com/sch/i.html?_nkw=WW2%20watch",
      "https://www.ebay.com/sch/i.html?_nkw=military%20pocket%20watch",
        "https://www.ebay.com/sch/i.html?_nkw=antique+military+watch&_sacat=0&_from=R40&_trksid=p2334524.m570.l1313&_odkw=military+watch",
      "https://www.ebay.com/sch/i.html?_nkw=WW2%20clock",
      "https://www.ebay.com/sch/i.html?_nkw=antique%20submarine%20clock"
    ],
    GAUGES: [
      "https://www.ebay.com/sch/i.html?_nkw=antique%20gauge",
      "https://www.ebay.com/sch/i.html?_nkw=antique%20engine%20meter",
      "https://www.ebay.com/sch/i.html?_nkw=antique%20pressure%20gauge",
      "https://www.ebay.com/sch/i.html?_nkw=antique%20flight%20compass",
      "https://www.ebay.com/sch/i.html?_nkw=bendix%20aircraft",
      "https://www.ebay.com/sch/i.html?_nkw=antique%20maritime%20instruments",
      "https://www.ebay.com/sch/i.html?_nkw=antique%20aeronautical%20instruments",
      "https://www.ebay.com/sch/i.html?_nkw=antique%20submarine%20dial",
      "https://www.ebay.com/sch/i.html?_nkw=antique%20submarine%20gauge"
    ],
    LUMINOUS: [
      "https://www.ebay.com/sch/i.html?_nkw=antique%20luminous",
      "https://www.ebay.com/sch/i.html?_nkw=vintage%20luminous",
      "https://www.ebay.com/sch/i.html?_nkw=antique+luminous+watch&_sacat=0&_from=R40&_trksid=p2334524.m570.l1313&_odkw=luminous+watch",
      "https://www.ebay.com/sch/i.html?_nkw=antique+luminous+dials&_sacat=0&_from=R40&_trksid=p2334524.m570.l1313&_odkw=luminous+dials",
      "https://www.ebay.com/sch/i.html?_nkw=antique+luminous+clocks&_sacat=0&_from=R40&_trksid=p2334524.m570.l1313&_odkw=luminous+clocks"
    ],
    GLASS: [
      "https://www.ebay.com/sch/i.html?_nkw=orange+fiestaware&_sacat=0&_from=R40&_trksid=p2334524.m570.l1313&_odkw=red+fiestaware&_osacat=0",
      "https://www.ebay.com/sch/i.html?_nkw=burmese+glass&_sacat=0&_from=R40&_trksid=p2334524.m570.l1313&_odkw=orange+fiestaware&_osacat=0",
      "https://www.ebay.com/sch/i.html?_nkw=vaseline%20glass",
      "https://www.ebay.com/sch/i.html?_nkw=uranium+slag+glass&_sacat=0&_from=R40&_trksid=p2334524.m570.l1313&_odkw=uranium",
      "https://www.ebay.com/sch/i.html?_nkw=uranium%20glass"
    ],
    ELEMENTS: [
      "https://www.ebay.com/sch/i.html?_nkw=uranium",
      "https://www.ebay.com/sch/i.html?_nkw=radium",
      "https://www.ebay.com/sch/i.html?_nkw=plutonium",
      "https://www.ebay.com/sch/i.html?_nkw=polonium",
      "https://www.ebay.com/sch/i.html?_nkw=thorium",
      "https://www.ebay.com/sch/i.html?_nkw=nuclear",
      "https://www.ebay.com/sch/i.html?_nkw=scintillations",
      "https://www.ebay.com/sch/i.html?_nkw=scintillations",
      "https://www.ebay.com/sch/i.html?_nkw=cesium"
    ],
    HISTORY: [
      "https://www.ebay.com/sch/i.html?_nkw=radioactive%20history",
      "https://www.ebay.com/sch/i.html?_nkw=radium%20dial%20company",
      "https://www.ebay.com/sch/i.html?_nkw=united%20states%20radium%20corporation",
      "https://www.ebay.com/sch/i.html?_nkw=tho-radia",
      "https://www.ebay.com/sch/i.html?_nkw=radium%20cigarettes",
      "https://www.ebay.com/sch/i.html?_nkw=radium%20quack%20medicine",
      "https://www.ebay.com/sch/i.html?_nkw=radium%20condoms",
      "https://www.ebay.com/sch/i.html?_nkw=radium%20ephemera",
      "https://www.ebay.com/sch/i.html?_nkw=undark",
      "https://www.ebay.com/sch/i.html?_nkw=civil%20defense"
    ],
    MISC: [
      "https://www.ebay.com/sch/i.html?_nkw=revigator",
      "https://www.ebay.com/sch/i.html?_nkw=radium%20microscope%20slide",
      "https://www.ebay.com/sch/i.html?_nkw=antique%20microscope%20slide",
      "https://www.ebay.com/sch/i.html?_nkw=geiger%20source",
      "https://www.ebay.com/sch/i.html?_nkw=radioactive%20demonstration%20kit",
      "https://www.ebay.com/sch/i.html?_nkw=radioactive",
      "https://www.ebay.com/sch/i.html?_nkw=radiation",
      "https://www.ebay.com/sch/i.html?_nkw=bendix%20dosimeter",
      "https://www.ebay.com/sch/i.html?_nkw=Gilbert%20U-238%20Atomic%20Energy%20Laboratory",
      "https://www.ebay.com/sch/i.html?_nkw=BESTFIT%20hands"
    ]
  };
  const nuclearButtons = [
    "MAIN", "LOTS", "BRANDS", "MISC DIALS",
    "MILITARY", "GAUGES", "LUMINOUS", "GLASS",
    "ELEMENTS", "HISTORY", "MISC", "Close"
  ];
  const openNuclearCategory = label => {
    const categoryLinks = nuclearCategoryLinks[label];
    if (!categoryLinks || !categoryLinks.length) {
      return;
    }
    categoryLinks.forEach(url => {
      window.open(url, "_blank");
    });
  };
  nuclearButtons.forEach(label => {
    const button = document.createElement("button");
    button.textContent = label;
    if (label === "Close") {
      button.addEventListener("click", () => {
        hideNuclearOverlay();
      });
    } else {
      button.addEventListener("click", () => {
        openNuclearCategory(label);
      });
    }
    nuclearGrid?.appendChild(button);
  });

  const hideNuclearOverlay = () => {
    nuclearMenuOverlay.classList.remove("active");
  };

  const showNuclearOverlay = () => {
    nuclearMenuOverlay.classList.add("active");
  };

  nuclearMenuOverlay.addEventListener("click", event => {
    if (event.target === nuclearMenuOverlay) {
      hideNuclearOverlay();
    }
  });

  nuclearOverlayClose?.addEventListener("click", hideNuclearOverlay);

  const topics = [
    "Uranium glass history",
    "Titanium metallurgy",
    "Historical apothecary practices",
    "Radium Girls",
    "Salem Witch Trials",
    "Pompeii",
    "Ancient Mayan civilization",
    "The Franco regime in Spain",
    "The Spanish Flu pandemic",
    "Aqua Tofana and historical poisons",
    "The Rwandan Genocide",
    "Gini Coefficient around the world",
    "Che Guevara",
    "Greek mythology",
    "Norse mythology",
    "Egyptian mythology",
    "History of atheism",
    "Scientology",
    "Heaven's Gate",
    "Buddhism",
    "Communism",
    "Anarchism",
    "The death penalty",
    "Evolution of drug laws",
    "History of tea",
    "History of wine",
    "American Prohibition",
    "Weird international laws",
    "Castles",
    "Fashion evolution",
    "The French Revolution",
    "History of forensic science",
    "Influence of memes on social behavior",
    "Brain rot psychology",
    "Terrorism using biological and chemical agents",
    "Sign language",
    "How airports work",
    "Clockbuilding",
    "Blacksmithing",
    "Funeral arts",
    "Natural selection",
    "Bioremediation",
    "Nuclear semiotics",
    "LNT model vs radiation hormesis",
    "Dark matter",
    "Uranium glass history",
    "Nuclear fusion",
    "Supernovae",
    "Neutron stars",
    "Black holes",
    "Quasars",
    "Hypothetical stars",
    "Milky Way galaxy",
    "Andromeda galaxy",
    "Globular clusters",
    "Gas giants",
    "Ice giants",
    "Rogue planets",
    "Hot Jupiters",
    "Exoplanets",
    "Asteroid impacts",
    "Gamma-ray bursts",
    "Magnetars",
    "Solar flares",
    "Spaghettification",
    "Time dilation",
    "Wormholes",
    "Multiverse theories",
    "Quantum foam",
    "Entropy",
    "Voyager 1 and 2",
    "Apollo missions",
    "ISS",
    "Mars missions",
    "Heat death of the universe",
    "Boltzmann brains",
    "The Great Filter",
    "Fermi paradox",
    "Dyson spheres",
    "The simulation hypothesis",
    "The anthropic principle",
    "The dark forest theory",
    "Many-worlds interpretation",
    "Block universe theory",
    "Eternal recurrence",
    "Quantum immortality",
    "Holographic principle",
    "Retrocausality",
    "Panspermia",
    "Pangaea",
    "Gaia hypothesis",
    "The Big Bang",
    "Inflation theory",
    "CMB cosmic microwave background",
    "Fusion theory",
    "Tokamak concept",
    "Cold fusion controversy",
    "Thermonuclear weapons",
    "Nuclear pulse propulsion (Project Orion)",
    "Nuclear winter theory",
    "Alpha, beta, and gamma decay",
    "Half-lives",
    "Isotopes",
    "Carbon-14 dating",
    "Radon in mines",
    "CERN",
    "Quark model",
    "Strong vs weak nuclear force",
    "Quantum tunneling",
    "Pair production and annihilation",
    "Nuclear binding energy curve",
    "Neutrinos",
    "Nuclear saltwater rocket",
    "Muon-catalyzed fusion",
    "Nuclear isomer batteries",
    "Antimatter-catalyzed fusion",
    "Nuclear pairing theory",
    "Prompt criticality",
    "Radiological vs nuclear events",
    "Fallout vs fission vs activation products",
    "Decay chains",
    "Neutrino hypothesis",
    "Nuclear semiotics",
    "Pitchblende",
    "Chicago Pile-1",
    "X-10 Graphite Reactor",
    "Hanford B Reactor",
    "Windscale Piles",
    "Pressurized water reactors",
    "Boiling water reactors",
    "Thorium reactors",
    "Pebble-bed reactors",
    "The Demon Core",
    "SL-1 reactor accident",
    "Kyshtym disaster",
    "Windscale fire",
    "Chernobyl disaster",
    "Fukushima disaster",
    "Tokaimura criticality incident",
    "JCO fuel plant accident",
    "Goiania accident",
    "Kramatorsk radiological accident",
    "Soviet submarine K-431 incident",
    "Acerinox radioactive spill",
    "Western Australia radioactive capsule event",
    "Church Rock uranium mill spill",
    "San Juan de Dios hospital incident",
    "Vinca criticality accident",
    "Urakami Church exposure",
    "Los Alamos plutonium incidents",
    "Tammiku radiation accident",
    "Samut Prakan accident",
    "Henan mine exposure",
    "1984 Moroccan radiation accident",
    "Lucens reactor accident",
    "Idaho Falls waste drum event",
    "Soreq Research Center accident",
    "Halifax explosion",
    "Ural Mountains radioactive releases",
    "Missing nuclear weapons",
    "Breeder reactor theory",
    "Cross-section theory",
    "Bethe-Weizsäcker semi-empirical mass formula",
    "Nuclear shell model",
    "Liquid-drop model",
    "Collective nuclear models",
    "Volcanic degassing",
    "Comets",
    "Five major oceans",
    "Ocean layers",
    "Hydrothermal vents",
    "Mariana Trench",
    "Abyssal plains",
    "Cambrian explosion",
    "Deep-sea gigantism",
    "Bioluminescence",
    "Extremophile organisms",
    "Colossal squid",
    "Marine snow",
    "The Challenger Expedition",
    "Jacques Cousteau",
    "Alvin submersible",
    "Trieste submersible",
    "James Cameron submersibles",
    "Titanic shipwreck",
    "Lusitania sinking",
    "The Bloop",
    "Deepwater Horizon disaster",
    "Poseidon mythology",
    "Njord mythology",
    "Tiamat mythology",
    "Mermaid folklore",
    "Siren folklore",
    "Kraken mythology",
    "Cthulhu mythos",
    "Bermuda Triangle",
    "Maritime superstitions",
    "Submarine warfare",
    "Submarine stealth technology",
    "False ocean discoveries",
    "Lake Baikal anomaly",
    "Freshwater cryptids",
    "Ocean cryptids",
    "Brine pools",
    "Oceanic disappearances",
    "Cannibalistic crabs",
    "Goblin shark",
    "Deep-sea dragonfish",
    "Gulper eel",
    "Barreleye fish",
    "Angler fish",
    "Football fish",
    "Deepstaria jellyfish",
    "Comb jellies",
    "Vampire squid",
    "Firework jellyfish",
    "Yeti crab",
    "Giant isopod",
    "Ghost shrimp",
    "Oarfish",
    "Hagfish",
    "Mantis shrimp",
    "Blobfish",
    "Leafy sea dragon",
    "Siphonophores",
    "Giant tube worms",
    "Blue whale",
    "Orca biology",
    "Orca psychology",
    "Orca ecotypes",
    "Sperm whale",
    "Greenland shark",
    "Dolphin species",
    "Dumbo octopus",
    "Blue-ringed octopus",
    "Blanket octopus",
    "Box jellyfish",
    "Cone snail",
    "Stonefish",
    "Sarcastic fringehead",
    "Stargazer fish",
    "Tripod fish",
    "Parrotfish",
    "Frilled shark",
    "Cookiecutter shark",
    "Wobbegong sharks",
    "Megamouth shark",
    "Narwhal biology",
    "Humpback whale",
    "Ocean sunfish (Mola mola)",
    "Beluga whales",
    "Sea lions",
    "Seal species",
    "Tardigrades",
    "Radiolarians",
    "Spinosaurus",
    "Dunkleosteus",
    "Cladoselache",
    "Helicoprion",
    "Mosasaurus",
    "Pliosaurus",
    "Elasmosaurus",
    "Ichthyosaurus",
    "Dimetrodon",
    "Diplocaulus",
    "Sarcosuchus",
    "Deinosuchus",
    "Purussaurus",
    "Baryonyx",
    "Suchomimus",
    "Jaekelopterus",
    "Pakicetus",
    "Ambulocetus",
    "Indohyus",
    "Platyhystrix",
    "Inflation theory",
    "Supernovae",
    "Neutron stars",
    "Black holes",
    "Quasars",
    "Hypothetical stars",
    "Globular clusters",
    "Gas giants",
    "Ice giants",
    "Rogue planets",
    "Hot Jupiters",
    "Exoplanets",
    "Asteroid impacts",
    "Gamma-ray bursts",
    "Magnetars",
    "Solar flares",
    "Spaghettification",
    "Time dilation",
    "Wormholes",
    "Multiverse theories",
    "Quantum foam",
    "Entropy",
    "Voyager program",
    "ISS research",
    "Mars missions",
    "Boltzmann brains",
    "The Great Filter",
    "Dyson spheres",
    "The simulation hypothesis",
    "The anthropic principle",
    "The dark forest theory",
    "Many-worlds interpretation",
    "Block universe theory",
    "Eternal recurrence",
    "Quantum immortality",
    "Holographic principle",
    "Retrocausality",
    "Panspermia",
    "Gaia hypothesis",
    "The hard problem of consciousness",
    "Integrated Information Theory (IIT)",
    "The Omega Point",
    "Vacuum decay",
    "False vacuum collapse",
    "Matrioshka brain",
    "The Thanatos drive",
    "Terror management theory",
    "The uncanny valley",
    "Learned helplessness",
    "Depersonalization and derealization",
    "Existential psychopathology",
    "Cognitive dissonance",
    "The Lucifer Effect",
    "Banality of evil",
    "Shadow integration (Jung)",
    "The Bluebeard archetype",
    "The Milgram obedience study",
    "The Stanford prison experiment",
    "Capgras delusion",
    "Cotard's syndrome",
    "Alien hand syndrome",
    "Synesthesia-psychosis overlap",
    "Call of the void (L’appel du vide)",
    "The horror of hyperempathy",
    "Existential isolation",
    "Death positivity movement",
    "Trauma theory",
    "Strain theory",
    "1973 Mount Gambier cave diving accident",
    "Uranium miners and mortality",
    "Child miners",
    "Nutty Putty cave disaster",
    "Lost line cave diving phenomenon",
    "Rescue impossibility in caves",
    "Sheck Exley at Zacatón",
    "Agnes Milowka in Tank Cave",
    "Dave Shaw at Bushman’s Hole",
    "Pluragrotta Norway cave accident",
    "Ian Plant Bull Pot accident",
    "Tri-State tornado",
    "Daulatpur–Saturia tornado",
    "El Reno tornado",
    "Jarrell tornado",
    "Joplin tornado",
    "Bridge Creek–Moore tornado",
    "The Super Outbreak tornadoes",
    "Andover tornado outbreak",
    "Catatumbo lightning",
    "Ball lightning",
    "Volcano lightning",
    "Superbolt lightning events",
    "Roy Sullivan lightning strikes",
    "Great Blizzard of 1888",
    "Sundogs",
    "Green flash phenomenon",
    "Brocken spectre",
    "Mammatus clouds",
    "Lenticular clouds",
    "Morning Glory clouds",
    "Volcanic winter",
    "Blood rain",
    "Firestorms",
    "Rogue waves",
    "Lake Nyos limnic eruption",
    "Waterspouts",
    "Boiling River of Peru",
    "Brinicles",
    "Polar vortex",
    "Aurora borealis",
    "Democritus",
    "John Dalton 1803",
    "J.J. Thomson 1897",
    "Ernest Rutherford",
    "Niels Bohr",
    "Erwin Schrödinger",
    "Henri Becquerel",
    "Marie and Pierre Curie",
    "James Chadwick 1932",
    "Enrico Fermi 1934",
    "SL-1 accident",
    "Kyshtym disaster",
    "Windscale fire",
    "Chernobyl disaster",
    "Tokaimura accident",
    "Lucens reactor incident",
    "Soreq accident",
    "San Juan de Dios hospital incident",
    "Tammiku accident",
    "Samut Prakan radiation accident",
    "Church Rock spill",
    "Kramatorsk accident",
    "Idaho Falls waste drum accident",
    "Acerinox spill",
    "Moroccan radiation accident 1984",
    "Henan mine radiation exposure",
    "Soviet submarine K-431 incident",
    "Western Australia capsule incident",
    "Missing nuclear weapons",
    "Sundial nuclear weapon",
    "The Trinity tests",
    "Mold becoming antibiotics",
    "Linguistics",
    "UFO sightings",
    "Animal psychology",
    "Synthetic human body parts",
    "Radiation hormesis (as a concept)",
    "How nuclear reactors work"
  ];

  const radioactiveLinks = [
    "https://www.world-nuclear.org/",
    "https://www.nrc.gov/reading-rm/basic-ref/students.html",
    "https://www.iaea.org/newscenter",
    "https://www.nrc.gov/reactors/power.html",
    "https://inis.iaea.org/search/",
    "https://www.epa.gov/radiation",
    "https://www.energy.gov/ne/articles",
    "https://www.unscear.org/"
  ];

  // ---- Timer ----
  let start = Date.now();
  setInterval(() => {
    const elapsed = Math.floor((Date.now() - start) / 1000);
    document.getElementById("timer").textContent = `Time wasted: ${elapsed}s`;
  }, 1000);

  // ---- Click counter ----
  let clicks = parseInt(localStorage.getItem("clicks")) || 0;
  document.getElementById("clicks").textContent = `Bubbles burst: ${clicks}`;

  // ---- Sound preference ----
  let soundEnabled = JSON.parse(localStorage.getItem("soundEnabled") || "true");
  if (soundToggle) {
    soundToggle.checked = soundEnabled;

    soundToggle.addEventListener("change", () => {
      soundEnabled = soundToggle.checked;
      localStorage.setItem("soundEnabled", soundEnabled);
    });
  }

  // ---- Audio setup ----
  const sounds = [
    "sounds/bubblesound1.mp3", "sounds/bubblesound2.mp3",
    "sounds/bubblesound3.mp3", "sounds/bubblesound4.mp3",
    "sounds/bubblesound5.mp3", "sounds/bubblesound6.mp3",
    "sounds/bubblesound7.mp3", "sounds/bubblesound8.mp3"
  ];
  const whaleSound = "sounds/whalesounds.mp3";

  function playSound(file) {
    if (!soundEnabled) return;
    const audio = new Audio(file);
    audio.volume = 0.8;
    audio.play().catch(err => console.warn("Audio blocked:", err));
  }

  // ---- Whale event ----
  function triggerWhaleEvent() {
    whaleOverlay.classList.add("active");
    playSound(whaleSound);

    // flood the screen with bubbles
    spawnBubbles(bubblesContainer, 60);
    document.body.style.background =
      "linear-gradient(180deg, #001a33, #00101f)";

    setTimeout(() => {
      whaleOverlay.classList.remove("active");
      document.body.style.background =
        "linear-gradient(180deg, #a3e7ff, #6ec3ff)";
    }, 4000);
  }

  // EXPOSE for console testing
  window.triggerWhaleEvent = triggerWhaleEvent;

  // ---- Deep Dive Toggle (NEW) ----
  const applyDeepDiveTheme = active => {
    document.body.classList.toggle("deep-dive", active);
  };
  const applyNuclearTheme = active => {
    document.body.classList.toggle("nuclear-mode", active);
  };
  const deepDiveToggle = document.getElementById("deepdive-toggle");
  const nuclearToggle = document.getElementById("nuclear-toggle");
  applyDeepDiveTheme(deepDiveMode);
  applyNuclearTheme(nuclearMode);
  if (deepDiveToggle) {
    deepDiveToggle.checked = deepDiveMode;

    deepDiveToggle.addEventListener("change", () => {
      deepDiveMode = deepDiveToggle.checked;
      localStorage.setItem("deepDiveMode", deepDiveMode);
      applyDeepDiveTheme(deepDiveMode);
    });
  }
  if (nuclearToggle) {
    nuclearToggle.checked = nuclearMode;

    nuclearToggle.addEventListener("change", () => {
      nuclearMode = nuclearToggle.checked;
      localStorage.setItem("nuclearMode", nuclearMode);
      applyNuclearTheme(nuclearMode);
    });
  }

  // ---- Main click ----
  logo?.addEventListener("click", () => {
    clicks++;
    localStorage.setItem("clicks", clicks);
    document.getElementById("clicks").textContent =
      `Bubbles burst: ${clicks}`;

    if (deepDiveMode) {
      showTopicOverlay();
      return;
    }

    if (nuclearMode) {
      showNuclearOverlay();
      return;
    }

    if (clicks % 100 === 0) {
      triggerWhaleEvent();
    } else {
      const soundSrc = sounds[Math.floor(Math.random() * sounds.length)];
      playSound(soundSrc);
      spawnBubbles(bubblesContainer, 12);
    }

    const filtered = noItch.checked
      ? links.filter(l => !l.includes("itch.io"))
      : links;
    const randomLink = filtered[Math.floor(Math.random() * filtered.length)];

    if (randomLink) {
      latestLink = randomLink;
      addFavBtn.textContent = defaultFavBtnLabel;
      addFavBtn.classList.remove("saved", "duplicate");
      if (favBtnResetTimer) {
        clearTimeout(favBtnResetTimer);
        favBtnResetTimer = null;
      }
      window.open(randomLink, "_blank");
    }
  });

  // ---- Footer icon link ----
  footerIcon?.addEventListener("click", () => {
    window.open("https://github.com/ratioactivity/BubbleWarp", "_blank");
  });

  // ---- Idle bubbles ----
  if (bubblesContainer) {
    spawnBubbles(bubblesContainer, 8, true);
    setInterval(() => spawnBubbles(bubblesContainer, 2, true), 1200);
  }

  // ---- Finternet Favorites System ----

  // Load favorites from localStorage
  let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  renderFavorites();

  function renderFavorites() {
    favoritesList.innerHTML = "";
    if (favorites.length === 0) {
      favoritesList.innerHTML = "<li>No favorites yet — go exploring!</li>";
      return;
    }
    favorites.forEach(url => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = url;
      a.textContent = url.replace("https://", "").replace("http://", "");
      a.target = "_blank";

      const remove = document.createElement("span");
      remove.textContent = "✖";
      remove.className = "remove-favorite";
      remove.addEventListener("click", () => {
        favorites = favorites.filter(f => f !== url);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        renderFavorites();
      });

      li.appendChild(a);
      li.appendChild(remove);
      favoritesList.appendChild(li);
    });
  }

  favoritesBtn.addEventListener("click", () => {
    favoritesOverlay.classList.add("active");
  });

  closeFavorites.addEventListener("click", () => {
    favoritesOverlay.classList.remove("active");
  });

  // Add manual add button handler
  addFavBtn.addEventListener("click", () => {
    if (!latestLink) {
      addFavBtn.textContent = "Open a link first";
      addFavBtn.classList.remove("saved");
      addFavBtn.classList.add("duplicate");
      if (favBtnResetTimer) clearTimeout(favBtnResetTimer);
      favBtnResetTimer = setTimeout(() => {
        addFavBtn.textContent = defaultFavBtnLabel;
        addFavBtn.classList.remove("duplicate");
        favBtnResetTimer = null;
      }, 2200);
      return;
    }

    if (!favorites.includes(latestLink)) {
      favorites.push(latestLink);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      renderFavorites();
      addFavBtn.textContent = "⭐ Saved to favorites!";
      addFavBtn.classList.remove("duplicate");
      addFavBtn.classList.add("saved");
    } else {
      addFavBtn.textContent = "Already in favorites";
      addFavBtn.classList.remove("saved");
      addFavBtn.classList.add("duplicate");
    }

    if (favBtnResetTimer) clearTimeout(favBtnResetTimer);
    favBtnResetTimer = setTimeout(() => {
      addFavBtn.textContent = defaultFavBtnLabel;
      addFavBtn.classList.remove("saved", "duplicate");
      favBtnResetTimer = null;
    }, 2200);
  });

  // ---- Menu Modal ----
  function toggleMenu(open) {
    if (!menuModal) return;
    menuModal.classList.toggle("open", open);
    menuModal.setAttribute("aria-hidden", open ? "false" : "true");
  }

  function activateMenuTab(tabName) {
    menuTabs.forEach(tab => {
      tab.classList.toggle("active", tab.dataset.tab === tabName);
    });
    menuPanels.forEach(panel => {
      panel.classList.toggle("active", panel.dataset.panel === tabName);
    });
  }

  function renderMenuSection(container, items, linkFactory, labelFactory) {
    if (!container) return;
    container.innerHTML = "";
    items.forEach(item => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      const href = linkFactory(item);
      a.href = href;
      a.target = "_blank";
      a.textContent = labelFactory(item);
      li.appendChild(a);
      container.appendChild(li);
    });
  }

  if (
    menuButton &&
    menuModal &&
    menuBackdrop &&
    menuClose &&
    menuTabs.length &&
    menuPanels.length &&
    menuNormalList &&
    menuDeepDiveList &&
    menuRadioactiveList
  ) {
    renderMenuSection(
      menuNormalList,
      Array.isArray(links) ? links : [],
      item => item,
      item => item.replace(/^https?:\/\//, "")
    );
    renderMenuSection(
      menuDeepDiveList,
      topics,
      topic => `https://www.google.com/search?q=${encodeURIComponent(topic)}`,
      topic => topic
    );
    renderMenuSection(
      menuRadioactiveList,
      radioactiveLinks,
      item => item,
      item => item.replace(/^https?:\/\//, "")
    );

    menuButton.addEventListener("click", () => toggleMenu(true));
    menuClose.addEventListener("click", () => toggleMenu(false));
    menuBackdrop.addEventListener("click", () => toggleMenu(false));
    menuTabs.forEach(tab => {
      tab.addEventListener("click", () => activateMenuTab(tab.dataset.tab));
    });
  }

// ---- Bubble animation ----
function spawnBubbles(container, count, idle = false) {
  for (let i = 0; i < count; i++) {
    const bubble = document.createElement("img");
    const n = Math.ceil(Math.random() * 7);
    bubble.src = `assets/bubble${n}.png`;
    bubble.className = "bubble";
    bubble.style.left = `${Math.random() * 100}%`;
    bubble.style.animationDuration = `${3 + Math.random() * 5}s`;
    bubble.style.width = `${10 + Math.random() * 30}px`;
    container.appendChild(bubble);
    setTimeout(() => bubble.remove(), 8000);
  }
}

  console.log("✅ script validated");
});
