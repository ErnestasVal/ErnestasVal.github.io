// Static game data/configuration lives here so gameplay logic stays focused.
const BOXES=[
  {id:'starter',name:'Rookie Banner',icon:'🎟️',cost:500,tier:'500',tierColor:'#f8d7aa',color:'#f8d7aa',odds:{common:78,rare:18,epic:3,legendary:0.9,mythic:0.1}},
  {id:'copper',name:'Shonen Banner',icon:'🎴',cost:1000,tier:'1K',tierColor:'#f8d7aa',color:'#f8d7aa',odds:{common:70,rare:22,epic:6,legendary:1.8,mythic:0.2}},
  {id:'bronze',name:'Mecha Banner',icon:'🤖',cost:5000,tier:'5K',tierColor:'#f3b999',color:'#f3b999',odds:{common:58,rare:27,epic:10,legendary:4,mythic:1}},
  {id:'silver',name:'Isekai Banner',icon:'🚪',cost:10000,tier:'10K',tierColor:'#f3b999',color:'#f3b999',odds:{common:45,rare:30,epic:16,legendary:7,mythic:2}},
  {id:'golden',name:'Seinen Banner',icon:'🌙',cost:50000,tier:'50K',tierColor:'#f69385',color:'#f69385',odds:{common:33,rare:30,epic:22,legendary:11,mythic:4}},
  {id:'obsidian',name:'Studio Banner',icon:'🎬',cost:100000,tier:'100K',tierColor:'#fb696c',color:'#fb696c',odds:{common:22,rare:28,epic:27,legendary:16,mythic:7}},
  {id:'astral',name:'Festival Banner',icon:'🎆',cost:500000,tier:'500K',tierColor:'#ff4f57',color:'#ff4f57',odds:{common:12,rare:24,epic:30,legendary:23,mythic:11}},
  {id:'cosmic',name:'Final Arc Banner',icon:'🌠',cost:1000000,tier:'1M',tierColor:'#ff4f57',color:'#ff4f57',odds:{common:5,rare:15,epic:30,legendary:32,mythic:18}},
  {id:'secret',name:'Director Cut Banner',icon:'🎞️',cost:10000000,tier:'???',tierColor:'#fb696c',color:'#fb696c',odds:{common:0,rare:0,epic:0,legendary:0,mythic:100},isSecret:true}
];

// To use your own image instead of an emoji icon, add: image:'assets/img/your-file.webp'
const ITEMS={
  common:[
    {name:'School Uniform Pin',icon:'📛',desc:'A starter keepsake from homeroom.',value:220},
    {name:'Konbini Bento',icon:'🍱',desc:'Restores stamina for one more episode.',value:280},
    {name:'Festival Ticket',icon:'🎫',desc:'Entry pass to the summer arc.',value:340},
    {name:'Charm Strap',icon:'🧿',desc:'Tiny charm with lucky vibes.',value:400},
    {name:'Manga Volume 1',icon:'📘',desc:'The classic first chapter.',value:460},
    {name:'Practice Notebook',icon:'📓',desc:'Filled with sketchy character designs.',value:520},
  ],
  rare:[
    {name:'Kitsune Mask',icon:'🦊',desc:'Worn at moonlit shrine festivals.',value:1800},
    {name:'Idol Lightstick',icon:'💡',desc:'Glows brighter during chorus drops.',value:2200},
    {name:'Mecha Keycard',icon:'🪪',desc:'Unlocks restricted hangar decks.',value:2600},
    {name:'Spirit Blade Replica',icon:'🗡️',desc:'Signed by the animation lead.',value:3000},
    {name:'Senpai Script Draft',icon:'📜',desc:'Early cut of the confession scene.',value:3400},
  ],
  epic:[
    {name:'Ninja Clan Scroll',icon:'📜',desc:'Contains forbidden combo routes.',value:15000},
    {name:'Dragon Rider Emblem',icon:'🐉',desc:'Marks elite riders of the sky arc.',value:18000},
    {name:'Parallel World Compass',icon:'🧭',desc:'Points to your next reincarnation.',value:22000},
    {name:'Sakura Duel Fan',icon:'🎐',desc:'Elegant but battle tested.',value:26000},
    {name:'Moonlight OST Vinyl',icon:'💿',desc:'Every boss theme on one record.',value:30000},
  ],
  legendary:[
    {name:'Final Form Storyboard',icon:'🖌️',desc:'Original boards from the climactic fight.',value:120000},
    {name:'Studio Master Cel',icon:'🖼️',desc:'Hand-painted frame from episode 1.',value:150000},
    {name:'Hero Awakening Crest',icon:'✨',desc:'Ignites during absolute resolve.',value:190000},
    {name:'Star Festival Crown',icon:'👑',desc:'Bestowed after the winning performance.',value:240000},
  ],
  mythic:[
    {name:'Worldline Rewrite Pen',icon:'✒️',desc:'Can redraw fate itself.',value:1200000},
    {name:'First Opening Tape',icon:'📼',desc:'The legendary unreleased OP.',value:1600000},
    {name:'Origin Studio Seal',icon:'🔱',desc:'The mark that greenlights miracles.',value:2200000},
  ],
  secret:[
    {name:'Author Room Key',icon:'🗝️',desc:'Opens the room where every timeline begins.',value:6767676767},
  ]
};

