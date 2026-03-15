// AI  -  Logika, která řeší propojení stisknutí tlačítka s php a nasledné otevření modálního okna. Taktéž se stará o převedení pověsti do stažitelného PDF souboru

const form = document.getElementById('povestForm');
const modalElement = document.getElementById('vysledekModal');
const modal = new bootstrap.Modal(modalElement);

form.onsubmit = async (e) => {
    e.preventDefault();
    
    // Oprava: Najdeme button a obrázek uvnitř zvlášť
    const submitBtn = form.querySelector('button[type="submit"]');
    const imgInside = document.getElementById('genBtn'); 
    
    // Obrázek nemá vlastnost innerText, proto mu nastavíme průhlednost jako indikaci načítání
    submitBtn.disabled = true;
    if (imgInside) imgInside.style.opacity = "0.5";

    const formData = new FormData(form);
    try {
        const resp = await fetch('index.php', { method: 'POST', body: formData });
        
        // Pokud server vrátí chybu (např. 500), vyhodíme výjimku do catch bloku
        if (!resp.ok) {
            throw new Error('Server odpověděl chybou ' + resp.status);
        }

        const result = await resp.json();

        if (result.error) {
            alert(result.error);
        } else {
            // Naplníme modal i skrytou oblast pro PDF
            document.getElementById('vystupText').innerText = result.text;
            
            const pdfContent = document.getElementById('pdf-text-content');
            if (pdfContent) pdfContent.innerText = result.text;
            
            modal.show();
        }
    } catch (err) {
        console.error(err);
        // Teď už alert vypíše i konkrétní chybu, pokud ji najde
        alert('Chyba serveru: ' + err.message + '\nZkontrolujte připojení k databázi.');
    } finally {
        submitBtn.disabled = false;
        if (imgInside) imgInside.style.opacity = "1";
    }
};

function stahnoutPDF() {
    // 1. Najdeme obsah, který vygenerovala AI
    const textZAI = document.getElementById('vystupText').innerText;
    const exportArea = document.getElementById('pdf-export-area');
    const textContent = document.getElementById('pdf-text-content');

    if (!exportArea || !textContent) {
        alert("Chyba: V HTML chybí element 'pdf-export-area' pro generování PDF.");
        return;
    }

    // 2. Vložíme text do exportní oblasti (která má to hezké pozadí)
    textContent.innerText = textZAI;

    // 3. Dočasně zobrazíme oblast pro "vyfocení" (html2pdf ji musí vidět)
    exportArea.style.display = 'block';

    const opt = {
        margin: [15, 15],
        filename: 'tajna_povest.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(exportArea).save().then(() => {
        exportArea.style.display = 'none';
    });
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