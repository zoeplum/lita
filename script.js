// script.js
// Handles: year, sidebar tab clicks + active highlight, and infinite feed loading.

document.getElementById('year').textContent = new Date().getFullYear();

/* --- Smooth tab scrolling & activation --- */
const tabs = Array.from(document.querySelectorAll('.side-nav .tab'));
const sections = tabs.map(t => document.getElementById(t.dataset.target));

tabs.forEach(tab => {
  tab.addEventListener('click', (e) => {
    // allow anchor default for accessibility but also smooth scroll
    e.preventDefault();
    const id = tab.dataset.target;
    const el = document.getElementById(id);
    if(!el) return;
    // focus section for a11y
    el.focus({preventScroll:true});
    el.scrollIntoView({behavior:'smooth', block:'start'});
    setActiveTab(tab);
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
const perPage = 6;     // items to add per load — change if you like
let loading = false;

// placeholder generator for feed items; replace with real data or fetch from an API
function generateItem(i){
  const d = new Date();
  d.setDate(d.getDate() - i); // make items recent
  return {
    id: 'post-' + i,
    title: `Update #${i} — union news & event`,
    meta: d.toLocaleDateString(),
    body: `Short description for update ${i}. Replace with real content.`
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
  if(loading) return;
  loading = true;
  feedStatus.textContent = 'Loading more…';
  // simulate small delay (remove if you fetch real remote data)
  await new Promise(r => setTimeout(r, 350));

  // generate items
  const start = page * perPage;
  for(let i = start; i < start + perPage; i++){
    const obj = generateItem(i + 1);
    const node = renderItem(obj);
    feedList.appendChild(node);
  }
  page++;
  loading = false;
  feedStatus.textContent = '';
  // optional: if you want to stop at some max, set sentinel observer to disconnect
}

// initial load
loadMore();

// sentinel observer: when visible, load more
const feedObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry => {
    if(entry.isIntersecting){
      loadMore();
    }
  });
}, {root:null, rootMargin:'400px', threshold: 0});

feedObserver.observe(sentinel);