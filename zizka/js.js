// Funkce pro načítací obrazovku - tento kód zajišťuje zobrazení načítací obrazovky s logem a textem Načítám kroniky... pro zajištění správného načtení.

window.addEventListener("load", function() {
    const loader = document.getElementById("loader-wrapper");
    const minimalniCasZobrazeni = 1200; 
    const casStartu = performance.now(); 

    function skrytLoader() {
        const aktualniCas = performance.now();
        const uplynutyCas = aktualniCas - casStartu;
        if (uplynutyCas < minimalniCasZobrazeni) {
            setTimeout(() => {
                loader.classList.add("loader-hidden");
                setTimeout(() => loader.style.display = "none", 500);
            }, minimalniCasZobrazeni - uplynutyCas);
        } else {
            loader.classList.add("loader-hidden");
            setTimeout(() => loader.style.display = "none", 500);
        }
    }
    skrytLoader();
});

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
        }).setView([48.8916583, 14.6067736], 16);

        // Načítám mapové dlaždice (vzhled mapy) – zvolil jsem styl 'hot', který se lépe hodí k legendám
        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; Staré pověsti české'
        }).addTo(map);

        // Všechna místa mám v poli, což je přehlednější pro správu a rozšiřování obsahu
        var points = [
            { 
                lat: 48.8945575, lng: 14.6018167, 
                title: "Žižkův dub / Místo narození", 
                desc: "Podle pověsti se Jan Žižka narodil za bouře pod starým dubem." 
            },
            { 
                lat: 48.8916583, lng: 14.6067736, 
                title: "Památník Jana Žižky", 
                desc: "Monumentální socha vojevůdce v areálu jeho rodného dvorce." 
            },
            { 
                lat: 48.8927942, lng: 14.6087047, 
                title: "Archeoskanzen Trocnov", 
                desc: "Rekonstrukce středověké vesnice a Žižkova rodového dvorce." 
            },
            { 
                lat: 48.8937253, lng: 14.6071706, 
                title: "Mikšův dvorec", 
                desc: "Základy druhého trocnovského dvorce, který patřil Žižkovu strýci." 
            }
        ];

        // Procházím pole bodů a pro každý vytvořím značku (marker) a informační okno (popup)
        points.forEach(function(p) {
            var marker = L.marker([p.lat, p.lng]).addTo(map);
            // V bindPopup skládám HTML obsah, který se zobrazí po kliknutí na bod
            marker.bindPopup("<h5 style='margin-bottom:5px; font-weight:bold;'>" + p.title + "</h5><p style='margin:0;'>" + p.desc + "</p>");
        });
    }
});

// Toto je funkce, která zajišťuje vybrání náhodné stránky u společného bodu

document.addEventListener('click', function(e) {
    const link = e.target.closest('.random-link');
    if (link) {
        e.preventDefault();
        const url1 = link.dataset.url1;
        const url2 = link.dataset.url2;
        const finalUrl = Math.random() < 0.5 ? url1 : url2;
        window.location.href = finalUrl;
    }
});

// Tento kód se týká hudebního přehrávače, který umožňuje přehrávat skladby z předdefinovaného playlistu. Uživatel může ovládat přehrávání, posouvat se mezi skladbami, upravovat hlasitost a sledovat aktuální čas a délku skladby. Kromě toho se automaticky přechází na další skladbu po skončení aktuální a zobrazuje se název právě přehrávané skladby.

