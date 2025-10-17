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
    // focus for a11y and then smooth scroll
    el.focus({preventScroll:true});
    el.scrollIntoView({behavior:'smooth', block:'start'});
    setActiveTab(tab);

    // if mobile sidebar is open, close it after clicking a nav link
    if(document.documentElement.classList.contains('sidebar-open')){
      closeSidebar();
    }
  });
});

function setActiveTab(tab){
  tabs.forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
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

/* --- Infinite feed --- */
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

/* --- Mobile sidebar toggling --- */
const htmlEl = document.documentElement;
const hamburger = document.getElementById('hamburger');
const backdrop = document.getElementById('sidebar-backdrop');
const sidebar = document.getElementById('site-sidebar');

function openSidebar(){
  htmlEl.classList.add('sidebar-open');
  hamburger.setAttribute('aria-expanded','true');
  backdrop.setAttribute('aria-hidden','false');
  // Move focus into the sidebar for accessibility
  const firstTabbable = sidebar.querySelector('a, button, [tabindex]:not([tabindex="-1"])');
  if(firstTabbable) firstTabbable.focus();
  // listen for escape
  document.addEventListener('keydown', onKeyDown);
}

function closeSidebar(){
  htmlEl.classList.remove('sidebar-open');
  hamburger.setAttribute('aria-expanded','false');
  backdrop.setAttribute('aria-hidden','true');
  // return focus to hamburger
  if(hamburger) hamburger.focus();
  document.removeEventListener('keydown', onKeyDown);
}

function toggleSidebar(){
  if(htmlEl.classList.contains('sidebar-open')) closeSidebar();
  else openSidebar();
}

function onKeyDown(e){
  if(e.key === 'Escape' || e.key === 'Esc'){
    closeSidebar();
  }
}

// Click handlers
if(hamburger) hamburger.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleSidebar();
});

// Clicking the backdrop closes the sidebar
if(backdrop) backdrop.addEventListener('click', (e) => {
  closeSidebar();
});

// If user resizes to desktop, ensure sidebar is closed and aria attributes reset
window.addEventListener('resize', () => {
  if(window.innerWidth > 900 && htmlEl.classList.contains('sidebar-open')){
    // close visual mobile-only state (desktop will show sticky sidebar)
    closeSidebar();
  }
});