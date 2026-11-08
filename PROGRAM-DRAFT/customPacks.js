// ================================================
// 🎴 CUSTOM PACK DEFINITIONS v2.3 — THREE SPECIAL WORLDS
// ================================================
// Custom Packs V2 — taxonomy cleanup.
// Player-facing taxonomy is unified across Settings and Encyclopedia.
// Short pools intentionally fall back to random legal cards from the global database.

const customPackCategories = {
    mechanic: {
        name: "MECHANICZNE",
        description: "Szerokie światy oparte na mechanikach i typach zdolności.",
        icon: "⚙"
    },
    archetype: {
        name: "ARCHETYPOWE",
        description: "Rodziny talii i archetypów deckbuildingowych.",
        icon: "◇"
    },
    thematic: {
        name: "TEMATYCZNE",
        description: "Drużyny, uniwersa, postacie i motywy fabularne.",
        icon: "✦"
    },
    statistics: {
        name: "STATYSTYKI KART",
        description: "Paczki oparte na Koszcie, Sile i profilach statystyk kart.",
        icon: "Σ"
    },
    world: {
        name: "ŚWIATY KONTRASTÓW",
        description: "Dwa przeciwstawne ekosystemy połączone w jednej paczce.",
        icon: "⇄"
    },
    msp_history: {
        name: "HISTORIA I STATYSTYKI MSP",
        description: "Jubileusze, zwycięskie decki i dynamiczne dane z historii MSP SnapDraft.",
        icon: "★"
    },
    special: {
        name: "SPECJALNE",
        description: "Nietypowe generatory, mieszane konstrukcje i losowe reguły.",
        icon: "🎲"
    }
};

