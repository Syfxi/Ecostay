const pkgData = { "LITE": { p: 150, f: 2 }, "STANDARD": { p: 220, f: 4 }, "HEAVY-DUTY": { p: 350, f: 6 } };
let curK = "STANDARD", lQty = 4, isI = false, iD = 12, sIdx = 0;

// Testimonial Auto-Swipe (5 Slide)
function moveSlide(n) {
    const s = document.getElementById('slider');
    if (!s) return;
    sIdx = (sIdx + n + 5) % 5;
    s.style.transform = `translateX(-${sIdx * 100}%)`;
}
setInterval(() => moveSlide(1), 6000); // Swipe every 6 seconds

// Modal Controls with Delay
function openModal(k, p, f) {
    curK = k; lQty = f;
    document.getElementById('pkgValue').innerText = `${k} Pack - RM ${p}/unit`;
    document.getElementById('l-qty').innerText = lQty;
    document.getElementById('roomQty').value = 1;
    document.getElementById('w-check').checked = false;
    calculateGrandTotal();
    
    // Smooth delay before showing modal
    setTimeout(() => {
        document.getElementById('orderModal').classList.remove('hidden');
        backToStep1(); 
    }, 300);
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
    const rQ = parseInt(document.getElementById('roomQty').value);
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

// Transitions with Delay
function goToStep2() { 
    const f1 = document.getElementById('step-1-form');
    f1.style.opacity = '0';
    setTimeout(() => {
        f1.classList.add('hidden');
        document.getElementById('step-2-form').classList.remove('hidden');
        document.getElementById('step-2-form').style.opacity = '1';
    }, 400);
}

function backToStep1() {
    document.getElementById('step-2-form').classList.add('hidden');
    document.getElementById('invoice-area').classList.add('hidden');
    document.getElementById('step-1-form').classList.remove('hidden');
    document.getElementById('step-1-form').style.opacity = '1';
}

function handleSubmit() {
    const f2 = document.getElementById('step-2-form');
    f2.style.opacity = '0';
    setTimeout(() => {
        f2.classList.add('hidden');
        generateInvoice();
    }, 400);
}

function generateInvoice() {
    const rQ = parseInt(document.getElementById('roomQty').value);
    const total = calculateGrandTotal();
    const date = new Date();
    document.getElementById('inv-id').innerText = `ECO-INV-${date.getFullYear()}-${Math.floor(Math.random()*9000+1000)}`;
    document.getElementById('inv-date').innerText = date.toLocaleDateString('en-GB');
    document.getElementById('out-name').innerText = document.getElementById('billName').value;
    document.getElementById('out-email').innerText = document.getElementById('billEmail').value;
    document.getElementById('out-inst').innerText = document.getElementById('billInst').value;
    document.getElementById('out-addr').innerText = document.getElementById('billAddr').value;
    document.getElementById('out-total').innerText = `RM ${total.toFixed(2)}`;
    document.getElementById('final-label').innerText = isI ? `Monthly Payment (${iD}m)` : 'Grand Total';

    let rows = `<tr><td style="padding:15px">${curK} Industrial Smart Unit</td><td style="text-align:center">${rQ}</td><td style="text-align:right;padding:15px">RM ${(pkgData[curK].p * rQ).toFixed(2)}</td></tr>`;
    let extraL = Math.max(0, lQty - pkgData[curK].f);
    if(extraL > 0) rows += `<tr><td style="padding:15px">Complimentary Custom RFID Lanyards</td><td style="text-align:center">${extraL * rQ}</td><td style="text-align:right;padding:15px">RM ${(extraL * 5 * rQ).toFixed(2)}</td></tr>`;
    if(document.getElementById('w-check').checked) rows += `<tr><td style="padding:15px">Extended Warranty (2-Year)</td><td style="text-align:center">${rQ}</td><td style="text-align:right;padding:15px">RM ${(100 * rQ).toFixed(2)}</td></tr>`;
    rows += `<tr><td style="padding:15px">3-Month Energy Audit Report</td><td style="text-align:center">${rQ}</td><td style="text-align:right;padding:15px">FREE</td></tr>`;

    document.getElementById('invoice-rows').innerHTML = rows;
    document.getElementById('invoice-area').classList.remove('hidden');
    document.getElementById('invoice-area').style.opacity = '1';
}

function downloadOfficialPDF() {
    const element = document.getElementById('invoice-print-area');
    const opt = {
        margin: 10, filename: 'ECOSTAY_INVOICE.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}

window.onclick = function(e) { if (!e.target.closest('.custom-dropdown')) { document.querySelectorAll('.dropdown-options').forEach(o => o.classList.remove('show')); } }
