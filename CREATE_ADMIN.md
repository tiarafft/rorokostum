# Cara Membuat Admin User

Untuk mengakses Admin Portal, Anda perlu membuat akun admin terlebih dahulu.

## Metode 1: Menggunakan Supabase Dashboard (Recommended)

1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Navigasi ke **Authentication** > **Users**
4. Klik tombol **Add user** (atau **Invite user**)
5. Masukkan email dan password
6. Klik **Create new user**

## Metode 2: Sign Up via Code

Buat file baru `create-admin.html` di root project:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Create Admin</title>
</head>
<body>
    <h1>Create Admin User</h1>
    <form id="signup-form">
        <input type="email" id="email" placeholder="Email" required><br><br>
        <input type="password" id="password" placeholder="Password" required><br><br>
        <button type="submit">Create Admin</button>
    </form>
    <div id="result"></div>

    <script type="module">
        import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

        const supabase = createClient(
            'https://wqwlbuheemrcqiajhxuv.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indxd2xidWhlZW1yY3FpYWpoeHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MTI4MDEsImV4cCI6MjA4MTQ4ODgwMX0.rE5NHmjZpdWwGD00aLOJbzM4-0RapbSvGbJDBKMnNrQ'
        )

        document.getElementById('signup-form').addEventListener('submit', async (e) => {
            e.preventDefault()
            const email = document.getElementById('email').value
            const password = document.getElementById('password').value

            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password
            })

            if (error) {
                document.getElementById('result').innerHTML = `<p style="color: red;">Error: ${error.message}</p>`
            } else {
                document.getElementById('result').innerHTML = `<p style="color: green;">Admin created successfully! Email: ${email}</p>`
                document.getElementById('signup-form').reset()
            }
        })
    </script>
</body>
</html>
```

Buka file `create-admin.html` di browser, isi email dan password, lalu submit.

## Login ke Admin Portal

Setelah admin user dibuat:
1. Akses website `/admin/login`
2. Login menggunakan email dan password yang sudah dibuat
3. Anda akan diarahkan ke Admin Dashboard

## Contoh Kredensial

- Email: admin@rorokostum.com
- Password: RoroKostum2024!

**PENTING**: Segera ganti password setelah login pertama kali!
