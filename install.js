/* BeeHonest install button.
   Any element with [data-install] becomes an install trigger:
   - Android / desktop Chromium: opens the native install prompt
   - iPhone / iPad: shows a short "Add to Home Screen" hint (iOS has no install API)
   - already installed or unsupported browser: stays hidden
   Text inside [data-install-label] is translated; BeeInstall.setLang("en"|"pl") switches it. */
(function(){
  var TEXT={
    en:{label:"Install app",title:"Install BeeHonest",
        s1:"Tap the Share button",s2:"Choose “Add to Home Screen”",s3:"Tap “Add”",
        close:"Got it"},
    pl:{label:"Zainstaluj aplikację",title:"Zainstaluj BeeHonest",
        s1:"Dotknij przycisku Udostępnij",s2:"Wybierz „Do ekranu początkowego”",s3:"Dotknij „Dodaj”",
        close:"Jasne"}
  };
  var SHARE_ICON='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3"/><path d="M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';

  var lang="en",deferred=null,sheet=null;
  var ua=navigator.userAgent||"";
  var isIOS=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
  function isStandalone(){
    return (window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches)||navigator.standalone===true;
  }

  var css=document.createElement("style");
  css.textContent=
    "[data-install][hidden]{display:none!important}"+
    ".bi-overlay{position:fixed;inset:0;z-index:1000;background:rgba(26,26,46,.55);display:flex;align-items:flex-end;justify-content:center;"+
      "padding:16px 16px calc(16px + env(safe-area-inset-bottom,0px));opacity:0;transition:opacity .2s;font-family:'Nunito',system-ui,sans-serif}"+
    ".bi-overlay.show{opacity:1}"+
    ".bi-sheet{width:100%;max-width:400px;background:#FFF8F0;color:#1a1a2e;border:3px solid #1a1a2e;border-radius:22px;"+
      "box-shadow:5px 5px 0 #1a1a2e;padding:22px 20px 18px;transform:translateY(24px);transition:transform .25s cubic-bezier(.3,0,.2,1.2);text-align:left}"+
    ".bi-overlay.show .bi-sheet{transform:translateY(0)}"+
    ".bi-title{font-size:1.2rem;font-weight:900;margin:0 0 14px}"+
    ".bi-steps{list-style:none;margin:0 0 18px;padding:0;display:flex;flex-direction:column;gap:10px}"+
    ".bi-steps li{display:flex;align-items:center;gap:12px;font-size:15px;font-weight:800;line-height:1.3}"+
    ".bi-num{flex:0 0 30px;height:30px;border-radius:50%;background:#FFD93D;border:3px solid #1a1a2e;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900}"+
    ".bi-steps svg{flex:0 0 auto;vertical-align:middle}"+
    ".bi-close{width:100%;background:#FF6B6B;color:#fff;border:3px solid #1a1a2e;border-radius:14px;padding:13px;font-size:15px;font-weight:900;"+
      "font-family:inherit;cursor:pointer;box-shadow:3px 3px 0 #1a1a2e}"+
    ".bi-close:active{transform:translateY(2px);box-shadow:1px 1px 0 #1a1a2e}";
  document.head.appendChild(css);

  function triggers(){return document.querySelectorAll("[data-install]")}
  function available(){return !isStandalone()&&(!!deferred||isIOS)}
  function refresh(){
    var t=TEXT[lang],show=available();
    triggers().forEach(function(el){
      el.hidden=!show;
      el.setAttribute("aria-label",t.label);
      el.title=t.label;
      el.querySelectorAll("[data-install-label]").forEach(function(s){s.textContent=t.label});
    });
  }

  function closeSheet(){
    if(!sheet)return;
    var s=sheet;sheet=null;
    s.classList.remove("show");
    setTimeout(function(){s.remove()},220);
  }
  function openSheet(){
    if(sheet)return;
    var t=TEXT[lang];
    sheet=document.createElement("div");
    sheet.className="bi-overlay";
    sheet.setAttribute("role","dialog");
    sheet.setAttribute("aria-modal","true");
    sheet.setAttribute("aria-label",t.title);
    sheet.innerHTML=
      '<div class="bi-sheet">'+
        '<p class="bi-title">'+t.title+'</p>'+
        '<ol class="bi-steps">'+
          '<li><span class="bi-num">1</span><span>'+t.s1+'</span>'+SHARE_ICON+'</li>'+
          '<li><span class="bi-num">2</span><span>'+t.s2+'</span></li>'+
          '<li><span class="bi-num">3</span><span>'+t.s3+'</span></li>'+
        '</ol>'+
        '<button type="button" class="bi-close">'+t.close+'</button>'+
      '</div>';
    sheet.addEventListener("click",function(e){
      if(e.target===sheet||e.target.classList.contains("bi-close"))closeSheet();
    });
    document.body.appendChild(sheet);
    requestAnimationFrame(function(){if(sheet)sheet.classList.add("show")});
  }

  function install(){
    if(deferred){
      var p=deferred;deferred=null;
      p.prompt();
      p.userChoice.then(refresh,refresh);
    }else if(isIOS){
      openSheet();
    }
  }

  window.addEventListener("beforeinstallprompt",function(e){
    e.preventDefault();
    deferred=e;
    refresh();
  });
  window.addEventListener("appinstalled",function(){deferred=null;closeSheet();refresh()});
  document.addEventListener("keydown",function(e){if(e.key==="Escape")closeSheet()});
  document.addEventListener("click",function(e){
    var el=e.target.closest&&e.target.closest("[data-install]");
    if(el){e.preventDefault();install()}
  });
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",refresh);
  else refresh();

  window.BeeInstall={
    setLang:function(l){if(TEXT[l]){lang=l;refresh()}},
    install:install
  };
})();
