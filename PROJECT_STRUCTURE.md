# Project Structure - Roro Kostum

Dokumentasi lengkap struktur folder dan arsitektur aplikasi.

## 📁 Directory Structure

```
roro-kostum/
├── public/                      # Static assets
│   ├── image.png               # Placeholder image
│   └── logo.svg                # Company logo
│
├── src/                        # Source code
│   ├── components/             # Reusable React components
│   │   ├── AdminLayout.jsx     # Admin panel layout wrapper
│   │   ├── FloatingWhatsApp.jsx # Floating WhatsApp button
│   │   ├── Footer.jsx          # Site footer with social media
│   │   ├── Navbar.jsx          # Main navigation bar
│   │   └── ProtectedRoute.jsx  # Auth guard for admin routes
│   │
│   ├── contexts/               # React Context providers
│   │   └── AuthContext.jsx     # Authentication state management
│   │
│   ├── lib/                    # External library configs
│   │   └── supabase.js         # Supabase client initialization
│   │
│   ├── pages/                  # Page components
│   │   ├── admin/              # Admin portal pages
│   │   │   ├── AdminDashboard.jsx   # Admin home with statistics
│   │   │   ├── AdminKategori.jsx    # Category management
│   │   │   ├── AdminKostum.jsx      # Costume management
│   │   │   ├── AdminLogin.jsx       # Admin authentication
│   │   │   ├── AdminOrders.jsx      # Order management
│   │   │   └── AdminSettings.jsx    # App settings
│   │   │
│   │   ├── CompanyProfile.jsx  # About company page
│   │   ├── DetailKostum.jsx    # Costume detail page
│   │   ├── Gallery.jsx         # Costume catalog
│   │   ├── Home.jsx            # Landing page
│   │   ├── ProsedurSewa.jsx    # Rental procedure page
│   │   └── TrackingOrder.jsx   # Order tracking page
│   │
│   ├── styles/                 # CSS files
│   │   ├── AdminCRUD.css       # Admin CRUD forms styling
│   │   ├── AdminDashboard.css  # Dashboard specific styles
│   │   ├── AdminLayout.css     # Admin layout styles
│   │   ├── AdminLogin.css      # Login page styles
│   │   ├── AdminOrders.css     # Orders page styles
│   │   ├── DetailKostum.css    # Detail page styles
│   │   ├── FloatingWhatsApp.css # WhatsApp button styles
│   │   ├── Footer.css          # Footer styles
│   │   ├── Gallery.css         # Gallery grid styles
│   │   ├── Home.css            # Homepage styles
│   │   ├── Navbar.css          # Navigation styles
│   │   ├── StaticPages.css     # Static pages common styles
│   │   └── TrackingOrder.css   # Tracking page styles
│   │
│   ├── App.jsx                 # Main app component with routing
│   ├── index.css               # Global styles & CSS variables
│   └── main.jsx                # App entry point
│
├── supabase/                   # Supabase configuration
│   └── migrations/             # Database migrations
│       ├── 20251217003742_create_roro_kostum_schema.sql
│       ├── 20251217030220_create_orders_table.sql
│       ├── 20251217031942_add_quantity_to_kostum.sql
│       ├── 20251217033053_add_kuantitas_to_orders.sql
│       ├── 20251217042450_create_kostum_images_bucket.sql
│       └── 20251217065200_add_social_media_settings.sql
│
├── dist/                       # Build output (generated)
│
├── .env                        # Environment variables (gitignored)
├── .gitignore                  # Git ignore rules
├── index.html                  # HTML entry point
├── package.json                # NPM dependencies & scripts
├── vite.config.js              # Vite configuration
│
└── Documentation/              # Project documentation
    ├── CREATE_ADMIN.md         # Admin user creation guide
    ├── DEPLOYMENT.md           # Deployment instructions
    ├── PROJECT_STRUCTURE.md    # This file
    ├── QUICKSTART.md           # Quick setup guide
    ├── README.md               # Project overview
    └── SETUP_GUIDE.md          # Complete setup guide
```

---

## 🏗️ Architecture Overview

### Frontend Architecture

