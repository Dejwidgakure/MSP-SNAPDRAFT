/* ============================================================
   MSP SNAP DRAFT — JOKER CATALOG
   Version 3.30 — TAG + SEASON COVERAGE

   KANON RARITY:
   CHOICE
   - wartość rośnie wraz z szerokością, elastycznością i jakością puli,
   - Legendary = ogromny wybór albo wyjątkowa pula specjalna,
   - Epic = sensowna / jakościowa / specjalnie selekcjonowana pula,
   - zwykły Joker 1:1 oparty o Deck Archetype = Rare,
   - Rare = bardzo wąski, archetypowy albo mocno ograniczający wybór.

   SURPRISE
   - system pokazuje 3 losowe karty,
   - szeroka / chaotyczna pula obniża rarity,
   - mała, spójna, przewidywalna i jakościowa pula może być Epic,
   - Legendary pozostaje wyjątkiem dla wyjątkowych źródeł.

   v3.30:
   - domknięcie Antipolar Fours / Power Steal Combo / Werewolf Spells;
   - X-Force i Young Avengers jako samodzielne pule;
   - wybrane sezonowe Jokery Choice/Surprise i przekrojowe mieszanki sezonów;
   - Modes / Transform jako wariant odporniejszy na zbyt małą pulę.

   v3.29:
   - CREATIVE POOLS: stat-signature Jokers, hybrid tag pools and risk-only Surprise Jokers,
   - cross-filter OR groups power Zero to Hero, Szkoła Magii, Plan B and risk pools,
   - cheap utility variants added only where the pool remains distinct and healthy,
   - Heavy Brick tightened to Cost 5+ / Power <=2; Tania Gwiazda normalized to Rare.

   v3.28:
   - COVERAGE: pełne pary Choice + Surprise dla aktualnych tagów objętych Jokerami,
   - dodano Ongoing Self Power, Protection, Stat Check i She-Moon,
   - standardowe Jokery 1:1 Deck Archetype mają rarity Rare,
   - Skills: poprawiony wording oraz Choice -> Legendary; Magicians pozostaje osobną pulą,
   - Effect Replication: finalne nazwy Chciwość / Nigdy za wiele,
   - Revive Choice: Jak Feniks z Popiołów.

   v3.27:
   - CORE/FIX: katalog zsynchronizowany z Tag Schema V2 bez martwych filtrów,
   - legacy Text Copy / Effect Multiplier -> Effect Replication,
   - legacy Sauron/Skaar -> Nightmare/Skaar,
   - tagCounts korzystają z kategorii TAGS zamiast ręcznych list ID,
   - usunięto niezamierzone duplikaty definicji/puli oraz martwy Set Cost.

   v3.10:
   - audyt wszystkich Jokerów według osobnej logiki Choice / Surprise,
   - dodano Rare Choice dla dwóch celowo ograniczonych profili low-power,
     z odpowiadającymi im Epic Surprise,
   - wybrane bardzo wąskie Hybrid Choice -> Rare,
   - Cost Reduction Surprise i Heavy Brick Surprise -> Epic,
   - usunięto wszystkie duplikaty nazw UI,
   - Loki i Arishem nadal wykluczeni z banned-card Jokerów.
============================================================ */

const JOKER_CATALOG_VERSION = "3.30";

