// Static game data/configuration lives here so gameplay logic stays focused.
const BOXES=[
  {id:'starter',name:'Starter Crate',icon:'📫',cost:100,tier:'100',tierColor:'#f8d7aa',color:'#f8d7aa',odds:{common:78,rare:18,epic:3,legendary:0.9,mythic:0.1}},
  {id:'copper',name:'Copper Vault',icon:'📦',cost:1000,tier:'1K',tierColor:'#f8d7aa',color:'#f8d7aa',odds:{common:70,rare:22,epic:6,legendary:1.8,mythic:0.2}},
  {id:'bronze',name:'Bronze Vault',icon:'🗃️',cost:10000,tier:'10K',tierColor:'#f3b999',color:'#f3b999',odds:{common:58,rare:27,epic:10,legendary:4,mythic:1}},
  {id:'silver',name:'Silver Vault',icon:'🥈',cost:100000,tier:'100K',tierColor:'#f3b999',color:'#f3b999',odds:{common:45,rare:30,epic:16,legendary:7,mythic:2}},
  {id:'golden',name:'Golden Vault',icon:'🏆',cost:1000000,tier:'1M',tierColor:'#f69385',color:'#f69385',odds:{common:33,rare:30,epic:22,legendary:11,mythic:4}},
  {id:'obsidian',name:'Obsidian Vault',icon:'💎',cost:10000000,tier:'10M',tierColor:'#fb696c',color:'#fb696c',odds:{common:22,rare:28,epic:27,legendary:16,mythic:7}},
  {id:'astral',name:'Astral Vault',icon:'🌌',cost:100000000,tier:'100M',tierColor:'#ff4f57',color:'#ff4f57',odds:{common:12,rare:24,epic:30,legendary:23,mythic:11}},
  {id:'cosmic',name:'Cosmic Vault',icon:'🪐',cost:1000000000,tier:'1B',tierColor:'#ff4f57',color:'#ff4f57',odds:{common:5,rare:15,epic:30,legendary:32,mythic:18}},
  {id:'secret',name:'??? Vault',icon:'🕳️',cost:1000000000000,tier:'???',tierColor:'#fb696c',color:'#fb696c',odds:{common:0,rare:0,epic:0,legendary:0,mythic:100},isSecret:true}
];

const ITEMS={
  common:[{name:'Iron Shield',icon:'🛡️',desc:'A basic shield made from iron ore.',value:220},{name:'Wooden Staff',icon:'🪄',desc:'A simple magical conduit.',value:280},{name:'Health Flask',icon:'🧪',desc:'Restores minor health points.',value:340},{name:'Scout Map',icon:'🗺️',desc:'Reveals nearby terrain.',value:400},{name:'Iron Coin',icon:'🪙',desc:'Standard currency.',value:460},{name:'Stone Rune',icon:'🪨',desc:'Faint traces of power.',value:520}],
  rare:[{name:'Crystal Dagger',icon:'🗡️',desc:'A blade that refracts light.',value:1800},{name:'Storm Cape',icon:'🧥',desc:'Woven from thunderstorm fibers.',value:2200},{name:'Frost Amulet',icon:'❄️',desc:'Slows enemies on contact.',value:2600},{name:'Silver Arrow',icon:'🏹',desc:'Blessed by the moon goddess.',value:3000},{name:'Echo Tome',icon:'📖',desc:'Spells cast twice.',value:3400}],
  epic:[{name:'Void Gauntlets',icon:'🥊',desc:'Phase through solid matter.',value:15000},{name:'Starfall Bow',icon:'🌠',desc:'Fires condensed starlight.',value:18000},{name:'Shadow Mask',icon:'🎭',desc:'Bends light around the wearer.',value:22000},{name:'Phoenix Feather',icon:'🪶',desc:'Resurrects owner once.',value:26000},{name:'Time Hourglass',icon:'⏳',desc:'Rewind the last 3 seconds.',value:30000}],
  legendary:[{name:'Dragon Blade',icon:'⚔️',desc:'Forged in the heart of an elder dragon.',value:120000},{name:'Crown of Eons',icon:'👑',desc:'Worn by seventeen ancient kings.',value:150000},{name:'Celestial Orb',icon:'🔮',desc:'Contains a fragment of a dying star.',value:190000},{name:'World Serpent Scale',icon:'🐍',desc:'Impenetrable. Warm to the touch.',value:240000}],
  mythic:[{name:'Eternity Shard',icon:'💠',desc:"A splinter of the universe's first moment.",value:1200000},{name:'Godslayer',icon:'🌀',desc:'A weapon that has ended divine lives.',value:1600000},{name:'Void Heart',icon:'🖤',desc:'The literal heart of nothingness.',value:2200000}],
  secret:[{name:'Core of Creation',icon:'🌌',desc:'The only known relic from before time itself.',value:1800000000000}]
};

