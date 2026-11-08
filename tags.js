/* ============================================================
   MSP SNAP DRAFT — TAG DATABASE
   Version 2.09

   Kanoniczna kolejność tagów w cards.js:
   series → abilityTypes → mechanicFamilies → subtypes
   → deckArchetypes → teams → themes → special

   Tagi specjalne zawsze znajdują się na końcu.
============================================================ */

const TAG_CATEGORIES = {
  series: {
    name: "Serie",
    color: "#9B5CFF",
    glow: "rgba(155, 92, 255, .42)",
    description: "Klasyfikuje karty według sposobu ich odblokowania oraz serii kolekcjonerskiej, do której należą."
  },

  abilityTypes: {
    name: "Typy Zdolności",
    color: "#35B8FF",
    glow: "rgba(53, 184, 255, .40)",
    description: "Określa formalny typ zdolności karty, moment jej działania albo sposób aktywacji efektu. Karta może posiadać więcej niż jeden typ zdolności."
  },

  mechanicFamilies: {
    name: "Rodziny Mechanik",
    color: "#FF5FA2",
    glow: "rgba(255, 95, 162, .42)",
    description: "Szerokie ekosystemy i funkcjonalne rodziny mechanik. Obejmują karty, których własny tekst lub mechanika bezpośrednio wykonuje, wspiera, rozpoznaje, modyfikuje albo payoffuje daną mechanikę. Nie obejmują kart wyłącznie dlatego, że są popularnymi elementami konkretnego decku."
  },

  subtypes: {
    name: "Mechaniki Szczegółowe",
    color: "#FF9F43",
    glow: "rgba(255, 159, 67, .40)",
    description: "Węższe i precyzyjne cechy kart opisujące konkretną, powtarzalną operację, warunek, zachowanie efektu albo rodzaj interakcji. Nie wymagają tworzenia własnego ekosystemu ani archetypu deckowego."
  },

  deckArchetypes: {
    name: "Archetypy deckowe i paczki",
    color: "#C96CFF",
    glow: "rgba(201, 108, 255, .42)",
    description: "Rozpoznawalne strategie budowy decku, trwałe shelle i mniejsze pakiety synergicznych kart. Tag może obejmować charakterystyczne supporty i staple'e, nawet jeśli ich własny tekst nie należy bezpośrednio do głównej Rodziny Mechanik danego planu."
  },

  teams: {
    name: "Drużyny",
    color: "#43E08D",
    glow: "rgba(67, 224, 141, .38)",
    description: "Klasyfikuje postacie według ich drużyn, organizacji, frakcji oraz innych kanonicznych przynależności w uniwersum Marvela."
  },

  themes: {
    name: "Sezony i motywy",
    color: "#E94CFF",
    glow: "rgba(233, 76, 255, .42)",
    description: "Motywy fabularne, wizualne i gatunkowe oraz sezony pierwszego udostępnienia kart w Marvel Snap. Tag sezonowy oznacza historyczny debiut karty — nie okres jej późniejszej dostępności, motyw fabularny ani Series Drop."
  },

  special: {
    name: "Specjalne",
    color: "#F6C94C",
    glow: "rgba(246, 201, 76, .46)",
    description: "Ręcznie nadawane wyróżnienia oraz oznaczenia związane z edycjami MSP SnapDraft i zwycięskimi taliami."
  }
};

