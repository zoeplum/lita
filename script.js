// script.js (mobile off-canvas + tabs + feed)
// behaviour: open/close sidebar only on mobile, overlay, close on tab click, and cleanup on resize

// helper to detect mobile breakpoint (match CSS threshold)
function isMobile() {
  return window.matchMedia('(max-width:900px)').matches;
}

// update year if element exists
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* --- Smooth tab scrolling & activation --- */
const tabs = Array.from(document.querySelectorAll('.side-nav .tab'));
const sections = tabs.map(t => document.getElementById(t.dataset.target));

tabs.forEach(tab => {
  tab.addEventListener('click', (e) => {
    e.preventDefault();
    const id = tab.dataset.target;
    const el = document.getElementById(id);
    if(!el) return;
    // focus for accessibility and then smooth scroll
    el.focus({preventScroll:true});
    el.scrollIntoView({behavior:'smooth', block:'start'});
    setActiveTab(tab);

    // if mobile sidebar is open, close it after clicking a tab
    if(document.body.classList.contains('sidebar-open')) {
      closeSidebar();
    }
  });
});

function setActiveTab(tab){
  tabs.forEach(t => t.classList.remove('active'));
  if(tab) tab.classList.add('active');
}

/* IntersectionObserver to update active tab on scroll */
const observerOptions = { root: null, rootMargin: '0px 0px -40% 0px', threshold: 0 };
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      const id = entry.target.id;
      const tab = tabs.find(t => t.dataset.target === id);
      if(tab) setActiveTab(tab);
    }
  });
}, observerOptions);

sections.forEach(s => {
  if(s) sectionObserver.observe(s);
});

/* --- Mobile sidebar (off-canvas) --- */
const sidebar = document.querySelector('.sidebar');
const mobileToggle = document.querySelector('.mobile-toggle');
const overlay = document.getElementById('mobile-overlay');

function openSidebar(){
  if(!sidebar) return;
  // only use the offcanvas behaviour on mobile
  if(isMobile()){
    sidebar.classList.add('offcanvas', 'open');
    document.body.classList.add('sidebar-open');
    if(overlay){
      overlay.hidden = false;
      overlay.setAttribute('aria-hidden', 'false');
    }
  }
}

function closeSidebar(){
  if(!sidebar) return;
  // only remove open/offcanvas if mobile
  if(isMobile()){
    sidebar.classList.remove('open');
    // keep offcanvas class until closed; remove it to ensure desktop isn't affected if viewport changes
    sidebar.classList.remove('offcanvas');
    document.body.classList.remove('sidebar-open');
    if(overlay){
      overlay.hidden = true;
      overlay.setAttribute('aria-hidden', 'true');
    }
  } else {
    // if not mobile but still open-state left somehow, ensure DOM is clean
    sidebar.classList.remove('open', 'offcanvas');
    document.body.classList.remove('sidebar-open');
    if(overlay){
      overlay.hidden = true;
      overlay.setAttribute('aria-hidden', 'true');
    }
  }
}

// toggle button
if(mobileToggle){
  mobileToggle.addEventListener('click', (e) => {
    e.preventDefault();
    if(document.body.classList.contains('sidebar-open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });
}

// clicking overlay closes sidebar
if(overlay){
  overlay.addEventListener('click', () => closeSidebar());
}

// clicking logo link should close sidebar and go to top
const logoLink = document.querySelector('.logo-link');
if(logoLink){
  logoLink.addEventListener('click', () => {
    if(document.body.classList.contains('sidebar-open')) closeSidebar();
  });
}

// ensure responsive cleanup on resize: if transitioning to desktop, remove mobile classes
window.addEventListener('resize', () => {
  if(!isMobile()){
    // remove mobile-only classes and hide overlay
    if(sidebar){
      sidebar.classList.remove('offcanvas', 'open');
    }
    document.body.classList.remove('sidebar-open');
    if(overlay){
      overlay.hidden = true;
      overlay.setAttribute('aria-hidden', 'true');
    }
  }
});

/* --- Infinite feed (unchanged) --- */
const feedList = document.getElementById('feed-list');
const sentinel = document.getElementById('feed-sentinel');
const feedStatus = document.getElementById('feed-status');

let page = 0;
const perPage = 6;
let loading = false;

function generateItem(i){
  const d = new Date();
  d.setDate(d.getDate() - i);
  return {
    id: 'post-' + i,
    title: `Atualização #${i} — novidades`,
    meta: d.toLocaleDateString(),
    body: `Pequena descrição da ação ${i}. Substitua com conteúdo real.`
  };
}

function renderItem(item){
  const wrap = document.createElement('div');
  wrap.className = 'feed-item';
  wrap.innerHTML = `<div class="title">${item.title}</div>
                    <div class="meta">${item.meta}</div>
                    <div class="body" style="margin-top:8px;color:var(--muted)">${item.body}</div>`;
  return wrap;
}

async function loadMore(){
  if(loading || !feedList) return;
  loading = true;
  if(feedStatus) feedStatus.textContent = 'A carregar...';
  await new Promise(r => setTimeout(r, 350));
  const start = page * perPage;
  for(let i = start; i < start + perPage; i++){
    const obj = generateItem(i + 1);
    const node = renderItem(obj);
    feedList.appendChild(node);
  }
  page++;
  loading = false;
  if(feedStatus) feedStatus.textContent = '';
}

if(feedList) {
  loadMore();
  const feedObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry => {
      if(entry.isIntersecting){
        loadMore();
      }
    });
  }, {root:null, rootMargin:'400px', threshold: 0});

  if(sentinel) feedObserver.observe(sentinel);
}