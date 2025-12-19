# Arsitektur Sistem - Roro Kostum

## Diagram Arsitektur Keseluruhan

```mermaid
graph TB
    subgraph "User Interface Layer"
        A[User Browser] --> B[React Application]
    end

    subgraph "React Application"
        B --> C[Public Routes]
        B --> D[Admin Routes]
        B --> E[Components]
        B --> F[Context Providers]
    end

    subgraph "Public Routes"
        C --> G[Home]
        C --> H[Gallery]
        C --> I[Detail Kostum]
        C --> J[Tracking Order]
        C --> K[Prosedur Sewa]
        C --> L[Company Profile]
    end

    subgraph "Admin Routes"
        D --> M[Admin Login]
        D --> N[Admin Dashboard]
        D --> O[Admin Kategori]
        D --> P[Admin Kostum]
        D --> Q[Admin Orders]
        D --> R[Admin Settings]
    end

    subgraph "Components"
        E --> S[Navbar]
        E --> T[Footer]
        E --> U[FloatingWhatsApp]
        E --> V[ProtectedRoute]
        E --> W[AdminLayout]
    end

    subgraph "Context Providers"
        F --> X[AuthContext]
    end

    subgraph "Service Layer"
        Y[Supabase Client]
        X --> Y
        C --> Y
        D --> Y
    end

    subgraph "Supabase Backend"
        Y --> Z[Authentication]
        Y --> AA[Database]
        Y --> AB[Storage]
    end

    subgraph "Database Tables"
        AA --> AC[(kategori)]
        AA --> AD[(kostum)]
        AA --> AE[(gambar_kostum)]
        AA --> AF[(orders)]
        AA --> AG[(settings)]
    end

    subgraph "Storage Buckets"
        AB --> AH[kostum-images]
    end

    style A fill:#e1f5ff
    style B fill:#fff3e0
    style Y fill:#f3e5f5
    style AA fill:#e8f5e9
    style AB fill:#fff9c4
    style Z fill:#ffebee
```

## Diagram Flow Data

```mermaid
sequenceDiagram
    participant User
    participant React App
    participant AuthContext
    participant SupabaseClient
    participant Database
    participant Storage

    Note over User,Storage: Public User Flow - Melihat Kostum
    User->>React App: Buka Gallery
    React App->>SupabaseClient: Fetch kostum & kategori
    SupabaseClient->>Database: Query tables (RLS: public read)
    Database-->>SupabaseClient: Return data
    SupabaseClient->>Storage: Get image URLs
    Storage-->>SupabaseClient: Return URLs
    SupabaseClient-->>React App: Data + Image URLs
    React App-->>User: Display gallery

    Note over User,Storage: Public User Flow - Order Kostum
    User->>React App: Submit order form
    React App->>SupabaseClient: Insert to orders table
    SupabaseClient->>Database: Create order (RLS: public write to orders)
    Database-->>SupabaseClient: Order created
    SupabaseClient-->>React App: Success
    React App-->>User: Show order ID for tracking

    Note over User,Storage: Admin Flow - Login
    User->>React App: Login form (email + password)
    React App->>AuthContext: signIn()
    AuthContext->>SupabaseClient: auth.signInWithPassword()
    SupabaseClient->>Database: Validate credentials
    Database-->>SupabaseClient: Return session
    SupabaseClient-->>AuthContext: Session token
    AuthContext-->>React App: User authenticated
    React App-->>User: Redirect to dashboard

    Note over User,Storage: Admin Flow - Upload Kostum
    User->>React App: Submit kostum form + images
    React App->>SupabaseClient: Check auth session
    SupabaseClient-->>React App: Authenticated
    React App->>SupabaseClient: Upload images to storage
    SupabaseClient->>Storage: Store images
    Storage-->>SupabaseClient: Return paths
    React App->>SupabaseClient: Insert kostum + image records
    SupabaseClient->>Database: Insert (RLS: auth required)
    Database-->>SupabaseClient: Success
    SupabaseClient-->>React App: Kostum created
    React App-->>User: Show success message
```

## Diagram Entity Relationship (ERD)

```mermaid
erDiagram
    KATEGORI ||--o{ KOSTUM : "has many"
    KOSTUM ||--o{ GAMBAR_KOSTUM : "has many"
    KOSTUM ||--o{ ORDERS : "referenced by"

    KATEGORI {
        uuid id PK
        text nama
        timestamptz created_at
        timestamptz updated_at
    }

    KOSTUM {
        uuid id PK
        uuid kategori_id FK
        text nama
        text ukuran_tersedia
        numeric harga_sewa
        text deskripsi
        number kuantitas
        text status_ketersediaan
        timestamptz created_at
        timestamptz updated_at
    }

    GAMBAR_KOSTUM {
        uuid id PK
        uuid kostum_id FK
        text path
        boolean is_primary
        timestamptz created_at
    }

    ORDERS {
        uuid id PK
        text nama_penyewa
        text no_hp
        text alamat
        uuid kostum_id FK
        number kuantitas
        date tanggal_sewa
        date tanggal_kembali
        numeric total_harga
        text status_pembayaran
        text status_order
        timestamptz created_at
        timestamptz updated_at
    }

    SETTINGS {
        uuid id PK
        text key UK
        text value
        timestamptz updated_at
    }
```

## Diagram Component Hierarchy

