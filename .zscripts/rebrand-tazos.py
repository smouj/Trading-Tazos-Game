#!/usr/bin/env python3
"""Generate fictional tazo names for Minimon, Cybermon, Draco Bell franchises."""

# === MINIMON (51 tazos, inspired by Pokémon / Ken Sugimori style) ===
MINIMON_NAMES = [
    # n, old_name, new_name — keeping creature essence with fictional names
    ("1",  "Bulbasaur",   "Bulbapod"),
    ("2",  "Charmander",  "Flamander"),
    ("3",  "Squirtle",    "Squirtide"),
    ("4",  "Metapod",     "Crysapod"),
    ("5",  "Weedle",      "Thornlet"),
    ("6",  "Pidgeotto",   "Aeroquill"),
    ("7",  "Rattata",     "Rattusk"),
    ("8",  "Spearow",     "Beaklare"),
    ("9",  "Arbok",       "Venoclaw"),
    ("10", "Pikachu",     "Mimichu"),
    ("11", "Raichu",      "Mimirai"),
    ("12", "Nidoran♀",    "Spikefawn"),
    ("13", "Nidorina",    "Spikeena"),
    ("14", "Vulpix",      "Kitsune"),
    ("15", "Jigglypuff",  "Puffluff"),
    ("16", "Golbat",      "Noctwing"),
    ("17", "Oddish",      "Sporebloom"),
    ("18", "Paras",       "Shroomite"),
    ("19", "Venonat",     "Fluttertox"),
    ("20", "Diglett",     "Dugglet"),
    ("21", "Meowth",      "Kittcoin"),
    ("22", "Psyduck",     "Minduck"),
    ("23", "Mankey",      "Primalang"),
    ("24", "Growlithe",   "Emberpup"),
    ("25", "Poliwag",     "Tadswirl"),
    ("26", "Kadabra",     "Psyklon"),
    ("27", "Machamp",     "Quadrarm"),
    ("28", "Bellsprout",  "Chimevine"),
    ("29", "Tentacool",   "Jelliflow"),
    ("30", "Geodude",     "Boulderock"),
    ("31", "Ponyta",      "Pyrosteed"),
    ("32", "Slowpoke",    "Dozewell"),
    ("33", "Magnemite",   "Voltorb"),
    ("34", "Grimer",      "Sludger"),
    ("35", "Gastly",      "Wraithen"),
    ("36", "Drowzee",     "Hypnopod"),
    ("37", "Krabby",      "Clawpincer"),
    ("38", "Voltorb",     "Electrobal"),
    ("39", "Exeggcute",   "Seedclust"),
    ("40", "Cubone",      "Marrowsk"),
    ("41", "Koffing",     "Smogbelch"),
    ("42", "Rhydon",      "Boulderdon"),
    ("43", "Horsea",      "Seasteed"),
    ("44", "Goldeen",     "Gildfish"),
    ("45", "Staryu",      "Starwave"),
    ("46", "Magikarp",    "Splashcarp"),
    ("47", "Eevee",       "Evoleon"),
    ("48", "Omanyte",     "Helixpawn"),
    ("49", "Kabuto",      "Carapod"),
    ("50", "Dragonair",   "Serpenthia"),
    ("51", "Ash",         "Tamer Red"),
]

# === DRACO BELL (118 tazos, inspired by Dragon Ball / Akira Toriyama style) ===
# DBZ Normal #1-10
DRACOBELL_NORMAL = [
    ("1",  "Freezer",      "Glacius"),
    ("2",  "Recoome",      "Brutox"),
    ("3",  "Ginyu",        "Zentar"),
    ("4",  "Burter",       "Veloxis"),
    ("5",  "Dodoria",      "Tankara"),
    ("6",  "Guldo",        "Psykron"),
    ("7",  "Saibaman",     "Sporefiend"),
    ("8",  "A-19",         "Mech-19"),
    ("9",  "Spopovitch",   "Gorrax"),
    ("10", "Yamu",         "Vorax"),
]

