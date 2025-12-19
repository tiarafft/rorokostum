# Class Diagram - Roro Kostum System

## Diagram Arsitektur Sistem

```mermaid
classDiagram
    %% Database Schema
    class Kategori {
        +UUID id
        +String nama
        +Timestamp created_at
        +Timestamp updated_at
    }

    class Kostum {
        +UUID id
        +UUID kategori_id
        +String nama
        +String ukuran_tersedia
        +Numeric harga_sewa
        +String deskripsi
        +Number kuantitas
        +String status_ketersediaan
        +Timestamp created_at
        +Timestamp updated_at
    }

    class GambarKostum {
        +UUID id
        +UUID kostum_id
        +String path
        +Boolean is_primary
        +Timestamp created_at
    }

    class Orders {
        +UUID id
        +String nama_penyewa
        +String no_hp
        +String alamat
        +UUID kostum_id
        +Number kuantitas
        +Date tanggal_sewa
        +Date tanggal_kembali
        +Numeric total_harga
        +String status_pembayaran
        +String status_order
        +Timestamp created_at
        +Timestamp updated_at
    }

    class Settings {
        +UUID id
        +String key
        +String value
        +Timestamp updated_at
    }

    %% Database Relationships
    Kategori "1" --> "*" Kostum : has many
    Kostum "1" --> "*" GambarKostum : has many
    Kostum "1" --> "*" Orders : referenced by

    %% React Context
    class AuthContext {
        +User user
        +Boolean loading
        +signIn(email, password)
        +signUp(email, password)
        +signOut()
    }

    class SupabaseClient {
        +auth
        +from(table)
        +storage
    }

    %% Core Components
    class App {
        +render()
    }

    class Navbar {
        +render()
    }

    class Footer {
        +render()
    }

    class FloatingWhatsApp {
        -String whatsappNumber
        +render()
    }

    class ProtectedRoute {
        +checkAuth()
        +render()
    }

    class AdminLayout {
        +render()
    }

    %% Public Pages
    class Home {
        -Array featuredKostum
        +fetchFeaturedKostum()
        +render()
    }

    class Gallery {
        -Array kostumList
        -Array categories
        -String selectedCategory
        +fetchKategori()
        +fetchKostum()
        +filterByCategory()
        +render()
    }

    class DetailKostum {
        -Object kostum
        -Array images
        +fetchKostumDetail()
        +handleOrder()
        +render()
    }

    class TrackingOrder {
        -String orderId
        -Object orderData
        +trackOrder()
        +render()
    }

    class ProsedurSewa {
        -String prosedurContent
        +fetchProsedur()
        +render()
    }

    class CompanyProfile {
        -Object companyData
        +fetchCompanyData()
        +render()
    }

    %% Admin Pages
    class AdminLogin {
        +handleLogin()
        +render()
    }

    class AdminDashboard {
        -Object stats
        +fetchStatistics()
        +render()
    }

    class AdminKategori {
        -Array kategoriList
        +fetchKategori()
        +createKategori()
        +updateKategori()
        +deleteKategori()
        +render()
    }

    class AdminKostum {
        -Array kostumList
        -Array categories
        +fetchKostum()
        +createKostum()
        +updateKostum()
        +deleteKostum()
        +uploadImages()
        +render()
    }

    class AdminOrders {
        -Array ordersList
        +fetchOrders()
        +updateOrderStatus()
        +render()
    }

    class AdminSettings {
        -Object settings
        +fetchSettings()
        +updateSettings()
        +render()
    }

    %% Component Relationships
    App --> Navbar : uses
    App --> Footer : uses
    App --> FloatingWhatsApp : uses
    App --> Home : routes to
    App --> Gallery : routes to
    App --> DetailKostum : routes to
    App --> TrackingOrder : routes to
    App --> ProsedurSewa : routes to
    App --> CompanyProfile : routes to
    App --> AdminLogin : routes to
    App --> ProtectedRoute : uses

    ProtectedRoute --> AdminDashboard : protects
    ProtectedRoute --> AdminKategori : protects
    ProtectedRoute --> AdminKostum : protects
    ProtectedRoute --> AdminOrders : protects
    ProtectedRoute --> AdminSettings : protects
    ProtectedRoute --> AuthContext : uses

    AdminDashboard --> AdminLayout : uses
    AdminKategori --> AdminLayout : uses
    AdminKostum --> AdminLayout : uses
    AdminOrders --> AdminLayout : uses
    AdminSettings --> AdminLayout : uses

    %% Service Layer
    Home --> SupabaseClient : queries
    Gallery --> SupabaseClient : queries
    DetailKostum --> SupabaseClient : queries
    TrackingOrder --> SupabaseClient : queries
    ProsedurSewa --> SupabaseClient : queries
    CompanyProfile --> SupabaseClient : queries
    FloatingWhatsApp --> SupabaseClient : queries

    AdminLogin --> AuthContext : uses
    AdminKategori --> SupabaseClient : queries
    AdminKostum --> SupabaseClient : queries
    AdminOrders --> SupabaseClient : queries
    AdminSettings --> SupabaseClient : queries
    AdminDashboard --> SupabaseClient : queries

    AuthContext --> SupabaseClient : uses

    %% Data Flow
    SupabaseClient --> Kategori : CRUD
    SupabaseClient --> Kostum : CRUD
    SupabaseClient --> GambarKostum : CRUD
    SupabaseClient --> Orders : CRUD
    SupabaseClient --> Settings : CRUD
```

