const ptkpMap = {
    TK: [54000000, 58500000, 63000000, 67500000],
    K: [58500000, 63000000, 67500000, 72000000]
};

// Fungsi untuk menghapus semua karakter kecuali angka dari string Rupiah input
function parseRupiahToNumber(rupiah) {
    return Number(rupiah.replace(/[^0-9,-]+/g, ''));
}

// Fungsi untuk memformat angka menjadi format Rupiah dengan titik ribuan
function formatRupiah(angka) {
    if (!angka) return '';
    return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const inputBruto = document.getElementById('bruto');

inputBruto.addEventListener('input', (e) => {
    // Simpan posisi cursor semula
    let cursorPosition = inputBruto.selectionStart;

    // Hapus semua karakter non-digit
    let value = inputBruto.value.replace(/\D/g, '');

    // Jika kosong langsung set ke kosong dan return
    if (value === '') {
        inputBruto.value = '';
        return;
    }

    // Format angka menjadi Rupiah dengan titik ribuan
    let formattedValue = '';
    let numberValue = Number(value);

    if (isNaN(numberValue)) {
        inputBruto.value = '';
        return;
    }

    // Format angka ke Rupiah
    formattedValue = numberValue.toLocaleString('id-ID');

    inputBruto.value = formattedValue;

    // Logika untuk mengatur ulang posisi cursor secara tepat
    const lengthAfterFormat = formattedValue.length;
    const lengthBeforeFormat = value.length;
    const diff = lengthAfterFormat - lengthBeforeFormat;

    // Sesuaikan posisi cursor baru
    cursorPosition = cursorPosition + diff;
    inputBruto.setSelectionRange(cursorPosition, cursorPosition);
});

function hitungPajak(bruto, status, tanggungan, skema) {
    const ptkp = ptkpMap[status][tanggungan];
    const penghasilanSetahun = bruto * 12;
    let pkp = Math.max(penghasilanSetahun - ptkp, 0);
    let pajak = hitungPajakBerdasarkanPKP(pkp, skema);
    
    return {
        gajiSetahun: penghasilanSetahun,
        gajiSebulan: bruto,
        ptkp: ptkp,
        pkp: pkp,
        pajak: pajak,
        pajakPerBulan: pajak / 12
    };
}

function hitungPajakBerdasarkanPKP(pkp, skema) {
    let pajak = 0;
    if (pkp > 0) {
        if (pkp <= 60000000) {
            pajak = pkp * 0.05;
        } else if (pkp <= 250000000) {
            pajak = 60000000 * 0.05 + (pkp - 60000000) * 0.15;
        } else if (pkp <= 500000000) {
            pajak = 60000000 * 0.05 + 190000000 * 0.15 + (pkp - 250000000) * 0.25;
        } else {
            pajak = 60000000 * 0.05 + 190000000 * 0.15 + 250000000 * 0.25 + (pkp - 500000000) * 0.30;
        }
    }
    return skema === 'grossup' ? pajak * 1.1 : pajak;
}

document.getElementById('pphForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const brutoStr = document.getElementById('bruto').value;
    const bruto = parseRupiahToNumber(brutoStr);
    if (isNaN(bruto) || bruto <= 0) {
        document.getElementById('penjelasan').textContent = "Masukkan penghasilan bruto bulanan yang valid.";
        return;
    }

    const status = document.getElementById('status').value;
    const tanggungan = parseInt(document.getElementById('tanggungan').value);
    const skema = document.querySelector('input[name="skema"]:checked').value;

    const hasil = hitungPajak(bruto, status, tanggungan, skema);

    // Tampilkan hasil dengan format Rupiah
    document.getElementById('gajiSetahun').textContent = `Rp ${hasil.gajiSetahun.toLocaleString('id-ID')}`;
    document.getElementById('gajiSebulan').textContent = `Rp ${hasil.gajiSebulan.toLocaleString('id-ID')}`;
    document.getElementById('ptkpOutput').textContent = `Rp ${hasil.ptkp.toLocaleString('id-ID')}`;
    document.getElementById('pkp').textContent = `Rp ${hasil.pkp.toLocaleString('id-ID')}`;
    document.getElementById('pajakSetahun').textContent = `Rp ${hasil.pajak.toLocaleString('id-ID')}`;
    document.getElementById('pajakPerBulan').textContent = `Rp ${hasil.pajakPerBulan.toLocaleString('id-ID')}`;

    const penjelasan = hasil.pajakPerBulan > 0
        ? `Kamu termasuk lapisan pajak, membayar sekitar Rp ${hasil.pajakPerBulan.toLocaleString('id-ID')} per bulan.`
        : "Penghasilan Anda tidak dikenakan pajak.";

    document.getElementById('penjelasan').textContent = penjelasan;

    document.getElementById('hasilBox').classList.remove('d-none');

    // Tampilkan grafik
    const ctx = document.getElementById('pajakChart').getContext('2d');
    const existingChart = Chart.getChart(ctx);
    if(existingChart) existingChart.destroy();

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Gaji Setahun', 'PTKP', 'PKP', 'Pajak Setahun'],
            datasets: [{
                label: 'Jumlah (Rp)',
                data: [
                    hasil.gajiSetahun,
                    hasil.ptkp,
                    hasil.pkp > 0 ? hasil.pkp : 0,
                    hasil.pajak
                ],
                backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0'],
                borderColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0'],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'Rp ' + value.toLocaleString('id-ID');
                        }
                    }
                }
            }
        }
    });
});

// Fungsi untuk mereset form dan hasil tampil
function resetForm() {
    document.getElementById('pphForm').reset();
    document.getElementById('hasilBox').classList.add('d-none');
    document.getElementById('gajiSetahun').textContent = '';
    document.getElementById('gajiSebulan').textContent = '';
    document.getElementById('ptkpOutput').textContent = '';
    document.getElementById('pkp').textContent = '';
    document.getElementById('pajakSetahun').textContent = '';
    document.getElementById('pajakPerBulan').textContent = '';
    document.getElementById('penjelasan').textContent = '';

    const chartCanvas = document.getElementById('pajakChart');
    const chartInstance = Chart.getChart(chartCanvas);
    if (chartInstance) chartInstance.destroy();
}