const RARITY_ORDER=['common','rare','epic','legendary','mythic'];
const RARITY_LABELS={common:'Common',rare:'Rare',epic:'Epic',legendary:'Legendary',mythic:'Mythic'};
const RARITY_COLORS={common:'#f8d7aa',rare:'#f3b999',epic:'#f69385',legendary:'#fb696c',mythic:'#ff4f57'};
const RARITY_CLASSES={common:'r-common',rare:'r-rare',epic:'r-epic',legendary:'r-legendary',mythic:'r-mythic'};

const BOX_PRICE_GROWTH=1.15;
const REGULAR_BOX_IDS=BOXES.filter(b=>!b.isSecret).map(b=>b.id);
const SAVE_KEY='vaultSaveV1';

const UPGRADES=[
  {id:'u1',name:'Worn Pick Handle',icon:'🪵',desc:'+1 coin per click',cost:20,level:0,maxLevel:1,color:'#f59e0b',bg:'rgba(245,158,11,0.1)',apply(){clickPower+=1;}},
  {id:'u2',name:'Sharpened Edge',icon:'⛏️',desc:'+1 coin per click',cost:40,level:0,maxLevel:1,color:'#f59e0b',bg:'rgba(245,158,11,0.1)',apply(){clickPower+=1;}},
  {id:'u3',name:'Grip Wrap',icon:'🧤',desc:'+2 coins per click',cost:80,level:0,maxLevel:1,color:'#94a3b8',bg:'rgba(148,163,184,0.1)',apply(){clickPower+=2;}},
  {id:'u4',name:'Steady Rhythm',icon:'🥁',desc:'×1.12 click power',cost:140,level:0,maxLevel:1,color:'#fbbf24',bg:'rgba(251,191,36,0.1)',apply(){clickPower*=1.12;}},
  {id:'u5',name:'Iron Knuckles',icon:'👊',desc:'+4 coins per click',cost:260,level:0,maxLevel:1,color:'#94a3b8',bg:'rgba(148,163,184,0.1)',apply(){clickPower+=4;}},
  {id:'u6',name:'Pressure Strike',icon:'💥',desc:'×1.14 click power',cost:420,level:0,maxLevel:1,color:'#fbbf24',bg:'rgba(251,191,36,0.1)',apply(){clickPower*=1.14;}},
  {id:'u7',name:'Mithril Tip',icon:'🔩',desc:'+7 coins per click',cost:700,level:0,maxLevel:1,color:'#60a5fa',bg:'rgba(96,165,250,0.1)',apply(){clickPower+=7;}},
  {id:'u8',name:'Gold Dust Vein',icon:'✨',desc:'×1.16 click power',cost:1100,level:0,maxLevel:1,color:'#fbbf24',bg:'rgba(251,191,36,0.1)',apply(){clickPower*=1.16;}},
  {id:'u9',name:'Forge Temper',icon:'🔥',desc:'+12 coins per click',cost:1800,level:0,maxLevel:1,color:'#f97316',bg:'rgba(249,115,22,0.12)',apply(){clickPower+=12;}},
  {id:'u10',name:'Echo Swing',icon:'🎵',desc:'×1.18 click power',cost:2800,level:0,maxLevel:1,color:'#22d3ee',bg:'rgba(34,211,238,0.12)',apply(){clickPower*=1.18;}},
  {id:'u11',name:'Rune Inlay',icon:'🪬',desc:'+20 coins per click',cost:4300,level:0,maxLevel:1,color:'#a855f7',bg:'rgba(168,85,247,0.1)',apply(){clickPower+=20;}},
  {id:'u12',name:'Momentum Core',icon:'⚙️',desc:'×1.2 click power',cost:6500,level:0,maxLevel:1,color:'#38bdf8',bg:'rgba(56,189,248,0.12)',apply(){clickPower*=1.2;}},
  {id:'u13',name:'Arcane Chisel',icon:'🔮',desc:'+35 coins per click',cost:9800,level:0,maxLevel:1,color:'#a855f7',bg:'rgba(168,85,247,0.1)',apply(){clickPower+=35;}},
  {id:'u14',name:'Critical Tempo',icon:'🧠',desc:'×1.22 click power',cost:14500,level:0,maxLevel:1,color:'#22d3ee',bg:'rgba(34,211,238,0.12)',apply(){clickPower*=1.22;}},
  {id:'u15',name:'Dragon Grip',icon:'🐉',desc:'+60 coins per click',cost:22000,level:0,maxLevel:1,color:'#ef4444',bg:'rgba(239,68,68,0.1)',apply(){clickPower+=60;}},
  {id:'u16',name:'Meteor Arc',icon:'☄️',desc:'×1.24 click power',cost:33000,level:0,maxLevel:1,color:'#fde047',bg:'rgba(253,224,71,0.12)',apply(){clickPower*=1.24;}},
  {id:'u17',name:'Titan Handle',icon:'🧲',desc:'+100 coins per click',cost:50000,level:0,maxLevel:1,color:'#fb7185',bg:'rgba(251,113,133,0.1)',apply(){clickPower+=100;}},
  {id:'u18',name:'Void Cadence',icon:'🕳️',desc:'×1.28 click power',cost:76000,level:0,maxLevel:1,color:'#ec4899',bg:'rgba(236,72,153,0.1)',apply(){clickPower*=1.28;}},
  {id:'u19',name:'Quantum Weight',icon:'⚛️',desc:'+170 coins per click',cost:115000,level:0,maxLevel:1,color:'#22d3ee',bg:'rgba(34,211,238,0.12)',apply(){clickPower+=170;}},
  {id:'u20',name:'Celestial Focus',icon:'🌠',desc:'×1.3 click power',cost:170000,level:0,maxLevel:1,color:'#fde047',bg:'rgba(253,224,71,0.12)',apply(){clickPower*=1.3;}},
  {id:'u21',name:'Nebula Core',icon:'🌌',desc:'+300 coins per click',cost:250000,level:0,maxLevel:1,color:'#c084fc',bg:'rgba(192,132,252,0.12)',apply(){clickPower+=300;}},
  {id:'u22',name:'Hyper Resonance',icon:'🧿',desc:'×1.35 click power',cost:360000,level:0,maxLevel:1,color:'#818cf8',bg:'rgba(129,140,248,0.12)',apply(){clickPower*=1.35;}},
  {id:'u23',name:'Singularity Grip',icon:'🌀',desc:'+500 coins per click',cost:520000,level:0,maxLevel:1,color:'#a78bfa',bg:'rgba(167,139,250,0.12)',apply(){clickPower+=500;}},
  {id:'u24',name:'Stellar Overhand',icon:'🪐',desc:'×1.4 click power',cost:700000,level:0,maxLevel:1,color:'#60a5fa',bg:'rgba(96,165,250,0.12)',apply(){clickPower*=1.4;}},
  {id:'u25',name:'Cosmic Crusher',icon:'🌋',desc:'+900 coins per click',cost:880000,level:0,maxLevel:1,color:'#f43f5e',bg:'rgba(244,63,94,0.12)',apply(){clickPower+=900;}},
  {id:'u26',name:'Chrono Impact',icon:'⏱️',desc:'×1.5 click power',cost:1000000,level:0,maxLevel:1,color:'#f97316',bg:'rgba(249,115,22,0.12)',apply(){clickPower*=1.5;}},

  {id:'gu_all_1',name:'Grid Harmonizer',icon:'🔋',desc:'All generators produce ×1.12',cost:12000,level:0,maxLevel:1,color:'#10b981',bg:'rgba(16,185,129,0.12)',apply(){generatorPowerMultiplier*=1.12;}},
  {id:'gu_all_2',name:'Automation Mesh',icon:'🧰',desc:'All generators produce ×1.2',cost:95000,level:0,maxLevel:1,color:'#14b8a6',bg:'rgba(20,184,166,0.12)',apply(){generatorPowerMultiplier*=1.2;}},
  {id:'gu_all_3',name:'Flux Backbone',icon:'🛰️',desc:'All generators produce ×1.28',cost:360000,level:0,maxLevel:1,color:'#38bdf8',bg:'rgba(56,189,248,0.12)',apply(){generatorPowerMultiplier*=1.28;}},
  {id:'gu_all_4',name:'Omniforge Protocol',icon:'🧬',desc:'All generators produce ×1.4',cost:900000,level:0,maxLevel:1,color:'#f43f5e',bg:'rgba(244,63,94,0.12)',apply(){generatorPowerMultiplier*=1.4;}},

  {id:'gu_g1_1',name:'Goblin Shovels',icon:'🪓',desc:'Coin Goblin output ×1.5',cost:2500,level:0,maxLevel:1,color:'#22c55e',bg:'rgba(34,197,94,0.12)',apply(){boostGenerator('g1',1.5);}},
  {id:'gu_g1_2',name:'Goblin Cartel',icon:'💰',desc:'Coin Goblin output ×1.7',cost:38000,level:0,maxLevel:1,color:'#16a34a',bg:'rgba(22,163,74,0.12)',apply(){boostGenerator('g1',1.7);}},
  {id:'gu_g2_1',name:'Mana Condenser',icon:'🧪',desc:'Mana Tap output ×1.45',cost:6000,level:0,maxLevel:1,color:'#3b82f6',bg:'rgba(59,130,246,0.12)',apply(){boostGenerator('g2',1.45);}},
  {id:'gu_g2_2',name:'Tidal Loop',icon:'🌊',desc:'Mana Tap output ×1.7',cost:62000,level:0,maxLevel:1,color:'#2563eb',bg:'rgba(37,99,235,0.12)',apply(){boostGenerator('g2',1.7);}},
  {id:'gu_g3_1',name:'Runic Bellows',icon:'🏺',desc:'Rune Forge output ×1.45',cost:12000,level:0,maxLevel:1,color:'#f97316',bg:'rgba(249,115,22,0.12)',apply(){boostGenerator('g3',1.45);}},
  {id:'gu_g3_2',name:'Inferno Lattice',icon:'♨️',desc:'Rune Forge output ×1.7',cost:98000,level:0,maxLevel:1,color:'#ea580c',bg:'rgba(234,88,12,0.12)',apply(){boostGenerator('g3',1.7);}},
  {id:'gu_g4_1',name:'Crystal Polisher',icon:'💠',desc:'Crystal Mine output ×1.45',cost:22000,level:0,maxLevel:1,color:'#06b6d4',bg:'rgba(6,182,212,0.12)',apply(){boostGenerator('g4',1.45);}},
  {id:'gu_g4_2',name:'Prism Engine',icon:'🔷',desc:'Crystal Mine output ×1.7',cost:140000,level:0,maxLevel:1,color:'#0891b2',bg:'rgba(8,145,178,0.12)',apply(){boostGenerator('g4',1.7);}},
  {id:'gu_g5_1',name:'Reactor Baffles',icon:'⚙️',desc:'Ether Reactor output ×1.45',cost:36000,level:0,maxLevel:1,color:'#a855f7',bg:'rgba(168,85,247,0.12)',apply(){boostGenerator('g5',1.45);}},
  {id:'gu_g5_2',name:'Plasma Routing',icon:'⚡',desc:'Ether Reactor output ×1.7',cost:190000,level:0,maxLevel:1,color:'#9333ea',bg:'rgba(147,51,234,0.12)',apply(){boostGenerator('g5',1.7);}},
  {id:'gu_g6_1',name:'Void Lens',icon:'🌀',desc:'Void Siphon output ×1.45',cost:55000,level:0,maxLevel:1,color:'#ef4444',bg:'rgba(239,68,68,0.12)',apply(){boostGenerator('g6',1.45);}},
  {id:'gu_g6_2',name:'Abyss Cycler',icon:'🕳️',desc:'Void Siphon output ×1.7',cost:260000,level:0,maxLevel:1,color:'#dc2626',bg:'rgba(220,38,38,0.12)',apply(){boostGenerator('g6',1.7);}},
  {id:'gu_g7_1',name:'Quasar Intake',icon:'☄️',desc:'Quasar Foundry output ×1.45',cost:82000,level:0,maxLevel:1,color:'#f43f5e',bg:'rgba(244,63,94,0.12)',apply(){boostGenerator('g7',1.45);}},
  {id:'gu_g7_2',name:'Solar Mantle',icon:'🌞',desc:'Quasar Foundry output ×1.7',cost:420000,level:0,maxLevel:1,color:'#e11d48',bg:'rgba(225,29,72,0.12)',apply(){boostGenerator('g7',1.7);}},
  {id:'gu_g8_1',name:'Relic Stabilizer',icon:'🗿',desc:'Relic Synthesizer output ×1.45',cost:130000,level:0,maxLevel:1,color:'#f59e0b',bg:'rgba(245,158,11,0.12)',apply(){boostGenerator('g8',1.45);}},
  {id:'gu_g8_2',name:'Chrono Matrix',icon:'⌛',desc:'Relic Synthesizer output ×1.7',cost:780000,level:0,maxLevel:1,color:'#d97706',bg:'rgba(217,119,6,0.12)',apply(){boostGenerator('g8',1.7);}},
];

