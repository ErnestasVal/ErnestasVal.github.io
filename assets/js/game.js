// ===== SHARED =====
let coins = 0;
let shouldPersist = true;

function asWholeDisplay(value){
  return Math.floor(Math.max(0,Number(value)||0)).toLocaleString();
}

function setCoins(v){
  coins = Math.max(0, Number(v)||0);
  document.getElementById('coins').textContent = asWholeDisplay(coins);
  updateBtn(); updateShopAffordability();
}
function addCoins(n){ setCoins(coins + n); }

function switchTab(id, el){
  document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('tab-'+id).classList.add('active');
  el.classList.add('active');
}

// ===== VAULT =====
let selectedBox=BOXES[0], inventory=[], isOpening=false, inventoryItemId=1;
let boxOpenCounts=BOXES.reduce((acc,b)=>{acc[b.id]=0;return acc;},{});
let secretUnlockedAnnounced=false;
let vStats={opened:0,spent:0,legendaries:0,best:null};

function escapeHtml(value){
  return String(value??'').replace(/[&<>"']/g,ch=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  }[ch]));
}

function itemVisualMarkup(item,emojiClass,imageClass){
  if(item?.imageData){
    return `<img class="${imageClass}" src="${item.imageData}" alt="${escapeHtml(item.name||'Item image')}">`;
  }
  if(typeof item?.image==='string'&&item.image.trim()){
    return `<img class="${imageClass}" src="${escapeHtml(item.image.trim())}" alt="${escapeHtml(item.name||'Item image')}">`;
  }
  return `<span class="${emojiClass}">${item?.icon||'🖼️'}</span>`;
}

function getItemPoolForRarity(rarity){
  return ITEMS[rarity]||[];
}

function getCurrentBoxCost(box){
  return Math.floor(box.cost*Math.pow(BOX_PRICE_GROWTH,boxOpenCounts[box.id]||0));
}
function getSecretUnlockProgress(){
  return REGULAR_BOX_IDS.reduce((sum,id)=>sum+Math.min(boxOpenCounts[id]||0,10),0);
}
function getSecretUnlockBreakdown(){
  return REGULAR_BOX_IDS.map(id=>{
    const box=BOXES.find(b=>b.id===id);
    const label=box?box.name.replace(' Banner',''):id;
    const opens=Math.min(boxOpenCounts[id]||0,10);
    return `${label} ${opens}/10`;
  }).join(' | ');
}
function isBoxUnlocked(box){
  if(!box.isSecret)return true;
  return REGULAR_BOX_IDS.every(id=>(boxOpenCounts[id]||0)>=10);
}

function getUpgradeLevels(){
  const levels={};
  UPGRADES.forEach(u=>{levels[u.id]=u.level;});
  return levels;
}

function applyUpgradeLevels(levels){
  clickPowerBase=1;
  clickPowerMultiplier=1;
  recomputeClickPower();
  generatorPowerMultiplier=1;
  resetGeneratorMultipliers();
  UPGRADES.forEach(u=>{
    const lvl=Math.max(0,Math.min(u.maxLevel,Number(levels?.[u.id]||0)));
    u.level=lvl;
    for(let i=0;i<lvl;i++)u.apply();
  });
}

function saveGame(){
  if(!shouldPersist)return;
  const payload={
    coins,
    totalMined,
    totalClicks,
    inventory,
    inventoryItemId,
    vStats,
    boxOpenCounts,
    secretUnlockedAnnounced,
    selectedBoxId:selectedBox.id,
    upgrades:getUpgradeLevels(),
    generators:GENERATORS.map(g=>({id:g.id,owned:g.owned,progress:g.progress})),
    passiveAccum,
  };
  localStorage.setItem(SAVE_KEY,JSON.stringify(payload));
}

function resetGame(){
  const confirmed=window.confirm('Reset all progress? This will clear your coins, upgrades, and collection.');
  if(!confirmed)return;
  shouldPersist=false;
  localStorage.removeItem(SAVE_KEY);
  window.location.reload();
}

function loadGame(){
  const raw=localStorage.getItem(SAVE_KEY);
  if(!raw)return;
  try{
    const data=JSON.parse(raw);
    coins=Math.max(0,Number(data.coins)||0);
    totalMined=Math.max(0,Math.floor(Number(data.totalMined)||0));
    totalClicks=Math.max(0,Math.floor(Number(data.totalClicks)||0));
    inventory=Array.isArray(data.inventory)?data.inventory:[];
    if(typeof data.inventoryItemId==='number')inventoryItemId=data.inventoryItemId;
    else inventoryItemId=inventory.reduce((m,it)=>Math.max(m,Number(it.id)||0),0)+1;
    vStats={...vStats,...(data.vStats||{})};
    boxOpenCounts={...boxOpenCounts,...(data.boxOpenCounts||{})};
    secretUnlockedAnnounced=!!data.secretUnlockedAnnounced;

    if(Array.isArray(data.generators)){
      data.generators.forEach(saved=>{
        const g=GENERATORS.find(x=>x.id===saved.id);
        if(!g)return;
        g.owned=Math.max(0,Math.floor(Number(saved.owned)||0));
        g.progress=Math.max(0,Math.min(100,Number(saved.progress)||0));
      });
    }

    applyUpgradeLevels(data.upgrades||{});
    passiveAccum=Math.max(0,Number(data.passiveAccum)||0);

    const savedBox=BOXES.find(b=>b.id===data.selectedBoxId);
    selectedBox=(savedBox&&isBoxUnlocked(savedBox))?savedBox:BOXES[0];
  }catch(err){
    console.error('Failed to load save:',err);
  }
}

function renderBoxGrid(){
  document.getElementById('boxGrid').innerHTML=BOXES.map(b=>{
    const unlocked=isBoxUnlocked(b);
    const price=getCurrentBoxCost(b);
    const opens=boxOpenCounts[b.id]||0;
    const openedLabel=b.isSecret?`Opened: ${opens}`:`Opened: ${opens}`;
    const secretProgress=b.isSecret
      ?`<div class="box-price">Need 10 pulls of each banner</div><div class="box-opened">${getSecretUnlockBreakdown()}</div><div class="box-opened">Total: ${getSecretUnlockProgress()}/${REGULAR_BOX_IDS.length*10}</div>`
      :'';
    return `<div class="box-card ${b.isSecret?'secret-card':''} ${unlocked?'':'locked'}" id="card-${b.id}" onclick="selectBox('${b.id}')">
      <span class="box-icon">${b.icon}</span>
      <div class="box-name" style="color:${b.color}">${b.name}</div>
      <div class="box-price">${unlocked?`◈ ${price.toLocaleString()}`:'Locked'}</div>
      <div class="box-opened">${openedLabel}</div>
      ${secretProgress}
      <div class="box-tier-badge" style="background:${b.tierColor}22;color:${b.tierColor}">${b.tier}</div>
    </div>`;
  }).join('');
}
function selectBox(id){
  const nextBox=BOXES.find(b=>b.id===id);
  if(!nextBox)return;
  if(!isBoxUnlocked(nextBox)){
    showToast('Secret banner locked: pull each normal banner 10 times');
    return;
  }
  selectedBox=nextBox;
  document.querySelectorAll('.box-card').forEach(c=>c.classList.remove('selected'));
  document.getElementById('card-'+id).classList.add('selected');
  document.getElementById('chestVisual').textContent=selectedBox.icon;
  document.getElementById('chestVisual').style.filter=`drop-shadow(0 0 20px ${selectedBox.color}55)`;
  document.getElementById('btnCost').textContent=`◈ ${getCurrentBoxCost(selectedBox).toLocaleString()} per pull`;
  renderOdds(); updateBtn();
}
function renderOdds(){
  document.getElementById('oddsTable').innerHTML='<p class="section-title" style="padding:1rem 1.25rem 0.5rem;margin:0">Drop rates</p>'+
    RARITY_ORDER.map(r=>`<div class="odds-row"><div class="odds-dot" style="background:${RARITY_COLORS[r]}"></div><div class="odds-label ${RARITY_CLASSES[r]}">${RARITY_LABELS[r]}</div><div class="odds-bar-wrap"><div class="odds-bar" style="width:${Math.min(selectedBox.odds[r]*1.5,100)}%;background:${RARITY_COLORS[r]}"></div></div><div class="odds-pct">${selectedBox.odds[r]}%</div></div>`).join('');
}
function updateBtn(){
  const btn=document.getElementById('openBtn'); if(!btn)return;
  if(!isBoxUnlocked(selectedBox)){
    btn.disabled=true;
    btn.textContent='Locked';
    return;
  }
  const cost=getCurrentBoxCost(selectedBox);
  btn.disabled=coins<cost||isOpening;
  btn.textContent=coins<cost?'Insufficient Funds':'Pull Banner';
}
function rollRarity(){
  const r=Math.random()*100; let c=0;
  for(const rarity of RARITY_ORDER){c+=selectedBox.odds[rarity];if(r<c)return rarity;}
  return 'common';
}

const RARITY_REWARD_MULTIPLIERS={
  common:0.32,
  rare:0.72,
  epic:1.55,
  legendary:3.4,
  mythic:7.6,
};

function getDropRateMultiplier(dropRatePercent){
  const safeRate=Math.max(0.1,Number(dropRatePercent)||0.1);
  // Lower drop-rate items get a larger reward multiplier.
  return Math.pow(10/safeRate,0.65);
}

function calculateDropValue(box,rarity){
  const rarityMult=RARITY_REWARD_MULTIPLIERS[rarity]||0.3;
  const dropRate=box?.odds?.[rarity]??100;
  const dropRateMult=getDropRateMultiplier(dropRate);
  const rawValue=box.cost*rarityMult*dropRateMult;
  return Math.max(1,Math.floor(rawValue));
}

function createRewardedItem(baseItem,rarity,box){
  if(box?.isSecret){
    return {...baseItem};
  }
  return {...baseItem,value:calculateDropValue(box,rarity)};
}

function getRandomSpinEntry(){
  const rarity=rollRarity();
  const pool=selectedBox.isSecret?ITEMS.secret:getItemPoolForRarity(rarity);
  const item=pool[Math.floor(Math.random()*pool.length)];
  return {item,rarity};
}
function runSpinAnimation(winningItem,winningRarity,onDone){
  const area=document.getElementById('spinArea');
  const strip=document.getElementById('spinStrip');
  const cellWidth=76;
  const total=42;
  const targetIndex=34;
  const entries=[];
  for(let i=0;i<total;i++)entries.push(getRandomSpinEntry());
  entries[targetIndex]={item:winningItem,rarity:winningRarity};
  strip.innerHTML=entries.map(e=>`<div class="spin-item rg-${e.rarity}">${itemVisualMarkup(e.item,'spin-item-icon','spin-item-image')}<div class="spin-item-name">${escapeHtml(e.item.name)}</div></div>`).join('');

  area.classList.remove('landed');
  area.classList.add('active');
  strip.style.transition='none';
  strip.style.transform='translateX(0px)';

  const windowEl=area.querySelector('.spin-window');
  const centerOffset=(windowEl.clientWidth/2)-(cellWidth/2)-12;
  const targetX=-(targetIndex*cellWidth-centerOffset);

  requestAnimationFrame(()=>{
    strip.style.transition='transform 1.75s cubic-bezier(0.08,0.62,0.12,1)';
    strip.style.transform=`translateX(${targetX}px)`;
  });

  setTimeout(()=>{
    area.classList.add('landed');
    spawnParticles(RARITY_COLORS[winningRarity],winningRarity==='mythic'?28:14);
  },1750);

  setTimeout(()=>{
    area.classList.remove('active');
    onDone();
  },2050);
}
function openBox(){
  if(isOpening||!isBoxUnlocked(selectedBox))return;
  const currentCost=getCurrentBoxCost(selectedBox);
  if(coins<currentCost)return;
  isOpening=true; updateBtn();
  setCoins(coins-currentCost);
  vStats.opened++; vStats.spent+=currentCost; updateVStats();
  boxOpenCounts[selectedBox.id]=(boxOpenCounts[selectedBox.id]||0)+1;
  const activeId=selectedBox.id;
  renderBoxGrid();
  selectBox(activeId);
  if(isBoxUnlocked(BOXES.find(b=>b.isSecret))&&!secretUnlockedAnnounced){
    secretUnlockedAnnounced=true;
    showToast('Secret banner unlocked');
  }
  saveGame();
  const chest=document.getElementById('chestVisual');
  chest.classList.add('opening'); setTimeout(()=>chest.classList.remove('opening'),700);
  const rarity=rollRarity();
  const itemPool=selectedBox.isSecret?ITEMS.secret:getItemPoolForRarity(rarity);
  const baseItem=itemPool[Math.floor(Math.random()*itemPool.length)];
  const item=createRewardedItem(baseItem,rarity,selectedBox);
  if(rarity==='legendary'||rarity==='mythic')vStats.legendaries++;
  if(!vStats.best||RARITY_ORDER.indexOf(rarity)>RARITY_ORDER.indexOf(vStats.best))vStats.best=rarity;
  updateVStats();
  runSpinAnimation(item,rarity,()=>showReveal(item,rarity));
  setTimeout(()=>{addToInventory(item,rarity);isOpening=false;updateBtn();},2800);
}
function showReveal(item,rarity){
  const color=RARITY_COLORS[rarity];
  document.getElementById('revealIcon').innerHTML=itemVisualMarkup(item,'reveal-emoji','reveal-image');
  document.getElementById('revealRarity').textContent=RARITY_LABELS[rarity];
  document.getElementById('revealRarity').style.color=color;
  document.getElementById('revealName').textContent=item.name;
  document.getElementById('revealName').style.color=color;
  document.getElementById('revealDesc').textContent=item.desc;
  document.getElementById('revealValue').textContent=`◈ ${item.value} value`;
  const glow=document.getElementById('revealGlow');
  glow.style.background=`linear-gradient(135deg,${color}22,${color}44)`;
  glow.style.boxShadow=`0 0 40px ${color}33`;
  document.getElementById('revealCard').style.border=`1px solid ${color}44`;
  document.getElementById('revealOverlay').classList.add('active');
  if(['epic','legendary','mythic'].includes(rarity))spawnParticles(color,rarity==='mythic'?40:rarity==='legendary'?25:15);
}
function closeReveal(){
  document.getElementById('revealOverlay').classList.remove('active');
}
function overlayBgClick(e){
  if(e.target===document.getElementById('revealOverlay'))closeReveal();
}
function addToInventory(item,rarity){
  const invItem={...item,rarity,id:inventoryItemId++};
  inventory.unshift(invItem);
  const em=document.getElementById('emptyMsg'); if(em)em.remove();
  const grid=document.getElementById('invGrid');
  const div=document.createElement('div');
  div.className=`inv-item sellable rg-${rarity} new`;
  div.dataset.itemId=String(invItem.id);
  div.title=item.name;
  div.innerHTML=`${itemVisualMarkup(item,'item-emoji','item-image')}<div class="item-label ${RARITY_CLASSES[rarity]}">${escapeHtml(item.name)}</div><div class="item-value">Sell ◈ ${item.value.toLocaleString()}</div>`;
  div.onclick=()=>sellInventoryItem(invItem.id);
  grid.insertBefore(div,grid.firstChild);
  syncInventoryState();
  saveGame();
  setTimeout(()=>div.classList.remove('new'),400);
}

function sellInventoryItem(itemId){
  const idx=inventory.findIndex(x=>x.id===itemId);
  if(idx===-1)return;
  const [item]=inventory.splice(idx,1);
  addCoins(item.value);
  const node=document.querySelector(`.inv-item[data-item-id="${itemId}"]`);
  if(node)node.remove();
  syncInventoryState();
  saveGame();
  showToast(`Sold ${item.icon} ${item.name} for ◈ ${item.value.toLocaleString()}`);
}

function renderInventoryFromState(){
  const grid=document.getElementById('invGrid');
  grid.innerHTML='';
  if(inventory.length===0){
    const msg=document.createElement('div');
    msg.className='inv-empty';
    msg.id='emptyMsg';
    msg.innerHTML='<span class="inv-empty-icon">📦</span><span>Pull a banner to begin</span>';
    grid.appendChild(msg);
    syncInventoryState();
    return;
  }
  inventory.forEach(invItem=>{
    const div=document.createElement('div');
    div.className=`inv-item sellable rg-${invItem.rarity}`;
    div.dataset.itemId=String(invItem.id);
    div.title=invItem.name;
    div.innerHTML=`${itemVisualMarkup(invItem,'item-emoji','item-image')}<div class="item-label ${RARITY_CLASSES[invItem.rarity]}">${escapeHtml(invItem.name)}</div><div class="item-value">Sell ◈ ${invItem.value.toLocaleString()}</div>`;
    div.onclick=()=>sellInventoryItem(invItem.id);
    grid.appendChild(div);
  });
  syncInventoryState();
}

function syncInventoryState(){
  document.getElementById('invCount').textContent=`${inventory.length} items`;
  const grid=document.getElementById('invGrid');
  const hasItems=inventory.length>0;
  const empty=document.getElementById('emptyMsg');
  if(!hasItems&&!empty){
    const msg=document.createElement('div');
    msg.className='inv-empty';
    msg.id='emptyMsg';
    msg.innerHTML='<span class="inv-empty-icon">📦</span><span>Pull a banner to begin</span>';
    grid.appendChild(msg);
  }
}
function updateVStats(){
  document.getElementById('statOpened').textContent=vStats.opened;
  document.getElementById('statSpent').textContent=vStats.spent.toLocaleString();
  const el=document.getElementById('statBest');
  if(vStats.best){el.textContent=RARITY_LABELS[vStats.best];el.className=`stat-value ${RARITY_CLASSES[vStats.best]}`;}
  document.getElementById('statLeg').textContent=vStats.legendaries;
}

// ===== CLICKER =====
let clickPower=1, clickPowerBase=1, clickPowerMultiplier=1, totalMined=0, totalClicks=0, generatorPowerMultiplier=1;
let generatorSpecificMultipliers={};

function recomputeClickPower(){
  clickPower=clickPowerBase*clickPowerMultiplier;
}

function addClickPower(amount){
  clickPowerBase+=amount;
  recomputeClickPower();
}

function multiplyClickPower(multiplier){
  clickPowerMultiplier*=multiplier;
  recomputeClickPower();
}
function resetGeneratorMultipliers(){
  generatorSpecificMultipliers=GENERATORS.reduce((acc,g)=>{
    acc[g.id]=1;
    return acc;
  },{});
}
function boostGenerator(id,multiplier){
  generatorSpecificMultipliers[id]=(generatorSpecificMultipliers[id]||1)*multiplier;
}
resetGeneratorMultipliers();
const genCost=g=>Math.floor(g.baseCost*Math.pow(1.12,g.owned));
const genCps=g=>g.owned*g.baseCps*generatorPowerMultiplier*(generatorSpecificMultipliers[g.id]||1);
const totalCps=()=>GENERATORS.reduce((s,g)=>s+genCps(g),0);

function handleClick(e){
  const earned=clickPower;
  addCoins(earned); totalMined+=earned; totalClicks++;
  updateClickStats();
  const btn=document.getElementById('mineBtn');
  btn.classList.add('clicked'); setTimeout(()=>btn.classList.remove('clicked'),100);
  const drift=(Math.random()-0.5)*60;
  const el=document.createElement('div');
  el.className='float-coin';
  el.textContent='+'+asWholeDisplay(earned);
  el.style.cssText=`left:${e.clientX-20}px;top:${e.clientY-10}px;--drift:${drift}px`;
  document.body.appendChild(el); setTimeout(()=>el.remove(),900);
}

function updateClickStats(){
  document.getElementById('perClickDisplay').textContent='+'+asWholeDisplay(clickPower);
  document.getElementById('perSecDisplay').textContent=totalCps().toFixed(1);
  document.getElementById('totalMinedDisplay').textContent=asWholeDisplay(totalMined);
  document.getElementById('totalClicksDisplay').textContent=totalClicks.toLocaleString();
  const cps=totalCps();
  const badge=document.getElementById('cpsBadge');
  if(cps>0){badge.style.display='';badge.textContent=`◈ ${cps.toFixed(1)} /sec`;}
}

function renderUpgrades(){
  const available=UPGRADES
    .filter(u=>u.level<u.maxLevel)
    .sort((a,b)=>a.cost-b.cost);
  if(available.length===0){
    document.getElementById('upgradesList').innerHTML='<div class="upgrade-item" style="cursor:default;opacity:0.75"><div class="upgrade-info"><div class="upgrade-name">All upgrades purchased</div><div class="upgrade-desc">You have bought every available upgrade.</div></div></div>';
    return;
  }
  document.getElementById('upgradesList').innerHTML=available.map(u=>{
    const canAfford=coins>=u.cost;
    return `<div class="upgrade-item ${canAfford?'can-afford':'locked'}" data-upgrade-id="${u.id}" onclick="buyUpgrade('${u.id}')">
      <div class="upgrade-icon-box" style="background:${u.bg}">${u.icon}</div>
      <div class="upgrade-info">
        <div class="upgrade-name" style="color:${u.color}">${u.name}</div>
        <div class="upgrade-desc">${u.desc}</div>
      </div>
      <div><div class="upgrade-cost">◈ ${u.cost.toLocaleString()}</div></div>
    </div>`;
  }).join('');
}

function buyUpgrade(id){
  const u=UPGRADES.find(x=>x.id===id);
  if(!u||u.level>=u.maxLevel||coins<u.cost)return;
  setCoins(coins-u.cost); u.level++; u.apply();
  updateClickStats(); renderUpgrades();
  if(u.id.startsWith('gu'))renderGenerators();
  saveGame();
  showToast(`${u.icon} ${u.name} purchased!`);
}

function renderGenerators(){
  const cps=totalCps();
  document.getElementById('genList').innerHTML=GENERATORS.map(g=>{
    const cost=genCost(g), canAfford=coins>=cost;
    const share=cps>0?(genCps(g)/cps*100):0;
    const cpsText=`${genCps(g).toFixed(1)}/sec${g.owned>0?' · '+share.toFixed(0)+'% of total':''}`;
    return `<div class="gen-item ${canAfford?'can-afford':''}" data-generator-id="${g.id}" onclick="buyGenerator('${g.id}')">
      <div class="gen-header-row">
        <span class="gen-icon">${g.icon}</span>
        <span class="gen-name">${g.name}</span>
        <span class="gen-owned" style="color:${g.color}">${g.owned}</span>
      </div>
      <div class="gen-progress-wrap"><div class="gen-progress" id="gp-${g.id}" style="width:${g.progress.toFixed(1)}%;background:${g.color}"></div></div>
      <div class="gen-meta">
        <span class="gen-meta-cps">${cpsText}</span>
        <span class="gen-meta-cost">◈ ${cost.toLocaleString()}</span>
      </div>
      <div class="gen-footer">
        <span class="gen-cps-label">${cpsText}</span>
        <span class="gen-cost">◈ ${cost.toLocaleString()}</span>
      </div>
    </div>`;
  }).join('');
}

function buyGenerator(id){
  const g=GENERATORS.find(x=>x.id===id);
  const cost=genCost(g); if(coins<cost)return;
  setCoins(coins-cost); g.owned++;
  updateClickStats(); renderGenerators();
  saveGame();
  showToast(`${g.icon} ${g.name} hired! (×${g.owned})`);
}

function updateShopAffordability(){
  UPGRADES.forEach(u=>{
    const node=document.querySelector(`.upgrade-item[data-upgrade-id="${u.id}"]`);
    if(!node)return;
    const bought=u.level>=u.maxLevel;
    node.classList.toggle('maxed',bought);
    node.classList.toggle('can-afford',!bought&&coins>=u.cost);
    node.classList.toggle('locked',!bought&&coins<u.cost);
  });

  GENERATORS.forEach(g=>{
    const node=document.querySelector(`.gen-item[data-generator-id="${g.id}"]`);
    if(!node)return;
    node.classList.toggle('can-afford',coins>=genCost(g));
  });
}

// Passive tick every 50ms
let passiveAccum=0;
setInterval(()=>{
  const cps=totalCps(); if(cps===0)return;
  const tick=cps*0.05;
  passiveAccum+=tick;
  if(passiveAccum>=1){
    const earned=Math.floor(passiveAccum);
    addCoins(earned); totalMined+=earned; passiveAccum-=earned;
    updateClickStats();
  }
  // Animate each generator's progress bar
  GENERATORS.forEach(g=>{
    if(g.owned===0)return;
    g.progress+=g.owned;
    if(g.progress>=100)g.progress=0;
    const bar=document.getElementById('gp-'+g.id);
    if(bar)bar.style.width=g.progress.toFixed(1)+'%';
  });
},50);

function spawnParticles(color,count){
  const cx=window.innerWidth/2,cy=window.innerHeight/2;
  for(let i=0;i<count;i++){
    const p=document.createElement('div'); p.className='particle';
    const angle=Math.random()*Math.PI*2,dist=100+Math.random()*300;
    p.style.cssText=`left:${cx}px;top:${cy}px;background:${color};--tx:${Math.cos(angle)*dist}px;--ty:${Math.sin(angle)*dist}px;--dur:${0.6+Math.random()*0.8}s;width:${3+Math.random()*6}px;height:${3+Math.random()*6}px;`;
    document.body.appendChild(p); setTimeout(()=>p.remove(),1500);
  }
}
function showToast(msg){
  const t=document.getElementById('toast'); t.textContent=msg;
  t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2000);
}

document.addEventListener('keydown',e=>{
  if(e.code==='Space'&&!e.target.matches('button,input')){
    e.preventDefault();
    if(document.getElementById('tab-vault').classList.contains('active'))openBox();
    else handleClick({clientX:window.innerWidth/2,clientY:window.innerHeight/2});
  }
});

// INIT
loadGame();
renderBoxGrid();
selectBox(selectedBox.id);
renderUpgrades();
renderGenerators();
renderInventoryFromState();
setCoins(coins);
updateClickStats();
setInterval(saveGame,5000);
window.addEventListener('beforeunload',saveGame);
