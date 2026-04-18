document.addEventListener('DOMContentLoaded', function() {

// Logika pro zavírání menu po kliknutí na odkaz v mobilní verzi. Tento kód naslouchá na kliknutí na dokument a kontroluje, zda bylo kliknuto na odkaz s třídou 'nav-link'. Pokud ano, zkontroluje, zda je menu otevřené (má třídu 'show') a pokud ano, zavře ho odstraněním této třídy a aktualizuje stav burger tlačítka pro správnou animaci a přístupnost.
    const menu = document.getElementById('mainMenu');
    if (menu && typeof bootstrap !== 'undefined') {
        const bsCollapse = new bootstrap.Collapse(menu, { toggle: false });
        document.addEventListener('click', function (e) {
            if (e.target.classList.contains('nav-link')) {
                const toggler = document.querySelector('.navbar-toggler');
                if (menu.classList.contains('show')) {
                    menu.classList.remove('show');
                    if (toggler) {
                        toggler.classList.add('collapsed');
                        toggler.setAttribute('aria-expanded', 'false');
                    }
                }
            }
        });
    }

// Animace při scrollování, které jsou definované pomocí knihovny AOS. Iniciuje se až po načtení celého dokumentu, aby se předešlo problémům s načítáním a fungováním animací.
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 1000, once: true, offset: 100 });
    }

// AI  -  Logika, která řeší propojení stisknutí tlačítka s php a nasledné otevření modálního okna. Taktéž se stará o převedení pověsti do stažitelného PDF souboru
    const form = document.getElementById('povestForm');
    const modalElement = document.getElementById('vysledekModal');
    
    if (form && modalElement && typeof bootstrap !== 'undefined') {
        const modal = new bootstrap.Modal(modalElement);
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const submitBtn = form.querySelector('button[type="submit"]');
            const imgInside = document.getElementById('genBtn'); 
            submitBtn.disabled = true;
            if (imgInside) imgInside.style.opacity = "0.5";

            const formData = new FormData(form);
            try {
                const resp = await fetch('index.php', { method: 'POST', body: formData });
                if (!resp.ok) throw new Error('Server error ' + resp.status);
                const result = await resp.json();
                if (result.error) {
                    alert(result.error);
                } else {
                    const vystup = document.getElementById('vystupText');
                    if (vystup) vystup.innerText = result.text;
                    modal.show();
                }
            } catch (err) {
                console.error(err);
                alert('Chyba: ' + err.message);
            } finally {
                submitBtn.disabled = false;
                if (imgInside) imgInside.style.opacity = "1";
            }
        });
    }

// Mapa v patičce - kód který upravuje mapu v patičce tak aby vypadala více historicky  a zároveň zobrazuje místo sídla Pověstníku pomocí markeru. Kromě toho se přidává filtr pro vytvoření starobylého vzhledu mapy a používá se API klíč pro načítání dlaždic z externího zdroje.
    const mapElement = document.getElementById('historical-map');
    if (mapElement && typeof L !== 'undefined') {
        var apiKey = '30fcd185-49ea-41f4-a088-55562103e2d3'; 
        var map = L.map('historical-map').setView([50.02702894315356, 15.204167729237522], 12);
        L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg?api_key=' + apiKey, {
            maxZoom: 16,
            attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://stamen.com/">Stamen Design</a>'
        }).addTo(map);

        mapElement.style.filter = "sepia(0.8) contrast(1.2) brightness(0.9) hue-rotate(-10deg)";

        L.circleMarker([50.02702894315356, 15.204167729237522], {
            radius: 8, fillColor: "#8b0000", weight: 2, opacity: 1, fillOpacity: 0.8
        }).addTo(map).bindPopup("<b>Sídlo Pověstníku</b>");
    }

// Formulář pro kontaktování    -   Slouží k posílání dotazů které se spolu s emailem který uživatel zadá ukladají do databáze a následně se odesílají na email administrátorů. Po úspěšném odeslání se zobrazí modální okno s potvrzením o úspěšném odeslání a formulář se resetuje.
    const questionForm = document.getElementById('questionForm');
    if (questionForm) {
        questionForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            const formData = new FormData(this);
            const responseDiv = document.getElementById('responseMessage');
            const currentForm = this;

            fetch('contact.php', { method: 'POST', body: formData })
            .then(response => {
                if (response.ok) {
                    if (responseDiv) responseDiv.style.display = 'block';
                    currentForm.reset();
                    setTimeout(() => { if (responseDiv) responseDiv.style.display = 'none'; }, 3000);
                } else {
                    alert("Server error. Please try again later.");
                }
            })
            .catch(error => console.error('Error:', error));
        });
    }

