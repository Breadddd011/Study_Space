/* ── STARS ── */
(function(){
  const wrap=document.getElementById('stars');
  for(let i=0;i<55;i++){
    const s=document.createElement('div');s.className='star';
    const sz=Math.random()<.3?3:2;
    s.style.cssText=`width:${sz}px;height:${sz}px;top:${Math.random()*65}%;left:${Math.random()*100}%;--dur:${1.2+Math.random()*2.2}s;animation-delay:${Math.random()*2}s;`;
    wrap.appendChild(s);
  }
})();

/* ── CLOCK ── */
function updateClock(){
  const now=new Date(),pad=n=>String(n).padStart(2,'0');
  document.getElementById('clock').textContent=pad(now.getHours())+':'+pad(now.getMinutes())+':'+pad(now.getSeconds());
  const days=['sun','mon','tue','wed','thu','fri','sat'];
  const months=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  document.getElementById('datedisp').textContent=days[now.getDay()]+' · '+months[now.getMonth()]+' '+now.getDate()+', '+now.getFullYear();
}
updateClock();setInterval(updateClock,1000);

/* ── LOGIN ── */
let currentUser=localStorage.getItem('lexalou-user')||null;
function loginAs(name){
  currentUser=name;
  localStorage.setItem('lexalou-user',name);
  document.getElementById('login-screen').style.display='none';
  document.getElementById('scene').style.display='block';
  document.getElementById('user-tag-name').textContent=name;
  document.getElementById('chat-bar-who').textContent=name+':';
  renderChat();
}
function switchUser(){
  localStorage.removeItem('lexalou-user');
  currentUser=null;
  document.getElementById('login-screen').style.display='flex';
  document.getElementById('scene').style.display='none';
}
if(currentUser){
  document.getElementById('login-screen').style.display='none';
  document.getElementById('scene').style.display='block';
  document.getElementById('user-tag-name').textContent=currentUser;
  document.getElementById('chat-bar-who').textContent=currentUser+':';
}

/* ── MUSIC ── */
function parseYouTubeUrl(url){
  // single video patterns
  const videoPatterns=[
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for(const p of videoPatterns){const m=url.match(p);if(m)return{type:'video',id:m[1]};}
  // playlist
  const pl=url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if(pl)return{type:'playlist',id:pl[1]};
  return null;
}
function loadPlaylist(){
  const val=document.getElementById('playlist-url').value.trim();
  if(!val)return;
  const info=parseYouTubeUrl(val);
  if(!info){alert('please paste a youtube song or playlist link ♥');return;}
  let src='';
  if(info.type==='video'){
    // also grab playlist if present in the same url
    const pl=val.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    src=`https://www.youtube-nocookie.com/embed/${info.id}?autoplay=1&rel=0&enablejsapi=1${pl?'&list='+pl[1]:''}`;
    localStorage.setItem('lexalou-music-src',src);
  } else {
    src=`https://www.youtube-nocookie.com/embed/videoseries?list=${info.id}&autoplay=1&rel=0&enablejsapi=1`;
    localStorage.setItem('lexalou-music-src',src);
  }
  document.getElementById('yt-frame').src=src;
}
document.getElementById('playlist-url').addEventListener('keydown',e=>{if(e.key==='Enter')loadPlaylist();});
// restore saved song/playlist
const savedSrc=localStorage.getItem('lexalou-music-src');
if(savedSrc) document.getElementById('yt-frame').src=savedSrc;

/* ── FLOATING CHAT ── */
let messages=JSON.parse(localStorage.getItem('lexalou-chat')||'[]');
if(!messages.length) messages=[
  {who:'lou',text:'hii baby studying? 🌙'},
  {who:'lexa',text:'yes!! almost done hehe ♥'},
  {who:'lou',text:'proud of u!! 🫶'},
];
function saveChat(){localStorage.setItem('lexalou-chat',JSON.stringify(messages));}
function escHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function renderChat(){
  const wrap=document.getElementById('chat-float');
  if(!wrap||!currentUser)return;
  wrap.innerHTML='';
  // show last 5 messages as floating bubbles
  const recent=messages.slice(-5);
  recent.forEach((m,i)=>{
    const isMe=m.who===currentUser;
    const div=document.createElement('div');
    div.className='float-msg '+(isMe?'me':'them');
    // stagger float animation per bubble
    const delay=(i*0.9).toFixed(1);
    const dur=(5+i*0.7).toFixed(1);
    div.style.cssText=`--fd:${dur}s;animation-delay:${delay}s;`;
    div.textContent=m.text;
    wrap.appendChild(div);
  });
}

function sendMsg(){
  if(!currentUser)return;
  const inp=document.getElementById('chat-input');
  const text=inp.value.trim();
  if(!text)return;
  messages.push({who:currentUser,text});
  if(messages.length>80)messages=messages.slice(-80);
  saveChat();renderChat();
  inp.value='';
}
document.getElementById('chat-input').addEventListener('keydown',e=>{if(e.key==='Enter')sendMsg();});

/* ── NOTES ── */
const notesEl=document.getElementById('notes');
notesEl.value=localStorage.getItem('lexalou-notes')||'';
notesEl.addEventListener('input',()=>localStorage.setItem('lexalou-notes',notesEl.value));

/* ── TODOS ── */
let todos=JSON.parse(localStorage.getItem('lexalou-todos')||'[]');
if(!todos.length)todos=[{text:'finish chapter 3',done:true},{text:'review notes',done:false},{text:'plan movie night',done:false}];
function saveTodos(){localStorage.setItem('lexalou-todos',JSON.stringify(todos));}
function renderTodos(){
  const ul=document.getElementById('todo-list');ul.innerHTML='';
  todos.forEach((t,i)=>{
    const li=document.createElement('li');li.className='todo-item';
    li.innerHTML=`<div class="todo-cb${t.done?' done':''}" onclick="toggleTodo(${i})"></div><span class="todo-text${t.done?' done':''}" onclick="toggleTodo(${i})">${escHtml(t.text)}</span><span onclick="removeTodo(${i})" style="color:rgba(220,130,255,.3);cursor:pointer;font-size:12px;font-weight:700;padding:0 2px;">×</span>`;
    ul.appendChild(li);
  });
}
function toggleTodo(i){todos[i].done=!todos[i].done;saveTodos();renderTodos();}
function removeTodo(i){todos.splice(i,1);saveTodos();renderTodos();}
function addTodo(){
  const inp=document.getElementById('todo-input'),val=inp.value.trim();
  if(!val)return;todos.push({text:val,done:false});inp.value='';saveTodos();renderTodos();
}
document.getElementById('todo-input').addEventListener('keydown',e=>{if(e.key==='Enter')addTodo();});
renderTodos();

/* ── STATUS ── */
function setStatus(s){
  document.querySelectorAll('.status-badge').forEach(b=>b.classList.remove('badge-active'));
  document.getElementById('badge-'+s).classList.add('badge-active');
}