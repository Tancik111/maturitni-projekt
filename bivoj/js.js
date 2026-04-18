// Logika pro zavírání menu po kliknutí na odkaz v mobilní verzi. Tento kód naslouchá na kliknutí na dokument a kontroluje, zda bylo kliknuto na odkaz s třídou 'nav-link'. Pokud ano, zkontroluje, zda je menu otevřené (má třídu 'show') a pokud ano, zavře ho odstraněním této třídy a aktualizuje stav burger tlačítka pro správnou animaci a přístupnost.

document.addEventListener('click', function (e) {
    if (e.target.classList.contains('nav-link')) {
        const menu = document.getElementById('mainMenu');
        const toggler = document.querySelector('.navbar-toggler');
        if (menu.classList.contains('show')) {
            // Zavřeme menu odstraněním třídy
            menu.classList.remove('show');
            toggler.classList.add('collapsed');
            toggler.setAttribute('aria-expanded', 'false');
        }
    }
});


// Animace při scrollování, které jsou definované pomocí knihovny AOS. Iniciuje se až po načtení celého dokumentu, aby se předešlo problémům s načítáním a fungováním animací.
      document.addEventListener('DOMContentLoaded', function() {
        if (typeof AOS !== 'undefined') {
          AOS.init({ duration: 1000, once: true, offset: 100 });
        }
      });

// Mapa v patičce - kód který upravuje mapu v patičce tak aby vypadala více historicky  a zároveň zobrazuje místo sídla Pověstníku pomocí markeru. Kromě toho se přidává filtr pro vytvoření starobylého vzhledu mapy a používá se API klíč pro načítání dlaždic z externího zdroje.

var apiKey = '30fcd185-49ea-41f4-a088-55562103e2d3'; 
var map = L.map('historical-map').setView([50.02702894315356, 15.204167729237522], 12);
L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg?api_key=' + apiKey, {
  maxZoom: 16,
  attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://stamen.com/">Stamen Design</a>'
}).addTo(map);

var mapElement = document.getElementById('historical-map');
mapElement.style.filter = "sepia(0.8) contrast(1.2) brightness(0.9) hue-rotate(-10deg)";

L.circleMarker([50.02702894315356, 15.204167729237522], {
  radius: 8,
  fillColor: "#8b0000",
  weight: 2,
  opacity: 1,
  fillOpacity: 0.8
}).addTo(map).bindPopup("<b>Sídlo Pověstníku</b>");

// Formulář pro kontaktování    -   Slouží k posílání dotazů které se spolu s emailem který uživatel zadá ukladají do databáze a následně se odesílají na email administrátorů. Po úspěšném odeslání se zobrazí modální okno s potvrzením o úspěšném odeslání a formulář se resetuje.

