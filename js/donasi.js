document.addEventListener('DOMContentLoaded', () => {
    // Elemen DOM
    const donasiTableBody = document.querySelector('#donasi-table tbody');
    const addDonasiBtn = document.getElementById('add-donasi-btn');
    const statsDonasiBtn = document.getElementById('stats-donasi-btn');
    const searchDonasiBtn = document.getElementById('search-donasi-btn');
    const searchDonasiInput = document.getElementById('search-donasi');
    const donasiModal = document.getElementById('donasi-modal');
    const statsModal = document.getElementById('stats-modal');
    const donasiForm = document.getElementById('donasi-form');
    const donasiModalTitle = document.getElementById('donasi-modal-title');
    const closeButtons = document.querySelectorAll('.close');

    // Inisialisasi
    let donasiData = [];
    let jenisDonasiOptions = [];

    // Ambil data jenis donasi untuk dropdown
    async function fetchJenisDonasi() {
        try {
            jenisDonasiOptions = await JenisDonasiAPI.getAll();
            populateJenisDonasiDropdown();
        } catch (error) {
            console.error('Error fetching jenis donasi:', error);
            // Data dummy jika gagal mengambil dari API
            jenisDonasiOptions = [
                { id_jenis: 1, nama_jenis: 'sedekah' },
                { id_jenis: 2, nama_jenis: 'sedekah palestina' },
                { id_jenis: 3, nama_jenis: 'sedekah al quran' },
                { id_jenis: 4, nama_jenis: 'sedekah anak yatim' },
                { id_jenis: 5, nama_jenis: 'infaq' },
                { id_jenis: 6, nama_jenis: 'zakat mal' },
                { id_jenis: 7, nama_jenis: 'zakat fitrah' },
                { id_jenis: 8, nama_jenis: 'zakat penghasilan' }
            ];
            populateJenisDonasiDropdown();
        }
    }

    function populateJenisDonasiDropdown() {
        const select = document.getElementById('id_jenis');
        select.innerHTML = '<option value="">Pilih Jenis Donasi</option>';
        jenisDonasiOptions.forEach(jenis => {
            const option = document.createElement('option');
            option.value = jenis.id_jenis;
            option.textContent = jenis.nama_jenis;
            select.appendChild(option);
        });
    }

    // Ambil semua data donasi
    async function fetchDonasi() {
        try {
            donasiData = await DonasiAPI.getAll();
            renderDonasiTable(donasiData);
        } catch (error) {
            console.error('Error fetching donasi:', error);
            showNotification('Gagal mengambil data donasi', 'error');
        }
    }

    // Render tabel donasi
    function renderDonasiTable(data) {
        donasiTableBody.innerHTML = '';
        data.forEach(donasi => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="py-2 px-4 border-b">${donasi.no}</td>
                <td class="py-2 px-4 border-b">${donasi.nama}</td>
                <td class="py-2 px-4 border-b">${donasi.alamat || '-'}</td>
                <td class="py-2 px-4 border-b">${donasi.no_hp || '-'}</td>
                <td class="py-2 px-4 border-b">${formatCurrency(donasi.nominal)}</td>
                <td class="py-2 px-4 border-b">${donasi.nama_jenis}</td>
                <td class="py-2 px-4 border-b">
                    <button class="action-btn edit text-blue-500 hover:text-blue-700" data-id="${donasi.no}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn danger text-red-500 hover:text-red-700" data-id="${donasi.no}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            donasiTableBody.appendChild(row);
        });

        // Tambah event listener untuk tombol edit dan hapus
        document.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.addEventListener('click', handleEditDonasi);
        });

        document.querySelectorAll('.action-btn.danger').forEach(btn => {
            btn.addEventListener('click', handleDeleteDonasi);
        });
    }

    // Format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    }

    // Tambah donasi
    addDonasiBtn.addEventListener('click', () => {
        donasiForm.reset();
        document.getElementById('donasi-id').value = '';
        donasiModalTitle.textContent = 'Tambah Donasi';
        donasiModal.style.display = 'block';
    });

    // Edit donasi
    function handleEditDonasi(e) {
        const id = e.currentTarget.dataset.id;
        const donasi = donasiData.find(d => d.no == id);
        if (donasi) {
            document.getElementById('donasi-id').value = donasi.no;
            document.getElementById('nama').value = donasi.nama;
            document.getElementById('alamat').value = donasi.alamat || '';
            document.getElementById('no_hp').value = donasi.no_hp || '';
            document.getElementById('nominal').value = donasi.nominal;
            document.getElementById('id_jenis').value = donasi.id_jenis;
            donasiModalTitle.textContent = 'Edit Donasi';
            donasiModal.style.display = 'block';
        }
    }

    // Hapus donasi
    async function handleDeleteDonasi(e) {
        const id = e.currentTarget.dataset.id;
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            try {
                await DonasiAPI.delete(id);
                fetchDonasi();
                showNotification('Data donasi berhasil dihapus', 'success');
            } catch (error) {
                console.error('Error deleting donasi:', error);
                showNotification('Gagal menghapus data donasi', 'error');
            }
        }
    }

    // Submit form donasi
    donasiForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('donasi-id').value;
        const data = {
            nama: document.getElementById('nama').value,
            alamat: document.getElementById('alamat').value,
            no_hp: document.getElementById('no_hp').value,
            nominal: parseFloat(document.getElementById('nominal').value),
            id_jenis: parseInt(document.getElementById('id_jenis').value)
        };

        try {
            if (id) {
                // Update
                await DonasiAPI.update(id, data);
                showNotification('Data donasi berhasil diperbarui', 'success');
            } else {
                // Create
                await DonasiAPI.create(data);
                showNotification('Data donasi berhasil ditambahkan', 'success');
            }
            donasiModal.style.display = 'none';
            fetchDonasi();
        } catch (error) {
            console.error('Error saving donasi:', error);
            showNotification('Gagal menyimpan data donasi', 'error');
        }
    });

    // Lihat statistik
    statsDonasiBtn.addEventListener('click', async () => {
        try {
            const stats = await DonasiAPI.getStats();
            renderStatsTable(stats);
            statsModal.style.display = 'block';
        } catch (error) {
            console.error('Error fetching stats:', error);
            showNotification('Gagal mengambil data statistik', 'error');
        }
    });

    // Render tabel statistik
    function renderStatsTable(stats) {
        const tbody = document.querySelector('#stats-table tbody');
        tbody.innerHTML = '';
        stats.forEach(stat => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="py-2 px-4 border-b">${stat.nama_jenis}</td>
                <td class="py-2 px-4 border-b">${stat.jumlah_donasi}</td>
                <td class="py-2 px-4 border-b">${formatCurrency(stat.total_nominal)}</td>
                <td class="py-2 px-4 border-b">${formatCurrency(stat.rata_rata)}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // Cari donasi
    searchDonasiBtn.addEventListener('click', async () => {
        const name = searchDonasiInput.value.trim();
        if (name) {
            try {
                const results = await DonasiAPI.search(name);
                renderDonasiTable(results);
            } catch (error) {
                console.error('Error searching donasi:', error);
                showNotification('Gagal mencari data donasi', 'error');
            }
        } else {
            fetchDonasi();
        }
    });

    // Tutup modal
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            donasiModal.style.display = 'none';
            statsModal.style.display = 'none';
        });
    });

    // Tutup modal jika klik di luar
    window.addEventListener('click', (e) => {
        if (e.target === donasiModal) {
            donasiModal.style.display = 'none';
        }
        if (e.target === statsModal) {
            statsModal.style.display = 'none';
        }
    });

    // Fungsi notifikasi
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Inisialisasi
    fetchJenisDonasi();
    fetchDonasi();
});