const customPacks = [
    // ================================================================
    // HISTORY / ARCHIVE
    // ================================================================
    {
        id: "legendary_thirty",
        name: "LEGENDARNA TRZYDZIESTKA ✦",
        category: "msp_history", packType: "msp_history",
        summary: "30 najbardziej utytułowanych kart w historii MSP SnapDraft według Punktów Legend.",
        poolSource: { kind: "legend-top-cards", limit: 30 },
        shortPoolPolicy: "random"
    },
    {
        id: "archive_most_drafted_30",
        name: "ULUBIEŃCY KRONIK · TOP 30 📜",
        category: "msp_history", packType: "msp_history",
        summary: "30 kart najczęściej występujących w deckach ukończonych draftów MSP (Main Deck + Planetarna Rezerwa). Ranking aktualizuje się wraz z archiwum.",
        poolSource: { kind: "archive-most-drafted", limit: 30 },
        shortPoolPolicy: "random"
    },
    {
        id: "jubilee_1_2",
        name: "JUBILEUSZ DRAFT 1 & 2 - Hahke & Dejwidgakure",
        category: "msp_history", packType: "msp_history",
        summary: "Karty ze zwycięskich decków Draftów 1 i 2.",
        tags: ["wind1", "wind2"], shortPoolPolicy: "random"
    },
    {
        id: "jubilee_3_4",
        name: "JUBILEUSZ DRAFT 3 & 4 - kb & Dejwidgakure",
        category: "msp_history", packType: "msp_history",
        summary: "Karty ze zwycięskich decków Draftów 3 i 4.",
        tags: ["wind3", "wind4"], shortPoolPolicy: "random"
    },
    {
        id: "jubilee_5_6",
        name: "JUBILEUSZ DRAFT 5 & 6 - Xevo & kb",
        category: "msp_history", packType: "msp_history",
        summary: "Karty ze zwycięskich decków Draftów 5 i 6.",
        tags: ["wind5", "wind6"], shortPoolPolicy: "random"
    },
    {
        id: "jubilee_7_8",
        name: "JUBILEUSZ DRAFT 7 & 8 - Marek & Jacusinski",
        category: "msp_history", packType: "msp_history",
        summary: "Karty ze zwycięskich decków Draftów 7 i 8.",
        tags: ["wind7", "wind8"], shortPoolPolicy: "random"
    },
    {
        id: "jubilee_9_10",
        name: "JUBILEUSZ DRAFT 9 & 10 - Jacusinski & Hardkor",
        category: "msp_history", packType: "msp_history",
        summary: "Karty ze zwycięskich decków Draftów 9 i 10.",
        tags: ["wind9", "wind10"], shortPoolPolicy: "random"
    },
    {
        id: "jubilee_11_12",
        name: "JUBILEUSZ DRAFT 11 & 12 - Raciatek & Polop852",
        category: "msp_history", packType: "msp_history",
        summary: "Karty ze zwycięskich decków Draftów 11 i 12.",
        tags: ["wind11", "wind12"], shortPoolPolicy: "random"
    },
    {
        id: "jubilee_13_14",
        name: "JUBILEUSZ DRAFT 13 & 14 - Supcio & Dejwidgakure",
        category: "msp_history", packType: "msp_history",
        summary: "Karty ze zwycięskich decków Draftów 13 i 14.",
        tags: ["wind13", "wind14"], shortPoolPolicy: "random"
    },
    {
        id: "jubilee_15_16",
        name: "JUBILEUSZ DRAFT 15 & 16 - Supcio & Weregesu",
        category: "msp_history", packType: "msp_history",
        summary: "Karty ze zwycięskich decków Draftów 15 i 16.",
        tags: ["wind15", "wind16"], shortPoolPolicy: "random"
    },
    {
        id: "jubilee_17_18",
        name: "JUBILEUSZ DRAFT 17 & 18 - Supcio & Kmythic",
        category: "msp_history", packType: "msp_history",
        summary: "Karty ze zwycięskich decków Draftów 17 i 18.",
        tags: ["wind17", "wind18"], shortPoolPolicy: "random"
    },
    {
        id: "jubilee_19",
        name: "JUBILEUSZ DRAFT 19 - Dejwidgakure",
        category: "msp_history", packType: "msp_history",
        summary: "Karty ze zwycięskiego decku Draftu 19.",
        tags: ["wind19"], shortPoolPolicy: "random"
    },
    {
        id: "jubilee_2_5",
        name: "JUBILEUSZ DRAFT 2 & 5 - Dejwidgakure & Xevo",
        category: "msp_history", packType: "msp_history",
        summary: "Karty ze zwycięskich decków Draftów 2 i 5.",
        tags: ["wind5", "wind2"], shortPoolPolicy: "random"
    },

    // ================================================================
    // CLASSIC MECHANICS / THEMES / STATS
    // ================================================================
    {
        id: "avengers_pack", name: "AVENGERS ASSEMBLE! 🅰️",
        category: "thematic", packType: "thematic",
        summary: "Avengers, New Avengers, West Coast Avengers, Dark Avengers i Young Avengers.",
        tags: ["avengers", "new-avengers", "west-coast-avengers", "dark-avengers", "young-avengers"],
        shortPoolPolicy: "random"
    },
    {
        id: "low_cost", name: "LOW COST",
        category: "statistics", packType: "statistics",
        summary: "Wyłącznie karty o Koszcie od 0 do 2.",
        minCost: 0, maxCost: 2, shortPoolPolicy: "random"
    },
    {
        id: "tanie_mocne", name: "TANIE & MOCNE",
        category: "statistics", packType: "statistics",
        summary: "Karty za 2–3 o Sile co najmniej 5.",
        minCost: 2, maxCost: 3, minPower: 5, shortPoolPolicy: "random"
    },
    {
        id: "zoo_pack", name: "ZOO PACK",
        category: "archetype", packType: "archetype",
        summary: "Karty należące do archetypu Zoo — prawdziwy deckowy ekosystem Zoo.",
        tags: ["zoo"], shortPoolPolicy: "random"
    },
    {
        id: "card_gen_pack", name: "PACZKA GENERATORÓW",
        category: "mechanic", packType: "mechanic",
        summary: "Karty tworzące inne karty albo bezpośrednio wspierające generowanie kart.",
        tags: ["card-generation"], shortPoolPolicy: "random"
    },
    {
        id: "colorful_heroes", name: "COLORFUL HEROES 🌈",
        category: "thematic", packType: "thematic",
        summary: "Bohaterowie, których nazwy noszą kolory: Red, Black, Blue, Green, Yellow, Scarlet lub White.",
        filter: {
            nameTokensAny: ["red", "black", "blue", "green", "yellow", "yellowjacket", "scarlet", "white"]
        },
        shortPoolPolicy: "random"
    },
    {
        id: "spider_pack", name: "PACZKA SPIDERVERSE 🕷️",
        category: "thematic", packType: "thematic",
        summary: "Postacie i karty należące do Spider-Verse.",
        tags: ["spider-verse"], shortPoolPolicy: "random"
    },
    {
        id: "on_reveal_party", name: "REVEAL PARTY ✨",
        category: "mechanic", packType: "mechanic",
        summary: "Paczka zbudowana wokół kart On Reveal.",
        tags: ["on-reveal"], shortPoolPolicy: "random"
    },
    {
        id: "new_era_abilities",
        name: "NOWA ERA · ACTIVATE / OBJECTIVE / QUICKDRAW ⚡",
        category: "mechanic", packType: "mechanic",
        summary: "Karty z przynajmniej jednym z trzech typów zdolności: Activate, Objective albo Quickdraw. Bez On Reveal / Ongoing jako dodatkowego wymogu.",
        filter: { tags: { anyOf: ["activate", "objective", "quickdraw"] } },
        shortPoolPolicy: "random"
    },
    {
        id: "ongoing_forever", name: "ONGOING FOREVER ♾️",
        category: "mechanic", packType: "mechanic",
        summary: "Paczka zbudowana wokół kart Ongoing.",
        tags: ["ongoing"], shortPoolPolicy: "random"
    },
    {
        id: "trigger_happy", name: "TRIGGER HAPPY 💥",
        category: "mechanic", packType: "mechanic",
        summary: "Karty z Ability Type Trigger Card.",
        tags: ["trigger-card"], shortPoolPolicy: "random"
    },
    {
        id: "destroy_everything", name: "DESTROY EVERYTHING 💀",
        category: "mechanic", packType: "mechanic",
        summary: "Szeroki ekosystem mechaniki Destroy.",
        tags: ["destroy"], shortPoolPolicy: "random"
    },
    {
        id: "move_it", name: "MOVE IT! 🌀",
        category: "mechanic", packType: "mechanic",
        summary: "Szeroki ekosystem mechaniki Move.",
        tags: ["move"], shortPoolPolicy: "random"
    },
    {
        id: "control_room", name: "CONTROL ROOM 🚨",
        category: "mechanic", packType: "mechanic",
        summary: "Tech, Lockdown i Clog — szeroka paczka kontroli.",
        tags: ["tech", "lockdown", "clog"], shortPoolPolicy: "random"
    },
    {
        id: "cosmic_casino", name: "COSMIC CASINO 🎰",
        category: "special", packType: "special",
        summary: "Kontrolowana mieszanka Card Generation i Random Card Pool.",
        composition: {
            mode: "weighted", shuffleBuckets: true,
            buckets: [
                { id: "card_generation", label: "CARD GENERATION", weight: 1, filter: { tags: { allOf: ["card-generation"] } } },
                { id: "random_card_pool", label: "RANDOM CARD POOL", weight: 1, filter: { tags: { allOf: ["random-card-pool"] } } }
            ]
        },
        shortPoolPolicy: "random"
    },
    {
        id: "big_boys", name: "BIG BOYS 💪",
        category: "statistics", packType: "statistics",
        summary: "Wyłącznie karty o Sile co najmniej 8.",
        minPower: 8, shortPoolPolicy: "random"
    },
    {
        id: "heavy_metal", name: "HEAVY METAL 🔨",
        category: "statistics", packType: "statistics",
        summary: "Ciężkie karty o Koszcie co najmniej 5.",
        minCost: 5, shortPoolPolicy: "random"
    },
    {
        id: "cosmic_horror", name: "COSMIC HORROR 🌌",
        category: "thematic", packType: "thematic",
        summary: "Kosmiczne byty i potwory.",
        tags: ["cosmic-entities", "monsters"], shortPoolPolicy: "random"
    },
    {
        id: "villain_pack", name: "VILLAIN PACK 😈",
        category: "thematic", packType: "thematic",
        summary: "Złoczyńcy Marvela.",
        tags: ["villains"], shortPoolPolicy: "random"
    },
    {
        id: "robots_cyborgs", name: "ROBOTS & CYBORGS 🤖",
        category: "thematic", packType: "thematic",
        summary: "Roboty, androidy i cyborgi w jednym technologicznym świecie.",
        tags: ["robots-cyborgs"], shortPoolPolicy: "random"
    },
    {
        id: "symbiote_invasion", name: "SYMBIOTE INVASION 🖤",
        category: "thematic", packType: "thematic",
        summary: "Symbionty i postacie związane z symbiotami.",
        tags: ["symbiotes"], shortPoolPolicy: "random"
    },
    {
        id: "x_family_pack", name: "X-FAMILY ❌",
        category: "thematic", packType: "thematic",
        summary: "X-Men, X-Force i New Mutants w jednej wspólnej puli.",
        tags: ["xmen", "x-force", "new-mutants"], shortPoolPolicy: "random"
    },
    {
        id: "beast_mode", name: "BEAST MODE 🐾",
        category: "thematic", packType: "thematic",
        summary: "Łączy prawdziwe Animals i postacie inspirowane zwierzętami.",
        filter: { tags: { anyOf: ["animals", "animal-themed"] } },
        shortPoolPolicy: "random"
    },

    // ================================================================
    // STRUCTURAL / REWORKED WORLDS
    // ================================================================
    {
        id: "arcane_academy", name: "ARCANE ACADEMY 🪄",
        category: "thematic", packType: "thematic",
        summary: "Magowie oraz ekosystem Skills: nauczyciele, tanie sztuczki i cięższe narzędzia.",
        composition: {
            mode: "weighted", shuffleBuckets: true,
            buckets: [
                { id: "magicians", label: "MAGICIANS", weight: 2, filter: { tags: { allOf: ["magicians"] } } },
                { id: "cheap_skills", label: "SKILLS · COST 0–2", weight: 1, filter: { tags: { allOf: ["skills"], noneOf: ["magicians"] }, cost: { max: 2 } } },
                { id: "advanced_skills", label: "SKILLS · COST 3+", weight: 1, filter: { tags: { allOf: ["skills"], noneOf: ["magicians"] }, cost: { min: 3 } } }
            ]
        },
        shortPoolPolicy: "random"
    },
    {
        id: "ground_zero", name: "GROUND ZERO 0️⃣",
        category: "statistics", packType: "statistics",
        summary: "Świat zbudowany wokół zera: 0-Cost i 0-Power.",
        composition: {
            mode: "cycle", shuffleBuckets: false,
            buckets: [
                { id: "zero_cost", label: "0 COST", filter: { cost: { exact: 0 } } },
                { id: "zero_power", label: "0 POWER", filter: { power: { exact: 0 } } }
            ]
        },
        shortPoolPolicy: "random"
    },
    {
        id: "perfect_curve", name: "PERFECT CURVE 📈",
        category: "statistics", packType: "statistics",
        summary: "Gwarantowana rotacja kosztów: 1 → 2 → 3 → 4 → 5 → 6+ i od początku.",
        composition: {
            mode: "cycle", shuffleBuckets: false,
            buckets: [
                { label: "COST 1", filter: { cost: { exact: 1 } } },
                { label: "COST 2", filter: { cost: { exact: 2 } } },
                { label: "COST 3", filter: { cost: { exact: 3 } } },
                { label: "COST 4", filter: { cost: { exact: 4 } } },
                { label: "COST 5", filter: { cost: { exact: 5 } } },
                { label: "COST 6+", filter: { cost: { min: 6 } } }
            ]
        },
        shortPoolPolicy: "random"
    },
    {
        id: "universal_pack", name: "SWISS ARMY PACK 🛠️",
        category: "archetype", packType: "archetype",
        summary: "Tylko wyjątkowo uniwersalne karty należące do co najmniej 3 archetypów.",
        filter: { tagCounts: [{ category: "deckArchetypes", min: 3 }] },
        shortPoolPolicy: "random"
    },
    {
        id: "ability_rainbow", name: "ABILITY RAINBOW 🌈",
        category: "mechanic", packType: "mechanic",
        summary: "Generator rotuje między różnymi Ability Types.",
        composition: { mode: "tag-rainbow", category: "abilityTypes", shuffleBuckets: true },
        shortPoolPolicy: "random"
    },
    {
        id: "archetype_rainbow", name: "ARCHETYPE RAINBOW 🧩",
        category: "archetype", packType: "archetype",
        summary: "Każdy kolejny slot pochodzi z innego archetypu; generator maksymalizuje różnorodność.",
        composition: { mode: "tag-rainbow", category: "deckArchetypes", shuffleBuckets: true },
        shortPoolPolicy: "random"
    },
    {
        id: "mechanic_rainbow", name: "MECHANIC RAINBOW ⚙️🌈",
        category: "mechanic", packType: "mechanic",
        summary: "Rotacja między różnymi Mechanic Families z aktualnego Tag Schema.",
        composition: { mode: "tag-rainbow", category: "mechanicFamilies", shuffleBuckets: true },
        shortPoolPolicy: "random"
    },

    // ================================================================
    // WORLDS OF CONTRAST
    // ================================================================
    {
        id: "world_power_paradox",
        name: "PARADOKS SIŁY · UNDERDOG vs OVERPOWER ⚖️",
        category: "world", packType: "world",
        summary: "Połowa kart ma Siłę mniejszą niż Koszt, a połowa Siłę co najmniej dwa razy większą od Kosztu (Koszt 1+). Proporcja 50/50.",
        composition: {
            mode: "weighted", shuffleBuckets: true,
            buckets: [
                { id: "underdog", label: "POWER < COST", weight: 1,
                  filter: { relations: [{ left: "power", operator: "<", right: "cost" }] } },
                { id: "overpower", label: "POWER ≥ 2× COST", weight: 1,
                  filter: { cost: { min: 1 }, relations: [{ left: "power", operator: ">=", right: "cost", rightMultiplier: 2 }] } }
            ]
        },
        shortPoolPolicy: "random"
    },
    {
        id: "world_buff_afflict", name: "BUFF vs AFFLICT ⚔️",
        category: "world", packType: "world",
        summary: "Połowa świata wzmacnia, druga połowa osłabia.",
        composition: {
            mode: "weighted", shuffleBuckets: true,
            buckets: [
                { id: "buff", label: "BUFF", weight: 1, filter: { tags: { allOf: ["buff"] } } },
                { id: "afflict", label: "AFFLICT", weight: 1, filter: { tags: { allOf: ["afflict"] } } }
            ]
        },
        shortPoolPolicy: "random"
    },
    {
        id: "world_destroy_discard", name: "DESTROY vs DISCARD ☠️",
        category: "world", packType: "world",
        summary: "Dwa sposoby poświęcania zasobów: Destroy kontra Discard.",
        composition: {
            mode: "weighted", shuffleBuckets: true,
            buckets: [
                { id: "destroy", label: "DESTROY", weight: 1, filter: { tags: { allOf: ["destroy"] } } },
                { id: "discard", label: "DISCARD", weight: 1, filter: { tags: { allOf: ["discard"] } } }
            ]
        },
        shortPoolPolicy: "random"
    },
    {
        id: "world_reveal_ongoing", name: "ON REVEAL vs ONGOING ♾️",
        category: "world", packType: "world",
        summary: "Jednorazowe odpalenia kontra efekty, które zostają na planszy.",
        composition: {
            mode: "weighted", shuffleBuckets: true,
            buckets: [
                { id: "reveal", label: "ON REVEAL", weight: 1, filter: { tags: { allOf: ["on-reveal"] } } },
                { id: "ongoing", label: "ONGOING", weight: 1, filter: { tags: { allOf: ["ongoing"] } } }
            ]
        },
        shortPoolPolicy: "random"
    },
    {
        id: "world_david_goliath", name: "DAVID vs GOLIATH 🪨",
        category: "world", packType: "world",
        summary: "Tani mali bohaterowie kontra wielkie staty.",
        composition: {
            mode: "weighted", shuffleBuckets: true,
            buckets: [
                { id: "david", label: "DAVID · COST 0–2", weight: 1, filter: { cost: { max: 2 } } },
                { id: "goliath", label: "GOLIATH · POWER 8+", weight: 1, filter: { power: { min: 8 } } }
            ]
        },
        shortPoolPolicy: "random"
    },
    {
        id: "world_glass_heavy", name: "GLASS CANNON vs HEAVY UTILITY 💣",
        category: "world", packType: "world",
        summary: "Tanie bomby o wysokiej Sile kontra drogie karty płacące za użyteczność zamiast statów.",
        composition: {
            mode: "weighted", shuffleBuckets: true,
            buckets: [
                { id: "glass", label: "GLASS CANNON", weight: 1, filter: { cost: { max: 3 }, power: { min: 6 } } },
                { id: "utility", label: "HEAVY UTILITY", weight: 1, filter: { cost: { min: 5 }, power: { max: 4 } } }
            ]
        },
        shortPoolPolicy: "random"
    },

    // ================================================================
    // ARCHETYPE FAMILIES — related deck tags share one Custom Pack world
    // ================================================================
    {
        id: "archetype_destroy", name: "DESTROY ARCHETYPES 💀",
        category: "archetype", packType: "archetype",
        summary: "Classic Destroy i Destroy Combo w jednym świecie.",
        filter: { tags: { anyOf: ["classic-destroy", "destroy-combo"] } },
        shortPoolPolicy: "random"
    },
    {
        id: "archetype_discard", name: "DISCARD ARCHETYPES 🗑️",
        category: "archetype", packType: "archetype",
        summary: "Classic Discard oraz Hela Discard.",
        filter: { tags: { anyOf: ["classic-discard", "hela-discard"] } },
        shortPoolPolicy: "random"
    },
    {
        id: "archetype_ongoing", name: "ONGOING ARCHETYPES ♾️",
        category: "archetype", packType: "archetype",
        summary: "Spectrum Ongoing oraz Tribunal Ongoing.",
        filter: { tags: { anyOf: ["spectrum-ongoing", "tribunal-ongoing"] } },
        shortPoolPolicy: "random"
    },
    {
        id: "archetype_move", name: "MOVE ARCHETYPES 🌀",
        category: "archetype", packType: "archetype",
        summary: "Mini Movers, Move Combo oraz Scream / Opponent Move.",
        filter: { tags: { anyOf: ["mini-movers", "move-combo", "scream-opp-move"] } },
        shortPoolPolicy: "random"
    },
    {
        id: "archetype_control", name: "CONTROL ARCHETYPES 🚨",
        category: "archetype", packType: "archetype",
        summary: "Midrange Control, Prio Control, Sera Control i Lockdown.",
        filter: { tags: { anyOf: ["midrange-control", "prio-control", "sera-control", "lockdown"] } },
        shortPoolPolicy: "random"
    },
    {
        id: "archetype_buff", name: "BUFF ARCHETYPES ✨",
        category: "archetype", packType: "archetype",
        summary: "Small Buff / Bounce oraz Surfer / Buff.",
        filter: { tags: { anyOf: ["small-buff-bounce", "surfer-buff"] } },
        shortPoolPolicy: "random"
    },
    {
        id: "archetype_hand", name: "HAND ARCHETYPES 🃏",
        category: "archetype", packType: "archetype",
        summary: "Victoria Hand / Big Hand oraz She-Moon.",
        filter: { tags: { anyOf: ["victoria-hand-big-hand", "she-moon"] } },
        shortPoolPolicy: "random"
    },
    {
        id: "archetype_zombies", name: "ZOMBIE ARCHETYPES 🧟",
        category: "archetype", packType: "archetype",
        summary: "Zombie Galacti oraz Zombie Horde Combo.",
        filter: { tags: { anyOf: ["zombie-galacti", "zombie-horde-combo"] } },
        shortPoolPolicy: "random"
    },
    {
        id: "archetype_big_power", name: "NIGHTMARE / SKAAR 🦖",
        category: "archetype", packType: "archetype",
        summary: "Nightmare / Skaar — duże Power, Skaar, Surtur i payoffy wysokiej Siły.",
        filter: { tags: { anyOf: ["nightmare-skaar"] } },
        shortPoolPolicy: "random"
    },
    {
        id: "archetype_cost", name: "COST MANIPULATION ARCHETYPES 💸",
        category: "archetype", packType: "archetype",
        summary: "Pixie, Mister Negative oraz Ravonna / Agent Venom.",
        filter: { tags: { anyOf: ["pixie", "mister-negative", "ravonna-agent-venom"] } },
        shortPoolPolicy: "random"
    },
    {
        id: "archetype_reveal_combo", name: "REVEAL COMBO ARCHETYPES ✨",
        category: "archetype", packType: "archetype",
        summary: "Wong / On Reveal Combo oraz Hammer Bros.",
        filter: { tags: { anyOf: ["wongreveal", "hammer-bros"] } },
        shortPoolPolicy: "random"
    },
    {
        id: "archetype_end_turn", name: "END OF TURN COMBO ⏳",
        category: "archetype", packType: "archetype",
        summary: "Karty należące do poprawionego archetypu End of Turn Combo.",
        filter: { tags: { allOf: ["end-of-turn-combo"] } },
        shortPoolPolicy: "random"
    },

    // ================================================================
    // RANDOMIZE — first choose the world, then generate the whole pack
    // ================================================================
    {
        id: "random_archetype", name: "RANDOM ARCHETYPE 🎲",
        category: "special", packType: "special",
        summary: "Losuje jeden aktualny Deck Archetype i buduje całą paczkę z jego kart.",
        randomize: { kind: "deck-archetype", shortPoolPolicy: "random" },
        shortPoolPolicy: "random", randomEligible: false
    },
    {
        id: "random_cost", name: "KOSZTOWA RULETKA 🎲",
        category: "special", packType: "special",
        summary: "Losuje Cost 0, 1, 2, 3, 4, 5 albo 6+ i buduje z niego całą paczkę.",
        randomize: { kind: "cost", shortPoolPolicy: "random" },
        shortPoolPolicy: "random", randomEligible: false
    },
    {
        id: "random_mechanic", name: "RANDOM MECHANIC 🎲",
        category: "special", packType: "special",
        summary: "Losuje jedną aktualną Mechanic Family i zmienia ją w świat całej paczki.",
        randomize: { kind: "mechanic-family", shortPoolPolicy: "random" },
        shortPoolPolicy: "random", randomEligible: false
    },
    {
        id: "random_ability", name: "RANDOM ABILITY 🎲",
        category: "special", packType: "special",
        summary: "Losuje jeden Ability Type i buduje z niego całą paczkę.",
        randomize: { kind: "ability-type", shortPoolPolicy: "random" },
        shortPoolPolicy: "random", randomEligible: false
    },
    {
        id: "random_custom_pack", name: "RANDOM CUSTOM PACK 🎰",
        category: "special", packType: "special",
        summary: "Losuje dowolny normalny Custom Pack z registry i odpala jego prawdziwe zasady.",
        randomize: { kind: "custom-pack", allowMeta: false },
        shortPoolPolicy: "random", randomEligible: false
    }
];

window.CUSTOM_PACK_CATEGORIES = customPackCategories;