```mermaid
graph TD
    A[App.jsx] --> B[Router]
    B --> C[Navbar]
    B --> D[Routes]
    B --> E[FloatingWhatsApp]
    B --> F[Footer - conditional]

    D --> G[Public Routes]
    D --> H[Protected Routes]

    G --> I[Home]
    G --> J[Gallery]
    G --> K[DetailKostum]
    G --> L[TrackingOrder]
    G --> M[ProsedurSewa]
    G --> N[CompanyProfile]

    H --> O[ProtectedRoute Wrapper]
    O --> P[AdminDashboard]
    O --> Q[AdminKategori]
    O --> R[AdminKostum]
    O --> S[AdminOrders]
    O --> T[AdminSettings]

    P --> U[AdminLayout]
    Q --> U
    R --> U
    S --> U
    T --> U

    style A fill:#ff6b6b
    style B fill:#4ecdc4
    style C fill:#ffe66d
    style D fill:#95e1d3
    style E fill:#f38181
    style F fill:#aa96da
    style G fill:#c7f9cc
    style H fill:#ffd3b6
    style O fill:#ffaaa5
    style U fill:#a8e6cf
```

## Penjelasan Lapisan Arsitektur

### 1. User Interface Layer
- **User Browser**: Interface yang diakses oleh end user
- **React Application**: Single Page Application (SPA) yang dibangun dengan React + Vite

### 2. Application Layer
Terdiri dari 4 bagian utama:

#### a. Public Routes
Halaman yang dapat diakses tanpa autentikasi:
- Home: Menampilkan kostum unggulan
- Gallery: Katalog kostum dengan filter
- Detail Kostum: Detail + form order
- Tracking Order: Cek status pesanan
- Prosedur Sewa: Info syarat & ketentuan
- Company Profile: Info perusahaan & lokasi

#### b. Admin Routes
Halaman yang memerlukan autentikasi:
- Admin Login: Form login
- Admin Dashboard: Statistik & overview
- Admin Kategori: Manajemen kategori
- Admin Kostum: Manajemen kostum
- Admin Orders: Manajemen pesanan
- Admin Settings: Pengaturan aplikasi

#### c. Components
Komponen reusable:
- Navbar: Navigation bar
- Footer: Footer info
- FloatingWhatsApp: Tombol chat WhatsApp
- ProtectedRoute: HOC untuk proteksi route
- AdminLayout: Layout sidebar admin

#### d. Context Providers
- AuthContext: State management autentikasi

### 3. Service Layer
**Supabase Client**: Single instance untuk semua operasi backend
- Authentication
- Database queries
- Storage operations
- Real-time subscriptions

### 4. Backend Layer (Supabase)

#### a. Authentication
- Email/Password authentication
- Session management
- JWT tokens

#### b. Database (PostgreSQL)
5 tabel utama dengan Row Level Security:
- kategori: Master kategori kostum
- kostum: Data kostum
- gambar_kostum: Gambar kostum
- orders: Data pesanan
- settings: Konfigurasi aplikasi

#### c. Storage
- kostum-images: Bucket untuk menyimpan gambar kostum

## Security Features

### Row Level Security (RLS)
Semua tabel menggunakan RLS dengan policy:

**Public Access:**
- SELECT: kategori, kostum, gambar_kostum, settings
- INSERT: orders (untuk membuat pesanan)

**Authenticated Access:**
- INSERT/UPDATE/DELETE: kategori, kostum, gambar_kostum, settings, orders

### Authentication
- Supabase Auth dengan email/password
- JWT token untuk session
- Protected routes untuk halaman admin
- Auto redirect jika tidak authenticated

## Technology Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 6
- **Routing**: React Router DOM v6
- **Styling**: CSS Modules
- **State Management**: React Context API

### Backend (Supabase)
- **Database**: PostgreSQL with RLS
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **API**: Auto-generated REST API

### Deployment
- **Frontend**: Static hosting (Netlify/Vercel)
- **Backend**: Supabase Cloud

## Data Flow Patterns

### 1. Read Operations (Public)
```
User → React Component → Supabase Client → Database (RLS Check) → Return Data → Display
```

### 2. Write Operations (Public - Orders only)
```
User → Form → Validation → Supabase Client → Database (RLS Check) → Insert → Return ID
```

### 3. Admin Operations
```
User → Login → AuthContext → Session Token → Protected Route → Admin Page →
Supabase Client (with token) → Database (RLS Check with auth) → CRUD Operation → Success
```

### 4. Image Upload
```
Admin → Upload Form → Validate → Supabase Storage → Get URL →
Insert to gambar_kostum table → Link to kostum → Success
```

## Key Features

### Public Features
1. Browse kostum by category
2. View kostum details with images
3. Submit rental orders
4. Track order status
5. View rental procedures
6. Contact via WhatsApp
7. View company info & location

### Admin Features
1. Dashboard with statistics
2. CRUD categories
3. CRUD kostum with image upload
4. Manage orders & update status
5. Configure app settings
6. Update company info
7. Manage social media links

## Performance Considerations

1. **Image Optimization**: Images stored in Supabase Storage with CDN
2. **Lazy Loading**: Images loaded on demand
3. **Indexes**: Database indexes on foreign keys and frequently queried fields
4. **RLS Optimization**: Efficient policies to minimize query overhead
5. **Component Code Splitting**: React Router code splitting for route-based chunks