```
┌─────────────────────────────────────────┐
│           React Application             │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │         React Router              │ │
│  │  ┌─────────────┬─────────────┐   │ │
│  │  │   Public    │    Admin    │   │ │
│  │  │   Routes    │   Routes    │   │ │
│  │  └─────────────┴─────────────┘   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │       Auth Context                │ │
│  │   (Global Auth State)             │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │      Supabase Client              │ │
│  │  - Database queries               │ │
│  │  - Authentication                 │ │
│  │  - Storage operations             │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│          Supabase Backend               │
│  ┌─────────────────────────────────┐   │
│  │     PostgreSQL Database         │   │
│  │  - kategori                     │   │
│  │  - kostum                       │   │
│  │  - orders                       │   │
│  │  - settings                     │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │     Authentication              │   │
│  │  - auth.users                   │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │     Storage                     │   │
│  │  - kostum-images bucket         │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       │ 1. Navigate to /admin/login
       ▼
┌──────────────────┐
│   AdminLogin     │
│   Component      │
└──────┬───────────┘
       │
       │ 2. Submit credentials
       ▼
┌──────────────────┐
│  supabase.auth   │
│  .signInWith     │
│  Password()      │
└──────┬───────────┘
       │
       │ 3. Validate credentials
       ▼
┌──────────────────┐
│   Supabase       │
│   Auth Service   │
└──────┬───────────┘
       │
       │ 4. Return session
       ▼
┌──────────────────┐
│  AuthContext     │
│  (set user)      │
└──────┬───────────┘
       │
       │ 5. Redirect
       ▼
┌──────────────────┐
│ ProtectedRoute   │
│ (check auth)     │
└──────┬───────────┘
       │
       │ 6. Render if authenticated
       ▼
┌──────────────────┐
│ Admin Dashboard  │
└──────────────────┘
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐
│  auth.users     │  ← Supabase Built-in Table
├─────────────────┤     (untuk admin authentication)
│ • id (PK)       │
│ • email         │
│ • encrypted_pw  │
│ • created_at    │
│ • confirmed_at  │
│ • metadata      │
└─────────────────┘

┌─────────────────┐         ┌─────────────────┐
│    kategori     │◄────────│     kostum      │
├─────────────────┤  1:N    ├─────────────────┤
│ • id (PK)       │         │ • id (PK)       │
│ • nama          │         │ • kategori_id   │
│ • created_at    │         │ • nama          │
│ • updated_at    │         │ • ukuran        │
└─────────────────┘         │ • harga_sewa    │
                            │ • kuantitas     │
                            │ • deskripsi     │
                            │ • gambar_url    │
                            │ • status        │
                            └────────┬────────┘
                                     │
                                     │ 1:N
                                     ▼
                            ┌─────────────────┐
                            │     orders      │
                            ├─────────────────┤
                            │ • id (PK)       │
                            │ • kode_booking  │
                            │ • kostum_id     │
                            │ • nama_penyewa  │
                            │ • whatsapp      │
                            │ • tanggal_sewa  │
                            │ • tanggal_kemb  │
                            │ • kuantitas     │
                            │ • total_harga   │
                            │ • status        │
                            │ • catatan       │
                            └─────────────────┘

┌─────────────────┐
│    settings     │
├─────────────────┤
│ • id (PK)       │
│ • key (UNIQUE)  │
│ • value         │
│ • updated_at    │
└─────────────────┘
```

### Catatan Penting tentang Users

**TIDAK ADA tabel `users` custom!**

Project ini menggunakan **Supabase Authentication** yang sudah menyediakan tabel `auth.users` secara built-in. Tabel ini mengelola:
- Email & password authentication
- Encrypted passwords
- Session tokens
- User metadata
- Email confirmation

Untuk mengelola admin users, lihat dokumentasi: **[USER_MANAGEMENT.md](./USER_MANAGEMENT.md)**

---

## 🎨 Component Hierarchy

### Public Pages

```
App
├── Navbar
├── FloatingWhatsApp
├── Routes
│   ├── Home
│   │   └── Featured costumes grid
│   ├── Gallery
│   │   ├── Category filter
│   │   └── Costume cards
│   ├── DetailKostum
│   │   ├── Image gallery
│   │   ├── Costume info
│   │   └── WhatsApp CTA
│   ├── TrackingOrder
│   │   └── Order lookup form
│   ├── ProsedurSewa
│   │   └── Static content
│   └── CompanyProfile
│       ├── Company info
│       ├── Google Maps embed
│       └── Social media links
└── Footer
    ├── Company info
    ├── Quick links
    └── Social media icons
```

