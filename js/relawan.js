document.addEventListener('DOMContentLoaded', () => {
    // Elemen DOM
    const relawanTableBody = document.querySelector('#relawan-table tbody');
    const addRelawanBtn = document.getElementById('add-relawan-btn');
    const teamRelawanBtn = document.getElementById('team-relawan-btn');
    const relawanModal = document.getElementById('relawan-modal');
    const teamModal = document.getElementById('team-modal');
    const relawanForm = document.getElementById('relawan-form');
    const relawanModalTitle = document.getElementById('relawan-modal-title');
    const closeButtons = document.querySelectorAll('.close');

    // Inisialisasi
    let relawanData = [];

    // Ambil semua data relawan
    async function fetchRelawan() {
        try {
            relawanData = await RelawanAPI.getAll();
            renderRelawanTable(relawanData);
        } catch (error) {
            console.error('Error fetching relawan:', error);
            showNotification('Gagal mengambil data relawan', 'error');
        }
    }

    // Render tabel relawan
    function renderRelawanTable(data) {
        relawanTableBody.innerHTML = '';
        data.forEach(relawan => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="py-2 px-4 border-b">${relawan.id_relawan}</td>
                <td class="py-2 px-4 border-b">${relawan.nama_relawan}</td>
                <td class="py-2 px-4 border-b">${relawan.no_id}</td>
                <td class="py-2 px-4 border-b">${relawan.no_hp_relawan || '-'}</td>
                <td class="py-2 px-4 border-b">${relawan.alamat_relawan || '-'}</td>
                <td class="py-2 px-4 border-b">${relawan.keterangan || '-'}</td>
                <td class="py-2 px-4 border-b">
                    <button class="action-btn edit text-blue-500 hover:text-blue-700" data-id="${relawan.id_relawan}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn danger text-red-500 hover:text-red-700" data-id="${relawan.id_relawan}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            relawanTableBody.appendChild(row);
        });

        // Tambah event listener untuk tombol edit dan hapus
        document.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.addEventListener('click', handleEditRelawan);
        });

        document.querySelectorAll('.action-btn.danger').forEach(btn => {
            btn.addEventListener('click', handleDeleteRelawan);
        });
    }

    // Tambah relawan
    addRelawanBtn.addEventListener('click', () => {
        relawanForm.reset();
        document.getElementById('relawan-id').value = '';
        relawanModalTitle.textContent = 'Tambah Relawan';
        relawanModal.style.display = 'block';
    });

    // Edit relawan
    function handleEditRelawan(e) {
        const id = e.currentTarget.dataset.id;
        const relawan = relawanData.find(r => r.id_relawan == id);
        if (relawan) {
            document.getElementById('relawan-id').value = relawan.id_relawan;
            document.getElementById('no_id').value = relawan.no_id;
            document.getElementById('nama_relawan').value = relawan.nama_relawan;
            document.getElementById('no_hp_relawan').value = relawan.no_hp_relawan || '';
            document.getElementById('alamat_relawan').value = relawan.alamat_relawan || '';
            document.getElementById('keterangan').value = relawan.keterangan || '';
            relawanModalTitle.textContent = 'Edit Relawan';
            relawanModal.style.display = 'block';
        }
    }

    // Hapus relawan
    async function handleDeleteRelawan(e) {
        const id = e.currentTarget.dataset.id;
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            try {
                await RelawanAPI.delete(id);
                fetchRelawan();
                showNotification('Data relawan berhasil dihapus', 'success');
            } catch (error) {
                console.error('Error deleting relawan:', error);
                showNotification('Gagal menghapus data relawan', 'error');
            }
        }
    }

    // Submit form relawan
    relawanForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('relawan-id').value;
        const data = {
            no_id: document.getElementById('no_id').value,
            nama_relawan: document.getElementById('nama_relawan').value,
            no_hp_relawan: document.getElementById('no_hp_relawan').value,
            alamat_relawan: document.getElementById('alamat_relawan').value,
            keterangan: document.getElementById('keterangan').value
        };

        try {
            if (id) {
                // Update
                await RelawanAPI.update(id, data);
                showNotification('Data relawan berhasil diperbarui', 'success');
            } else {
                // Create
                await RelawanAPI.create(data);
                showNotification('Data relawan berhasil ditambahkan', 'success');
            }
            relawanModal.style.display = 'none';
            fetchRelawan();
        } catch (error) {
            console.error('Error saving relawan:', error);
            showNotification('Gagal menyimpan data relawan', 'error');
        }
    });

    // Lihat relawan per tim
    teamRelawanBtn.addEventListener('click', async () => {
        try {
            const teams = await RelawanAPI.getByTeam();
            renderTeamTable(teams);
            teamModal.style.display = 'block';
        } catch (error) {
            console.error('Error fetching teams:', error);
            showNotification('Gagal mengambil data tim', 'error');
        }
    });

    // Render tabel tim
    function renderTeamTable(teams) {
        const tbody = document.querySelector('#team-table tbody');
        tbody.innerHTML = '';
        teams.forEach(team => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="py-2 px-4 border-b">${team.tim}</td>
                <td class="py-2 px-4 border-b">${team.jumlah_relawan}</td>
                <td class="py-2 px-4 border-b">${team.daftar_relawan}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // Tutup modal
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            relawanModal.style.display = 'none';
            teamModal.style.display = 'none';
        });
    });

    // Tutup modal jika klik di luar
    window.addEventListener('click', (e) => {
        if (e.target === relawanModal) {
            relawanModal.style.display = 'none';
        }
        if (e.target === teamModal) {
            teamModal.style.display = 'none';
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
    fetchRelawan();
});