const GENERATORS=[
  {id:'g1',name:'Coin Goblin',icon:'👺',baseCps:0.5,baseCost:60,owned:0,progress:0,color:'#22c55e'},
  {id:'g2',name:'Mana Tap',icon:'💧',baseCps:3,baseCost:350,owned:0,progress:0,color:'#3b82f6'},
  {id:'g3',name:'Rune Forge',icon:'🔥',baseCps:12,baseCost:1300,owned:0,progress:0,color:'#f97316'},
  {id:'g4',name:'Crystal Mine',icon:'💎',baseCps:50,baseCost:4500,owned:0,progress:0,color:'#06b6d4'},
  {id:'g5',name:'Ether Reactor',icon:'⚡',baseCps:200,baseCost:15000,owned:0,progress:0,color:'#a855f7'},
  {id:'g6',name:'Void Siphon',icon:'🌀',baseCps:1000,baseCost:50000,owned:0,progress:0,color:'#ef4444'},
  {id:'g7',name:'Quasar Foundry',icon:'☄️',baseCps:6000,baseCost:200000,owned:0,progress:0,color:'#f43f5e'},
  {id:'g8',name:'Relic Synthesizer',icon:'🗿',baseCps:32000,baseCost:1200000,owned:0,progress:0,color:'#f59e0b'},
];