### Admin Pages

```
App
├── Navbar (admin mode)
└── Routes (Protected)
    ├── AdminLogin
    │   └── Login form
    └── AdminLayout (sidebar + content)
        ├── Sidebar navigation
        └── Content area
            ├── AdminDashboard
            │   └── Statistics cards
            ├── AdminKategori
            │   ├── Category list table
            │   └── CRUD modal
            ├── AdminKostum
            │   ├── Costume list table
            │   └── CRUD form with image upload
            ├── AdminOrders
            │   ├── Orders table
            │   └── Status update modal
            └── AdminSettings
                └── Settings form
                    ├── Basic info
                    ├── Rental procedure
                    ├── Social media
                    └── Google Maps
```

---

## 🔄 Data Flow

### Example: Viewing Costumes (Public)

```
1. User visits /gallery

2. Gallery component mounts
   └─> useEffect() triggers

3. Fetch costumes from Supabase
   const { data } = await supabase
     .from('kostum')
     .select('*, kategori(*)')

4. Data retrieved with RLS check
   └─> Public read access allowed

5. State updated
   setKostumList(data)

6. Component re-renders
   └─> Costume cards displayed
```

### Example: Creating Costume (Admin)

```
1. Admin clicks "Tambah Kostum"

2. Form modal opens

3. Admin fills form & selects image

4. Image upload process:
   a. File converted to blob
   b. Upload to Supabase Storage
      const { data } = await supabase.storage
        .from('kostum-images')
        .upload(filename, file)
   c. Get public URL

5. Create kostum record:
   const { data, error } = await supabase
     .from('kostum')
     .insert({
       nama, kategori_id, ukuran,
       harga_sewa, kuantitas, deskripsi,
       gambar_url, status
     })

6. RLS check: Is user authenticated?
   └─> Yes → Insert allowed
   └─> No → Error

7. Success response
   └─> Refresh kostum list
   └─> Close modal
   └─> Show success message
```

---

## 🎭 State Management

### Global State (Context)

**AuthContext** (`src/contexts/AuthContext.jsx`)
- Manages user authentication state
- Provides: `user`, `signIn`, `signOut`, `loading`
- Used by: ProtectedRoute, Admin components

### Local State (Component-level)

Each page/component manages its own state:

**Gallery Component:**
- `kostumList` - Array of costumes
- `kategoriList` - Array of categories
- `selectedKategori` - Current filter
- `loading` - Loading state

**AdminKostum Component:**
- `kostumList` - Costumes data
- `showModal` - Modal visibility
- `editMode` - Create vs Edit mode
- `formData` - Form inputs
- `imageFile` - Selected image

---

## 🔒 Security Implementation

### Row Level Security (RLS)

**Public Tables** (`kategori`, `kostum`)
```sql
-- Read: Everyone
-- Write: Authenticated only

CREATE POLICY "Public can read"
ON kostum FOR SELECT
USING (true);

CREATE POLICY "Authenticated can write"
ON kostum FOR INSERT
TO authenticated
USING (true);
```

**Orders Table**
```sql
-- Users can create their own orders
-- Admins can read/update all orders

CREATE POLICY "Anyone can create order"
ON orders FOR INSERT
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
TO authenticated
USING (true);
```

**Settings Table**
```sql
-- Public read for app functionality
-- Admin write only

CREATE POLICY "Public can read settings"
ON settings FOR SELECT
USING (true);

CREATE POLICY "Authenticated can update"
ON settings FOR UPDATE
TO authenticated
USING (true);
```

### Storage Security

```sql
-- kostum-images bucket
-- Public read, Authenticated write

CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'kostum-images');

CREATE POLICY "Authenticated write access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'kostum-images');
```

### Route Protection

**ProtectedRoute Component:**
```javascript
if (loading) return <Loading />
if (!user) return <Navigate to="/admin/login" />
return children
```

---

## 📦 Key Dependencies

### Production Dependencies

