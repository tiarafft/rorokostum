# Panduan Deployment Roro Kostum

Dokumentasi lengkap untuk deploy website Roro Kostum ke berbagai platform hosting.

## 📋 Daftar Isi
1. [Persiapan Deployment](#persiapan-deployment)
2. [Deploy ke Netlify](#deploy-ke-netlify)
3. [Deploy ke Vercel](#deploy-ke-vercel)
4. [Deploy ke GitHub Pages](#deploy-ke-github-pages)
5. [Deploy ke Cloudflare Pages](#deploy-ke-cloudflare-pages)
6. [Post-Deployment Checklist](#post-deployment-checklist)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Persiapan Deployment

### 1. Build Project Locally

Pastikan project bisa di-build tanpa error:

```bash
# Install dependencies
npm install

# Build project
npm run build

# Test build
npm run preview
```

Jika build berhasil, folder `dist/` akan berisi file-file production-ready.

### 2. Environment Variables yang Dibutuhkan

Siapkan values untuk environment variables berikut:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Cara mendapatkan:**
1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Buka **Settings** → **API**
4. Copy **Project URL** dan **anon public key**

### 3. Pastikan `.gitignore` Sudah Benar

File `.gitignore` harus include:

```gitignore
node_modules
dist
.env
.env.local
.env.production
```

**JANGAN** commit file `.env` ke repository!

---

## 🚀 Deploy ke Netlify

### Method 1: Netlify Dashboard (Recommended)

**Step 1: Prepare Repository**
1. Push code ke GitHub/GitLab/Bitbucket
2. Pastikan `.env` tidak ter-commit

**Step 2: Deploy via Netlify Dashboard**
1. Login ke [Netlify](https://app.netlify.com)
2. Klik **Add new site** → **Import an existing project**
3. Connect ke Git provider (GitHub/GitLab/Bitbucket)
4. Pilih repository `roro-kostum`
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Base directory**: (kosongkan)

**Step 3: Environment Variables**
1. Scroll ke **Environment variables**
2. Tambahkan:
   - Key: `VITE_SUPABASE_URL`, Value: `https://your-project.supabase.co`
   - Key: `VITE_SUPABASE_ANON_KEY`, Value: `your-anon-key`
3. Klik **Deploy site**

**Step 4: Custom Domain (Optional)**
1. Setelah deploy selesai, buka **Domain settings**
2. Klik **Add custom domain**
3. Masukkan domain Anda (contoh: `rorokostum.com`)
4. Follow instruksi untuk update DNS records

### Method 2: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist

# Atau init project untuk auto-deploy
netlify init
```

**Configure Environment Variables via CLI:**

```bash
netlify env:set VITE_SUPABASE_URL "https://your-project.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key"
```

---

## ⚡ Deploy ke Vercel

### Method 1: Vercel Dashboard

**Step 1: Import Project**
1. Login ke [Vercel](https://vercel.com)
2. Klik **Add New** → **Project**
3. Import Git repository
4. Pilih repository `roro-kostum`

**Step 2: Configure Project**
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

**Step 3: Environment Variables**
1. Expand **Environment Variables** section
2. Tambahkan:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Klik **Deploy**

**Step 4: Custom Domain**
1. Setelah deploy, buka **Settings** → **Domains**
2. Add custom domain
3. Update DNS records sesuai instruksi

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

---

## 📄 Deploy ke GitHub Pages

### Step 1: Install gh-pages

```bash
npm install --save-dev gh-pages
```

### Step 2: Update `vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/roro-kostum/', // Ganti dengan nama repository Anda
})
```

### Step 3: Update `package.json`

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

### Step 4: Deploy

```bash
npm run deploy
```

### Step 5: GitHub Settings

1. Buka repository di GitHub
2. **Settings** → **Pages**
3. Source: `gh-pages` branch
4. Save

### Step 6: Environment Variables

**⚠️ PERHATIAN**: GitHub Pages adalah static hosting, environment variables harus di-hardcode saat build!

**Opsi 1: GitHub Actions (Recommended)**

Buat file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        run: npm run build

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

Tambahkan secrets di **Settings** → **Secrets and variables** → **Actions**:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## ☁️ Deploy ke Cloudflare Pages

### Method 1: Dashboard

**Step 1: Create Project**
1. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Pilih **Pages**
3. Klik **Create a project**
4. Connect Git repository

**Step 2: Configure Build**
- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Build output directory**: `dist`

**Step 3: Environment Variables**
Add production variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Step 4: Deploy**
Klik **Save and Deploy**

### Method 2: Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Deploy
wrangler pages publish dist --project-name=roro-kostum
```

---

## ✅ Post-Deployment Checklist

Setelah deploy selesai, test hal-hal berikut:

### Functional Testing
- [ ] Homepage load dengan benar
- [ ] Gallery menampilkan kostum
- [ ] Filter kategori berfungsi
- [ ] Detail kostum bisa dibuka
- [ ] Tombol WhatsApp berfungsi
- [ ] Tracking order bisa diakses
- [ ] Company profile menampilkan info & maps
- [ ] Footer social media links berfungsi
- [ ] Admin login berfungsi
- [ ] Admin dashboard load dengan benar
- [ ] CRUD kategori berfungsi
- [ ] CRUD kostum + upload gambar berfungsi
- [ ] Management orders berfungsi
- [ ] Settings bisa diupdate

### Performance Testing
- [ ] Page load < 3 detik
- [ ] Images load dengan cepat
- [ ] Lighthouse score > 90

### Security Testing
- [ ] Environment variables tidak ter-expose
- [ ] Admin routes protected dengan authentication
- [ ] RLS policies berfungsi dengan benar
- [ ] Storage access rules berfungsi

### Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### Responsive Design
- [ ] Mobile (< 640px)
- [ ] Tablet (640px - 1024px)
- [ ] Desktop (> 1024px)

---

## 🐛 Troubleshooting

### Problem: "Failed to fetch" atau CORS errors

**Possible causes:**
1. Supabase URL salah
2. CORS tidak dikonfigurasi di Supabase

**Solution:**
1. Verify environment variables
2. Check Supabase URL format (harus `https://xxxxx.supabase.co`)
3. Di Supabase Dashboard → **Settings** → **API**, pastikan URL benar

### Problem: Images tidak tampil

**Possible causes:**
1. Storage bucket tidak public
2. RLS policies salah

**Solution:**
1. Buka **Storage** → `kostum-images`
2. Pastikan **Public bucket** enabled
3. Check policies:
   ```sql
   -- Allow public to read
   CREATE POLICY "Public read access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'kostum-images');
   ```

### Problem: Admin tidak bisa login

**Possible causes:**
1. User belum dibuat
2. Email confirmation enabled
3. Password salah

**Solution:**
1. Verify user exists di **Authentication** → **Users**
2. Disable email confirmation: **Authentication** → **Providers** → **Email** → Uncheck "Enable email confirmations"
3. Reset password via Supabase dashboard

### Problem: Build gagal

**Possible causes:**
1. Dependencies issue
2. Node version mismatch

**Solution:**
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Try with specific Node version
nvm use 18
npm run build
```

### Problem: 404 on refresh (SPA routing issue)

**Solution:**

**For Netlify:**
Buat file `public/_redirects`:
```
/*    /index.html   200
```

**For Vercel:**
Buat file `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**For Apache (.htaccess):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Problem: Environment variables tidak terdeteksi

**Cause:** Vite requires `VITE_` prefix for env vars

**Solution:**
Make sure all env vars start with `VITE_`:
- ✅ `VITE_SUPABASE_URL`
- ❌ `SUPABASE_URL`

### Problem: Deployment successful tapi site kosong/blank

**Possible causes:**
1. Base path salah di vite.config.js
2. Build directory salah

**Solution:**
1. Check `vite.config.js` → `base` should be `/` for most hosting
2. Verify build output directory is `dist`
3. Check browser console untuk errors

---

## 📊 Monitoring & Analytics

### Rekomendasi Tools:

1. **Performance Monitoring**
   - Google Analytics
   - Plausible Analytics
   - Fathom Analytics

2. **Error Tracking**
   - Sentry
   - LogRocket
   - Bugsnag

3. **Uptime Monitoring**
   - UptimeRobot
   - Pingdom
   - StatusCake

4. **Supabase Monitoring**
   - Built-in Analytics di Supabase Dashboard
   - Database usage
   - Storage usage
   - API requests

---

## 🔄 Update Website

### For Netlify/Vercel (Auto-deploy)
1. Push changes ke Git repository
2. Platform akan auto-detect dan trigger build
3. Wait for deployment to complete

### Manual Update
```bash
# Pull latest changes
git pull

# Install new dependencies (if any)
npm install

# Build
npm run build

# Deploy sesuai platform
# Netlify CLI:
netlify deploy --prod --dir=dist

# Vercel CLI:
vercel --prod
```

---

## 💡 Best Practices

1. **Always test locally before deploying**
   ```bash
   npm run build
   npm run preview
   ```

2. **Use separate Supabase projects for dev/staging/production**

3. **Enable branch deployments** untuk preview changes sebelum merge ke main

4. **Setup custom domain dengan SSL** untuk profesionalisme

5. **Configure CDN** untuk faster image loading

6. **Enable compression** di hosting platform

7. **Setup automated backups** untuk Supabase database

8. **Monitor usage** dan set up alerts untuk quotas

9. **Use semantic versioning** untuk releases

10. **Document all configuration changes**

---

## 📝 Deployment Checklist Template

```markdown
## Pre-Deployment
- [ ] Code reviewed dan tested
- [ ] All features working di localhost
- [ ] Build berhasil tanpa errors
- [ ] Environment variables prepared
- [ ] Database migrations completed
- [ ] Admin user created

## Deployment
- [ ] Platform chosen
- [ ] Repository connected
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active

## Post-Deployment
- [ ] All pages accessible
- [ ] All features working
- [ ] Images loading
- [ ] Admin panel accessible
- [ ] Performance acceptable
- [ ] Mobile responsive
- [ ] Browser compatibility verified

## Documentation
- [ ] Deployment documented
- [ ] Credentials saved securely
- [ ] Team notified
- [ ] Monitoring setup
```

---

**Selamat! Website Roro Kostum Anda sudah live! 🎉**

Untuk pertanyaan lebih lanjut, refer ke:
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Setup lengkap
- [README.md](./README.md) - Overview project
- [CREATE_ADMIN.md](./CREATE_ADMIN.md) - Cara buat admin user
