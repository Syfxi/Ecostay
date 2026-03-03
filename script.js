const pkgData = {
    "LITE": { p: 150, free: 2 },
    "STANDARD": { p: 220, free: 4 },
    "HEAVY-DUTY": { p: 350, free: 6 }
};

let curK = "STANDARD", lQty = 4, isInst = false, dur = 12;

function openModal(k, p, free) {
    curK = k; lQty = free;
    document.getElementById('pkgValue').innerText = `${k} Pack - RM ${p}/unit`;
    document.getElementById('l-qty').innerText = lQty;
    calculateGrandTotal();
    document.getElementById('orderModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('orderModal').classList.add('hidden');
}

// Custom Dropdown Logic
function toggleDropdown(id) {
    document.getElementById(id).classList.toggle('show');
}

function selectPkg(k, p, free) {
    curK = k; lQty = free;
    document.getElementById('pkgValue').innerText = `${k} Pack - RM ${p}/unit`;
    document.getElementById('l-qty').innerText = lQty;
    document.querySelectorAll('#pkgOptions .dropdown-option').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('pkgOptions').classList.remove('show');
    calculateGrandTotal();
}

function selectDuration(m) {
    dur = m;
    document.getElementById('durValue').innerText = `${m} Months`;
    document.querySelectorAll('#durOptions .dropdown-option').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('durOptions').classList.remove('show');
    calculateGrandTotal();
}

// Logic Updaters
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
    isInst = v;
    document.getElementById('installment-ui').classList.toggle('hidden', !v);
    document.getElementById('total-label').innerText = v ? 'Monthly Commitment' : 'Estimated Total';
    calculateGrandTotal();
}

function calculateGrandTotal() {
    const rQty = parseInt(document.getElementById('roomQty').value);
    const pkg = pkgData[curK];
    
    // Logic: Base Price + (Extra Lanyards * Price)
    let perRoom = pkg.p;
    let extraL = Math.max(0, lQty - pkg.free);
    perRoom += (extraL * 5); // RM5 per extra lanyard
    
    if(document.getElementById('w-check').checked) {
        perRoom += 100; // RM100 warranty
    }

    let total = perRoom * rQty;
    
    if(isInst) {
        total = total / dur;
    }

    document.getElementById('live-total').innerText = `RM ${total.toFixed(2)}`;
    return total;
}

// Navigation Logic
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
    document.getElementById('submitting-area').classList.remove('hidden');
    setTimeout(() => { generateInvoice(); }, 2000);
}

function generateInvoice() {
    const rQty = parseInt(document.getElementById('roomQty').value);
    const total = calculateGrandTotal();
    const date = new Date();
    
    // Header Info
    document.getElementById('inv-id').innerText = `RNSS-INV-${date.getFullYear()}-${Math.floor(Math.random()*9000+1000)}`;
    document.getElementById('inv-date').innerText = date.toLocaleDateString('en-GB');
    
    // Billing Info
    document.getElementById('out-name').innerText = document.getElementById('billName').value;
    document.getElementById('out-email').innerText = document.getElementById('billEmail').value;
    document.getElementById('out-inst').innerText = document.getElementById('billInst').value;
    document.getElementById('out-addr').innerText = document.getElementById('billAddr').value;
    
    // Totals
    document.getElementById('out-total').innerText = `RM ${total.toFixed(2)}`;
    document.getElementById('final-label').innerText = isInst ? `Monthly Payment (${dur} Months)` : 'Grand Total';

    // Rows
    let rows = `<tr><td class="py-4 px-4 border-b border-slate-50">${curK} Industrial Smart Unit</td><td class="text-center border-b border-slate-50">${rQty}</td><td class="text-right px-4 border-b border-slate-50">RM ${(pkgData[curK].p * rQty).toFixed(2)}</td></tr>`;
    
    let extraL = Math.max(0, lQty - pkgData[curK].free);
    if(extraL > 0) {
        rows += `<tr><td class="py-4 px-4 border-b border-slate-50">Extra Lanyards</td><td class="text-center border-b border-slate-50">${extraL * rQty}</td><td class="text-right px-4 border-b border-slate-50">RM ${(extraL * 5 * rQty).toFixed(2)}</td></tr>`;
    }
    
    if(document.getElementById('w-check').checked) {
        rows += `<tr><td class="py-4 px-4 border-b border-slate-50">2-Year Warranty Extension</td><td class="text-center border-b border-slate-50">${rQty}</td><td class="text-right px-4 border-b border-slate-50">RM ${(100 * rQty).toFixed(2)}</td></tr>`;
    }

    document.getElementById('invoice-rows').innerHTML = rows;
    document.getElementById('submitting-area').classList.add('hidden');
    document.getElementById('invoice-area').classList.remove('hidden');
}

// Close Dropdowns on Click Outside
window.onclick = function(e) {
    if (!e.target.closest('.custom-dropdown')) {
        document.querySelectorAll('.dropdown-options').forEach(o => o.classList.remove('show'));
    }
}