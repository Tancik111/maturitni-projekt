// AI  -  Logika, která řeší propojení stisknutí tlačítka s php a nasledné otevření modálního okna. Taktéž se stará o převedení pověsti do stažitelného PDF souboru

const form = document.getElementById('povestForm');
const modalElement = document.getElementById('vysledekModal');
const modal = new bootstrap.Modal(modalElement);

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Zabrání obnovení stránky
    
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
            // Vložíme text do modálu
            document.getElementById('vystupText').innerText = result.text;
            // Otevřeme modál
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

function stahnoutPDF() {
    const textZAI = document.getElementById('vystupText').innerText;

    if (!textZAI || textZAI.trim() === "") {
        alert("Pověst ještě není vygenerována.");
        return;
    }

    // Vytvoříme prvek, který budeme exportovat
    const element = document.createElement('div');
    
element.innerHTML = `
    <div style="
        /* Kontejner, který drží rozměr A4 */
        width: 210mm; 
        min-height: 297mm; 
        margin: 0 auto;
        padding: 25mm 30mm; 
        
        /* Klíčová oprava: Pozadí fixované na celou plochu */
        background-image: url('data/A4pergamen.png'); 
        background-size: 100% 100%; 
        background-attachment: fixed;
        background-repeat: repeat-y;
        background-color: #fdf5e6;
        
        font-family: 'Eagle Lake', serif; 
        color: #2c1a05;
        box-sizing: border-box;
        position: relative;
        z-index: 1;
    ">
        <h1 style="text-align: center; color: #4a0404; font-size: 28pt; margin-top: 0; margin-bottom: 25px; border-bottom: 2px solid #4a0404; padding-bottom: 10px;">
            Zápis v tajné kronice
        </h1>
        
        <div style="font-size: 14pt; line-height: 1.7; text-align: justify; white-space: pre-wrap;">
            ${textZAI}
        </div>

        <div style="margin-top: 40px; text-align: right; font-style: italic; font-size: 12pt; color: #5e3a1a; border-top: 1px solid rgba(74, 4, 4, 0.2); padding-top: 10px;">
            Pověstník - Oživujeme příběhy našich předků
        </div>
    </div>

    <style>
        /* Tento styl zajistí, že se při tisku nebude prvek trhat v půlce řádku */
        @media print {
            div { page-break-inside: auto; }
            h1 { page-break-after: avoid; }
        }
    </style>
`;

    // Nastavení exportu
    const opt = {
        margin: 0,
        filename: 'vlastni_povest.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            letterRendering: true,
            scrollY: 0
        },
        jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
    };

    // Spustíme export
    html2pdf().set(opt).from(element).save();
}
// Mapa v patičce   -   využívá data ze služeb a pomocí filtru se upravuje tak že vypadá jako kdyby byla velmi stará 

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
    const statusMsg = document.getElementById('cookie-status-msg');
    const storageKey = 'momentum_cookies_accepted';

    if (cookieBar && !localStorage.getItem(storageKey)) {
        cookieBar.classList.add('show-cookie-bar');
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
            if (statusMsg) statusMsg.classList.remove('d-none');
            revokeBtn.disabled = true; 
            setTimeout(() => {
                location.reload();
            }, 1000);
        });
    }
}); 