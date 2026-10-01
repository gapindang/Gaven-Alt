# PRD — GAVEN

> **A private archive of things I never said.**

## 1. Product Overview

**GAVEN** adalah private personal literary archive berbasis web untuk menyimpan puisi, diary, surat yang tidak pernah dikirim, dan catatan pribadi.

Nama **GAVEN** merupakan plesetan dari nama **Gavin**, sekaligus memiliki nuansa kata *haven* — sebuah tempat berlindung atau ruang aman. Produk dirancang sebagai **digital sanctuary** milik satu orang.

GAVEN bukan social media, blog publik, atau aplikasi note-taking biasa. Pengalaman utama harus terasa seperti membuka sebuah buku pribadi yang hidup secara digital.

### Core Philosophy

> **Write it. Keep it. Forget it. Find it again.**

---

## 2. Product Goals

1. Menyediakan ruang privat untuk menulis.
2. Menyimpan tulisan secara aman dan hanya dapat diakses oleh pemilik.
3. Membuat pengalaman membaca kembali tulisan terasa personal dan emosional.
4. Mengorganisasi tulisan berdasarkan waktu, tipe, mood, dan tag.
5. Menghadirkan kembali tulisan lama melalui fitur **On This Day**.
6. Membangun visual identity yang kuat, minimal, cinematic, dan literary.
7. Menggunakan arsitektur modern berbasis **Next.js + Supabase + Vercel**.

---

## 3. Non-Goals

GAVEN tidak ditujukan sebagai:

- social media;
- blogging platform publik;
- collaborative writing platform;
- productivity dashboard;
- task manager;
- public portfolio;
- platform dengan followers, likes, comments, atau sharing.

Semua tulisan secara default **private**.

---

## 4. Target User

### Primary User

Satu orang pemilik GAVEN.

MVP tidak membutuhkan sistem multi-user.

Pemilik dapat:

- login;
- membuat tulisan;
- membaca tulisan;
- mengedit tulisan;
- menghapus tulisan;
- mencari tulisan;
- memfilter tulisan;
- melihat timeline;
- melihat tulisan pada tanggal yang sama di tahun sebelumnya.

---

## 5. Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| File Storage | Supabase Storage |
| Database Security | Supabase Row Level Security |
| Hosting | Vercel |
| Version Control | Git / GitHub |
| Optional AI | AI API / local model |
| Package Manager | npm |

### Architecture

```text
                        USER
                          |
                          v
                    VERCEL
                          |
                          v
                    NEXT.JS APP
                    /          \
                   /            \
                  v              v
             SUPABASE AUTH   SUPABASE DB
                                |
                                v
                         ROW LEVEL SECURITY
                                |
                                v
                         SUPABASE STORAGE
```

---

## 6. Opening Experience

Ketika website pertama kali dibuka, pengguna **tidak langsung melihat dashboard atau login form**.

Website dimulai dengan sebuah cinematic opening yang menampilkan text utama.

Opening harus terasa seperti **membuka halaman pertama sebuah buku**.

### Visual Direction

- full-screen;
- dark background;
- typography besar;
- minimal;
- banyak whitespace;
- subtle animation;
- tidak menggunakan navbar;
- tidak menggunakan card dashboard;
- tidak menggunakan hero section SaaS;
- tidak menggunakan gradient berlebihan.

### Opening Copy

Versi utama:

```text
GAVEN

a place for the things
I chose to keep.
```

Kemudian secara perlahan muncul:

```text
ENTER
```

dan teks kecil:

```text
private archive
```

Alternatif copy:

```text
GAVEN

for words that were
never meant to disappear.
```

atau:

```text
GAVEN

some things are easier
to write than to say.
```

Copy final dapat dipilih saat implementasi berdasarkan visual.

---

## 7. Opening Animation

Urutan animasi:

```text
PAGE LOAD
    |
    v
Dark screen
    |
    v
"GAVEN" fades in
    |
    v
Tagline appears
    |
    v
"ENTER" appears
    |
    v
User clicks ENTER
    |
    v
Transition to Private Vault
```

Animasi harus:

- subtle;
- slow;
- elegant;
- tidak mengganggu;
- mendukung `prefers-reduced-motion`.

Tidak menggunakan:

- bouncing;
- excessive particles;
- flashy transitions;
- loading animation yang panjang.

---

## 8. Private Vault

Setelah pengguna memilih **ENTER**, tampilkan authentication gate.

