const pkgData = { "LITE": { p: 150, f: 2 }, "STANDARD": { p: 220, f: 4 }, "HEAVY-DUTY": { p: 350, f: 6 } };
let curK = "STANDARD", lQty = 4, isI = false, iD = 12, sIdx = 0;

// GANTI URL NI DENGAN URL DARI LANGKAH 2 TADI
const scriptURL = 'https://script.google.com/macros/s/AKfycbzd2spUWCgMHunn93MaQdKYPfw7XTy9Utww-oJ-ggOj4HyAxIqQu83wwdVQUJtAn4gE6A/exec'; 

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
    document.getElementById('live-total').innerText = `RM ${total.toFixed(2)}`;
    return total;
}

// --- PENGHANTARAN DATA (PENTING) ---
async function handleSubmit() {
    // 1. Cipta ID & Tarikh
    const date = new Date();
    const invID = `RNSS-INV-${date.getFullYear()}-${Math.floor(Math.random()*9000+1000)}`;
    const totalRM = document.getElementById('live-total').innerText;

    // 2. Kumpul Data Borang
    const formData = new URLSearchParams();
    formData.append('inv_id', invID);
    formData.append('name', document.getElementById('billName').value);
    formData.append('email', document.getElementById('billEmail').value);
    formData.append('phone', document.getElementById('billPhone').value);
    formData.append('institution', document.getElementById('billInst').value);
    formData.append('address', document.getElementById('billAddr').value);
    formData.append('package', curK);
    formData.append('rooms', document.getElementById('roomQty').value);
    formData.append('total', totalRM);

    // 3. Hantar secara senyap
    fetch(scriptURL, { 
        method: 'POST', 
        body: formData, 
        mode: 'no-cors' 
    }).then(() => console.log("Data Sent Successfully"));

    // 4. Papar Invois
    generateInvoice(invID);
    
    // Alihan skrin (Transition)
    document.getElementById('step-2-form').classList.add('hidden');
    document.getElementById('invoice-area').classList.remove('hidden');
    document.getElementById('invoice-area').style.opacity = '1';
}

function generateInvoice(id) {
    document.getElementById('inv-id').innerText = id;
    document.getElementById('inv-date').innerText = new Date().toLocaleDateString('en-GB');
    document.getElementById('out-name').innerText = document.getElementById('billName').value;
    document.getElementById('out-email').innerText = document.getElementById('billEmail').value;
    document.getElementById('out-inst').innerText = document.getElementById('billInst').value;
    document.getElementById('out-phone').innerText = `Ph: ${document.getElementById('billPhone').value}`;
    document.getElementById('out-addr').innerText = document.getElementById('billAddr').value;
    document.getElementById('out-total').innerText = document.getElementById('live-total').innerText;
}

// --- FUNGSI TAMBAHAN (SLIDER, MODAL, DLL) ---
function openModal(k, p, f) {
    curK = k; lQty = f;
    document.getElementById('pkgValue').innerText = `${k} Pack - RM ${p}/unit`;
    document.getElementById('l-qty').innerText = lQty;
    calculateGrandTotal();
    document.getElementById('orderModal').classList.remove('hidden');
}

function updateRooms(v) {
    const el = document.getElementById('roomQty');
    el.value = Math.max(1, parseInt(el.value) + v);
    calculateGrandTotal();
}

function goToStep2() { 
    document.getElementById('step-1-form').classList.add('hidden');
    document.getElementById('step-2-form').classList.remove('hidden');
    document.getElementById('step-2-form').style.opacity = '1';
}
// (Tambahkan fungsi snapAndDownloadPDF kau yang lama di bawah ni)
