const $ = id => document.getElementById(id);
const paths = {
  scan:'M8 3H4a1 1 0 0 0-1 1v4m13-5h4a1 1 0 0 1 1 1v4M3 16v4a1 1 0 0 0 1 1h4m8 0h4a1 1 0 0 0 1-1v-4M7 12h10',
  ticket:'M4 5h16v5a2 2 0 0 0 0 4v5H4v-5a2 2 0 0 0 0-4V5Zm11 0v3m0 3v2m0 3v3',
  keyboard:'M3 5h18v14H3V5Zm4 4h.01M11 9h.01M15 9h.01M18 9h.01M7 12h.01M11 12h.01M15 12h.01M18 12h.01M7 16h10',
  video:'M3 5h12v14H3V5Zm12 5 6-4v12l-6-4',
  link:'m10 13 4-4m-6 6-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 2 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0',
  expand:'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5',play:'m9 5 11 7-11 7V5Z',pause:'M7 5h3v14H7V5Zm7 0h3v14h-3V5Z',
  back:'M4 9a8 8 0 1 1 0 6M4 4v5h5m2 1h4l-1 3h-3v3h4',forward:'M20 9a8 8 0 1 0 0 6m0-11v5h-5m-6 1h4l-1 3H9v3h4',
  volume:'M4 9h4l5-4v14l-5-4H4V9Zm13-1a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14',
  mute:'M4 9h4l5-4v14l-5-4H4V9Zm13 0 5 6m0-6-5 6',plus:'M12 5v14M5 12h14',
  filter:'M4 6h16M7 12h10m-7 6h4',prev:'M7 5v14m11-14-8 7 8 7V5Z',next:'M17 5v14M6 5l8 7-8 7V5Z',
  arrow:'M4 12h16m-6-6 6 6-6 6',sparkles:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z',
  close:'m6 6 12 12M6 18 18 6',scissors:'M8 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm0 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM7 8l14 12M7 16 21 4',
  file:'M5 3h9l5 5v13H5V3Zm9 0v6h5M8 13h8m-8 4h6',upload:'M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5',
  info:'M12 16v-5m0-4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',check:'m5 12 4 4L19 6',
  alert:'m12 3 10 17H2L12 3Zm0 6v5m0 3h.01',download:'M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4'
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.info}"/></svg>`;
function icons(root=document){root.querySelectorAll('i[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));}
icons();
const escapeHtml = s => String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = (n,decimal=false) => {n=Math.max(0,Number(n)||0);return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(Math.floor(n%60)).padStart(2,'0')}${decimal?'.'+Math.floor(n%1*10):''}`;};
const types = [
  {name:'材质错误',color:'#e7b76c'}, {name:'视频卡顿',color:'#d58e8c',global:true},
  {name:'口型丢失',color:'#a49bd4'}, {name:'全局模糊',color:'#86adc4',global:true},
  {name:'口型模糊',color:'#b099c7'}, {name:'角色组件丢失',color:'#c695b7'},
  {name:'多语言漏key',color:'#87b6aa'}, {name:'穿模',color:'#dc9278'},
  {name:'浮空',color:'#a4b67b'}, {name:'整体过曝过暗',color:'#c2ae78',global:true},
  {name:'局部过曝过暗',color:'#a8b1cd'}, {name:'蒙皮错误–面部构建丢失',color:'#b092aa'},
  {name:'蒙皮错误–全身错误',color:'#82a9a0'}
];
// Seeded intervals illustrate the review flow. They are not detector output.
const seeds = [
  [7,.035,.092,'角色服饰与身体疑似穿插','角色移动时，衣物边缘与身体出现交叠。请结合前后画面判断是否为穿模。',[.29,.45,.12,.36],96],
  [0,.17,.205,'角色表面材质显示异常','局部材质色彩与相邻区域不一致，建议确认是否为材质加载异常。',[.38,.25,.15,.24],92],
  [1,.245,.265,'视频出现短时停顿','检测到连续画面变化量偏低，请确认是否为预期的静止画面。',null,89],
  [2,.32,.355,'对话过程中疑似未显示口型','对白期间嘴部区域变化不足，需结合语音与表情人工确认。',[.43,.26,.09,.12],87],
  [9,.415,.455,'整体画面亮度偏低','整体亮度低于演示阈值。可能与场景光照或过场效果有关，需人工确认。',null,94],
  [7,.49,.525,'角色动作中出现疑似穿模','服饰与身体轮廓出现交叠，请回看该动作前后的变化。',[.55,.31,.17,.3],93],
  [3,.56,.59,'整体画面清晰度下降','画面整体细节减少，请确认是否为镜头景深、动态模糊或异常渲染。',null,88],
  [6,.635,.67,'文本区域疑似出现未解析 key','疑似本地化 key 直接显示在画面中，请核对当前语言及文本内容。',[.2,.79,.6,.1],97],
  [8,.705,.74,'角色脚部疑似离地','脚部与地面之间存在间隙，请确认是否属于跳跃或预期动画。',[.44,.6,.18,.22],85],
  [4,.765,.795,'角色口型区域模糊','嘴部细节清晰度偏低，请检查角色近景表现。',[.44,.27,.1,.13],86],
  [5,.82,.845,'角色组件疑似缺失','角色局部组件与相邻帧表现不一致，请核对是否存在可见性切换。',[.55,.2,.2,.28],91],
  [10,.87,.895,'局部区域疑似过曝','该区域亮度相对周围明显偏高，请确认是否为预期光效。',[.63,.2,.2,.3],90],
  [11,.915,.935,'面部构建疑似异常','面部局部构建表现不连续，建议检查绑定与动画状态。',[.43,.2,.13,.2],89],
  [12,.95,.975,'全身蒙皮疑似异常','角色身体轮廓存在异常拉伸，建议检查当前动作的蒙皮表现。',[.35,.2,.28,.61],93],
  [0,.625,.65,'局部材质颜色不一致','局部材质颜色发生突变，请核对是否为正常的场景光照变化。',[.66,.3,.14,.25],86],
  [1,.875,.888,'疑似短时卡顿','连续画面变化量下降，请结合角色和镜头运动判断。',null,84]
];
let saved={};
try {saved=JSON.parse(localStorage.getItem('qa-pages-demo-v1')||'{}');}catch{}
let tickets=Array.isArray(saved.tickets)?saved.tickets:[];
let reviews=saved.reviews||{},decisions={},watched=new Set();
let recordingName='',recordingKey='',recordingUrl='',recordingFile=null;
let recordingQueue=[],queueIndex=-1;
let sidebarView='current',latestTicketId=null;
let editingTicket=null,editingEvidence=null,clipDuration=0;
const reportContext=window.REVIEW_REPORT||null;
const handledStatuses=new Set(['reported','ignored','false_positive','dismissed']);
const isHandled=decision=>handledStatuses.has(decision?.status);
let issues=[],duration=0,activeKey='',selectedIssue=null,clipPoint=0,padding=2,clipStart=0,clipEnd=0;
let priorTime=null,shownTypes=new Set(types.map((_,i)=>i)),returnFocus=null,wasPlaying=false,saving=false;
let logFile=null,attachments=[],toastTimeout,previewing=false;
const video=$('video'),clipVideo=$('clipVideo');
function persist(reviewUpdates={}){
  try{
    const latest=JSON.parse(localStorage.getItem('qa-pages-demo-v1')||'{}');
    reviews={...reviews,...latest.reviews,...reviewUpdates};
    if(recordingKey)reviews[recordingKey]={decisions,watched:[...watched]};
    tickets=[...new Map([...(latest.tickets||[]),...tickets,...(latest.tickets||[]).filter(t=>t.cancelledAt)].map(ticket=>[ticket.id,ticket])).values()];
    localStorage.setItem('qa-pages-demo-v1',JSON.stringify({tickets,reviews}));persistReportProgress();
  }
  catch{toast('浏览器存储空间不足，当前更改仅在本次页面中保留。');}
}
function toast(message){clearTimeout(toastTimeout);$('toast').textContent=message;$('toast').hidden=false;toastTimeout=setTimeout(()=>$('toast').hidden=true,4200);}
function updateCounts(){
  renderBugSidebar();
  updateProgress();
}
function activeIssues(){return issues.filter(x=>shownTypes.has(x.type)&&video.currentTime>=x.start&&video.currentTime<x.end);}
function makeIssues(){
  duration=Number.isFinite(video.duration)?video.duration:0;
  if(!duration){toast('无法读取视频时长，请更换一个文件。');return;}
  $('localVideoPrompt').hidden=true;$('centerPlay').hidden=false;
  $('createBug').disabled=false;$('scrubber').disabled=false;$('playButton').disabled=false;
  $('emptyState').querySelector('h3').textContent='当前画面暂无疑似问题';
  const entry=recordingQueue[queueIndex];
  const matching=reportContext?seeds.filter(x=>reportContext.checks.includes(types[x[0]].name)):seeds;
  const pool=matching.length?matching:seeds;
  const detectionSeeds=reportContext&&reportContext.demoDataset!=='full-demo-v1'?Array.from({length:entry.findingCount},(_,i)=>{const x=[...pool[i%pool.length]];const start=.025+i/Math.max(1,entry.findingCount)*.94;x[1]=start;x[2]=Math.min(.995,start+Math.min(.04,.7/Math.max(1,entry.findingCount)));return x;}):seeds;
  issues=detectionSeeds.map((x,i)=>({id:reportContext?.demoDataset==='full-demo-v1'?`demo-v1-${i+1}`:`finding-${i+1}`,type:x[0],start:duration*x[1],end:duration*x[2],title:x[3],description:x[4],box:x[5],confidence:x[6]})).sort((a,b)=>a.start-b.start);
  $('metaDuration').textContent=fmt(duration);$('totalTime').textContent=fmt(duration);
  $('resolution').textContent=`${video.videoWidth} × ${video.videoHeight}`;
  $('scrubber').max=duration;
  renderTracks();renderCurrent(true);updateCounts();updateProgress();fitVideo();
}
function renderTracks(){
  $('ruler').innerHTML=Array.from({length:7},(_,i)=>`<span style="left:${i/6*100}%">${fmt(duration*i/6)}</span>`).join('');
  $('trackRows').innerHTML=types.map((t,i)=>{
    if(!shownTypes.has(i))return '';
    const group=issues.filter(x=>x.type===i);
    return `<div class="track-row"><div class="track-label" title="${t.name}"><span class="track-dot" style="background:${t.color}"></span><span class="track-name">${t.name}</span><span class="track-count">${group.length}</span></div><div class="track-lane" data-lane="${i}" aria-label="${t.name}时间轴">${group.map(x=>`<button class="track-segment ${isHandled(decisions[x.id])?'handled':''}" data-issue="${x.id}" style="left:${x.start/duration*100}%;width:${(x.end-x.start)/duration*100}%;--issue-color:${t.color}" title="${t.name} ${fmt(x.start,true)}–${fmt(x.end,true)} · ${x.title}" aria-label="${t.name} ${fmt(x.start)} 跳转"></button>`).join('')}</div></div>`;
  }).join('');
  $('typeFilters').innerHTML=types.map((t,i)=>`<label><input type="checkbox" data-type="${i}" ${shownTypes.has(i)?'checked':''}>${t.name}</label>`).join('');
  $('filterCount').textContent=shownTypes.size;
  updatePlayhead();
}
function updatePlayhead(){
  const ruler=$('ruler'),width=ruler.clientWidth;
  $('playhead').style.left=`${ruler.offsetLeft+(duration?video.currentTime/duration*width:0)}px`;
  $('playheadTime').textContent=fmt(video.currentTime,true);
  $('playhead').setAttribute('aria-valuemax',String(duration));
  $('playhead').setAttribute('aria-valuenow',String(video.currentTime));
  $('playhead').setAttribute('aria-valuetext',fmt(video.currentTime,true));
  document.querySelectorAll('.track-segment').forEach(el=>{
    const x=issues.find(a=>a.id===el.dataset.issue);el.classList.toggle('is-current',video.currentTime>=x.start&&video.currentTime<x.end);
  });
}
function fitVideo(){
  const stage=$('videoStage'),canvas=$('videoCanvas');
  if(!video.videoWidth)return;
  const s=Math.min(stage.clientWidth/video.videoWidth,stage.clientHeight/video.videoHeight);
  canvas.style.width=`${video.videoWidth*s}px`;canvas.style.height=`${video.videoHeight*s}px`;
}
function renderCurrent(force=false){
  const current=activeIssues();
  const key=current.map(x=>x.id+':'+(decisions[x.id]?.status||'')).join('|')+'|'+$('showMarks').checked+'|'+shownTypes.size;
  $('detailTime').textContent=fmt(video.currentTime,true);
  if(!force&&key===activeKey){renderFrameBugs();return;}activeKey=key;
  $('emptyState').hidden=current.length>0;
  $('currentSummary').textContent=current.length?`${current.length} 处疑似问题 · 与当前播放时间同步`:'随视频播放，同步展示疑似问题';
  const next=issues.find(x=>x.start>video.currentTime&&shownTypes.has(x.type)&&!isHandled(decisions[x.id]));
  $('jumpFirst').disabled=!next;$('jumpFirst').textContent=next?'跳转到下一处问题 →':'已无后续未处理问题';
  $('currentIssues').innerHTML=current.map(x=>{
    const t=types[x.type],d=decisions[x.id];
    const ticket=tickets.find(ticket=>ticket.id===d?.ticketId&&!ticket.cancelledAt);
    return `<article class="issue-card" style="--issue-color:${t.color}"><div class="issue-card-head"><span class="type-tag">${icon(t.global?'alert':'scan')}${t.name}</span></div><h3>${escapeHtml(ticket?.title||x.title)}</h3><p class="issue-description">${x.description}</p><div class="issue-metrics"><span>${fmt(x.start,true)} — ${fmt(x.end,true)}</span><span>${(x.end-x.start).toFixed(1)} 秒</span></div><div class="issue-context">${icon(t.global?'expand':'scan')}${t.global?'全画面检测 · 不显示局部框选':'局部检测 · 画面框选与时间同步'}</div>${isHandled(d)?`<div class="handled-state"><span>${icon('check')} ${d.status==='reported'?'已确认 Bug':d.status==='ignored'?'已跳过':'已标记误报'}</span>${d.status==='reported'&&ticket?`<button data-ticket-action="edit" data-id="${escapeHtml(d.ticketId)}">编辑</button>`:''}<button data-undo="${x.id}">撤销</button></div>`:`<div class="issue-actions"><button class="button confirm" data-report="${x.id}">${icon('plus')}确认并提单</button><button class="button subtle" data-dismiss="${x.id}">误报</button><button class="button subtle" data-ignore="${x.id}">跳过</button></div>`}</article>`;
  }).join('')+(current.length&&next?`<div class="nearby-heading">接下来</div><button class="next-card" data-jump="${next.id}"><span>${types[next.type].name}<small>${fmt(next.start)} · 点击跳转</small></span>${icon('arrow')}</button>`:'');
  const visible=$('showMarks').checked?current.filter(x=>!['dismissed','ignored','false_positive'].includes(decisions[x.id]?.status)):[];
  $('annotations').innerHTML=visible.filter(x=>x.box).map(x=>`<button class="annotation-box" data-box="${x.id}" style="left:${x.box[0]*100}%;top:${x.box[1]*100}%;width:${x.box[2]*100}%;height:${x.box[3]*100}%;--issue-color:${types[x.type].color}" aria-label="${types[x.type].name}，查看问题"><span>${types[x.type].name} · 疑似</span></button>`).join('');
  const globals=visible.filter(x=>types[x.type].global);
  $('globalAlert').hidden=!globals.length;
  renderFrameBugs();
  $('globalAlert').innerHTML=globals.map(x=>`${icon('alert')}${types[x.type].name} · 全画面疑似问题`).join('　')+(globals.length?'<button class="hide-marks" data-hide-marks title="隐藏所有画面标注，可按 H 恢复" aria-label="隐藏画面标注">×</button>':'');
}
function seek(time){
  if(!duration)return;
  priorTime=null;video.currentTime=Math.max(0,Math.min(duration,time));
  $('currentTime').textContent=fmt(video.currentTime);$('scrubber').value=video.currentTime;
  $('scrubber').style.background=`linear-gradient(to right,#eebc67 ${video.currentTime/duration*100}%,#393b45 ${video.currentTime/duration*100}%)`;
  renderCurrent(true);updatePlayhead();
}
function jumpIssue(direction=1){
  const list=issues.filter(x=>shownTypes.has(x.type));
  const current=list.find(x=>video.currentTime>=x.start&&video.currentTime<x.end);
  const pivot=current?current.start:video.currentTime;
  const target=direction>0?list.find(x=>x.start>pivot+.001):list.slice().reverse().find(x=>x.start<pivot-.001);
  if(target)seek(target.start+.04);else toast(direction>0?'已是最后一处问题':'已是第一处问题');
}
async function togglePlay(){if(!duration){$('localVideoInput').click();return;}if(video.paused){try{await video.play();}catch{toast('暂时无法播放，请稍后重试。');}}else video.pause();}
function syncPlayback(){
  $('playButton').innerHTML=icon(video.paused?'play':'pause');$('playButton').setAttribute('aria-label',video.paused?'播放':'暂停');
  $('centerPlay').hidden=!duration||!video.paused;$('playingStatus').textContent=video.ended?'播放结束':video.paused?'已暂停':'播放中';
  if(video.paused){priorTime=null;persist();}
}
function updateProgress(){
  const handled=issues.filter(x=>isHandled(decisions[x.id])).length,total=issues.length;
  const pct=total?handled/total*100:0;
  $('reviewPercent').innerHTML=`${handled}<span> / ${total}</span>`;
  $('reviewProgress').style.width=`${pct}%`;
  const counts=status=>issues.filter(x=>decisions[x.id]?.status===status).length;
  $('reviewCoverage').textContent=`确认 Bug ${counts('reported')} · 跳过 ${counts('ignored')} · 误报 ${counts('false_positive')+counts('dismissed')}`;
}
function persistReportProgress(){
  if(!reportContext||!recordingQueue.length)return;
  const storageKey='qa-report-progress:'+reportContext.id+(reportContext.demoDataset?':'+reportContext.demoDataset:'');
  let progress={};try{progress=JSON.parse(localStorage.getItem(storageKey)||'{}');}catch{}
  progress.videos=progress.videos||{};
  if(recordingKey&&issues.length===recordingQueue[queueIndex]?.findingCount){
    progress.videos[recordingQueue[queueIndex].id]={handled:issues.filter(x=>isHandled(decisions[x.id])).length,total:issues.length};
  }
  progress.handled=recordingQueue.reduce((sum,e)=>sum+(progress.videos[e.id]?.handled||0),0);
  progress.total=recordingQueue.reduce((sum,e)=>sum+e.findingCount,0);
  progress.complete=recordingQueue.every(e=>progress.videos[e.id]?.handled===e.findingCount);
  progress.updatedAt=new Date().toISOString();
  localStorage.setItem(storageKey,JSON.stringify(progress));
}
video.addEventListener('loadedmetadata',makeIssues);
video.addEventListener('timeupdate',()=>{
  const t=video.currentTime;
  if(!video.paused&&!video.seeking&&priorTime!==null&&t>=priorTime&&t-priorTime<1.3){
    for(let n=Math.floor(priorTime*4);n<Math.floor(t*4);n++)watched.add(n);
  }
  priorTime=video.paused?null:t;
  $('currentTime').textContent=fmt(t);$('scrubber').value=t;
  $('scrubber').style.background=`linear-gradient(to right,#eebc67 ${t/duration*100}%,#393b45 ${t/duration*100}%)`;
  renderCurrent();updatePlayhead();
});
video.addEventListener('seeking',()=>priorTime=null);
video.addEventListener('seeked',()=>{priorTime=video.currentTime;renderCurrent(true);});
video.addEventListener('play',syncPlayback);video.addEventListener('pause',syncPlayback);video.addEventListener('ended',syncPlayback);
video.addEventListener('error',()=>{if(recordingUrl)$('videoError').hidden=false;});
$('retryVideo').onclick=()=>{$('localVideoInput').click();};
$('playButton').onclick=togglePlay;$('centerPlay').onclick=togglePlay;video.onclick=togglePlay;
$('backButton').onclick=()=>seek(video.currentTime-5);$('forwardButton').onclick=()=>seek(video.currentTime+5);
$('scrubber').oninput=e=>seek(Number(e.target.value));
$('speedSelect').onchange=e=>video.playbackRate=Number(e.target.value);
$('muteButton').onclick=()=>{video.muted=!video.muted;$('muteButton').innerHTML=icon(video.muted?'mute':'volume');$('muteButton').setAttribute('aria-label',video.muted?'取消静音':'静音');};
function syncMarks(){
  const shown=$('showMarks').checked;
  $('fullscreenMarks').innerHTML=(shown?'隐藏标注':'显示标注')+' <kbd>H</kbd>';
  $('fullscreenMarks').setAttribute('aria-pressed',String(shown));
  renderCurrent(true);
}
function toggleMarks(){ $('showMarks').checked=!$('showMarks').checked;syncMarks(); }
$('showMarks').onchange=syncMarks;
$('fullscreenMarks').onclick=toggleMarks;
$('globalAlert').onclick=e=>{if(e.target.closest('[data-hide-marks]')){$('showMarks').checked=false;syncMarks();}};
$('fullscreenButton').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('videoStage').requestFullscreen();}catch{toast('当前浏览器暂不支持全屏。');}};
new ResizeObserver(()=>{fitVideo();updatePlayhead();}).observe($('videoStage'));
$('previousIssue').onclick=()=>jumpIssue(-1);$('nextIssue').onclick=()=>jumpIssue(1);$('jumpFirst').onclick=()=>jumpIssue(1);
$('trackRows').onclick=e=>{
  const segment=e.target.closest('[data-issue]');if(segment){const x=issues.find(x=>x.id===segment.dataset.issue);seek(x.start+.04);return;}
  const lane=e.target.closest('[data-lane]');if(lane){const rect=lane.getBoundingClientRect();seek((e.clientX-rect.left)/rect.width*duration);}
};
// Pointer capture keeps dragging active even when the pointer leaves the timeline.
let timelineDrag=null;
function seekFromPointer(event){
  const rect=$('ruler').getBoundingClientRect();
  if(rect.width&&duration)seek((event.clientX-rect.left)/rect.width*duration);
}
function finishTimelineDrag(event){
  if(!timelineDrag||(event.pointerId!==undefined&&event.pointerId!==timelineDrag.id))return;
  const drag=timelineDrag;timelineDrag=null;
  $('playhead').classList.remove('dragging');
  if(drag.element.hasPointerCapture(drag.id))drag.element.releasePointerCapture(drag.id);
  if(drag.resume&&video.currentTime<duration)video.play().catch(()=>toast('请点击播放继续。'));
}
for(const element of [$('playhead'),$('ruler')]){
  element.addEventListener('pointerdown',event=>{
    if(!duration||event.button!==0||timelineDrag)return;
    event.preventDefault();event.stopPropagation();
    timelineDrag={id:event.pointerId,element,resume:!video.paused};
    video.pause();priorTime=null;
    element.setPointerCapture(event.pointerId);
    $('playhead').classList.add('dragging');
    seekFromPointer(event);
  });
  element.addEventListener('pointermove',event=>{
    if(timelineDrag?.id===event.pointerId){event.preventDefault();seekFromPointer(event);}
  });
  element.addEventListener('pointerup',event=>{
    if(timelineDrag?.id===event.pointerId)seekFromPointer(event);
    finishTimelineDrag(event);
  });
  element.addEventListener('pointercancel',finishTimelineDrag);
  element.addEventListener('lostpointercapture',finishTimelineDrag);
  element.addEventListener('click',event=>event.stopPropagation());
}
window.addEventListener('blur',()=>finishTimelineDrag({}));
$('filterButton').onclick=()=>{$('filterPopover').hidden=!$('filterPopover').hidden;};
$('typeFilters').onchange=e=>{const i=Number(e.target.dataset.type);e.target.checked?shownTypes.add(i):shownTypes.delete(i);renderTracks();renderCurrent(true);};
$('selectAllTypes').onclick=()=>{shownTypes=shownTypes.size?new Set():new Set(types.map((_,i)=>i));renderTracks();renderCurrent(true);};
document.addEventListener('click',e=>{if(!e.target.closest('#filterPopover')&&!e.target.closest('#filterButton'))$('filterPopover').hidden=true;});
$('currentIssues').onclick=e=>{
  if(e.target.closest('[data-ticket-action]')){handleTicketAction(e);return;}
  const report=e.target.closest('[data-report]'),dismiss=e.target.closest('[data-dismiss]'),ignore=e.target.closest('[data-ignore]'),undo=e.target.closest('[data-undo]'),jump=e.target.closest('[data-jump]');
  if(report)openBug(issues.find(x=>x.id===report.dataset.report));
  if(dismiss||ignore){const id=dismiss?dismiss.dataset.dismiss:ignore.dataset.ignore;if(!issues.some(x=>x.id===id))return;decisions[id]={status:dismiss?'false_positive':'ignored'};persist();renderCurrent(true);renderTracks();updateCounts();toast(dismiss?'已标记误报，计入已处理；可撤销。':'已跳过，计入已处理；可撤销。');}
  if(undo)undoFinding(undo.dataset.undo);
  if(jump)seek(issues.find(x=>x.id===jump.dataset.jump).start+.04);
};
$('annotations').onclick=e=>{const b=e.target.closest('[data-box]');if(b){video.pause();const x=issues.find(x=>x.id===b.dataset.box);toast(`${types[x.type].name}：请在右侧查看详情或确认提单。`);}};
$('bugType').innerHTML=types.map((t,i)=>`<option value="${i}">${t.name}</option>`).join('')+'<option value="-1">其他 / 人工发现</option>';
function openBug(issue){
  if(saving)return;
  if(!duration){toast('请先选择本地录屏，待加载完成后再提单。');return;}
  returnFocus=document.activeElement;wasPlaying=!video.paused;video.pause();
  editingTicket=null;editingEvidence=null;clipDuration=duration;clipVideo.src=recordingUrl;
  selectedIssue=issue||null;
  $('drawerTitle').textContent=selectedIssue?'确认检测问题':'人工新建 Bug';
  clipPoint=video.currentTime;padding=2;previewing=false;attachments=[];
  $('bugForm').reset();$('attachmentList').innerHTML='';
  $('bugOverlay').querySelector('[data-recording-name]').textContent=recordingName;
  $('qaName').value=tickets.at(-1)?.qa||'';
  $('bugTitle').value=selectedIssue?selectedIssue.title:'';
  $('bugType').value=selectedIssue?selectedIssue.type:-1;
  $('notes').value=selectedIssue?`发生时间：${fmt(clipPoint,true)}\n${selectedIssue.description}`:'';
  $('logName').textContent=logFile?.name||'demo.log';$('logNote').textContent=logFile?'用户关联日志':'演示日志 · 可在关联文件中替换';
  $('bugOverlay').hidden=false;document.body.style.overflow='hidden';updateClip();
  setTimeout(()=>$('bugTitle').focus(),100);
}
function updateClip(){
  clipStart=Math.max(0,clipPoint-padding);clipEnd=Math.min(clipDuration||duration,clipPoint+padding);
  $('clipRange').textContent=`${fmt(clipStart,true)} — ${fmt(clipEnd,true)}`;
  $('clipLength').textContent=`共 ${(clipEnd-clipStart).toFixed(1)} 秒 · 自动关联原录屏`;
  $('evidenceRange').textContent=`片段 ${fmt(clipStart,true)}–${fmt(clipEnd,true)} · 问题点 ${fmt(clipPoint,true)}`;
  document.querySelectorAll('[data-padding]').forEach(b=>b.classList.toggle('selected',Number(b.dataset.padding)===padding));
  clipVideo.pause();clipVideo.currentTime=clipPoint;previewing=false;$('previewClip').innerHTML=icon('play')+'预览片段';
}
function closeBug(resume=true){
  if(saving)return;
  clipVideo.pause();previewing=false;$('bugOverlay').hidden=true;document.body.style.overflow='';
  if(resume&&wasPlaying)video.play().catch(()=>{});
  clipVideo.src=recordingUrl;editingTicket=null;editingEvidence=null;
  returnFocus?.focus();
}
$('createBug').onclick=()=>openBug();$('closeBug').onclick=()=>closeBug();$('cancelBug').onclick=()=>closeBug();
$('clipPadding').onclick=e=>{const b=e.target.closest('[data-padding]');if(b){padding=Number(b.dataset.padding);updateClip();}};
$('previewClip').onclick=async()=>{
  if(previewing){clipVideo.pause();previewing=false;$('previewClip').innerHTML=icon('play')+'预览片段';return;}
  clipVideo.currentTime=clipStart;previewing=true;
  try{await clipVideo.play();$('previewClip').innerHTML=icon('pause')+'暂停预览';}catch{previewing=false;toast('片段预览暂时无法播放。');}
};
clipVideo.addEventListener('timeupdate',()=>{if(previewing&&clipVideo.currentTime>=clipEnd){clipVideo.pause();clipVideo.currentTime=clipEnd;previewing=false;$('previewClip').innerHTML=icon('play')+'重播片段';}});
$('attachments').onchange=e=>{
  const files=[...e.target.files];
  if(files.some(x=>!x.type.startsWith('image/')&&!x.type.startsWith('video/'))){toast('仅支持图片和视频附件。');return;}
  attachments.push(...files);renderAttachments();e.target.value='';
};
function renderAttachments(){$('attachmentList').innerHTML=attachments.map((f,i)=>`<div><span>${escapeHtml(f.name)} · ${(f.size/1024/1024).toFixed(1)} MB</span><button type="button" data-remove="${i}" aria-label="移除 ${escapeHtml(f.name)}">×</button></div>`).join('');}
$('attachmentList').onclick=e=>{if(e.target.dataset.remove!==undefined){attachments.splice(Number(e.target.dataset.remove),1);renderAttachments();}};
function evidenceDB(){
  return new Promise((resolve,reject)=>{const request=indexedDB.open('qa-pages-review-evidence',1);request.onupgradeneeded=()=>request.result.createObjectStore('evidence');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
}
async function putEvidence(id,value){const db=await evidenceDB();return new Promise((resolve,reject)=>{const tx=db.transaction('evidence','readwrite');tx.objectStore('evidence').put(value,id);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>{db.close();reject(tx.error);};});}
async function getEvidence(id){const db=await evidenceDB();return new Promise((resolve,reject)=>{const tx=db.transaction('evidence');const req=tx.objectStore('evidence').get(id);req.onsuccess=()=>{db.close();resolve(req.result);};req.onerror=()=>{db.close();reject(req.error);};});}
function screenshot(){
  const c=document.createElement('canvas');c.width=video.videoWidth;c.height=video.videoHeight;c.getContext('2d').drawImage(video,0,0);
  return new Promise(resolve=>c.toBlob(resolve,'image/jpeg',.9));
}
$('bugForm').onsubmit=async e=>{
  e.preventDefault();if(saving)return;
  const button=e.submitter||$('bugForm').querySelector('[type=submit]');button.disabled=true;
  const title=$('bugTitle').value.trim(),qa=$('qaName').value.trim();
  if(!title||!qa){toast('请填写问题标题和审核人。');button.disabled=false;return;}
  saving=true;
  if(editingTicket){
    try{
      const updated={...editingTicket,title,qa,priority:$('priority').value,acceptance:$('acceptance').value,notes:$('notes').value.trim(),type:Number($('bugType').value)>=0?types[Number($('bugType').value)].name:'其他 / 人工发现',clip:{...editingTicket.clip,start:clipStart,end:clipEnd,padding},attachments:attachments.map(f=>({name:f.name,size:f.size,type:f.type})),updatedAt:new Date().toISOString()};
      await putEvidence(updated.id,{...editingEvidence,attachments:[...attachments]});
      tickets=tickets.map(t=>t.id===updated.id?updated:t);persist();updateCounts();renderCurrent(true);
      saving=false;closeBug();toast('Bug 已更新。');
    }catch{toast('修改保存失败，请重试。');}
    finally{button.disabled=false;saving=false;}
    return;
  }
  const id=`DEMO-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
  const ticket={id,title,source:selectedIssue?'detected':'manual',submissionStatus:'recorded',type:Number($('bugType').value)>=0?types[Number($('bugType').value)].name:'其他 / 人工发现',priority:$('priority').value,qa,acceptance:$('acceptance').value,notes:$('notes').value.trim(),recording:recordingName,recordingKey,recordingDuration:duration,reportId:reportContext?.id||null,reportName:reportContext?.name||null,log:logFile?.name||'demo.log',demoLog:!logFile,point:clipPoint,clip:{start:clipStart,end:clipEnd,padding,kind:'source_time_range'},findingId:selectedIssue?.id||null,attachments:attachments.map(f=>({name:f.name,size:f.size,type:f.type})),createdAt:new Date().toISOString(),demo:true};
  try{
    const shot=await screenshot();
    const fallbackLog=new Blob([`DEMO LOG — 示例数据，非真实测试日志\nRecording: ${recordingName}\nEvent point: ${clipPoint.toFixed(3)}s\nClip: ${clipStart.toFixed(3)}s – ${clipEnd.toFixed(3)}s\nType: ${ticket.type}\n`],{type:'text/plain'});
    await putEvidence(id,{screenshot:shot,log:logFile||fallbackLog,attachments});
    tickets.push(ticket);latestTicketId=id;if(selectedIssue)decisions[selectedIssue.id]={status:'reported',ticketId:id};
    persist();updateCounts();renderTracks();renderCurrent(true);saving=false;closeBug();
    toast(`Bug 已记录，可编辑或撤销。${wasPlaying?' 已继续播放。':''}`);
  }catch(err){toast('证据保存失败，请检查浏览器可用存储空间后重试。');}
  finally{button.disabled=false;saving=false;}
};
function openModal(title,content){
  if(!$('bugOverlay').hidden)return;
  returnFocus=document.activeElement;video.pause();$('modalTitle').textContent=title;$('modalContent').innerHTML=content;
  $('modalOverlay').hidden=false;document.body.style.overflow='hidden';$('closeModal').focus();
}
function closeModal(){$('modalOverlay').hidden=true;document.body.style.overflow='';returnFocus?.focus();}
$('closeModal').onclick=closeModal;
$('modalOverlay').onclick=e=>{if(e.target===$('modalOverlay'))closeModal();};
function showHelp(){openModal('快捷键，让回看更顺手',`<div class="shortcut-list"><span>播放 / 暂停</span><kbd>Space</kbd><span>上一个 / 下一个疑似问题</span><div><kbd>←</kbd> <kbd>→</kbd></div><span>后退 / 前进 5 秒</span><div><kbd>[</kbd> <kbd>]</kbd></div><span>显示 / 隐藏画面标注</span><kbd>H</kbd><span>当前位置快捷提单</span><kbd>B</kbd><span>保存 Bug</span><kbd>⌘ / Ctrl + Enter</kbd><span>关闭弹窗或提单面板</span><kbd>Esc</kbd></div><p class="modal-caption">填写表单时，播放快捷键会自动停用。保存后会在右侧显示已记录的 Bug。</p>`);}
$('helpButton').onclick=showHelp;$('helpFooter').onclick=showHelp;
function showResources(){
  openModal('关联文件',`<div class="resource-card">${icon('video')}<div><strong>${escapeHtml(recordingName||'尚未选择录屏')}</strong><p>当前录屏 · ${fmt(duration)} · 所有问题单自动关联</p></div><button class="button" id="changeLocalVideo">更换录屏</button></div><div class="resource-card">${icon('file')}<div><strong id="resourceLogName">${escapeHtml(logFile?.name||'demo.log')}</strong><p id="resourceLogNote">${logFile?'已关联用户日志':'演示日志占位，非原始测试日志'}</p></div><label class="button" for="logUpload">关联真实日志</label><input id="logUpload" type="file" accept=".log,.txt,.zip,.json" hidden></div><p class="modal-caption">新增问题单会关联当前日志，并保存一份本地证据副本。关联日志不会更改已经生成的问题单。</p>`);
  $('changeLocalVideo').onclick=()=>{closeModal();$('localVideoInput').click();};
  $('logUpload').disabled=!recordingKey;
  $('logUpload').onchange=async e=>{const file=e.target.files[0];if(!file)return;const key=recordingKey;try{await putEvidence('log:'+key,file);if(key!==recordingKey)return;logFile=file;$('resourceLogName').textContent=file.name;$('resourceLogNote').textContent='已关联用户日志';toast('日志已关联并保存在本地。');}catch{toast('日志保存失败，请重试。');}};
}
$('resourcesButton').onclick=showResources;
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
async function handleEvidenceAction(e){
  const exp=e.target.closest('[data-export]'),ev=e.target.closest('[data-evidence]'),dl=e.target.closest('[data-download]');
  if(exp){const t=tickets.find(x=>x.id===exp.dataset.export);download(new Blob([JSON.stringify(t,null,2)],{type:'application/json'}),`${t.id}.json`);toast('问题单已导出为 JSON。');}
  if(ev){
    const t=tickets.find(x=>x.id===ev.dataset.evidence);
    try{const data=await getEvidence(t.id);if(!data){toast('未找到本地证据。');return;}
    openModal(`${t.id} · 关联证据`,`<div class="resource-card">${icon('scan')}<div><strong>问题点截图</strong><p>${fmt(t.point,true)} · 原始视频帧</p></div><button class="button" data-download="${t.id}" data-kind="screenshot">下载截图</button></div><div class="resource-card">${icon('file')}<div><strong>${escapeHtml(t.log)}</strong><p>${t.demoLog?'演示日志':'用户关联日志'}</p></div><button class="button" data-download="${t.id}" data-kind="log">下载日志</button></div>${t.attachments.map((f,i)=>`<div class="resource-card">${icon('file')}<div><strong>${escapeHtml(f.name)}</strong><p>补充附件</p></div><button class="button" data-download="${t.id}" data-kind="${i}">下载</button></div>`).join('')}<p class="modal-caption">视频片段使用原录屏起止时间引用，可在编辑抽屉中预览。演示版未将录屏转码为独立片段文件。</p>`);
    }catch{toast('读取本地证据失败。');}
  }
  if(dl){try{const t=tickets.find(x=>x.id===dl.dataset.download),d=await getEvidence(t.id),k=dl.dataset.kind;if(k==='screenshot')download(d.screenshot,`${t.id}.jpg`);else if(k==='log')download(d.log,t.log);else download(d.attachments[Number(k)],t.attachments[Number(k)].name);}catch{toast('读取证据失败，请检查浏览器存储。');}}
}
$('modalContent').onclick=handleEvidenceAction;
document.addEventListener('keydown',e=>{
  const bugOpen=!$('bugOverlay').hidden,modalOpen=!$('modalOverlay').hidden;
  if(e.key==='Escape'){if(bugOpen)closeBug();else if(modalOpen)closeModal();else $('filterPopover').hidden=true;return;}
  if(e.key==='Tab'&&(bugOpen||modalOpen)){
    const root=bugOpen?$('bugOverlay'):$('modalOverlay');
    const els=[...root.querySelectorAll('button:not(:disabled),input:not([type=hidden]),select,textarea,a[href]')].filter(x=>x.getClientRects().length);
    if(e.shiftKey&&document.activeElement===els[0]){e.preventDefault();els.at(-1).focus();}
    else if(!e.shiftKey&&document.activeElement===els.at(-1)){e.preventDefault();els[0].focus();}return;
  }
  if(bugOpen&&e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();$('bugForm').requestSubmit();return;}
  if(bugOpen||modalOpen||e.target.matches('input:not([type=range]),textarea,select,[contenteditable=true]')||e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.repeat)return;
  if(e.code==='Space'){e.preventDefault();togglePlay();}
  if(e.key==='ArrowLeft'){e.preventDefault();jumpIssue(-1);}
  if(e.key==='ArrowRight'){e.preventDefault();jumpIssue(1);}
  if(e.key.toLowerCase()==='b'){e.preventDefault();openBug();}
  if(e.key==='['){e.preventDefault();seek(video.currentTime-5);}
  if(e.key===']'){e.preventDefault();seek(video.currentTime+5);}
  if(e.key.toLowerCase()==='h'){e.preventDefault();toggleMarks();}
});
window.addEventListener('beforeunload',persist);
document.addEventListener('visibilitychange',()=>{if(document.hidden)persist();});

updateCounts();renderTracks();renderCurrent(true);
function syncQueue(){
  $('queueNavigator').hidden=!recordingQueue.length;
  $('queuePosition').textContent=`${queueIndex+1} / ${recordingQueue.length}`;
  $('videoQueue').innerHTML=recordingQueue.map((entry,i)=>`<option value="${i}" ${i===queueIndex?'selected':''}>${i+1}. ${escapeHtml(entry.name)}</option>`).join('');
  const next=recordingQueue[queueIndex+1];
  $('queueHint').textContent=next?`下一段：${next.name}`:'已到队列末尾，可继续添加录屏';
  $('nextVideo').title=next?`保存当前记录，切换至 ${next.name}`:'选择更多本地录屏，继续审核';
  $('chooseVideo').textContent=reportContext?'替换当前录屏':recordingQueue.length?'添加录屏':'选择本地录屏';
  $('nextVideo').disabled=!!reportContext&&!next;
  $('nextVideo').textContent=reportContext&&!next?'已是最后一个视频':'下一个视频 →';
  if(reportContext&&!next)$('queueHint').textContent='已是本报告最后一个视频，可从队列返回其他视频';
}
async function loadRecording(index){
  const entry=recordingQueue[index];if(!entry)return;
  video.pause();clipVideo.pause();persist();
  const oldUrl=recordingUrl;
  queueIndex=index;
  recordingFile=entry.file||null;recordingName=entry.name;recordingKey=entry.key;
  const review=reviews[recordingKey]||{};decisions=review.decisions||{};watched=new Set(review.watched||[]);
  logFile=null;issues=[];duration=0;priorTime=null;activeKey='';selectedIssue=null;
  $('createBug').disabled=true;$('scrubber').disabled=true;$('playButton').disabled=true;
  $('centerPlay').hidden=true;$('localVideoPrompt').hidden=true;$('videoError').hidden=true;
  $('metaDuration').textContent='正在读取';$('resolution').textContent='正在读取';$('currentTime').textContent='00:00';$('totalTime').textContent='00:00';
  $('scrubber').value=0;$('scrubber').style.background='#393b45';
  document.querySelectorAll('[data-recording-name]').forEach(el=>el.textContent=recordingName);
  recordingUrl=entry.file?URL.createObjectURL(entry.file):entry.url;
  video.src=recordingUrl;clipVideo.src=recordingUrl;
  video.load();clipVideo.load();
  video.playbackRate=Number($('speedSelect').value)||1;
  if(oldUrl?.startsWith('blob:'))URL.revokeObjectURL(oldUrl);
  renderTracks();renderCurrent(true);updateCounts();updateProgress();syncPlayback();syncQueue();renderBugSidebar();
  if(reportContext)$('reportSourceNote').textContent=entry.file?`当前视频源：${entry.file.name} · 检测结果为演示数据`:'演示使用 sample.mp4，非该报告的原始录屏；可替换当前录屏。';
  const key=recordingKey;
  try{const log=await getEvidence('log:'+key);if(key===recordingKey)logFile=log||null;}catch{}
}
function addRecordings(files){
  const valid=[...files].filter(file=>file.type.startsWith('video/')||/\.(mp4|mov|webm|m4v)$/i.test(file.name));
  if(!valid.length){if(files.length)toast('请选择视频文件。');return;}
  if(reportContext){recordingQueue[queueIndex].file=valid[0];loadRecording(queueIndex);toast('已替换当前视频源，文件仅在本机读取。');return;}
  let first=-1;
  for(const file of valid){
    const key=JSON.stringify([file.name,file.size,file.lastModified]);
    let index=recordingQueue.findIndex(entry=>entry.key===key);
    if(index<0){index=recordingQueue.length;recordingQueue.push({file,name:file.name,key});}
    if(first<0)first=index;
  }
  loadRecording(first);
  toast(`已加入视频队列 · 共 ${recordingQueue.length} 段，文件仅在本机读取。`);
}
$('chooseVideo').onclick=$('chooseVideoCenter').onclick=()=>$('localVideoInput').click();
$('localVideoInput').onchange=event=>{
  const files=[...event.target.files];event.target.value='';addRecordings(files);
};
$('videoQueue').onchange=event=>loadRecording(Number(event.target.value));
$('nextVideo').onclick=()=>{
  if(recordingQueue[queueIndex+1])loadRecording(queueIndex+1);
  else $('localVideoInput').click();
};
syncQueue();

function scopedTickets(){
  return tickets.filter(t=>!t.cancelledAt&&(reportContext?t.reportId===reportContext.id:!t.reportId&&recordingQueue.some(entry=>entry.key===t.recordingKey)));
}
function bugCard(t){
  return `<article class="bug-review-card ${latestTicketId===t.id?'just-added':''}" data-ticket-id="${escapeHtml(t.id)}"><div class="bug-card-top"><span class="bug-status">${t.findingId?'已确认 Bug':'已记录'}</span><span>${escapeHtml(t.priority)}</span></div><h3>${escapeHtml(t.title)}</h3><p class="bug-card-source">${escapeHtml(t.recording)} · ${fmt(t.point,true)}</p><p class="bug-card-type">${t.source==='manual'||!t.findingId?'人工发现':'检测确认'} · ${escapeHtml(t.type)} · ${escapeHtml(t.qa)}</p><div class="bug-card-actions"><button data-ticket-action="edit" data-id="${escapeHtml(t.id)}">编辑</button><button data-ticket-action="undo" data-id="${escapeHtml(t.id)}">撤销</button></div></article>`;
}
function renderFrameBugs(){
  const list=scopedTickets().filter(t=>t.recordingKey===recordingKey&&video.currentTime>=t.clip.start&&video.currentTime<=t.clip.end&&!activeIssues().some(x=>decisions[x.id]?.ticketId===t.id));
  $('frameBugs').innerHTML=list.map(bugCard).join('');
  $('emptyState').hidden=activeIssues().length>0||list.length>0;
}
function renderBugSidebar(){
  const list=scopedTickets();
  $('ticketCount').textContent=list.length;
  $('allBugsList').innerHTML=list.slice().reverse().map(bugCard).join('')||'<div class="empty-state"><h3>还没有记录 Bug</h3><p>确认检测问题或按 B 手动记录后，Bug 会显示在这里。</p></div>';
  $('bugListScope').textContent=reportContext?'本报告全部视频 · 按记录时间排列':'当前视频队列 · 按记录时间排列';
  renderFrameBugs();
}
function setSidebarView(view){
  sidebarView=view;
  $('currentPane').hidden=view!=='current';$('allBugsPane').hidden=view!=='all';
  $('currentTab').setAttribute('aria-selected',String(view==='current'));$('allBugsTab').setAttribute('aria-selected',String(view==='all'));
  $('currentSummary').hidden=view==='all';
  renderBugSidebar();
}
function undoFinding(id){
  if(saving)return;
  const decision=decisions[id];
  if(decision?.status==='reported'){
    const ticket=tickets.find(t=>t.id===decision.ticketId&&!t.cancelledAt);
    if(ticket){undoTicket(ticket);return;}
  }
  delete decisions[id];persist();renderCurrent(true);renderTracks();updateCounts();
  toast('已撤销，问题恢复为待处理。');
}
function undoTicket(t){
  if(saving)return;
  // Keep a tombstone so merging browser tabs cannot resurrect an undone Bug.
  t.cancelledAt=new Date().toISOString();
  let latest={};try{latest=JSON.parse(localStorage.getItem('qa-pages-demo-v1')||'{}');}catch{}
  const review=t.recordingKey===recordingKey?{decisions,watched:[...watched]}:(latest.reviews?.[t.recordingKey]||reviews[t.recordingKey]||{decisions:{},watched:[]});
  if(review.decisions[t.findingId]?.ticketId===t.id)delete review.decisions[t.findingId];
  persist({[t.recordingKey]:review});renderCurrent(true);renderTracks();updateCounts();
  toast(t.findingId?'已撤销 Bug，检测问题恢复为待处理。':'已撤销人工 Bug。');
}
async function editTicket(t){
  if(saving||!$('bugOverlay').hidden)return;
  let evidence;
  try{evidence=await getEvidence(t.id);if(!evidence)throw new Error('Missing evidence');}
  catch{toast('无法读取这条 Bug 的本地证据，请在原浏览器中编辑。');return;}
  if(!$('bugOverlay').hidden||t.cancelledAt)return;
  returnFocus=document.activeElement;wasPlaying=!video.paused;video.pause();
  editingTicket=t;editingEvidence=evidence;selectedIssue=null;
  clipPoint=t.point;padding=t.clip.padding||2;clipStart=t.clip.start;clipEnd=t.clip.end;
  const entry=recordingQueue.find(x=>x.key===t.recordingKey);
  clipVideo.src=t.recordingKey===recordingKey?recordingUrl:(entry?.url||'');
  if(entry?.file&&t.recordingKey!==recordingKey){
    const url=URL.createObjectURL(entry.file);clipVideo.src=url;
    clipVideo.addEventListener('loadedmetadata',()=>URL.revokeObjectURL(url),{once:true});
  }
  clipDuration=t.recordingKey===recordingKey?duration:(t.recordingDuration||t.clip.end);
  $('bugForm').reset();$('drawerTitle').textContent='编辑 Bug';
  $('bugTitle').value=t.title;$('qaName').value=t.qa;$('bugType').value=types.findIndex(x=>x.name===t.type);
  $('priority').value=t.priority;$('acceptance').value=t.acceptance;$('notes').value=t.notes||'';
  attachments=[...(evidence.attachments||[])];renderAttachments();
  $('logName').textContent=t.log;$('logNote').textContent=t.demoLog?'演示日志':'已保存的关联日志';
  $('bugOverlay').querySelector('[data-recording-name]').textContent=t.recording;
  $('bugOverlay').hidden=false;document.body.style.overflow='hidden';updateClip();
  $('bugTitle').focus();
}
clipVideo.addEventListener('loadedmetadata',()=>{
  if(editingTicket&&Number.isFinite(clipVideo.duration)){clipDuration=clipVideo.duration;updateClip();}
});
async function handleTicketAction(e){
  const button=e.target.closest('[data-ticket-action]');if(!button)return;
  const t=scopedTickets().find(t=>t.id===button.dataset.id);if(!t)return;
  const action=button.dataset.ticketAction;
  if(action==='undo')undoTicket(t);
  if(action==='edit')editTicket(t);
}
$('currentTab').onclick=()=>setSidebarView('current');$('allBugsTab').onclick=()=>setSidebarView('all');
$('allBugsList').onclick=$('frameBugs').onclick=handleTicketAction;
for(const tab of [$('currentTab'),$('allBugsTab')])tab.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();e.stopPropagation();const all=tab.id==='currentTab';setSidebarView(all?'all':'current');$(all?'allBugsTab':'currentTab').focus();}};
