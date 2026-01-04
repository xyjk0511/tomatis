# Tomatis Training Management Console (Frontend Prototype)

Live demo: https://6943daf9536c1156259a0f17--velvety-valkyrie-af2a4f.netlify.app/

This project is a Vite + React + Tailwind frontend prototype that simulates a Tomatis training clinic workflow. It focuses on UI/UX, user flows, and data presentation using local mock data, making it suitable for demos, product discovery, and rapid iteration before backend integration.

## What this app covers
1) Device monitoring center
   - 12-channel device cards with status and progress display
   - Start/pause/resume/stop per device and batch start/pause
   - Session timers and progress tracking for ongoing sessions
   - Volume controls for air/bone channels
2) Login & security flows
   - Demo login options and first-login password change
   - Failed login attempt lockout with timed countdown
3) Patient archive
   - Add/edit/delete patient profiles
   - Search with name/ID/phone/pinyin matching
   - Pagination for patient list and treatment records
   - Date range filtering and record selection
   - PDF and Excel export of treatment reports
4) Scheme management
   - Preset and custom treatment schemes
   - Copy/edit/delete schemes
   - Multi-stage parameter tables and JSON export
5) Media library
   - Folder tree navigation with counts
   - Search, sort, selection, batch operations
   - Audio preview controls and file details panel
   - Recording/import modals and “export to Audacity” demo flow
6) System settings
   - Audacity path configuration (demo-only)

## Tech stack
- React 18 + Vite
- Tailwind CSS
- jsPDF + jspdf-autotable (PDF export)
- xlsx (Excel export)
- lucide-react (icons)

## Quick start
```bash
npm install
npm run dev
```

Build & preview:
```bash
npm run build
npm run preview
```

## Scripts
- `npm run dev`: start local dev server
- `npm run build`: production build
- `npm run preview`: preview production build locally

## Project structure
```
.
├─ App.jsx
├─ index.html
├─ main.jsx
├─ index.css
├─ components/
│  ├─ common/
│  ├─ media/
│  ├─ modals/
│  ├─ patient/
│  └─ scheme/
├─ data/
│  └─ mockData.js
├─ utils/
│  ├─ helpers.js
│  ├─ helpers.jsx
│  └─ styles.js
└─ views/
   ├─ DashboardView.jsx
   ├─ LoginView.jsx
   ├─ MediaLibraryView.jsx
   ├─ PatientArchiveView.jsx
   ├─ PatientDetailsView.jsx
   ├─ SchemeManagementView.jsx
   └─ SettingsView.jsx
```

## Architecture and data flow
The app is a single-page React UI driven by state in `App.jsx`:
- Global state includes authentication, current view, devices, patients, records, media files, and modals.
- `mockData.js` provides the seed data and default scheme templates.
- Each view receives state and callbacks as props; views are largely presentational.

### Key state objects
- Devices: status, progress info, volume, patient binding
- Patients: profile, history, last scheme, training progress
- Records: treatment history per patient
- Media: file list and folder tree

## Views and behavior

### Dashboard (Device Monitoring)
File: `views/DashboardView.jsx`
- Displays devices in a 4x3 grid with status and actions.
- Supports individual and batch actions:
  - Start, pause, resume, stop
  - Volume adjustments (air/bone)
- Tracks session time and progress per device.

### Login
File: `views/LoginView.jsx`
- Simulated login with lockout after repeated failures.
- “First login” flow triggers a password change modal.

### Patient Archive
File: `views/PatientArchiveView.jsx`
- Patient list supports search by name, MRN, phone, and pinyin.
- CRUD via modal forms; validations on required fields and date.
- Treatment records show:
  - Date range filtering
  - Record selection and batch export
  - PDF/Excel export with jsPDF + xlsx

### Patient Details
File: `views/PatientDetailsView.jsx`
- Displays current device session details for the selected patient.
- Provides quick actions similar to Dashboard controls.

### Scheme Management
File: `views/SchemeManagementView.jsx`
- Preset and custom schemes displayed with filters.
- Scheme details show multi-stage parameter tables.
- Supports:
  - Create new scheme (from template or empty)
  - Copy existing scheme
  - Edit and delete custom schemes
  - Export scheme to JSON

### Media Library
File: `views/MediaLibraryView.jsx`
- Folder tree with recursive counts and breadcrumbs.
- File list supports:
  - Search and multi-select
  - Sorting by name/date/duration
  - Context menu actions
- Right panel shows details, playback controls, and actions.
- “Export to Audacity” is a demo flow that triggers a modal.

### Settings
File: `views/SettingsView.jsx`
- Audacity path setting (demo only).

## Mock data
File: `data/mockData.js`
- `SYSTEM_CONFIG`: version label used in header.
- `MOCK_PATIENTS_DATA`: patient seed data.
- `MOCK_TREATMENT_RECORDS`: treatment record seed data.
- `MOCK_MEDIA_FILES`: media file seed data.
- `DEFAULT_STAGES` and `INITIAL_SCHEMES`: scheme templates.

## Export features
- Patient reports:
  - PDF export via jsPDF + autoTable
  - Excel export via xlsx
- Scheme export:
  - JSON file download (client-side)

## Limitations (prototype scope)
- No backend or persistence; data resets on refresh.
- Recording, file move, and export are UI-level demos only.
- No authentication or role-based access control.

## Customization guide
- Branding: update header logo/title in `App.jsx`.
- Device grid size: adjust layout in `views/DashboardView.jsx`.
- Schemes: update defaults in `data/mockData.js`.
- Colors and global styles: `utils/styles.js` and Tailwind classes.

## Troubleshooting
- If the app fails to start, ensure Node.js is installed and run `npm install`.
- If exports fail in some browsers, try another browser with file download enabled.
- If fonts do not render as expected in PDF, update jsPDF font setup.

## License
Not specified. Add a `LICENSE` file if you plan to open source this project.
