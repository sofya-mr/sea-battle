!function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function s(t){t.forEach(e)}function o(t){return"function"==typeof t}function i(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}let c,r;function l(t,e){t.appendChild(e)}function a(t,e,n){t.insertBefore(e,n||null)}function u(t){t.parentNode.removeChild(t)}function h(t){return document.createElement(t)}function f(t){return document.createTextNode(t)}function d(){return f(" ")}function p(t,e,n,s){return t.addEventListener(e,n,s),()=>t.removeEventListener(e,n,s)}function m(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function g(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function $(t,e,n,s){null===n?t.style.removeProperty(e):t.style.setProperty(e,n,s?"important":"")}function k(t,e,n){t.classList[n?"add":"remove"](e)}function v(t){r=t}function y(){const t=function(){if(!r)throw new Error("Function called outside component initialization");return r}();return(e,n,{cancelable:s=!1}={})=>{const o=t.$$.callbacks[e];if(o){const i=function(t,e,{bubbles:n=!1,cancelable:s=!1}={}){const o=document.createEvent("CustomEvent");return o.initCustomEvent(t,n,s,e),o}(e,n,{cancelable:s});return o.slice().forEach((e=>{e.call(t,i)})),!i.defaultPrevented}return!0}}const b=[],x=[],S=[],L=[],w=Promise.resolve();let E=!1;function C(t){S.push(t)}const _=new Set;let M=0;function T(){const t=r;do{for(;M<b.length;){const t=b[M];M++,v(t),A(t.$$)}for(v(null),b.length=0,M=0;x.length;)x.pop()();for(let t=0;t<S.length;t+=1){const e=S[t];_.has(e)||(_.add(e),e())}S.length=0}while(b.length);for(;L.length;)L.pop()();E=!1,_.clear(),v(t)}function A(t){if(null!==t.fragment){t.update(),s(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(C)}}const D=new Set;function z(t,e){t&&t.i&&(D.delete(t),t.i(e))}function B(t,e,n,s){if(t&&t.o){if(D.has(t))return;D.add(t),undefined.c.push((()=>{D.delete(t),s&&(n&&t.d(1),s())})),t.o(e)}}function N(t){t&&t.c()}function O(t,n,i,c){const{fragment:r,on_mount:l,on_destroy:a,after_update:u}=t.$$;r&&r.m(n,i),c||C((()=>{const n=l.map(e).filter(o);a?a.push(...n):s(n),t.$$.on_mount=[]})),u.forEach(C)}function P(t,e){const n=t.$$;null!==n.fragment&&(s(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function j(t,e){-1===t.$$.dirty[0]&&(b.push(t),E||(E=!0,w.then(T)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function F(e,o,i,c,l,a,h,f=[-1]){const d=r;v(e);const p=e.$$={fragment:null,ctx:null,props:a,update:t,not_equal:l,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(o.context||(d?d.$$.context:[])),callbacks:n(),dirty:f,skip_bound:!1,root:o.target||d.$$.root};h&&h(p.root);let m=!1;if(p.ctx=i?i(e,o.props||{},((t,n,...s)=>{const o=s.length?s[0]:n;return p.ctx&&l(p.ctx[t],p.ctx[t]=o)&&(!p.skip_bound&&p.bound[t]&&p.bound[t](o),m&&j(e,t)),n})):[],p.update(),m=!0,s(p.before_update),p.fragment=!!c&&c(p.ctx),o.target){if(o.hydrate){const t=function(t){return Array.from(t.childNodes)}(o.target);p.fragment&&p.fragment.l(t),t.forEach(u)}else p.fragment&&p.fragment.c();o.intro&&z(e.$$.fragment),O(e,o.target,o.anchor,o.customElement),T()}v(d)}class U{$destroy(){P(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}function Y(t,e,n){const s=t.slice();return s[5]=e[n],s[7]=n,s}function q(t){let e,n,s;function o(){return t[3](t[7])}return{c(){e=h("button"),m(e,"class","svelte-1cecogh"),k(e,"checked",t[5].checked),k(e,"damaged",t[5].ship&&t[5].checked),k(e,"sunk",t[5].ship&&t[5].ship.isSunk),k(e,"sunkByMagic",t[5].ship&&2==t[5].ship.isSunk)},m(t,i){a(t,e,i),n||(s=p(e,"click",o),n=!0)},p(n,s){t=n,2&s&&k(e,"checked",t[5].checked),2&s&&k(e,"damaged",t[5].ship&&t[5].checked),2&s&&k(e,"sunk",t[5].ship&&t[5].ship.isSunk),2&s&&k(e,"sunkByMagic",t[5].ship&&2==t[5].ship.isSunk)},d(t){t&&u(e),n=!1,s()}}}function G(e){let n,s=e[1],o=[];for(let t=0;t<s.length;t+=1)o[t]=q(Y(e,s,t));return{c(){n=h("div");for(let t=0;t<o.length;t+=1)o[t].c();m(n,"class","container svelte-1cecogh"),$(n,"width",80*e[0]+"px")},m(t,e){a(t,n,e);for(let t=0;t<o.length;t+=1)o[t].m(n,null)},p(t,[e]){if(6&e){let i;for(s=t[1],i=0;i<s.length;i+=1){const c=Y(t,s,i);o[i]?o[i].p(c,e):(o[i]=q(c),o[i].c(),o[i].m(n,null))}for(;i<o.length;i+=1)o[i].d(1);o.length=s.length}1&e&&$(n,"width",80*t[0]+"px")},i:t,o:t,d(t){t&&u(n),function(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}(o,t)}}}function R(t,e,n){const s=y();let{fieldSize:o}=e,{cells:i}=e;function c(t){s("fire",t)}return t.$$set=t=>{"fieldSize"in t&&n(0,o=t.fieldSize),"cells"in t&&n(1,i=t.cells)},[o,i,c,t=>c(t)]}class H extends U{constructor(t){super(),F(this,t,R,G,i,{fieldSize:0,cells:1})}}function I(e){let n,s,o,i,c,r;return{c(){n=h("div"),s=h("h2"),s.textContent="You are the winner!",o=d(),i=h("button"),i.textContent="RESTART GAME",m(s,"class","svelte-vk0mpm"),m(i,"class","resettingButton svelte-vk0mpm"),m(n,"class","scaleContainer svelte-vk0mpm")},m(t,u){a(t,n,u),l(n,s),l(n,o),l(n,i),c||(r=p(i,"click",e[7]),c=!0)},p:t,d(t){t&&u(n),c=!1,r()}}}function J(t){let e,n,s,o,i,c,r,g,$,k,v,y;return{c(){e=h("div"),n=h("div"),n.textContent="The button will be activated when you gain enough power:",s=d(),o=h("div"),i=h("button"),c=f("Let magic unicorn help"),g=d(),$=h("div"),m(i,"class","magicButton svelte-vk0mpm"),i.disabled=r=t[4]<5,m($,"class",k="scale closer"+(t[4]<=5?t[4]:5)+" svelte-vk0mpm"),m(o,"class","scaleContainer svelte-vk0mpm")},m(r,u){a(r,e,u),l(e,n),l(e,s),l(e,o),l(o,i),l(i,c),l(o,g),l(o,$),v||(y=p(i,"click",t[6]),v=!0)},p(t,e){16&e&&r!==(r=t[4]<5)&&(i.disabled=r),16&e&&k!==(k="scale closer"+(t[4]<=5?t[4]:5)+" svelte-vk0mpm")&&m($,"class",k)},d(t){t&&u(e),v=!1,y()}}}function K(e){let n,s,o,i,c,r,p,$,k,v,y,b,x,S,L,w,E,C,_,M,T,A,D,z,B=e[5].length+"";function N(t,e){return t[0]!==t[5].length?J:I}let O=N(e),P=O(e);return{c(){n=h("div"),s=h("div"),o=h("div"),i=f("Number of ships: "),c=f(B),r=d(),p=h("br"),$=f("\n\t\t\tAttempts: "),k=f(e[3]),v=d(),y=h("br"),b=f("\n\t\t\tCells damage: "),x=f(e[1]),S=d(),L=h("br"),w=f("\n\t\t\tSunk ships: "),E=f(e[0]),C=d(),_=h("br"),M=f("\n\t\t\tShips left: "),T=f(e[2]),A=d(),D=h("br"),z=d(),P.c(),m(o,"class","stats svelte-vk0mpm"),m(s,"class","statsContainer svelte-vk0mpm"),m(n,"class","bottom svelte-vk0mpm")},m(t,e){a(t,n,e),l(n,s),l(s,o),l(o,i),l(o,c),l(o,r),l(o,p),l(o,$),l(o,k),l(o,v),l(o,y),l(o,b),l(o,x),l(o,S),l(o,L),l(o,w),l(o,E),l(o,C),l(o,_),l(o,M),l(o,T),l(o,A),l(o,D),l(n,z),P.m(n,null)},p(t,[e]){32&e&&B!==(B=t[5].length+"")&&g(c,B),8&e&&g(k,t[3]),2&e&&g(x,t[1]),1&e&&g(E,t[0]),4&e&&g(T,t[2]),O===(O=N(t))&&P?P.p(t,e):(P.d(1),P=O(t),P&&(P.c(),P.m(n,null)))},i:t,o:t,d(t){t&&u(n),P.d()}}}function Q(t,e,n){const s=y();let{sunkShips:o=0}=e,{damagedCells:i=0}=e,{shipsLeft:c=0}=e,{attempts:r=0}=e,{powerLevel:l=0}=e,{ships:a}=e;return t.$$set=t=>{"sunkShips"in t&&n(0,o=t.sunkShips),"damagedCells"in t&&n(1,i=t.damagedCells),"shipsLeft"in t&&n(2,c=t.shipsLeft),"attempts"in t&&n(3,r=t.attempts),"powerLevel"in t&&n(4,l=t.powerLevel),"ships"in t&&n(5,a=t.ships)},[o,i,c,r,l,a,function(){s("activateUnicorn")},function(){s("restart")}]}class V extends U{constructor(t){super(),F(this,t,Q,K,i,{sunkShips:0,damagedCells:1,shipsLeft:2,attempts:3,powerLevel:4,ships:5})}}const W=[{x:1,y:0},{x:0,y:1}];function X(t){let e,n,s,o,i,r,p,$,v,y,b;return $=new H({props:{fieldSize:Z,cells:t[8]}}),$.$on("fire",t[12]),y=new V({props:{sunkShips:t[0],damagedCells:t[2],shipsLeft:t[3],attempts:t[4],powerLevel:t[7],ships:t[1]}}),y.$on("activateUnicorn",t[10]),y.$on("restart",t[11]),{c(){var l,a;e=h("div"),n=h("img"),o=d(),i=h("p"),r=f(t[5]),p=d(),N($.$$.fragment),v=d(),N(y.$$.fragment),l=n.src,a=s="./unicorn.png",c||(c=document.createElement("a")),c.href=a,l!==c.href&&m(n,"src","./unicorn.png"),m(n,"alt","Unicorn Gif"),m(n,"class","image svelte-el0d9"),k(n,"fly",!t[6]),m(i,"class","svelte-el0d9")},m(t,s){a(t,e,s),l(e,n),a(t,o,s),a(t,i,s),l(i,r),a(t,p,s),O($,t,s),a(t,v,s),O(y,t,s),b=!0},p(t,[e]){64&e&&k(n,"fly",!t[6]),(!b||32&e)&&g(r,t[5]);const s={};256&e&&(s.cells=t[8]),$.$set(s);const o={};1&e&&(o.sunkShips=t[0]),4&e&&(o.damagedCells=t[2]),8&e&&(o.shipsLeft=t[3]),16&e&&(o.attempts=t[4]),128&e&&(o.powerLevel=t[7]),2&e&&(o.ships=t[1]),y.$set(o)},i(t){b||(z($.$$.fragment,t),z(y.$$.fragment,t),b=!0)},o(t){B($.$$.fragment,t),B(y.$$.fragment,t),b=!1},d(t){t&&u(e),t&&u(o),t&&u(i),t&&u(p),P($,t),t&&u(v),P(y,t)}}}const Z=6;function tt(t,e,n){let s,o,i=0,c=0,r=0,l=0,a="The Empire set it's ships in your sea. Find and sink them!",u="",h=!1,f=0,d=[],p=0;function m(t,e){p++,p>1e3&&alert("bad things happen");let i=W[Math.floor(2*Math.random())];if(e.x*i.x>Z-s[t].shipLength||e.y*i.y>Z-s[t].shipLength)return!1;for(let c=0;c<s[t].shipLength;c++){const r=e.x+e.y*Z;if(n(1,s[t].coords[c]=r,s),e={x:e.x+i.x,y:e.y+i.y},-1!==o.indexOf(r))return!1}return s[t].coords.forEach((e=>n(8,d[e].ship=s[t],d))),!0}const g=function(t){const e=t.x,n=t.y;return!(e>Z||e<0||n>Z||n<0)};function $(t){n(4,l+=1),n(5,a="Missed..."),d[t].ship&&(d[t].checked||(n(8,d[t].ship.cellDamage+=1,d),n(5,a="Hit!"),n(2,c+=1),n(7,f+=1),d[t].ship.cellDamage===d[t].ship.shipLength&&(n(8,d[t].ship.isSunk=!0,d),n(0,i+=1),n(3,r=s.length-i),n(5,a="You sunk a ship!"))),n(8,d)),n(8,d[t].checked=!0,d)}function k(){n(0,i=0),n(2,c=0),n(4,l=0),n(5,a="The Empire set it's ships in your sea. Find and sink them!"),n(6,h=!1),n(7,f=0),n(8,d=[]);for(let t=0;t<Z*Z;t++)d.push({ship:!1,checked:!1});o=[],n(1,s=[{shipLength:3,isSunk:!1,cellDamage:0,coords:[]},{shipLength:2,isSunk:!1,cellDamage:0,coords:[]},{shipLength:2,isSunk:!1,cellDamage:0,coords:[]},{shipLength:1,isSunk:!1,cellDamage:0,coords:[]},{shipLength:1,isSunk:!1,cellDamage:0,coords:[]}]),function(){for(let t=0;t<s.length;t++)m(t,{x:Math.floor(Math.random()*Z),y:Math.floor(Math.random()*Z)})?(o.push(...s[t].coords),s[t].coords.forEach((t=>{let e=Math.floor(t/Z),n=t%Z,s=[{x:n+1,y:e},{x:n-1,y:e},{x:n,y:e+1},{x:n,y:e-1},{x:n+1,y:e-1},{x:n+1,y:e+1},{x:n-1,y:e+1},{x:n-1,y:e-1}].filter(g).map((t=>t.x+t.y*Z));o.push(...s)}))):t--}()}k();return t.$$.update=()=>{3&t.$$.dirty&&i==s.length&&n(5,a="Congratulations! You won. All ships are sunk.")},[i,s,c,r,l,a,h,f,d,$,function(){n(6,h=!h),setTimeout((()=>{n(7,f=0)}),1e3),setTimeout((()=>{for(let t of s)if(0==t.isSunk){t.isSunk=2,n(0,i+=1),u=1==r?"There's":"There are",n(5,a=`Magic unicorn sunk a ship! ${u} only ${r} left.`),n(3,r=s.length-i),t.damagedCells=t.shipLength,n(2,c+=t.shipLength);for(let e=0;e<t.coords.length;e++)n(8,d[t.coords[e]].checked=!0,d);break}}),2e3)},k,t=>$(t.detail)]}new class extends U{constructor(t){super(),F(this,t,tt,X,i,{})}}({target:document.querySelector("#here"),props:{}})}();
//# sourceMappingURL=bundle.js.map
