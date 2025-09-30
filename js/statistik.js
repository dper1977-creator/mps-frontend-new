document.addEventListener('DOMContentLoaded', async () => {
    // Inisialisasi variabel
    let donasiStats = [];
    let relawanTeams = [];
    let topDonors = [];

    // Fungsi untuk menampilkan notifikasi
    function showNotification(message, type = 'info') {
        // Buat elemen notifikasi
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
            type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
        }`;
        notification.textContent = message;

        // Tambahkan ke DOM
        document.body.appendChild(notification);

        // Hapus setelah 3 detik
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Fungsi untuk format mata uang
    function formatCurrency(amount) {
        if (isNaN(amount)) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Ambil data statistik
    async function fetchStats() {
        try {
            console.log('Fetching statistics data...');

            // Ambil data donasi
            console.log('Fetching donation stats...');
            const donasiResponse = await DonasiAPI.getStats();
            donasiStats = Array.isArray(donasiResponse) ? donasiResponse : [];
            console.log('Donation stats:', donasiStats);

            // Ambil data relawan per tim
            console.log('Fetching volunteer teams...');
            const relawanResponse = await RelawanAPI.getByTeam();
            relawanTeams = Array.isArray(relawanResponse) ? relawanResponse : [];
            console.log('Volunteer teams:', relawanTeams);

            // Ambil data top donatur
            console.log('Fetching top donors...');
            const donorsResponse = await DonasiAPI.getTopDonors(10);
            topDonors = Array.isArray(donorsResponse) ? donorsResponse : [];
            console.log('Top donors:', topDonors);

            // Update tampilan
            updateSummaryCards();
            renderTopDonorsTable();
            renderDonasiStatsTable();
            createDonasiByTypeChart();
            createRelawanByTeamChart();

            showNotification('Data statistik berhasil dimuat', 'success');
        } catch (error) {
            console.error('Error fetching stats:', error);
            showNotification(`Gagal mengambil data statistik: ${error.message}`, 'error');
        }
    }

    // Update kartu ringkasan
    function updateSummaryCards() {
        // Hitung total donasi
        let totalDonasi = 0;
        let totalDonatur = 0;

        if (donasiStats.length > 0) {
            donasiStats.forEach(stat => {
                totalDonasi += parseFloat(stat.total_nominal) || 0;
                totalDonatur += parseInt(stat.jumlah_donasi) || 0;
            });
        }

        // Hitung total relawan
        let totalRelawan = 0;
        if (relawanTeams.length > 0) {
            relawanTeams.forEach(team => {
                totalRelawan += parseInt(team.jumlah_relawan) || 0;
            });
        }

        // Hitung rata-rata donasi
        const avgDonasi = totalDonatur > 0 ? totalDonasi / totalDonatur : 0;

        // Update DOM
        document.getElementById('total-donasi').textContent = formatCurrency(totalDonasi);
        document.getElementById('total-relawan').textContent = totalRelawan;
        document.getElementById('avg-donasi').textContent = formatCurrency(avgDonasi);
        document.getElementById('top-donatur').textContent = topDonors.length > 0 ? topDonors[0].nama : '-';
    }

    // Render tabel top donatur
    function renderTopDonorsTable() {
        const tbody = document.querySelector('#top-donors-table tbody');
        tbody.innerHTML = '';

        if (topDonors.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" class="py-2 px-4 border-b text-center">Tidak ada data</td></tr>';
            return;
        }

        topDonors.forEach(donor => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="py-2 px-4 border-b">${donor.nama || '-'}</td>
                <td class="py-2 px-4 border-b">${formatCurrency(parseFloat(donor.total) || 0)}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // Render tabel statistik donasi
    function renderDonasiStatsTable() {
        const tbody = document.querySelector('#donasi-stats-table tbody');
        tbody.innerHTML = '';

        if (donasiStats.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="py-2 px-4 border-b text-center">Tidak ada data</td></tr>';
            return;
        }

        donasiStats.forEach(stat => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="py-2 px-4 border-b">${stat.nama_jenis || '-'}</td>
                <td class="py-2 px-4 border-b">${stat.jumlah_donasi || 0}</td>
                <td class="py-2 px-4 border-b">${formatCurrency(parseFloat(stat.total_nominal) || 0)}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // Buat chart donasi berdasarkan jenis
    function createDonasiByTypeChart() {
        const ctx = document.getElementById('donasi-by-type-chart').getContext('2d');

        // Hapus chart yang sudah ada jika ada
        if (window.donasiByTypeChart) {
            window.donasiByTypeChart.destroy();
        }

        const labels = donasiStats.map(stat => stat.nama_jenis || 'Tidak diketahui');
        const data = donasiStats.map(stat => parseFloat(stat.total_nominal) || 0);

        window.donasiByTypeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Donasi',
                    data: data,
                    backgroundColor: 'rgba(0, 174, 239, 0.6)',
                    borderColor: 'rgba(0, 174, 239, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'Rp ' + value.toLocaleString('id-ID');
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Rp ' + context.raw.toLocaleString('id-ID');
                            }
                        }
                    }
                }
            }
        });
    }

    // Buat chart relawan berdasarkan tim
    function createRelawanByTeamChart() {
        const ctx = document.getElementById('relawan-by-team-chart').getContext('2d');

        // Hapus chart yang sudah ada jika ada
        if (window.relawanByTeamChart) {
            window.relawanByTeamChart.destroy();
        }

        const labels = relawanTeams.map(team => team.tim || 'Tidak diketahui');
        const data = relawanTeams.map(team => parseInt(team.jumlah_relawan) || 0);

        window.relawanByTeamChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }

    // Inisialisasi
    fetchStats();
});