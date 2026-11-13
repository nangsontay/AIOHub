'use strict';
const app = document.getElementById('app'), sheet = document.getElementById('sheet');
const paths = {
  more:'M5 12h.01M12 12h.01M19 12h.01', forward:'M5 12h14m-6-6 6 6-6 6', right:'m9 6 6 6-6 6', left:'m15 6-6 6 6 6', x:'m6 6 12 12M18 6 6 18', user:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2',
  video:'M4 5h16v14H4zM10 9l5 3-5 3z', music:'M9 17V6l10-2v11M9 17c0 3-6 4-6 1 0-3 6-4 6-1zm10-2c0 3-6 4-6 1 0-3 6-4 6-1z', news:'M4 4h13v15a2 2 0 0 0 4 0V8h-4M4 4v15a2 2 0 0 0 2 2h13M7 8h7M7 12h7M7 16h4', game:'M7 7h10c3 0 4 3 5 9 0 3-2 4-4 2l-2-2H8l-2 2c-2 2-4 1-4-2 1-6 2-9 5-9zM6 11h4m-2-2v4m7-2h.01m3 2h.01',
  play:'m8 4 12 8-12 8z',pause:'M8 5v14M16 5v14', warn:'m12 3 10 17H2zM12 9v4m0 3h.01',empty:'M3 8l4-5h10l4 5v12H3zM3 12h5l2 3h4l2-3h5', offline:'m3 3 18 18M2 9a16 16 0 0 1 4-2m5-1a17 17 0 0 1 11 3M5 13a12 12 0 0 1 5-2m5 1 3 1M9 17a6 6 0 0 1 5-1M12 20h.01', device:'M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM11 18h2',reset:'M3 10a9 9 0 1 1 1 7M3 4v6h6', settings:'M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6M9 15v6', check:'m5 12 4 4 10-11', signout:'M9 3H4v18h5m0-9h12m-5-5 5 5-5 5'
};
const icon = (name,cls='') => '<svg class="ico '+cls+'" viewBox="0 0 24 24" aria-hidden="true" '+(name==='more'?'style="stroke-width:3.5"':'')+'><path d="'+paths[name]+'"/></svg>';
const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn = (action,label,style='second',symbol='') => '<button type="button" data-do="'+action+'" class="btn '+style+'">'+(symbol?icon(symbol):'')+label+'</button>';
const cats = {Video:'YouTube', Music:'Spotify', News:'VnExpress', Game:'2048'};
const demos = {a:{name:'Avery',email:'avery@example.test'},b:{name:'Blair',email:'blair@example.test'}};
const videos = [{name:'Saigon after the rain',by:'City Frames',time:164,color:'#6d598f'},{name:'Inside a cassette deck',by:'Tape Notes',time:208,color:'#967142'},{name:'A walk along the river',by:'Field Journal',time:112,color:'#497969'}];
const tracks = [{name:'Violet Hours',by:'Mira Vale',time:189,color:'#62528d'},{name:'Side B',by:'The Quiet Room',time:212,color:'#546e60'},{name:'Night Bus Home',by:'June Signal',time:173,color:'#995d51'}];
const articles=[
 {title:'A weekend on the banks of the Saigon River',section:'City life',paras:['Early on Saturday, the riverfront is already awake. Walkers share the promenade with cyclists while the first small coffee stands open beside the path.','From the footbridge, the river curves past new apartment towers and older ferry piers. At the water’s edge, visitors can hear the ferries long before they come into view.','A group of students has brought sketchbooks. They stop at the same bend every weekend to draw what changes with the tide, the light and the passing boats.','By late morning, families settle on the steps for a break. There is room to watch the river from the shade, and the breeze makes this stretch of the city feel unhurried.']},
 {title:'The student record club bringing cassettes back',section:'Culture',paras:['Once a month, a listening club meets to share recordings collected from friends and neighborhood shops.','Each member picks a track, introduces the artist, and lets the group hear a complete side together.','The handmade labels are part of the appeal. Members exchange cover sketches and notes alongside the recordings.']},
 {title:'A new reading corner for the neighborhood',section:'Community',paras:['Volunteers have turned an unused room into a small weekend reading space.','Readers can borrow a book or settle into a chair by the window. The shelves already hold poetry, science guides and illustrated stories.','The next meeting will bring families together to choose the books they would like to see next.']}
];
const KEY='aiohub-pocket-v1';
function fresh(){return {accounts:{},sessions:{},games:{},device:'D1',user:null};}
let data;try{data=JSON.parse(localStorage.getItem(KEY))||fresh();}catch{data=fresh();}
let route={page:data.user?'home':'welcome'}, stack=[], held='', offline=false, chosenDemo='a', notice='', prefill='', outcome='success', restoreState='', timer, playTimer, playing=false, picked=0, elapsed=0, search='', currentPanel='', dialogFocusEl, loadTicket=0, restoreTicket=0;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(data));}catch{/* Storage may be unavailable in private previews. */}};
const announce=text=>document.getElementById('announce').textContent=text;
const who=()=>Object.values(demos).find(d=>d.email===data.user)?.name || (data.user||'Guest').split('@')[0];
const sessionKey=(cat,device=data.device)=>JSON.stringify([device,data.user,cat]);
const session=(cat,device)=>data.sessions[sessionKey(cat,device)];
const statusText=()=>data.device==='D2'?'Device 2':'Device 1';
function stop(){clearInterval(playTimer);playing=false;}
function resetPlayer(){stop();picked=0;elapsed=0;search='';}
function navigate(next,replace=false){
  if (next.page!=='provider'||route.cat!==next.cat) resetPlayer();
  clearTimeout(timer); loadTicket++; restoreTicket++;
  if (!replace) stack.push(route);
  route=next;render(true);window.scrollTo(0,0);
}
function back(){
  resetPlayer();clearTimeout(timer);loadTicket++;restoreTicket++;route=stack.pop()||{page:data.user?'home':'welcome'};if(route.page==='provider' && route.phase==='loading' && held!=='loading')route.phase=offline?'error':'ready';render(true);window.scrollTo(0,0);
}
function startUser(email){
  prefill='';
  data.user=email; save();stack=[];notice='';navigate({page:'home'},true);
}
function logout(){
  data.user=null;prefill='';save();stack=[];held='';notice='';restoreState='';navigate({page:'signin'},true);
}
function startD2(){data.device='D2';data.user=null;prefill='';Object.keys(data.sessions).filter(k=>JSON.parse(k)[0]==='D2').forEach(k=>delete data.sessions[k]);save();stack=[];held='';offline=false;restoreState='';notice='Device 2 is ready. Sign in with the same AIOHub account.';navigate({page:'signin'},true);}
function brandHeader(){return '<header class="top"><span class="brand"><img src="./assets/mark.svg" alt="">AIOHub</span><div class="top-actions">'+(data.user?'<button class="icon-btn person" data-do="account" aria-label="Account menu">'+esc(who()[0].toUpperCase())+'</button>':'')+'<button class="icon-btn dot-menu" data-do="demo" aria-label="Demo controls" title="Demo controls">'+icon('more')+'</button></div></header>'+(offline?'<div class="offline" role="status">Offline · Service pages are unavailable</div>':'');}
const backLink=(act,label)=>'<button class="action-link back" data-do="'+act+'">'+icon('left')+label+'</button>';
function welcome(){return '<main class="stage welcome"><div class="sleeve"><img src="./assets/pocket-mixtape.webp" alt="A translucent indigo cassette with a vinyl record on a lilac background"></div><div class="welcome-copy"><h1>Your media,<br><em>in one place.</em></h1><p>Video, music, news, and games. Choose what to open from your own media hub.</p></div><div class="welcome-actions"><button class="btn primary" data-do="signin">Sign in '+icon('forward')+'</button>'+btn('register','Create account')+btn('demo-login','Use demo account','quiet','user')+'</div></main>';}
function inputField(id,label,type,autocomplete,value=''){return '<label class="field" for="'+id+'">'+label+'<input id="'+id+'" name="'+id+'" type="'+type+'" autocomplete="'+autocomplete+'" value="'+esc(value)+'" required aria-describedby="err-'+id+'"><span class="error" id="err-'+id+'" aria-live="polite"></span></label>';}
function auth(){const reg=route.page==='register';return '<main class="stage flow"><div class="backbar">'+backLink('welcome','Welcome')+'</div><h1>'+(reg?'Create account':'Sign in')+'</h1><p class="sub">'+(reg?'Create a local AIOHub demo account. Use fictional details.':'Sign in to your AIOHub account on '+statusText()+'.')+'</p>'+(notice?'<p class="notice" role="status">'+esc(notice)+'</p>':'')+'<form class="form" id="auth-form" novalidate>'+inputField('email','Email','email','username',prefill)+inputField('password','Password','password',reg?'new-password':'current-password')+(reg?inputField('confirm','Confirm password','password','new-password'):'')+'<p class="error" id="auth-error" role="alert"></p><button class="btn primary" type="submit">'+(reg?'Create account':'Sign in')+'</button></form><div class="compact">'+btn(reg?'signin':'register',reg?'Already have an account? Sign in':'Create account','quiet')+(!reg?btn('demo-login','Use demo account','tonal','user'):'')+'</div></main>';}
function home(){return '<main class="stage flow"><div class="home-art"><img src="./assets/pocket-mixtape.webp" alt=""><h1>Your hub</h1></div><div><h2>Categories</h2><p class="sub">Choose a service to open.</p></div><div class="grid">'+Object.entries(cats).map(([cat,s])=>'<button class="tile '+cat.toLowerCase()+'" data-do="cat:'+cat+'"><span class="token">'+icon(cat.toLowerCase())+'</span>'+icon('right','arrow')+'<span><strong>'+cat+'</strong><small>'+s+'</small></span></button>').join('')+'</div>'+(data.device==='D2'?btn('restore','Simulated restoration','tonal','device'):'')+'</main>';}
function stateCard(symbol,title,txt,actions=''){return '<section class="state"><span class="token">'+(symbol==='loading'?'<span class="spinner"></span>':icon(symbol))+'</span><h2>'+title+'</h2><p class="sub">'+txt+'</p><div class="rowline">'+actions+'</div></section>';}
function category(){const c=route.cat,s=cats[c];return '<main class="stage flow"><div>'+backLink('home','Home')+'</div><h1>'+c+'</h1><p class="sub">Services</p>'+(held==='empty'?stateCard('empty','No services in this category','Choose another category from Home.',''):'<button class="service-row '+c.toLowerCase()+'" data-do="open:'+c+'"><span class="token">'+icon(c.toLowerCase())+'</span><strong>'+s+'</strong>'+icon('right','end')+'</button>')+'</main>';}
function openService(cat,sticky=''){
  held=sticky;resetPlayer();navigate({page:'provider',cat,phase:'loading'});
  if(sticky==='loading') return;
  const ticket=loadTicket;
  timer=setTimeout(()=>{if(ticket!==loadTicket)return;route.phase=offline||sticky==='error'?'error':'ready';render(true);},450);
}
function serviceStatus(){const c=route.cat,id=session(c);return '<div class="session"><span class="muted break">'+(id?'Provider account<br><strong>'+esc(id)+'</strong>':'Provider account · Guest')+'</span>'+btn(id?'provider-out':'provider-in',id?'Sign out':'Provider sign-in','quiet small')+'</div>';}
function provider(){const c=route.cat,s=cats[c];let content='';
  if(route.phase==='loading') content=stateCard('loading','Opening '+s+'…','Loading the service page.',held==='loading'?btn('finish-load','Finish loading','tonal'):'');
  else if(route.phase==='error'||offline)content=stateCard(offline?'offline':'warn','Couldn’t load '+s,offline?'You are offline. Return to the service list or reconnect in Demo controls.':'The service page could not be opened.',btn('retry','Retry','primary')+btn('services','Back'));
  else if(c==='News')content=newsPage();else if(c==='Game')content=gamePage();else content=mediaPage(c);
  return '<div class="servicebar">'+backLink('services','Services')+'<strong>'+s+'</strong></div><main class="stage provider">'+content+(route.phase==='ready'&&!offline?serviceStatus():'')+'</main>';
}
function newsPage(){
  if(Number.isInteger(route.article)){const art=articles[route.article];return '<article class="article"><div>'+backLink('web-back','Web Back')+'</div><span class="meta">'+art.section+' · Sample article</span><h1>'+art.title+'</h1>'+'<div class="article-body" tabindex="0" role="region" aria-label="Article text">'+art.paras.map(p=>'<p>'+p+'</p>').join('')+'</div></article>';}
  return '<div class="masthead">VnExpress</div><h1>Headlines</h1><div>'+articles.map((a,i)=>'<button class="story" data-do="article:'+i+'"><small>'+a.section+'</small><strong>'+a.title+'</strong></button>').join('')+'</div>';
}
const formatTime=t=>Math.floor(t/60)+':'+String(t%60).padStart(2,'0');
function mediaPage(c){
 const isVideo=c==='Video', items=isVideo?videos:tracks,item=items[picked],matches=items.map((v,i)=>({...v,i})).filter(v=>(v.name+' '+v.by).toLowerCase().includes(search.toLowerCase()));
 return '<h1>'+cats[c]+'</h1>'+(isVideo?'<form id="search-form" class="search"><input type="search" aria-label="Search sample videos" name="q" placeholder="Search sample videos" value="'+esc(search)+'"><button class="btn tonal">Search</button></form>':'')+'<div class="player"><div class="cover" style="--cover:'+item.color+'">'+icon(isVideo?'video':'music')+'</div><div class="player-details"><small class="meta">Simulated playback</small><h2>'+item.name+'</h2><p class="muted">'+item.by+'</p><div class="progress"><i id="fill" style="width:'+elapsed/item.time*100+'%"></i></div><div class="title-row"><small id="time">'+formatTime(elapsed)+' / '+formatTime(item.time)+'</small>'+btn('toggle',playing?'Pause':'Play','primary',playing?'pause':'play')+'</div></div></div><h2>'+(isVideo?'Videos':'Tracks')+'</h2><div class="provider-list">'+(matches.length?matches.map(v=>'<button data-do="pick:'+v.i+'" class="item '+(v.i===picked?'active':'')+'">'+icon(isVideo?'video':'music')+'<span><strong>'+v.name+'</strong><small class="meta">'+v.by+'</small></span>'+icon('play','end')+'</button>').join(''):'<p class="notice">No videos match this search.</p>')+'</div>';
}
function togglePlayback(){if(playing){stop();render();return;}playing=true;render();playTimer=setInterval(()=>{const item=(route.cat==='Video'?videos:tracks)[picked];elapsed++;if(elapsed>=item.time){elapsed=0;stop();render();return;}document.getElementById('time').textContent=formatTime(elapsed)+' / '+formatTime(item.time);document.getElementById('fill').style.width=100*elapsed/item.time+'%';},1000);}
function getBoard(){const k=sessionKey('board');if(!data.games[k]){data.games[k]=newBoard();save();}return data.games[k];}
const tileColors={2:'#fff6e8',4:'#ffe2bb',8:'#fbc69a',16:'#f4b485',32:'#ef9d97',64:'#dcadf0',128:'#d8c6ff',256:'#abd9ef',512:'#a2ddcf',1024:'#e9db92',2048:'#ffcc60'};
function gamePage(){const g=getBoard(),over=['up','down','left','right'].every(d=>!moveBoard(g.board,d).changed);return '<div class="title-row"><h1>2048</h1><strong>Score '+g.score+'</strong></div><p class="sub">Swipe, press an arrow key, or use the arrows below to merge matching tiles.</p><div id="board" class="board" tabindex="0" aria-label="2048 board">'+g.board.map(v=>'<div class="cell"'+(v?' style="background:'+(tileColors[v]||'#dcc8fb')+'"':'')+'>'+ (v||'')+'</div>').join('')+'</div><div class="directions">'+['left','up','down','right'].map((d,i)=>'<button class="btn tonal" aria-label="Move '+d+'" data-do="move:'+d+'">'+['←','↑','↓','→'][i]+'</button>').join('')+'</div>'+(over?'<p class="notice">No moves left. Start a new game to play again.</p>':'')+btn('new-game','New Game','second','reset');}
function playMove(d){const g=getBoard(),m=moveBoard(g.board,d);if(!m.changed)return;g.board=m.board;spawnTile(g.board);g.score+=m.gained;save();render();announce('Moved '+d+'. Score '+g.score+'.');}
function restorePage(){
 let msg='Select the outcome for this local prototype.';
 if(restoreState==='progress')msg='Restoring your eligible Device 1 sessions…';
 if(restoreState==='success')msg='Restored. Open the service to see your Device 1 provider identity.';
 if(restoreState==='expired')msg='The service session has expired. Sign in to the provider again.';
 if(restoreState==='unsupported')msg='This provider does not support session restoration.';
 if(restoreState==='missing')msg='No eligible Device 1 session for this AIOHub user. You can prepare one in Demo controls.';
 if(restoreState==='offline')msg='Device 2 is offline. Reconnect and retry.';
 let body='<main class="stage flow">'+backLink('home','Home')+'<h1>Simulated restoration</h1><p class="sub">Restore a fictional provider session on Device 2. Real provider support still needs validation.</p><label class="field">Demo outcome<select id="outcome" '+(restoreState==='progress'?'disabled':'')+'>'+['success','expired','unsupported'].map(v=>'<option value="'+v+'" '+(v===outcome?'selected':'')+'>'+v[0].toUpperCase()+v.slice(1)+'</option>').join('')+'</select></label><div class="notice" role="status">'+(restoreState==='progress'?'<span class="spinner"></span> ':'')+msg+'</div>';
 if(restoreState!=='progress')body+=btn('restore-go',restoreState==='success'||!restoreState?'Restore service sessions':'Retry','primary');
 if(restoreState==='success')body+=btn('restored-open','Open restored service','tonal');
 if(['missing','expired','unsupported'].includes(restoreState))body+=btn('restore-manual','Provider sign-in','tonal');
 return body+'</main>';
}
function runRestore(){restoreState='progress';render();const ticket=++restoreTicket;timer=setTimeout(()=>{if(ticket!==restoreTicket)return;const eligible=Object.keys(cats).filter(c=>session(c,'D1'));restoreState=offline?'offline':outcome==='success'?(eligible.length?'success':'missing'):outcome;if(restoreState==='success'){eligible.forEach(c=>data.sessions[sessionKey(c)]=session(c,'D1'));save();}else if(['expired','unsupported'].includes(restoreState)){eligible.forEach(c=>delete data.sessions[sessionKey(c)]);save();}render();},850);}
function render(focus=false){
 if(!data.user&&!['signin','register','welcome'].includes(route.page)){route={page:'signin'};stack=[];}
 const last=document.activeElement?.closest('[data-do]')?.dataset.do;
 const body=route.page==='welcome'?welcome():['signin','register'].includes(route.page)?auth():route.page==='home'?home():route.page==='category'?category():route.page==='restore'?restorePage():provider();
 app.innerHTML=brandHeader()+body;
 if(focus){const heading=app.querySelector('h1,h2');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}
 else if(last){const match=[...app.querySelectorAll('[data-do]')].find(n=>n.dataset.do===last);match?.focus({preventScroll:true});}
}
const menuRow=(a,label,sym)=>'<button class="menu-row" data-do="'+a+'">'+icon(sym)+'<span>'+label+'</span>'+icon('right','end')+'</button>';
function panel(name){
 if(!sheet.open)dialogFocusEl=document.activeElement;
 currentPanel=name;
 let title='',body='';
 if(name==='demo'){
  title='Demo controls';
  body='<h3>Account for next demo sign-in</h3><div class="selector">'+['a','b'].map(k=>'<button class="btn '+(chosenDemo===k?'tonal active':'second')+'" data-do="choose:'+k+'" aria-pressed="'+(chosenDemo===k)+'">'+demos[k].name+' · '+k.toUpperCase()+'</button>').join('')+'</div><h3>Preview a screen state</h3><label class="field">Category<select id="demo-cat">'+Object.keys(cats).map(c=>'<option '+(c===(route.cat||'News')?'selected':'')+'>'+c+'</option>').join('')+'</select></label>'+menuRow('hold:loading','Service loading','video')+menuRow('hold:empty','Empty category','empty')+menuRow('hold:error','Page-load error','warn')+menuRow('offline',offline?'Go online':'Go offline','offline')+'<h3>Devices</h3><p class="hint">Current device: '+statusText()+'. Provider sessions belong to the signed-in AIOHub user.</p>'+menuRow('device2','Start fresh on Device 2','device')+(data.device==='D2'?menuRow('device1','Return to Device 1','device'):'')+(data.user?menuRow('seed-session','Prepare a sample Device 1 session','user'):'')+'<div class="rule"></div>'+menuRow('reset','Reset demo','reset');
 }else if(name==='account'){title='AIOHub account';body='<strong class="break">'+esc(who())+'</strong><p class="hint break">'+esc(data.user)+' · '+statusText()+'</p>'+(data.device==='D2'?menuRow('restore','Simulated restoration','device'):'')+menuRow('logout','Log out','signout');}
 else if(name==='provider'){title=cats[route.cat]+' demo sign-in';body='<p class="sub">Use a fictional provider identity for this AIOHub account.</p>'+btn('provider-confirm','Continue as '+esc(who())+' · '+cats[route.cat],'primary')+btn('close','Cancel','quiet');}
 sheet.innerHTML='<div class="sheet-head"><h2 id="sheet-title">'+title+'</h2><button data-do="close" class="icon-btn" aria-label="Close '+esc(title)+'">'+icon('x')+'</button></div><div class="sheet-body">'+body+'</div>';
 if(!sheet.open)sheet.showModal();
}
function closePanel(){if(sheet.open)sheet.close();currentPanel='';if(dialogFocusEl?.isConnected)dialogFocusEl.focus({preventScroll:true});}
function ensureDemo(){if(!data.user){data.user=demos[chosenDemo].email;save();stack=[];}}
function clearHeld(){held='';}
function goCategory(c){clearHeld();navigate({page:'category',cat:c});}
function handle(action){
 const [a,param]=action.split(':');
 if(a==='close'){closePanel();return;}
 if(a==='demo'||a==='account'){panel(a);return;}
 if(a==='choose'){chosenDemo=param;const select=sheet.querySelector('#demo-cat')?.value;panel('demo');if(select)sheet.querySelector('#demo-cat').value=select;sheet.querySelector('[data-do="choose:'+param+'"]').focus();return;}
 const selectedCat=sheet.querySelector('#demo-cat')?.value||route.cat||'News';
 if(sheet.open)closePanel();
 if(a==='welcome'||a==='signin'||a==='register'){notice='';navigate({page:a});}
 else if(a==='demo-login'){startUser(demos[chosenDemo].email);}
 else if(a==='home'){clearHeld();navigate({page:'home'});}
 else if(a==='cat'){goCategory(param);}
 else if(a==='open'){openService(param);}
 else if(a==='services'){goCategory(route.cat);}
 else if(a==='retry'){openService(route.cat);}
 else if(a==='finish-load'){held='';route.phase=offline?'error':'ready';render(true);}
 else if(a==='web-back'){navigate({page:'provider',cat:'News',phase:'ready'},true);}
 else if(a==='article'){navigate({page:'provider',cat:'News',phase:'ready',article:Number(param)});}
 else if(a==='pick'){stop();picked=Number(param);elapsed=0;togglePlayback();}
 else if(a==='toggle'){togglePlayback();}
 else if(a==='new-game'){data.games[sessionKey('board')]=newBoard();save();render();announce('New game. Score zero.');}
 else if(a==='move'){playMove(param);}
 else if(a==='provider-in'){panel('provider');}
 else if(a==='provider-confirm'){data.sessions[sessionKey(route.cat)]=who()+' · '+cats[route.cat];save();render();announce('Provider signed in.');}
 else if(a==='provider-out'){delete data.sessions[sessionKey(route.cat)];save();render();}
 else if(a==='logout'){logout();}
 else if(a==='hold'){
  ensureDemo();offline=false;
  if(param==='empty'){held='empty';navigate({page:'category',cat:selectedCat});}
  else if(param==='error'){held='error';navigate({page:'provider',cat:selectedCat,phase:'error'});}
  else openService(selectedCat,'loading');
 }
 else if(a==='offline'){offline=!offline;if(offline){stop();if(route.page==='provider'){clearTimeout(timer);route.phase='error';}}render();announce(offline?'Offline mode enabled.':'Back online.');}
 else if(a==='device2'){startD2();}
 else if(a==='device1'){data.device='D1';offline=false;logout();notice='Back on Device 1.';render();}
 else if(a==='seed-session'){data.sessions[sessionKey(selectedCat,'D1')]=who()+' · '+cats[selectedCat];save();announce('Prepared '+cats[selectedCat]+' on Device 1.');panel('demo');sheet.querySelector('.sheet-body').insertAdjacentHTML('afterbegin','<p class="notice" role="status">Prepared '+cats[selectedCat]+' for '+esc(who())+' on Device 1.</p>');}
 else if(a==='restore'){restoreState='';navigate({page:'restore'});}
 else if(a==='restore-go'){runRestore();}
 else if(a==='restored-open'){const c=Object.keys(cats).find(cat=>session(cat,'D1')&&session(cat));if(c)openService(c);}
 else if(a==='restore-manual'){const c=Object.keys(cats).find(c=>session(c,'D1'))||'Music';if(offline){openService(c);return;}navigate({page:'provider',cat:c,phase:'ready'});panel('provider');}
 else if(a==='reset'){stop();clearTimeout(timer);data=fresh();save();stack=[];held='';offline=false;outcome='success';restoreState='';notice='';prefill='';chosenDemo='a';navigate({page:'welcome'},true);}
}
document.addEventListener('click',e=>{const control=e.target.closest('button[data-do]');if(control)handle(control.dataset.do);});
sheet.addEventListener('click',e=>{if(e.target===sheet){const box=sheet.getBoundingClientRect();if(e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom)closePanel();}});
document.addEventListener('change',e=>{if(e.target.id==='outcome'){outcome=e.target.value;restoreState='';render();document.getElementById('outcome')?.focus();}});
async function digest(password,salt){
 const bytes=new TextEncoder().encode(salt+password);
 if(!crypto.subtle)return portableSHA256(bytes);
 const hash=await crypto.subtle.digest('SHA-256',bytes);
 return Array.from(new Uint8Array(hash),v=>v.toString(16).padStart(2,'0')).join('');
}
async function submitAuth(form){
 const email=form.email.value.trim().toLowerCase(),password=form.password.value,reg=route.page==='register';
 const fields=['email','password',...(reg?['confirm']:[])], errors={};
 if(!email||!form.email.validity.valid||!/^\S+@\S+\.\S+$/.test(email))errors.email='Enter a valid email address.';
 if(!password)errors.password='Enter a password.';
 if(reg){if(!form.confirm.value||form.confirm.value!==password)errors.confirm='Enter the same password in both fields.';
 if(Object.hasOwn(data.accounts,email)||Object.values(demos).some(u=>u.email===email))errors.email='This email already has an account.';}
 for(const f of fields){form.elements[f].setAttribute('aria-invalid',String(!!errors[f]));document.getElementById('err-'+f).textContent=errors[f]||'';}
 const first=fields.find(f=>errors[f]);if(first){form.elements[first].focus();return;}
 const err=document.getElementById('auth-error');err.textContent='';
 if(offline){err.textContent='You are offline. Reconnect and try again.';return;}
 const submit=form.querySelector('[type=submit]');submit.disabled=true;
 try{
  if(reg){const salt=Array.from(crypto.getRandomValues(new Uint8Array(16)),v=>v.toString(16).padStart(2,'0')).join('');const hash=await digest(password,salt);if(!form.isConnected)return;data.accounts[email]={salt,hash};save();prefill=email;notice='Account created. Sign in to open your hub.';navigate({page:'signin'});}
  else {const record=data.accounts[email];if(!record||await digest(password,record.salt)!==record.hash){err.textContent='Email or password is incorrect. Please try again.';return;}if(form.isConnected)startUser(email);}
 }catch{err.textContent='Couldn’t complete this request. Please try again.';}
 finally{submit.disabled=false;}
}
document.addEventListener('submit',e=>{e.preventDefault();if(e.target.id==='auth-form')submitAuth(e.target);if(e.target.id==='search-form'){search=new FormData(e.target).get('q').trim();render();app.querySelector('[name=q]')?.focus();}});
document.addEventListener('keydown',e=>{if(sheet.open||route.page!=='provider'||route.cat!=='Game'||route.phase!=='ready'||offline||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();playMove(e.key.slice(5).toLowerCase());});
let swipe;
document.addEventListener('pointerdown',e=>{const board=e.target.closest('#board');if(board){swipe=[e.clientX,e.clientY];board.setPointerCapture(e.pointerId);}});
document.addEventListener('pointercancel',()=>{swipe=null;});
document.addEventListener('pointerup',e=>{if(!swipe)return;const dx=e.clientX-swipe[0],dy=e.clientY-swipe[1];swipe=null;if(Math.max(Math.abs(dx),Math.abs(dy))<18)return;playMove(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));});
window.addEventListener('offline',()=>{offline=true;stop();if(route.page==='provider'){clearTimeout(timer);route.phase='error';}render();});
window.addEventListener('online',()=>{offline=false;render();});
window.addEventListener('pagehide',stop);
history.replaceState({aio:false},'');history.pushState({aio:true},'');
window.addEventListener('popstate',()=>{history.pushState({aio:true},'');if(sheet.open)closePanel();else if(stack.length)back();else if(!data.user&&route.page!=='welcome')navigate({page:'welcome'},true);});
render();