```text
GAVEN

PRIVATE VAULT

┌──────────────────────────┐
│ Password                 │
└──────────────────────────┘

           OPEN

This place belongs to you.
```

### Authentication

Gunakan Supabase Auth.

MVP dapat menggunakan:

- email/password;
- secure session;
- protected routes;
- logout.

Tidak ada public registration yang terbuka untuk umum.

Jika hanya satu owner, pendaftaran akun dapat dilakukan secara manual melalui Supabase.

---

## 9. Home / Vault

Setelah login, pengguna masuk ke halaman utama.

Contoh struktur:

```text
GAVEN

Good evening.

127 things
you chose to keep.


ON THIS DAY
────────────────────────

September 30, 2025

"I wonder if I'll still remember
this one year from now."

READ →


RECENTLY WRITTEN
────────────────────────

28.09.2026
Maybe tomorrow...

24.09.2026
The distance...

21.09.2026
Unsent letter


                 + WRITE
```

Home tidak boleh terasa seperti admin dashboard.

---

## 10. Core Content Types

GAVEN memiliki tiga tipe tulisan utama.

```text
DIARY
POEM
UNSENT
```

### Diary

Untuk jurnal harian dan pemikiran.

### Poem

Untuk puisi.

### Unsent

Untuk surat atau pesan yang tidak pernah dikirim.

Contoh:

```text
TO SOMEONE

I wanted to tell you...

But I never did.
```

---

## 11. Writing Experience

### 11.1 Create Entry

Ketika memilih `WRITE`:

```text
What are you writing?

[ DIARY ]

[ POEM ]

[ UNSENT ]
```

Setelah memilih tipe, buka editor yang sesuai.

### 11.2 Diary Editor

Fields:

- title;
- content;
- date;
- mood;
- tags;
- optional image;
- optional attachment.

UI harus sangat bersih.

Tidak membuat toolbar seperti Microsoft Word secara default.

### 11.3 Poem Editor

Puisi membutuhkan perhatian khusus terhadap:

- line breaks;
- whitespace;
- typography;
- alignment;
- reading width.

Editor harus menjaga struktur puisi ketika disimpan.

### 11.4 Unsent Editor

Fields:

- recipient label;
- title;
- content;
- date;
- mood;
- tags.

Recipient hanya berupa teks dan bukan user lain.

---

## 12. Autosave

Editor harus melakukan autosave.

State:

```text
Saving...
```

kemudian:

```text
Saved
```

Jika koneksi terputus:

```text
Saved locally
```

Tujuan utama:

> pengguna tidak kehilangan tulisan karena refresh, tab tertutup, atau koneksi sementara terputus.

---

## 13. Reading Experience

Saat membuka tulisan, aplikasi masuk ke **Reading Mode**.

Contoh:

```text
28 SEPTEMBER 2026


Maybe tomorrow


I don't know why
I keep remembering
something that already happened.

Maybe some things
don't really leave.


— Gavin
```

Reading Mode harus:

- memiliki whitespace besar;
- fokus pada tulisan;
- minim navigasi;
- menggunakan typography editorial;
- nyaman dibaca di mobile;
- tidak terlihat seperti halaman database.

---

## 14. Archive

Archive menyimpan semua tulisan dalam bentuk editorial timeline/list.

Contoh:

```text
ARCHIVE

2026

SEPTEMBER

28
Maybe tomorrow...

24
The distance...

21
Unsent letter #04


AUGUST

31
The sky looked different...
```

Filter:

- All;
- Diary;
- Poems;
- Unsent;
- Year;
- Mood;
- Tags.

---

## 15. Timeline

Timeline memvisualisasikan perjalanan tulisan.

```text
2024 ─────────●
             17 entries

2025 ─────●────────●
          23       41 entries

2026 ───────────────────●
                       63 entries
```

Timeline bukan statistik produktivitas.

Tujuannya adalah:

> melihat perjalanan hidup melalui tulisan.

---

## 16. On This Day

Sistem mencari entry yang dibuat pada tanggal yang sama di tahun sebelumnya.

Contoh:

```text
ON THIS DAY

September 30, 2025

"I wonder if I'll still remember
this one year from now."

READ →
```

Jika tidak ada entry:

```text
Nothing was written on this day.

Maybe today will become
something worth remembering.
```

---

## 17. Search

Search harus mencari:

- title;
- content;
- tags;
- mood;
- entry type.

Contoh:

```text
Search your memories...

> rain
```

---

## 18. Command Palette

Shortcut:

```text
Ctrl + K
```

