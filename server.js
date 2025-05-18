const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Data PTKP
const ptkpMap = {
  TK: [54000000, 58500000, 63000000, 67500000],
  K: [58500000, 63000000, 67500000, 72000000]
};

// Fungsi hitung PPh
function hitungPajak(bruto, status, tanggungan, skema) {
  const ptkp = ptkpMap[status][tanggungan];
  const penghasilanSetahun = bruto * 12;
  const pkp = Math.max(penghasilanSetahun - ptkp, 0);
  let pajak;
  if (skema === 'grossup') {
    const pajakAwal = hitungPajakBerdasarkanPKP(pkp, 'gross');
    pajak = pajakAwal * 1.1; // Adjust for gross up
  } else {
    pajak = hitungPajakBerdasarkanPKP(pkp, skema);
  }
  return {
    gajiSetahun: penghasilanSetahun,
    ptkp,
    pkp,
    pajak,
    pajakPerBulan: pajak / 12
  };
}

// Fungsi hitung berdasarkan tarif
function hitungPajakBerdasarkanPKP(pkp, skema) {
  let pajak = 0;
  if (pkp <= 60000000) pajak = pkp * 0.05;
  else if (pkp <= 250000000) pajak = 60000000 * 0.05 + (pkp - 60000000) * 0.15;
  else if (pkp <= 500000000) pajak = 60000000 * 0.05 + 190000000 * 0.15 + (pkp - 250000000) * 0.25;
  else pajak = 60000000 * 0.05 + 190000000 * 0.15 + 250000000 * 0.25 + (pkp - 500000000) * 0.30;

  return skema === 'grossup' ? pajak * 1.1 : pajak;
}

// Endpoint API
app.post('/api/hitung-pph', (req, res) => {
  const { brutoBulanan, status, tanggungan, skema } = req.body;

  // Validasi
  if (isNaN(brutoBulanan) || brutoBulanan <= 0) {
    return res.status(400).json({ error: 'Penghasilan bruto tidak valid' });
  }
  if (!['TK', 'K'].includes(status)) {
    return res.status(400).json({ error: 'Status tidak valid. Harap pilih TK atau K.' });
  }
  if (isNaN(tanggungan) || tanggungan < 0 || tanggungan > 3) {
    return res.status(400).json({ error: 'Tanggungan tidak valid. Masukkan antara 0 - 3.' });
  }
  if (!['gross', 'grossup'].includes(skema)) {
    return res.status(400).json({ error: 'Skema tidak valid. Pilih gross atau grossup.' });
  }

  // Hitung Pajak
  const hasil = hitungPajak(brutoBulanan, status, tanggungan, skema);

  // Format dan kirim hasil
  res.json({
    gajiSetahun: hasil.gajiSetahun,
    ptkp: hasil.ptkp,
    pkp: hasil.pkp,
    pajak: hasil.pajak,
    pajakPerBulan: hasil.pajakPerBulan,
    message: `PPh 21 Anda sebesar Rp ${hasil.pajakPerBulan.toLocaleString('id-ID')} per bulan.`
  });
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
