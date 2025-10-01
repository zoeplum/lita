// script.js
// Mobile drawer + tab scrolling with reliable behavior on small screens.

// defensive year (if present)
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* --- Collect tab links (desktop & mobile) --- */
const desktopTabs = Array.from(document.querySelectorAll('.side-nav .tab'));
const drawerTabs = Array.from(document.querySelectorAll('.m-tab')); // mobile drawer links
const allTabs = desktopTabs.concat(drawerTabs);

// Build map target => links
const tabsByTarget = {};
allTabs.forEach(link => {
  const target = link.dataset.target;
  if(!target) return;
  if(!tabsByTarget[target]) tabsByTarget[target] = [];
  tabsByTarget[target].push(link);
});

/* --- Utility: set active classes on desktop tabs --- */
function setActiveByTarget(target){
  desktopTabs.forEach(t => t.classList.remove('active'));
  const list = tabsByTarget[target] || [];
  list.forEach(l => {
    // only add active to desktop tabs (desktopTabs set)
    if(desktopTabs.includes(l)) l.classList.add('active');
  });
}

/* --- IntersectionObserver: update active tab while scrolling --- */
const sectionIds = Object.keys(tabsByTarget);
const observedSections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
const observerOptions = { root: null, rootMargin: '0px 0px -40% 0px', threshold: 0 };
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      setActiveByTarget(entry.target.id);
    }
  });
}, observerOptions);
observedSections.forEach(s => io.observe(s));

/* --- Mobile drawer controls --- */
const mobileBtn = document.getElementById('mobile-menu-btn');
const mobileDrawer = document.getElementById('mobile-drawer');
const drawerBackdrop = document.getElementById('drawer-backdrop');
const drawerClose = document.getElementById('mobile-drawer-close');

function openDrawer(){
  if(!mobileDrawer || !drawerBackdrop || !mobileBtn) return;
  mobileDrawer.classList.add('open');
  mobileDrawer.setAttribute('aria-hidden', 'false');
  drawerBackdrop.hidden = false;
  // small delay to allow CSS to apply before showing opacity
  requestAnimationFrame(() => { drawerBackdrop.style.opacity = '1'; });
  mobileBtn.setAttribute('aria-expanded', 'true');
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
}

function closeDrawer(immediate = false){
  if(!mobileDrawer || !drawerBackdrop || !mobileBtn) return;
  mobileDrawer.classList.remove('open');
  mobileDrawer.setAttribute('aria-hidden', 'true');
  drawerBackdrop.style.opacity = '0';
  // hide after transition unless immediate
  const hideDelay = immediate ? 0 : 260;
  setTimeout(()=> {
    drawerBackdrop.hidden = true;
  }, hideDelay);
  mobileBtn.setAttribute('aria-expanded', 'false');
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
}

// mobile button toggle
if(mobileBtn){
  mobileBtn.addEventListener('click', () => {
    const expanded = mobileBtn.getAttribute('aria-expanded') === 'true';
    if(expanded) closeDrawer(); else openDrawer();
  });
}
if(drawerBackdrop){
  drawerBackdrop.addEventListener('click', () => closeDrawer());
}
if(drawerClose){
  drawerClose.addEventListener('click', () => closeDrawer());
}
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape') closeDrawer();
});

/* --- Tab click handling (desktop & mobile) --- */
function onTabClick(e){
  e.preventDefault();
  const link = e.currentTarget;
  const target = link.dataset.target;
  if(!target) return;
  const el = document.getElementById(target);
  if(!el) return;

  // If the clicked link is inside the mobile drawer, close the drawer first,
  // wait for the close animation, then scroll. This prevents the drawer from
  // covering the target after scroll.
  const insideDrawer = !!link.closest && !!link.closest('#mobile-drawer');

  if(insideDrawer){
    // close drawer and scroll after animation completes
    closeDrawer();
    // match the CSS transition delay (260ms). Keep slight buffer.
    const wait = 280;
    setTimeout(() => {
      el.focus({preventScroll:true});
      el.scrollIntoView({behavior:'smooth', block:'start'});
      setActiveByTarget(target);
    }, wait);
  } else {
    // desktop: immediate scroll
    el.focus({preventScroll:true});
    el.scrollIntoView({behavior:'smooth', block:'start'});
    setActiveByTarget(target);
  }
}

// attach handlers to all tabs
allTabs.forEach(t => {
  t.addEventListener('click', onTabClick);
});