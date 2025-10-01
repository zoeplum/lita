// script.js
// Adds mobile drawer behavior and keeps tab/scroll logic working on all sizes.

// defensive year (if present)
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* --- Gather tab links: desktop tabs + mobile drawer tabs --- */
const desktopTabs = Array.from(document.querySelectorAll('.side-nav .tab'));
const mobileTabs = Array.from(document.querySelectorAll('.drawer-nav .m-tab, .drawer-nav a.m-tab')) // attempt generic
  .concat(Array.from(document.querySelectorAll('.drawer-nav .m-tab')));

// some pages have mobile nav anchors as .m-tab; but in our HTML they are .m-tab anchor tags
const drawerTabs = Array.from(document.querySelectorAll('.m-tab'));

// normalize tabs into one list for activation handling
const allTabs = desktopTabs.concat(drawerTabs);

// Map of target id => all link elements that point to it
const tabsByTarget = {};
allTabs.forEach(link => {
  const target = link.dataset.target;
  if(!target) return;
  if(!tabsByTarget[target]) tabsByTarget[target] = [];
  tabsByTarget[target].push(link);
});

/* --- Tab click handling (desktop & mobile) --- */
function onTabClick(e){
  e.preventDefault();
  const target = e.currentTarget.dataset.target;
  if(!target) return;
  const el = document.getElementById(target);
  if(!el) return;

  // focus & scroll
  el.focus({preventScroll: true});
  el.scrollIntoView({behavior: 'smooth', block: 'start'});

  // set active on all links that point to this target
  setActiveByTarget(target);

  // if mobile drawer open, close it
  closeDrawer();
}

// attach click handlers
allTabs.forEach(t => t.addEventListener('click', onTabClick));

function setActiveByTarget(target){
  // remove active class from all desktop tabs
  desktopTabs.forEach(t => t.classList.remove('active'));
  // add active to desktop tab(s) for this target
  if(tabsByTarget[target]){
    tabsByTarget[target].forEach(link => link.classList.add('active'));
  }
}

/* IntersectionObserver: update active tab while scrolling */
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

/* --- Mobile drawer logic --- */
const mobileBtn = document.getElementById('mobile-menu-btn');
const mobileDrawer = document.getElementById('mobile-drawer');
const drawerBackdrop = document.getElementById('drawer-backdrop');
const drawerClose = document.getElementById('mobile-drawer-close');

function openDrawer(){
  if(!mobileDrawer || !drawerBackdrop) return;
  mobileDrawer.classList.add('open');
  mobileDrawer.setAttribute('aria-hidden', 'false');
  drawerBackdrop.hidden = false;
  drawerBackdrop.style.opacity = '1';
  mobileBtn.setAttribute('aria-expanded', 'true');
  // prevent background scrolling
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
}

function closeDrawer(){
  if(!mobileDrawer || !drawerBackdrop) return;
  mobileDrawer.classList.remove('open');
  mobileDrawer.setAttribute('aria-hidden', 'true');
  drawerBackdrop.style.opacity = '0';
  // hide after transition
  setTimeout(()=> {
    drawerBackdrop.hidden = true;
  }, 260);
  mobileBtn.setAttribute('aria-expanded', 'false');
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
}

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
// close drawer on Escape key
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape') closeDrawer();
});

// when a link inside drawer is clicked, scroll and close drawer.
// drawer links have class "m-tab"
const drawerLinks = Array.from(document.querySelectorAll('.m-tab'));
drawerLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    // default behavior prevented by onTabClick, which runs first because we attached earlier
    // ensure drawer closes after the scroll command was sent
    setTimeout(()=> closeDrawer(), 220);
  });
});