const playlist = [
    { title: "Královský posel", src: "../data/hudba/1.opus" },
    { title: "Úsvit nad knížectvím", src: "../data/hudba/2.opus" },
    { title: "Poutníkova píseň", src: "../data/hudba/3.opus" },
    { title: "Dvorská veselice", src: "../data/hudba/4.opus" },
    { title: "Zlatý věk", src: "../data/hudba/5.opus" },
    { title: "Šepot starých zdí", src: "../data/hudba/6.opus" },
    { title: "Tržiště v podhradí", src: "../data/hudba/7.opus" },
    { title: "Legenda o meči", src: "../data/hudba/8.opus" },
    { title: "Stráž u ohniště", src: "../data/hudba/9.opus" },
    { title: "Kronika zapomenutých časů", src: "../data/hudba/10.opus" },
    { title: "Turnajové klání", src: "../data/hudba/11.opus" },
    { title: "Královská cesta", src: "../data/hudba/12.opus" },
    { title: "Balada o zapomenuté lásce", src: "../data/hudba/13.opus" },
    { title: "Lov v hlubokých hvozdech", src: "../data/hudba/14.opus" },
    { title: "U kulatého stolu", src: "../data/hudba/15.opus" },
    { title: "Ozvěny bitevního pole", src: "../data/hudba/16.opus" },
    { title: "Tanec v hodovní síni", src: "../data/hudba/17.opus" },
    { title: "Příslib nového věku", src: "../data/hudba/18.opus" }
];

let currentIdx = parseInt(localStorage.getItem('radio_idx')) || 0;
let savedTime = parseFloat(localStorage.getItem('radio_time')) || 0;
let wasPlaying = localStorage.getItem('radio_playing') === 'true';
let savedVolume = localStorage.getItem('radio_volume') || 0.20;

const audio = new Audio(playlist[currentIdx].src);
audio.currentTime = savedTime;
audio.volume = savedVolume;

const playBtn = document.getElementById('playBtn');
const trackTitle = document.getElementById('trackTitle');
const radioPanel = document.getElementById('radioPanel');
const progressSlider = document.getElementById('progressSlider');
const volumeSlider = document.getElementById('volumeSlider');
const currentTimeEl = document.getElementById('currentTime');
const durationTimeEl = document.getElementById('durationTime');

volumeSlider.value = audio.volume;

function saveRadioState() {
    localStorage.setItem('radio_idx', currentIdx);
    localStorage.setItem('radio_time', audio.currentTime);
    localStorage.setItem('radio_playing', !audio.paused);
    localStorage.setItem('radio_volume', audio.volume);
}

function attemptPlay() {
    if (wasPlaying) {
        audio.play().then(() => {
            playBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
        }).catch(err => {
            console.log("Autoplay čeká na interakci uživatele.");
            document.addEventListener('click', () => {
                if (wasPlaying && audio.paused) {
                    audio.play();
                    playBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
                }
            }, { once: true });
        });
    }
}

function togglePanel() {
    radioPanel.classList.toggle('active');
}

function togglePlay() {
    if (audio.paused) {
        audio.play();
        playBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
    } else {
        audio.pause();
        playBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
    }
    saveRadioState();
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

audio.ontimeupdate = () => {
    if (!isNaN(audio.duration)) {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressSlider.value = progress;
        currentTimeEl.innerText = formatTime(audio.currentTime);
        durationTimeEl.innerText = formatTime(audio.duration);
    }
    if (Math.floor(audio.currentTime) % 2 === 0) { 
        saveRadioState(); 
    }
};

progressSlider.oninput = () => {
    const seekTime = (progressSlider.value / 100) * audio.duration;
    audio.currentTime = seekTime;
    saveRadioState();
};

volumeSlider.oninput = () => {
    audio.volume = volumeSlider.value;
    saveRadioState();
};

function updateTitle() {
    trackTitle.innerText = playlist[currentIdx].title;
}

function nextTrack() {
    currentIdx = (currentIdx + 1) % playlist.length;
    changeTrack();
}

function prevTrack() {
    currentIdx = (currentIdx - 1 + playlist.length) % playlist.length;
    changeTrack();
}

function changeTrack() {
    audio.src = playlist[currentIdx].src;
    audio.currentTime = 0; 
    audio.play();
    playBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
    updateTitle();
    saveRadioState();
}

audio.onended = nextTrack;
updateTitle();
attemptPlay();