const RARITY_ORDER=['common','rare','epic','legendary','mythic'];
const RARITY_LABELS={common:'Common',rare:'Rare',epic:'Epic',legendary:'Legendary',mythic:'Mythic'};
const RARITY_COLORS={common:'#f8d7aa',rare:'#f3b999',epic:'#f69385',legendary:'#fb696c',mythic:'#ff4f57'};
const RARITY_CLASSES={common:'r-common',rare:'r-rare',epic:'r-epic',legendary:'r-legendary',mythic:'r-mythic'};

const BOX_PRICE_GROWTH=1.15;
const REGULAR_BOX_IDS=BOXES.filter(b=>!b.isSecret).map(b=>b.id);
const SAVE_KEY='vaultSaveV1';

const UPGRADES=[
  {id:'u1',name:'Worn Pick Handle',icon:'🪵',desc:'+1 coin per click',cost:20,level:0,maxLevel:1,color:'#f59e0b',bg:'rgba(245,158,11,0.1)',apply(){addClickPower(1);}},
  {id:'u3',name:'Grip Wrap',icon:'🧤',desc:'+2 coins per click',cost:80,level:0,maxLevel:1,color:'#94a3b8',bg:'rgba(148,163,184,0.1)',apply(){addClickPower(2);}},
  {id:'u4',name:'Steady Rhythm',icon:'🥁',desc:'×1.5 click power',cost:140,level:0,maxLevel:1,color:'#fbbf24',bg:'rgba(251,191,36,0.1)',apply(){multiplyClickPower(1.5);}},
  {id:'u7',name:'Mithril Tip',icon:'🔩',desc:'+7 coins per click',cost:700,level:0,maxLevel:1,color:'#60a5fa',bg:'rgba(96,165,250,0.1)',apply(){addClickPower(7);}},
  {id:'u8',name:'Gold Dust Vein',icon:'✨',desc:'×1.5 click power',cost:1100,level:0,maxLevel:1,color:'#fbbf24',bg:'rgba(251,191,36,0.1)',apply(){multiplyClickPower(1.5);}},
  {id:'u11',name:'Rune Inlay',icon:'🪬',desc:'+20 coins per click',cost:4300,level:0,maxLevel:1,color:'#a855f7',bg:'rgba(168,85,247,0.1)',apply(){addClickPower(20);}},
  {id:'u12',name:'Momentum Core',icon:'⚙️',desc:'×1.5 click power',cost:6500,level:0,maxLevel:1,color:'#38bdf8',bg:'rgba(56,189,248,0.12)',apply(){multiplyClickPower(1.5);}},
  {id:'u15',name:'Dragon Grip',icon:'🐉',desc:'+60 coins per click',cost:22000,level:0,maxLevel:1,color:'#ef4444',bg:'rgba(239,68,68,0.1)',apply(){addClickPower(60);}},
  {id:'u16',name:'Meteor Arc',icon:'☄️',desc:'×1.5 click power',cost:33000,level:0,maxLevel:1,color:'#fde047',bg:'rgba(253,224,71,0.12)',apply(){multiplyClickPower(1.5);}},
  {id:'u19',name:'Quantum Weight',icon:'⚛️',desc:'+170 coins per click',cost:115000,level:0,maxLevel:1,color:'#22d3ee',bg:'rgba(34,211,238,0.12)',apply(){addClickPower(170);}},
  {id:'u20',name:'Celestial Focus',icon:'🌠',desc:'×1.5 click power',cost:170000,level:0,maxLevel:1,color:'#fde047',bg:'rgba(253,224,71,0.12)',apply(){multiplyClickPower(1.5);}},
  {id:'u23',name:'Singularity Grip',icon:'🌀',desc:'+500 coins per click',cost:520000,level:0,maxLevel:1,color:'#a78bfa',bg:'rgba(167,139,250,0.12)',apply(){addClickPower(500);}},
  {id:'u24',name:'Stellar Overhand',icon:'🪐',desc:'×1.5 click power',cost:700000,level:0,maxLevel:1,color:'#60a5fa',bg:'rgba(96,165,250,0.12)',apply(){multiplyClickPower(1.5);}},

  {id:'gu_all_1',name:'Grid Harmonizer',icon:'🔋',desc:'All generators produce ×1.5',cost:12000,level:0,maxLevel:1,color:'#10b981',bg:'rgba(16,185,129,0.12)',apply(){generatorPowerMultiplier*=1.5;}},
  {id:'gu_all_2',name:'Automation Mesh',icon:'🧰',desc:'All generators produce ×1.5',cost:95000,level:0,maxLevel:1,color:'#14b8a6',bg:'rgba(20,184,166,0.12)',apply(){generatorPowerMultiplier*=1.5;}},
  {id:'gu_all_3',name:'Flux Backbone',icon:'🛰️',desc:'All generators produce ×1.5',cost:360000,level:0,maxLevel:1,color:'#38bdf8',bg:'rgba(56,189,248,0.12)',apply(){generatorPowerMultiplier*=1.5;}},
  {id:'gu_all_4',name:'Omniforge Protocol',icon:'🧬',desc:'All generators produce ×1.5',cost:900000,level:0,maxLevel:1,color:'#f43f5e',bg:'rgba(244,63,94,0.12)',apply(){generatorPowerMultiplier*=1.5;}},

  {id:'gu_g1_1',name:'Street Team Choreo',icon:'🕺',desc:'Fan Squad output ×1.5',cost:2500,level:0,maxLevel:1,color:'#22c55e',bg:'rgba(34,197,94,0.12)',apply(){boostGenerator('g1',1.5);}},
  {id:'gu_g1_2',name:'Encore Flashmob',icon:'🎉',desc:'Fan Squad output ×2',cost:38000,level:0,maxLevel:1,color:'#16a34a',bg:'rgba(22,163,74,0.12)',apply(){boostGenerator('g1',2);}},
  {id:'gu_g2_1',name:'Tea Break Strategy',icon:'🍵',desc:'Cafe Stream output ×1.5',cost:6000,level:0,maxLevel:1,color:'#3b82f6',bg:'rgba(59,130,246,0.12)',apply(){boostGenerator('g2',1.5);}},
  {id:'gu_g2_2',name:'Midnight Marathon',icon:'🌃',desc:'Cafe Stream output ×2',cost:62000,level:0,maxLevel:1,color:'#2563eb',bg:'rgba(37,99,235,0.12)',apply(){boostGenerator('g2',2);}},
  {id:'gu_g3_1',name:'Storyboard Sprint',icon:'📝',desc:'Manga Draft Desk output ×1.5',cost:12000,level:0,maxLevel:1,color:'#f97316',bg:'rgba(249,115,22,0.12)',apply(){boostGenerator('g3',1.5);}},
  {id:'gu_g3_2',name:'Panel Ink Burst',icon:'🖋️',desc:'Manga Draft Desk output ×2',cost:98000,level:0,maxLevel:1,color:'#ea580c',bg:'rgba(234,88,12,0.12)',apply(){boostGenerator('g3',2);}},
  {id:'gu_g4_1',name:'Background Unit',icon:'🏙️',desc:'Animation Cell Bank output ×1.5',cost:22000,level:0,maxLevel:1,color:'#06b6d4',bg:'rgba(6,182,212,0.12)',apply(){boostGenerator('g4',1.5);}},
  {id:'gu_g4_2',name:'Sakuga Frame Rush',icon:'🎞️',desc:'Animation Cell Bank output ×2',cost:140000,level:0,maxLevel:1,color:'#0891b2',bg:'rgba(8,145,178,0.12)',apply(){boostGenerator('g4',2);}},
  {id:'gu_g5_1',name:'Voice Booth Queue',icon:'🎙️',desc:'Seiyuu Studio output ×1.5',cost:36000,level:0,maxLevel:1,color:'#a855f7',bg:'rgba(168,85,247,0.12)',apply(){boostGenerator('g5',1.5);}},
  {id:'gu_g5_2',name:'Perfect One-Take',icon:'🎧',desc:'Seiyuu Studio output ×2',cost:190000,level:0,maxLevel:1,color:'#9333ea',bg:'rgba(147,51,234,0.12)',apply(){boostGenerator('g5',2);}},
  {id:'gu_g6_1',name:'Convention Circuit',icon:'🏮',desc:'Convention Hall output ×1.5',cost:55000,level:0,maxLevel:1,color:'#ef4444',bg:'rgba(239,68,68,0.12)',apply(){boostGenerator('g6',1.5);}},
  {id:'gu_g6_2',name:'Night Expo Pass',icon:'🎫',desc:'Convention Hall output ×2',cost:260000,level:0,maxLevel:1,color:'#dc2626',bg:'rgba(220,38,38,0.12)',apply(){boostGenerator('g6',2);}},
  {id:'gu_g7_1',name:'Movie Premiere Push',icon:'🍿',desc:'Premiere Theater output ×1.5',cost:82000,level:0,maxLevel:1,color:'#f43f5e',bg:'rgba(244,63,94,0.12)',apply(){boostGenerator('g7',1.5);}},
  {id:'gu_g7_2',name:'Box Office Surge',icon:'🎟️',desc:'Premiere Theater output ×2',cost:420000,level:0,maxLevel:1,color:'#e11d48',bg:'rgba(225,29,72,0.12)',apply(){boostGenerator('g7',2);}},
  {id:'gu_g8_1',name:'Finale Countdown',icon:'⏱️',desc:'Final Arc Channel output ×1.5',cost:130000,level:0,maxLevel:1,color:'#f59e0b',bg:'rgba(245,158,11,0.12)',apply(){boostGenerator('g8',1.5);}},
  {id:'gu_g8_2',name:'Fandom Eclipse',icon:'🌘',desc:'Final Arc Channel output ×2',cost:780000,level:0,maxLevel:1,color:'#d97706',bg:'rgba(217,119,6,0.12)',apply(){boostGenerator('g8',2);}},
];

