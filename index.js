// AI  -   Logika, která řeší propojení stisknutí tlačítka s php a nasledné otevření modálního okna. Taktéž se stará o převedení pověsti do stažitelného PDF souboru

const form = document.getElementById('povestForm');
    const modalElement = document.getElementById('vysledekModal');
    const modal = new bootstrap.Modal(modalElement);

    form.onsubmit = async (e) => {
        e.preventDefault();
        const btn = document.getElementById('genBtn');
        
        btn.disabled = true;
        btn.innerText = 'Kronikář brousí brko (píši dlouhou pověst)...';

        const formData = new FormData(form);
        try {
            const resp = await fetch('index.php', { method: 'POST', body: formData });
            const result = await resp.json();

            if (result.error) {
                alert(result.error);
            } else {
                document.getElementById('vystupText').innerText = result.text;
                document.getElementById('pdf-text-content').innerText = result.text;
                
                modal.show();
            }
        } catch (err) {
            console.error(err);
            alert('Chyba serveru. Zkontrolujte připojení k databázi.');
        } finally {
            btn.disabled = false;
            btn.innerText = 'Vytvořit pověst';
        }
    };

    function stahnoutPDF() {
        const element = document.getElementById('pdf-export-area');
        element.style.display = 'block';
        
        const opt = {
            margin: [15, 15],
            filename: 'povest.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            element.style.display = 'none';
        });
    }





// Mapa v patičce   -   využívá data ze služeb a pomocí filtru se upravuje tak že vypadá jako kdyby byla velmi stará 

  var map = L.map('historical-map').setView([50.02702894315356, 15.204167729237522], 12);

  L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg', {
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