/* Installed BeamCast apps (the Android APK and "Add to Home screen" installs) open this site's
   main address. Send them straight to the app, as before; browsers see the website. */
(function () {
  var standalone = (window.matchMedia && (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches)) ||
    window.navigator.standalone === true || document.referrer.indexOf('android-app://') === 0;
  if (standalone) location.replace('app.html' + location.search + location.hash);
})();