# DBZ Supertazos Voladores #11-30
DRACOBELL_VOLADORES = [
    ("11", "Babidi",         "Hexxar"),
    ("12", "Piccolo Jr.",    "Phycaro Jr."),
    ("13", "Spopovitch",     "Gorrax"),
    ("14", "Son Goku",       "Kairo"),
    ("15", "Gotten y Trunks","Rohan y Trux"),
    ("16", "Yakon",          "Nightfang"),
    ("17", "Satán",          "Marcellus"),
    ("18", "Videl",          "Reyna"),
    ("19", "Pui-Pui",        "Zonk"),
    ("20", "Kibito",         "Arkos"),
    ("21", "Kaio-Shin",      "Zen-Shin"),
    ("22", "Cell Jr.",       "Phantom Jr."),
    ("23", "Son Gohan",      "Rohan"),
    ("24", "Kaio-sama",      "Zen-Master"),
    ("25", "A-16",           "Mech-16"),
    ("26", "Chi-Chi",        "Mei-Mei"),
    ("27", "A-18",           "Mech-18"),
    ("28", "Freezer",        "Glacius"),
    ("29", "Yamu",           "Vorax"),
    ("30", "Bulma",          "Sora"),
]

# DBZ Supertazos Octogonales #31-50
DRACOBELL_OCTOGONALES = [
    ("31", "Cell 1ª fase",    "Phantom Phase 1"),
    ("32", "Pui-Pui",         "Zonk"),
    ("33", "Cell 2ª fase",    "Phantom Phase 2"),
    ("34", "Yakon",           "Nightfang"),
    ("35", "A-16",            "Mech-16"),
    ("36", "King Cold",       "Lord Frost"),
    ("37", "Cell 3ª fase",    "Phantom Phase 3"),
    ("38", "Dabra",           "Hexblade"),
    ("39", "Majin Boo",       "Chaos Buu"),
    ("40", "Babidi",          "Hexxar"),
    ("41", "Vegeta",          "Vexar"),
    ("42", "Videl",           "Reyna"),
    ("43", "Son Gotten",      "Rohax"),
    ("44", "Trunks",          "Trux"),
    ("45", "Piccolo Junior",  "Phycaro Junior"),
    ("46", "Son Goku",        "Kairo"),
    ("47", "Kaio-Shin",       "Zen-Shin"),
    ("48", "Son Gohan",       "Rohan"),
    ("49", "Kibito",          "Arkos"),
    ("50", "Kaio-sama",       "Zen-Master"),
]

# DBZ Megatazos #51-70
DRACOBELL_MEGA = [
    ("51", "Son Goku",     "Kairo"),
    ("52", "Vegeta",       "Vexar"),
    ("53", "Son Gohan",    "Rohan"),
    ("54", "Son Gotten",   "Rohax"),
    ("55", "Trunks",       "Trux"),
    ("56", "Piccolo Jr.",  "Phycaro Jr."),
    ("57", "Cell",         "Phantom"),
    ("58", "Majin Boo",    "Chaos Buu"),
    ("59", "Babidi",       "Hexxar"),
    ("60", "Dabra",        "Hexblade"),
    ("61", "Kibito",       "Arkos"),
    ("62", "Satán",        "Marcellus"),
    ("63", "Shin Sama",    "Zentaro"),
    ("64", "Kaio-Shin",    "Zen-Shin"),
    ("65", "Videl",        "Reyna"),
    ("66", "Bulma",        "Sora"),
    ("67", "Krilin",       "Baldwin"),
    ("68", "Mutenroshi",   "Kame-Sensei"),
    ("69", "Pui-Pui",      "Zonk"),
    ("70", "Kaio-sama",    "Zen-Master"),
]

# DBZ Holo 3D #1-10
DRACOBELL_HOLO = [
    ("1",  "Cell",           "Phantom"),
    ("2",  "Son Goku",       "Kairo"),
    ("3",  "Son Gohan",      "Rohan"),
    ("4",  "Son Gotten",     "Rohax"),
    ("5",  "Gotten y Trunks","Rohax y Trux"),
    ("6",  "Vegeta",         "Vexar"),
    ("7",  "Majin Boo",      "Chaos Buu"),
    ("8",  "Dabra",          "Hexblade"),
    ("9",  "Goku",           "Kairo"),
    ("10", "Cell y Trunks",  "Phantom y Trux"),
]

# DBZ Mastertazos
DRACOBELL_MASTER = [
    ("MASTER-A18",             "Mech-18",           None),
    ("MASTER-A18-GOLD",        "Mech-18 Dorado",    "gold"),
    ("MASTER-A18-BLACK",       "Mech-18 Oscuro",    "black_border"),
    ("MASTER-FREEZER",         "Glacius",           None),
    ("MASTER-GOKU",            "Kairo",             None),
    ("MASTER-SHENRON",         "Drakarion",         None),
    ("MASTER-SHENRON-BLACK",   "Drakarion Oscuro",  "black_border"),
    ("MASTER-VEGETA",          "Vexar",             None),
]

