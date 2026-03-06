const pkgData = { 
    "LITE": { p: 150, f: 2 }, 
    "STANDARD": { p: 220, f: 4 }, 
    "HEAVY-DUTY": { p: 350, f: 6 } 
};
let curK = "STANDARD", lQty = 4, isI = false, iD = 12, sIdx = 0;

// 1. SETTING POSMEN (PASTIKAN URL NI BETUL)
const scriptURL = 'https://script.google.com/macros/s/AKfycbz8IVMcgHPWmjKdftRC77Mry57ydMRjpQUWkOkMH-Oa9S-b-1AgPJJFzW35NfWu_bFjdA/exec'; 

// --- FUNGSI MODAL & NAVIGASI ---
function openModal(k, p, f) {
    curK = k; lQty = f;
    document.getElementById('pkgValue').innerText = `${k} Pack - RM ${p}/unit`;
    document.getElementById('l-qty').innerText = lQty;
    document.getElementById('roomQty').value = 1;
    document.getElementById('w-check').checked = false;
    calculateGrandTotal();
    document.getElementById('orderModal').classList.remove('hidden');
    backToStep1();
}

function closeModal() {
    document.getElementById('orderModal').classList.add('hidden');
}

function goToStep2() { 
    document.getElementById('step-1-form').classList.add('hidden');
    document.getElementById('step-2-form').classList.remove('hidden');
    document.getElementById('step-2-form').style.opacity = '1';
}

function backToStep1() {
    document.getElementById('step-2-form').classList.add('hidden');
    document.getElementById('invoice-area').classList.add('hidden');
    document.getElementById('step-1-form').classList.remove('hidden');
}

// --- LOGIK PENGIRAAN ---
function calculateGrandTotal() {
    const rQ = parseInt(document.getElementById('roomQty').value) || 1;
    const pkg = pkgData[curK];
    let perR = pkg.p;
    let extraL = Math.max(0, lQty - pkg.f);
    perR += (extraL * 5); 
    if(document.getElementById('w-check').checked) perR += 100;
    let total = perR * rQ;
    if(isI) total = total / iD;
    const finalTotal = `RM ${total.toFixed(2)}`;
    document.getElementById('live-total').innerText = finalTotal;
    return finalTotal;
}

function updateRooms(v) {
    const el = document.getElementById('roomQty');
    el.value = Math.max(1, parseInt(el.value) + v);
    calculateGrandTotal();
}

// --- PENGHANTARAN DATA KE GOOGLE SHEETS ---
async function handleSubmit() {
    const date = new Date();
    const invID = `RNSS-INV-${date.getFullYear()}-${Math.floor(Math.random()*9000+1000)}`;
    const totalRM = calculateGrandTotal();

    // Gunakan URLSearchParams (Paling stabil untuk Google Sheets)
    const params = new URLSearchParams();
    params.append('inv_id', invID);
    params.append('name', document.getElementById('billName').value);
    params.append('email', document.getElementById('billEmail').value);
    params.append('phone', document.getElementById('billPhone').value);
    params.append('institution', document.getElementById('billInst').value);
    params.append('address', document.getElementById('billAddr').value);
    params.append('package', curK);
    params.append('rooms', document.getElementById('roomQty').value);
    params.append('total', totalRM);

    console.log("Menghantar data...");

    // Hantar data secara "silence"
    fetch(scriptURL, { method: 'POST', body: params, mode: 'no-cors' })
    .then(() => console.log("Berjaya hantar ke Sheets!"))
    .catch(err => console.error("Gagal hantar:", err));

    // Papar Invois
    generateInvoice(invID, totalRM);
    
    document.getElementById('step-2-form').classList.add('hidden');
    document.getElementById('invoice-area').classList.remove('hidden');
    document.getElementById('invoice-area').style.opacity = '1';
}

function generateInvoice(id, total) {
    document.getElementById('inv-id').innerText = id;
    document.getElementById('inv-date').innerText = new Date().toLocaleDateString('en-GB');
    document.getElementById('out-name').innerText = document.getElementById('billName').value;
    document.getElementById('out-email').innerText = document.getElementById('billEmail').value;
    document.getElementById('out-inst').innerText = document.getElementById('billInst').value;
    document.getElementById('out-phone').innerText = document.getElementById('billPhone').value;
    document.getElementById('out-addr').innerText = document.getElementById('billAddr').value;
    document.getElementById('out-total').innerText = total;
}

// --- TUTUP MODAL BILA KLIK LUAR ---
window.onclick = function(event) {
    const modal = document.getElementById('orderModal');
    // Jika user klik kawasan gelap/luar kotak putih
    if (event.target == modal) {
        closeModal();
    }
    
    // Tutup dropdown
    if (!event.target.closest('.custom-dropdown')) { 
        document.querySelectorAll('.dropdown-options').forEach(o => o.classList.remove('show')); 
    } 
}

// --- SLIDER TESTIMONI ---
function moveSlide(n) {
    const s = document.getElementById('slider');
    if (!s) return;
    sIdx = (sIdx + n + 5) % 5;
    s.style.transform = `translateX(-${sIdx * 100}%)`;
}
setInterval(() => moveSlide(1), 6000);

// --- DOWNLOAD PDF ---
async function snapAndDownloadPDF() {
    const { jsPDF } = window.jspdf;
    const element = document.getElementById('invoice-snap-area');
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`RNSS_INVOICE_${document.getElementById('inv-id').innerText}.pdf`);
}
