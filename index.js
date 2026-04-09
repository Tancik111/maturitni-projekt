// AI  -  Logika, která řeší propojení stisknutí tlačítka s php a nasledné otevření modálního okna. Taktéž se stará o převedení pověsti do stažitelného PDF souboru


const form = document.getElementById('povestForm');
const modalElement = document.getElementById('vysledekModal');
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
            document.getElementById('vystupText').innerText = result.text;
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

// Mapa v patičce - kód který upravuje mapu v patičce tak aby vypadala více historicky

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

// Formulář pro kontaktování    -   Slouží k posílání dotazů které se spolu s emailem který uživatel zadá ukladají do databáze

document.getElementById('questionForm').addEventListener('submit', function(e) {
    e.preventDefault(); 

    const formData = new FormData(this);
    const responseDiv = document.getElementById('responseMessage');
    const form = this;

    fetch('contact.php', {
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

// COOKIES - Logika pro fungování cookies lišty a spodních tlačítek

document.addEventListener("DOMContentLoaded", function() {
    const cookieBar = document.getElementById('cookie-bar');
    const acceptBtn = document.getElementById('accept-cookies');
    const revokeBtn = document.getElementById('btn-revoke-everything');
    const storageKey = 'momentum_cookies_accepted';

    // 1. Zobrazení lišty po načtení
    if (!localStorage.getItem(storageKey)) {
        setTimeout(() => {
            cookieBar.classList.add('show-cookie-bar');
        }, 1000);
    }

    // 2. Tlačítko SOUHLASÍM
    if (acceptBtn) {
        acceptBtn.addEventListener('click', function() {
            localStorage.setItem(storageKey, 'true');
            cookieBar.classList.remove('show-cookie-bar');
        });
    }

    // 3. Tlačítko ODEBRAT (Opravená logika)
    if (revokeBtn) {
        revokeBtn.addEventListener('click', function() {
            // Smažeme záznam
            localStorage.removeItem(storageKey);
            
            // Najdeme otevřený modál a zavřeme ho přes Bootstrap API
            const modalEl = document.getElementById('cookieSettingsModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            
            if (modal) {
                modal.hide();

                // Počkáme, až modál úplně zmizí (včetně backdropu), pak ukážeme lištu
                modalEl.addEventListener('hidden.bs.modal', function () {
                    setTimeout(() => {
                        cookieBar.classList.add('show-cookie-bar');
                    }, 100);
                }, { once: true }); // Spustí se jen jednou
            } else {
                // Pokud modál náhodou nebyl detekován, prostě lištu ukaž
                cookieBar.classList.add('show-cookie-bar');
            }
        });
    }

    // 4. Tlačítko NESOUHLASÍM v GDPR (přesměrování na Google)
    const gdprModal = document.getElementById('privacyModal');
    if (gdprModal) {
        // Najdeme druhé tlačítko (Nesouhlasím) uvnitř GDPR modálu
        const gdprDeclineBtn = gdprModal.querySelector('.modal-footer-btns button:last-child');
        
        if (gdprDeclineBtn) {
            gdprDeclineBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = "https://www.google.com";
            });
        }
    }
});
// Modální okno pro podporu projektu - generuje qr kódy s částkou zadanou uživatelem

    const MOJE_CISLO_UCTU = "4320757043";
    const MUJ_KOD_BANKY = "0800";       
    const ZPRAVA = "Podpora projektu";
    document.getElementById('zobrazenyUcet').innerText = MOJE_CISLO_UCTU + "/" + MUJ_KOD_BANKY;
    function otevritModal() {
        document.getElementById("platebniModal").style.display = "block";
        generovatQR();
    }
    function zavritModal() {
        document.getElementById("platebniModal").style.display = "none";
    }
    function generovatQR() {
        const castka = document.getElementById("castkaInput").value;
        const qrImg = document.getElementById("qrObrazek");
        const qrText = document.getElementById("nacitaciText");
        if (castka > 0) {
            const url = `https://api.paylibo.com/paylibo/generator/czech/image?accountNumber=${MOJE_CISLO_UCTU}&bankCode=${MUJ_KOD_BANKY}&amount=${castka}&currency=CZK&message=${encodeURIComponent(ZPRAVA)}`;
            qrImg.src = url;
            qrImg.style.display = "block";
            qrText.style.display = "none";
        }
    }
    window.onclick = function(event) {
        if (event.target == document.getElementById("platebniModal")) zavritModal();
    }

 
//  Funkce pro funkčnost pohybu karet s pověstmi
    
    function scrollCarousel(direction) {
        const track = document.getElementById('track');
        const itemWidth = track.querySelector('.povest-item').offsetWidth + 20; 
        track.scrollBy({ left: direction * itemWidth, behavior: 'smooth' });
        }    
    document.addEventListener("DOMContentLoaded", function() {
    const navLinks = document.querySelectorAll(".nav-link");
    const menu = document.getElementById("mainMenu");
    const bsCollapse = new bootstrap.Collapse(menu, { toggle: false });
    navLinks.forEach(function(link) {
        link.addEventListener("click", function() {
            if (window.innerWidth < 992) {
                bsCollapse.hide();
            }
        });
    });
});