# === CYBERMON (150 tazos, inspired by Digimon / Kenji Watanabe style) ===
CYBERMON_NAMES = [
    # Baby / In-Training
    "Bytebot", "Chipmon", "Datamon", "Pixmon", "Seedmon",
    "Bubblemon", "Gearmon", "Fluffmon", "Sproutmon", "Shademon",
    # Rookies
    "Armadon", "Wolfbyte", "Avionix", "Beetlex", "Floramon",
    "Sealbyte", "Hoopmon", "Felimon", "Puppymon", "Vectormon",
    "Hawkeye", "Platemail", "Larvamon", "Bunnymon", "Loppix",
    "Foxfire", "Pyrodramon", "Trickmon", "Leonix", "Ogrebyte",
    # Champions
    "Graymech", "Garublade", "Phoenixwing", "Mechbeetle", "Thornbloom",
    "Icetusk", "Archangelon", "Shadowmon", "Blazix", "Hydroserpent",
    "Monomech", "Centaxmon", "Terradramon", "ShadowTyranno", "Frostbite",
    "Yetix", "Drillclaw", "Armasea", "Sludgemon", "Junkbyte",
    # Ultimate
    "MetalGreymech", "WereGarublade", "Stormwing", "Megabeetle", "Rosethorn",
    "Thundertusk", "Solarangelon", "Celestialon", "Darkmistress", "Vampix",
    "SkullGreymech", "Cyborgmon", "Monkex", "Diskmon", "HydroserpentEX",
    "Tuskon", "Faeriex", "Leviadon", "ScorpioByte", "Specter",
    # Mega
    "WarGreymech", "MetalGarublade", "Blazewing", "Hercubeetle", "Floragoddess",
    "Frosttusk", "Radiangelon", "Holydramon", "Omnimech", "Imperiadramon",
    "ShadowGreymech", "MalwareByte", "Jestermon", "MetalSerpent", "Marionex",
    "Mechdramon", "ToxicVampix", "Malovampix", "Abyssmon", "Cherubix",
    # Armor (02)
    "Flaredramon", "Thunderdramon", "Goldramon", "Windramon", "Ninjamon",
    "Diggmon", "Submarimon", "Wingmon", "Sphinxmon", "Wraithmon",
    # DNA / Jogress (02)
    "Fusedramon", "Stingdramon", "Silphramon", "Totemmon", "ExVeemon",
    "Stingmon", "Aquillamon", "Ankylomon", "Arachmon", "Wraithmon",
    # Dark Masters & Villains
    "Vampix", "ToxicVampix", "Malovampix", "Jestermon", "MetalSerpent",
    "Marionex", "Mechdramon", "Abyssmon", "MalwareByte", "Daemon",
    # Tamers-era
    "Pyrodramon", "Growlpyro", "WarPyrodramon", "GallantByte", "Megidramon",
    "Foxfire", "Kyubix", "Taomon", "Sakuyamon", "Tamakai",
    # Extras
    "MarineAngemon", "SaberLeonix", "MetalMonkex", "PrinceByte", "Omnimech",
    "Imperiadramon FM", "GallantByte CM", "Sakuyamon", "MegaGargomon", "Justimon",
    "Zhuqiaomon", "Azulongmon", "Ebonwumon", "Baihumon", "Fanglongmon",
    "Kimeramon", "SkullSatamon", "Infermon", "Kerpymon", "Susanoomon",
]

# Print summary
print(f"Minimon: {len(MINIMON_NAMES)} tazos")
dracobell_total = len(DRACOBELL_NORMAL) + len(DRACOBELL_VOLADORES) + len(DRACOBELL_OCTOGONALES)
dracobell_total += len(DRACOBELL_MEGA) * 2  # redondo + octogonal
dracobell_total += len(DRACOBELL_HOLO) * 2  # ranura der + izq
dracobell_total += len(DRACOBELL_MASTER)
print(f"Draco Bell: {dracobell_total} tazos")
print(f"Cybermon: {len(CYBERMON_NAMES)} tazos")
print(f"TOTAL: {len(MINIMON_NAMES) + dracobell_total + len(CYBERMON_NAMES)}")
