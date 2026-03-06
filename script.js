const pkgData = { "LITE": { p: 150, f: 2 }, "STANDARD": { p: 220, f: 4 }, "HEAVY-DUTY": { p: 350, f: 6 } };
let curK = "STANDARD", lQty = 4, isI = false, iD = 12, sIdx = 0;

// Testimonial Slider
function moveSlide(n) {
    const s = document.getElementById('slider');
    if (!s) return;
    sIdx = (sIdx + n + 5) % 5;
    s.style.transform = `translateX(-${sIdx * 100}%)`;
}
setInterval(() => moveSlide(1), 6000);

// Modal Controls
function openModal(k, p, f) {
    curK = k; lQty = f;
    document.getElementById('pkgValue').innerText = `${k} Pack - RM ${p}/unit`;
    document.getElementById('l-qty').innerText = lQty;
    document.getElementById('roomQty').value = 1;
    document.getElementById('w-check').checked = false;
    calculateGrandTotal();
    setTimeout(() => { document.getElementById('orderModal').classList.remove('hidden'); backToStep1(); }, 300);
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

function selectDuration(m) {
    iD = m;
    document.getElementById('durValue').innerText = `${m} Months`;
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

function toggleInstallment(v) {
    isI = v;
    document.getElementById('installment-ui').classList.toggle('hidden', !v);
    document.getElementById('total-label').innerText = v ? 'Monthly Commitment' : 'Estimated Total';
    calculateGrandTotal();
}

function calculateGrandTotal() {
    const rQ = parseInt(document.getElementById('roomQty').value) || 1;
    const pkg = pkgData[curK];
    let perR = pkg.p;
    let extraL = Math.max(0, lQty - pkg.f);
    perR += (extraL * 5); 
    if(document.getElementById('w-check').checked) perR += 100;
    let total = perR * rQ;
    if(isI) total = total / iD;
    document.getElementById('live-total').innerText = `RM ${total.toFixed(2)}`;
    return total;
}

function goToStep2() { 
    const f1 = document.getElementById('step-1-form');
    f1.style.opacity = '0';
    setTimeout(() => { f1.classList.add('hidden'); document.getElementById('step-2-form').classList.remove('hidden'); document.getElementById('step-2-form').style.opacity = '1'; }, 400);
}

function backToStep1() {
    document.getElementById('step-2-form').classList.add('hidden');
    document.getElementById('invoice-area').classList.add('hidden');
    document.getElementById('step-1-form').classList.remove('hidden');
    document.getElementById('step-1-form').style.opacity = '1';
}

// PEMBETULAN HANDLE SUBMIT (SUSUNAN DATA)
async function handleSubmit() {
    const scriptURL = 'https://script.google.com/macros/s/AKfycby3fCfRme2QhtNpAxnZu897I_s2MOQpWCq2QHg91ncR6Ak7Z8V5TYOS2rPHkfRxnrqM-A/exec'; 
    
    // 1. Cipta ID dulu sebelum hantar!
    const date = new Date();
    const newInvID = `RNSS-INV-${date.getFullYear()}-${Math.floor(Math.random()*9000+1000)}`;
    
    // 2. Kumpul data
    const formData = new FormData();
    formData.append('inv_id', newInvID); // Guna ID baru
    formData.append('name', document.getElementById('billName').value);
    formData.append('email', document.getElementById('billEmail').value);
    formData.append('phone', document.getElementById('billPhone').value);
    formData.append('institution', document.getElementById('billInst').value);
    formData.append('address', document.getElementById('billAddr').value);
    formData.append('package', curK);
    formData.append('rooms', document.getElementById('roomQty').value);
    formData.append('total', document.getElementById('live-total').innerText);

    // 3. Hantar (Guna mode: no-cors untuk elak block)
    fetch(scriptURL, { method: 'POST', body: formData, mode: 'no-cors' })
    .then(() => console.log('Data sent!'))
    .catch(err => console.error(err));

    // 4. Teruskan ke Invois & masukkan ID yang sama
    const f2 = document.getElementById('step-2-form');
    f2.style.opacity = '0';
    setTimeout(() => {
        f2.classList.add('hidden');
        generateInvoice(newInvID); // Pass ID ke sini
    }, 400);
}

function generateInvoice(fixedID) {
    const rQ = parseInt(document.getElementById('roomQty').value);
    const total = calculateGrandTotal();
    const date = new Date();
    
    // Guna ID yang dihantar tadi
    document.getElementById('inv-id').innerText = fixedID;
    document.getElementById('inv-date').innerText = date.toLocaleDateString('en-GB');
    
    document.getElementById('out-name').innerText = document.getElementById('billName').value;
    document.getElementById('out-email').innerText = document.getElementById('billEmail').value;
    document.getElementById('out-inst').innerText = document.getElementById('billInst').value;
    document.getElementById('out-phone').innerText = `Ph: ${document.getElementById('billPhone').value}`;
    document.getElementById('out-addr').innerText = document.getElementById('billAddr').value;
    document.getElementById('out-total').innerText = `RM ${total.toFixed(2)}`;
    document.getElementById('final-label').innerText = isI ? `Monthly Payment (${iD}m)` : 'Grand Total';

    let rows = `<tr><td>${curK} Industrial Smart Unit</td><td style="text-align:center">${rQ}</td><td style="text-align:right">RM ${(pkgData[curK].p * rQ).toFixed(2)}</td></tr>`;
    let extraL = Math.max(0, lQty - pkgData[curK].f);
    if(extraL > 0) rows += `<tr><td>Extra Lanyards (Custom Branded)</td><td style="text-align:center">${extraL * rQ}</td><td style="text-align:right">RM ${(extraL * 5 * rQ).toFixed(2)}</td></tr>`;
    if(document.getElementById('w-check').checked) rows += `<tr><td>Extended Warranty (2-Year)</td><td style="text-align:center">${rQ}</td><td style="text-align:right">RM ${(100 * rQ).toFixed(2)}</td></tr>`;
    rows += `<tr><td>3-Month Energy Audit Report</td><td style="text-align:center">${rQ}</td><td style="text-align:right">FREE</td></tr>`;

    document.getElementById('invoice-rows').innerHTML = rows;
    document.getElementById('invoice-area').classList.remove('hidden');
    document.getElementById('invoice-area').style.opacity = '1';
}

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

window.onclick = function(e) { if (!e.target.closest('.custom-dropdown')) { document.querySelectorAll('.dropdown-options').forEach(o => o.classList.remove('show')); } }
