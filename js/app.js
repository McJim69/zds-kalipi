/**
 * ZAMBOANGA DEL SUR KALIPI-RIC WOMEN FEDERATION, INC.
 * Barangay Women's Profiling System - CY 2026 Logic Engine
 * Connects with MySQL backend (api.php) + LocalStorage Fallback
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Application State ---
    let profiles = loadProfilesLocal();
    let associationInfo = loadAssociationInfoLocal();
    let currentView = localStorage.getItem('zds_kalipi_view') || 'cards';
    let currentTheme = localStorage.getItem('zds_kalipi_theme') || 'dark';

    let filters = {
        search: '',
        municipality: 'ALL',
        barangay: 'ALL',
        civilStatus: 'ALL',
        position: 'ALL',
        sortBy: 'no-asc'
    };
    
    let isAdmin = false;
    let userRole = null;
    let userMunicipality = null;

    // --- DOM Elements ---
    const htmlElem = document.documentElement;
    const cardsViewContainer = document.getElementById('cardsViewContainer');
    const tableViewContainer = document.getElementById('tableViewContainer');
    const tableBody = document.getElementById('tableBody');
    const emptyState = document.getElementById('emptyState');

    // Navbar & Toolbar Elements
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    const viewCardsBtn = document.getElementById('viewCardsBtn');
    const viewTableBtn = document.getElementById('viewTableBtn');
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const municipalityFilter = document.getElementById('municipalityFilter');
    const barangayFilter = document.getElementById('barangayFilter');
    const civilStatusFilter = document.getElementById('civilStatusFilter');
    const positionFilter = document.getElementById('positionFilter');
    const sortBySelect = document.getElementById('sortBySelect');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');

    // Action Buttons
    const addMemberBtn = document.getElementById('addMemberBtn');
    const editAssocBtn = document.getElementById('editAssocBtn');
    const printReportBtn = document.getElementById('printReportBtn');
    const importModalBtn = document.getElementById('importModalBtn');
    const authBtn = document.getElementById('authBtn');

    // Form & Photo Elements
    const inputBirthdate = document.getElementById('inputBirthdate');
    const inputAge = document.getElementById('inputAge');
    const inputMemberMunicipality = document.getElementById('inputMemberMunicipality');
    const inputMemberBarangay = document.getElementById('inputMemberBarangay');
    const inputAvatar = document.getElementById('inputAvatar');
    const inputAvatarFile = document.getElementById('inputAvatarFile');
    const browseAvatarBtn = document.getElementById('browseAvatarBtn');
    const clearAvatarBtn = document.getElementById('clearAvatarBtn');
    const avatarPreviewBox = document.getElementById('avatarPreviewBox');
    const avatarPreviewIcon = document.getElementById('avatarPreviewIcon');
    const avatarPreviewImg = document.getElementById('avatarPreviewImg');

    // Modals
    const loginModal = document.getElementById('loginModal');
    const loginForm = document.getElementById('loginForm');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const cancelLoginBtn = document.getElementById('cancelLoginBtn');

    const memberModal = document.getElementById('memberModal');
    const memberForm = document.getElementById('memberForm');
    const closeMemberModal = document.getElementById('closeMemberModal');
    const cancelMemberModal = document.getElementById('cancelMemberModal');

    const detailModal = document.getElementById('detailModal');
    const detailModalBody = document.getElementById('detailModalBody');
    const closeDetailModal = document.getElementById('closeDetailModal');
    const closeDetailBtn = document.getElementById('closeDetailBtn');
    const editFromDetailBtn = document.getElementById('editFromDetailBtn');


    const importModal = document.getElementById('importModal');
    const closeImportModal = document.getElementById('closeImportModal');
    const closeImportModalBtn = document.getElementById('closeImportModalBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    const importFileInput = document.getElementById('importFileInput');
    const resetDataBtn = document.getElementById('resetDataBtn');
    const genSyncTokenBtn = document.getElementById('genSyncTokenBtn');
    const syncSecretToken = document.getElementById('syncSecretToken');

    let currentDetailMemberId = null;

    // --- Helper Functions ---

    function calculateAge(birthdateStr) {
        if (!birthdateStr) return '';
        const birthDate = new Date(birthdateStr);
        if (isNaN(birthDate.getTime())) return '';
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 0 ? age : 0;
    }

    function formatDateNice(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    function generateRandomToken() {
        const randHex = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
        return 'KALIPI_TOKEN_' + randHex.toUpperCase();
    }

    function updateAvatarPreview(url) {
        if (url && url.trim()) {
            avatarPreviewImg.src = url.trim();
            avatarPreviewImg.style.display = 'block';
            avatarPreviewIcon.style.display = 'none';
            if (clearAvatarBtn) clearAvatarBtn.style.display = 'inline-flex';
        } else {
            avatarPreviewImg.src = '';
            avatarPreviewImg.style.display = 'none';
            avatarPreviewIcon.style.display = 'block';
            if (clearAvatarBtn) clearAvatarBtn.style.display = 'none';
        }
    }

    function handleSelectedImageFile(file) {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const dataUrl = event.target.result;
                inputAvatar.value = dataUrl;
                updateAvatarPreview(dataUrl);
            };
            reader.readAsDataURL(file);
        }
    }

    // Handle cascading dropdown for Member Modal
    if (inputMemberMunicipality) {
        inputMemberMunicipality.addEventListener('change', (e) => {
            const muni = e.target.value;
            populateBarangaySelect(inputMemberBarangay, muni);
        });
    }

    // Auto-calculate Age on Birthdate Change
    if (inputBirthdate) {
        inputBirthdate.addEventListener('change', () => {
            const computedAge = calculateAge(inputBirthdate.value);
            if (computedAge !== '') {
                inputAge.value = computedAge;
            }
        });
    }

    // Custom Token Generator Event Listener
    if (genSyncTokenBtn && syncSecretToken) {
        genSyncTokenBtn.addEventListener('click', () => {
            const newToken = generateRandomToken();
            syncSecretToken.value = newToken;
            showToast('New secret token generated! Match SYNC_SECRET_KEY in config.php', 'info');
        });
    }

    // Photo Upload, Update, Drag-and-Drop & Preview Logic
    if (browseAvatarBtn && inputAvatarFile) {
        browseAvatarBtn.addEventListener('click', () => {
            inputAvatarFile.click();
        });

        if (avatarPreviewBox) {
            avatarPreviewBox.addEventListener('click', () => {
                inputAvatarFile.click();
            });

            avatarPreviewBox.addEventListener('dragover', (e) => {
                e.preventDefault();
                avatarPreviewBox.style.borderColor = 'var(--gold-400)';
                avatarPreviewBox.style.transform = 'scale(1.1)';
            });

            avatarPreviewBox.addEventListener('dragleave', (e) => {
                e.preventDefault();
                avatarPreviewBox.style.borderColor = 'var(--primary-500)';
                avatarPreviewBox.style.transform = 'scale(1)';
            });

            avatarPreviewBox.addEventListener('drop', (e) => {
                e.preventDefault();
                avatarPreviewBox.style.borderColor = 'var(--primary-500)';
                avatarPreviewBox.style.transform = 'scale(1)';
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleSelectedImageFile(e.dataTransfer.files[0]);
                }
            });
        }

        inputAvatarFile.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleSelectedImageFile(e.target.files[0]);
            }
        });
    }

    if (clearAvatarBtn) {
        clearAvatarBtn.addEventListener('click', () => {
            inputAvatar.value = '';
            inputAvatarFile.value = '';
            updateAvatarPreview('');
        });
    }

    if (inputAvatar) {
        inputAvatar.addEventListener('input', () => {
            updateAvatarPreview(inputAvatar.value);
        });
    }

    // --- Initial setup ---
    initTheme(currentTheme);

    // Setup filters based on auth state will happen after checkAuthState

    updateAssociationBanner();
    setViewMode(currentView);
    renderApp();

    renderApp();

    // Fetch auth state, then live data
    checkAuthState().then(async () => {
        await setupFiltersBasedOnAuth();
        fetchLiveDataFromDatabase();
    });

    // --- Event Listeners ---

    themeToggleBtn.addEventListener('click', () => {
        const newTheme = htmlElem.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        initTheme(newTheme);
        showToast(`Switched to ${newTheme.toUpperCase()} theme`, 'info');
    });

    viewCardsBtn.addEventListener('click', () => setViewMode('cards'));
    viewTableBtn.addEventListener('click', () => setViewMode('table'));

    searchInput.addEventListener('input', (e) => {
        filters.search = e.target.value.trim();
        clearSearchBtn.style.display = filters.search ? 'block' : 'none';
        renderApp();
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        filters.search = '';
        clearSearchBtn.style.display = 'none';
        renderApp();
    });

    if (municipalityFilter) {
        municipalityFilter.addEventListener('change', (e) => {
            filters.municipality = e.target.value;
            filters.barangay = 'ALL';
            if (barangayFilter) {
                if (filters.municipality === 'ALL') {
                    barangayFilter.innerHTML = '<option value="ALL">All Barangays</option>';
                } else {
                    populateBarangaySelect(barangayFilter, filters.municipality, 'ALL').then(() => {
                        if (barangayFilter.options[0]) {
                            barangayFilter.options[0].text = "All Barangays";
                            barangayFilter.options[0].value = "ALL";
                        }
                    });
                }
            }
            updateAssociationBanner();
            renderApp();
        });
    }

    if (barangayFilter) {
        barangayFilter.addEventListener('change', (e) => {
            filters.barangay = e.target.value;
            updateAssociationBanner();
            renderApp();
        });
    }

    civilStatusFilter.addEventListener('change', (e) => {
        filters.civilStatus = e.target.value;
        renderApp();
    });

    positionFilter.addEventListener('change', (e) => {
        filters.position = e.target.value;
        renderApp();
    });

    sortBySelect.addEventListener('change', (e) => {
        filters.sortBy = e.target.value;
        renderApp();
    });

    resetFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        
        let resetMunicipality = 'ALL';
        if (isAdmin && userRole === 'admin' && userMunicipality && userMunicipality !== 'ALL') {
            resetMunicipality = userMunicipality;
        }

        if (municipalityFilter) municipalityFilter.value = resetMunicipality;
        if (barangayFilter) barangayFilter.innerHTML = '<option value="ALL">All Barangays</option>';
        if (resetMunicipality !== 'ALL' && barangayFilter) {
            populateBarangaySelect(barangayFilter, resetMunicipality).then(() => {
                if (barangayFilter.options.length > 0) {
                    barangayFilter.options[0].text = "All Barangays";
                    barangayFilter.options[0].value = "ALL";
                }
            });
        }

        civilStatusFilter.value = 'ALL';
        positionFilter.value = 'ALL';
        sortBySelect.value = 'no-asc';
        filters = { search: '', municipality: resetMunicipality, barangay: 'ALL', civilStatus: 'ALL', position: 'ALL', sortBy: 'no-asc' };
        updateAssociationBanner();
        renderApp();
    });

    addMemberBtn.addEventListener('click', () => {
        if (!isAdmin) return;
        openMemberModal();
    });

    authBtn.addEventListener('click', async () => {
        if (isAdmin) {
            if (!confirm('Are you sure you want to log out?')) return;
            // Logout
            try {
                const res = await fetch('api.php?action=logout');
                if (res.ok) {
                    isAdmin = false;
                    userRole = null;
                    userMunicipality = null;
                    updateAdminUI();
                    await setupFiltersBasedOnAuth();
                    renderApp();
                    showToast('Logged out successfully', 'info');
                }
            } catch (err) {
                console.error(err);
            }
        } else {
            // Open Login Modal
            loginForm.reset();
            openModal(loginModal);
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('adminUsername').value.trim();
        const pwd = document.getElementById('adminPassword').value;
        try {
            const res = await fetch('api.php?action=login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password: pwd })
            });
            const data = await res.json();
            if (data.status === 'success') {
                isAdmin = true;
                userRole = data.role;
                userMunicipality = data.municipality;
                updateAdminUI();
                await setupFiltersBasedOnAuth();
                renderApp();
                closeModal(loginModal);
                showToast(data.message, 'success');
            } else {
                showToast(data.message, 'danger');
            }
        } catch (err) {
            showToast('Connection error', 'danger');
        }
    });

    closeLoginModal.addEventListener('click', () => closeModal(loginModal));
    cancelLoginBtn.addEventListener('click', () => closeModal(loginModal));
    closeMemberModal.addEventListener('click', () => closeModal(memberModal));
    cancelMemberModal.addEventListener('click', () => closeModal(memberModal));


    closeDetailModal.addEventListener('click', () => closeModal(detailModal));
    closeDetailBtn.addEventListener('click', () => closeModal(detailModal));
    editFromDetailBtn.addEventListener('click', () => {
        closeModal(detailModal);
        if (currentDetailMemberId) {
            openMemberModal(currentDetailMemberId);
        }
    });

    importModalBtn.addEventListener('click', () => openModal(importModal));
    closeImportModal.addEventListener('click', () => closeModal(importModal));
    closeImportModalBtn.addEventListener('click', () => closeModal(importModal));

    memberForm.addEventListener('submit', handleMemberFormSubmit);

    exportCsvBtn.addEventListener('click', exportToCSV);
    exportJsonBtn.addEventListener('click', exportToJSON);
    importFileInput.addEventListener('change', handleImportJSON);
    resetDataBtn.addEventListener('click', handleResetData);
    printReportBtn.addEventListener('click', () => window.print());

    const triggerSyncBtn = document.getElementById('triggerSyncBtn');
    const pullSyncBtn = document.getElementById('pullSyncBtn');

    if (triggerSyncBtn) {
        triggerSyncBtn.addEventListener('click', async () => {
            const remoteUrl = document.getElementById('syncTargetUrl').value.trim();
            const syncKey = document.getElementById('syncSecretToken').value.trim();

            if (!remoteUrl) {
                alert('Please enter your production API endpoint URL (e.g. https://your-production-domain.com/api.php)');
                return;
            }

            if (!confirm('WARNING: This will OVERWRITE the production server with your local data. Are you sure you want to Push?')) {
                return;
            }

            triggerSyncBtn.disabled = true;
            triggerSyncBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Synchronizing Data...';

            try {
                const res = await fetch('api.php?action=trigger_sync_remote', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ remoteUrl, syncKey })
                });

                const data = await res.json();
                if (data.status === 'success') {
                    showToast('Local dataset successfully synchronized to Production!', 'success');
                } else {
                    alert('Sync Warning: ' + (data.message || 'Connection failed'));
                }
            } catch (err) {
                alert('Sync Error: ' + err.message);
            } finally {
                triggerSyncBtn.disabled = false;
                triggerSyncBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Push to Production';
            }
        });
    }

    if (pullSyncBtn) {
        pullSyncBtn.addEventListener('click', async () => {
            const remoteUrl = document.getElementById('syncTargetUrl').value.trim();

            if (!remoteUrl) {
                alert('Please enter your production API endpoint URL (e.g. https://your-production-domain.com/api.php)');
                return;
            }

            if (!confirm('WARNING: This will OVERWRITE your local records with the latest data from Production. Are you sure you want to Pull?')) {
                return;
            }

            pullSyncBtn.disabled = true;
            pullSyncBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Pulling Data...';

            try {
                const res = await fetch('api.php?action=trigger_sync_pull', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ remoteUrl })
                });

                const data = await res.json();
                if (data.status === 'success') {
                    showToast(data.message, 'success');
                    fetchLiveDataFromDatabase(); // Refresh local UI
                } else {
                    alert('Pull Warning: ' + (data.message || 'Connection failed'));
                }
            } catch (err) {
                alert('Pull Error: ' + err.message);
            } finally {
                pullSyncBtn.disabled = false;
                pullSyncBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Pull from Production';
            }
        });
    }

    // --- API & State Syncing ---

    async function checkAuthState() {
        try {
            const res = await fetch('api.php?action=check_auth');
            if (res.ok) {
                const data = await res.json();
                isAdmin = data.isAdmin === true;
                userRole = data.role;
                userMunicipality = data.municipality;
                updateAdminUI();
            }
        } catch (err) {
            console.error('Failed to check auth state', err);
        }
    }

    function updateAdminUI() {
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            el.style.display = isAdmin ? '' : 'none';
        });

        const superAdminElements = document.querySelectorAll('.superadmin-only');
        superAdminElements.forEach(el => {
            el.style.display = (isAdmin && userRole === 'superadmin') ? '' : 'none';
        });

        const authIcon = document.getElementById('authIcon');
        const authText = document.getElementById('authText');
        if (isAdmin) {
            let label = 'Logged In';
            if (userRole === 'superadmin') label = 'Super Admin';
            else if (userMunicipality) label = `${userMunicipality} Admin`;
            
            authIcon.className = 'fa-solid fa-arrow-right-from-bracket';
            authText.textContent = label;
        } else {
            authIcon.className = 'fa-solid fa-shield-halved';
            authText.textContent = 'Admin Login';
        }
    }

    async function setupFiltersBasedOnAuth() {
        const mFilter = document.getElementById('municipalityFilter');
        const bFilter = document.getElementById('barangayFilter');
        
        let resetMunicipality = 'ALL';
        if (isAdmin && userRole === 'admin' && userMunicipality && userMunicipality !== 'ALL') {
            resetMunicipality = userMunicipality;
        }

        if (mFilter) {
            mFilter.disabled = (resetMunicipality !== 'ALL');
            await populateMunicipalitySelect(mFilter, resetMunicipality);
            if (mFilter.options.length > 0 && mFilter.options[0]) {
                mFilter.options[0].text = "All Municipalities";
                mFilter.options[0].value = "ALL";
            }
        }
        
        if (bFilter) {
            if (resetMunicipality !== 'ALL') {
                await populateBarangaySelect(bFilter, resetMunicipality);
            } else {
                bFilter.innerHTML = '<option value="ALL">All Barangays</option>';
            }
            if (bFilter.options.length > 0 && bFilter.options[0]) {
                bFilter.options[0].text = "All Barangays";
                bFilter.options[0].value = "ALL";
            }
        }
        
        filters.municipality = resetMunicipality;
        filters.barangay = 'ALL';
        updateAssociationBanner();
    }

    async function fetchLiveDataFromDatabase() {
        try {
            const response = await fetch('api.php?action=get_all');
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success') {
                    if (data.syncKey && syncSecretToken) {
                        syncSecretToken.value = data.syncKey;
                    }
                    if (data.profiles && Array.isArray(data.profiles) && data.profiles.length > 0) {
                        profiles = data.profiles;
                        profiles.forEach(p => {
                            if (p.birthdate) {
                                p.age = calculateAge(p.birthdate);
                            }
                        });
                        saveProfilesLocal();
                    } else if (profiles.length === 0 && typeof INITIAL_WOMEN_PROFILES !== 'undefined') {
                        profiles = [...INITIAL_WOMEN_PROFILES];
                        saveProfilesLocal();
                    }
                    renderApp();
                    showToast('Connected live to MySQL Database (zds_kalipi_db)', 'success');
                }
            }
        } catch (err) {
            console.log('Using LocalStorage offline state fallback', err);
        }
    }

    function loadProfilesLocal() {
        const saved = localStorage.getItem('zds_kalipi_profiles');
        const list = saved ? JSON.parse(saved) : [...INITIAL_WOMEN_PROFILES];
        list.forEach(p => {
            if (p.birthdate) {
                p.age = calculateAge(p.birthdate);
            }
        });
        return list;
    }

    function saveProfilesLocal() {
        localStorage.setItem('zds_kalipi_profiles', JSON.stringify(profiles));
    }

    function loadAssociationInfoLocal() {
        const saved = localStorage.getItem('zds_kalipi_association');
        return saved ? JSON.parse(saved) : { ...INITIAL_ASSOCIATION_INFO };
    }

    function saveAssociationInfoLocal() {
        localStorage.setItem('zds_kalipi_association', JSON.stringify(associationInfo));
    }

    async function populateMunicipalitySelect(selectElem, selectedValue = '') {
        try {
            const res = await fetch('get_options.php?type=municipality');
            const data = await res.json();
            let html = '<option value="">Select Municipality</option>';
            if (Array.isArray(data)) {
                data.forEach(m => {
                    const sel = (m === selectedValue) ? 'selected' : '';
                    html += `<option value="${m}" ${sel}>${m}</option>`;
                });
            }
            selectElem.innerHTML = html;
        } catch (e) {
            console.error('Failed to load municipalities', e);
        }
    }

    async function populateBarangaySelect(selectElem, municipality, selectedValue = '') {
        try {
            if (!municipality) {
                selectElem.innerHTML = '<option value="">Select Barangay</option>';
                return;
            }
            const res = await fetch(`get_options.php?type=barangay&municipality=${encodeURIComponent(municipality)}`);
            const data = await res.json();
            let html = '<option value="">Select Barangay</option>';
            if (Array.isArray(data)) {
                data.forEach(b => {
                    const sel = (b === selectedValue) ? 'selected' : '';
                    html += `<option value="${b}" ${sel}>${b}</option>`;
                });
            }
            selectElem.innerHTML = html;
        } catch (e) {
            console.error('Failed to load barangays', e);
        }
    }

    function initTheme(theme) {
        currentTheme = theme;
        htmlElem.setAttribute('data-theme', theme);
        localStorage.setItem('zds_kalipi_theme', theme);

        if (theme === 'dark') {
            themeIcon.className = 'fa-solid fa-moon';
            themeText.textContent = 'Dark Mode';
        } else {
            themeIcon.className = 'fa-solid fa-sun';
            themeText.textContent = 'Light Mode';
        }
    }

    function initMunicipalityDropdown() {
        if (typeof MUNICIPALITIES_ZDS !== 'undefined') {
            assocMunicipalitySelect.innerHTML = MUNICIPALITIES_ZDS.map(m => 
                `<option value="${m}">${m}</option>`
            ).join('');
        }
    }

    function setViewMode(mode) {
        currentView = mode;
        localStorage.setItem('zds_kalipi_view', mode);

        if (mode === 'cards') {
            viewCardsBtn.classList.add('active');
            viewTableBtn.classList.remove('active');
            cardsViewContainer.style.display = 'grid';
            tableViewContainer.style.display = 'none';
        } else {
            viewTableBtn.classList.add('active');
            viewCardsBtn.classList.remove('active');
            cardsViewContainer.style.display = 'none';
            tableViewContainer.style.display = 'block';
        }
    }

    function updateAssociationBanner() {
        let assocName = "Zamboanga del Sur KALIPI-RIC Federation";
        let presidentName = "Not Specified";
        let contactNo = "N/A";
        let doleReg = "N/A";

        if (filters.municipality !== 'ALL') {
            if (filters.barangay !== 'ALL') {
                assocName = `${filters.barangay}, ${filters.municipality} KALIPI Women's Association`;
                
                // Find president in profiles
                const presidentProfile = profiles.find(p => 
                    p.municipality === filters.municipality && 
                    p.barangay === filters.barangay && 
                    p.position === 'President'
                );
                
                if (presidentProfile) {
                    presidentName = presidentProfile.name;
                    contactNo = presidentProfile.contactNo || "N/A";
                }
            } else {
                assocName = `${filters.municipality} KALIPI-RIC Federation`;
                
                // Try to find a municipal-level president
                const municipalPresident = profiles.find(p => 
                    p.municipality === filters.municipality && 
                    p.position === 'President'
                );
                
                if (municipalPresident) {
                    presidentName = municipalPresident.name;
                    contactNo = municipalPresident.contactNo || "N/A";
                }
            }
        }

        document.getElementById('dispAssociationName').textContent = assocName;
        document.getElementById('dispMunicipality').textContent = filters.municipality !== 'ALL' ? filters.municipality : "All Municipalities";
        document.getElementById('dispBarangay').textContent = filters.barangay !== 'ALL' ? filters.barangay : "All Barangays";
        document.getElementById('dispPresident').textContent = presidentName;
        document.getElementById('dispContactNo').textContent = contactNo;
        document.getElementById('dispDoleReg').textContent = doleReg;
    }

    function renderApp() {
        const filtered = getFilteredAndSortedProfiles();

        renderKPIs(filtered);

        if (filtered.length === 0) {
            cardsViewContainer.style.display = 'none';
            tableViewContainer.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            if (currentView === 'cards') {
                cardsViewContainer.style.display = 'grid';
                tableViewContainer.style.display = 'none';
            } else {
                cardsViewContainer.style.display = 'none';
                tableViewContainer.style.display = 'block';
            }
            renderCardsView(filtered);
            renderTableView(filtered);
        }
    }

    function getFilteredAndSortedProfiles() {
        let result = [...profiles];

        if (filters.search) {
            const q = filters.search.toLowerCase();
            result = result.filter(item => 
                (item.name && item.name.toLowerCase().includes(q)) ||
                (item.occupation && item.occupation.toLowerCase().includes(q)) ||
                (item.position && item.position.toLowerCase().includes(q)) ||
                (item.remarks && item.remarks.toLowerCase().includes(q)) ||
                (item.birthdate && item.birthdate.includes(q)) ||
                (item.contactNo && item.contactNo.toLowerCase().includes(q))
            );
        }

        if (filters.municipality !== 'ALL') {
            result = result.filter(item => item.municipality === filters.municipality);
        }

        if (filters.barangay !== 'ALL') {
            result = result.filter(item => item.barangay === filters.barangay);
        }

        if (filters.civilStatus !== 'ALL') {
            result = result.filter(item => item.civilStatus === filters.civilStatus);
        }

        if (filters.position !== 'ALL') {
            result = result.filter(item => item.position === filters.position);
        }

        result.sort((a, b) => {
            const ageA = a.birthdate ? calculateAge(a.birthdate) : (a.age || 0);
            const ageB = b.birthdate ? calculateAge(b.birthdate) : (b.age || 0);

            if (filters.sortBy === 'no-asc') {
                return (profiles.indexOf(a) + 1) - (profiles.indexOf(b) + 1);
            } else if (filters.sortBy === 'name-asc') {
                return a.name.localeCompare(b.name);
            } else if (filters.sortBy === 'name-desc') {
                return b.name.localeCompare(a.name);
            } else if (filters.sortBy === 'age-asc') {
                return ageA - ageB;
            } else if (filters.sortBy === 'age-desc') {
                return ageB - ageA;
            } else if (filters.sortBy === 'position') {
                const priority = { 'President': 1, 'Vice President': 2, 'Secretary': 3, 'Treasurer': 4, 'Auditor': 5, 'P.R.O.': 6, 'Board Member': 7, 'Member': 8 };
                return (priority[a.position] || 99) - (priority[b.position] || 99);
            }
            return 0;
        });

        return result;
    }

    function renderKPIs(currentList) {
        document.getElementById('kpiTotalMembers').textContent = currentList.length;

        const officersCount = currentList.filter(m => m.position !== 'Member').length;
        document.getElementById('kpiOfficersCount').textContent = officersCount;

        const soloParentsCount = currentList.filter(m => m.civilStatus === 'Solo Parent').length;
        document.getElementById('kpiSoloParents').textContent = soloParentsCount;

        if (currentList.length > 0) {
            const sumAge = currentList.reduce((acc, curr) => {
                const ageVal = curr.birthdate ? calculateAge(curr.birthdate) : (parseInt(curr.age) || 0);
                return acc + ageVal;
            }, 0);
            const avg = Math.round(sumAge / currentList.length);
            document.getElementById('kpiAvgAge').textContent = `${avg} yrs`;
        } else {
            document.getElementById('kpiAvgAge').textContent = `0 yrs`;
        }
    }

    function getPositionBadgeClass(pos) {
        if (pos === 'President' || pos === 'Vice President') return 'leader';
        if (['Secretary', 'Treasurer', 'Auditor', 'P.R.O.', 'Board Member'].includes(pos)) return 'officer';
        return 'member';
    }

    function getCivilPillClass(status) {
        return (status || '').replace(/\s+/g, '-');
    }

    function getDefaultAvatar(name) {
        const seed = encodeURIComponent(name || 'Woman');
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&gender=female`;
    }

    function renderCardsView(list) {
        cardsViewContainer.innerHTML = list.map((item) => {
            const seqNum = profiles.indexOf(item) + 1;
            const avatarSrc = item.avatar || item.imgUrl || getDefaultAvatar(item.name);
            const posClass = getPositionBadgeClass(item.position);
            const civilClass = getCivilPillClass(item.civilStatus);
            const computedAge = item.birthdate ? calculateAge(item.birthdate) : (item.age || 0);
            const birthdateFormatted = item.birthdate ? formatDateNice(item.birthdate) : '';

            return `
                <div class="member-card" data-id="${item.id}">
                    <div>
                        <div class="card-header">
                            <div class="avatar-wrapper">
                                <img src="${avatarSrc}" alt="${item.name}" class="avatar-img" onerror="this.src='${getDefaultAvatar(item.name)}'">
                                <span class="seq-pill">#${seqNum}</span>
                            </div>
                            <div class="card-title-meta">
                                <h3 class="member-name" title="${item.name}">${item.name}</h3>
                                <span class="position-badge ${posClass}"><i class="fa-solid fa-ribbon"></i> ${item.position}</span>
                            </div>
                        </div>

                        <div class="card-details">
                            <div class="detail-block">
                                <span class="detail-lbl">Age</span>
                                <span class="detail-val">${computedAge} yrs old</span>
                            </div>
                            <div class="detail-block">
                                <span class="detail-lbl">Civil Status</span>
                                <span class="civil-pill ${civilClass}">${item.civilStatus}</span>
                            </div>
                            ${birthdateFormatted ? `
                            <div class="detail-block" style="grid-column: span 2;">
                                <span class="detail-lbl">Date of Birth</span>
                                <span class="detail-val"><i class="fa-solid fa-cake-candles" style="font-size:0.75rem; color:var(--orchid-400);"></i> ${birthdateFormatted}</span>
                            </div>` : ''}
                            <div class="detail-block" style="grid-column: span 2;">
                                <span class="detail-lbl">Occupation</span>
                                <span class="detail-val">${item.occupation || 'N/A'}</span>
                            </div>
                            <div class="detail-block" style="grid-column: span 2;">
                                <span class="detail-lbl">Contact Number</span>
                                <span class="detail-val"><i class="fa-solid fa-phone" style="font-size:0.75rem; color: var(--gold-400);"></i> ${item.contactNo || 'N/A'}</span>
                            </div>
                        </div>

                        ${item.remarks ? `<div class="remarks-callout" title="${item.remarks}"><i class="fa-solid fa-quote-left" style="font-size:0.7rem; margin-right:4px;"></i> ${item.remarks}</div>` : ''}
                    </div>

                    <div class="card-actions">
                        <button class="btn btn-secondary view-member-btn" onclick="appViewMember('${item.id}')">
                            <i class="fa-solid fa-eye"></i> View
                        </button>
                        ${isAdmin ? `
                        <button class="btn btn-secondary edit-member-btn" onclick="appEditMember('${item.id}')">
                            <i class="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button class="btn btn-danger delete-member-btn" onclick="appDeleteMember('${item.id}')" title="Delete Profile">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderTableView(list) {
        tableBody.innerHTML = list.map((item) => {
            const seqNum = profiles.indexOf(item) + 1;
            const avatarSrc = item.avatar || item.imgUrl || getDefaultAvatar(item.name);
            const posClass = getPositionBadgeClass(item.position);
            const civilClass = getCivilPillClass(item.civilStatus);
            const computedAge = item.birthdate ? calculateAge(item.birthdate) : (item.age || 0);

            return `
                <tr>
                    <td style="font-weight: 800; color: var(--gold-400);">${seqNum}</td>
                    <td>
                        <div class="table-member-cell">
                            <img src="${avatarSrc}" alt="${item.name}" class="table-avatar" onerror="this.src='${getDefaultAvatar(item.name)}'">
                            <div>
                                <strong style="display:block; color: var(--text-main);">${item.name}</strong>
                                ${item.birthdate ? `<span style="font-size:0.75rem; color:var(--text-muted);"><i class="fa-solid fa-cake-candles" style="font-size:0.68rem; color:var(--orchid-400);"></i> ${formatDateNice(item.birthdate)}</span>` : ''}
                            </div>
                        </div>
                    </td>
                    <td><strong>${computedAge}</strong> yrs</td>
                    <td><span class="civil-pill ${civilClass}">${item.civilStatus}</span></td>
                    <td>${item.occupation || 'N/A'}</td>
                    <td><span class="position-badge ${posClass}">${item.position}</span></td>
                    <td>${item.contactNo || 'N/A'}</td>
                    <td style="max-width: 200px; font-size: 0.83rem; color: var(--text-muted);">${item.remarks || ''}</td>
                    <td>
                        <div class="table-actions" style="justify-content: center;">
                            <button class="btn btn-secondary btn-icon-only" onclick="appViewMember('${item.id}')" title="View Profile">
                                <i class="fa-solid fa-eye"></i>
                            </button>
                            ${isAdmin ? `
                            <button class="btn btn-secondary btn-icon-only" onclick="appEditMember('${item.id}')" title="Edit Profile">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button class="btn btn-danger btn-icon-only" onclick="appDeleteMember('${item.id}')" title="Delete Profile">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function openModal(modal) {
        modal.classList.add('active');
    }

    function closeModal(modal) {
        modal.classList.remove('active');
    }

    async function openMemberModal(id = null) {
        memberForm.reset();
        
        let targetMunicipality = '';
        let targetBarangay = '';
        let isLocked = (userRole === 'admin' && userMunicipality && userMunicipality !== 'ALL');
        
        if (isLocked) {
            targetMunicipality = userMunicipality;
        }

        if (id) {
            const m = profiles.find(p => p.id === id);
            if (m) {
                document.getElementById('modalTitle').innerHTML = '<i class="fa-solid fa-user-pen"></i> Edit Woman Profile';
                document.getElementById('memberId').value = m.id;
                document.getElementById('inputName').value = m.name;
                document.getElementById('inputBirthdate').value = m.birthdate || '';
                
                const computedAge = m.birthdate ? calculateAge(m.birthdate) : (m.age || '');
                document.getElementById('inputAge').value = computedAge;

                document.getElementById('inputCivilStatus').value = m.civilStatus;
                document.getElementById('inputOccupation').value = m.occupation || '';
                document.getElementById('inputPosition').value = m.position;
                document.getElementById('inputContact').value = m.contactNo || '';

                if (!isLocked) {
                    targetMunicipality = m.municipality || '';
                }
                targetBarangay = m.barangay || '';

                const img = m.imgUrl || m.avatar || '';
                document.getElementById('inputAvatar').value = img;
                updateAvatarPreview(img);

                document.getElementById('inputRemarks').value = m.remarks || '';
            }
        } else {
            document.getElementById('modalTitle').innerHTML = '<i class="fa-solid fa-user-plus"></i> Add Woman Profile';
            document.getElementById('memberId').value = '';
            updateAvatarPreview('');
        }

        // Load location dropdowns sequentially so the lock value isn't overwritten
        if (inputMemberMunicipality && inputMemberBarangay) {
            inputMemberMunicipality.disabled = isLocked;
            await populateMunicipalitySelect(inputMemberMunicipality, targetMunicipality);
            
            if (targetMunicipality) {
                await populateBarangaySelect(inputMemberBarangay, targetMunicipality, targetBarangay);
            } else {
                inputMemberBarangay.innerHTML = '<option value="">Select Barangay</option>';
            }
        }

        openModal(memberModal);
    }

    async function handleMemberFormSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('memberId').value;
        const name = document.getElementById('inputName').value.trim();
        const birthdate = document.getElementById('inputBirthdate').value;
        let age = parseInt(document.getElementById('inputAge').value) || 0;

        if (birthdate) {
            const calc = calculateAge(birthdate);
            if (calc !== '') age = calc;
        }

        const civilStatus = document.getElementById('inputCivilStatus').value;
        const occupation = document.getElementById('inputOccupation').value.trim();
        const position = document.getElementById('inputPosition').value;
        const contactNo = document.getElementById('inputContact').value.trim();
        const municipality = document.getElementById('inputMemberMunicipality') ? document.getElementById('inputMemberMunicipality').value : '';
        const barangay = document.getElementById('inputMemberBarangay') ? document.getElementById('inputMemberBarangay').value : '';
        const avatar = document.getElementById('inputAvatar').value.trim();
        const remarks = document.getElementById('inputRemarks').value.trim();

        const payload = { id, name, birthdate, age, civilStatus, occupation, position, contactNo, municipality, barangay, avatar, imgUrl: avatar, remarks };

        if (id) {
            const index = profiles.findIndex(p => p.id === id);
            if (index !== -1) {
                payload.dbId = profiles[index].dbId || profiles[index].id;
                profiles[index] = { ...profiles[index], ...payload };
            }
        } else {
            const newMember = {
                id: 'wom-' + Date.now(),
                ...payload
            };
            profiles.push(newMember);
        }

        saveProfilesLocal();
        closeModal(memberModal);
        renderApp();
        showToast(`Profile saved for ${name} (Age: ${age})`, 'success');

        try {
            await fetch('api.php?action=save_profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            fetchLiveDataFromDatabase();
        } catch (err) {
            console.log('Saved to LocalStorage. Backend offline.', err);
        }
    }



    window.appViewMember = function(id) {
        const item = profiles.find(p => p.id === id);
        if (!item) return;
        currentDetailMemberId = id;
        const avatarSrc = item.avatar || item.imgUrl || getDefaultAvatar(item.name);
        const seqNum = profiles.indexOf(item) + 1;
        const posClass = getPositionBadgeClass(item.position);
        const civilClass = getCivilPillClass(item.civilStatus);
        const computedAge = item.birthdate ? calculateAge(item.birthdate) : (item.age || 0);

        detailModalBody.innerHTML = `
            <div style="display:flex; align-items:center; gap:20px; margin-bottom:24px; background:var(--bg-input); padding:20px; border-radius:var(--radius-md);">
                <img src="${avatarSrc}" style="width:80px; height:80px; border-radius:50%; object-fit:cover; border:3px solid var(--primary-500);">
                <div>
                    <h2 style="font-size:1.4rem; font-weight:800; color:var(--text-main); margin-bottom:6px;">${item.name}</h2>
                    <span class="position-badge ${posClass}"><i class="fa-solid fa-ribbon"></i> ${item.position}</span>
                    <span style="font-size:0.8rem; margin-left:8px; color:var(--gold-400); font-weight:700;">Record #${seqNum}</span>
                </div>
            </div>

            <div class="form-grid">
                <div class="form-group">
                    <span class="detail-lbl">Date of Birth</span>
                    <span class="detail-val">${item.birthdate ? formatDateNice(item.birthdate) : 'N/A'}</span>
                </div>
                <div class="form-group">
                    <span class="detail-lbl">Computed Age</span>
                    <span class="detail-val">${computedAge} years old</span>
                </div>
                <div class="form-group">
                    <span class="detail-lbl">Civil Status</span>
                    <span class="civil-pill ${civilClass}">${item.civilStatus}</span>
                </div>
                <div class="form-group">
                    <span class="detail-lbl">Occupation</span>
                    <span class="detail-val">${item.occupation || 'N/A'}</span>
                </div>
                <div class="form-group full-width">
                    <span class="detail-lbl">Contact Number</span>
                    <span class="detail-val">${item.contactNo || 'N/A'}</span>
                </div>
                <div class="form-group full-width">
                    <span class="detail-lbl">Municipality & Barangay</span>
                    <span class="detail-val">${associationInfo.barangay}, ${associationInfo.municipality}</span>
                </div>
                <div class="form-group full-width">
                    <span class="detail-lbl">Association Name</span>
                    <span class="detail-val">${associationInfo.associationName}</span>
                </div>
                <div class="form-group full-width">
                    <span class="detail-lbl">Remarks / Notes</span>
                    <p style="background:rgba(255,255,255,0.05); padding:12px; border-radius:6px; font-size:0.9rem; color:var(--text-main);">${item.remarks || 'No remarks added.'}</p>
                </div>
            </div>
        `;

        openModal(detailModal);
    };

    window.appEditMember = function(id) {
        openMemberModal(id);
    };

    window.appDeleteMember = async function(id) {
        const item = profiles.find(p => p.id === id);
        if (!item) return;
        if (confirm(`Are you sure you want to delete profile for "${item.name}"?`)) {
            profiles = profiles.filter(p => p.id !== id);
            saveProfilesLocal();
            renderApp();
            showToast(`Deleted profile record for ${item.name}`, 'danger');

            try {
                await fetch('api.php?action=delete_profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, dbId: item.dbId || id })
                });
            } catch (err) {
                console.log('Deleted locally.', err);
            }
        }
    };

    function exportToCSV() {
        const filtered = getFilteredAndSortedProfiles();
        if (filtered.length === 0) {
            showToast('No profiling records to export', 'info');
            return;
        }

        try {
            let csvContent = "";
            csvContent += `MUNICIPALITY: ${associationInfo.municipality}, BARANGAY: ${associationInfo.barangay}\n`;
            csvContent += `ASSOCIATION: ${associationInfo.associationName}, PRESIDENT: ${associationInfo.presidentLeader}\n\n`;
            csvContent += "No.,Name of Woman,Date of Birth,Age,Civil Status,Occupation,Position,Contact Number,Remarks\n";

            filtered.forEach((p, index) => {
                const computedAge = p.birthdate ? calculateAge(p.birthdate) : (p.age || 0);
                const row = [
                    index + 1,
                    `"${(p.name || '').replace(/"/g, '""')}"`,
                    `"${p.birthdate || ''}"`,
                    computedAge,
                    `"${p.civilStatus}"`,
                    `"${(p.occupation || '').replace(/"/g, '""')}"`,
                    `"${p.position}"`,
                    `"${p.contactNo || ''}"`,
                    `"${(p.remarks || '').replace(/"/g, '""')}"`
                ];
                csvContent += row.join(",") + "\n";
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `ZDS_KALIPI_Profiling_${associationInfo.barangay}_CY2026.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showToast('CSV Profiling Report exported successfully', 'success');
        } catch (err) {
            console.error("Export Error:", err);
            showToast('Failed to export CSV', 'danger');
        }
    }

    function exportToJSON() {
        try {
            const data = {
                associationInfo,
                profiles: profiles,
                exportDate: new Date().toISOString()
            };
            const jsonStr = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", url);
            downloadAnchor.setAttribute("download", `ZDS_KALIPI_Backup_${associationInfo.barangay}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            URL.revokeObjectURL(url);
            showToast('JSON Dataset exported successfully', 'success');
        } catch (err) {
            console.error("Export Error:", err);
            showToast('Failed to export JSON', 'danger');
        }
    }

    function handleImportJSON(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const parsed = JSON.parse(event.target.result);
                if (parsed.profiles && Array.isArray(parsed.profiles)) {
                    profiles = parsed.profiles;
                    profiles.forEach(p => {
                        if (p.birthdate) p.age = calculateAge(p.birthdate);
                    });
                    if (parsed.associationInfo) {
                        associationInfo = parsed.associationInfo;
                        saveAssociationInfoLocal();
                        updateAssociationBanner();
                    }
                    saveProfilesLocal();
                    renderApp();
                    closeModal(importModal);
                    showToast(`Successfully imported ${profiles.length} profiles!`, 'success');
                } else {
                    alert('Invalid JSON file format.');
                }
            } catch (err) {
                alert('Error parsing JSON file.');
            }
        };
        reader.readAsText(file);
    }

    function handleResetData() {
        if (confirm('Are you sure you want to reset data to initial Zamboanga del Sur sample records? All custom changes will be overwritten.')) {
            associationInfo = { ...INITIAL_ASSOCIATION_INFO };
            profiles = [...INITIAL_WOMEN_PROFILES];
            profiles.forEach(p => {
                if (p.birthdate) p.age = calculateAge(p.birthdate);
            });
            saveAssociationInfoLocal();
            saveProfilesLocal();
            updateAssociationBanner();
            renderApp();
            closeModal(importModal);
            showToast('System data reset to initial ZDS KALIPI sample records', 'info');
        }
    }

    function showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let iconClass = 'fa-circle-info';
        if (type === 'success') iconClass = 'fa-circle-check';
        if (type === 'danger') iconClass = 'fa-circle-exclamation';

        toast.innerHTML = `<i class="fa-solid fa-${iconClass}"></i> <span>${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }
    // --- User Management Logic ---
    const userManagementBtn = document.getElementById('userManagementBtn');
    const userManagementModal = document.getElementById('userManagementModal');
    const closeUserManagementModal = document.getElementById('closeUserManagementModal');
    const closeUserManagementBtn = document.getElementById('closeUserManagementBtn');
    const createUserForm = document.getElementById('createUserForm');
    const usersTableBody = document.getElementById('usersTableBody');
    const newUserMunicipality = document.getElementById('newUserMunicipality');

    if (userManagementBtn) {
        userManagementBtn.addEventListener('click', () => {
            populateMunicipalitySelect(newUserMunicipality, 'ALL');
            loadUsers();
            openModal(userManagementModal);
        });
        
        closeUserManagementModal.addEventListener('click', () => closeModal(userManagementModal));
        closeUserManagementBtn.addEventListener('click', () => closeModal(userManagementModal));

        async function loadUsers() {
            try {
                const res = await fetch('api.php?action=get_users');
                const data = await res.json();
                if (data.status === 'success') {
                    usersTableBody.innerHTML = '';
                    data.users.forEach(user => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${user.username}</td>
                            <td>${user.municipality}</td>
                            <td><span class="badge ${user.role === 'superadmin' ? 'bg-primary' : 'bg-secondary'}">${user.role}</span></td>
                            <td>
                                <button class="badge bg-danger delete-user-btn" data-id="${user.id}"><i class="fa-solid fa-trash pointer-events-none"></i> Delete</button>
                            </td>
                        `;
                        usersTableBody.appendChild(tr);
                    });

                    document.querySelectorAll('.delete-user-btn').forEach(btn => {
                        btn.addEventListener('click', async (e) => {
                            if (confirm('Are you sure you want to delete this user?')) {
                                const id = e.target.getAttribute('data-id');
                                const dRes = await fetch('api.php?action=delete_user', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id })
                                });
                                const dData = await dRes.json();
                                if (dData.status === 'success') {
                                    showToast('User deleted', 'success');
                                    loadUsers();
                                } else {
                                    alert(dData.message);
                                }
                            }
                        });
                    });
                }
            } catch (err) {
                console.error(err);
            }
        }

        createUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('newUsername').value.trim();
            const password = document.getElementById('newUserPassword').value;
            const municipality = document.getElementById('newUserMunicipality').value;
            const role = municipality === 'ALL' ? 'superadmin' : 'admin';

            try {
                const res = await fetch('api.php?action=create_user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password, municipality, role })
                });
                const data = await res.json();
                if (data.status === 'success') {
                    showToast('User created', 'success');
                    createUserForm.reset();
                    loadUsers();
                } else {
                    alert(data.message);
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

});