// COOKIES - Logika pro fungování cookies lišty a spodních tlačítek která umožňují uživatelům přijmout cookies nebo je odmítnout a znovu zobrazit lištu pro výběr cookies. Tato logika využívá localStorage pro ukládání stavu souhlasu s cookies a Bootstrap pro správu modálních oken.
    const cookieBar = document.getElementById('cookie-bar');
    const acceptBtn = document.getElementById('accept-cookies');
    const revokeBtn = document.getElementById('btn-revoke-everything');
    const storageKey = 'momentum_cookies_accepted';

    if (cookieBar && !localStorage.getItem(storageKey)) {
        setTimeout(() => { cookieBar.classList.add('show-cookie-bar'); }, 1000);
    }

    if (acceptBtn) {
        acceptBtn.addEventListener('click', function() {
            localStorage.setItem(storageKey, 'true');
            cookieBar.classList.remove('show-cookie-bar');
        });
    }

    if (revokeBtn && typeof bootstrap !== 'undefined') {
        revokeBtn.addEventListener('click', function() {
            localStorage.removeItem(storageKey);
            const modalEl = document.getElementById('cookieSettingsModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            if (modalInstance) {
                modalInstance.hide();
                modalEl.addEventListener('hidden.bs.modal', function () {
                    setTimeout(() => { cookieBar.classList.add('show-cookie-bar'); }, 100);
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

// Modální okno pro podporu projektu - generuje qr kódy s částkou zadanou uživatelem a zobrazuje je v modálním okně, které se otevře po stisknutí tlačítka "Podpořit projekt"
    const MOJE_CISLO_UCTU = "4320757043";
    const MUJ_KOD_BANKY = "0800";       
    const ZPRAVA = "Podpora projektu";
    
    const ucetElement = document.getElementById('zobrazenyUcet');
    if (ucetElement) {
        ucetElement.innerText = MOJE_CISLO_UCTU + "/" + MUJ_KOD_BANKY;
    }

    window.otevritModal = function() {
        const modal = document.getElementById("platebniModal");
        if (modal) {
            modal.style.display = "block";
            window.generovatQR();
        }
    };

    window.zavritModal = function() {
        const modal = document.getElementById("platebniModal");
        if (modal) modal.style.display = "none";
    };

    window.generovatQR = function() {
        const castkaInput = document.getElementById("castkaInput");
        const qrImg = document.getElementById("qrObrazek");
        const qrText = document.getElementById("nacitaciText");
        if (castkaInput && qrImg && castkaInput.value > 0) {
            const url = `https://api.paylibo.com/paylibo/generator/czech/image?accountNumber=${MOJE_CISLO_UCTU}&bankCode=${MUJ_KOD_BANKY}&amount=${castkaInput.value}&currency=CZK&message=${encodeURIComponent(ZPRAVA)}`;
            qrImg.src = url;
            qrImg.style.display = "block";
            if (qrText) qrText.style.display = "none";
        }
    };

    window.onclick = function(event) {
        const platebniModal = document.getElementById("platebniModal");
        if (event.target == platebniModal) window.zavritModal();
    };

//  Funkce pro funkčnost pohybu karet s pověstmi - tato funkce umožňuje posouvat karty s pověstmi v karuselu pomocí tlačítek pro posouvání. Vypočítává šířku jednotlivých položek a posouvá obsah karuselu o tuto šířku v požadovaném směru s plynulou animací.
    window.scrollCarousel = function(direction) {
        const track = document.getElementById('track');
        if (track) {
            const item = track.querySelector('.povest-item');
            if (item) {
                const itemWidth = item.offsetWidth + 20; 
                track.scrollBy({ left: direction * itemWidth, behavior: 'smooth' });
            }
        }
    };

});

// Toto je funkce, která zajišťuje vybrání náhodné stránky u společného bodu

function randomRedirect(event, url1, url2) {
    event.preventDefault(); 
    const finalUrl = Math.random() < 0.5 ? url1 : url2;
    window.location.href = finalUrl;
}


// Tento kód se týká hudebního přehrávače, který umožňuje přehrávat skladby z předdefinovaného playlistu. Uživatel může ovládat přehrávání, posouvat se mezi skladbami, upravovat hlasitost a sledovat aktuální čas a délku skladby. Kromě toho se automaticky přechází na další skladbu po skončení aktuální a zobrazuje se název právě přehrávané skladby.

const playlist = [
    { title: "Královský posel", src: "data/hudba/1.opus" },
    { title: "Úsvit nad knížectvím", src: "data/hudba/2.opus" },
    { title: "Poutníkova píseň", src: "data/hudba/3.opus" },
    { title: "Dvorská veselice", src: "data/hudba/4.opus" },
    { title: "Zlatý věk", src: "data/hudba/5.opus" },
    { title: "Šepot starých zdí", src: "data/hudba/6.opus" },
    { title: "Tržiště v podhradí", src: "data/hudba/7.opus" },
    { title: "Legenda o meči", src: "data/hudba/8.opus" },
    { title: "Stráž u ohniště", src: "data/hudba/9.opus" },
    { title: "Kronika zapomenutých časů", src: "data/hudba/10.opus" },
    { title: "Turnajové klání", src: "data/hudba/11.opus" },
    { title: "Královská cesta", src: "data/hudba/12.opus" },
    { title: "Balada o zapomenuté lásce", src: "data/hudba/13.opus" },
    { title: "Lov v hlubokých hvozdech", src: "data/hudba/14.opus" },
    { title: "U kulatého stolu", src: "data/hudba/15.opus" },
    { title: "Ozvěny bitevního pole", src: "data/hudba/16.opus" },
    { title: "Tanec v hodovní síni", src: "data/hudba/17.opus" },
    { title: "Příslib nového věku", src: "data/hudba/18.opus" }
];

let currentIdx = 0;
const audio = new Audio(playlist[currentIdx].src);
const playBtn = document.getElementById('playBtn');
const trackTitle = document.getElementById('trackTitle');
const radioPanel = document.getElementById('radioPanel');
const progressSlider = document.getElementById('progressSlider');
const volumeSlider = document.getElementById('volumeSlider');
const currentTimeEl = document.getElementById('currentTime');
const durationTimeEl = document.getElementById('durationTime');
audio.volume = volumeSlider.value;
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
};
progressSlider.oninput = () => {
    const seekTime = (progressSlider.value / 100) * audio.duration;
    audio.currentTime = seekTime;
};
volumeSlider.oninput = () => {
    audio.volume = volumeSlider.value;
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
    audio.play();
    playBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
    updateTitle();
}
audio.onended = nextTrack;
updateTitle();