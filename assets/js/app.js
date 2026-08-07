window.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splash');
  const body = document.body;
  const revealDelay = 1400;

  const revealApp = () => {
    body.classList.add('loaded');
    splash.setAttribute('aria-hidden', 'true');
  };

  const timer = window.setTimeout(revealApp, revealDelay);

  splash.addEventListener('click', () => {
    window.clearTimeout(timer);
    revealApp();
  });
});