## Penjelasan Diagram

### 1. Database Layer (Top)
**Tabel-tabel database:**
- **Kategori**: Menyimpan kategori kostum (Adat, Karakter, Profesi, dll)
- **Kostum**: Menyimpan data kostum yang tersedia
- **GambarKostum**: Menyimpan gambar-gambar kostum
- **Orders**: Menyimpan data pesanan dari pelanggan
- **Settings**: Menyimpan konfigurasi aplikasi (WhatsApp, prosedur sewa, dll)

**Relasi:**
- Kategori memiliki banyak Kostum (1:N)
- Kostum memiliki banyak GambarKostum (1:N)
- Kostum direferensikan oleh banyak Orders (1:N)

### 2. Service Layer (Middle)
**SupabaseClient**: Client untuk berinteraksi dengan database Supabase
**AuthContext**: Context provider untuk manajemen autentikasi

### 3. Component Layer (Bottom)

#### Core Components
- **App**: Komponen utama aplikasi dengan routing
- **Navbar**: Navigation bar untuk semua halaman
- **Footer**: Footer untuk halaman publik
- **FloatingWhatsApp**: Tombol floating WhatsApp
- **ProtectedRoute**: HOC untuk proteksi route admin
- **AdminLayout**: Layout untuk halaman admin

#### Public Pages
- **Home**: Halaman utama dengan kostum unggulan
- **Gallery**: Galeri kostum dengan filter kategori
- **DetailKostum**: Detail kostum dan form order
- **TrackingOrder**: Tracking status pesanan
- **ProsedurSewa**: Halaman prosedur sewa
- **CompanyProfile**: Profil perusahaan dan lokasi

#### Admin Pages
- **AdminLogin**: Halaman login admin
- **AdminDashboard**: Dashboard statistik
- **AdminKategori**: CRUD kategori
- **AdminKostum**: CRUD kostum dan upload gambar
- **AdminOrders**: Manajemen pesanan
- **AdminSettings**: Pengaturan aplikasi

### 4. Data Flow
1. **User mengakses halaman** → Component melakukan query ke SupabaseClient
2. **SupabaseClient** → Melakukan operasi CRUD ke database
3. **Database** → Mengembalikan data sesuai dengan RLS policy
4. **Component** → Menampilkan data ke user

### 5. Authentication Flow
1. User login melalui **AdminLogin**
2. **AdminLogin** memanggil method di **AuthContext**
3. **AuthContext** berkomunikasi dengan **SupabaseClient.auth**
4. Session disimpan dan digunakan oleh **ProtectedRoute**
5. **ProtectedRoute** mengecek autentikasi sebelum mengizinkan akses ke halaman admin

## Teknologi yang Digunakan
- **Frontend**: React 18 + Vite
- **Routing**: React Router DOM v6
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (untuk gambar kostum)
- **Styling**: CSS Modules

## Security
- Row Level Security (RLS) diaktifkan pada semua tabel
- Public dapat membaca data kostum
- Hanya authenticated users yang dapat melakukan operasi write
- Protected routes untuk halaman admin