atau:

```text
Cmd + K
```

Menu:

```text
Search your memories...

Write diary
Write poem
Write unsent letter

Go to archive
Go to timeline
On this day

Settings
Lock vault
```

---

## 19. Mood

Mood bersifat opsional.

Default options:

- Peaceful
- Happy
- Nostalgic
- Lonely
- Angry
- Confused
- Grateful
- Empty
- Hopeful

Mood hanya metadata.

GAVEN tidak melakukan diagnosis atau interpretasi kondisi psikologis pengguna.

---

## 20. Tags

User dapat membuat custom tags.

Contoh:

```text
#nostalgia
#family
#school
#night
#rain
#memory
#future
```

Tag dapat digunakan untuk:

- filtering;
- search;
- archive organization.

---

## 21. Attachments

MVP:

- image;
- optional audio;
- optional file.

Semua attachment harus private.

Gunakan Supabase Storage dengan access control yang sesuai.

---

## 22. Database Design

### profiles

Supabase Auth menangani authentication.

```text
profiles
├── id
├── created_at
└── display_name
```

### entries

```text
entries
├── id
├── user_id
├── type
├── title
├── content
├── mood
├── created_at
├── updated_at
└── archived
```

`type`:

```text
diary
poem
unsent
```

### tags

```text
tags
├── id
├── user_id
└── name
```

### entry_tags

```text
entry_tags
├── entry_id
└── tag_id
```

### attachments

```text
attachments
├── id
├── entry_id
├── storage_path
├── file_name
├── file_type
├── file_size
└── created_at
```

---

## 23. Supabase Row Level Security

Security merupakan requirement utama.

Setiap entry harus memiliki:

```text
user_id
```

RLS harus memastikan user hanya dapat:

- SELECT entry miliknya;
- INSERT entry dengan user_id miliknya;
- UPDATE entry miliknya;
- DELETE entry miliknya.

Concept:

```text
Authenticated User
        |
        v
entries
        |
        v
user_id = auth.uid()
```

Tidak boleh ada policy yang memungkinkan user membaca entry milik user lain.

Attachment juga harus mengikuti ownership entry.

---

## 24. Privacy Requirements

### Default Private

Semua content private.

### No Public URLs

URL entry tidak boleh memberikan akses tanpa authentication.

### No Public API

Tidak menyediakan endpoint publik untuk mengambil diary.

### Secure Sessions

Authentication menggunakan Supabase Auth.

### Minimal Data Collection

GAVEN hanya menyimpan data yang diperlukan untuk fungsi aplikasi.

---

## 25. Visual Design System

### Design Keywords

```text
Literary
Cinematic
Intimate
Quiet
Dark
Editorial
Elegant
Minimal
Nostalgic
Personal
```

### Avoid

```text
Generic SaaS
Corporate dashboard
Excessive glassmorphism
Excessive gradients
Neon UI
Over-rounded cards
Dense tables
Generic AI dashboard
```

---

## 26. Typography

### Display

Serif editorial.

Referensi:

- Cormorant Garamond;
- DM Serif Display;
- Playfair Display.

### UI

Sans-serif modern.

Referensi:

- Inter;
- Manrope;
- IBM Plex Sans.

Typography final dapat ditentukan melalui design exploration.

---

## 27. Color Direction

Dark-first.

Suggested palette:

```text
Background
#0D0D0D

Surface
#151515

Primary Text
#F2F0EA

Secondary Text
#9A9892

Muted
#5F5D59

Accent
#C8A96B
```

Accent digunakan secara terbatas.

---

## 28. Motion

Motion harus terasa seperti halaman buku yang bergerak perlahan.

Gunakan:

- fade;
- subtle reveal;
- opacity transition;
- page transition;
- gentle hover;
- text reveal.

Support:

```css
prefers-reduced-motion
```

---

## 29. Responsive Design

Support:

- desktop;
- tablet;
- mobile.

Reading mode harus menjadi prioritas utama pada mobile.

Tidak boleh ada horizontal overflow.

---

## 30. Accessibility

Requirements:

- semantic HTML;
- keyboard navigation;
- visible focus state;
- adequate color contrast;
- readable font size;
- reduced motion;
- screen reader support;
- tidak menggunakan warna sebagai satu-satunya indikator.

---

## 31. Optional AI Archivist

AI bukan fitur utama MVP.

Jika ditambahkan, AI berfungsi sebagai **archivist**, bukan penulis.

AI dapat membantu:

