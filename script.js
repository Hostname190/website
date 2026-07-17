document.addEventListener('DOMContentLoaded', () => {
    // Fungsi untuk menjalankan setup dengan aman
    const runSafe = (fn, name) => {
        try { fn(); } catch (e) { console.error(`Error in ${name}():`, e); }
    };

    // 1. Setup UI Inti & Tema
    const setupCoreUI = () => {
        const menuToggle = document.querySelector('.menu-toggle');
        const sideNav = document.getElementById('sideNavigation');
        const themeToggle = document.getElementById('themeToggle');
        
        menuToggle?.addEventListener('click', () => sideNav?.classList.toggle('active'));

        if (themeToggle) {
            const savedTheme = localStorage.getItem('theme') || 'dark';
            document.body.className = `${savedTheme}-mode`;
            themeToggle.checked = (savedTheme === 'dark');
            themeToggle.addEventListener('change', (e) => {
                const newTheme = e.target.checked ? 'dark' : 'light';
                document.body.className = `${newTheme}-mode`;
                localStorage.setItem('theme', newTheme);
            });
        }
    };
    
    // 2. Setup Animasi Mengetik
    const setupTypingAnimation = () => {
        const descriptionEl = document.getElementById('description');
        if (!descriptionEl) return;
        
        const text = "Hidup adalah serangkaian percobaan. Kegagalan hanyalah pelajaran berharga menuju kesuksesan.";
        let i = 0;
        const type = () => {
            if (i < text.length) {
                descriptionEl.textContent += text.charAt(i++);
                setTimeout(type, 50);
            }
        };
        type();
    };

    // 3. Setup Statistik Server (PERBAIKAN)
    const setupStats = () => {
        const statElements = {
            totalRequests: document.getElementById('total-requests'),
            totalVisitors: document.getElementById('total-visitors'),
            platform: document.getElementById('server-platform'),
            cpu: document.getElementById('server-cpu'),
            ramUsage: document.getElementById('ram-usage'),
            uptime: document.getElementById('server-uptime'),
        };

        const fetchStats = async () => {
            try {
                const res = await fetch('/api/stats');
                if (!res.ok) {
                    // Memberikan pesan error yang lebih jelas jika fetch gagal
                    throw new Error(`Gagal mengambil statistik: ${res.status}`);
                }
                const data = await res.json();
                
                // [PERBAIKAN] Menggunakan destructuring untuk akses data yang lebih bersih dan aman.
                // Ini mencegah error jika 'serverInfo' tidak ada di dalam respons.
                const { totalRequests, totalVisitors, uptime, serverInfo } = data;
                const { platform, cpu, ramUsage } = serverInfo || {}; // Fallback ke objek kosong jika serverInfo null

                // [PERBAIKAN] Menggunakan "optional chaining" (?.) dan "nullish coalescing" (??)
                // untuk menampilkan 'N/A' jika data spesifik tidak ada, bukan menghentikan skrip.
                if (statElements.totalRequests) statElements.totalRequests.textContent = totalRequests?.toLocaleString('id-ID') ?? 'N/A';
                if (statElements.totalVisitors) statElements.totalVisitors.textContent = totalVisitors?.toLocaleString('id-ID') ?? 'N/A';
                if (statElements.uptime) statElements.uptime.textContent = uptime ?? 'N/A';
                if (statElements.platform) statElements.platform.textContent = platform ?? 'N/A';
                if (statElements.cpu) statElements.cpu.textContent = cpu ?? 'N/A';
                if (statElements.ramUsage) statElements.ramUsage.textContent = ramUsage ?? 'N/A';

            } catch (error) {
                console.error("Gagal memperbarui statistik:", error);
                // Menangani jika terjadi error (fetch gagal atau data tidak valid)
                Object.values(statElements).forEach(el => { 
                    if(el) el.textContent = 'N/A'; 
                });
            }
        };
        
        fetchStats();
        setInterval(fetchStats, 30000); // Refresh setiap 30 detik
    };

    // 4. Setup Kontrol Audio
    const setupAudio = () => {
        const player = document.getElementById('background-music');
        const muteBtn = document.getElementById('mute-btn');
        if (!player || !muteBtn) return;

        const isMuted = localStorage.getItem('musicMuted') === 'true';
        player.muted = isMuted;
        muteBtn.innerHTML = isMuted ? '<i class="bi bi-volume-mute-fill"></i>' : '<i class="bi bi-volume-up-fill"></i>';
        
        const playOnFirstInteraction = () => player.play().catch(e => console.warn("Autoplay gagal:", e));
        document.body.addEventListener('click', playOnFirstInteraction, { once: true });

        muteBtn.addEventListener('click', () => {
            player.muted = !player.muted;
            localStorage.setItem('musicMuted', player.muted);
            muteBtn.innerHTML = player.muted ? '<i class="bi bi-volume-mute-fill"></i>' : '<i class="bi bi-volume-up-fill"></i>';
        });
    };

    // 5. Setup Kalender
    const setupCalendar = () => {
        const calendarGrid = document.getElementById('calendar-grid');
        const monthYearEl = document.getElementById('month-year');
        const holidayInfoEl = document.getElementById('holiday-info');
        if (!calendarGrid || !monthYearEl) return;

        let currentDate = new Date();
        let holidays = {};

        const fetchHolidays = async () => {
            try {
                const res = await fetch('/api/holidays');
                const data = await res.json();
                const year = currentDate.getFullYear();
                if (data[year]) {
                    data[year].forEach(h => { holidays[h.date] = h.name; });
                }
            } catch (e) { console.error("Gagal mengambil data hari libur:", e); }
        };

        const renderCalendar = () => {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            
            monthYearEl.textContent = `${currentDate.toLocaleString('id-ID', { month: 'long' })} ${year}`;
            calendarGrid.innerHTML = '';
            if(holidayInfoEl) holidayInfoEl.textContent = '';
            
            const firstDayOfMonth = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            for (let i = 0; i < firstDayOfMonth; i++) {
                calendarGrid.insertAdjacentHTML('beforeend', '<div class="calendar-day other-month"></div>');
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const dayEl = document.createElement('div');
                dayEl.className = 'calendar-day';
                dayEl.textContent = day;

                const today = new Date();
                if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                    dayEl.classList.add('today');
                }

                const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                if (holidays[dateString]) {
                    dayEl.classList.add('holiday');
                    dayEl.dataset.holiday = holidays[dateString];
                }
                calendarGrid.appendChild(dayEl);
            }
        };
        
        const calendarContainer = document.getElementById('calendar-container');
        if (calendarContainer) {
            calendarContainer.addEventListener('mouseover', (e) => {
                if (e.target.classList.contains('holiday') && holidayInfoEl) {
                    holidayInfoEl.textContent = e.target.dataset.holiday;
                }
            });
            calendarContainer.addEventListener('mouseout', (e) => {
                if (e.target.classList.contains('holiday') && holidayInfoEl) {
                    holidayInfoEl.textContent = '';
                }
            });
        }

        document.getElementById('prev-month')?.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
        document.getElementById('next-month')?.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });

        fetchHolidays().then(renderCalendar);
    };

    // 6. Setup Swiper
    const setupSwiper = () => {
        if (typeof Swiper !== 'undefined') {
            new Swiper('.info-swiper', {
                pagination: { el: '.swiper-pagination', clickable: true },
                autoplay: { delay: 7000, disableOnInteraction: false },
            });
        }
    };

    // Jalankan semua modul setup
    runSafe(setupCoreUI, 'setupCoreUI');
    runSafe(setupTypingAnimation, 'setupTypingAnimation');
    runSafe(setupStats, 'setupStats');
    runSafe(setupAudio, 'setupAudio');
    runSafe(setupCalendar, 'setupCalendar');
    runSafe(setupSwiper, 'setupSwiper');
});
