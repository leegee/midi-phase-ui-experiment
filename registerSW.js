if(!self.define){let e,n={};const s=(s,i)=>(s=new URL(s+".js",i).href,n[s]||new Promise((n=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=n,document.head.appendChild(e)}else e=s,importScripts(s),n()})).then((()=>{let e=n[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(i,t)=>{const r=e||("document"in self?document.currentScript.src:"")||location.href;if(n[r])return;let o={};const l=e=>s(e,r),d={module:{uri:r},exports:o,require:l};n[r]=Promise.all(i.map((e=>d[e]||l(e)))).then((e=>(t(...e),o)))}}define(["./workbox-b994f779"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index-CxkzGWzr.js",revision:null},{url:"assets/index.css",revision:null},{url:"index.html",revision:"df4398d5480bf0d37a6efd8b7ccd8821"},{url:"manifest.webmanifest",revision:"f0a6675f5af2149fead08564d1a009a5"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html"))),e.registerRoute(/\.(?:png|svg)$/,new e.CacheFirst({cacheName:"images-cache",plugins:[new e.ExpirationPlugin({maxEntries:50,maxAgeSeconds:2592e3})]}),"GET")}));
//# sourceMappingURL=registerSW.js.map
