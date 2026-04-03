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

function stahnoutPDF() {
    const textZAI = document.getElementById('vystupText').innerText;

    if (!textZAI || textZAI.trim() === "") {
        alert("Pověst ještě není vygenerována.");
        return;
    }

    // Vytvoříme pomocný element pro tisk
    const element = document.createElement('div');
    
    // Automatické zmenšení písma, pokud je text delší než 1100 znaků
    const fontSize = textZAI.length > 1100 ? "12pt" : "14pt";

    element.innerHTML = `
        <div style="
            width: 595pt; 
            height: 842pt; 
            padding: 85pt 95pt; 
            box-sizing: border-box;
            background-image: url('data/A4pergamen.png'); 
            background-size: 100% 100%;
            background-repeat: no-repeat;
            font-family: 'Eagle Lake', serif; 
            color: #2c1a05;
            position: relative;
        ">
            <h1 style="
                text-align: center; 
                color: #4a0404; 
                font-size: 24pt; 
                margin: 0 0 25pt 0; 
                border-bottom: 2px solid #4a0404; 
                padding-bottom: 10px;
            ">Zápis v tajné kronice</h1>
            
            <div style="
                font-size: ${fontSize}; 
                line-height: 1.6; 
                text-align: justify; 
                white-space: pre-wrap;
            ">${textZAI}</div>
    `;

    const opt = {
        margin: 0,
        filename: 'vlastni_povest.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
    };

    // Spustíme export a smažeme případnou prázdnou druhou stranu
    html2pdf().set(opt).from(element).toPdf().get('pdf').then(function(pdf) {
        const pages = pdf.internal.getNumberOfPages();
        if (pages > 1) {
            pdf.deletePage(pages); // Smaže přebývající bílou stránku
        }
    }).save();
}



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

    if (!localStorage.getItem(storageKey)) {
        setTimeout(() => cookieBar.classList.add('show-cookie-bar'), 1000);
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
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.hide();
            setTimeout(() => {
                cookieBar.classList.add('show-cookie-bar');
            }, 600);
        });
    }
    const privacyToCookieBtn = document.querySelector('[data-bs-target="#cookieSettingsModal"]');
    if (privacyToCookieBtn) {
        privacyToCookieBtn.addEventListener('click', function() {
            const privacyModalEl = document.getElementById('privacyModal');
            const privacyModal = bootstrap.Modal.getInstance(privacyModalEl);
            if (privacyModal) {
                privacyModal.hide(); 
            }
        });
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