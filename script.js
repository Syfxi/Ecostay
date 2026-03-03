const pkgData = { "LITE": { p: 150, f: 2 }, "STANDARD": { p: 220, f: 4 }, "HEAVY-DUTY": { p: 350, f: 6 } };
let curK = "STANDARD", lQty = 4;

// Modal Controls
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

function closeModal() { document.getElementById('orderModal').classList.add('hidden'); }
function toggleDropdown(id) { document.getElementById(id).classList.toggle('show'); }

function selectPkg(k, p, f) {
    curK = k; lQty = f;
    document.getElementById('pkgValue').innerText = `${k} Pack - RM ${p}/unit`;
    document.getElementById('l-qty').innerText = lQty;
    document.querySelectorAll('.dropdown-options').forEach(o => o.classList.remove('show'));
    calculateGrandTotal();
}

function updateRooms(v) {
    const el = document.getElementById('roomQty');
    el.value = Math.max(1, parseInt(el.value) + v);
    calculateGrandTotal();
}

function updateLanyard(v) {
    lQty = Math.max(0, lQty + v);
    document.getElementById('l-qty').innerText = lQty;
    calculateGrandTotal();
}

function calculateGrandTotal() {
    const rQ = parseInt(document.getElementById('roomQty').value);
    const pkg = pkgData[curK];
    let perR = pkg.p;
    let extraL = Math.max(0, lQty - pkg.f);
    perR += (extraL * 5); 
    if(document.getElementById('w-check').checked) perR += 100;
    let total = perR * rQ;
    document.getElementById('live-total').innerText = `RM ${total.toFixed(2)}`;
    return total;
}

function goToStep2() { 
    document.getElementById('step-1-form').classList.add('hidden'); 
    document.getElementById('step-2-form').classList.remove('hidden'); 
}

function backToStep1() {
    document.getElementById('step-2-form').classList.add('hidden');
    document.getElementById('invoice-area').classList.add('hidden');
    document.getElementById('step-1-form').classList.remove('hidden');
}

function handleSubmit() {
    document.getElementById('step-2-form').classList.add('hidden');
    generateInvoice();
}

function generateInvoice() {
    const rQ = parseInt(document.getElementById('roomQty').value);
    const total = calculateGrandTotal();
    const date = new Date();
    
    document.getElementById('inv-id').innerText = `RNSS-INV-${date.getFullYear()}-${Math.floor(Math.random()*9000+1000)}`;
    document.getElementById('inv-date').innerText = date.toLocaleDateString('en-GB');
    document.getElementById('out-name').innerText = document.getElementById('billName').value;
    document.getElementById('out-email').innerText = document.getElementById('billEmail').value;
    document.getElementById('out-inst').innerText = document.getElementById('billInst').value;
    document.getElementById('out-addr').innerText = document.getElementById('billAddr').value;
    document.getElementById('out-total').innerText = `RM ${total.toFixed(2)}`;

    let rows = `<tr><td>${curK} Industrial Smart Unit</td><td style="text-align:center">${rQ}</td><td style="text-align:right">RM ${(pkgData[curK].p * rQ).toFixed(2)}</td></tr>`;
    let extraL = Math.max(0, lQty - pkgData[curK].f);
    if(extraL > 0) rows += `<tr><td>Complimentary Custom RFID Lanyards (Add-on)</td><td style="text-align:center">${extraL * rQ}</td><td style="text-align:right">RM ${(extraL * 5 * rQ).toFixed(2)}</td></tr>`;
    if(document.getElementById('w-check').checked) rows += `<tr><td>Extended Warranty (2-Year Protection)</td><td style="text-align:center">${rQ}</td><td style="text-align:right">RM ${(100 * rQ).toFixed(2)}</td></tr>`;
    
    // Static Option
    rows += `<tr><td>Free 3-Month Energy Audit Report</td><td style="text-align:center">${rQ}</td><td style="text-align:right">FREE</td></tr>`;

    document.getElementById('invoice-rows').innerHTML = rows;
    document.getElementById('invoice-area').classList.remove('hidden');
}

// PDF Generation Function
function downloadOfficialPDF() {
    const element = document.getElementById('invoice-print-area');
    const opt = {
        margin: 10,
        filename: 'RNSS_OFFICIAL_INVOICE.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}

// Global Click Close Dropdown
window.onclick = function(e) { if (!e.target.closest('.custom-dropdown')) { document.querySelectorAll('.dropdown-options').forEach(o => o.classList.remove('show')); } }