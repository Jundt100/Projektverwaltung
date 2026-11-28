// Netz zuerst (damit Änderungen auf GitHub sofort ankommen), bei fehlender Verbindung aus dem Cache
const CACHE = 'ckw-projekte-v50'; // v50: eigenes CKW-Sicherheitskonzept für PV (Ja/Nein-Gefährdungen, Instruktion mit Unterschrift, Projektleiter + Monteur)
// v49: Sicherheitskonzept (BauAV Art. 4) als Projekt-Dokument mit Unterschrift Monteur, Spitäler je Ort in den Einstellungen
// v48: Offerte → Projekt legt den Kunden an, fehlende Kundenangaben rot
// v47: Batterien parallel (Anzahl Türme, Total), Lynx Home F G2
// v46: Batterie Fronius Reserva Pro in den Offerten
// v45: Terminplan auf dem Handy mit schmaler Namensspalte (Daten darunter)
// v44: Bogenanzeigen (Checkliste, DB, Leistung) als dicker Bogen mit Symbol
// v43: neue Symbole Meldewesen und Gerüst
// v42: Offerten mit mehreren Zählern (Haus, Allgemein, Mieter, WP)
// v41: PowerKeeper nur bis 249,6 kWh und nur zu SH50CX / SH80CX
// v39: Batterie Sungrow PowerKeeper in den Offerten
// v38: Offerten mit WR-Liste, passenden Batterien, Netzanschluss; Seitenwechsel federnd
// v37: neue Kategorie Offerten (Aufnahme PVA, Eigenverbrauchsoptimierung) mit A4-PDF
// v36: Wechselrichter-Bibliothek mit Datenblättern abgeglichen (u.a. SH80CX 10 MPPT, SH5–12T 2 MPPT)
// v35: Projektliste mit Filtern (Art, Kunde, Termin, Status), Dashboard ohne Unterseite Projekte
// v34: Ertragsberechnung mit PVGIS (über eigenen Proxy) und Ertragsprotokoll
// v33: Sunwoda All-in-One, Produkte mit kVA/kWh/Anzahl, WR-Auswahl → Stringplan
// v32: Stringplan manuell verstringen, breitere Eingabe-Karten
// v31: eigene App-ID, löscht nur noch eigene Caches (andere Apps unter jundt100.github.io bleiben unberührt)
// die LASOLTEC-Vorlage steckt seit v4 in der index.html; fehlt eine Datei auf dem Server, darf die Installation nicht scheitern
const APP = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
// fremde Quellen, die offline gebraucht werden (Bibliotheken, Schrift). Firebase-Anmeldung und Datenbank laufen nie über den Cache.
const CDN = /^(cdnjs\.cloudflare\.com|www\.gstatic\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(APP.map(u => c.add(u).catch(() => {})))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // nur alte Versionen dieser App löschen – andere Apps auf derselben Adresse (Ferien, Rechnung …) haben eigene Caches
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('ckw-projekte-') && k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.origin !== self.location.origin && !CDN.test(url.host)) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
