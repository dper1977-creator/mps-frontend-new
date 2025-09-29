document.addEventListener('DOMContentLoaded', async () => {
    // Inisialisasi variabel
    let donasiStats = [];
    let relawanTeams = [];
    let topDonors = [];

    // Ambil data statistik
    async function fetchStats() {
        try {
            // Ambil data donasi
            donasiStats = await DonasiAPI.getStats();

            // Ambil data relawan per tim
            relawanTeams = await RelawanAPI.getByTeam();

            // Ambil data top donatur
            topDonors = await DonasiAPI.getTopDonors(10);

            // Update tampilan
            updateSummaryCards();
            renderTopDonorsTable();
            renderDonasiStatsTable();
            createDonasiByTypeChart();
            createRelawanByTeamChart();
        } catch (error) {
            console.error('Error fetching stats:', error);
            showNotification('Gagal mengambil data statistik', 'error');
        }
    }

    // Update kartu ringkasan
    function updateSummaryCards() {
        // Hitung total donasi
        let totalDonasi = 0;
        let totalDonatur = 0;

        donasiStats.forEach(stat => {
            totalDonasi += stat.total_nominal;
            totalDonatur += stat.jumlah_donasi;
        });

        // Hitung total relawan
        let totalRelawan = 0;
        relawanTeams.forEach(team => {
            totalRelawan += team.jumlah_relawan;
        });

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

        topDonors.forEach(donor => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="py-2 px-4 border-b">${donor.nama}</td>
                <td class="py-2 px-4 border-b">${formatCurrency(donor.total)}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // Render tabel statistik donasi
    function renderDonasiStatsTable() {
        const tbody = document.querySelector('#donasi-stats-table tbody');
        tbody.innerHTML = '';

        donasiStats.forEach(stat => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="py-2 px-4 border-b">${stat.nama_jenis}</td>
                <td class="py-2 px-4 border-b">${stat.jumlah_donasi}</td>
                <td class="py-2 px-4 border-b">${formatCurrency(stat.total_nominal)}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // Buat chart donasi berdasarkan jenis
    function createDonasiByTypeChart() {
        const ctx = document.getElementById('donasi-by-type-chart').getContext('2d');

        const labels = donasiStats.map(stat => stat.nama_jenis);
        const data = donasiStats.map(stat => stat.total_nominal);

        new Chart(ctx, {
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

        const labels = relawanTeams.map(team => team.tim);
        const data = relawanTeams.map(team => team.jumlah_relawan);

        new Chart(ctx, {
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

    // Format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    }

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
    fetchStats();
});