const GENERATORS=[
  {id:'g1',name:'Fan Squad',icon:'🧑‍🤝‍🧑',baseCps:0.5,baseCost:60,owned:0,progress:0,color:'#22c55e'},
  {id:'g2',name:'Cafe Stream',icon:'☕',baseCps:3,baseCost:350,owned:0,progress:0,color:'#3b82f6'},
  {id:'g3',name:'Manga Draft Desk',icon:'✍️',baseCps:12,baseCost:1300,owned:0,progress:0,color:'#f97316'},
  {id:'g4',name:'Animation Cell Bank',icon:'🎞️',baseCps:50,baseCost:4500,owned:0,progress:0,color:'#06b6d4'},
  {id:'g5',name:'Seiyuu Studio',icon:'🎤',baseCps:200,baseCost:15000,owned:0,progress:0,color:'#a855f7'},
  {id:'g6',name:'Convention Hall',icon:'🏟️',baseCps:1000,baseCost:50000,owned:0,progress:0,color:'#ef4444'},
  {id:'g7',name:'Premiere Theater',icon:'🎬',baseCps:6000,baseCost:200000,owned:0,progress:0,color:'#f43f5e'},
  {id:'g8',name:'Final Arc Channel',icon:'📺',baseCps:25000,baseCost:750000,owned:0,progress:0,color:'#f59e0b'},
];