document.getElementById('questionForm').addEventListener('submit', function(e) {
    e.preventDefault(); 

    const formData = new FormData(this);
    const responseDiv = document.getElementById('responseMessage');
    const form = this;

    fetch('../contact.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            responseDiv.style.display = 'block';
            form.reset();
            setTimeout(() => {
                responseDiv.style.display = 'none';
            }, 3000);
        } else {
            alert("Server error. Please try again later.");
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// COOKIES - Logika pro fungování cookies lišty a spodních tlačítek která umožňují uživatelům přijmout cookies nebo je odmítnout a znovu zobrazit lištu pro výběr cookies. Tato logika využívá localStorage pro ukládání stavu souhlasu s cookies a Bootstrap pro správu modálních oken.

document.addEventListener("DOMContentLoaded", function() {
    const cookieBar = document.getElementById('cookie-bar');
    const acceptBtn = document.getElementById('accept-cookies');
    const revokeBtn = document.getElementById('btn-revoke-everything');
    const storageKey = 'momentum_cookies_accepted';

    if (!localStorage.getItem(storageKey)) {
        setTimeout(() => {
            cookieBar.classList.add('show-cookie-bar');
        }, 1000);
    }

    if (acceptBtn) {
        acceptBtn.addEventListener('click', function() {
            localStorage.setItem(storageKey, 'true');
            cookieBar.classList.remove('show-cookie-bar');
        });
    }

    if (revokeBtn) {
        revokeBtn.addEventListener('click', function() {
            localStorage.removeItem(storageKey);
            
            const modalEl = document.getElementById('cookieSettingsModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            
            if (modal) {
                modal.hide();

                modalEl.addEventListener('hidden.bs.modal', function () {
                    setTimeout(() => {
                        cookieBar.classList.add('show-cookie-bar');
                    }, 100);
                }, { once: true }); 
            } else {
                cookieBar.classList.add('show-cookie-bar');
            }
        });
    }

    const gdprModal = document.getElementById('privacyModal');
    if (gdprModal) {
        const gdprDeclineBtn = gdprModal.querySelector('.modal-footer-btns button:last-child');
        
        if (gdprDeclineBtn) {
            gdprDeclineBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = "https://www.google.com";
            });
        }
    }
});

// V tomhle skriptu jsem naprogramoval logiku listování v 3D knize. Hlavní výzva byla v tom, aby se stránky při otáčení správně překrývaly, takže pomocí JavaScriptu v polovině animace dynamicky měním jejich z-index. Také jsem tam přidal postupné stínování, aby celá kronika působila jako reálný historický dokument.“

document.addEventListener('DOMContentLoaded', () => {
    const pages = document.querySelectorAll('.page');
    const audio = document.getElementById('kronikaAudio');
    
    pages.forEach((page, index) => {
        // Tady stránky skládám na sebe podle jejich pořadí (první musí být úplně nahoře)
        page.style.zIndex = pages.length - index + 1;

        // Každé stránce vytvořím div pro stín, aby listování vypadalo prostorově
        const shadow = document.createElement('div');
        shadow.className = 'page-shadow';
        page.appendChild(shadow);

        page.addEventListener('click', () => {
            const currentShadow = page.querySelector('.page-shadow');

            // Kontroluji, jestli je stránka už otočená (třída flipped)
            if (page.classList.contains('flipped')) {
                // zavírání stránky (zpět doprava)
                page.classList.remove('flipped');
                
                // Krátce zvýším viditelnost stínu během pohybu
                currentShadow.style.opacity = '0.5';
                setTimeout(() => { currentShadow.style.opacity = '0'; }, 800);

                // Z-index vracím až po 800ms (v půlce animace), aby se listy vizuálně nesrazily
                setTimeout(() => {
                    page.style.zIndex = pages.length - index + 1;
                }, 800);
            } else {
                // otevírání stránky (doleva)
                page.classList.add('flipped');

                // Efekt ohybu papíru pomocí průhlednosti stínu
                currentShadow.style.opacity = '0.5';
                setTimeout(() => { currentShadow.style.opacity = '0'; }, 800);

                // Stránce, která se právě otočila, musím zvednout z-index, aby překryla levou stranu
                setTimeout(() => {
                    page.style.zIndex = 20 + index;
                }, 800);
            }
        });
    });
});

// V této části kódu pracuji s knihovnou Leaflet pro zobrazení interaktivní mapy Vyšehradu. Abych nemusel psát kód pro každý bod zvlášť, uložil jsem si všechna zajímavá místa do pole objektů a pomocí cyklu forEach je automaticky vykresluji na mapu i s jejich popisky. Také jsem vypnul zoomování kolečkem myši, aby se uživatelům stránka při skrolování nechtěně nezasekávala na mapě.“

document.addEventListener('DOMContentLoaded', function() {
    // Kontroluji, jestli prvek pro mapu na stránce vůbec existuje, abych předešel chybám
    if (document.getElementById('map')) {
        
        // Inicializace mapy: nastavuji střed na Vyšehrad a úroveň přiblížení
        // scrollWheelZoom: false zajišťuje, že mapa nebude „krást“ skrolování stránky
        var map = L.map('map', {
            scrollWheelZoom: false 
        }).setView([50.0515, 14.4235], 16);

        // Načítám mapové dlaždice (vzhled mapy) – zvolil jsem styl 'hot', který se lépe hodí k legendám
        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; Staré pověsti české'
        }).addTo(map);

        // Všechna místa mám v poli, což je přehlednější pro správu a rozšiřování obsahu
var points = [
            { lat: 50.0538, lng: 14.4251, title: "Na Lysině", desc: "Místo, kde Bivoj poprvé spatřil obrovského kance pustošícího pole." },
            { lat: 50.0525, lng: 14.4232, title: "Vápenka / Pod Klaudiánkou", desc: "Zde podle pověsti došlo k zápasu, kdy Bivoj kance přemohl a hodil si ho na záda." },
            { lat: 50.0495, lng: 14.4298, title: "Na Hřebenech II", desc: "Cesta, kudy silák Bivoj stoupal s úlovkem směrem k Vyšehradu." },
            { lat: 50.0495, lng: 14.4210, title: "Kavčí hory", desc: "Tradiční místo, odkud je nejlepší výhled na Vyšehrad, cíl Bivojovy cesty." }
        ];

        // Procházím pole bodů a pro každý vytvořím značku (marker) a informační okno (popup)
        points.forEach(function(p) {
            var marker = L.marker([p.lat, p.lng]).addTo(map);
            // V bindPopup skládám HTML obsah, který se zobrazí po kliknutí na bod
            marker.bindPopup("<h5 style='margin-bottom:5px; font-weight:bold;'>" + p.title + "</h5><p style='margin:0;'>" + p.desc + "</p>");
        });
    }
});