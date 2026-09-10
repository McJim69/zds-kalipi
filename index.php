<?php
require_once __DIR__ . '/version.php';
?>
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZDS-KALIPI Association</title>
    <!-- Meta Descriptions for SEO -->
    <meta name="description" content="Official Barangay Women's Profiling System CY 2026 for Zamboanga del Sur KALIPI-RIC Women Federation, Inc. Management, CRUD, Cards, Table, Analytics, and Printing.">
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <!-- Stylesheet with Cache Busting -->
    <link rel="stylesheet" href="<?php echo asset_url('css/style.css'); ?>">
	<link rel="shortcut icon" href="images/logo.png" type="image/x-icon">
</head>
<body>

    <div class="app-container">

        <!-- Header Navigation Bar -->
        <nav class="navbar" id="topNavbar">
            <div class="brand-wrapper">
                <img src="<?php echo asset_url('images/logo.jpg'); ?>" alt="ZDS KALIPI Logo" class="brand-logo" id="mainLogo">
                <div class="brand-info">
                    <h1>ZDS KALIPI-RIC Women Federation, Inc.</h1>
                    <p><i class="fa-solid fa-users-rectangle"></i> Women's Profiling System &bull; CY 2026 (v<?php echo APP_VERSION; ?>)</p>
                </div>
            </div>
            <div class="nav-actions">
                <button class="btn btn-secondary" id="themeToggleBtn" title="Toggle Light / Dark Mode">
                    <i class="fa-solid fa-moon" id="themeIcon"></i> <span id="themeText">Dark</span>
                </button>
                <button class="btn btn-secondary superadmin-only" id="userManagementBtn" title="User Management" style="display: none;">
                    <i class="fa-solid fa-users-gear"></i> <span>Users</span>
                </button>
                <button class="btn btn-secondary admin-only" id="importModalBtn" title="Import / Export Data" style="display: none;">
                    <i class="fa-solid fa-file-import"></i> <span>Tools</span>
                </button>
				<button class="btn btn-gold" id="printReportBtn" title="Print Official Excel Profiling Report">
                    <i class="fa-solid fa-print"></i> <span>Print</span>
                </button>
                <button class="btn btn-primary admin-only" id="addMemberBtn" style="display: none;">
                    <i class="fa-solid fa-user-plus"></i> <span>Add</span>
                </button>
                <button class="btn btn-secondary" id="authBtn" title="Admin Login">
                    <i class="fa-solid fa-lock" id="authIcon"></i> <span id="authText">Admin Login</span>
                </button>
            </div>
        </nav>

        <!-- Association Header Banner Card -->
        <section class="association-banner" id="associationBanner">
            <div class="banner-header">
                <div class="banner-title-group">
                    <h2>
                        <i class="fa-solid fa-landmark-flag" style="color: var(--gold-400);"></i>
                        <span id="dispAssociationName">KALIPI Women's Association</span>
                    </h2>
                    <p><i class="fa-solid fa-map-location-dot"></i> Women's Profiling Record</p>
                </div>
                <div>
                    <span class="badge-year">CY 2026 OFFICIAL FORM</span>
                </div>
            </div>

            <div class="association-grid">
                <div class="info-item">
                    <span class="info-label"><i class="fa-solid fa-city"></i> Municipality</span>
                    <span class="info-value" id="dispMunicipality">Pagadian City</span>
                </div>
                <div class="info-item">
                    <span class="info-label"><i class="fa-solid fa-location-dot"></i> Barangay</span>
                    <span class="info-value" id="dispBarangay">San Jose</span>
                </div>
                <div class="info-item">
                    <span class="info-label"><i class="fa-solid fa-user-tie"></i> President / Leader</span>
                    <span class="info-value" id="dispPresident">Ma. Elena S. Santos</span>
                </div>
                <div class="info-item">
                    <span class="info-label"><i class="fa-solid fa-phone"></i> Contact No.</span>
                    <span class="info-value" id="dispContactNo">0917-890-1234</span>
                </div>
                <div class="info-item">
                    <span class="info-label"><i class="fa-solid fa-certificate"></i> DOLE Registration #</span>
                    <span class="info-value" id="dispDoleReg">DOLE-IX-2024-0589-WA</span>
                </div>
            </div>
        </section>

        <!-- KPI Dashboard Widgets -->
        <section class="kpi-section" id="kpiContainer">
            <div class="kpi-card">
                <div class="kpi-icon purple">
                    <i class="fa-solid fa-venus"></i>
                </div>
                <div class="kpi-content">
                    <h3 id="kpiTotalMembers">0</h3>
                    <p>Total Women Profiled</p>
                </div>
            </div>

            <div class="kpi-card">
                <div class="kpi-icon gold">
                    <i class="fa-solid fa-crown"></i>
                </div>
                <div class="kpi-content">
                    <h3 id="kpiOfficersCount">0</h3>
                    <p>Association Officers</p>
                </div>
            </div>

            <div class="kpi-card">
                <div class="kpi-icon orchid">
                    <i class="fa-solid fa-hands-holding-child"></i>
                </div>
                <div class="kpi-content">
                    <h3 id="kpiSoloParents">0</h3>
                    <p>Solo Parents Advocates</p>
                </div>
            </div>

            <div class="kpi-card">
                <div class="kpi-icon blue">
                    <i class="fa-solid fa-chart-pie"></i>
                </div>
                <div class="kpi-content">
                    <h3 id="kpiAvgAge">0 yrs</h3>
                    <p>Average Age</p>
                </div>
            </div>
        </section>

        <!-- Toolbar: Search, Filter, Sort & View Mode Switcher -->
        <section class="toolbar" id="appToolbar">
            <div class="search-filter-group">
                <div class="search-box">
                    <i class="fa-solid fa-magnifying-glass search-icon"></i>
                    <input type="text" id="searchInput" class="search-input" placeholder="Search by name, occupation, position, remarks...">
                    <button class="clear-search-btn" id="clearSearchBtn"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <select id="municipalityFilter" class="filter-select">
                    <option value="ALL">All Municipalities</option>
                </select>

                <select id="barangayFilter" class="filter-select">
                    <option value="ALL">All Barangays</option>
                </select>

                <select id="civilStatusFilter" class="filter-select">
                    <option value="ALL">All Civil Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                    <option value="Solo Parent">Solo Parent</option>
                </select>

                <select id="positionFilter" class="filter-select">
                    <option value="ALL">All Positions</option>
                    <option value="President">President</option>
                    <option value="Vice President">Vice President</option>
                    <option value="Secretary">Secretary</option>
                    <option value="Treasurer">Treasurer</option>
                    <option value="Auditor">Auditor</option>
                    <option value="P.R.O.">P.R.O.</option>
                    <option value="Board Member">Board Member</option>
                    <option value="Member">Member</option>
                </select>

                <select id="sortBySelect" class="filter-select">
                    <option value="no-asc">Sort by No. (1-99)</option>
                    <option value="name-asc">Name (A - Z)</option>
                    <option value="name-desc">Name (Z - A)</option>
                    <option value="age-asc">Age (Youngest First)</option>
                    <option value="age-desc">Age (Oldest First)</option>
                    <option value="position">Position Priority</option>
                </select>
            </div>

            <div class="actions-group">
                <div class="view-toggle">
                    <button class="view-btn active" id="viewCardsBtn" data-view="cards">
                        <i class="fa-solid fa-border-all"></i> Cards View
                    </button>
                    <button class="view-btn" id="viewTableBtn" data-view="table">
                        <i class="fa-solid fa-list-check"></i> Table View
                    </button>
                </div>
            </div>
        </section>

        <!-- Main Display Container (Card Grid & Table Views) -->
        <main id="mainContentArea">
            <!-- Cards View Grid Container -->
            <div class="cards-grid" id="cardsViewContainer"></div>

            <!-- Table View Container -->
            <div class="table-container" id="tableViewContainer" style="display: none;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Name of Woman</th>
                            <th>Age</th>
                            <th>Civil Status</th>
                            <th>Occupation</th>
                            <th>Position</th>
                            <th>Contact Number</th>
                            <th>Remarks</th>
                            <th style="text-align: center;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="tableBody"></tbody>
                </table>
            </div>

            <!-- Empty Search Results State -->
            <div class="empty-state" id="emptyState" style="display: none;">
                <div class="empty-icon"><i class="fa-solid fa-folder-open"></i></div>
                <h3>No Matching Profiling Records Found</h3>
                <p>Try adjusting your search keywords or filter dropdowns to find woman profiles.</p>
                <button class="btn btn-secondary" id="resetFiltersBtn"><i class="fa-solid fa-rotate-left"></i> Reset Filters</button>
            </div>
        </main>

    </div>

    <!-- Sticky Footer
    <footer style="position: sticky; bottom: 0; width: 100%; background: var(--bg-card); border-top: 1px solid var(--border-color); padding: 10px 24px; text-align: center; z-index: 100; font-size: 0.8rem; color: var(--text-muted); box-shadow: 0 -2px 10px rgba(0,0,0,0.1);">
        &copy; 2026 Zamboanga del Sur KALIPI-RIC Federation. All Rights Reserved.
    </footer> -->

    <!-- MODAL 0: Admin Login Modal -->
    <div class="modal-overlay" id="loginModal">
        <div class="modal-card" style="max-width: 400px;">
            <div class="modal-header">
                <h3><i class="fa-solid fa-shield-halved"></i> Admin Authentication</h3>
                <button class="close-modal-btn" id="closeLoginModal"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <form id="loginForm">
                <div class="modal-body">
                    <p style="margin-bottom: 15px; color: var(--text-muted); font-size: 0.9rem;">
                        Please enter your assigned municipality credentials to unlock data modification tools.
                    </p>
                    <div class="form-group full-width">
                        <label class="form-label" for="adminUsername">Username</label>
                        <input type="text" id="adminUsername" class="form-input" required autocomplete="username">
                    </div>
                    <div class="form-group full-width" style="margin-top: 15px;">
                        <label class="form-label" for="adminPassword">Password</label>
                        <input type="password" id="adminPassword" class="form-input" required autocomplete="current-password">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" id="cancelLoginBtn">Cancel</button>
                    <button type="submit" class="btn btn-primary"><i class="fa-solid fa-right-to-bracket"></i> Login</button>
                </div>
            </form>
        </div>
    </div>

    <!-- MODAL 1: Add / Edit Woman Profile Modal -->
    <div class="modal-overlay" id="memberModal">
        <div class="modal-card">
            <div class="modal-header">
                <h3 id="modalTitle"><i class="fa-solid fa-user-plus"></i> Add Woman Profile</h3>
                <button class="close-modal-btn" id="closeMemberModal"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <form id="memberForm">
                <div class="modal-body">
                    <input type="hidden" id="memberId">
                    <div class="form-grid">
                        <div class="form-group full-width">
                            <label class="form-label" for="inputName">Full Name of Woman *</label>
                            <input type="text" id="inputName" class="form-input" placeholder="e.g. Maria Clara G. Santos" required>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="inputMemberMunicipality">Municipality *</label>
                            <select id="inputMemberMunicipality" class="form-select" required></select>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="inputMemberBarangay">Barangay *</label>
                            <select id="inputMemberBarangay" class="form-select" required></select>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="inputBirthdate">Date of Birth</label>
                            <input type="date" id="inputBirthdate" class="form-input">
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="inputAge">Age (Auto-calculated) *</label>
                            <input type="number" id="inputAge" class="form-input" min="15" max="110" placeholder="e.g. 42" required>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="inputCivilStatus">Civil Status *</label>
                            <select id="inputCivilStatus" class="form-select" required>
                                <option value="Single">Single</option>
                                <option value="Married" selected>Married</option>
                                <option value="Widowed">Widowed</option>
                                <option value="Separated">Separated</option>
                                <option value="Solo Parent">Solo Parent</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="inputOccupation">Occupation / Source of Livelihood</label>
                            <input type="text" id="inputOccupation" class="form-input" placeholder="e.g. Public School Teacher, Business Owner">
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="inputPosition">Position in Association *</label>
                            <select id="inputPosition" class="form-select" required>
                                <option value="President">President</option>
                                <option value="Vice President">Vice President</option>
                                <option value="Secretary">Secretary</option>
                                <option value="Treasurer">Treasurer</option>
                                <option value="Auditor">Auditor</option>
                                <option value="P.R.O.">P.R.O.</option>
                                <option value="Board Member">Board Member</option>
                                <option value="Member" selected>Member</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="inputContact">Contact Number</label>
                            <input type="text" id="inputContact" class="form-input" placeholder="e.g. 0917-123-4567">
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="inputAvatar">Avatar Image URL (Optional)</label>
                            <input type="text" id="inputAvatar" class="form-input" placeholder="https://...">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Photo Upload / Live Preview</label>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <input type="file" id="inputAvatarFile" accept="image/*" style="display: none;">
                                <button type="button" class="btn btn-secondary" id="browseAvatarBtn" style="padding: 9px 12px; font-size: 0.8rem; flex: 1; justify-content: center;">
                                    <i class="fa-solid fa-camera"></i> Choose Photo
                                </button>
                                <button type="button" class="btn btn-secondary btn-icon-only" id="clearAvatarBtn" title="Clear / Remove Photo" style="padding: 9px; display: none;">
                                    <i class="fa-solid fa-trash-can" style="color: #ef4444;"></i>
                                </button>
                                <div id="avatarPreviewBox" title="Click or Drag & Drop image here to update photo" style="width: 44px; height: 44px; border-radius: 50%; background: var(--bg-input); border: 2px solid var(--primary-500); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; cursor: pointer; transition: transform 0.2s ease;">
                                    <i class="fa-solid fa-user" id="avatarPreviewIcon" style="color: var(--text-muted); font-size: 1.1rem;"></i>
                                    <img id="avatarPreviewImg" src="" style="width: 100%; height: 100%; object-fit: cover; display: none;">
                                </div>
                            </div>
                        </div>

                        <div class="form-group full-width">
                            <label class="form-label" for="inputRemarks">Remarks / Notes</label>
                            <textarea id="inputRemarks" class="form-textarea" placeholder="e.g. Active in Livelihood Project, Crafts Coordinator..."></textarea>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" id="cancelMemberModal">Cancel</button>
                    <button type="submit" class="btn btn-primary" id="saveMemberBtn"><i class="fa-solid fa-floppy-disk"></i> Save Profile</button>
                </div>
            </form>
        </div>
    </div>

    <!-- MODAL 2: View Member Details Modal -->
    <div class="modal-overlay" id="detailModal">
        <div class="modal-card">
            <div class="modal-header">
                <h3><i class="fa-solid fa-address-card"></i> Woman Member Profile Sheet</h3>
                <button class="close-modal-btn" id="closeDetailModal"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body" id="detailModalBody">
                <!-- Dynamically Rendered Detailed Profile View -->
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="closeDetailBtn">Close</button>
                <button class="btn btn-primary admin-only" id="editFromDetailBtn" style="display: none;"><i class="fa-solid fa-pen-to-square"></i> Edit Member</button>
            </div>
        </div>
    </div>

    <!-- MODAL 3: Edit Association Header Info Modal -->

    <!-- MODAL 5: User Management (Super Admin Only) -->
    <div class="modal-overlay" id="userManagementModal">
        <div class="modal-card" style="max-width: 600px;">
            <div class="modal-header">
                <h3><i class="fa-solid fa-users-gear"></i> User Management</h3>
                <button class="close-modal-btn" id="closeUserManagementModal"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 20px;">
                    <h4>Create New User</h4>
                    <form id="createUserForm" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: var(--bg-input); padding: 15px; border-radius: var(--radius-md); margin-top: 10px;">
                        <div class="form-group">
                            <label class="form-label" for="newUsername">Username</label>
                            <input type="text" id="newUsername" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="newUserPassword">Password</label>
                            <input type="password" id="newUserPassword" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="newUserMunicipality">Municipality</label>
                            <select id="newUserMunicipality" class="form-input" required>
                                <option value="">Select Municipality</option>
                                <option value="ALL">ALL (Super Admin)</option>
                                <!-- Will be populated dynamically -->
                            </select>
                        </div>
                        <div class="form-group" style="display: flex; align-items: flex-end;">
                            <button type="submit" class="btn btn-primary full-width"><i class="fa-solid fa-plus"></i> Create User</button>
                        </div>
                    </form>
                </div>
                <div>
                    <h4>Existing Users</h4>
                    <div style="overflow-x: auto; margin-top: 10px; background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <table class="data-table" style="margin-bottom: 0;">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Municipality</th>
                                    <th>Role</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody id="usersTableBody">
                                <!-- Users will be listed here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="closeUserManagementBtn">Close</button>
            </div>
        </div>
    </div>

    <!-- MODAL 4: Data Tools (Export / Import / Reset) -->
    <div class="modal-overlay" id="importModal">
        <div class="modal-card">
            <div class="modal-header">
                <h3><i class="fa-solid fa-database"></i> Data Management</h3>
                <button class="close-modal-btn" id="closeImportModal"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body">
                <div style="display: flex; flex-direction: column; gap: 18px;">
                    <div style="background: var(--bg-input); padding: 16px; border-radius: var(--radius-md);">
                        <h4 style="font-size: 0.95rem; margin-bottom: 8px;"><i class="fa-solid fa-file-csv" style="color: #10b981;"></i> Backup and Restore Records</h4>
                        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">Download current dataset to CSV (Excel) or JSON format.</p>
                        <div style="display: flex; gap: 10px;">
                            <button class="btn btn-secondary" id="exportCsvBtn" style="width:33%"><i class="fa-solid fa-download"></i> Export CSV</button>
                            <button class="btn btn-secondary superadmin-only" id="exportJsonBtn" style="width:33%;display: none;"><i class="fa-solid fa-code"></i> Export JSON</button>
							<input type="file" id="importFileInput" accept=".json" style="display:none" onchange="document.getElementById('fileBtn').value = this.files.length ? this.files[0].name : 'Select';">
							<button class="btn btn-secondary superadmin-only" id="fileBtn" onclick="document.getElementById('importFileInput').click();" style="width:33%;display: none;"><i class="fa-solid fa-upload"></i> Restore JSON</button>
						</div>
                    </div>

                    <div class="superadmin-only" style="background: rgba(124, 58, 237, 0.12); border: 1px solid rgba(124, 58, 237, 0.4); padding: 16px; border-radius: var(--radius-md); display: none;">
                        <h4 style="font-size: 0.95rem; color: #c4b5fd; margin-bottom: 8px;"><i class="fa-solid fa-arrows-rotate" style="color: var(--gold-400);"></i> Sync Localhost <-> Remote Server</h4>
                        <!--<p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">Push your local dataset directly to your live server API endpoint.</p>-->
                        <div class="form-group" style="margin-bottom: 10px;">
                            <label class="form-label" for="syncTargetUrl">Production API Endpoint URL</label>
                            <input type="url" id="syncTargetUrl" class="form-input" value="https://mcjim-server.com/projects/zds-kalipi/api.php">
                        </div>
                        <div class="form-group" style="margin-bottom: 12px;">
                            <label class="form-label" for="syncSecretToken">Sync Secret Token</label>
                            <div style="display: flex; gap: 10px;">
                                <input type="text" id="syncSecretToken" class="form-input" value="ZDS_KALIPI_SECRET_TOKEN_2026" placeholder="Enter your custom secret token..." style="width:50%">
                                <button type="button" class="btn btn-secondary" id="genSyncTokenBtn" title="Generate Random Secure Token" style="padding: 8px 12px; font-size: 0.8rem;width:50%">
                                    <i class="fa-solid fa-key" style="color: var(--gold-400);"></i> Generate Token
                                </button>
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button class="btn btn-gold" id="triggerSyncBtn" style="flex: 1;"><i class="fa-solid fa-cloud-arrow-up"></i> Push to Production</button>
                            <button class="btn btn-secondary" id="pullSyncBtn" style="flex: 1; border-color: var(--gold-400); color: var(--gold-400);"><i class="fa-solid fa-cloud-arrow-down"></i> Pull from Production</button>
                        </div>
                    </div>
                    <div class="superadmin-only" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); padding: 16px; border-radius: var(--radius-md); display: none;">
                        <h4 style="font-size: 0.95rem; color: #ef4444; margin-bottom: 8px;"><i class="fa-solid fa-triangle-exclamation"></i> Reset System Data</h4>
                        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">Reset all records to initial Zamboanga del Sur KALIPI sample dataset.</p>
                        <button class="btn btn-danger" id="resetDataBtn"><i class="fa-solid fa-rotate"></i> Reset to Sample Data</button>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="closeImportModalBtn">Close</button>
            </div>
        </div>
    </div>

    <!-- Floating Toast Notification -->
    <div class="toast-container" id="toastContainer"></div>

    <!-- Scripts with Cache Busting -->
    <script src="<?php echo asset_url('js/sample-data.js'); ?>"></script>
    <script src="<?php echo asset_url('js/app.js'); ?>"></script>
</body>
</html>
