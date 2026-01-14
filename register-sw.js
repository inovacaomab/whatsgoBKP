// register-sw.js — registra o service worker e controla o prompt de instalação
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // registro relativo para funcionar em project pages e custom domains
      const reg = await navigator.serviceWorker.register('./sw.js');
      console.log('Service Worker registrado:', reg);
    } catch (err) {
      console.error('Erro ao registrar Service Worker:', err);
    }
  });
}

// Controle manual do prompt de instalação
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); // evita o mini-infobar do Chrome
  deferredPrompt = e;
  const btn = document.getElementById('btn-install');
  if (btn) {
    btn.style.display = 'inline-block';
    btn.addEventListener('click', async () => {
      btn.style.display = 'none';
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      console.log('Resultado da instalação:', choice.outcome);
      deferredPrompt = null;
    });
  }
});

window.addEventListener('appinstalled', () => {
  console.log('PWA instalado');
  // Aqui você pode disparar evento de analytics
});
