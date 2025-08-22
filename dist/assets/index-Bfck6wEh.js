import{_ as D,b as O,n as j,S as F,p as N,a as P,c as U,s as T}from"./useQuery-BKOf-XZE.js";import{R as x,r as p}from"./index-BKjOfV5l.js";function q(){return{context:void 0,data:void 0,error:null,failureCount:0,isPaused:!1,status:"idle",variables:void 0}}var H=function(t){D(e,t);function e(i,a){var r;return r=t.call(this)||this,r.client=i,r.setOptions(a),r.bindMethods(),r.updateResult(),r}var s=e.prototype;return s.bindMethods=function(){this.mutate=this.mutate.bind(this),this.reset=this.reset.bind(this)},s.setOptions=function(a){this.options=this.client.defaultMutationOptions(a)},s.onUnsubscribe=function(){if(!this.listeners.length){var a;(a=this.currentMutation)==null||a.removeObserver(this)}},s.onMutationUpdate=function(a){this.updateResult();var r={listeners:!0};a.type==="success"?r.onSuccess=!0:a.type==="error"&&(r.onError=!0),this.notify(r)},s.getCurrentResult=function(){return this.currentResult},s.reset=function(){this.currentMutation=void 0,this.updateResult(),this.notify({listeners:!0})},s.mutate=function(a,r){return this.mutateOptions=r,this.currentMutation&&this.currentMutation.removeObserver(this),this.currentMutation=this.client.getMutationCache().build(this.client,O({},this.options,{variables:typeof a<"u"?a:this.options.variables})),this.currentMutation.addObserver(this),this.currentMutation.execute()},s.updateResult=function(){var a=this.currentMutation?this.currentMutation.state:q(),r=O({},a,{isLoading:a.status==="loading",isSuccess:a.status==="success",isError:a.status==="error",isIdle:a.status==="idle",mutate:this.mutate,reset:this.reset});this.currentResult=r},s.notify=function(a){var r=this;j.batch(function(){r.mutateOptions&&(a.onSuccess?(r.mutateOptions.onSuccess==null||r.mutateOptions.onSuccess(r.currentResult.data,r.currentResult.variables,r.currentResult.context),r.mutateOptions.onSettled==null||r.mutateOptions.onSettled(r.currentResult.data,null,r.currentResult.variables,r.currentResult.context)):a.onError&&(r.mutateOptions.onError==null||r.mutateOptions.onError(r.currentResult.error,r.currentResult.variables,r.currentResult.context),r.mutateOptions.onSettled==null||r.mutateOptions.onSettled(void 0,r.currentResult.error,r.currentResult.variables,r.currentResult.context))),a.listeners&&r.listeners.forEach(function(o){o(r.currentResult)})})},e}(F);function kt(t,e,s){var i=x.useRef(!1),a=x.useState(0),r=a[1],o=N(t,e,s),u=P(),n=x.useRef();n.current?n.current.setOptions(o):n.current=new H(u,o);var l=n.current.getCurrentResult();x.useEffect(function(){i.current=!0;var f=n.current.subscribe(j.batchCalls(function(){i.current&&r(function(m){return m+1})}));return function(){i.current=!1,f()}},[]);var d=x.useCallback(function(f,m){n.current.mutate(f,m).catch(U)},[]);if(l.error&&T(void 0,n.current.options.useErrorBoundary,[l.error]))throw l.error;return O({},l,{mutate:d,mutateAsync:l.mutate})}let Q={data:""},Z=t=>typeof window=="object"?((t?t.querySelector("#_goober"):window._goober)||Object.assign((t||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:t||Q,B=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,W=/\/\*[^]*?\*\/|  +/g,k=/\n+/g,g=(t,e)=>{let s="",i="",a="";for(let r in t){let o=t[r];r[0]=="@"?r[1]=="i"?s=r+" "+o+";":i+=r[1]=="f"?g(o,r):r+"{"+g(o,r[1]=="k"?"":e)+"}":typeof o=="object"?i+=g(o,e?e.replace(/([^,])+/g,u=>r.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,n=>/&/.test(n)?n.replace(/&/g,u):u?u+" "+n:n)):r):o!=null&&(r=/^--/.test(r)?r:r.replace(/[A-Z]/g,"-$&").toLowerCase(),a+=g.p?g.p(r,o):r+":"+o+";")}return s+(e&&a?e+"{"+a+"}":a)+i},h={},C=t=>{if(typeof t=="object"){let e="";for(let s in t)e+=s+C(t[s]);return e}return t},Y=(t,e,s,i,a)=>{let r=C(t),o=h[r]||(h[r]=(n=>{let l=0,d=11;for(;l<n.length;)d=101*d+n.charCodeAt(l++)>>>0;return"go"+d})(r));if(!h[o]){let n=r!==t?t:(l=>{let d,f,m=[{}];for(;d=B.exec(l.replace(W,""));)d[4]?m.shift():d[3]?(f=d[3].replace(k," ").trim(),m.unshift(m[0][f]=m[0][f]||{})):m[0][d[1]]=d[2].replace(k," ").trim();return m[0]})(t);h[o]=g(a?{["@keyframes "+o]:n}:n,s?"":"."+o)}let u=s&&h.g?h.g:null;return s&&(h.g=h[o]),((n,l,d,f)=>{f?l.data=l.data.replace(f,n):l.data.indexOf(n)===-1&&(l.data=d?n+l.data:l.data+n)})(h[o],e,i,u),o},G=(t,e,s)=>t.reduce((i,a,r)=>{let o=e[r];if(o&&o.call){let u=o(s),n=u&&u.props&&u.props.className||/^go/.test(u)&&u;o=n?"."+n:u&&typeof u=="object"?u.props?"":g(u,""):u===!1?"":u}return i+a+(o??"")},"");function R(t){let e=this||{},s=t.call?t(e.p):t;return Y(s.unshift?s.raw?G(s,[].slice.call(arguments,1),e.p):s.reduce((i,a)=>Object.assign(i,a&&a.call?a(e.p):a),{}):s,Z(e.target),e.g,e.o,e.k)}let A,E,$;R.bind({g:1});let b=R.bind({k:1});function J(t,e,s,i){g.p=e,A=t,E=s,$=i}function y(t,e){let s=this||{};return function(){let i=arguments;function a(r,o){let u=Object.assign({},r),n=u.className||a.className;s.p=Object.assign({theme:E&&E()},u),s.o=/ *go\d+/.test(n),u.className=R.apply(s,i)+(n?" "+n:"");let l=t;return t[0]&&(l=u.as||t,delete u.as),$&&l[0]&&$(u),A(l,u)}return a}}var K=t=>typeof t=="function",M=(t,e)=>K(t)?t(e):t,V=(()=>{let t=0;return()=>(++t).toString()})(),X=(()=>{let t;return()=>{if(t===void 0&&typeof window<"u"){let e=matchMedia("(prefers-reduced-motion: reduce)");t=!e||e.matches}return t}})(),tt=20,_="default",z=(t,e)=>{let{toastLimit:s}=t.settings;switch(e.type){case 0:return{...t,toasts:[e.toast,...t.toasts].slice(0,s)};case 1:return{...t,toasts:t.toasts.map(o=>o.id===e.toast.id?{...o,...e.toast}:o)};case 2:let{toast:i}=e;return z(t,{type:t.toasts.find(o=>o.id===i.id)?1:0,toast:i});case 3:let{toastId:a}=e;return{...t,toasts:t.toasts.map(o=>o.id===a||a===void 0?{...o,dismissed:!0,visible:!1}:o)};case 4:return e.toastId===void 0?{...t,toasts:[]}:{...t,toasts:t.toasts.filter(o=>o.id!==e.toastId)};case 5:return{...t,pausedAt:e.time};case 6:let r=e.time-(t.pausedAt||0);return{...t,pausedAt:void 0,toasts:t.toasts.map(o=>({...o,pauseDuration:o.pauseDuration+r}))}}},et=[],rt={toasts:[],pausedAt:void 0,settings:{toastLimit:tt}},v={},I=(t,e=_)=>{v[e]=z(v[e]||rt,t),et.forEach(([s,i])=>{s===e&&i(v[e])})},L=t=>Object.keys(v).forEach(e=>I(t,e)),st=t=>Object.keys(v).find(e=>v[e].toasts.some(s=>s.id===t)),S=(t=_)=>e=>{I(e,t)},at=(t,e="blank",s)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:e,ariaProps:{role:"status","aria-live":"polite"},message:t,pauseDuration:0,...s,id:(s==null?void 0:s.id)||V()}),w=t=>(e,s)=>{let i=at(e,t,s);return S(i.toasterId||st(i.id))({type:2,toast:i}),i.id},c=(t,e)=>w("blank")(t,e);c.error=w("error");c.success=w("success");c.loading=w("loading");c.custom=w("custom");c.dismiss=(t,e)=>{let s={type:3,toastId:t};e?S(e)(s):L(s)};c.dismissAll=t=>c.dismiss(void 0,t);c.remove=(t,e)=>{let s={type:4,toastId:t};e?S(e)(s):L(s)};c.removeAll=t=>c.remove(void 0,t);c.promise=(t,e,s)=>{let i=c.loading(e.loading,{...s,...s==null?void 0:s.loading});return typeof t=="function"&&(t=t()),t.then(a=>{let r=e.success?M(e.success,a):void 0;return r?c.success(r,{id:i,...s,...s==null?void 0:s.success}):c.dismiss(i),a}).catch(a=>{let r=e.error?M(e.error,a):void 0;r?c.error(r,{id:i,...s,...s==null?void 0:s.error}):c.dismiss(i)}),t};var it=b`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,ot=b`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,nt=b`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,ut=y("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${t=>t.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${it} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${ot} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${t=>t.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${nt} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,lt=b`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,ct=y("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${t=>t.secondary||"#e0e0e0"};
  border-right-color: ${t=>t.primary||"#616161"};
  animation: ${lt} 1s linear infinite;
`,dt=b`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,pt=b`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,ft=y("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${t=>t.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${dt} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${pt} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${t=>t.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,mt=y("div")`
  position: absolute;
`,ht=y("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,bt=b`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,gt=y("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${bt} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,yt=({toast:t})=>{let{icon:e,type:s,iconTheme:i}=t;return e!==void 0?typeof e=="string"?p.createElement(gt,null,e):e:s==="blank"?null:p.createElement(ht,null,p.createElement(ct,{...i}),s!=="loading"&&p.createElement(mt,null,s==="error"?p.createElement(ut,{...i}):p.createElement(ft,{...i})))},vt=t=>`
0% {transform: translate3d(0,${t*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,xt=t=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${t*-150}%,-1px) scale(.6); opacity:0;}
`,wt="0%{opacity:0;} 100%{opacity:1;}",Rt="0%{opacity:1;} 100%{opacity:0;}",Ot=y("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,Et=y("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,$t=(t,e)=>{let s=t.includes("top")?1:-1,[i,a]=X()?[wt,Rt]:[vt(s),xt(s)];return{animation:e?`${b(i)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${b(a)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}};p.memo(({toast:t,position:e,style:s,children:i})=>{let a=t.height?$t(t.position||e||"top-center",t.visible):{opacity:0},r=p.createElement(yt,{toast:t}),o=p.createElement(Et,{...t.ariaProps},M(t.message,t));return p.createElement(Ot,{className:t.className,style:{...a,...s,...t.style}},typeof i=="function"?i({icon:r,message:o}):p.createElement(p.Fragment,null,r,o))});J(p.createElement);R`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;export{c as n,kt as u};
