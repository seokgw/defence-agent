import assert from 'node:assert/strict';
import {pathToFileURL,fileURLToPath} from 'node:url';
const app=fileURLToPath(new URL('../',import.meta.url));
class Element {
 constructor(tag){this.tagName=tag;this.children=[];this.attrs={};this.listeners={};this._text='';}
 set textContent(v){this._text=String(v);this.children=[];}
 get textContent(){return this._text+this.children.map(c=>typeof c==='string'?c:c.textContent).join(' ');}
 append(...items){this.children.push(...items);}
 prepend(...items){this.children.unshift(...items);}
 setAttribute(k,v){this.attrs[k]=String(v);}
 addEventListener(k,v){this.listeners[k]=v;}
 focus(){document.activeElement=this;}
}
let current;
const find=(root,predicate)=>!root?null:predicate(root)?root:root.children?.map(c=>find(c,predicate)).find(Boolean);
globalThis.document={body:new Element('body'),activeElement:null,createElement:tag=>new Element(tag),getElementById:id=>find(current,n=>n.id===id)};
document.activeElement=document.body;
globalThis.setTimeout=()=>1; globalThis.clearTimeout=()=>{};
const {createStudentView}=await import(pathToFileURL(app+'/student/extension.mjs'));
const input={mode:'disconnected',devices:{status:'error',mode:'disconnected',error:{message:'연결 없음'}},sessions:{status:'error',mode:'disconnected',error:{message:'연결 없음'}},notifications:[],diagnostics:{status:'idle'}};
const fixture=()=>({ok:true,data:{schema:'aleph.on.pc-status.v1',source:'local-pc',measuredAt:new Date().toISOString(),metrics:{cpu:{state:'ok',usagePercent:42,sampleMs:200},memory:{state:'ok',usedBytes:4*1073741824,totalBytes:8*1073741824},disk:{state:'ok',freeBytes:50*1073741824,totalBytes:100*1073741824},network:{state:'ok',interfaceCount:1,ipv4Count:1},firewall:{state:'unavailable',reason:'permission_denied'},events:{state:'unavailable',reason:'timeout'}}}});
let calls=0,response=fixture();
const view=createStudentView({api:{get:async path=>{assert.equal(path,'/api/pc/status');calls++;return response;}},onChange:()=>{current=view.renderStatus(input);}});
current=view.renderStatus(input); assert.equal(calls,0); assert.match(current.textContent,/조회前|조회 전/);
const refresh=()=>find(current,n=>n.id==='codex-pc-refresh').listeners.click();
await refresh(); assert.equal(calls,1); assert.match(current.textContent,/42.0%/); assert.match(current.textContent,/4\/6/); assert.match(current.textContent,/SDP 미연결/); assert.match(current.textContent,/Windows 기록: 확인 불가/);
response=fixture();response.data.metrics.cpu.usagePercent=30;await refresh();assert.match(current.textContent,/-12.0%p/);
response={ok:false,error:{code:'TIMEOUT'}};await refresh();assert.match(current.textContent,/PC_REQUEST_FAILED/);
const dashboard=current.children[0],cards=find(dashboard,n=>n.className==='grid-2');assert.equal(cards.children[0].children[1].textContent,'확인 불가');assert.match(current.textContent,/과거 성공 응답/);
response=fixture();response.data.source='example';await refresh();assert.match(current.textContent,/PC_SHAPE_UNVERIFIED/);
response=fixture();response.data.measuredAt=new Date(Date.now()-61000).toISOString();await refresh();assert.match(current.textContent,/오래된 측정/);
response={ok:false,error:{code:'NOT_ALLOWED'}};await refresh();assert.match(current.textContent,/지원 없음/);
response=fixture();response.data.metrics.cpu.usagePercent=101;await refresh();assert.equal(find(current.children[0],n=>n.className==='grid-2').children[0].children[1].textContent,'확인 불가');
let release,pendingCalls=0;const pending=new Promise(resolve=>release=resolve);
const concurrent=createStudentView({api:{get:()=>{pendingCalls++;return pending;}},onChange:()=>{}});
const root=concurrent.renderStatus(input);const click=find(root,n=>n.id==='codex-pc-refresh').listeners.click;const first=click();await click();assert.equal(pendingCalls,1);release(fixture());await first;
assert.deepEqual(Object.keys(view).sort(), ['renderIdentity','renderDecision','renderEvents','renderStatus','renderAiConnection','renderExplanation','renderAction','renderVulnerabilities'].sort());
console.log('PASS: manual-only, actual-contract metrics, unknown values, history comparison, failure clears current values, invalid source, stale, unsupported, out-of-range, concurrent guard, eight renderers available');