- suggested tags;
- semantic search;
- related memories;
- automatic categorization.

AI tidak boleh secara otomatis:

- mengubah tulisan;
- mempublikasikan tulisan;
- menghapus tulisan;
- membagikan tulisan.

User tetap memiliki kontrol penuh.

---

## 32. Pages

```text
/
├── Opening
│
├── /login
│
├── /vault
│   ├── /home
│   ├── /write
│   ├── /archive
│   ├── /timeline
│   ├── /on-this-day
│   ├── /search
│   ├── /entry/[id]
│   └── /settings
│
└── /auth
```

Semua halaman `/vault/*` harus protected.

---

## 33. MVP

- [ ] Opening screen
- [ ] Authentication
- [ ] Protected routes
- [ ] Supabase database
- [ ] RLS
- [ ] Create diary
- [ ] Create poem
- [ ] Create unsent
- [ ] Edit entry
- [ ] Delete entry
- [ ] Autosave
- [ ] Archive
- [ ] Search
- [ ] Reading mode
- [ ] Timeline
- [ ] On This Day
- [ ] Tags
- [ ] Mood
- [ ] Responsive design
- [ ] Vercel deployment

---

## 34. Phase 2

- [ ] Image attachment
- [ ] Audio attachment
- [ ] Markdown export
- [ ] JSON export
- [ ] Full backup
- [ ] Advanced search
- [ ] Command palette
- [ ] Semantic search
- [ ] AI Archivist

---

## 35. Phase 3 — Memory Graph

Hubungkan tulisan yang memiliki hubungan.

```text
"The rain tonight"
        |
        +-------- "The rain last year"
        |
        +-------- "Someone I remembered"
        |
        +-------- "October 2024"
```

Tujuannya membuat arsip terasa seperti **peta memori**.

---

## 36. Empty States

Jangan menggunakan:

```text
No data found.
```

Gunakan copy yang tetap memiliki identitas GAVEN.

```text
YOUR ARCHIVE IS EMPTY.

Maybe that's okay.

Some things haven't
been written yet.
```

Poems:

```text
NO POEMS YET.

The first line is
always the hardest.
```

---

## 37. Error States

```text
Something went wrong.

Your writing hasn't been lost.
Please try again.
```

Offline:

```text
YOU'RE OFFLINE.

Your writing is safely stored
on this device for now.
```

---

## 38. Development Phases

```text
PHASE 1
Project Setup
    ↓
Next.js
TypeScript
Tailwind
Supabase
    ↓
PHASE 2
Authentication
    ↓
PHASE 3
Database + RLS
    ↓
PHASE 4
Writing Editor
    ↓
PHASE 5
Archive
    ↓
PHASE 6
Reading Experience
    ↓
PHASE 7
Timeline
    ↓
PHASE 8
On This Day
    ↓
PHASE 9
Search + Command Palette
    ↓
PHASE 10
Visual Polish
    ↓
PHASE 11
Vercel Deployment
    ↓
PHASE 12
Optional AI Archivist
```

---

## 39. Deployment

### GitHub

Repository:

```text
gaven
```

### Vercel

Connect GitHub repository to Vercel.

Environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Server-side secrets must never be exposed to the client.

---

## 40. Security Checklist

Before production:

- [ ] Supabase RLS enabled
- [ ] RLS policies tested
- [ ] Protected routes tested
- [ ] Auth session tested
- [ ] Storage policies tested
- [ ] No service-role key exposed client-side
- [ ] Environment variables configured in Vercel
- [ ] No diary content included in public metadata
- [ ] No public entry endpoint
- [ ] Logout tested
- [ ] Unauthorized access tested
- [ ] Database backup configured

---

## 41. Brand Identity

### Name

**GAVEN**

Plesetan dari:

**Gavin + Haven**

Interpretasi:

> **GAVEN = Gavin's private haven.**

### Tagline

> **A private archive of things I never said.**

### Brand Personality

```text
Quiet
Personal
Intimate
Thoughtful
Literary
Mysterious
Warm
Minimal
```

---

## 42. Final Product Definition

> **GAVEN is a private digital sanctuary for writing, preserving, and rediscovering the words one person chose to keep.**

GAVEN tidak mencoba menjadi tempat untuk berbagi cerita kepada dunia.

GAVEN adalah tempat untuk menyimpan cerita yang mungkin hanya ingin dimiliki oleh satu orang.

---

## 43. Final UX Statement

```text
Write it.

Keep it.

Forget it.

Find it again.
```
