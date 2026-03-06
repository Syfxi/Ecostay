const pkgData = { "LITE": 150, "STANDARD": 220, "HEAVY-DUTY": 350 };
let curK = "STANDARD", curPrice = 220, rQty = 1, sIdx = 0;
const scriptURL = 'https://script.google.com/macros/s/AKfycby4sgZ0XV9GEmX8fqaBYBF8SubMJ4utZpu4htgTurIQ82lurlt3VtVk7oWv03ikWf3ldQ/execPT_KAU'; // Sila ganti dengan URL Web App anda

function openModal(k, p) {
    curK = k; curPrice = p; rQty = 1;
    document.getElementById('pkgValue').innerText = `${k} Pack - RM ${p}/unit`;
    document.getElementById('roomQty').value = 1;
    calculateGrandTotal();
    document.getElementById('orderModal').classList.remove('hidden');
}

function closeModal() { document.getElementById('orderModal').classList.add('hidden'); }

function updateRooms(v) {
    rQty = Math.max(1, rQty + v);
    document.getElementById('roomQty').value = rQty;
    calculateGrandTotal();
}

function calculateGrandTotal() {
    let total = curPrice * rQty;
    document.getElementById('live-total').innerText = `RM ${total.toFixed(2)}`;
    return `RM ${total.toFixed(2)}`;
}

function goToStep2() {
    document.getElementById('step-1-form').classList.add('hidden');
    document.getElementById('step-2-form').classList.remove('hidden');
}

async function handleSubmit() {
    const invID = `RNSS-INV-${Date.now()}`;
    const totalRM = calculateGrandTotal();
    
    const params = new URLSearchParams({
        inv_id: invID,
        name: document.getElementById('billName').value,
        phone: document.getElementById('billPhone').value,
        institution: document.getElementById('billInst').value,
        address: document.getElementById('billAddr').value,
        package: curK,
        rooms: rQty,
        total: totalRM
    });

    // Hantar ke Google Sheets
    fetch(scriptURL, { method: 'POST', body: params, mode: 'no-cors' });

    // Papar Invois
    document.getElementById('inv-id').innerText = invID;
    document.getElementById('out-name').innerText = document.getElementById('billName').value;
    document.getElementById('out-inst').innerText = document.getElementById('billInst').value;
    document.getElementById('out-total').innerText = totalRM;

    document.getElementById('step-2-form').classList.add('hidden');
    document.getElementById('invoice-area').classList.remove('hidden');
}

function moveSlide(n) {
    const s = document.getElementById('slider');
    sIdx = (sIdx + n + 2) % 2; // Mengikut bilangan testimoni
    s.style.transform = `translateX(-${sIdx * 100}%)`;
}

async function snapAndDownloadPDF() {
    const { jsPDF } = window.jspdf;
    const element = document.getElementById('invoice-snap-area');
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
    pdf.save(`RNSS_INVOICE.pdf`);
}