const TAGS = {

  series: [
    {
      id: "starter",
      name: "Starter",
      description: "Karty dostępne od początku gry."
    },

    {
      id: "recruit-pass",
      name: "Recruit Pass",
      description: "Karty odblokowywane w Recruit Pass."
    },

    {
      id: "series0",
      name: "Series 0",
      description: "Karty należące do Series 0."
    },

    {
      id: "series1",
      name: "Series 1",
      description: "Karty należące do Series 1."
    },

    {
      id: "series2",
      name: "Series 2",
      description: "Karty należące do Series 2."
    },

    {
      id: "series3",
      name: "Series 3",
      description: "Karty należące do Series 3."
    },

    {
      id: "series4",
      name: "Series 4",
      description: "Karty należące do Series 4."
    },

    {
      id: "series5",
      name: "Series 5",
      description: "Karty należące do Series 5."
    }
  ],

  abilityTypes: [
    {
          id: "activate",
          name: "Activate",
          description: "Karta posiada efekt Activate."
        },

    {
          id: "endofgame",
          name: "End of Game",
          description: "Efekt karty aktywuje się po zakończeniu gry."
        },

    {
          id: "endofturn",
          name: "End of Turn",
          description: "Efekt karty aktywuje się na końcu tury."
        },

    {
          id: "gamestart",
          name: "Game Start",
          description: "Efekt karty aktywuje się przed rozpoczęciem gry."
        },

    {
          id: "moveable",
          name: "Moveable",
          description: "Karta może zostać przesunięta dzięki własnej zdolności lub wbudowanej mechanice."
        },

    {
          id: "no-ability",
          name: "No Ability",
          description: "Karta nie posiada zdolności."
        },

    {
          id: "objective",
          name: "Objective",
          description: "Karta posiada cel lub specjalny warunek realizowany podczas gry."
        },

    {
          id: "on-reveal",
          name: "On Reveal",
          description: "Karta posiada efekt On Reveal."
        },

    {
          id: "ongoing",
          name: "Ongoing",
          description: "Karta posiada efekt Ongoing albo przejmuje tekst efektu Ongoing."
        },

    {
          id: "quickdraw",
          name: "Quickdraw",
          description: "Karta posiada zdolność Quickdraw."
        },

    {
          id: "startofturn",
          name: "Start of Turn",
          description: "Efekt karty aktywuje się na początku tury."
        },

    {
          id: "trigger-card",
          name: "Trigger Card",
          description: "Zdolność reaguje na określone wydarzenie albo warunek, na przykład zagranie, przesunięcie, zniszczenie lub zmianę stanu karty."
        }
  ],

  mechanicFamilies: [
    {
          id: "afflict",
          name: "Afflict",
          description: "Rodzina oparta na bezpośrednim obniżaniu Power kart oraz efektach, które rozpoznają, wykorzystują, wzmacniają albo kontrują takie osłabienia."
        },

    {
          id: "bounce",
          name: "Bounce",
          description: "Rodzina oparta na zwracaniu istniejących kart z planszy do ręki, ponownym ich zagrywaniu oraz efektach bezpośrednio reagujących na tę pętlę."
        },

    {
          id: "buff",
          name: "Buff",
          description: "Rodzina permanentnego zwiększania Power innych kart oraz efektów, które bezpośrednio payoffują zwiększony Power albo których własna zdolność bezpośrednio przetwarza aktualny Power karty — na przykład przekazuje, kopiuje lub mnoży tę wartość. Sam zwykły Self Buff ani luźna synergia deckowa nie wystarcza do otrzymania taga."
        },

    {
          id: "card-generation",
          name: "Card Generation",
          description: "Rodzina tworzenia nowych egzemplarzy kart w ręce, talii albo na planszy oraz efektów bezpośrednio rozpoznających lub payoffujących karty stworzone podczas gry albo karty, które nie rozpoczęły gry w talii."
        },

    {
          id: "clog",
          name: "Clog",
          description: "Rodzina oparta na zajmowaniu przestrzeni przeciwnika, dokładaniu mu niepożądanych kart, ograniczaniu dostępnych slotów oraz bezpośrednim wykorzystywaniu zapchanego boardu."
        },

    {
          id: "cost",
          name: "Cost",
          description: "Rodzina wszystkich istotnych interakcji z Costem kart: jego obniżania, zwiększania, ustawiania, zamiany, przetasowania, ograniczania, ochrony przed zmianą oraz efektów bezpośrednio reagujących na zmianę Costu. Jest nadrzędną rodziną dla szczegółowych mechanik Cost Reduction i Cost Increase. Samo używanie Costu jako kryterium nie wystarcza do otrzymania taga."
        },

    {
          id: "destroy",
          name: "Destroy",
          description: "Rodzina mechaniki Destroy: kart bezpośrednio niszczących, reagujących na zniszczenie, wymagających go, korzystających z liczby zniszczeń albo w inny sposób bezpośrednio uczestniczących w tym ekosystemie."
        },

    {
          id: "discard",
          name: "Discard",
          description: "Rodzina mechaniki Discard: kart bezpośrednio odrzucających, reagujących na odrzucenie, wymagających go, wracających dzięki niemu albo payoffujących liczbę i historię odrzuceń."
        },

    {
          id: "disruption",
          name: "Disruption",
          description: "Szeroka, proaktywna ingerencja w przeciwnika, która nie wymaga konkretnego archetypu po drugiej stronie i bezpośrednio utrudnia jego plan przez zmianę ręki, talii, tekstu, pozycji, kosztów, ujawniania, zasobów albo dostępu do gry."
        },

    {
          id: "downside",
          name: "Downside",
          description: "Rodzina kart posiadających ewidentny wbudowany downside — negatywny efekt, koszt lub ograniczenie — oraz kart, których własny tekst bezpośrednio pozwala taki downside usunąć albo obejść. Nie obejmuje zwykłych warunków bonusu ani mechanik takich jak Destroy, Discard czy Afflict, gdy ich negatywna część jest zamierzonym silnikiem synergii."
        },

    {
          id: "draw",
          name: "Draw",
          description: "Obejmuje karty, które bezpośrednio dobierają lub wymuszają dobór kart, reagują na dobieranie albo bycie dobranym, są enablerami lub payoffami mechaniki Draw albo bezpośrednio manipulują kartą przeznaczoną do najbliższego dobrania. Samo podglądanie talii, odczytywanie jej wierzchu ani zwykłe wyciąganie dowolnej karty z talii do gry nie wystarcza."
        },

    {
          id: "energy",
          name: "Energy",
          description: "Rodzina bezpośredniej interakcji z Energy lub Max Energy: jej przyrostem, utratą, wydawaniem, niewydawaniem albo efektami reagującymi na te stany. Jest nadrzędną rodziną m.in. dla szczegółowej mechaniki Unspent Energy. Nie obejmuje kart cheatowanych do gry bez bezpośredniej relacji z Energy."
        },

    {
          id: "merge",
          name: "Merge",
          description: "Rodzina oparta na mechanice Merge oraz efektach bezpośrednio łączących karty, pracujących ze scalonymi jednostkami lub payoffujących ten stan."
        },

    {
          id: "move",
          name: "Move",
          description: "Rodzina mechaniki Move: kart przesuwających własne lub wrogie karty oraz efektów bezpośrednio reagujących na ruch, umożliwiających go albo payoffujących przesunięcia."
        },

    {
          id: "power-support",
          name: "Power Support",
          description: "Rodzina kart bezpośrednio i ciągle dostarczających efektywną Power innym kartom lub lokacjom przez niepermanentne aury, modyfikację wyniku lokacji albo rozdzielanie Power między lokacjami. Nie obejmuje permanentnego Give Power ani efektów zwiększających wyłącznie Power samej karty."
        },

    {
          id: "skills",
          name: "Skills",
          description: "Rodzina kart będących Skillami oraz Characters, które tworzą, wspierają, rozpoznają lub payoffują ich zagrywanie i działanie."
        },

    {
          id: "tech",
          name: "Tech",
          description: "Sytuacyjna odpowiedź, zabezpieczenie albo kontra na konkretną mechanikę, typ karty, stan planszy lub klasę zagrożeń. Tech może być reaktywny albo proaktywny i może nakładać się z Disruption, jeśli karta jednocześnie jest szeroką ingerencją."
        },

    {
          id: "zombie-horde",
          name: "Zombie Horde",
          description: "Rodzina mechaniki Horde: tworzenia, rozwijania, wzmacniania i payoffowania Hordy oraz bezpośrednich supportów tego systemu. Nie obejmuje automatycznie każdej karty będącej Zombie."
        }
  ],

  subtypes: [
    {
              id: "banish",
              name: "Banish",
              description: "Bezpośrednio usuwa kartę z gry mechaniką Banish albo jest kartą typu Skill, która po użyciu automatycznie trafia do Banish. Banish jest odrębne od Destroy i nie liczy się jako zniszczenie, chyba że tekst konkretnego efektu stanowi inaczej."
            },

    {
              id: "board-generator",
              name: "Board Generator",
              description: "Tworzy nowy egzemplarz karty bezpośrednio na planszy. Obejmuje tokeny, losowe karty, kopie i klony oraz nowe karty zastępujące zniszczony egzemplarz. Nie obejmuje przenoszenia istniejących kart z innych stref — te należą do Summon."
            },

    {
              id: "bonus-energy",
              name: "Bonus Energy",
              description: "Bezpośrednio daje graczowi dodatkową Energy ponad naturalny przydział tury — jednorazowo, na kolejną turę albo przez zwiększenie Max Energy. Nie obejmuje payoffów za Energy ani efektów, które wyłącznie kradną, blokują lub reagują na dodatkową Energy."
            },

    {
              id: "card-copy",
              name: "Card Copy",
              description: "Tworzy nowy pełny egzemplarz istniejącej karty w ręce, talii lub na planszy, kopiuje samą siebie albo staje się pełną kopią innej karty. Nie obejmuje kopiowania wyłącznie tekstu, Power ani samej zdolności."
            },

    {
              id: "cost-increase",
              name: "Cost Increase",
              description: "Efekt bezpośrednio zwiększa lub może realnie zwiększyć własny Cost albo Cost innych kart — przez zwiększenie, ustawienie wartości, zamianę, przetasowanie, limit albo inny własny mechanizm. Liczy się rezultat mechaniczny, nie wording efektu."
            },

    {
              id: "cost-reduction",
              name: "Cost Reduction",
              description: "Efekt bezpośrednio obniża lub może realnie obniżyć własny Cost albo Cost innych kart — przez redukcję, ustawienie wartości, zamianę, przetasowanie, limit albo inny własny mechanizm. Liczy się rezultat mechaniczny, nie wording efektu."
            },

    {
              id: "deck-generator",
              name: "Deck Generator",
              description: "Tworzy nowy egzemplarz karty bezpośrednio w talii własnej albo przeciwnika. Obejmuje tasowanie nowych kart, tokenów, kopii i losowych kart do talii oraz przekształcanie kart w talii w nowe egzemplarze."
            },

    {
              id: "delayed-reveal",
              name: "Delayed Reveal",
              description: "Bezpośrednio opóźnia ujawnienie własnych albo innych kart albo umieszcza karty bez ujawnienia, aby zostały ujawnione później."
            },

    {
              id: "double-power",
              name: "Double Power",
              description: "Bezpośrednio podwaja Power karty, całkowitą Power lokacji albo dodatnie lub ujemne modyfikatory Power. Nie obejmuje podwajania innych zasobów, Costu ani samych efektów lub zdolności bez bezpośredniego podwajania Power."
            },

    {
              id: "effect-replication",
              name: "Effect Replication",
              description: "Bezpośrednio kopiuje, powtarza, ponownie uruchamia, zwielokrotnia albo wzmacnia działanie istniejącego efektu lub zdolności bez tworzenia nowej instancji całej karty. Obejmuje kopiowanie tekstu na istniejący obiekt oraz bezpośrednie amplifikowanie istniejących buffów, debuffów i innych efektów. Nie obejmuje tworzenia pełnej kopii karty, samej kradzieży tekstu ani losowego pozyskania tekstu z globalnej puli."
            },

    {
              id: "full-location",
              name: "Full Location",
              description: "Efekt bezpośrednio uruchamia się, zmienia, skaluje albo zostaje wyłączony wskutek zapełnienia jednej lub obu stron lokacji albo określonego rzędu. Nie obejmuje samego ograniczenia celu typu „that isn't full” ani pełnej ręki."
            },

    {
              id: "give-power",
              name: "Give Power",
              description: "Bezpośrednio i trwale zwiększa Power innej karty albo grupy kart, w tym nowo tworzonej lub kopiowanej karty. Nie obejmuje zwiększania wyłącznie własnej Power, ciągłych bonusów Ongoing, Set Power ani samych efektów Location Points."
            },

    {
              id: "hand-gen",
              name: "Hand Generation",
              description: "Tworzy nową instancję karty bezpośrednio w ręce własnej albo przeciwnika. Nie obejmuje Draw, Bounce, odzyskiwania ani przenoszenia już istniejącej instancji karty do ręki."
            },

    {
              id: "location-control",
              name: "Location Control",
              description: "Bezpośrednio tworzy, zmienia, zastępuje, przesuwa, wyłącza, niszczy albo w inny sposób ingeruje w samą lokację. Obejmuje także wyjątkowe efekty fundamentalnie nadpisujące zasady funkcjonowania konkretnej lokacji, jak Professor X. Nie obejmuje zwykłych ograniczeń zagrywania lub ruchu kart ani wyłącznie zmiany wyniku Power lokacji."
            },

    {
              id: "location-points",
              name: "Location Points",
              description: "Bezpośrednio dodaje, odejmuje, mnoży, rozdziela albo ustawia wynik Power lokacji bez trwałej zmiany Power konkretnych kart znajdujących się w tej lokacji."
            },

    {
              id: "modes",
              name: "Modes",
              description: "Karta ma dwa lub więcej wyraźnie odrębnych wariantów własnego działania, a aktywny wariant zmienia się, przełącza albo jest wybierany cyklicznie lub warunkowo, np. zależnie od tury lub własnego stanu. Obejmuje naprzemienne tryby kierujące efekt w różne sposoby; nie obejmuje prostego warunku, który jedynie włącza lub wyłącza ten sam efekt, losowego wyboru celu ani pełnej transformacji w inną kartę."
            },

    {
              id: "play-requirement",
              name: "Play Requirement",
              description: "Karta wymaga albo nagradza określony wzorzec zagrywania: konkretną liczbę, typ lub lokalizację zagrań, świadome niezagranie karty, sekwencję zagrań w wielu turach albo ograniczenie, gdzie lub kiedy sama karta może zostać zagrana. Nie obejmuje zwykłych triggerów uruchamianych po dowolnym zagraniu karty."
            },

    {
              id: "power-aura",
              name: "Power Aura",
              description: "Zapewnia innym własnym lub sojuszniczym kartom ciągły, odwracalny bonus Power tak długo, jak działa zdolność źródłowa, najczęściej Ongoing. Nie obejmuje Self Buff, trwałego Give Power, negatywnych aur lub Afflict, wzmacniania kart przeciwnika ani bezpośrednich Location Points."
            },

    {
              id: "ongoing-self-power",
              name: "Ongoing Self Power",
              description: "Zdolność Ongoing bezpośrednio zapewnia, wylicza lub zwiększa dodatnią Power tej samej karty tak długo, jak efekt pozostaje aktywny. Obejmuje bonusy zależne od warunku, bieżącego stanu i progresu zgromadzonego podczas gry i może nakładać się z Power Scaler. Nie obejmuje negatywnych modyfikatorów własnej Power, Power Aura dla innych kart, Location Points ani efektów, które jedynie amplifikują zewnętrzne zwiększenia Power."
            },

    {
              id: "scaler",
              name: "Power Scaler",
              description: "Własny tekst karty pozwala jej wielokrotnie lub etapowo zwiększać własną Power poprzez powtarzalne efekty, kolejne określone zdarzenia albo gromadzony progres. Skalowanie może wymagać interakcji z innymi mechanikami, ale możliwość kolejnych wzrostów musi wynikać bezpośrednio z tekstu karty. Nie obejmuje jednorazowych burstów, efektów powtarzanych wyłącznie przez inne karty ani Power wyliczanej tylko z bieżącego stanu gry."
            },

    {
              id: "power-steal",
              name: "Power Steal",
              description: "Bezpośrednio odbiera Power jednej lub kilku istniejącym kartom i przekazuje odpowiadającą jej wartość sobie albo wskazanej własnej karcie."
            },

    {
      id: "protection",
      name: "Protection",
      description: "Proaktywnie chroni ciebie, twoje karty albo samą siebie przed negatywną ingerencją, taką jak Destroy, redukcja Power, podwyższanie Costu albo inne bezpośrednie ograniczenia, niezależnie od konkretnego planu przeciwnika."
    },

    {
              id: "random-card-pool",
              name: "Random Card Pool",
              description: "Losowo pozyskuje, dodaje, kopiuje, przechwytuje, wykorzystuje albo przyjmuje tożsamość karty lub jej tekst z puli kart, której dokładnego wyniku gracz nie może sensownie ustawić. Pula może być szeroka albo zawężona, ale tag nie obejmuje samego losowego wyboru celu, lokacji ani innych technicznych random selectorów."
            },

    {
              id: "revive",
              name: "Revive",
              description: "Przywraca istniejącą kartę po jej odrzuceniu, zniszczeniu albo trafieniu do innej utraconej strefy. Może przywrócić ją do ręki albo bezpośrednio na planszę. Nie obejmuje zwykłego Bounce, Summon z aktywnej strefy ani tworzenia nowej kopii."
            },

    {
              id: "row-interaction",
              name: "Row Interaction",
              description: "Zdolność bezpośrednio zależy od położenia kart w front row lub back row, zapełnienia określonego rzędu albo relacji między kartami stojącymi przed i za sobą."
            },

    {
              id: "self-buff",
              name: "Self Buff",
              description: "Bezpośrednio otrzymuje zamknięty, jednorazowy albo burstowy permanentny wzrost własnej Power. Nie obejmuje naturalnego, powtarzalnego skalowania, ciągłego Ongoing Self Power, samego Set Power ani samej mechaniki Merge bez dodatkowego zwiększenia Power."
            },

    {
              id: "set-power",
              name: "Set Power",
              description: "Bezpośrednio ustawia, resetuje albo przypisuje Power karty do konkretnej, bazowej lub wyliczonej wartości zamiast dodawać lub odejmować Power. Obejmuje dynamicznie wyliczone przypisanie i inwersję wartości; nie obejmuje zwykłych buffów lub afflictów, wymiany Power między dwiema kartami, zamiany Cost i Power, pełnego kopiowania karty ani transformacji."
            },

    {
              id: "stat-check",
              name: "Stat Check",
              description: "Karta odczytuje Cost lub Power i wykorzystuje tę statystykę do porównania, rankingu, progu, sumy, różnorodności, równości lub parzystości, warunku, Objective albo dynamicznego wyboru. Nie obejmuje efektów, które tylko wskazują z góry ustaloną kategorię Cost/Power jako grupę celów ani efektów, które jedynie kopiują surową wartość statystyki."
            },

    {
              id: "summon",
              name: "Summon",
              description: "Umieszcza już istniejącą, nieutraconą kartę z ręki, talii albo innej aktywnej strefy bezpośrednio na planszy bez normalnego zagrania. Nie obejmuje przywracania kart po Discard lub Destroy ani tworzenia nowej instancji karty."
            },

    {
              id: "text-disruption",
              name: "Text Disruption",
              description: "Destrukcyjnie ingeruje w tekst istniejącej karty przez usunięcie, wyłączenie, kradzież albo zastąpienie tekstu lub zdolności. Nie obejmuje samego blokowania wykonania bez zmiany tekstu."
            },

    {
              id: "topdeck",
              name: "Topdeck",
              description: "Bezpośrednio odczytuje, modyfikuje, usuwa, przenosi, zagrywa albo umieszcza kartę lub karty z wierzchu talii własnej lub przeciwnika. Nie obejmuje zwykłego Draw ani interakcji z dowolną kartą w talii bez szczególnej relacji z jej wierzchem."
            },

    {
              id: "transform",
              name: "Transform",
              description: "Bezpośrednio zmienia siebie albo inną istniejącą kartę w inną kartę, pełną kopię karty lub określoną alternatywną formę."
            },

    {
              id: "unique-card-creation",
              name: "Unique Card Creation",
              description: "Tworzy konkretną kartę albo zamknięty zestaw kart, do których żaden inny standardowy parent nie ma bezpośredniego dostępu. Unikalność dotyczy źródła generowania, a nie samego statusu karty jako tokenu lub karty niekolekcjonerskiej. Jeżeli tę samą kreację posiada więcej niż jeden standardowy parent, nie jest ona Unique. Globalne lub losowe efekty korzystające z puli cudzych kreacji nie odbierają unikalności ich właściwym parentom."
            },

    {
              id: "unspent-energy",
              name: "Unspent Energy",
              description: "Bezpośrednio sprawdza, wykorzystuje albo reaguje na niewydaną Energy własną lub przeciwnika, jej liczbę albo wcześniejsze tury zakończone z niewydaną Energy."
            },

    {
              id: "winning",
              name: "Winning",
              description: "Mechanika bezpośrednio sprawdza stan wygrywania lub przegrywania lokacji albo możliwość lub wynik wygrania lub przegrania całej gry, reaguje na ten stan albo wykorzystuje go jako warunek efektu."
            }
  ],

  deckArchetypes: [
    {
          id: "antipolar-fours",
          name: "Antipolar Fours",
          description: "Archetyp i pakiet deckbuildingowy zbudowany wokół Anti-Polar Magneto, umieszczania na planszy kart o koszcie 3 lub 4 bez ich normalnego zagrywania oraz wykorzystywania ich wysokiej wartości, efektów ciągłych i warunków Objective. Obejmuje charakterystyczne cele, supporty krzywej i doboru oraz karty regularnie tworzące rozpoznawalny rdzeń tego archetypu. Nie obejmuje automatycznie każdej karty o koszcie 3 lub 4."
        },

    {
          id: "aurora",
          name: "Aurora",
          description: "Archetyp decków budowanych wokół Aurory, różnorodnych typów zdolności oraz elastycznych supportów rozdzielających wartość i Power między lokacjami."
        },

    {
          id: "cerebro",
          name: "Cerebro",
          description: "Rodzina decków zbudowanych wokół Cerebro i utrzymywania wspólnej docelowej Power wielu kart, wraz z charakterystycznymi enablerami, korektami Power i payoffami tego planu."
        },

    {
          id: "classic-destroy",
          name: "Classic Destroy",
          description: "Klasyczny archetyp Destroy oparty na wydajnym niszczeniu własnych kart, powtarzalnych celach do zniszczenia i payoffach takich jak Venom, Death czy Knull."
        },

    {
          id: "classic-discard",
          name: "Classic Discard",
          description: "Klasyczny archetyp Discard oparty na regularnym odrzucaniu kart, payoffach za discard i charakterystycznych finisherach tego stylu gry."
        },

    {
          id: "clog-anni",
          name: "Clog / Annihilus",
          description: "Archetyp Junk/Clog oparty na Annihilusie oraz pakiecie The Hood–Sentry, wspierany przez karty zajmujące przestrzeń przeciwnika, obniżające wartość niechcianych kart i elastyczne narzędzia kontroli planszy."
        },

    {
          id: "darkhawk-ronan",
          name: "Darkhawk / Ronan",
          description: "Charakterystyczny pakiet wokół Darkhawka i Ronana, łączący dokładanie kart do talii lub ręki przeciwnika z payoffami za powiększanie jego zasobów i ograniczanie jakości drawów."
        },

    {
          id: "destroy-combo",
          name: "Destroy Combo",
          description: "Bardziej kombinacyjna rodzina decków Destroy wykorzystująca linie Nimrod/Phoenix Force, wzmacnianie konkretnych celów, niszczenie ich w odpowiednim momencie, odradzanie i powielanie wartości."
        },

    {
          id: "doom-2099",
          name: "Doom 2099",
          description: "Archetyp decków zbudowanych wokół Doom 2099, charakterystycznej krzywej i planu ograniczającego liczbę zagrań na turę w celu regularnego tworzenia DoomBotów i skalowania boardu."
        },

    {
          id: "end-of-turn-combo",
          name: "End of Turn Combo",
          description: "Archetyp decków budowanych wokół wielu zdolności End of Turn, ich powtarzania, wzmacniania i charakterystycznych payoffów."
        },

    {
          id: "fantomex",
          name: "Fantomex",
          description: "Hybrydowy archetyp Destroy–Discard zbudowany wokół Fantomexa oraz kart łączących odrzucanie, niszczenie, odzyskiwanie zasobów i payoffy obu mechanik."
        },

    {
          id: "galactus",
          name: "Galactus",
          description: "Archetyp i pakiet zbudowany wokół Galactusa oraz narzędzi przygotowujących jego warunek, kontrolujących board i wykorzystujących stan gry po zniszczeniu pozostałych lokacji."
        },

    {
          id: "hammer-bros",
          name: "Hammer Bros",
          description: "Pakiet deckbuildingowy zbudowany wokół Thora, Beta Ray Billa, ich młotów oraz narzędzi dobierania, przyzywania i ponownego uruchamiania efektów tych kart."
        },

    {
          id: "hela-discard",
          name: "Hela Discard",
          description: "Archetyp Discard zbudowany wokół odrzucania dużych kart i późniejszego odzyskiwania ich przez Helę lub pokrewne efekty, z charakterystycznymi enablerami, zabezpieczeniami i wysokimi payoffami końcowymi."
        },

    {
          id: "highevo",
          name: "High Evolutionary",
          description: "Archetyp decków zbudowanych wokół High Evolutionary, odblokowanych zdolności kart bez tekstu oraz ich charakterystycznych synergii."
        },

    {
          id: "lockdown",
          name: "Lockdown",
          description: "Archetyp decków ograniczających przestrzeń i możliwości zagrywania kart przez zamykanie lokacji, miękkie blokady oraz supporty obchodzące te ograniczenia lub dostarczające Power do niedostępnych miejsc."
        },

    {
          id: "loki-arishem",
          name: "Loki / Arishem",
          description: "Archetyp decków zbudowanych wokół Arishema, Lokiego i szerokiego dostępu do kart spoza startowej talii, dodatkowych zasobów, generowania wartości oraz payoffów za elastyczny, losowy lub powiększony zestaw kart."
        },

    {
          id: "fallen-one",
          name: "Merge / Fallen One Combo",
          description: "Archetyp combo oparty na mechanice Merge, skalowaniu Power oraz liniach z The Fallen One i kartami mnożącymi, kopiującymi lub konwertującymi Power."
        },

    {
          id: "midrange-control",
          name: "Midrange Control",
          description: "Szersza grupa decków łączących wydajne karty value/tempo z pakietami Tech, Disruption i reaktywną kontrolą, bez konieczności budowania całego planu wokół jednej mechaniki lub priority."
        },

    {
          id: "mill",
          name: "Mill",
          description: "Archetyp decków celowo odbierających przeciwnikowi zasoby z talii, przejmujących je albo ograniczających jego przyszłe drawy przy użyciu charakterystycznego pakietu Mill."
        },

    {
          id: "mini-movers",
          name: "Mini Movers",
          description: "Archetyp Move oparty na elastycznym przesuwaniu wielu mniejszych kart, rozkładaniu Power między lokacjami i payoffach takich jak Kraven, Hydra Stomper czy Batroc zamiast jednego głównego skalera."
        },

    {
          id: "mister-negative",
          name: "Mister Negative",
          description: "Archetyp decków zbudowanych wokół Mister Negative, wcześniejszego uruchamiania jego zdolności oraz wykorzystywania kart, które po manipulacji Costem i Power stają się wyjątkowo wydajne."
        },

    {
          id: "move-combo",
          name: "Move Combo",
          description: "Greedy archetyp Move oparty na wielokrotnym przesuwaniu i skalowaniu kluczowych payoffów takich jak Human Torch czy Dagger oraz na dużych sekwencjach ruchu i finisherach."
        },

    {
          id: "ozymandias-pack",
          name: "Ozymandias Pack",
          description: "Pakiet kart wspierających Ozymandiasa przez tworzenie i wykorzystywanie Rocks oraz kart bez zdolności, wraz z charakterystycznymi supportami tego shellu."
        },

    {
          id: "patriot",
          name: "Patriot",
          description: "Archetyp i pakiet kart skupiony na jednostkach bez zdolności, generatorach takich kart oraz payoffach wzmacniających No Ability, szczególnie wokół Patriota, Ultrona i pokrewnych shelli."
        },

    {
          id: "pixie",
          name: "Pixie",
          description: "Archetyp decków zbudowanych wokół Pixie i mieszania Costów kart w talii, wykorzystujący charakterystyczne sposoby ograniczania ryzyka, poprawiania drawów i zamieniania drogich payoffów w bardzo wydajne zagrania."
        },

    {
          id: "power-steal-combo",
          name: "Power Steal Combo",
          description: "Archetyp wokół kradzieży Power i Vampire Deacon Frost, który korzysta także z mechanik kart pochodnych, takich jak Crimson Behemoth. Obejmuje karty Power Steal faktycznie wykorzystywane w tym planie, Stryfe'a jako payoff synergiczny oraz Joaquina Torresa Falcon II jako wsparcie. Nie obejmuje wszystkich kart posiadających mechanikę Power Steal ani ogólnych narzędzi Bounce."
        },

    {
          id: "prio-control",
          name: "Prio Control",
          description: "Grupa decków budujących i utrzymujących priority przez efektywne statystyki i tempo, a następnie wykorzystujących reaktywne Tech, Disruption i narzędzia kontrolne szczególnie skuteczne przy prowadzeniu na planszy."
        },

    {
          id: "ramp",
          name: "Ramp",
          description: "Archetyp decków obchodzących standardową krzywą przez dodatkową Energy, Cost manipulation, Summon lub inne formy cheatowania drogich kart oraz charakterystyczne duże payoffy."
        },

    {
          id: "ravonna-agent-venom",
          name: "Ravonna / Agent Venom",
          description: "Archetyp i pakiet oparty na kartach o niskiej bazowej Power, które szczególnie korzystają z Ravonny, Agent Venoma oraz efektów wzmacniających ich statystyki lub zwiększających wydajność charakterystycznych payoffów takich jak Iron Man i pokrewne karty."
        },

    {
          id: "nightmare-skaar",
          name: "Nightmare / Skaar",
          description: "Archetyp decków opartych na dużych kartach synergicznych ze Skaarem, Surturem i podobnymi payoffami za wysoką Power. Często łączy także karty z Downside z popularnymi supportami obchodzącymi lub wykorzystującymi ich wady, takimi jak Nightmare czy Zero."
        },

    {
          id: "scream-opp-move",
          name: "Scream / Opponent Move",
          description: "Archetyp decków opartych na przymusowym przesuwaniu kart przeciwnika, karaniu их za ruch, kontroli pozycji i payoffach zależnych od przesunięć wrogich kart."
        },

    {
          id: "sera-control",
          name: "Sera Control",
          description: "Reaktywny archetyp kontrolny zbudowany wokół Sery, obniżania Costu i zagrywania wielu elastycznych kart Tech, Disruption i odpowiedzi w późnych turach."
        },

    {
          id: "she-moon",
          name: "She-Moon",
          description: "Archetyp decków opartych na Moon Girl i She-Hulk, kopiowaniu wartości w ręce, oszczędzaniu Energy i dużym hand dumpie w późnych turach, z charakterystycznymi supportami redukcji Costu oraz tanimi finisherami."
        },

    {
          id: "small-buff-bounce",
          name: "Small Buff / Bounce",
          description: "Archetyp i pakiet łączący częste małe permanentne buffy z kartami Bounce i supportami pozwalającymi wielokrotnie wykorzystywać tanie enablery. Obejmuje zazębiające się shelle Shou-Lao, Venus i pokrewne pakiety Bounce; nie jest kopią rodziny mechanicznej Bounce, bo opisuje realny plan deckbuildingowy i jego charakterystyczne supporty oraz payoffy."
        },

    {
          id: "spectrum-ongoing",
          name: "Spectrum Ongoing",
          description: "Midrange’owy archetyp Ongoing oparty na szerokim boardzie trwałych efektów Ongoing, ich statystycznej wartości oraz payoffach takich jak Spectrum."
        },

    {
          id: "surfer-buff",
          name: "Surfer / Buff",
          description: "Archetyp łączący klasyczne shelle Silver Surfera z pakietami klasycznego Buffu, Handbuffu i Deck Buffu. Obejmuje charakterystyczne enablery, payoffy i supporty tych zazębiających się planów, ale nie każdy uniwersalny tech grany okazjonalnie w Surferze."
        },

    {
          id: "thanos",
          name: "Thanos",
          description: "Archetyp decków zbudowanych wokół Thanosa, Infinity Stones i charakterystycznych payoffów oraz supportów wykorzystujących dodatkowe karty, draw, szeroki board i synergie kamieni."
        },

    {
          id: "toxic-afflict",
          name: "Toxic / Afflict",
          description: "Archetyp decków opartych na obniżaniu Power kart przeciwnika, rozprowadzaniu Afflictów oraz payoffach i narzędziach wykorzystujących ujemne modyfikatory Power jako główny plan zwycięstwa."
        },

    {
          id: "tribunal-ongoing",
          name: "Tribunal Ongoing",
          description: "Combo archetyp Ongoing oparty na kumulowaniu i mnożeniu Power przy użyciu kart takich jak Iron Man, Onslaught i Living Tribunal oraz na narzędziach składających tę linię combo."
        },

    {
          id: "victoria-hand-big-hand",
          name: "Victoria Hand / Big Hand",
          description: "Archetyp decków opartych na kartach tworzonych lub kopiowanych do ręki i/lub utrzymywaniu dużej albo pełnej ręki, z payoffami takimi jak Victoria Hand, Devil Dinosaur, Kahhori, Mad Thinker i Red Wolf Fractured Frontier oraz charakterystycznymi generatorami, kopiarkami i supportem typu Quinjet."
        },

    {
          id: "werewolf-spells",
          name: "Werewolf/Spells",
          description: "Archetyp i pakiet kart oparty na Werewolf By Night, tanich skillach oraz synergujących z nimi jednostkach."
        },

    {
          id: "wongreveal",
          name: "Wong / On Reveal Combo",
          description: "Archetyp decków combo opartych na wielokrotnym uruchamianiu, kopiowaniu lub ponawianiu efektów On Reveal oraz payoffach szczególnie korzystających z ich powielania."
        },

    {
          id: "zombie-galacti",
          name: "Zombie Galacti",
          description: "Archetyp decków zbudowanych wokół Zombie Galacti i charakterystycznego sposobu przekształcania lub rozwijania talii oraz supportów jego planu."
        },

    {
          id: "zombie-horde-combo",
          name: "Zombie Horde Combo",
          description: "Archetyp combo zbudowany wokół Zombie Horde oraz charakterystycznych sposobów tworzenia, rozwijania, wzmacniania lub wykorzystywania zombie i powiązanych payoffów jako spójnego planu deckbuildingowego."
        },

    {
          id: "zoo",
          name: "Zoo",
          description: "Archetyp oparty na zalewaniu planszy tanimi kartami, szczególnie 1-Costami i generatorami małych jednostek, oraz supportach i finisherach nagradzających szeroki board."
        }
  ],

  teams: [
    {
              id: "agents-of-atlas",
              name: "Agents of Atlas",
              description: "Członkowie klasycznych i współczesnych inkarnacji Agents of Atlas."
            },

    {
              id: "annihilators",
              name: "Annihilators",
              description: "Najpotężniejsi kosmiczni bohaterowie należący do drużyny Annihilators."
            },

    {
              id: "asgardians",
              name: "Asgardians",
              description: "Bogowie, mieszkańcy i bohaterowie związani z Asgardem."
            },

    {
              id: "atlanteans",
              name: "Atlanteans",
              description: "Postacie należące do Atlantydy i jej atlantydzkiej społeczności."
            },

    {
              id: "avengers",
              name: "Avengers",
              description: "Członkowie Avengers."
            },

    {
              id: "black-order",
              name: "Black Order",
              description: "Thanos oraz członkowie elitarnej kosmicznej organizacji Black Order."
            },

    {
              id: "brotherhood",
              name: "Brotherhood of Mutants",
              description: "Najważniejsi i wieloletni członkowie różnych inkarnacji Brotherhood of Mutants."
            },

    {
              id: "cabal",
              name: "Cabal",
              description: "Członkowie tajnej rady złoczyńców utworzonej przez Normana Osborna podczas Dark Reign."
            },

    {
              id: "celestial-eternals",
              name: "Celestials & Eternals",
              description: "Celestials oraz stworzeni przez nich Eternals, połączeni w jedną kosmiczną afiliację."
            },

    {
              id: "dark-avengers",
              name: "Dark Avengers",
              description: "Norman Osborn i członkowie jego rządowej drużyny złoczyńców podszywających się pod Avengers."
            },

    {
              id: "defenders",
              name: "Defenders",
              description: "Członkowie klasycznych i ulicznych inkarnacji drużyny Defenders."
            },

    {
              id: "fantastic4",
              name: "Fantastic Four",
              description: "Członkowie Fantastic Four."
            },

    {
              id: "future-foundation",
              name: "Future Foundation",
              description: "Członkowie i najważniejsi współpracownicy organizacji Future Foundation związanej z Fantastyczną Czwórką."
            },

    {
              id: "guardians",
              name: "Guardians of the Galaxy",
              description: "Członkowie Guardians of the Galaxy."
            },

    {
              id: "hellfire-club",
              name: "Hellfire Club",
              description: "Najważniejsi i długoterminowi członkowie Hellfire Club oraz jego Inner Circle."
            },

    {
              id: "heroes-for-hire",
              name: "Heroes for Hire",
              description: "Stali i najbardziej rozpoznawalni członkowie organizacji Heroes for Hire."
            },

    {
              id: "horsemen",
              name: "Horsemen of Apocalypse",
              description: "Apocalypse, En Sabah Nur oraz postacie przedstawione jako jego Jeźdźcy Apokalipsy."
            },

    {
              id: "hydra",
              name: "Hydra",
              description: "Liderzy, agenci i najważniejsi członkowie organizacji Hydra."
            },

    {
              id: "illuminati",
              name: "Illuminati",
              description: "Członkowie tajnej rady najpotężniejszych i najbardziej wpływowych bohaterów Marvela."
            },

    {
              id: "inhumans",
              name: "Inhumans",
              description: "Członkowie Inhumans."
            },

    {
              id: "marvel-knights",
              name: "Marvel Knights",
              description: "Członkowie ulicznego sojuszu Marvel Knights działającego przeciwko przestępczości i zagrożeniom miejskim."
            },

    {
              id: "midnight-sons",
              name: "Midnight Sons",
              description: "Członkowie Midnight Sons."
            },

    {
              id: "new-avengers",
              name: "New Avengers",
              description: "Najważniejsi członkowie oryginalnej oraz podziemnej inkarnacji New Avengers."
            },

    {
              id: "new-mutants",
              name: "New Mutants",
              description: "Najważniejsi i długoterminowi członkowie drużyny New Mutants."
            },

    {
              id: "shield",
              name: "S.H.I.E.L.D.",
              description: "Agenci i członkowie organizacji S.H.I.E.L.D."
            },

    {
              id: "sinister-six",
              name: "Sinister Six",
              description: "Członkowie Sinister Six."
            },

    {
              id: "spider-verse",
              name: "Spider-Verse",
              description: "Postacie należące do uniwersum Spider-Mana."
            },

    {
              id: "symbiotes",
              name: "Symbiotes",
              description: "Symbionty oraz postacie bezpośrednio z nimi związane."
            },

    {
              id: "thunderbolts",
              name: "Thunderbolts",
              description: "Członkowie Thunderbolts."
            },

    {
              id: "wakanda",
              name: "Wakanda",
              description: "Postacie należące do Wakandy oraz najważniejsze osoby i bóstwa związane z jej historią, kulturą i władzą."
            },

    {
              id: "west-coast-avengers",
              name: "West Coast Avengers",
              description: "Najważniejsi członkowie klasycznych i współczesnych inkarnacji West Coast Avengers."
            },

    {
              id: "x-force",
              name: "X-Force",
              description: "Najważniejsi i długoterminowi członkowie różnych inkarnacji X-Force."
            },

    {
              id: "xmen",
              name: "X-Men",
              description: "Członkowie X-Men."
            },

    {
              id: "young-avengers",
              name: "Young Avengers",
              description: "Członkowie Young Avengers."
            }
  ],

  themes: [
    {
          id: "animal-themed",
          name: "Animal-Themed",
          description: "Postacie niebędące faktycznymi zwierzętami, ale wyraźnie nawiązujące do istniejącego zwierzęcia przez nazwę, wygląd, kostium, moce albo motyw."
        },

    {
          id: "animals",
          name: "Animals",
          description: "Faktyczne zwierzęta, antropomorficzne zwierzęta oraz jednoznacznie zwierzęce istoty."
        },

    {
          id: "antiheroes",
          name: "Antiheroes",
          description: "Postacie działające po stronie dobra lub jako protagoniści, ale stosujące moralnie szare, brutalne albo przestępcze metody."
        },

    {
          id: "cosmic-entities",
          name: "Cosmic Entities",
          description: "Kosmiczne byty, abstrakty i istoty o ponadludzkiej, uniwersalnej lub międzywymiarowej skali mocy."
        },

    {
          id: "fractured-frontier",
          name: "Fractured Frontier",
          description: "Postacie i wersje kart pochodzące z Earth-383, oficjalnego kosmiczno-westernowego uniwersum Fractured Frontier stworzonego dla MARVEL SNAP."
        },

    {
          id: "geniuses",
          name: "Geniuses",
          description: "Wybitni naukowcy, wynalazcy, konstruktorzy i strategiczni geniusze, których intelekt jest jedną z głównych cech postaci."
        },

    {
          id: "magicians",
          name: "Magicians",
          description: "Magowie, czarownicy, wiedźmy oraz postacie aktywnie używające magii i mistycznych mocy."
        },

    {
          id: "monsters",
          name: "Monsters",
          description: "Potwory."
        },

    {
          id: "robots-cyborgs",
          name: "Robots & Cyborgs",
          description: "Roboty, androidy, synthezoidy oraz postacie trwale połączone z cybernetyką, dla których mechaniczne ciało lub części są kluczowym elementem tożsamości. Nie obejmuje zwykłych użytkowników zbroi, mechów ani technologicznego wyposażenia."
        },

    {
          id: "villains",
          name: "Villains",
          description: "Złoczyńcy."
        },

    {
          id: "zombies",
          name: "Zombies",
          description: "Karty będące fabularnie lub wizualnie Zombie. Tag tematyczny jest niezależny od mechanicznej rodziny Zombie Horde — karta Zombie nie musi mechanicznie korzystać z Horde."
        },


    {
      id: "season-2022-05-enter-the-multiverse",
      name: "Enter the Multiverse (2022-05)",
      description: "Sezon Marvel Snap 2022-05 — Enter the Multiverse. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2022-06-atlantis-beach-club",
      name: "Atlantis Beach Club (2022-06)",
      description: "Sezon Marvel Snap 2022-06 — Atlantis Beach Club. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2022-07-love-and-thunder",
      name: "Love and Thunder (2022-07)",
      description: "Sezon Marvel Snap 2022-07 — Love and Thunder. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2022-08-heroes-for-hire",
      name: "Heroes for Hire (2022-08)",
      description: "Sezon Marvel Snap 2022-08 — Heroes for Hire. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2022-09-sword-and-shield",
      name: "Sword and Shield (2022-09)",
      description: "Sezon Marvel Snap 2022-09 — Sword and Shield. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2022-10-symbiote-invasion",
      name: "Symbiote Invasion (2022-10)",
      description: "Sezon Marvel Snap 2022-10 — Symbiote Invasion. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2022-11-warriors-of-wakanda",
      name: "Warriors of Wakanda (2022-11)",
      description: "Sezon Marvel Snap 2022-11 — Warriors of Wakanda. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2022-12-the-power-cosmic",
      name: "The Power Cosmic (2022-12)",
      description: "Sezon Marvel Snap 2022-12 — The Power Cosmic. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2023-01-savage-land",
      name: "Savage Land (2023-01)",
      description: "Sezon Marvel Snap 2023-01 — Savage Land. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2023-02-into-the-quantum-realm",
      name: "Into the Quantum Realm (2023-02)",
      description: "Sezon Marvel Snap 2023-02 — Into the Quantum Realm. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2023-03-days-of-future-past",
      name: "Days of Future Past (2023-03)",
      description: "Sezon Marvel Snap 2023-03 — Days of Future Past. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2023-04-animals-assemble",
      name: "Animals Assemble (2023-04)",
      description: "Sezon Marvel Snap 2023-04 — Animals Assemble. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2023-05-guardians-greatest-hits",
      name: "Guardians' Greatest Hits (2023-05)",
      description: "Sezon Marvel Snap 2023-05 — Guardians' Greatest Hits. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2023-06-spider-versus",
      name: "Spider-Versus (2023-06)",
      description: "Sezon Marvel Snap 2023-06 — Spider-Versus. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2023-07-rise-of-the-phoenix",
      name: "Rise of the Phoenix (2023-07)",
      description: "Sezon Marvel Snap 2023-07 — Rise of the Phoenix. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2023-08-big-in-japan",
      name: "Big in Japan (2023-08)",
      description: "Sezon Marvel Snap 2023-08 — Big in Japan. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2023-09-loki-for-all-time",
      name: "Loki For All Time (2023-09)",
      description: "Sezon Marvel Snap 2023-09 — Loki For All Time. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2023-10-bloodstone",
      name: "Bloodstone (2023-10)",
      description: "Sezon Marvel Snap 2023-10 — Bloodstone. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2023-11-higher-further-faster",
      name: "Higher, Further, Faster (2023-11)",
      description: "Sezon Marvel Snap 2023-11 — Higher, Further, Faster. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2023-12-hellfire-gala",
      name: "Hellfire Gala (2023-12)",
      description: "Sezon Marvel Snap 2023-12 — Hellfire Gala. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2024-01-planet-hulk",
      name: "Planet Hulk (2024-01)",
      description: "Sezon Marvel Snap 2024-01 — Planet Hulk. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2024-02-black-order",
      name: "Black Order (2024-02)",
      description: "Sezon Marvel Snap 2024-02 — Black Order. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2024-03-avengers-vs-x-men",
      name: "Avengers vs. X-Men (2024-03)",
      description: "Sezon Marvel Snap 2024-03 — Avengers vs. X-Men. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2024-04-thunderbolts",
      name: "Thunderbolts (2024-04)",
      description: "Sezon Marvel Snap 2024-04 — Thunderbolts. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2024-05-a-blink-in-time",
      name: "A Blink in Time (2024-05)",
      description: "Sezon Marvel Snap 2024-05 — A Blink in Time. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2024-06-the-celestials-finest",
      name: "The Celestials' Finest (2024-06)",
      description: "Sezon Marvel Snap 2024-06 — The Celestials' Finest. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2024-07-maximum-effort",
      name: "Maximum Effort (2024-07)",
      description: "Sezon Marvel Snap 2024-07 — Maximum Effort. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2024-08-young-avengers",
      name: "Young Avengers (2024-08)",
      description: "Sezon Marvel Snap 2024-08 — Young Avengers. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2024-09-the-amazing-spider-season",
      name: "The Amazing Spider-Season (2024-09)",
      description: "Sezon Marvel Snap 2024-09 — The Amazing Spider-Season. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2024-10-we-are-venom",
      name: "We Are Venom (2024-10)",
      description: "Sezon Marvel Snap 2024-10 — We Are Venom. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2024-11-war-of-the-nine-realms",
      name: "War of the Nine Realms (2024-11)",
      description: "Sezon Marvel Snap 2024-11 — War of the Nine Realms. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2024-12-marvel-rivals",
      name: "Marvel Rivals (2024-12)",
      description: "Sezon Marvel Snap 2024-12 — Marvel Rivals. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2025-01-dark-avengers",
      name: "Dark Avengers (2025-01)",
      description: "Sezon Marvel Snap 2025-01 — Dark Avengers. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2025-02-brave-new-world",
      name: "Brave New World (2025-02)",
      description: "Sezon Marvel Snap 2025-02 — Brave New World. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2025-03-prehistoric-avengers",
      name: "Prehistoric Avengers (2025-03)",
      description: "Sezon Marvel Snap 2025-03 — Prehistoric Avengers. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2025-04-what-if",
      name: "What If...? (2025-04)",
      description: "Sezon Marvel Snap 2025-04 — What If...?. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2025-05-new-x-men",
      name: "New X-Men (2025-05)",
      description: "Sezon Marvel Snap 2025-05 — New X-Men. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2025-06-masters-of-the-arcane",
      name: "Masters of the Arcane (2025-06)",
      description: "Sezon Marvel Snap 2025-06 — Masters of the Arcane. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2025-07-fantastic-four",
      name: "Fantastic Four (2025-07)",
      description: "Sezon Marvel Snap 2025-07 — Fantastic Four. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2025-08-heralds-of-galactus",
      name: "Heralds of Galactus (2025-08)",
      description: "Sezon Marvel Snap 2025-08 — Heralds of Galactus. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2025-09-visions-of-the-future",
      name: "Visions of the Future (2025-09)",
      description: "Sezon Marvel Snap 2025-09 — Visions of the Future. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2025-10-undead-horde",
      name: "Undead Horde (2025-10)",
      description: "Sezon Marvel Snap 2025-10 — Undead Horde. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2025-11-arachnid-anarchy",
      name: "Arachnid Anarchy (2025-11)",
      description: "Sezon Marvel Snap 2025-11 — Arachnid Anarchy. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2025-12-weapon-x",
      name: "Weapon X (2025-12)",
      description: "Sezon Marvel Snap 2025-12 — Weapon X. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2026-01-dragons",
      name: "Dragons (2026-01)",
      description: "Sezon Marvel Snap 2026-01 — Dragons. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2026-02-guardians-greatest-hits-vol-2",
      name: "Guardians' Greatest Hits Vol. 2 (2026-02)",
      description: "Sezon Marvel Snap 2026-02 — Guardians' Greatest Hits Vol. 2. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2026-03-x-men-origins-of-apocalypse",
      name: "X-Men: Origins of Apocalypse (2026-03)",
      description: "Sezon Marvel Snap 2026-03 — X-Men: Origins of Apocalypse. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2026-04-x-men-end-of-days",
      name: "X-Men: End of Days (2026-04)",
      description: "Sezon Marvel Snap 2026-04 — X-Men: End of Days. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2026-05-daredevil-crimson-twilight",
      name: "Daredevil: Crimson Twilight (2026-05)",
      description: "Sezon Marvel Snap 2026-05 — Daredevil: Crimson Twilight. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2026-06-marvel-beach-bash",
      name: "Marvel Beach Bash (2026-06)",
      description: "Sezon Marvel Snap 2026-06 — Marvel Beach Bash. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2026-07-spider-man-brand-new-day",
      name: "Spider-Man: Brand New Day (2026-07)",
      description: "Sezon Marvel Snap 2026-07 — Spider-Man: Brand New Day. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2026-08-fractured-frontier",
      name: "Fractured Frontier (2026-08)",
      description: "Sezon Marvel Snap 2026-08 — Fractured Frontier. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2026-09-axis-inversion",
      name: "AXIS: Inversion (2026-09)",
      description: "Sezon Marvel Snap 2026-09 — AXIS: Inversion. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2026-10-vampires-vs-zombies",
      name: "Vampires vs. Zombies (2026-10)",
      description: "Sezon Marvel Snap 2026-10 — Vampires vs. Zombies. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    },

    {
      id: "season-2026-11-knights-of-avalon",
      name: "Knights of Avalon (2026-11)",
      description: "Sezon Marvel Snap 2026-11 — Knights of Avalon. Oznacza karty, które po raz pierwszy udostępniono w tym sezonie; bez późniejszych Series Dropów i bez tokenów generowanych przez inne karty."
    }
  ],

  special: [
    {
      id: "featured",
      name: "Featured",
      description: "Karty wyróżnione."
    },

    {
      id: "wind1",
      name: "Winning Draft 1",
      description: "Karta znajdowała się w zwycięskim decku Draftu 1."
    },

    {
      id: "wind2",
      name: "Winning Draft 2",
      description: "Karta znajdowała się w zwycięskim decku Draftu 2."
    },

    {
      id: "wind3",
      name: "Winning Draft 3",
      description: "Karta znajdowała się w zwycięskim decku Draftu 3."
    },

    {
      id: "wind4",
      name: "Winning Draft 4",
      description: "Karta znajdowała się w zwycięskim decku Draftu 4."
    },

    {
      id: "wind5",
      name: "Winning Draft 5",
      description: "Karta znajdowała się w zwycięskim decku Draftu 5."
    },

    {
      id: "wind6",
      name: "Winning Draft 6",
      description: "Karta znajdowała się w zwycięskim decku Draftu 6."
    },

    {
      id: "wind7",
      name: "Winning Draft 7",
      description: "Karta znajdowała się w zwycięskim decku Draftu 7."
    },

    {
      id: "wind8",
      name: "Winning Draft 8",
      description: "Karta znajdowała się w zwycięskim decku Draftu 8."
    },

    {
      id: "wind9",
      name: "Winning Draft 9",
      description: "Karta znajdowała się w zwycięskim decku Draftu 9."
    },

    {
      id: "wind10",
      name: "Winning Draft 10",
      description: "Karta znajdowała się w zwycięskim decku Draftu 10."
    },

    {
      id: "wind11",
      name: "Winning Draft 11",
      description: "Karta znajdowała się w zwycięskim decku Draftu 11."
    },

    {
      id: "wind12",
      name: "Winning Draft 12",
      description: "Karta znajdowała się w zwycięskim decku Draftu 12."
    },

    {
      id: "wind13",
      name: "Winning Draft 13",
      description: "Karta znajdowała się w zwycięskim decku Draftu 13."
    },

    {
      id: "wind14",
      name: "Winning Draft 14",
      description: "Karta znajdowała się w zwycięskim decku Draftu 14."
    },

    {
      id: "wind15",
      name: "Winning Draft 15",
      description: "Karta znajdowała się w zwycięskim decku Draftu 15."
    },

    {
      id: "wind16",
      name: "Winning Draft 16",
      description: "Karta znajdowała się w zwycięskim decku Draftu 16."
    },

    {
      id: "wind17",
      name: "Winning Draft 17",
      description: "Karta znajdowała się w zwycięskim decku Draftu 17."
    },

    {
      id: "wind18",
      name: "Winning Draft 18",
      description: "Karta znajdowała się w zwycięskim decku Draftu 18."
    },

    {
      id: "wind19",
      name: "Winning Draft 19",
      description: "Karta znajdowała się w zwycięskim decku Draftu 19."
    },

    {
      id: "wind20",
      name: "Draft 20",
      description: "Karta powiązana z Draftem 20."
    },

    {
      id: "wind21",
      name: "Draft 21",
      description: "Karta powiązana z Draftem 21."
    },

    {
      id: "wind22",
      name: "Draft 22",
      description: "Karta powiązana z Draftem 22."
    },

    {
      id: "wind23",
      name: "Draft 23",
      description: "Karta powiązana z Draftem 23."
    },

    {
      id: "wind24",
      name: "Draft 24",
      description: "Karta powiązana z Draftem 24."
    },

    {
      id: "wind25",
      name: "Draft 25",
      description: "Karta powiązana z Draftem 25."
    },

    {
      id: "wind26",
      name: "Draft 26",
      description: "Karta powiązana z Draftem 26."
    }
  ]

};