- **react** (18.3.1) - UI library
- **react-dom** (18.3.1) - React DOM renderer
- **react-router-dom** (6.28.0) - Routing
- **@supabase/supabase-js** (2.45.7) - Supabase client

### Development Dependencies

- **vite** (6.0.7) - Build tool & dev server
- **@vitejs/plugin-react** (4.3.4) - React plugin for Vite

---

## 🎨 Styling Approach

### CSS Architecture

**Global Styles** (`src/index.css`)
- CSS Custom Properties (variables)
- Reset & base styles
- Utility classes
- Responsive breakpoints

**Component Styles** (`src/styles/*.css`)
- Component-specific styles
- Follows BEM-like naming
- Responsive design
- Modular & maintainable

### Design System

**Colors:**
```css
--gold: #D4AF37;
--black: #0A0A0A;
--white: #FFFFFF;
--gray-50 to --gray-900;
```

**Typography:**
```css
--font-sans: 'Inter', system-ui, sans-serif;
--font-serif: 'Playfair Display', serif;
```

**Spacing Scale:**
- Based on 8px grid system
- 0.5rem, 1rem, 1.5rem, 2rem, etc.

**Breakpoints:**
```css
Mobile: < 640px
Tablet: 640px - 1024px
Desktop: > 1024px
```

---

## 🚀 Build Process

### Development

```bash
npm run dev
```

**What happens:**
1. Vite starts dev server on port 5173
2. Hot Module Replacement (HMR) enabled
3. Fast refresh for React components
4. Source maps enabled

### Production Build

```bash
npm run build
```

**What happens:**
1. Vite builds project
2. Code splitting & tree shaking
3. Asset optimization
4. CSS minification
5. Output to `dist/` folder

**Build output:**
- `index.html` - HTML entry
- `assets/*.js` - JavaScript bundles
- `assets/*.css` - Stylesheets
- `logo.svg`, `image.png` - Static assets

---

## 📝 Code Conventions

### File Naming
- Components: PascalCase (`AdminLayout.jsx`)
- Styles: kebab-case (`admin-layout.css`)
- Utils: camelCase (`supabase.js`)

### Component Structure
```javascript
// 1. Imports
import { useState } from 'react'
import { supabase } from '../lib/supabase'

// 2. Component definition
const MyComponent = () => {
  // 3. State & hooks
  const [data, setData] = useState([])

  // 4. Effects
  useEffect(() => {}, [])

  // 5. Handlers
  const handleClick = () => {}

  // 6. Render
  return (
    <div></div>
  )
}

// 7. Export
export default MyComponent
```

### CSS Conventions
```css
/* Component wrapper */
.my-component {
  /* Layout properties */
  display: flex;

  /* Spacing */
  padding: 1rem;

  /* Visual properties */
  background: var(--white);

  /* Typography */
  font-size: 1rem;
}

/* Child elements */
.my-component__title {}
.my-component__content {}

/* Modifiers */
.my-component--primary {}
.my-component--large {}
```

---

## 🔧 Extending the Project

### Adding a New Public Page

1. Create component in `src/pages/`
2. Create CSS in `src/styles/`
3. Add route in `src/App.jsx`
4. Update navigation in `src/components/Navbar.jsx`

### Adding a New Admin Feature

1. Create component in `src/pages/admin/`
2. Add route in protected routes section
3. Update sidebar in `src/components/AdminLayout.jsx`
4. Create necessary database tables/migrations
5. Set up RLS policies

### Adding New Settings

1. Add migration to insert new setting key
2. Update `AdminSettings.jsx` form
3. Update fetch/save logic
4. Use setting in relevant components

---

## 📊 Performance Considerations

### Optimization Strategies

1. **Code Splitting**
   - React.lazy() for route-based splitting
   - Dynamic imports for heavy components

2. **Image Optimization**
   - Store images in Supabase Storage
   - Use appropriate image sizes
   - Lazy loading for images

3. **Data Fetching**
   - Fetch only needed columns
   - Use pagination for large lists
   - Cache static data (categories)

4. **Bundle Size**
   - Tree shaking via Vite
   - Minimal dependencies
   - CSS purging in production

---

**Questions?** Refer to other documentation files for specific topics!
