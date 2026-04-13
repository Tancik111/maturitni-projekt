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


// moje věci, pak se dokomentuje


document.addEventListener('DOMContentLoaded', () => {
    const pages = document.querySelectorAll('.page');
    const audio = document.getElementById('kronikaAudio');
    

    pages.forEach((page, index) => {
        page.style.zIndex = pages.length - index + 1;

        const shadow = document.createElement('div');
        shadow.className = 'page-shadow';
        page.appendChild(shadow);

        page.addEventListener('click', () => {
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(() => {});
            }

            const currentShadow = page.querySelector('.page-shadow');

            if (page.classList.contains('flipped')) {
                page.classList.remove('flipped');
                
       
                currentShadow.style.opacity = '0.5';
                setTimeout(() => { currentShadow.style.opacity = '0'; }, 800);

                setTimeout(() => {
                    page.style.zIndex = pages.length - index + 1;
                }, 800);
            } else {
                // Otevírání stránky (doleva)
                page.classList.add('flipped');

                currentShadow.style.opacity = '0.5';
                setTimeout(() => { currentShadow.style.opacity = '0'; }, 800);

                setTimeout(() => {
                    page.style.zIndex = 20 + index;
                }, 800);
            }
        });
    });
});


document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('map')) {
        var map = L.map('map', {
            scrollWheelZoom: false 
        }).setView([50.0644, 14.4195], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; Staré pověsti české'
        }).addTo(map);

        var points = [
            {
                lat: 50.0641, lng: 14.4172, 
                title: "Libušina lázeň", 
                desc: "Zřícenina na skále, odkud kněžna věštila slávu Prahy."
            },
            {
                lat: 50.0647, lng: 14.4201, 
                title: "Bazilika sv. Petra a Pavla", 
                desc: "Místo, kde odpočívají největší osobnosti českých dějin."
            },
            {
                lat: 50.0632, lng: 14.4208, 
                title: "Čertovy sloupy", 
                desc: "Tři kamenné sloupy, které sem podle legendy vzteky odhodil čert."
            },
            {
                lat: 50.0652, lng: 14.4194, 
                title: "Vyšehradská skála", 
                desc: "Místo, odkud bájný Šemík skočil do Vltavy."
            }
        ];

        points.forEach(function(p) {
            var marker = L.marker([p.lat, p.lng]).addTo(map);
            marker.bindPopup("<h5 style='margin-bottom:5px; font-weight:bold;'>" + p.title + "</h5><p style='margin:0;'>" + p.desc + "</p>");
        });
    }
});