const jokers = [
  {
      "id": "choice_any_card",
      "type": "choice",
      "rarity": "legendary",
      "family": "special",
      "name": "Pełna Kontrola",
      "desc": "Dowolna karta",
      "sourceCategories": [
        "special"
      ]
    },
  {
      "id": "choice_cost_0_1",
      "type": "choice",
      "rarity": "legendary",
      "family": "statistics",
      "name": "Kieszonkowy As",
      "desc": "Dowolna karta · Koszt 0–1",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "min": 0,
          "max": 1
        }
      }
    },
  {
      "id": "choice_cost_2",
      "type": "choice",
      "rarity": "legendary",
      "family": "statistics",
      "name": "Podwójna Stawka",
      "desc": "Dowolna karta · Koszt 2",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "exact": 2
        }
      }
    },
  {
      "id": "choice_cost_3",
      "type": "choice",
      "rarity": "legendary",
      "family": "statistics",
      "name": "Trzeci Wymiar",
      "desc": "Dowolna karta · Koszt 3",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "exact": 3
        }
      }
    },
  {
      "id": "choice_cost_4",
      "type": "choice",
      "rarity": "legendary",
      "family": "statistics",
      "name": "Czwarty Filar",
      "desc": "Dowolna karta · Koszt 4",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "exact": 4
        }
      }
    },
  {
      "id": "choice_cost_5",
      "type": "choice",
      "rarity": "legendary",
      "family": "statistics",
      "name": "Piąty Element",
      "desc": "Dowolna karta · Koszt 5",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "exact": 5
        }
      }
    },
  {
      "id": "choice_cost_6_plus",
      "type": "choice",
      "rarity": "legendary",
      "family": "statistics",
      "name": "Klasa Omega",
      "desc": "Dowolna karta · Koszt 6+",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "min": 6
        }
      }
    },
  {
      "id": "choice_cost_0_3",
      "type": "choice",
      "rarity": "legendary",
      "family": "statistics",
      "name": "Niska Orbita",
      "desc": "Dowolna karta · Koszt 0–3",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "min": 0,
          "max": 3
        }
      }
    },
  {
      "id": "choice_cost_4_plus",
      "type": "choice",
      "rarity": "legendary",
      "family": "statistics",
      "name": "Ciężki Kaliber",
      "desc": "Dowolna karta · Koszt 4+",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "min": 4
        }
      }
    },
  {
    "id": "choice_power_0_or_less",
    "type": "choice",
    "rarity": "rare",
    "family": "statistics",
    "name": "Zero to Hero",
    "desc": "Dowolna karta · Koszt 0 lub Siła 0",
    "sourceCategories": [
      "statistics"
    ],
    "filter": {
      "orGroups": [
        {
          "cost": {
            "exact": 0
          }
        },
        {
          "power": {
            "exact": 0
          }
        }
      ]
    }
  },
  {
      "id": "choice_power_1_3",
      "type": "choice",
      "rarity": "epic",
      "family": "statistics",
      "name": "Niska Sygnatura",
      "desc": "Dowolna karta · Siła 1–3",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "power": {
          "min": 1,
          "max": 3
        }
      }
    },
  {
      "id": "choice_power_4_6",
      "type": "choice",
      "rarity": "epic",
      "family": "statistics",
      "name": "Stabilny Rdzeń",
      "desc": "Dowolna karta · Siła 4–6",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "power": {
          "min": 4,
          "max": 6
        }
      }
    },
  {
      "id": "choice_power_7_9",
      "type": "choice",
      "rarity": "epic",
      "family": "statistics",
      "name": "Wysoka Orbita",
      "desc": "Dowolna karta · Siła 7–9",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "power": {
          "min": 7,
          "max": 9
        }
      }
    },
  {
      "id": "choice_power_10_plus",
      "type": "choice",
      "rarity": "epic",
      "family": "statistics",
      "name": "Rdzeń Tytana",
      "desc": "Dowolna karta · Siła 10+",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "power": {
          "min": 10
        }
      }
    },
  {
      "id": "choice_power_3_or_less",
      "type": "choice",
      "rarity": "epic",
      "family": "statistics",
      "name": "Dolne Pasmo",
      "desc": "Dowolna karta · Siła 3 lub mniej",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "power": {
          "max": 3
        }
      }
    },
  {
      "id": "choice_power_7_plus",
      "type": "choice",
      "rarity": "epic",
      "family": "statistics",
      "name": "Kosmiczna Przewaga",
      "desc": "Dowolna karta · Siła 7+",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "power": {
          "min": 7
        }
      }
    },
  {
      "id": "choice_move",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Protokół Ruchu",
      "desc": "Dowolna karta · Move",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "move"
          ]
        }
      }
    },
  {
      "id": "choice_destroy",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Kontrolowana Destrukcja",
      "desc": "Dowolna karta · Destroy",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "destroy"
          ]
        }
      }
    },
  {
      "id": "choice_discard",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Wymiar Odrzutu",
      "desc": "Dowolna karta · Discard",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "discard"
          ]
        }
      }
    },
  {
      "id": "choice_bounce",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Powrót Kontrolowany",
      "desc": "Dowolna karta · Bounce",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "bounce"
          ]
        }
      }
    },
  {
      "id": "choice_afflict",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Skażenie Celowane",
      "desc": "Dowolna karta · Afflict",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "afflict"
          ]
        }
      }
    },
  {
      "id": "choice_on_reveal",
      "type": "choice",
      "rarity": "legendary",
      "family": "tag",
      "name": "Wielkie Odkrycie",
      "desc": "Dowolny On Reveal",
      "sourceCategories": [
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "on-reveal"
          ]
        }
      }
    },
  {
      "id": "choice_trigger_card",
      "type": "choice",
      "rarity": "legendary",
      "family": "tag",
      "name": "Spust Przeznaczenia",
      "desc": "Dowolny Trigger Card",
      "sourceCategories": [
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "trigger-card"
          ]
        }
      }
    },
  {
      "id": "choice_end_of_turn",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Koniec Zmiany",
      "desc": "Dowolna karta End of Turn",
      "sourceCategories": [
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "endofturn"
          ]
        }
      }
    },
  {
      "id": "choice_game_start",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Pierwszy Ruch",
      "desc": "Dowolna karta Game Start",
      "sourceCategories": [
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "gamestart"
          ]
        }
      }
    },
  {
      "id": "choice_moveable",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Wolna Orbita",
      "desc": "Dowolna karta Moveable",
      "sourceCategories": [
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "moveable"
          ]
        }
      }
    },
  {
      "id": "choice_no_ability",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Bohater bez mocy!",
      "desc": "Dowolna karta bez zdolności",
      "sourceCategories": [
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "no-ability"
          ]
        }
      }
    },
  {
      "id": "choice_objective",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Cel Misji",
      "desc": "Dowolna karta Objective",
      "sourceCategories": [
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "objective"
          ]
        }
      }
    },
  {
      "id": "choice_start_of_turn",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Pierwszy Impuls",
      "desc": "Dowolna karta Start of Turn",
      "sourceCategories": [
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "startofturn"
          ]
        }
      }
    },
  {
      "id": "choice_end_of_game",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Ostatnia Karta",
      "desc": "Dowolna karta End of Game",
      "sourceCategories": [
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "endofgame"
          ]
        }
      }
    },
  {
      "id": "choice_ongoing",
      "type": "choice",
      "rarity": "legendary",
      "family": "tag",
      "name": "Pętla Nieskończoności",
      "desc": "Dowolny Ongoing",
      "sourceCategories": [
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "ongoing"
          ]
        }
      }
    },
  {
      "id": "choice_activate",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Sekwencja Aktywacji",
      "desc": "Dowolny Activate",
      "sourceCategories": [
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "activate"
          ]
        }
      }
    },
  {
      "id": "choice_tech",
      "type": "choice",
      "rarity": "legendary",
      "family": "tag",
      "name": "Kontrśrodek",
      "desc": "Dowolna karta · Tech",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "tech"
          ]
        }
      }
    },
  {
      "id": "choice_location_control",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Kontrola Rzeczywistości",
      "desc": "Dowolna karta · Location",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "anyOf": [
            "location-control",
            "location-points"
          ]
        }
      }
    },
  {
      "id": "choice_spell",
      "type": "choice",
      "rarity": "legendary",
      "family": "tag",
      "name": "Arkana",
      "desc": "Dowolna karta · Skills",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "skills"
          ]
        }
      }
    },
  {
      "id": "choice_cost_reduction",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Tańsza Przyszłość",
      "desc": "Dowolna karta · Cost Reduction",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "cost-reduction"
          ]
        }
      }
    },
  {
      "id": "choice_transform",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Wybrana Forma",
      "desc": "Dowolna karta · Transform",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "transform"
          ]
        }
      }
    },
  {
      "id": "choice_revive",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Jak Feniks z Popiołów",
      "desc": "Dowolna karta · Revive",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "revive"
          ]
        }
      }
    },
  {
      "id": "choice_symbiotes",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Więź Symbionta",
      "desc": "Dowolna karta · Symbiotes",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "symbiotes"
          ]
        }
      }
    },
  {
      "id": "choice_magicians",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Krąg Magów",
      "desc": "Dowolna karta · Magicians",
      "sourceCategories": [
        "themes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "magicians"
          ]
        }
      }
    },
  {
      "id": "choice_animal",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Dziki Wybór",
      "desc": "Dowolna karta · Animals",
      "sourceCategories": [
        "themes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "animals"
          ]
        }
      }
    },
  {
      "id": "choice_animal_themed",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Zwierzęcy Motyw",
      "desc": "Dowolna karta · Animal Themed",
      "sourceCategories": [
        "themes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "animal-themed"
          ]
        }
      }
    },
  {
      "id": "choice_cardgen_card",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Kuźnia Kart",
      "desc": "Dowolna karta · Card Generation",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "card-generation"
          ]
        }
      }
    },
  {
      "id": "choice_on_reveal_low_cost",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Szybkie Odkrycie",
      "desc": "Dowolny On Reveal · Koszt maks. 2",
      "hybridType": "tag-stat",
      "sourceCategories": [
        "statistics",
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "on-reveal"
          ]
        },
        "cost": {
          "max": 2
        }
      }
    },
  {
      "id": "choice_destroy_high_power",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Ciężki Destroyer",
      "desc": "Dowolna karta · Destroy · Siła 7+",
      "hybridType": "tag-stat",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "destroy"
          ]
        },
        "power": {
          "min": 7
        }
      }
    },
  {
      "id": "choice_discard_low_cost",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Tani Odrzut",
      "desc": "Dowolny Discard · Koszt maks. 2",
      "hybridType": "tag-stat",
      "sourceCategories": [
        "statistics",
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "discard"
          ]
        },
        "cost": {
          "max": 2
        }
      }
    },
  {
      "id": "choice_ongoing_low_cost",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Mała Stała",
      "desc": "Dowolny Ongoing · Koszt maks. 2",
      "hybridType": "tag-stat",
      "sourceCategories": [
        "statistics",
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "ongoing"
          ]
        },
        "cost": {
          "max": 2
        }
      }
    },
  {
      "id": "choice_move_on_reveal",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Teleport Odkrycia",
      "desc": "Dowolny Move + On Reveal",
      "hybridType": "multi-tag-all",
      "sourceCategories": [
        "abilityTypes",
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "move",
            "on-reveal"
          ]
        }
      }
    },
  {
      "id": "choice_cheap_tech",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Tani Specjalista",
      "desc": "Dowolna karta · Tech · Koszt maks. 2",
      "hybridType": "tag-stat",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "tech"
          ]
        },
        "cost": {
          "max": 2
        }
      }
    },
  {
      "id": "surprise_any_card",
      "type": "surprise",
      "rarity": "rare",
      "family": "special",
      "name": "Ślepe Rozdanie",
      "desc": "Losowa karta",
      "sourceCategories": [
        "special"
      ]
    },
  {
      "id": "surprise_cost_0_1",
      "type": "surprise",
      "rarity": "rare",
      "family": "statistics",
      "name": "Mała Niespodzianka",
      "desc": "Losowa karta · Koszt 0–1",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "min": 0,
          "max": 1
        }
      }
    },
  {
      "id": "surprise_cost_2",
      "type": "surprise",
      "rarity": "rare",
      "family": "statistics",
      "name": "Podwójny Los",
      "desc": "Losowa karta · Koszt 2",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "exact": 2
        }
      }
    },
  {
      "id": "surprise_cost_3",
      "type": "surprise",
      "rarity": "rare",
      "family": "statistics",
      "name": "Trzecie Rozdanie",
      "desc": "Losowa karta · Koszt 3",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "exact": 3
        }
      }
    },
  {
      "id": "surprise_cost_4",
      "type": "surprise",
      "rarity": "rare",
      "family": "statistics",
      "name": "Czwarta Gwiazda",
      "desc": "Losowa karta · Koszt 4",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "exact": 4
        }
      }
    },
  {
      "id": "surprise_cost_5",
      "type": "surprise",
      "rarity": "rare",
      "family": "statistics",
      "name": "Piąty Sygnał",
      "desc": "Losowa karta · Koszt 5",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "exact": 5
        }
      }
    },
  {
      "id": "surprise_cost_6_plus",
      "type": "surprise",
      "rarity": "rare",
      "family": "statistics",
      "name": "Kosmiczny Ciężar",
      "desc": "Losowa karta · Koszt 6+",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "min": 6
        }
      }
    },
  {
      "id": "surprise_cost_0_3",
      "type": "surprise",
      "rarity": "rare",
      "family": "statistics",
      "name": "Niespodzianka z Rękawa",
      "desc": "Losowa karta · Koszt 0–3",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "min": 0,
          "max": 3
        }
      }
    },
  {
      "id": "surprise_cost_4_plus",
      "type": "surprise",
      "rarity": "rare",
      "family": "statistics",
      "name": "Gwiezdny Ładunek",
      "desc": "Losowa karta · Koszt 4+",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "min": 4
        }
      }
    },
  {
    "id": "surprise_power_0_or_less",
    "type": "surprise",
    "rarity": "rare",
    "family": "statistics",
    "name": "Zero czy Hero?",
    "desc": "Losowa karta · Koszt 0 lub Siła 0",
    "sourceCategories": [
      "statistics"
    ],
    "filter": {
      "orGroups": [
        {
          "cost": {
            "exact": 0
          }
        },
        {
          "power": {
            "exact": 0
          }
        }
      ]
    }
  },
  {
      "id": "surprise_power_1_3",
      "type": "surprise",
      "rarity": "rare",
      "family": "statistics",
      "name": "Niska Stawka",
      "desc": "Losowa karta · Siła 1–3",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "power": {
          "min": 1,
          "max": 3
        }
      }
    },
  {
      "id": "surprise_power_4_6",
      "type": "surprise",
      "rarity": "rare",
      "family": "statistics",
      "name": "Środkowe Rozdanie",
      "desc": "Losowa karta · Siła 4–6",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "power": {
          "min": 4,
          "max": 6
        }
      }
    },
  {
      "id": "surprise_power_7_9",
      "type": "surprise",
      "rarity": "epic",
      "family": "statistics",
      "name": "Mocna Ręka",
      "desc": "Losowa karta · Siła 7–9",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "power": {
          "min": 7,
          "max": 9
        }
      }
    },
  {
      "id": "surprise_power_10_plus",
      "type": "surprise",
      "rarity": "epic",
      "family": "statistics",
      "name": "Tytaniczna Niespodzianka",
      "desc": "Losowa karta · Siła 10+",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "power": {
          "min": 10
        }
      }
    },
  {
      "id": "surprise_power_3_or_less",
      "type": "surprise",
      "rarity": "rare",
      "family": "statistics",
      "name": "Niespodzianka z Dolnego Pasma",
      "desc": "Losowa karta · Siła 3 lub mniej",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "power": {
          "max": 3
        }
      }
    },
  {
      "id": "surprise_power_7_plus",
      "type": "surprise",
      "rarity": "epic",
      "family": "statistics",
      "name": "Wielka Stawka",
      "desc": "Losowa karta · Siła 7+",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "power": {
          "min": 7
        }
      }
    },
  {
    "id": "surprise_heavy_brick",
    "type": "surprise",
    "rarity": "rare",
    "family": "statistics",
    "name": "Ciężka Cegła",
    "desc": "Losowa karta · Koszt 5+ · Siła maks. 2",
    "sourceCategories": [
      "statistics"
    ],
    "filter": {
      "cost": {
        "min": 5
      },
      "power": {
        "max": 2
      }
    }
  },
  {
      "id": "surprise_cost_greater_than_power",
      "type": "surprise",
      "rarity": "rare",
      "family": "statistics",
      "name": "Zapadnięta Gwiazda",
      "desc": "Losowa karta · Koszt > Siła",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "cost",
            "operator": ">",
            "right": "power"
          }
        ]
      }
    },
  {
      "id": "surprise_power_greater_than_cost",
      "type": "surprise",
      "rarity": "rare",
      "family": "statistics",
      "name": "Przeciążenie",
      "desc": "Losowa karta · Siła > Koszt",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "power",
            "operator": ">",
            "right": "cost"
          }
        ]
      }
    },
  {
      "id": "surprise_equal_cost_power",
      "type": "surprise",
      "rarity": "rare",
      "family": "statistics",
      "name": "Idealna Równowaga",
      "desc": "Losowa karta · Koszt = Siła",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "cost",
            "operator": "=",
            "right": "power"
          }
        ]
      }
    },
  {
      "id": "surprise_energy_collapse",
      "type": "surprise",
      "rarity": "epic",
      "family": "statistics",
      "name": "Załamanie Energii",
      "desc": "Losowa karta · Koszt 6 · Siła maks. 6",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "exact": 6
        },
        "power": {
          "max": 6
        }
      }
    },
  {
      "id": "surprise_duelist",
      "type": "surprise",
      "rarity": "rare",
      "family": "statistics",
      "name": "Pojedynek Statystyk",
      "desc": "Losowa karta · Koszt 3 · Siła 3–6",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "exact": 3
        },
        "power": {
          "min": 3,
          "max": 6
        }
      }
    },
  {
      "id": "surprise_cheap_trick",
      "type": "surprise",
      "rarity": "rare",
      "family": "statistics",
      "name": "Tania Sztuczka",
      "desc": "Losowa karta · Koszt 1 · Siła maks. 2",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "exact": 1
        },
        "power": {
          "max": 2
        }
      }
    },
  {
      "id": "surprise_stat_monster",
      "type": "surprise",
      "rarity": "epic",
      "family": "statistics",
      "name": "Potwór Statystyk",
      "desc": "Losowa karta · Siła ≥ Koszt + 4",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "power",
            "operator": ">=",
            "right": "cost",
            "offset": 4
          }
        ]
      }
    },
  {
      "id": "surprise_on_reveal",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Niespodziewane Odkrycie",
      "desc": "Losowy On Reveal",
      "sourceCategories": [
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "on-reveal"
          ]
        }
      }
    },
  {
      "id": "surprise_moveable",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Ruchoma Niespodzianka",
      "desc": "Losowa karta Moveable",
      "sourceCategories": [
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "moveable"
          ]
        }
      }
    },
  {
      "id": "surprise_no_ability",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "No Powers, No Problem",
      "desc": "Losowa karta bez zdolności",
      "sourceCategories": [
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "no-ability"
          ]
        }
      }
    },
  {
      "id": "surprise_objective",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Nieznana Misja",
      "desc": "Losowa karta Objective",
      "sourceCategories": [
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "objective"
          ]
        }
      }
    },
  {
      "id": "surprise_start_of_turn",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Sygnał o Świcie",
      "desc": "Losowa karta Start of Turn",
      "sourceCategories": [
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "startofturn"
          ]
        }
      }
    },
  {
      "id": "surprise_end_of_game",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Ostatnia Niespodzianka",
      "desc": "Losowa karta End of Game",
      "sourceCategories": [
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "endofgame"
          ]
        }
      }
    },
  {
      "id": "surprise_ongoing",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Wieczna Niespodzianka",
      "desc": "Losowy Ongoing",
      "sourceCategories": [
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "ongoing"
          ]
        }
      }
    },
  {
      "id": "surprise_activate",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Nieznana Aktywacja",
      "desc": "Losowy Activate",
      "sourceCategories": [
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "activate"
          ]
        }
      }
    },
  {
      "id": "surprise_trigger_card",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Czuły Spust",
      "desc": "Losowy Trigger Card",
      "sourceCategories": [
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "trigger-card"
          ]
        }
      }
    },
  {
      "id": "surprise_end_of_turn",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Kończąca Tura",
      "desc": "Losowa karta End of Turn",
      "sourceCategories": [
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "endofturn"
          ]
        }
      }
    },
  {
      "id": "surprise_game_start",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Efekt Motyla",
      "desc": "Losowa karta Game Start",
      "sourceCategories": [
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "gamestart"
          ]
        }
      }
    },
  {
      "id": "surprise_move",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Skok przez Orbitę",
      "desc": "Losowa karta · Move",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "move"
          ]
        }
      }
    },
  {
      "id": "surprise_destroy",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Ostrze Losu",
      "desc": "Losowa karta · Destroy",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "destroy"
          ]
        }
      }
    },
  {
      "id": "surprise_discard",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Odrzucona Szansa",
      "desc": "Losowa karta · Discard",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "discard"
          ]
        }
      }
    },
  {
      "id": "surprise_bounce",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Powrót z Kapelusza",
      "desc": "Losowa karta · Bounce",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "bounce"
          ]
        }
      }
    },
  {
      "id": "surprise_afflict",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Toksyczna Przesyłka",
      "desc": "Losowa karta · Afflict",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "afflict"
          ]
        }
      }
    },
  {
      "id": "surprise_tech",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Plan Awaryjny",
      "desc": "Losowa karta · Tech",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "tech"
          ]
        }
      }
    },
  {
      "id": "surprise_clog",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Kosmiczny Zator",
      "desc": "Losowa karta · Clog",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "clog"
          ]
        }
      }
    },
  {
      "id": "surprise_mill",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Wyciek Informacji",
      "desc": "Losowa karta · Mill",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "mill"
          ]
        }
      }
    },
  {
      "id": "surprise_spell",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Zaklęcie z Rękawa",
      "desc": "Losowa karta · Skills",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "skills"
          ]
        }
      }
    },
  {
      "id": "surprise_cardgen_card",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Nieznana Dostawa",
      "desc": "Losowa karta · Card Generation",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "card-generation"
          ]
        }
      }
    },
  {
      "id": "surprise_location_control",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Pęknięcie Lokacji",
      "desc": "Losowa karta · Location",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "anyOf": [
            "location-control",
            "location-points"
          ]
        }
      }
    },
  {
      "id": "surprise_cost_reduction",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Kosmiczna Promocja",
      "desc": "Losowa karta · Cost Reduction",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "cost-reduction"
          ]
        }
      }
    },
  {
      "id": "surprise_energy_ramp",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Zastrzyk Energii",
      "desc": "Losowa karta · Energy / Ramp",
      "sourceCategories": [
        "mechanicFamilies",
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "anyOf": [
            "energy",
            "ramp"
          ]
        }
      }
    },
  {
      "id": "surprise_revive",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Echo Życia",
      "desc": "Losowa karta · Revive",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "revive"
          ]
        }
      }
    },
  {
      "id": "surprise_transform",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Forma z Kapelusza",
      "desc": "Losowa karta · Transform",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "transform"
          ]
        }
      }
    },
  {
      "id": "surprise_disruption",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Sabotaż",
      "desc": "Losowa karta · Disruption",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "disruption"
          ]
        }
      }
    },
  {
      "id": "surprise_monsters",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Potwór z Cienia",
      "desc": "Losowa karta · Monsters",
      "sourceCategories": [
        "themes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "monsters"
          ]
        }
      }
    },
  {
      "id": "surprise_robots_cyborgs",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Maszyna z Rozdania",
      "desc": "Losowa karta · Robots Cyborgs",
      "sourceCategories": [
        "themes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "robots-cyborgs"
          ]
        }
      }
    },
  {
      "id": "surprise_magicians",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Zaklęty Los",
      "desc": "Losowa karta · Magicians",
      "sourceCategories": [
        "themes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "magicians"
          ]
        }
      }
    },
  {
      "id": "surprise_cosmic_entities",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Głos Kosmosu",
      "desc": "Losowa karta · Cosmic Entities",
      "sourceCategories": [
        "themes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "cosmic-entities"
          ]
        }
      }
    },
  {
      "id": "surprise_symbiotes",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Głos Symbionta",
      "desc": "Losowa karta · Symbiotes",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "symbiotes"
          ]
        }
      }
    },
  {
      "id": "surprise_animal",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Dzika Niespodzianka",
      "desc": "Losowa karta · Animals",
      "sourceCategories": [
        "themes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "animals"
          ]
        }
      }
    },
  {
      "id": "surprise_animal_themed",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Maska Bestii",
      "desc": "Losowa karta · Animal Themed",
      "sourceCategories": [
        "themes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "animal-themed"
          ]
        }
      }
    },
  {
      "id": "surprise_destroy_or_discard",
      "type": "surprise",
      "rarity": "rare",
      "family": "hybrid",
      "name": "Rozpad Materii",
      "desc": "Losowy Destroy lub Discard",
      "hybridType": "multi-tag-any",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "anyOf": [
            "destroy",
            "discard"
          ]
        }
      }
    },
  {
      "id": "surprise_move_or_bounce",
      "type": "surprise",
      "rarity": "rare",
      "family": "hybrid",
      "name": "Ruchome Sztuczki",
      "desc": "Losowy Move lub Bounce",
      "hybridType": "multi-tag-any",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "anyOf": [
            "move",
            "bounce"
          ]
        }
      }
    },
  {
      "id": "surprise_afflict_or_clog",
      "type": "surprise",
      "rarity": "rare",
      "family": "hybrid",
      "name": "Toksyczny Zator",
      "desc": "Losowy Afflict lub Clog",
      "hybridType": "multi-tag-any",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "anyOf": [
            "afflict",
            "clog"
          ]
        }
      }
    },
  {
      "id": "surprise_ramp_or_cost_reduction",
      "type": "surprise",
      "rarity": "rare",
      "family": "hybrid",
      "name": "Skrót Energetyczny",
      "desc": "Losowy Energy Ramp lub redukcja Kosztu",
      "hybridType": "multi-tag-any",
      "sourceCategories": [
        "mechanicFamilies",
        "subtypes",
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "anyOf": [
            "energy",
            "ramp",
            "cost-reduction"
          ]
        }
      }
    },
  {
      "id": "surprise_revive_or_summon",
      "type": "surprise",
      "rarity": "rare",
      "family": "hybrid",
      "name": "Życie po Śmierci",
      "desc": "Losowy Revive lub Summon",
      "hybridType": "multi-tag-any",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "anyOf": [
            "revive",
            "summon"
          ]
        }
      }
    },
  {
      "id": "surprise_tech_or_disruption",
      "type": "surprise",
      "rarity": "rare",
      "family": "hybrid",
      "name": "Plan B",
      "desc": "Losowy Tech lub Disruption",
      "hybridType": "multi-tag-any",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "anyOf": [
            "tech",
            "disruption"
          ]
        }
      }
    },
  {
      "id": "surprise_on_reveal_low_cost",
      "type": "surprise",
      "rarity": "rare",
      "family": "hybrid",
      "name": "Szybka Odsłona",
      "desc": "Losowy On Reveal · Koszt maks. 2",
      "hybridType": "tag-stat",
      "sourceCategories": [
        "statistics",
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "on-reveal"
          ]
        },
        "cost": {
          "max": 2
        }
      }
    },
  {
      "id": "surprise_destroy_high_power",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Masakra z Orbity",
      "desc": "Losowa karta · Destroy · Siła 7+",
      "hybridType": "tag-stat",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "destroy"
          ]
        },
        "power": {
          "min": 7
        }
      }
    },
  {
      "id": "surprise_discard_low_cost",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Odrzut Kieszonkowy",
      "desc": "Losowy Discard · Koszt maks. 2",
      "hybridType": "tag-stat",
      "sourceCategories": [
        "statistics",
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "discard"
          ]
        },
        "cost": {
          "max": 2
        }
      }
    },
  {
      "id": "surprise_ongoing_low_cost",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Mała Nieskończoność",
      "desc": "Losowy Ongoing · Koszt maks. 2",
      "hybridType": "tag-stat",
      "sourceCategories": [
        "statistics",
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "ongoing"
          ]
        },
        "cost": {
          "max": 2
        }
      }
    },
  {
      "id": "surprise_cheap_tech",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Awaryjny Gadżet",
      "desc": "Losowa karta · Tech · Koszt maks. 2",
      "hybridType": "tag-stat",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "tech"
          ]
        },
        "cost": {
          "max": 2
        }
      }
    },
  {
      "id": "surprise_card_generation_low_power",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Generator z Cienia",
      "desc": "Losowy Card Generation · Siła maks. 2",
      "hybridType": "tag-stat",
      "sourceCategories": [
        "statistics",
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "card-generation"
          ]
        },
        "power": {
          "max": 2
        }
      }
    },
  {
      "id": "surprise_trigger_low_cost",
      "type": "surprise",
      "rarity": "rare",
      "family": "hybrid",
      "name": "Szybki Spust",
      "desc": "Losowy Trigger Card · Koszt maks. 2",
      "hybridType": "tag-stat",
      "sourceCategories": [
        "statistics",
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "trigger-card"
          ]
        },
        "cost": {
          "max": 2
        }
      }
    },
  {
      "id": "surprise_move_on_reveal",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Niespodziewany Teleport",
      "desc": "Losowy Move + On Reveal",
      "hybridType": "multi-tag-all",
      "sourceCategories": [
        "abilityTypes",
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "move",
            "on-reveal"
          ]
        }
      }
    },
  {
      "id": "surprise_destroy_trigger",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Zapłon Łańcucha",
      "desc": "Losowa karta · Destroy + Trigger Card",
      "hybridType": "multi-tag-all",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "destroy",
            "trigger-card"
          ]
        }
      }
    },
  {
      "id": "choice_spider_verse",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Sieć Przeznaczenia",
      "desc": "Dowolna karta · Spider Verse",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "spider-verse"
          ]
        }
      }
    },
  {
      "id": "surprise_spider_verse",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Skok przez Multiwersum",
      "desc": "Losowa karta · Spider Verse",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "spider-verse"
          ]
        }
      }
    },
  {
      "id": "surprise_symbiote_destroy",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Czarna Biomasa",
      "desc": "Losowa karta · Symbiotes + Destroy",
      "hybridType": "multi-tag-all",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "symbiotes",
            "destroy"
          ]
        }
      }
    },
  {
      "id": "choice_buff",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Kosmiczne Wzmocnienie",
      "desc": "Dowolna karta · Buff",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "buff"
          ]
        }
      }
    },
  {
      "id": "surprise_buff",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Zastrzyk Mocy",
      "desc": "Losowa karta · Buff",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "buff"
          ]
        }
      }
    },
  {
      "id": "choice_clog",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Blokada Orbitalna",
      "desc": "Dowolna karta · Clog",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "clog"
          ]
        }
      }
    },
  {
      "id": "choice_highevo",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Ewolucyjny Wybór",
      "desc": "Dowolna karta · High Evolutionary",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "highevo"
          ]
        }
      }
    },
  {
      "id": "surprise_highevo",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Mutacja Przeznaczenia",
      "desc": "Losowa karta · High Evolutionary",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "highevo"
          ]
        }
      }
    },
  {
      "id": "choice_merge",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Idealna Fuzja",
      "desc": "Dowolna karta · Merge",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "merge"
          ]
        }
      }
    },
  {
      "id": "surprise_merge",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Niespodziewane Scalenie",
      "desc": "Losowa karta · Merge",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "merge"
          ]
        }
      }
    },
  {
      "id": "choice_mill",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Kradzież Planu",
      "desc": "Dowolna karta · Mill",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "mill"
          ]
        }
      }
    },
  {
      "id": "choice_no_ability_buff",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Czysta Siła",
      "desc": "Dowolna karta · Patriot",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "patriot"
          ]
        }
      }
    },
  {
      "id": "surprise_no_ability_buff",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Bez Tekstu, Bez Ostrzeżenia",
      "desc": "Losowa karta · Patriot",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "patriot"
          ]
        }
      }
    },
  {
      "id": "choice_ongoing_combo",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Nieskończona Konstrukcja",
      "desc": "Dowolna karta · Ongoing Combo",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "anyOf": [
            "spectrum-ongoing",
            "tribunal-ongoing"
          ]
        }
      }
    },
  {
      "id": "surprise_ongoing_combo",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Stałe Rozdanie",
      "desc": "Losowa karta · Ongoing Combo",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "anyOf": [
            "spectrum-ongoing",
            "tribunal-ongoing"
          ]
        }
      }
    },
  {
      "id": "choice_wongreveal",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Mistrz Ceremonii",
      "desc": "Dowolna karta · Wong / On Reveal Combo",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "wongreveal"
          ]
        }
      }
    },
  {
      "id": "surprise_wongreveal",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Podwójne Odkrycie",
      "desc": "Losowa karta · Wong / On Reveal Combo",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "wongreveal"
          ]
        }
      }
    },
  {
      "id": "choice_zoo",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Me at the Zoo",
      "desc": "Dowolna karta · Zoo",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "zoo"
          ]
        }
      }
    },
  {
      "id": "surprise_zoo",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Savage Ones",
      "desc": "Losowa karta · Zoo",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "zoo"
          ]
        }
      }
    },
  {
      "id": "choice_end_of_turn_combo",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Plan na Zmierzch",
      "desc": "Dowolna karta · End of Turn Combo",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "end-of-turn-combo"
          ]
        }
      }
    },
  {
      "id": "surprise_end_of_turn_combo",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Zmierzchowe Rozdanie",
      "desc": "Losowa karta · End of Turn Combo",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "end-of-turn-combo"
          ]
        }
      }
    },
  {
      "id": "choice_negative",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Negative Mind",
      "desc": "Dowolna karta · Mister Negative",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "mister-negative"
          ]
        }
      }
    },
  {
      "id": "surprise_negative",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Negatywna Niespodzianka",
      "desc": "Losowa karta · Mister Negative",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "mister-negative"
          ]
        }
      }
    },
  {
      "id": "choice_lockdown",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Zniewolenie",
      "desc": "Dowolna karta · Lockdown",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "lockdown"
          ]
        }
      }
    },
  {
      "id": "surprise_lockdown",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Brak Wstępu",
      "desc": "Losowa karta · Lockdown",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "lockdown"
          ]
        }
      }
    },
  {
      "id": "choice_scream",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Kontrolowany Wstrząs",
      "desc": "Dowolna karta · Scream / Opponent Move",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "scream-opp-move"
          ]
        }
      }
    },
  {
      "id": "surprise_scream",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Krzyk z Ciemności",
      "desc": "Losowa karta · Scream / Opponent Move",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "scream-opp-move"
          ]
        }
      }
    },
  {
      "id": "choice_mini_movers",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Mikroorbita",
      "desc": "Dowolna karta · Mini Movers",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "mini-movers"
          ]
        }
      }
    },
  {
      "id": "surprise_mini_movers",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Mały Skok",
      "desc": "Losowa karta · Mini Movers",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "mini-movers"
          ]
        }
      }
    },
  {
      "id": "choice_priority_control",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Pierwszeństwo",
      "desc": "Dowolna karta · Prio Control",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "prio-control"
          ]
        }
      }
    },
  {
      "id": "surprise_priority_control",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Przewaga z Rozdania",
      "desc": "Losowa karta · Prio Control",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "prio-control"
          ]
        }
      }
    },
  {
      "id": "choice_shou_lao",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Jeszcze Raz",
      "desc": "Dowolna karta · Small Buff",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "small-buff-bounce"
          ]
        }
      }
    },
  {
      "id": "surprise_shou_lao",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Małe, Wielkie Punkty!",
      "desc": "Losowa karta · Small Buff",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "small-buff-bounce"
          ]
        }
      }
    },
  {
      "id": "choice_aurora",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Spektrum Aurory",
      "desc": "Dowolna karta · Aurora",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "aurora"
          ]
        }
      }
    },
  {
      "id": "surprise_aurora",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Zorza Niespodzianki",
      "desc": "Losowa karta · Aurora",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "aurora"
          ]
        }
      }
    },
  {
      "id": "choice_arishem_thanos",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Kosmiczny Arsenał",
      "desc": "Dowolna karta · Loki / Arishem",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "loki-arishem"
          ]
        }
      }
    },
  {
      "id": "surprise_arishem_thanos",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Kaprys Kosmosu",
      "desc": "Losowa karta · Loki / Arishem",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "loki-arishem"
          ]
        }
      }
    },
  {
      "id": "choice_hammer_bros",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Wrota Asgardu",
      "desc": "Dowolna karta · Hammer Bros",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "hammer-bros"
          ]
        }
      }
    },
  {
      "id": "surprise_hammer_bros",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Kuźnia Młotów",
      "desc": "Losowa karta · Hammer Bros",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "hammer-bros"
          ]
        }
      }
    },
  {
      "id": "choice_fantomex",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Plan Fantomexa",
      "desc": "Dowolna karta · Fantomex",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "fantomex"
          ]
        }
      }
    },
  {
      "id": "surprise_fantomex",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Widmowe Rozdanie",
      "desc": "Losowa karta · Fantomex",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "fantomex"
          ]
        }
      }
    },
  {
      "id": "choice_nimrod_phoenix",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Rzeź Kart",
      "desc": "Dowolna karta · Destroy Combo",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "destroy-combo"
          ]
        }
      }
    },
  {
      "id": "surprise_nimrod_phoenix",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Niekontrolowana Rozwałka",
      "desc": "Losowa karta · Destroy Combo",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "destroy-combo"
          ]
        }
      }
    },
  {
      "id": "choice_zombie_galacti",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Galaktyczna Zaraza",
      "desc": "Dowolna karta · Zombie Galacti",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "zombie-galacti"
          ]
        }
      }
    },
  {
      "id": "surprise_zombie_galacti",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Zarażony Sygnał",
      "desc": "Losowa karta · Zombie Galacti",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "zombie-galacti"
          ]
        }
      }
    },
  {
      "id": "choice_wiccan",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Rampa Wielkości",
      "desc": "Dowolna karta · Ramp",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "ramp"
          ]
        }
      }
    },
  {
      "id": "surprise_wiccan",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "WIELCY na skróty",
      "desc": "Losowa karta · Ramp",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "ramp"
          ]
        }
      }
    },
  {
      "id": "choice_werewolf_sentry",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Nocny Układ",
      "desc": "Dowolna karta · Werewolf / Sentry",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "clog-anni"
          ]
        }
      }
    },
  {
      "id": "surprise_werewolf_sentry",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Pełnia Chaosu",
      "desc": "Losowa karta · Werewolf / Sentry",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "clog-anni"
          ]
        }
      }
    },
  {
      "id": "choice_surfer",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Srebrna Fala",
      "desc": "Dowolna karta · Silver Surfer",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "surfer-buff"
          ]
        }
      }
    },
  {
      "id": "surprise_surfer",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Kosmiczny Boost",
      "desc": "Losowa karta · Silver Surfer",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "surfer-buff"
          ]
        }
      }
    },
  {
      "id": "choice_quickdraw",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Szybka Decyzja",
      "desc": "Dowolna karta · Quickdraw",
      "sourceCategories": [
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "quickdraw"
          ]
        }
      }
    },
  {
      "id": "surprise_quickdraw",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Szybkie Rozdanie",
      "desc": "Losowa karta · Quickdraw",
      "sourceCategories": [
        "abilityTypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "quickdraw"
          ]
        }
      }
    },
  {
      "id": "choice_board_generator",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Kosmiczna Fabryka",
      "desc": "Dowolna karta · Board Generator",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "board-generator"
          ]
        }
      }
    },
  {
      "id": "surprise_board_generator",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Nowe Ciała",
      "desc": "Losowa karta · Board Generator",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "board-generator"
          ]
        }
      }
    },
  {
      "id": "choice_card_copy",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Lustrzana Kopia",
      "desc": "Dowolna karta · Card Copy",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "card-copy"
          ]
        }
      }
    },
  {
      "id": "surprise_card_copy",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Kopia z Rękawa",
      "desc": "Losowa karta · Card Copy",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "card-copy"
          ]
        }
      }
    },
  {
      "id": "choice_deck_generator",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Projekt Talii",
      "desc": "Dowolna karta · Deck Generator",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "deck-generator"
          ]
        }
      }
    },
  {
      "id": "surprise_deck_generator",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Przesyłka do Talii",
      "desc": "Losowa karta · Deck Generator",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "deck-generator"
          ]
        }
      }
    },
  {
      "id": "choice_disruption",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Plan Sabotażu",
      "desc": "Dowolna karta · Disruption",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "disruption"
          ]
        }
      }
    },
  {
      "id": "choice_double_power",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Podwójna Moc",
      "desc": "Dowolna karta · Double Power",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "double-power"
          ]
        }
      }
    },
  {
      "id": "surprise_double_power",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Podwojenie Stawki",
      "desc": "Losowa karta · Double Power",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "double-power"
          ]
        }
      }
    },
  {
        "id": "choice_draw",
        "type": "choice",
        "rarity": "epic",
        "family": "tag",
        "name": "Twoje Rozdanie",
        "desc": "Dowolna karta · Draw",
        "sourceCategories": [
            "mechanicFamilies"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "draw"
                ]
            }
        }
    },
  {
        "id": "surprise_draw",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Sekretne Rozdanie",
        "desc": "Losowa karta · Draw",
        "sourceCategories": [
            "mechanicFamilies"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "draw"
                ]
            }
        }
    },
  {
      "id": "choice_delayed_reveal",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Kurtyna Czasu",
      "desc": "Dowolna karta · Delayed Reveal",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "delayed-reveal"
          ]
        }
      }
    },
  {
      "id": "surprise_delayed_reveal",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Odsłona po Czasie",
      "desc": "Losowa karta · Delayed Reveal",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "delayed-reveal"
          ]
        }
      }
    },
  {
      "id": "choice_effect_multiplier",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Chciwość",
      "desc": "Dowolna karta · Effect Replication",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "effect-replication"
          ]
        }
      }
    },
  {
      "id": "surprise_effect_multiplier",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Nigdy za wiele",
      "desc": "Losowa karta · Effect Replication",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "effect-replication"
          ]
        }
      }
    },
  {
      "id": "choice_energy_ramp",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Skok Energetyczny",
      "desc": "Dowolna karta · Energy / Ramp",
      "sourceCategories": [
        "mechanicFamilies",
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "anyOf": [
            "energy",
            "ramp"
          ]
        }
      }
    },
  {
      "id": "choice_give_power",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Rozdawca Mocy",
      "desc": "Dowolna karta · Give Power",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "give-power"
          ]
        }
      }
    },
  {
      "id": "surprise_give_power",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Kosmiczny Zastrzyk",
      "desc": "Losowa karta · Give Power",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "give-power"
          ]
        }
      }
    },
  {
      "id": "choice_hand_gen",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Pełna Ręka",
      "desc": "Dowolna karta · Hand Generation",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "hand-gen"
          ]
        }
      }
    },
  {
      "id": "surprise_hand_gen",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Dostawa do Ręki",
      "desc": "Losowa karta · Hand Generation",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "hand-gen"
          ]
        }
      }
    },
  {
      "id": "choice_multi_location_power",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Moc Wielu Światów",
      "desc": "Dowolna karta · Power Support",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "power-support"
          ]
        }
      }
    },
  {
      "id": "surprise_multi_location_power",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Szeroki Rozbłysk",
      "desc": "Losowa karta · Power Support",
      "sourceCategories": [
        "mechanicFamilies"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "power-support"
          ]
        }
      }
    },
  {
      "id": "choice_scaler",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Rosnąca Potęga",
      "desc": "Dowolna karta · Power Scaler",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "scaler"
          ]
        }
      }
    },
  {
      "id": "surprise_scaler",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Nieznany Potencjał",
      "desc": "Losowa karta · Power Scaler",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "scaler"
          ]
        }
      }
    },
  {
      "id": "choice_self_buff",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Własna Potęga",
      "desc": "Dowolna karta · Self Buff",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "self-buff"
          ]
        }
      }
    },
  {
      "id": "surprise_self_buff",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Nagły Wzrost",
      "desc": "Losowa karta · Self Buff",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "self-buff"
          ]
        }
      }
    },
  {
      "id": "choice_set_power",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Ustawienie Mocy",
      "desc": "Dowolna karta · Set Power",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "set-power"
          ]
        }
      }
    },
  {
      "id": "surprise_set_power",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Nowy Poziom",
      "desc": "Losowa karta · Set Power",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "set-power"
          ]
        }
      }
    },
  {
      "id": "choice_summon",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Kosmiczne Wezwanie",
      "desc": "Dowolna karta · Summon",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "summon"
          ]
        }
      }
    },
  {
      "id": "surprise_summon",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Niespodziewane Przyzwanie",
      "desc": "Losowa karta · Summon",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "summon"
          ]
        }
      }
    },
  {
      "id": "choice_unique_card_creation",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Unikat na Życzenie",
      "desc": "Dowolna karta · Unique Card Creation",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "unique-card-creation"
          ]
        }
      }
    },
  {
      "id": "surprise_unique_card_creation",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Jedyny w Swoim Rodzaju",
      "desc": "Losowa karta · Unique Card Creation",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "unique-card-creation"
          ]
        }
      }
    },
  {
      "id": "choice_random_card_pool",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Generator Losu",
      "desc": "Dowolna karta · Random Card Pool",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "random-card-pool"
          ]
        }
      }
    },
  {
      "id": "surprise_random_card_pool",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Koło Losu",
      "desc": "Losowa karta · Random Card Pool",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "random-card-pool"
          ]
        }
      }
    },
  {
      "id": "choice_text_disruption",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Cisza Absolutna",
      "desc": "Dowolna karta · Text Disruption",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "text-disruption"
          ]
        }
      }
    },
  {
      "id": "surprise_text_disruption",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Zakłócenie Tekstu",
      "desc": "Losowa karta · Text Disruption",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "text-disruption"
          ]
        }
      }
    },
  {
    "id": "choice_power_steal",
    "type": "choice",
    "rarity": "epic",
    "family": "tag",
    "name": "Kradzież Życia",
    "desc": "Dowolna karta · Power Steal",
    "sourceCategories": [
      "subtypes"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "power-steal"
        ]
      }
    }
  },
  {
    "id": "surprise_power_steal",
    "type": "surprise",
    "rarity": "epic",
    "family": "tag",
    "name": "Drenaż",
    "desc": "Losowa karta · Power Steal",
    "sourceCategories": [
      "subtypes"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "power-steal"
        ]
      }
    }
  },
  {
      "id": "choice_row_interaction",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Linia Frontu",
      "desc": "Dowolna karta · Row Interaction",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "row-interaction"
          ]
        }
      }
    },
  {
      "id": "surprise_row_interaction",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Ruch w Szeregu",
      "desc": "Losowa karta · Row Interaction",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "row-interaction"
          ]
        }
      }
    },
  {
      "id": "choice_full_location",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Pełna Lokacja",
      "desc": "Dowolna karta · Full Location",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "full-location"
          ]
        }
      }
    },
  {
      "id": "surprise_full_location",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Tłok na Lokacji",
      "desc": "Losowa karta · Full Location",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "full-location"
          ]
        }
      }
    },
  {
      "id": "choice_play_requirement",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Warunek Zagrania",
      "desc": "Dowolna karta · Play Requirement",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "play-requirement"
          ]
        }
      }
    },
  {
      "id": "surprise_play_requirement",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Ryzykowna Ręka",
      "desc": "Losowa karta · Play Requirement",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "play-requirement"
          ]
        }
      }
    },
  {
      "id": "choice_unspent_energy",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Zapas Energii",
      "desc": "Dowolna karta · Unspent Energy",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "unspent-energy"
          ]
        }
      }
    },
  {
      "id": "surprise_unspent_energy",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Niewydany Impuls",
      "desc": "Losowa karta · Unspent Energy",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "unspent-energy"
          ]
        }
      }
    },
  {
      "id": "choice_winning",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Karta Zwycięstwa",
      "desc": "Dowolna karta · Winning",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "winning"
          ]
        }
      }
    },
  {
      "id": "surprise_winning",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "As na Wygraną",
      "desc": "Losowa karta · Winning",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "winning"
          ]
        }
      }
    },
  {
      "id": "choice_zero_downsides",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Cena Potęgi",
      "desc": "Dowolna karta · Downside / Nightmare-Skaar",
      "sourceCategories": [
        "mechanicFamilies",
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "anyOf": [
            "downside",
            "nightmare-skaar"
          ]
        }
      }
    },
  {
      "id": "surprise_zero_downsides",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Ryzyko i Nagroda",
      "desc": "Losowa karta · Downside / Nightmare-Skaar",
      "sourceCategories": [
        "mechanicFamilies",
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "anyOf": [
            "downside",
            "nightmare-skaar"
          ]
        }
      }
    },
  {
        "id": "choice_avengers_all",
        "type": "choice",
        "rarity": "legendary",
        "family": "tag",
        "name": "Avengers Assemble!",
        "desc": "Dowolna karta · Wszystkie drużyny Avengers",
        "sourceCategories": [
            "teams"
        ],
        "filter": {
            "tags": {
                "anyOf": [
                    "avengers",
                    "new-avengers",
                    "west-coast-avengers",
                    "dark-avengers",
                    "young-avengers"
                ]
            }
        }
    },
  {
        "id": "surprise_avengers_all",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Classic Avengers",
        "desc": "Losowa karta · Avengers",
        "sourceCategories": [
            "teams"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "avengers"
                ]
            }
        }
    },
  {
        "id": "choice_x_family",
        "type": "choice",
        "rarity": "legendary",
        "family": "tag",
        "name": "To Me, My X-Men!",
        "desc": "Dowolna karta · X-Men / X-Force / New Mutants",
        "sourceCategories": [
            "teams"
        ],
        "filter": {
            "tags": {
                "anyOf": [
                    "xmen",
                    "x-force",
                    "new-mutants"
                ]
            }
        }
    },
  {
        "id": "surprise_x_family",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Classic X-Men",
        "desc": "Losowa karta · X-Men",
        "sourceCategories": [
            "teams"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "xmen"
                ]
            }
        }
    },
  {
      "id": "choice_annihilators",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Annihilators na Życzenie",
      "desc": "Dowolna karta · Annihilators",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "annihilators"
          ]
        }
      }
    },
  {
      "id": "surprise_annihilators",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Kosmiczny Szturm",
      "desc": "Losowa karta · Annihilators",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "annihilators"
          ]
        }
      }
    },
  {
      "id": "choice_celestial_eternals",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Wola Celestiali",
      "desc": "Dowolna karta · Celestial Eternals",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "celestial-eternals"
          ]
        }
      }
    },
  {
      "id": "surprise_celestial_eternals",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Kosmiczne Dziedzictwo",
      "desc": "Losowa karta · Celestial Eternals",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "celestial-eternals"
          ]
        }
      }
    },
  {
      "id": "choice_atlanteans",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Tron Atlantydy",
      "desc": "Dowolna karta · Atlanteans",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "atlanteans"
          ]
        }
      }
    },
  {
      "id": "surprise_atlanteans",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Głos Głębin",
      "desc": "Losowa karta · Atlanteans",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "atlanteans"
          ]
        }
      }
    },
  {
      "id": "choice_agents_of_atlas",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Rozkaz Atlasu",
      "desc": "Dowolna karta · Agents Of Atlas",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "agents-of-atlas"
          ]
        }
      }
    },
  {
      "id": "surprise_agents_of_atlas",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Misja Atlasu",
      "desc": "Losowa karta · Agents Of Atlas",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "agents-of-atlas"
          ]
        }
      }
    },
  {
      "id": "choice_cabal",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Tajna Rada",
      "desc": "Dowolna karta · Cabal",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "cabal"
          ]
        }
      }
    },
  {
      "id": "surprise_cabal",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Układ Cabalu",
      "desc": "Losowa karta · Cabal",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "cabal"
          ]
        }
      }
    },
  {
      "id": "choice_illuminati",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Rada Illuminati",
      "desc": "Dowolna karta · Illuminati",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "illuminati"
          ]
        }
      }
    },
  {
        "id": "surprise_illuminati",
        "type": "surprise",
        "rarity": "epic",
        "family": "tag",
        "name": "Sekret Iluminatów",
        "desc": "Losowa karta · Illuminati",
        "sourceCategories": [
            "teams"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "illuminati"
                ]
            }
        }
    },
  {
      "id": "choice_brotherhood",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Bractwo na Życzenie",
      "desc": "Dowolna karta · Brotherhood",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "brotherhood"
          ]
        }
      }
    },
  {
      "id": "surprise_brotherhood",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Zew Bractwa",
      "desc": "Losowa karta · Brotherhood",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "brotherhood"
          ]
        }
      }
    },
  {
      "id": "choice_hellfire_club",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Inner Circle",
      "desc": "Dowolna karta · Hellfire Club",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "hellfire-club"
          ]
        }
      }
    },
  {
      "id": "surprise_hellfire_club",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Zaproszenie do Hellfire",
      "desc": "Losowa karta · Hellfire Club",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "hellfire-club"
          ]
        }
      }
    },
  {
      "id": "choice_horsemen",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Jeździec Apokalipsy",
      "desc": "Dowolna karta · Horsemen",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "horsemen"
          ]
        }
      }
    },
  {
      "id": "surprise_horsemen",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Pieczęć Apokalipsy",
      "desc": "Losowa karta · Horsemen",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "horsemen"
          ]
        }
      }
    },
  {
      "id": "choice_hydra",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Rozkaz Hydry",
      "desc": "Dowolna karta · Hydra",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "hydra"
          ]
        }
      }
    },
  {
      "id": "surprise_hydra",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Głowa Hydry",
      "desc": "Losowa karta · Hydra",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "hydra"
          ]
        }
      }
    },
  {
      "id": "choice_heroes_for_hire",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Kontrakt Bohaterów",
      "desc": "Dowolna karta · Heroes For Hire",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "heroes-for-hire"
          ]
        }
      }
    },
  {
      "id": "surprise_heroes_for_hire",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Zlecenie z Ulicy",
      "desc": "Losowa karta · Heroes For Hire",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "heroes-for-hire"
          ]
        }
      }
    },
  {
      "id": "choice_marvel_knights",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Nocna Straż",
      "desc": "Dowolna karta · Marvel Knights",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "marvel-knights"
          ]
        }
      }
    },
  {
      "id": "surprise_marvel_knights",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Miejski Patrol",
      "desc": "Losowa karta · Marvel Knights",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "marvel-knights"
          ]
        }
      }
    },
  {
      "id": "choice_future_foundation",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Projekt Przyszłość",
      "desc": "Dowolna karta · Future Foundation",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "future-foundation"
          ]
        }
      }
    },
  {
      "id": "surprise_future_foundation",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Fundacja Przyszłości",
      "desc": "Losowa karta · Future Foundation",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "future-foundation"
          ]
        }
      }
    },
  {
      "id": "choice_defenders",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Linia Obrony",
      "desc": "Dowolna karta · Defenders",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "defenders"
          ]
        }
      }
    },
  {
      "id": "surprise_defenders",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Obrońca z Cienia",
      "desc": "Losowa karta · Defenders",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "defenders"
          ]
        }
      }
    },
  {
      "id": "choice_wakanda",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Wybór Wakandy",
      "desc": "Dowolna karta · Wakanda",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "wakanda"
          ]
        }
      }
    },
  {
      "id": "surprise_wakanda",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Dar Wakandy",
      "desc": "Losowa karta · Wakanda",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "wakanda"
          ]
        }
      }
    },
  {
      "id": "choice_black_order",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Rozkaz Thanosa",
      "desc": "Dowolna karta · Black Order",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "black-order"
          ]
        }
      }
    },
  {
      "id": "surprise_black_order",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Czarny Rozkaz",
      "desc": "Losowa karta · Black Order",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "black-order"
          ]
        }
      }
    },
  {
      "id": "choice_asgardians",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Wola Asgardu",
      "desc": "Dowolna karta · Asgardians",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "asgardians"
          ]
        }
      }
    },
  {
      "id": "surprise_asgardians",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Bifrost Przeznaczenia",
      "desc": "Losowa karta · Asgardians",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "asgardians"
          ]
        }
      }
    },
  {
      "id": "choice_fantastic4",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Fantastyczny Wybór",
      "desc": "Dowolna karta · Fantastic4",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "fantastic4"
          ]
        }
      }
    },
  {
      "id": "surprise_fantastic4",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Fantastyczna Niespodzianka",
      "desc": "Losowa karta · Fantastic4",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "fantastic4"
          ]
        }
      }
    },
  {
      "id": "choice_guardians",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Strażnicy na Wezwanie",
      "desc": "Dowolna karta · Guardians",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "guardians"
          ]
        }
      }
    },
  {
      "id": "surprise_guardians",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Kosmiczny Strażnik",
      "desc": "Losowa karta · Guardians",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "guardians"
          ]
        }
      }
    },
  {
      "id": "choice_inhumans",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Królewski Wybór",
      "desc": "Dowolna karta · Inhumans",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "inhumans"
          ]
        }
      }
    },
  {
      "id": "surprise_inhumans",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Terrigenowa Niespodzianka",
      "desc": "Losowa karta · Inhumans",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "inhumans"
          ]
        }
      }
    },
  {
      "id": "choice_midnight_sons",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Krąg Północy",
      "desc": "Dowolna karta · Midnight Sons",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "midnight-sons"
          ]
        }
      }
    },
  {
      "id": "surprise_midnight_sons",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Nocne Przyzwanie",
      "desc": "Losowa karta · Midnight Sons",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "midnight-sons"
          ]
        }
      }
    },
  {
      "id": "choice_shield",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Dyrektywa S.H.I.E.L.D.",
      "desc": "Dowolna karta · Shield",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "shield"
          ]
        }
      }
    },
  {
      "id": "surprise_shield",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Tajna Misja",
      "desc": "Losowa karta · Shield",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "shield"
          ]
        }
      }
    },
  {
      "id": "choice_sinister_six",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Złowieszcza Szóstka",
      "desc": "Dowolna karta · Sinister Six",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "sinister-six"
          ]
        }
      }
    },
  {
      "id": "surprise_sinister_six",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Złowieszcze Rozdanie",
      "desc": "Losowa karta · Sinister Six",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "sinister-six"
          ]
        }
      }
    },
  {
      "id": "choice_thunderbolts",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Projekt Thunderbolts",
      "desc": "Dowolna karta · Thunderbolts",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "thunderbolts"
          ]
        }
      }
    },
  {
      "id": "surprise_thunderbolts",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Rekrutacja Thunderbolts",
      "desc": "Losowa karta · Thunderbolts",
      "sourceCategories": [
        "teams"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "thunderbolts"
          ]
        }
      }
    },
  {
      "id": "choice_monsters",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Bestiariusz",
      "desc": "Dowolna karta · Monsters",
      "sourceCategories": [
        "themes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "monsters"
          ]
        }
      }
    },
  {
      "id": "choice_robots_cyborgs",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Stalowy Wybór",
      "desc": "Dowolna karta · Robots Cyborgs",
      "sourceCategories": [
        "themes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "robots-cyborgs"
          ]
        }
      }
    },
  {
      "id": "choice_antiheroes",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Szara Strefa",
      "desc": "Dowolna karta · Antiheroes",
      "sourceCategories": [
        "themes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "antiheroes"
          ]
        }
      }
    },
  {
      "id": "surprise_antiheroes",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Niepewny Bohater",
      "desc": "Losowa karta · Antiheroes",
      "sourceCategories": [
        "themes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "antiheroes"
          ]
        }
      }
    },
  {
      "id": "choice_villains",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Galeria Złoczyńców",
      "desc": "Dowolna karta · Villains",
      "sourceCategories": [
        "themes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "villains"
          ]
        }
      }
    },
  {
      "id": "surprise_villains",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Złoczyńca z Talii",
      "desc": "Losowa karta · Villains",
      "sourceCategories": [
        "themes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "villains"
          ]
        }
      }
    },
  {
      "id": "choice_cosmic_entities",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Wola Kosmosu",
      "desc": "Dowolna karta · Cosmic Entities",
      "sourceCategories": [
        "themes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "cosmic-entities"
          ]
        }
      }
    },
  {
      "id": "choice_geniuses",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Umysł Stratega",
      "desc": "Dowolna karta · Geniuses",
      "sourceCategories": [
        "themes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "geniuses"
          ]
        }
      }
    },
  {
      "id": "surprise_geniuses",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Genialny Traf",
      "desc": "Losowa karta · Geniuses",
      "sourceCategories": [
        "themes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "geniuses"
          ]
        }
      }
    },
  {
      "id": "choice_power_gte_cost",
      "type": "choice",
      "rarity": "epic",
      "family": "statistics",
      "name": "Przewaga Statystyk",
      "desc": "Dowolna karta · Siła ≥ Koszt",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "power",
            "operator": ">=",
            "right": "cost"
          }
        ]
      }
    },
  {
      "id": "surprise_power_gte_cost",
      "type": "surprise",
      "rarity": "rare",
      "family": "statistics",
      "name": "Moc Ponad Cenę",
      "desc": "Losowa karta · Siła ≥ Koszt",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "power",
            "operator": ">=",
            "right": "cost"
          }
        ]
      }
    },
  {
      "id": "choice_power_greater_than_cost",
      "type": "choice",
      "rarity": "epic",
      "family": "statistics",
      "name": "Dodatni Bilans",
      "desc": "Dowolna karta · Siła > Koszt",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "power",
            "operator": ">",
            "right": "cost"
          }
        ]
      }
    },
  {
      "id": "choice_power_gte_cost_plus2",
      "type": "choice",
      "rarity": "epic",
      "family": "statistics",
      "name": "Nadwyżka Mocy",
      "desc": "Dowolna karta · Siła ≥ Koszt + 2",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "power",
            "operator": ">=",
            "right": "cost",
            "offset": 2
          }
        ]
      }
    },
  {
      "id": "surprise_power_gte_cost_plus2",
      "type": "surprise",
      "rarity": "rare",
      "family": "statistics",
      "name": "Mocny Traf",
      "desc": "Losowa karta · Siła ≥ Koszt + 2",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "power",
            "operator": ">=",
            "right": "cost",
            "offset": 2
          }
        ]
      }
    },
  {
      "id": "choice_power_gte_cost_plus4",
      "type": "choice",
      "rarity": "epic",
      "family": "statistics",
      "name": "Potęga Bez Kompromisów",
      "desc": "Dowolna karta · Siła ≥ Koszt + 4",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "power",
            "operator": ">=",
            "right": "cost",
            "offset": 4
          }
        ]
      }
    },
  {
      "id": "choice_cost_gte_power",
      "type": "choice",
      "rarity": "epic",
      "family": "statistics",
      "name": "Ukryta Wartość",
      "desc": "Dowolna karta · Koszt ≥ Siła",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "cost",
            "operator": ">=",
            "right": "power"
          }
        ]
      }
    },
  {
      "id": "surprise_cost_gte_power",
      "type": "surprise",
      "rarity": "rare",
      "family": "statistics",
      "name": "Ciężar Efektu",
      "desc": "Losowa karta · Koszt ≥ Siła",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "cost",
            "operator": ">=",
            "right": "power"
          }
        ]
      }
    },
  {
      "id": "choice_cost_greater_than_power",
      "type": "choice",
      "rarity": "epic",
      "family": "statistics",
      "name": "Silnik pod Maską",
      "desc": "Dowolna karta · Koszt > Siła",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "cost",
            "operator": ">",
            "right": "power"
          }
        ]
      }
    },
  {
      "id": "choice_cost_gte_power_plus2",
      "type": "choice",
      "rarity": "epic",
      "family": "statistics",
      "name": "Efekt Ponad Staty",
      "desc": "Dowolna karta · Koszt ≥ Siła + 2",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "cost",
            "operator": ">=",
            "right": "power",
            "offset": 2
          }
        ]
      }
    },
  {
      "id": "surprise_cost_gte_power_plus2",
      "type": "surprise",
      "rarity": "epic",
      "family": "statistics",
      "name": "Ukryty Silnik",
      "desc": "Losowa karta · Koszt ≥ Siła + 2",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "cost",
            "operator": ">=",
            "right": "power",
            "offset": 2
          }
        ]
      }
    },
  {
      "id": "choice_equal_cost_power",
      "type": "choice",
      "rarity": "epic",
      "family": "statistics",
      "name": "Idealny Bilans",
      "desc": "Dowolna karta · Koszt = Siła",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "cost",
            "operator": "=",
            "right": "power"
          }
        ]
      }
    },
  {
      "id": "choice_efficient_low_cost",
      "type": "choice",
      "rarity": "epic",
      "family": "statistics",
      "name": "Rakieta Startowa",
      "desc": "Dowolna karta · Koszt maks. 3 · Siła 5+",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "max": 3
        },
        "power": {
          "min": 5
        }
      }
    },
  {
      "id": "surprise_efficient_low_cost",
      "type": "surprise",
      "rarity": "epic",
      "family": "statistics",
      "name": "Tani Potwór",
      "desc": "Losowa karta · Koszt maks. 3 · Siła 5+",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "max": 3
        },
        "power": {
          "min": 5
        }
      }
    },
  {
      "id": "choice_cheap_powerhouse",
      "type": "choice",
      "rarity": "epic",
      "family": "statistics",
      "name": "Kieszonkowa Potęga",
      "desc": "Dowolna karta · Koszt maks. 2 · Siła 4+",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "max": 2
        },
        "power": {
          "min": 4
        }
      }
    },
  {
      "id": "surprise_cheap_powerhouse",
      "type": "surprise",
      "rarity": "epic",
      "family": "statistics",
      "name": "Mały Gigant",
      "desc": "Losowa karta · Koszt maks. 2 · Siła 4+",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "max": 2
        },
        "power": {
          "min": 4
        }
      }
    },
  {
      "id": "choice_heavy_hitter",
      "type": "choice",
      "rarity": "epic",
      "family": "statistics",
      "name": "Kosmiczny Finisher",
      "desc": "Dowolna karta · Koszt 5+ · Siła 10+",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "min": 5
        },
        "power": {
          "min": 10
        }
      }
    },
  {
      "id": "surprise_heavy_hitter",
      "type": "surprise",
      "rarity": "epic",
      "family": "statistics",
      "name": "Ciężki Finisher",
      "desc": "Losowa karta · Koszt 5+ · Siła 10+",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "min": 5
        },
        "power": {
          "min": 10
        }
      }
    },
  {
      "id": "choice_upper_curve_power",
      "type": "choice",
      "rarity": "epic",
      "family": "statistics",
      "name": "Ciężka Artyleria",
      "desc": "Dowolna karta · Koszt 4+ · Siła 8+",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "min": 4
        },
        "power": {
          "min": 8
        }
      }
    },
  {
      "id": "surprise_upper_curve_power",
      "type": "surprise",
      "rarity": "epic",
      "family": "statistics",
      "name": "Salwa z Orbity",
      "desc": "Losowa karta · Koszt 4+ · Siła 8+",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "min": 4
        },
        "power": {
          "min": 8
        }
      }
    },
  {
      "id": "choice_low_power_engine",
      "type": "choice",
      "rarity": "epic",
      "family": "statistics",
      "name": "Cichy Silnik",
      "desc": "Dowolna karta · Koszt maks. 3 · Siła 0 lub mniej",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "max": 3
        },
        "power": {
          "max": 0
        }
      }
    },
  {
      "id": "surprise_low_power_engine",
      "type": "surprise",
      "rarity": "epic",
      "family": "statistics",
      "name": "Ukryty Mechanizm",
      "desc": "Losowa karta · Koszt maks. 3 · Siła 0 lub mniej",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "max": 3
        },
        "power": {
          "max": 0
        }
      }
    },
  {
      "id": "choice_massive_finisher",
      "type": "choice",
      "rarity": "epic",
      "family": "statistics",
      "name": "Kolaps Gwiazdy",
      "desc": "Dowolna karta · Koszt 6+ · Siła 12+",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "min": 6
        },
        "power": {
          "min": 12
        }
      }
    },
  {
      "id": "surprise_massive_finisher",
      "type": "surprise",
      "rarity": "epic",
      "family": "statistics",
      "name": "Nadciąga Kolos",
      "desc": "Losowa karta · Koszt 6+ · Siła 12+",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "min": 6
        },
        "power": {
          "min": 12
        }
      }
    },
  {
    "id": "choice_heavy_brick",
    "type": "choice",
    "rarity": "rare",
    "family": "statistics",
    "name": "Ciężki Silnik",
    "desc": "Dowolna karta · Koszt 5+ · Siła maks. 2",
    "sourceCategories": [
      "statistics"
    ],
    "filter": {
      "cost": {
        "min": 5
      },
      "power": {
        "max": 2
      }
    }
  },
  {
      "id": "choice_energy_collapse",
      "type": "choice",
      "rarity": "epic",
      "family": "statistics",
      "name": "Załamanie Kontrolowane",
      "desc": "Dowolna karta · Koszt 6 · Siła maks. 6",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "exact": 6
        },
        "power": {
          "max": 6
        }
      }
    },
  {
      "id": "choice_duelist",
      "type": "choice",
      "rarity": "epic",
      "family": "statistics",
      "name": "Wybór Duelisty",
      "desc": "Dowolna karta · Koszt 3 · Siła 3–6",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "exact": 3
        },
        "power": {
          "min": 3,
          "max": 6
        }
      }
    },
  {
      "id": "choice_cheap_trick",
      "type": "choice",
      "rarity": "epic",
      "family": "statistics",
      "name": "Sztuczka na Życzenie",
      "desc": "Dowolna karta · Koszt 1 · Siła maks. 2",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "exact": 1
        },
        "power": {
          "max": 2
        }
      }
    },
  {
      "id": "choice_banned_card",
      "type": "choice",
      "rarity": "legendary",
      "family": "special",
      "name": "Zakazany As",
      "desc": "Dowolna banowana karta",
      "sourceCategories": [
        "special"
      ],
      "poolSource": {
        "kind": "banned-cards",
        "excludeOwnDeck": true,
        "excludeNames": [
          "Loki",
          "Arishem"
        ]
      }
    },
  {
      "id": "surprise_banned_card",
      "type": "surprise",
      "rarity": "legendary",
      "family": "special",
      "name": "Zakazane Rozdanie",
      "desc": "3 losowe banowane karty · wybierz 1",
      "sourceCategories": [
        "special"
      ],
      "poolSource": {
        "kind": "banned-cards",
        "excludeOwnDeck": true,
        "excludeNames": [
          "Loki",
          "Arishem"
        ]
      }
    },
  {
      "id": "choice_opponent_drafted",
      "type": "choice",
      "rarity": "legendary",
      "family": "special",
      "name": "Echo Rywali",
      "desc": "Kopia dowolnej karty wybranej już przez innego gracza",
      "sourceCategories": [
        "special"
      ],
      "poolSource": {
        "kind": "drafted-by-others",
        "excludeOwnDeck": true
      }
    },
  {
      "id": "surprise_opponent_drafted",
      "type": "surprise",
      "rarity": "epic",
      "family": "special",
      "name": "Powtórka z Draftu",
      "desc": "3 losowe karty wybrane już przez innych graczy · wybierz 1 kopię",
      "sourceCategories": [
        "special"
      ],
      "poolSource": {
        "kind": "drafted-by-others",
        "excludeOwnDeck": true
      }
    },
  {
      "id": "choice_graveyard_copy",
      "type": "choice",
      "rarity": "legendary",
      "family": "special",
      "name": "Archiwum Umarłych",
      "desc": "Kopia dowolnej realnej karty z Kosmicznego Cmentarzyska",
      "sourceCategories": [
        "special"
      ],
      "poolSource": {
        "kind": "graveyard",
        "status": "available",
        "excludeJokers": true,
        "excludeOwnDeck": true
      }
    },
  {
      "id": "surprise_graveyard_copy",
      "type": "surprise",
      "rarity": "epic",
      "family": "special",
      "name": "Szept Cmentarzyska",
      "desc": "3 losowe realne karty z Kosmicznego Cmentarzyska · wybierz 1 kopię",
      "sourceCategories": [
        "special"
      ],
      "poolSource": {
        "kind": "graveyard",
        "status": "available",
        "excludeJokers": true,
        "excludeOwnDeck": true
      }
    },
  {
      "id": "choice_joker_rejected",
      "type": "choice",
      "rarity": "epic",
      "family": "special",
      "name": "Druga Szansa",
      "desc": "Kopia dowolnej karty odrzuconej wcześniej przez Surprise Jokera",
      "sourceCategories": [
        "special"
      ],
      "poolSource": {
        "kind": "graveyard",
        "categories": [
          "jokerRejected"
        ],
        "status": "available",
        "excludeJokers": true,
        "excludeOwnDeck": true
      }
    },
  {
      "id": "surprise_joker_rejected",
      "type": "surprise",
      "rarity": "epic",
      "family": "special",
      "name": "Odrzucone Przeznaczenie",
      "desc": "3 losowe karty odrzucone wcześniej przez Surprise Jokery · wybierz 1 kopię",
      "sourceCategories": [
        "special"
      ],
      "poolSource": {
        "kind": "graveyard",
        "categories": [
          "jokerRejected"
        ],
        "status": "available",
        "excludeJokers": true,
        "excludeOwnDeck": true
      }
    },
  {
      "id": "choice_completed_pack_history",
      "type": "choice",
      "rarity": "legendary",
      "family": "special",
      "name": "Archiwum Paczek",
      "desc": "Kopia dowolnej realnej karty widzianej we wcześniej zakończonych paczkach",
      "sourceCategories": [
        "special"
      ],
      "poolSource": {
        "kind": "completed-packs",
        "excludeJokers": true,
        "excludeOwnDeck": true
      }
    },
  {
      "id": "surprise_completed_pack_history",
      "type": "surprise",
      "rarity": "epic",
      "family": "special",
      "name": "Kosmiczna Powtórka",
      "desc": "3 losowe karty z wcześniej zakończonych paczek · wybierz 1 kopię",
      "sourceCategories": [
        "special"
      ],
      "poolSource": {
        "kind": "completed-packs",
        "excludeJokers": true,
        "excludeOwnDeck": true
      }
    },
  {
      "id": "choice_current_pack_copy",
      "type": "choice",
      "rarity": "legendary",
      "family": "special",
      "name": "Lustrzane Rozdanie",
      "desc": "Kopia dowolnej realnej karty z aktualnej paczki",
      "sourceCategories": [
        "special"
      ],
      "poolSource": {
        "kind": "current-pack",
        "excludeJokers": true,
        "excludeOwnDeck": true
      }
    },
  {
      "id": "choice_on_reveal_cost4",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "tag-stat",
      "name": "Wielki Reveal",
      "desc": "Dowolna karta · On Reveal · Koszt 4+",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "on-reveal"
          ]
        },
        "cost": {
          "min": 4
        }
      }
    },
  {
      "id": "surprise_on_reveal_cost4",
      "type": "surprise",
      "rarity": "rare",
      "family": "hybrid",
      "hybridType": "tag-stat",
      "name": "Ostatnie Odkrycie",
      "desc": "Losowa karta · On Reveal · Koszt 4+",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "on-reveal"
          ]
        },
        "cost": {
          "min": 4
        }
      }
    },
  {
      "id": "choice_ongoing_cost3_or_less",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "tag-stat",
      "name": "Wieczny Silnik",
      "desc": "Dowolna karta · Ongoing · Koszt maks. 3",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "ongoing"
          ]
        },
        "cost": {
          "max": 3
        }
      }
    },
  {
      "id": "surprise_ongoing_cost3_or_less",
      "type": "surprise",
      "rarity": "rare",
      "family": "hybrid",
      "hybridType": "tag-stat",
      "name": "Tani Ongoing",
      "desc": "Losowa karta · Ongoing · Koszt maks. 3",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "ongoing"
          ]
        },
        "cost": {
          "max": 3
        }
      }
    },
  {
      "id": "choice_animals_cost2_or_less",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "faction-stat",
      "name": "Tania Bestia",
      "desc": "Dowolna karta · Animals · Koszt maks. 2",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "animals"
          ]
        },
        "cost": {
          "max": 2
        }
      }
    },
  {
      "id": "surprise_animals_cost2_or_less",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "faction-stat",
      "name": "Dziki Start",
      "desc": "Losowa karta · Animals · Koszt maks. 2",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "animals"
          ]
        },
        "cost": {
          "max": 2
        }
      }
    },
  {
      "id": "choice_cosmic_cost5_plus",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "faction-stat",
      "name": "Kosmiczny Tytan",
      "desc": "Dowolna karta · Cosmic Entities · Koszt 5+",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "cosmic-entities"
          ]
        },
        "cost": {
          "min": 5
        }
      }
    },
  {
      "id": "surprise_cosmic_cost5_plus",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "faction-stat",
      "name": "Gniew Kosmosu",
      "desc": "Losowa karta · Cosmic Entities · Koszt 5+",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "cosmic-entities"
          ]
        },
        "cost": {
          "min": 5
        }
      }
    },
  {
        "id": "choice_avengers_cost3_or_less",
        "type": "choice",
        "rarity": "epic",
        "family": "hybrid",
        "hybridType": "faction-stat",
        "name": "Avengers: Szybka Mobilizacja",
        "desc": "Dowolna karta · Avengers family · Koszt maks. 3",
        "sourceCategories": [
            "hybrid"
        ],
        "filter": {
            "tags": {
                "anyOf": [
                    "avengers",
                    "new-avengers",
                    "west-coast-avengers",
                    "dark-avengers",
                    "young-avengers"
                ]
            },
            "cost": {
                "max": 3
            }
        }
    },
  {
      "id": "surprise_avengers_cost3_or_less",
      "type": "surprise",
      "rarity": "rare",
      "family": "hybrid",
      "hybridType": "faction-stat",
      "name": "Avengers Reinforcement",
      "desc": "Losowa karta · Avengers family · Koszt maks. 3",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "anyOf": [
            "avengers",
            "new-avengers",
            "west-coast-avengers",
            "dark-avengers",
            "young-avengers"
          ]
        },
        "cost": {
          "max": 3
        }
      }
    },
  {
      "id": "choice_x_family_power5_plus",
      "type": "choice",
      "rarity": "rare",
      "family": "hybrid",
      "hybridType": "faction-stat",
      "name": "Mutant Elite",
      "desc": "Dowolna karta · X-family · Siła 5+",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "anyOf": [
            "xmen",
            "x-force",
            "new-mutants"
          ]
        },
        "power": {
          "min": 5
        }
      }
    },
  {
      "id": "surprise_x_family_power5_plus",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "faction-stat",
      "name": "Gen X: Omega",
      "desc": "Losowa karta · X-family · Siła 5+",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "anyOf": [
            "xmen",
            "x-force",
            "new-mutants"
          ]
        },
        "power": {
          "min": 5
        }
      }
    },
  {
      "id": "choice_card_generation_cost2_or_less",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "tag-stat",
      "name": "Tani Generator",
      "desc": "Dowolna karta · Card Generation · Koszt maks. 2",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "card-generation"
          ]
        },
        "cost": {
          "max": 2
        }
      }
    },
  {
      "id": "surprise_card_generation_cost2_or_less",
      "type": "surprise",
      "rarity": "rare",
      "family": "hybrid",
      "hybridType": "tag-stat",
      "name": "Drobna Przesyłka",
      "desc": "Losowa karta · Card Generation · Koszt maks. 2",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "card-generation"
          ]
        },
        "cost": {
          "max": 2
        }
      }
    },
  {
      "id": "choice_self_buff_above_curve",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "tag-stat-relation",
      "name": "Moc za Cenę",
      "desc": "Dowolna karta · Self Buff · Siła > Koszt",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "self-buff"
          ]
        },
        "relations": [
          {
            "left": "power",
            "operator": ">",
            "right": "cost"
          }
        ]
      }
    },
  {
      "id": "surprise_self_buff_above_curve",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "tag-stat-relation",
      "name": "Przeciążony Wojownik",
      "desc": "Losowa karta · Self Buff · Siła > Koszt",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "self-buff"
          ]
        },
        "relations": [
          {
            "left": "power",
            "operator": ">",
            "right": "cost"
          }
        ]
      }
    },
  {
      "id": "choice_location_on_reveal",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "multi-tag-all",
      "name": "Odsłona Rzeczywistości",
      "desc": "Dowolna karta · Location + On Reveal",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "on-reveal"
          ],
          "anyOf": [
            "location-control",
            "location-points"
          ]
        }
      }
    },
  {
      "id": "surprise_location_on_reveal",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "multi-tag-all",
      "name": "Pęknięcie Świata",
      "desc": "Losowa karta · Location + On Reveal",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "on-reveal"
          ],
          "anyOf": [
            "location-control",
            "location-points"
          ]
        }
      }
    },
  {
      "id": "choice_move_destroy",
      "type": "choice",
      "rarity": "rare",
      "family": "hybrid",
      "hybridType": "multi-tag-all",
      "name": "Mobilny Zabójca",
      "desc": "Dowolna karta · Move + Destroy",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "move",
            "destroy"
          ]
        }
      }
    },
  {
      "id": "surprise_move_destroy",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "multi-tag-all",
      "name": "Ruchomy Chaos",
      "desc": "Losowa karta · Move + Destroy",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "move",
            "destroy"
          ]
        }
      }
    },
  {
      "id": "choice_magicians_villains",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "multi-tag-all",
      "name": "Mroczny Magik",
      "desc": "Dowolna karta · Magicians + Villains",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "magicians",
            "villains"
          ]
        }
      }
    },
  {
      "id": "surprise_magicians_villains",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "multi-tag-all",
      "name": "Zakazane Arkana",
      "desc": "Losowa karta · Magicians + Villains",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "magicians",
            "villains"
          ]
        }
      }
    },
  {
      "id": "choice_symbiote_destroy",
      "type": "choice",
      "rarity": "rare",
      "family": "hybrid",
      "hybridType": "multi-tag-all",
      "name": "Symbiotyczny Głód",
      "desc": "Dowolna karta · Symbiotes + Destroy",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "symbiotes",
            "destroy"
          ]
        }
      }
    },
  {
      "id": "choice_ongoing_tech",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "multi-tag-all",
      "name": "Stała Kontra",
      "desc": "Dowolna karta · Ongoing + Tech",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "ongoing",
            "tech"
          ]
        }
      }
    },
  {
      "id": "surprise_ongoing_tech",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "multi-tag-all",
      "name": "Wieczny Plan B",
      "desc": "Losowa karta · Ongoing + Tech",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "ongoing",
            "tech"
          ]
        }
      }
    },
  {
      "id": "choice_on_reveal_tech",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "multi-tag-all",
      "name": "Natychmiastowa Kontra",
      "desc": "Dowolna karta · On Reveal + Tech",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "on-reveal",
            "tech"
          ]
        }
      }
    },
  {
      "id": "surprise_on_reveal_tech",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "multi-tag-all",
      "name": "Reakcja Łańcuchowa",
      "desc": "Losowa karta · On Reveal + Tech",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "on-reveal",
            "tech"
          ]
        }
      }
    },
  {
      "id": "choice_destroy_trigger",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "multi-tag-all",
      "name": "Łańcuch Destrukcji",
      "desc": "Dowolna karta · Destroy + Trigger Card",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "destroy",
            "trigger-card"
          ]
        }
      }
    },
  {
      "id": "choice_cost_reduction_card_generation",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "multi-tag-all",
      "name": "Ekonomia Chaosu",
      "desc": "Dowolna karta · Cost Reduction + Card Generation",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "cost-reduction",
            "card-generation"
          ]
        }
      }
    },
  {
      "id": "surprise_cost_reduction_card_generation",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "multi-tag-all",
      "name": "Promocyjne Rozdanie",
      "desc": "Losowa karta · Cost Reduction + Card Generation",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "cost-reduction",
            "card-generation"
          ]
        }
      }
    },
  {
      "id": "choice_energy_ramp_on_reveal",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "multi-tag-all",
      "name": "Skok Napięcia",
      "desc": "Dowolna karta · Energy Ramp + On Reveal",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "on-reveal"
          ],
          "anyOf": [
            "energy",
            "ramp"
          ]
        }
      }
    },
  {
      "id": "surprise_energy_ramp_on_reveal",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "multi-tag-all",
      "name": "Energia z Rękawa",
      "desc": "Losowa karta · Energy Ramp + On Reveal",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "on-reveal"
          ],
          "anyOf": [
            "energy",
            "ramp"
          ]
        }
      }
    },
  {
      "id": "choice_discard_on_reveal",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "multi-tag-all",
      "name": "Kontrolowany Odrzut",
      "desc": "Dowolna karta · Discard + On Reveal",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "discard",
            "on-reveal"
          ]
        }
      }
    },
  {
      "id": "surprise_discard_on_reveal",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "multi-tag-all",
      "name": "Odrzut z Kapelusza",
      "desc": "Losowa karta · Discard + On Reveal",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "discard",
            "on-reveal"
          ]
        }
      }
    },
  {
      "id": "choice_destroy_on_reveal",
      "type": "choice",
      "rarity": "rare",
      "family": "hybrid",
      "hybridType": "multi-tag-all",
      "name": "Rozkaz Zniszczenia",
      "desc": "Dowolna karta · Destroy + On Reveal",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "destroy",
            "on-reveal"
          ]
        }
      }
    },
  {
      "id": "surprise_destroy_on_reveal",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "multi-tag-all",
      "name": "Detonacja",
      "desc": "Losowa karta · Destroy + On Reveal",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "destroy",
            "on-reveal"
          ]
        }
      }
    },
  {
      "id": "choice_move_trigger",
      "type": "choice",
      "rarity": "rare",
      "family": "hybrid",
      "hybridType": "multi-tag-all",
      "name": "Kinetyczny Zapłon",
      "desc": "Dowolna karta · Move + Trigger Card",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "move",
            "trigger-card"
          ]
        }
      }
    },
  {
      "id": "surprise_move_trigger",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "multi-tag-all",
      "name": "Ruchomy Spust",
      "desc": "Losowa karta · Move + Trigger Card",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "move",
            "trigger-card"
          ]
        }
      }
    },
  {
      "id": "choice_villains_tech",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "multi-tag-all",
      "name": "Złoczyńczy Plan",
      "desc": "Dowolna karta · Villains + Tech",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "villains",
            "tech"
          ]
        }
      }
    },
  {
      "id": "surprise_villains_tech",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "multi-tag-all",
      "name": "Brudna Sztuczka",
      "desc": "Losowa karta · Villains + Tech",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "villains",
            "tech"
          ]
        }
      }
    },
  {
      "id": "choice_avengers_on_reveal",
      "type": "choice",
      "rarity": "rare",
      "family": "hybrid",
      "hybridType": "faction-ability",
      "name": "Avengers: Reakcja",
      "desc": "Dowolna karta · Avengers family + On Reveal",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "on-reveal"
          ],
          "anyOf": [
            "avengers",
            "new-avengers",
            "west-coast-avengers",
            "dark-avengers",
            "young-avengers"
          ]
        }
      }
    },
  {
      "id": "surprise_avengers_on_reveal",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "faction-ability",
      "name": "Sygnał Avengers",
      "desc": "Losowa karta · Avengers family + On Reveal",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "on-reveal"
          ],
          "anyOf": [
            "avengers",
            "new-avengers",
            "west-coast-avengers",
            "dark-avengers",
            "young-avengers"
          ]
        }
      }
    },
  {
      "id": "choice_x_family_on_reveal",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "faction-ability",
      "name": "Mutancka Reakcja",
      "desc": "Dowolna karta · X-family + On Reveal",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "on-reveal"
          ],
          "anyOf": [
            "xmen",
            "x-force",
            "new-mutants"
          ]
        }
      }
    },
  {
      "id": "surprise_x_family_on_reveal",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "hybridType": "faction-ability",
      "name": "Gen X: Odkrycie",
      "desc": "Losowa karta · X-family + On Reveal",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "on-reveal"
          ],
          "anyOf": [
            "xmen",
            "x-force",
            "new-mutants"
          ]
        }
      }
    },
  {
      "id": "choice_cost_1_or_6_plus",
      "type": "choice",
      "rarity": "legendary",
      "family": "statistics",
      "name": "Skrajności",
      "desc": "Dowolna karta · Koszt 1 lub 6+",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "anyOf": [
            {
              "exact": 1
            },
            {
              "min": 6
            }
          ]
        }
      },
      "hybridType": "stat-or"
    },
  {
      "id": "surprise_cost_1_or_6_plus",
      "type": "surprise",
      "rarity": "rare",
      "family": "statistics",
      "name": "Od Krańca do Krańca",
      "desc": "Losowa karta · Koszt 1 lub 6+",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "anyOf": [
            {
              "exact": 1
            },
            {
              "min": 6
            }
          ]
        }
      },
      "hybridType": "stat-or"
    },
  {
      "id": "choice_power_exact_cost_plus1",
      "type": "choice",
      "rarity": "epic",
      "family": "statistics",
      "name": "Schodek w Górę",
      "desc": "Dowolna karta · Siła = Koszt + 1",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "power",
            "operator": "=",
            "right": "cost",
            "offset": 1
          }
        ]
      },
      "hybridType": "stat-relation"
    },
  {
      "id": "surprise_power_exact_cost_plus1",
      "type": "surprise",
      "rarity": "rare",
      "family": "statistics",
      "name": "Krok Wyżej",
      "desc": "Losowa karta · Siła = Koszt + 1",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "power",
            "operator": "=",
            "right": "cost",
            "offset": 1
          }
        ]
      },
      "hybridType": "stat-relation"
    },
  {
      "id": "choice_power_exact_cost_minus1",
      "type": "choice",
      "rarity": "epic",
      "family": "statistics",
      "name": "Schodek w Dół",
      "desc": "Dowolna karta · Siła = Koszt − 1",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "power",
            "operator": "=",
            "right": "cost",
            "offset": -1
          }
        ]
      },
      "hybridType": "stat-relation"
    },
  {
      "id": "surprise_power_exact_cost_minus1",
      "type": "surprise",
      "rarity": "epic",
      "family": "statistics",
      "name": "Krok Niżej",
      "desc": "Losowa karta · Siła = Koszt − 1",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "power",
            "operator": "=",
            "right": "cost",
            "offset": -1
          }
        ]
      },
      "hybridType": "stat-relation"
    },
  {
      "id": "choice_power_exact_cost_plus2",
      "type": "choice",
      "rarity": "epic",
      "family": "statistics",
      "name": "Podwójny Schodek",
      "desc": "Dowolna karta · Siła = Koszt + 2",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "power",
            "operator": "=",
            "right": "cost",
            "offset": 2
          }
        ]
      },
      "hybridType": "stat-relation"
    },
  {
      "id": "surprise_power_exact_cost_plus2",
      "type": "surprise",
      "rarity": "rare",
      "family": "statistics",
      "name": "Dwa Kroki Wyżej",
      "desc": "Losowa karta · Siła = Koszt + 2",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "power",
            "operator": "=",
            "right": "cost",
            "offset": 2
          }
        ]
      },
      "hybridType": "stat-relation"
    },
  {
      "id": "choice_power_exact_cost_minus2",
      "type": "choice",
      "rarity": "epic",
      "family": "statistics",
      "name": "Dwa Kroki w Dół",
      "desc": "Dowolna karta · Siła = Koszt − 2",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "power",
            "operator": "=",
            "right": "cost",
            "offset": -2
          }
        ]
      },
      "hybridType": "stat-relation"
    },
  {
      "id": "surprise_power_exact_cost_minus2",
      "type": "surprise",
      "rarity": "epic",
      "family": "statistics",
      "name": "Podwójny Spadek",
      "desc": "Losowa karta · Siła = Koszt − 2",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "power",
            "operator": "=",
            "right": "cost",
            "offset": -2
          }
        ]
      },
      "hybridType": "stat-relation"
    },
  {
      "id": "choice_power_double_cost",
      "type": "choice",
      "rarity": "rare",
      "family": "statistics",
      "name": "Podwójny Przelicznik",
      "desc": "Dowolna karta · Siła = 2 × Koszt",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "power",
            "operator": "=",
            "right": "cost",
            "rightMultiplier": 2
          }
        ]
      },
      "hybridType": "stat-relation-multiplier"
    },
  {
      "id": "surprise_power_double_cost",
      "type": "surprise",
      "rarity": "epic",
      "family": "statistics",
      "name": "Dublet Mocy",
      "desc": "Losowa karta · Siła = 2 × Koszt",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "power",
            "operator": "=",
            "right": "cost",
            "rightMultiplier": 2
          }
        ]
      },
      "hybridType": "stat-relation-multiplier"
    },
  {
      "id": "choice_cost_double_power",
      "type": "choice",
      "rarity": "rare",
      "family": "statistics",
      "name": "Odwrócona Stawka",
      "desc": "Dowolna karta · Koszt = 2 × Siła",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "cost",
            "operator": "=",
            "right": "power",
            "rightMultiplier": 2
          }
        ]
      },
      "hybridType": "stat-relation-multiplier"
    },
  {
      "id": "surprise_cost_double_power",
      "type": "surprise",
      "rarity": "epic",
      "family": "statistics",
      "name": "Cena Podwójna",
      "desc": "Losowa karta · Koszt = 2 × Siła",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "relations": [
          {
            "left": "cost",
            "operator": "=",
            "right": "power",
            "rightMultiplier": 2
          }
        ]
      },
      "hybridType": "stat-relation-multiplier"
    },
  {
      "id": "choice_two_ability_types",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Podwójna Tożsamość",
      "desc": "Dowolna karta · Co najmniej 2 Ability Types",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tagCounts": [
          {
            "categories": [
              "abilityTypes"
            ],
            "min": 2
          }
        ]
      },
      "hybridType": "tag-count"
    },
  {
      "id": "surprise_two_ability_types",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Dwie Twarze",
      "desc": "Losowa karta · Co najmniej 2 Ability Types",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tagCounts": [
          {
            "categories": [
              "abilityTypes"
            ],
            "min": 2
          }
        ]
      },
      "hybridType": "tag-count"
    },
  {
      "id": "choice_two_ability_two_archetypes",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Przeładowany System",
      "desc": "Dowolna karta · Min. 2 Ability Types + min. 2 Rodziny/Archetypy",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tagCounts": [
          {
            "categories": [
              "abilityTypes"
            ],
            "min": 2
          },
          {
            "categories": [
              "mechanicFamilies",
              "deckArchetypes"
            ],
            "min": 2
          }
        ]
      },
      "hybridType": "tag-count-combo"
    },
  {
      "id": "surprise_two_ability_two_archetypes",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Szwajcarski Scyzoryk",
      "desc": "Losowa karta · Min. 2 Ability Types + min. 2 Rodziny/Archetypy",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tagCounts": [
          {
            "categories": [
              "abilityTypes"
            ],
            "min": 2
          },
          {
            "categories": [
              "mechanicFamilies",
              "deckArchetypes"
            ],
            "min": 2
          }
        ]
      },
      "hybridType": "tag-count-combo"
    },
  {
      "id": "choice_three_archetypes",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Wielozadaniowiec",
      "desc": "Dowolna karta · Co najmniej 3 Rodziny/Archetypy",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tagCounts": [
          {
            "categories": [
              "mechanicFamilies",
              "deckArchetypes"
            ],
            "min": 3
          }
        ]
      },
      "hybridType": "tag-count"
    },
  {
      "id": "surprise_three_archetypes",
      "type": "surprise",
      "rarity": "rare",
      "family": "hybrid",
      "name": "Wiele Dróg",
      "desc": "Losowa karta · Co najmniej 3 Rodziny/Archetypy",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tagCounts": [
          {
            "categories": [
              "mechanicFamilies",
              "deckArchetypes"
            ],
            "min": 3
          }
        ]
      },
      "hybridType": "tag-count"
    },
  {
      "id": "choice_three_subtypes",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Mechaniczny Scyzoryk",
      "desc": "Dowolna karta · Co najmniej 3 Subtypes",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tagCounts": [
          {
            "categories": [
              "subtypes"
            ],
            "min": 3
          }
        ]
      },
      "hybridType": "tag-count"
    },
  {
      "id": "surprise_three_subtypes",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Pełen Pakiet",
      "desc": "Losowa karta · Co najmniej 3 Subtypes",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tagCounts": [
          {
            "categories": [
              "subtypes"
            ],
            "min": 3
          }
        ]
      },
      "hybridType": "tag-count"
    },
  {
      "id": "choice_early_series_on_reveal",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Prehistoryczne Odkrycie",
      "desc": "Dowolna karta · Starter / Recruit / Series 0–1 + On Reveal",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "on-reveal"
          ],
          "anyOf": [
            "starter",
            "recruit-pass",
            "series0",
            "series1"
          ]
        }
      },
      "hybridType": "series-ability"
    },
  {
      "id": "surprise_early_series_on_reveal",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Stare Dobre Odkrycie",
      "desc": "Losowa karta · Starter / Recruit / Series 0–1 + On Reveal",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "on-reveal"
          ],
          "anyOf": [
            "starter",
            "recruit-pass",
            "series0",
            "series1"
          ]
        }
      },
      "hybridType": "series-ability"
    },
  {
      "id": "choice_series1_on_reveal",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Pierwsze Odkrycie",
      "desc": "Dowolna karta · Series 1 + On Reveal",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "on-reveal",
            "series1"
          ]
        }
      },
      "hybridType": "series-ability"
    },
  {
      "id": "surprise_series1_on_reveal",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Odkrycie z Serii Pierwszej",
      "desc": "Losowa karta · Series 1 + On Reveal",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "on-reveal",
            "series1"
          ]
        }
      },
      "hybridType": "series-ability"
    },
  {
      "id": "choice_starter_zero_on_reveal",
      "type": "choice",
      "rarity": "rare",
      "family": "hybrid",
      "name": "Pierwotny Reveal",
      "desc": "Dowolna karta · Starter / Series 0 + On Reveal",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "on-reveal"
          ],
          "anyOf": [
            "starter",
            "series0"
          ]
        }
      },
      "hybridType": "series-ability"
    },
  {
      "id": "surprise_starter_zero_on_reveal",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Pierwsza Iskra",
      "desc": "Losowa karta · Starter / Series 0 + On Reveal",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "on-reveal"
          ],
          "anyOf": [
            "starter",
            "series0"
          ]
        }
      },
      "hybridType": "series-ability"
    },
  {
      "id": "choice_modern_on_reveal",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Nowoczesne Odkrycie",
      "desc": "Dowolna karta · Series 4–5 + On Reveal",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "on-reveal"
          ],
          "anyOf": [
            "series4",
            "series5"
          ]
        }
      },
      "hybridType": "series-ability"
    },
  {
      "id": "surprise_modern_on_reveal",
      "type": "surprise",
      "rarity": "rare",
      "family": "hybrid",
      "name": "Odkrycie Nowej Ery",
      "desc": "Losowa karta · Series 4–5 + On Reveal",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "on-reveal"
          ],
          "anyOf": [
            "series4",
            "series5"
          ]
        }
      },
      "hybridType": "series-ability"
    },
  {
      "id": "choice_modern_activate",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Eksperymentalna Technologia",
      "desc": "Dowolna karta · Series 4–5 + Activate",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "activate"
          ],
          "anyOf": [
            "series4",
            "series5"
          ]
        }
      },
      "hybridType": "series-ability"
    },
  {
      "id": "surprise_modern_activate",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Nowy Prototyp",
      "desc": "Losowa karta · Series 4–5 + Activate",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "activate"
          ],
          "anyOf": [
            "series4",
            "series5"
          ]
        }
      },
      "hybridType": "series-ability"
    },
  {
      "id": "choice_combo_or",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Wielkie Combo",
      "desc": "Dowolna karta · Ongoing Combo lub Wong Reveal",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "anyOf": [
            "spectrum-ongoing",
            "tribunal-ongoing",
            "wongreveal"
          ]
        }
      },
      "hybridType": "tag-or"
    },
  {
      "id": "surprise_combo_or",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Combo z Kapelusza",
      "desc": "Losowa karta · Ongoing Combo lub Wong Reveal",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "anyOf": [
            "spectrum-ongoing",
            "tribunal-ongoing",
            "wongreveal"
          ]
        }
      },
      "hybridType": "tag-or"
    },
  {
      "id": "choice_copy_multiplier_or",
      "type": "choice",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Komora Echa",
      "desc": "Dowolna karta · Effect Replication lub Card Copy",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "anyOf": [
            "effect-replication",
            "card-copy"
          ]
        }
      },
      "hybridType": "mechanic-or"
    },
  {
      "id": "surprise_copy_multiplier_or",
      "type": "surprise",
      "rarity": "epic",
      "family": "hybrid",
      "name": "Echo Kosmosu",
      "desc": "Losowa karta · Effect Replication lub Card Copy",
      "sourceCategories": [
        "hybrid"
      ],
      "filter": {
        "tags": {
          "anyOf": [
            "effect-replication",
            "card-copy"
          ]
        }
      },
      "hybridType": "mechanic-or"
    },
  {
    "id": "choice_cheap_star",
    "type": "choice",
    "rarity": "rare",
    "family": "hybrid",
    "name": "Tania Gwiazda",
    "desc": "Dowolna karta · Koszt maks. 2 · Siła 5+",
    "sourceCategories": [
      "hybrid"
    ],
    "filter": {
      "cost": {
        "max": 2
      },
      "power": {
        "min": 5
      }
    },
    "hybridType": "stat-package"
  },
  {
    "id": "surprise_cheap_star",
    "type": "surprise",
    "rarity": "rare",
    "family": "hybrid",
    "name": "Mała Gwiazda",
    "desc": "Losowa karta · Koszt maks. 2 · Siła 5+",
    "sourceCategories": [
      "hybrid"
    ],
    "filter": {
      "cost": {
        "max": 2
      },
      "power": {
        "min": 5
      }
    },
    "hybridType": "stat-package"
  },
  {
      "id": "choice_cost_3_power_2_or_less",
      "type": "choice",
      "rarity": "rare",
      "family": "statistics",
      "name": "Cichy Slot III",
      "desc": "Dowolna karta · Koszt 3 · Siła 2 lub mniej",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "exact": 3
        },
        "power": {
          "max": 2
        }
      }
    },
  {
      "id": "surprise_cost_3_power_2_or_less",
      "type": "surprise",
      "rarity": "epic",
      "family": "statistics",
      "name": "Trójka z Cienia",
      "desc": "Losowa karta · Koszt 3 · Siła 2 lub mniej",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "exact": 3
        },
        "power": {
          "max": 2
        }
      }
    },
  {
      "id": "choice_cost_4_power_3_or_less",
      "type": "choice",
      "rarity": "rare",
      "family": "statistics",
      "name": "Cichy Slot IV",
      "desc": "Dowolna karta · Koszt 4 · Siła 3 lub mniej",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "exact": 4
        },
        "power": {
          "max": 3
        }
      }
    },
  {
      "id": "surprise_cost_4_power_3_or_less",
      "type": "surprise",
      "rarity": "epic",
      "family": "statistics",
      "name": "Czwórka z Cienia",
      "desc": "Losowa karta · Koszt 4 · Siła 3 lub mniej",
      "sourceCategories": [
        "statistics"
      ],
      "filter": {
        "cost": {
          "exact": 4
        },
        "power": {
          "max": 3
        }
      }
    },
  {
      "id": "choice_mini_movers_low_cost",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Kieszonkowy Ruch",
      "desc": "Dowolna karta · Mini Movers · Koszt 1–2",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "cost": {
          "min": 1,
          "max": 2
        },
        "tags": {
          "allOf": [
            "mini-movers"
          ]
        }
      }
    },
  {
      "id": "choice_prio_control_low_cost",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Szybka Przewaga",
      "desc": "Dowolna karta · Prio Control · Koszt 1–2",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "cost": {
          "min": 1,
          "max": 2
        },
        "tags": {
          "allOf": [
            "prio-control"
          ]
        }
      }
    },
  {
      "id": "choice_skaar_ten_power",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Dziesięć Ton",
      "desc": "Dowolna karta · Nightmare / Skaar · Siła 10+",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "power": {
          "min": 10
        },
        "tags": {
          "allOf": [
            "nightmare-skaar"
          ]
        }
      }
    },
  {
      "id": "choice_ramp_cheap_core",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Zapłon Rampy",
      "desc": "Dowolna karta · Ramp · Koszt 2–3",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "cost": {
          "min": 2,
          "max": 3
        },
        "tags": {
          "allOf": [
            "ramp"
          ]
        }
      }
    },
  {
      "id": "choice_surfer_three_cost",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Trójkowa Fala",
      "desc": "Dowolna karta · Surfer / Buff · Koszt 3",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "cost": {
          "exact": 3
        },
        "tags": {
          "allOf": [
            "surfer-buff"
          ]
        }
      }
    },
  {
        "id": "choice_tag_cost",
        "type": "choice",
        "rarity": "epic",
        "family": "tag",
        "name": "Cena ma znaczenie",
        "desc": "Dowolna karta · Cost",
        "sourceCategories": [
            "mechanicFamilies"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "cost"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_cost",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Kosztowna Niespodzianka",
        "desc": "Losowa karta · Cost",
        "sourceCategories": [
            "mechanicFamilies"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "cost"
                ]
            }
        }
    },
  {
        "id": "choice_tag_downside",
        "type": "choice",
        "rarity": "epic",
        "family": "tag",
        "name": "Róża ma kolce",
        "desc": "Dowolna karta · Downside",
        "sourceCategories": [
            "mechanicFamilies"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "downside"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_downside",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Jest jeden haczyk",
        "desc": "Losowa karta · Downside",
        "sourceCategories": [
            "mechanicFamilies"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "downside"
                ]
            }
        }
    },
  {
        "id": "choice_tag_energy",
        "type": "choice",
        "rarity": "epic",
        "family": "tag",
        "name": "Find Energy!",
        "desc": "Dowolna karta · Energy",
        "sourceCategories": [
            "mechanicFamilies"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "energy"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_energy",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Mana Joker",
        "desc": "Losowa karta · Energy",
        "sourceCategories": [
            "mechanicFamilies"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "energy"
                ]
            }
        }
    },
  {
        "id": "choice_tag_zombie_horde",
        "type": "choice",
        "rarity": "rare",
        "family": "tag",
        "name": "The Walking Dead",
        "desc": "Dowolna karta · Zombie Horde",
        "sourceCategories": [
            "mechanicFamilies"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "zombie-horde"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_zombie_horde",
        "type": "surprise",
        "rarity": "epic",
        "family": "tag",
        "name": "Zombified",
        "desc": "Losowa karta · Zombie Horde",
        "sourceCategories": [
            "mechanicFamilies"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "zombie-horde"
                ]
            }
        }
    },
  {
        "id": "choice_tag_banish",
        "type": "choice",
        "rarity": "epic",
        "family": "tag",
        "name": "Jestem i znikam",
        "desc": "Dowolna karta · Banish",
        "sourceCategories": [
            "subtypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "banish"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_banish",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Po mnie ani śladu",
        "desc": "Losowa karta · Banish",
        "sourceCategories": [
            "subtypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "banish"
                ]
            }
        }
    },
  {
        "id": "choice_tag_bonus_energy",
        "type": "choice",
        "rarity": "epic",
        "family": "tag",
        "name": "Ładuję manę",
        "desc": "Dowolna karta · Bonus Energy",
        "sourceCategories": [
            "subtypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "bonus-energy"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_bonus_energy",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Mana Boost",
        "desc": "Losowa karta · Bonus Energy",
        "sourceCategories": [
            "subtypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "bonus-energy"
                ]
            }
        }
    },
  {
        "id": "choice_tag_cost_increase",
        "type": "choice",
        "rarity": "rare",
        "family": "tag",
        "name": "Podwyżka",
        "desc": "Dowolna karta · Cost Increase",
        "sourceCategories": [
            "subtypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "cost-increase"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_cost_increase",
        "type": "surprise",
        "rarity": "epic",
        "family": "tag",
        "name": "Kosmiczna Inflacja",
        "desc": "Losowa karta · Cost Increase",
        "sourceCategories": [
            "subtypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "cost-increase"
                ]
            }
        }
    },
  {
        "id": "choice_tag_location_control_exact",
        "type": "choice",
        "rarity": "epic",
        "family": "tag",
        "name": "Moja Galaktyka",
        "desc": "Dowolna karta · Location Control",
        "sourceCategories": [
            "subtypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "location-control"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_location_control_exact",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Teren Zamknięty",
        "desc": "Losowa karta · Location Control",
        "sourceCategories": [
            "subtypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "location-control"
                ]
            }
        }
    },
  {
        "id": "choice_tag_location_points_exact",
        "type": "choice",
        "rarity": "rare",
        "family": "tag",
        "name": "Zasilenie Miasta",
        "desc": "Dowolna karta · Location Points",
        "sourceCategories": [
            "subtypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "location-points"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_location_points_exact",
        "type": "surprise",
        "rarity": "epic",
        "family": "tag",
        "name": "Punkty na Mapie",
        "desc": "Losowa karta · Location Points",
        "sourceCategories": [
            "subtypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "location-points"
                ]
            }
        }
    },
  {
        "id": "choice_tag_power_aura",
        "type": "choice",
        "rarity": "epic",
        "family": "tag",
        "name": "Aura Punktów",
        "desc": "Dowolna karta · Power Aura",
        "sourceCategories": [
            "subtypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "power-aura"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_power_aura",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Power Field",
        "desc": "Losowa karta · Power Aura",
        "sourceCategories": [
            "subtypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "power-aura"
                ]
            }
        }
    },
  {
        "id": "choice_tag_topdeck",
        "type": "choice",
        "rarity": "epic",
        "family": "tag",
        "name": "Spojrzenie w Przyszłość",
        "desc": "Dowolna karta · Topdeck",
        "sourceCategories": [
            "subtypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "topdeck"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_topdeck",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Zaraz będę!",
        "desc": "Losowa karta · Topdeck",
        "sourceCategories": [
            "subtypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "topdeck"
                ]
            }
        }
    },
  {
        "id": "choice_tag_cerebro",
        "type": "choice",
        "rarity": "rare",
        "family": "tag",
        "name": "Balans Mocy",
        "desc": "Dowolna karta · Cerebro",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "cerebro"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_cerebro",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Sygnał Cerebro",
        "desc": "Losowa karta · Cerebro",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "cerebro"
                ]
            }
        }
    },
  {
        "id": "choice_tag_classic_destroy",
        "type": "choice",
        "rarity": "rare",
        "family": "tag",
        "name": "Klasyczny Destroy",
        "desc": "Dowolna karta · Classic Destroy",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "classic-destroy"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_classic_destroy",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Zniszcz po staremu!",
        "desc": "Losowa karta · Classic Destroy",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "classic-destroy"
                ]
            }
        }
    },
  {
        "id": "choice_tag_classic_discard",
        "type": "choice",
        "rarity": "rare",
        "family": "tag",
        "name": "Klasyczne Cięcie",
        "desc": "Dowolna karta · Classic Discard",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "classic-discard"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_classic_discard",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Rzut w Ciemno",
        "desc": "Losowa karta · Classic Discard",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "classic-discard"
                ]
            }
        }
    },
  {
        "id": "choice_tag_darkhawk_ronan",
        "type": "choice",
        "rarity": "rare",
        "family": "tag",
        "name": "Skamieniały Deck",
        "desc": "Dowolna karta · Darkhawk / Ronan",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "darkhawk-ronan"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_darkhawk_ronan",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Kamień Ci w Deck",
        "desc": "Losowa karta · Darkhawk / Ronan",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "darkhawk-ronan"
                ]
            }
        }
    },
  {
        "id": "choice_tag_doom_2099",
        "type": "choice",
        "rarity": "rare",
        "family": "tag",
        "name": "Doom Protocol 2099",
        "desc": "Dowolna karta · Doom 2099",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "doom-2099"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_doom_2099",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Doomboty nadciągają!",
        "desc": "Losowa karta · Doom 2099",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "doom-2099"
                ]
            }
        }
    },
  {
        "id": "choice_tag_galactus",
        "type": "choice",
        "rarity": "rare",
        "family": "tag",
        "name": "Herold Pożeracza",
        "desc": "Dowolna karta · Galactus",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "galactus"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_galactus",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "KNEEL BEFORE GALACTUS!",
        "desc": "Losowa karta · Galactus",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "galactus"
                ]
            }
        }
    },
  {
        "id": "choice_tag_hela_discard",
        "type": "choice",
        "rarity": "rare",
        "family": "tag",
        "name": "Rozkaz Heli",
        "desc": "Dowolna karta · Hela Discard",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "hela-discard"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_hela_discard",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Powrót Poległych",
        "desc": "Losowa karta · Hela Discard",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "hela-discard"
                ]
            }
        }
    },
  {
        "id": "choice_tag_fallen_one",
        "type": "choice",
        "rarity": "rare",
        "family": "tag",
        "name": "Fuzja Totalna",
        "desc": "Dowolna karta · Merge / Fallen One Combo",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "fallen-one"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_fallen_one",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Fallen Together",
        "desc": "Losowa karta · Merge / Fallen One Combo",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "fallen-one"
                ]
            }
        }
    },
  {
        "id": "choice_tag_midrange_control",
        "type": "choice",
        "rarity": "rare",
        "family": "tag",
        "name": "Good Cards",
        "desc": "Dowolna karta · Midrange Control",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "midrange-control"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_midrange_control",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Your Midrange",
        "desc": "Losowa karta · Midrange Control",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "midrange-control"
                ]
            }
        }
    },
  {
        "id": "choice_tag_move_combo",
        "type": "choice",
        "rarity": "rare",
        "family": "tag",
        "name": "I Like to Move It!",
        "desc": "Dowolna karta · Move Combo",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "move-combo"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_move_combo",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Ruchome Karty",
        "desc": "Losowa karta · Move Combo",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "move-combo"
                ]
            }
        }
    },
  {
        "id": "choice_tag_ozymandias_pack",
        "type": "choice",
        "rarity": "rare",
        "family": "tag",
        "name": "Król Kamieni",
        "desc": "Dowolna karta · Ozymandias Pack",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "ozymandias-pack"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_ozymandias_pack",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Rock Solid",
        "desc": "Losowa karta · Ozymandias Pack",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "ozymandias-pack"
                ]
            }
        }
    },
  {
        "id": "choice_tag_pixie",
        "type": "choice",
        "rarity": "rare",
        "family": "tag",
        "name": "Pył Pixie",
        "desc": "Dowolna karta · Pixie",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "pixie"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_pixie",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Kosztowy Psikus",
        "desc": "Losowa karta · Pixie",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "pixie"
                ]
            }
        }
    },
  {
        "id": "choice_tag_ravonna_agent_venom",
        "type": "choice",
        "rarity": "rare",
        "family": "tag",
        "name": "Agenci Ravonny",
        "desc": "Dowolna karta · Ravonna / Agent Venom",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "ravonna-agent-venom"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_ravonna_agent_venom",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Ravonna God Butcher",
        "desc": "Losowa karta · Ravonna / Agent Venom",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "ravonna-agent-venom"
                ]
            }
        }
    },
  {
      "id": "choice_tag_sauron_skaar",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "10 MEN",
      "desc": "Dowolna karta · Nightmare / Skaar",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "nightmare-skaar"
          ]
        }
      }
    },
  {
      "id": "surprise_tag_sauron_skaar",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Big Boyz",
      "desc": "Losowa karta · Nightmare / Skaar",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "nightmare-skaar"
          ]
        }
      }
    },
  {
        "id": "choice_tag_sera_control",
        "type": "choice",
        "rarity": "rare",
        "family": "tag",
        "name": "Control Freak",
        "desc": "Dowolna karta · Sera Control",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "sera-control"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_sera_control",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Sera & Tech",
        "desc": "Losowa karta · Sera Control",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "sera-control"
                ]
            }
        }
    },
  {
        "id": "choice_tag_spectrum_ongoing",
        "type": "choice",
        "rarity": "rare",
        "family": "tag",
        "name": "Pełne Spektrum",
        "desc": "Dowolna karta · Spectrum Ongoing",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "spectrum-ongoing"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_spectrum_ongoing",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Always On",
        "desc": "Losowa karta · Spectrum Ongoing",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "spectrum-ongoing"
                ]
            }
        }
    },
  {
        "id": "choice_tag_thanos",
        "type": "choice",
        "rarity": "rare",
        "family": "tag",
        "name": "Infinity Gauntlet",
        "desc": "Dowolna karta · Thanos",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "thanos"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_thanos",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Gwardia Tytana",
        "desc": "Losowa karta · Thanos",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "thanos"
                ]
            }
        }
    },
  {
        "id": "choice_tag_toxic_afflict",
        "type": "choice",
        "rarity": "rare",
        "family": "tag",
        "name": "Toxic Relationship",
        "desc": "Dowolna karta · Toxic / Afflict",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "toxic-afflict"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_toxic_afflict",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Hazmat Required",
        "desc": "Losowa karta · Toxic / Afflict",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "toxic-afflict"
                ]
            }
        }
    },
  {
        "id": "choice_tag_tribunal_ongoing",
        "type": "choice",
        "rarity": "rare",
        "family": "tag",
        "name": "Wyrok Trybunału",
        "desc": "Dowolna karta · Tribunal Ongoing",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "tribunal-ongoing"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_tribunal_ongoing",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Równy Podział",
        "desc": "Losowa karta · Tribunal Ongoing",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "tribunal-ongoing"
                ]
            }
        }
    },
  {
        "id": "choice_tag_victoria_hand_big_hand",
        "type": "choice",
        "rarity": "rare",
        "family": "tag",
        "name": "Ręka Zwycięstwa",
        "desc": "Dowolna karta · Victoria Hand / Big Hand",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "victoria-hand-big-hand"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_victoria_hand_big_hand",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Wielkie Ręce",
        "desc": "Losowa karta · Victoria Hand / Big Hand",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "victoria-hand-big-hand"
                ]
            }
        }
    },
  {
        "id": "choice_tag_zombie_horde_combo",
        "type": "choice",
        "rarity": "rare",
        "family": "tag",
        "name": "Marsz Hordy",
        "desc": "Dowolna karta · Zombie Horde Combo",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "zombie-horde-combo"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_zombie_horde_combo",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Noc Umarłych",
        "desc": "Losowa karta · Zombie Horde Combo",
        "sourceCategories": [
            "deckArchetypes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "zombie-horde-combo"
                ]
            }
        }
    },
  {
        "id": "choice_tag_fractured_frontier",
        "type": "choice",
        "rarity": "epic",
        "family": "tag",
        "name": "Fractured Frontiers",
        "desc": "Dowolna karta · Fractured Frontier",
        "sourceCategories": [
            "themes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "fractured-frontier"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_fractured_frontier",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Pęknięta Rzeczywistość",
        "desc": "Losowa karta · Fractured Frontier",
        "sourceCategories": [
            "themes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "fractured-frontier"
                ]
            }
        }
    },
  {
        "id": "choice_tag_zombies_theme",
        "type": "choice",
        "rarity": "epic",
        "family": "tag",
        "name": "Zombiakowy Joker",
        "desc": "Dowolna karta · Zombies",
        "sourceCategories": [
            "themes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "zombies"
                ]
            }
        }
    },
  {
        "id": "surprise_tag_zombies_theme",
        "type": "surprise",
        "rarity": "rare",
        "family": "tag",
        "name": "Marvel Zombies",
        "desc": "Losowa karta · Zombies",
        "sourceCategories": [
            "themes"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "zombies"
                ]
            }
        }
    },
  {
        "id": "choice_series_starter",
        "type": "choice",
        "rarity": "rare",
        "family": "tag",
        "name": "Nowy Początek",
        "desc": "Dowolna karta · Starter",
        "sourceCategories": [
            "series"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "starter"
                ]
            }
        }
    },
  {
        "id": "choice_series_early_days",
        "type": "choice",
        "rarity": "epic",
        "family": "tag",
        "name": "Stare Dobre Czasy",
        "desc": "Dowolna karta · Starter / Recruit Pass / Series 1",
        "sourceCategories": [
            "series"
        ],
        "filter": {
            "tags": {
                "anyOf": [
                    "starter",
                    "recruit-pass",
                    "series1"
                ]
            }
        }
    },
  {
        "id": "choice_series_2_wide_waters",
        "type": "choice",
        "rarity": "epic",
        "family": "tag",
        "name": "Na Szerokie Wody",
        "desc": "Dowolna karta · Series 2",
        "sourceCategories": [
            "series"
        ],
        "filter": {
            "tags": {
                "allOf": [
                    "series2"
                ]
            }
        }
    },

  {
      "id": "choice_ongoing_self_power",
      "type": "choice",
      "rarity": "epic",
      "family": "tag",
      "name": "Moc na Stałe",
      "desc": "Dowolna karta · Ongoing Self Power",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "ongoing-self-power"
          ]
        }
      }
    },
  {
      "id": "surprise_ongoing_self_power",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Stała Potęga",
      "desc": "Losowa karta · Ongoing Self Power",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "ongoing-self-power"
          ]
        }
      }
    },
  {
      "id": "choice_protection",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "Pod Ochroną",
      "desc": "Dowolna karta · Protection",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "protection"
          ]
        }
      }
    },
  {
      "id": "surprise_protection",
      "type": "surprise",
      "rarity": "epic",
      "family": "tag",
      "name": "Tarcza Awaryjna",
      "desc": "Losowa karta · Protection",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "protection"
          ]
        }
      }
    },
  {
      "id": "choice_stat_check",
      "type": "choice",
      "rarity": "legendary",
      "family": "tag",
      "name": "Stat Check",
      "desc": "Dowolna karta · Stat Check",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "stat-check"
          ]
        }
      }
    },
  {
      "id": "surprise_stat_check",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Test Statów",
      "desc": "Losowa karta · Stat Check",
      "sourceCategories": [
        "subtypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "stat-check"
          ]
        }
      }
    },
  {
      "id": "choice_tag_she_moon",
      "type": "choice",
      "rarity": "rare",
      "family": "tag",
      "name": "She-Moon",
      "desc": "Dowolna karta · She-Moon",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "she-moon"
          ]
        }
      }
    },
  {
      "id": "surprise_tag_she_moon",
      "type": "surprise",
      "rarity": "rare",
      "family": "tag",
      "name": "Double Trouble",
      "desc": "Losowa karta · She-Moon",
      "sourceCategories": [
        "deckArchetypes"
      ],
      "filter": {
        "tags": {
          "allOf": [
            "she-moon"
          ]
        }
      }
    },
  {
    "id": "choice_exact_power_10",
    "type": "choice",
    "rarity": "rare",
    "family": "statistics",
    "name": "Strzał w Dziesiątkę",
    "desc": "Dowolna karta · Dokładnie 10 Siły",
    "sourceCategories": [
      "statistics"
    ],
    "filter": {
      "power": {
        "exact": 10
      }
    }
  },
  {
    "id": "surprise_exact_power_10",
    "type": "surprise",
    "rarity": "rare",
    "family": "statistics",
    "name": "Trafiona Dycha",
    "desc": "Losowa karta · Dokładnie 10 Siły",
    "sourceCategories": [
      "statistics"
    ],
    "filter": {
      "power": {
        "exact": 10
      }
    }
  },
  {
    "id": "choice_signature_1_1",
    "type": "choice",
    "rarity": "rare",
    "family": "statistics",
    "name": "I'm Your Number One",
    "desc": "Dowolna karta · Koszt 1 · Siła 1",
    "sourceCategories": [
      "statistics"
    ],
    "filter": {
      "cost": {
        "exact": 1
      },
      "power": {
        "exact": 1
      }
    }
  },
  {
    "id": "surprise_signature_1_1",
    "type": "surprise",
    "rarity": "rare",
    "family": "statistics",
    "name": "Numer Jeden",
    "desc": "Losowa karta · Koszt 1 · Siła 1",
    "sourceCategories": [
      "statistics"
    ],
    "filter": {
      "cost": {
        "exact": 1
      },
      "power": {
        "exact": 1
      }
    }
  },
  {
    "id": "choice_signature_2_2",
    "type": "choice",
    "rarity": "rare",
    "family": "statistics",
    "name": "Ile to 2 + 2?",
    "desc": "Dowolna karta · Koszt 2 · Siła 2",
    "sourceCategories": [
      "statistics"
    ],
    "filter": {
      "cost": {
        "exact": 2
      },
      "power": {
        "exact": 2
      }
    }
  },
  {
    "id": "surprise_signature_2_2",
    "type": "surprise",
    "rarity": "rare",
    "family": "statistics",
    "name": "Dwa na Dwa",
    "desc": "Losowa karta · Koszt 2 · Siła 2",
    "sourceCategories": [
      "statistics"
    ],
    "filter": {
      "cost": {
        "exact": 2
      },
      "power": {
        "exact": 2
      }
    }
  },
  {
    "id": "choice_school_of_magic",
    "type": "choice",
    "rarity": "epic",
    "family": "hybrid",
    "name": "Szkoła Magii",
    "desc": "Dowolna karta · Magicians lub Skills za maks. 2",
    "sourceCategories": [
      "hybrid"
    ],
    "filter": {
      "orGroups": [
        {
          "tags": {
            "allOf": [
              "magicians"
            ]
          }
        },
        {
          "tags": {
            "allOf": [
              "skills"
            ]
          },
          "cost": {
            "max": 2
          }
        }
      ]
    },
    "hybridType": "tag-stat-or"
  },
  {
    "id": "surprise_school_of_magic",
    "type": "surprise",
    "rarity": "epic",
    "family": "hybrid",
    "name": "Lekcja Praktyczna",
    "desc": "Losowa karta · Magicians lub Skills za maks. 2",
    "sourceCategories": [
      "hybrid"
    ],
    "filter": {
      "orGroups": [
        {
          "tags": {
            "allOf": [
              "magicians"
            ]
          }
        },
        {
          "tags": {
            "allOf": [
              "skills"
            ]
          },
          "cost": {
            "max": 2
          }
        }
      ]
    },
    "hybridType": "tag-stat-or"
  },
  {
    "id": "choice_assassins_guild",
    "type": "choice",
    "rarity": "rare",
    "family": "hybrid",
    "name": "Gildia Zabójców",
    "desc": "Dowolna karta · Tech i Destroy",
    "sourceCategories": [
      "hybrid"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "tech",
          "destroy"
        ]
      }
    },
    "hybridType": "tag-and"
  },
  {
    "id": "surprise_assassins_guild",
    "type": "surprise",
    "rarity": "epic",
    "family": "hybrid",
    "name": "Kontrakt na Zabójstwo",
    "desc": "Losowa karta · Tech i Destroy",
    "sourceCategories": [
      "hybrid"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "tech",
          "destroy"
        ]
      }
    },
    "hybridType": "tag-and"
  },
  {
    "id": "choice_top_shelf",
    "type": "choice",
    "rarity": "rare",
    "family": "hybrid",
    "name": "Górna Półka",
    "desc": "Dowolna karta · Topdeck i Draw",
    "sourceCategories": [
      "hybrid"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "topdeck",
          "draw"
        ]
      }
    },
    "hybridType": "tag-and"
  },
  {
    "id": "surprise_top_shelf",
    "type": "surprise",
    "rarity": "epic",
    "family": "hybrid",
    "name": "Z Wierzchu",
    "desc": "Losowa karta · Topdeck i Draw",
    "sourceCategories": [
      "hybrid"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "topdeck",
          "draw"
        ]
      }
    },
    "hybridType": "tag-and"
  },
  {
    "id": "choice_risk_pays",
    "type": "choice",
    "rarity": "rare",
    "family": "hybrid",
    "name": "Ryzyko się Opłaca",
    "desc": "Dowolna karta · Stat Check i Downside",
    "sourceCategories": [
      "hybrid"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "stat-check",
          "downside"
        ]
      }
    },
    "hybridType": "tag-and"
  },
  {
    "id": "surprise_risk_pays",
    "type": "surprise",
    "rarity": "epic",
    "family": "hybrid",
    "name": "Va Banque",
    "desc": "Losowa karta · Stat Check i Downside",
    "sourceCategories": [
      "hybrid"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "stat-check",
          "downside"
        ]
      }
    },
    "hybridType": "tag-and"
  },
  {
    "id": "choice_plan_b",
    "type": "choice",
    "rarity": "epic",
    "family": "hybrid",
    "name": "Plan B",
    "desc": "Dowolna karta · Protection lub Revive",
    "sourceCategories": [
      "hybrid"
    ],
    "filter": {
      "tags": {
        "anyOf": [
          "protection",
          "revive"
        ]
      }
    },
    "hybridType": "tag-or"
  },
  {
    "id": "surprise_plan_b",
    "type": "surprise",
    "rarity": "rare",
    "family": "hybrid",
    "name": "Jeszcze Nie Koniec",
    "desc": "Losowa karta · Protection lub Revive",
    "sourceCategories": [
      "hybrid"
    ],
    "filter": {
      "tags": {
        "anyOf": [
          "protection",
          "revive"
        ]
      }
    },
    "hybridType": "tag-or"
  },
  {
    "id": "choice_cheap_protection",
    "type": "choice",
    "rarity": "rare",
    "family": "hybrid",
    "name": "Tania Ochrona",
    "desc": "Dowolna karta · Protection · Koszt maks. 2",
    "sourceCategories": [
      "hybrid"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "protection"
        ]
      },
      "cost": {
        "max": 2
      }
    },
    "hybridType": "tag-stat"
  },
  {
    "id": "surprise_cheap_protection",
    "type": "surprise",
    "rarity": "epic",
    "family": "hybrid",
    "name": "Kieszonkowa Tarcza",
    "desc": "Losowa karta · Protection · Koszt maks. 2",
    "sourceCategories": [
      "hybrid"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "protection"
        ]
      },
      "cost": {
        "max": 2
      }
    },
    "hybridType": "tag-stat"
  },
  {
    "id": "choice_cheap_disruption",
    "type": "choice",
    "rarity": "rare",
    "family": "hybrid",
    "name": "Tani Disruptor",
    "desc": "Dowolna karta · Disruption · Koszt maks. 2",
    "sourceCategories": [
      "hybrid"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "disruption"
        ]
      },
      "cost": {
        "max": 2
      }
    },
    "hybridType": "tag-stat"
  },
  {
    "id": "surprise_cheap_disruption",
    "type": "surprise",
    "rarity": "epic",
    "family": "hybrid",
    "name": "Mały Sabotaż",
    "desc": "Losowa karta · Disruption · Koszt maks. 2",
    "sourceCategories": [
      "hybrid"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "disruption"
        ]
      },
      "cost": {
        "max": 2
      }
    },
    "hybridType": "tag-stat"
  },
  {
    "id": "choice_cheap_replication",
    "type": "choice",
    "rarity": "rare",
    "family": "hybrid",
    "name": "Tania Replikacja",
    "desc": "Dowolna karta · Effect Replication · Koszt maks. 2",
    "sourceCategories": [
      "hybrid"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "effect-replication"
        ]
      },
      "cost": {
        "max": 2
      }
    },
    "hybridType": "tag-stat"
  },
  {
    "id": "surprise_cheap_replication",
    "type": "surprise",
    "rarity": "epic",
    "family": "hybrid",
    "name": "Kieszonkowa Powtórka",
    "desc": "Losowa karta · Effect Replication · Koszt maks. 2",
    "sourceCategories": [
      "hybrid"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "effect-replication"
        ]
      },
      "cost": {
        "max": 2
      }
    },
    "hybridType": "tag-stat"
  },
  {
    "id": "choice_cheap_stat_check",
    "type": "choice",
    "rarity": "rare",
    "family": "hybrid",
    "name": "Tani Stat Check",
    "desc": "Dowolna karta · Stat Check · Koszt maks. 2",
    "sourceCategories": [
      "hybrid"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "stat-check"
        ]
      },
      "cost": {
        "max": 2
      }
    },
    "hybridType": "tag-stat"
  },
  {
    "id": "surprise_cheap_stat_check",
    "type": "surprise",
    "rarity": "epic",
    "family": "hybrid",
    "name": "Szybki Test",
    "desc": "Losowa karta · Stat Check · Koszt maks. 2",
    "sourceCategories": [
      "hybrid"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "stat-check"
        ]
      },
      "cost": {
        "max": 2
      }
    },
    "hybridType": "tag-stat"
  },
  {
    "id": "surprise_noob_vs_pro",
    "type": "surprise",
    "rarity": "rare",
    "family": "hybrid",
    "name": "Noob vs Pro",
    "desc": "Losowa karta · No Ability lub Effect Replication",
    "sourceCategories": [
      "hybrid"
    ],
    "filter": {
      "tags": {
        "anyOf": [
          "no-ability",
          "effect-replication"
        ]
      }
    },
    "hybridType": "risk-surprise"
  },
  {
    "id": "surprise_one_or_ten_power",
    "type": "surprise",
    "rarity": "rare",
    "family": "statistics",
    "name": "Jedynka albo Dycha",
    "desc": "Losowa karta · Dokładnie 1 lub 10 Siły",
    "sourceCategories": [
      "statistics"
    ],
    "filter": {
      "power": {
        "anyOf": [
          {
            "exact": 1
          },
          {
            "exact": 10
          }
        ]
      }
    },
    "hybridType": "risk-surprise"
  },
  // ================= JOKER CATALOG v3.30: TAGS + SEASONS =================
  {
    "id": "choice_tag_antipolar_fours",
    "type": "choice",
    "rarity": "rare",
    "name": "Cztery Bieguny",
    "desc": "Dowolna karta · Antipolar Fours",
    "family": "tag",
    "sourceCategories": [
      "deckArchetypes"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "antipolar-fours"
        ]
      }
    }
  },
  {
    "id": "surprise_tag_antipolar_fours",
    "type": "surprise",
    "rarity": "rare",
    "name": "Polaryzacja",
    "desc": "Losowa karta · Antipolar Fours",
    "family": "tag",
    "sourceCategories": [
      "deckArchetypes"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "antipolar-fours"
        ]
      }
    }
  },
  {
    "id": "choice_tag_power_steal_combo",
    "type": "choice",
    "rarity": "rare",
    "name": "Ręce Precz od Siły!",
    "desc": "Dowolna karta · Power Steal Combo",
    "family": "tag",
    "sourceCategories": [
      "deckArchetypes"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "power-steal-combo"
        ]
      }
    }
  },
  {
    "id": "surprise_tag_power_steal_combo",
    "type": "surprise",
    "rarity": "rare",
    "name": "Wielki Rabunek",
    "desc": "Losowa karta · Power Steal Combo",
    "family": "tag",
    "sourceCategories": [
      "deckArchetypes"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "power-steal-combo"
        ]
      }
    }
  },
  {
    "id": "choice_tag_werewolf_spells",
    "type": "choice",
    "rarity": "rare",
    "name": "Wilkołaczy Rytuał",
    "desc": "Dowolna karta · Werewolf Spells",
    "family": "tag",
    "sourceCategories": [
      "deckArchetypes"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "werewolf-spells"
        ]
      }
    }
  },
  {
    "id": "surprise_tag_werewolf_spells",
    "type": "surprise",
    "rarity": "rare",
    "name": "Magia Pełni",
    "desc": "Losowa karta · Werewolf Spells",
    "family": "tag",
    "sourceCategories": [
      "deckArchetypes"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "werewolf-spells"
        ]
      }
    }
  },
  {
    "id": "choice_team_x_force",
    "type": "choice",
    "rarity": "rare",
    "name": "X-Force: Oddział Specjalny",
    "desc": "Dowolna karta · X-Force",
    "family": "tag",
    "sourceCategories": [
      "teams"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "x-force"
        ]
      }
    }
  },
  {
    "id": "surprise_team_x_force",
    "type": "surprise",
    "rarity": "rare",
    "name": "Mutancka Misja",
    "desc": "Losowa karta · X-Force",
    "family": "tag",
    "sourceCategories": [
      "teams"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "x-force"
        ]
      }
    }
  },
  {
    "id": "choice_team_young_avengers",
    "type": "choice",
    "rarity": "rare",
    "name": "Młodzi Mściciele",
    "desc": "Dowolna karta · Young Avengers",
    "family": "tag",
    "sourceCategories": [
      "teams"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "young-avengers"
        ]
      }
    }
  },
  {
    "id": "surprise_team_young_avengers",
    "type": "surprise",
    "rarity": "rare",
    "name": "Nowa Generacja",
    "desc": "Losowa karta · Young Avengers",
    "family": "tag",
    "sourceCategories": [
      "teams"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "young-avengers"
        ]
      }
    }
  },
  {
    "id": "choice_season_2026_10",
    "type": "choice",
    "rarity": "rare",
    "name": "Noc Umarłych Bohaterów",
    "desc": "Dowolna karta · Sezon Vampires vs. Zombies (10/2026)",
    "family": "tag",
    "sourceCategories": [
      "themes"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "season-2026-10-vampires-vs-zombies"
        ]
      }
    }
  },
  {
    "id": "surprise_season_2026_10",
    "type": "surprise",
    "rarity": "epic",
    "name": "Krwawy Październik",
    "desc": "Losowa karta · Sezon Vampires vs. Zombies (10/2026)",
    "family": "tag",
    "sourceCategories": [
      "themes"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "season-2026-10-vampires-vs-zombies"
        ]
      }
    }
  },
  {
    "id": "choice_season_2026_11",
    "type": "choice",
    "rarity": "rare",
    "name": "Rycerze Avalonu",
    "desc": "Dowolna karta · Sezon Knights of Avalon (11/2026)",
    "family": "tag",
    "sourceCategories": [
      "themes"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "season-2026-11-knights-of-avalon"
        ]
      }
    }
  },
  {
    "id": "surprise_season_2026_11",
    "type": "surprise",
    "rarity": "epic",
    "name": "Miecz z Gwiazd",
    "desc": "Losowa karta · Sezon Knights of Avalon (11/2026)",
    "family": "tag",
    "sourceCategories": [
      "themes"
    ],
    "filter": {
      "tags": {
        "allOf": [
          "season-2026-11-knights-of-avalon"
        ]
      }
    }
  },
  {
    "id": "choice_seasons_undead_crossover",
    "type": "choice",
    "rarity": "epic",
    "name": "Martwe Sezony",
    "desc": "Dowolna karta · Sezony Undead Horde lub Vampires vs. Zombies",
    "family": "hybrid",
    "sourceCategories": [
      "themes"
    ],
    "filter": {
      "tags": {
        "anyOf": [
          "season-2025-10-undead-horde",
          "season-2026-10-vampires-vs-zombies"
        ]
      }
    },
    "hybridType": "multi-tag-any"
  },
  {
    "id": "surprise_seasons_undead_crossover",
    "type": "surprise",
    "rarity": "rare",
    "name": "Nekro-Ruletka",
    "desc": "Losowa karta · Sezony Undead Horde lub Vampires vs. Zombies",
    "family": "hybrid",
    "sourceCategories": [
      "themes"
    ],
    "filter": {
      "tags": {
        "anyOf": [
          "season-2025-10-undead-horde",
          "season-2026-10-vampires-vs-zombies"
        ]
      }
    },
    "hybridType": "multi-tag-any"
  },
  {
    "id": "choice_seasons_reality_break",
    "type": "choice",
    "rarity": "epic",
    "name": "Rozdarcie Rzeczywistości",
    "desc": "Dowolna karta · Sezony Fractured Frontier lub AXIS: Inversion",
    "family": "hybrid",
    "sourceCategories": [
      "themes"
    ],
    "filter": {
      "tags": {
        "anyOf": [
          "season-2026-08-fractured-frontier",
          "season-2026-09-axis-inversion"
        ]
      }
    },
    "hybridType": "multi-tag-any"
  },
  {
    "id": "surprise_seasons_reality_break",
    "type": "surprise",
    "rarity": "rare",
    "name": "Wypaczona Oś",
    "desc": "Losowa karta · Sezony Fractured Frontier lub AXIS: Inversion",
    "family": "hybrid",
    "sourceCategories": [
      "themes"
    ],
    "filter": {
      "tags": {
        "anyOf": [
          "season-2026-08-fractured-frontier",
          "season-2026-09-axis-inversion"
        ]
      }
    },
    "hybridType": "multi-tag-any"
  },
  {
    "id": "choice_seasons_cosmic_summer",
    "type": "choice",
    "rarity": "epic",
    "name": "Kosmiczne Wakacje",
    "desc": "Dowolna karta · Sezony Fantastic Four lub Heralds of Galactus",
    "family": "hybrid",
    "sourceCategories": [
      "themes"
    ],
    "filter": {
      "tags": {
        "anyOf": [
          "season-2025-07-fantastic-four",
          "season-2025-08-heralds-of-galactus"
        ]
      }
    },
    "hybridType": "multi-tag-any"
  },
  {
    "id": "surprise_seasons_cosmic_summer",
    "type": "surprise",
    "rarity": "rare",
    "name": "Sygnał z Kosmosu",
    "desc": "Losowa karta · Sezony Fantastic Four lub Heralds of Galactus",
    "family": "hybrid",
    "sourceCategories": [
      "themes"
    ],
    "filter": {
      "tags": {
        "anyOf": [
          "season-2025-07-fantastic-four",
          "season-2025-08-heralds-of-galactus"
        ]
      }
    },
    "hybridType": "multi-tag-any"
  },
  {
    "id": "choice_seasons_retro",
    "type": "choice",
    "rarity": "epic",
    "name": "Pierwsze Kroniki",
    "desc": "Dowolna karta · Sezony Wakanda / Power Cosmic / Savage Land",
    "family": "hybrid",
    "sourceCategories": [
      "themes"
    ],
    "filter": {
      "tags": {
        "anyOf": [
          "season-2022-11-warriors-of-wakanda",
          "season-2022-12-the-power-cosmic",
          "season-2023-01-savage-land"
        ]
      }
    },
    "hybridType": "multi-tag-any"
  },
  {
    "id": "surprise_seasons_retro",
    "type": "surprise",
    "rarity": "rare",
    "name": "Z Archiwum Sezonów",
    "desc": "Losowa karta · Sezony Wakanda / Power Cosmic / Savage Land",
    "family": "hybrid",
    "sourceCategories": [
      "themes"
    ],
    "filter": {
      "tags": {
        "anyOf": [
          "season-2022-11-warriors-of-wakanda",
          "season-2022-12-the-power-cosmic",
          "season-2023-01-savage-land"
        ]
      }
    },
    "hybridType": "multi-tag-any"
  },
  {
    "id": "choice_modes_or_transform",
    "type": "choice",
    "rarity": "rare",
    "name": "Zmień Tryb",
    "desc": "Dowolna karta · Modes lub Transform",
    "family": "hybrid",
    "sourceCategories": [
      "hybrid"
    ],
    "filter": {
      "tags": {
        "anyOf": [
          "modes",
          "transform"
        ]
      }
    },
    "hybridType": "mechanic-or"
  },
  {
    "id": "surprise_modes_or_transform",
    "type": "surprise",
    "rarity": "rare",
    "name": "Przełącznik Awaryjny",
    "desc": "Losowa karta · Modes lub Transform",
    "family": "hybrid",
    "sourceCategories": [
      "hybrid"
    ],
    "filter": {
      "tags": {
        "anyOf": [
          "modes",
          "transform"
        ]
      }
    },
    "hybridType": "mechanic-or"
  }
];
