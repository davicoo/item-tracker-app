# Item Tracker App

A single-page application built with Vue 3 and TypeScript for tracking items with images and sales status.

## Features

- Add items with images, names, prices, locations, and detailed descriptions
- Specify a quantity and optional SKU codes for each item
- Set a custom shop fee percentage for each item (defaults to 20%)
- Track item sales status (Not Sold / Sold / Paid)
- Simple per-user statistics for Sold and Paid counts stored in Supabase, updated automatically when items change
- Paid totals subtract the shop fee percentage from each sale (default 20%, editable per item)
- Bar chart showing how many items were sold in the last 30 days, 6 months, and year
- Record when each item was added and display this date
- View all items in a responsive grid layout
- Optional table layout with smaller thumbnails similar to a spreadsheet
- Click an item's image to open a full-screen viewer with a close button
- Persistent data storage using localStorage
- Export items as a PDF file
- Fully responsive design

- Outstanding totals show the value of sold but unpaid items and can toggle with the Paid Total display

- Duplicate listings with a single click
- Export PDF button shows a spinner while the file is being generated
- Animation overlay that displays for a few seconds on initial load before revealing the main application
- Built-in login and sign up using Supabase Auth

## Project Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/item-tracker-app.git
cd item-tracker-app

# Install dependencies
npm install

# This installs jsPDF required for PDF exports

# Optionally lint the project
npm run lint

# Start development server
npm run dev

# Build for production
# Make sure you've run `npm install` first so PostCSS and other dependencies are available.
npm run build
```

## Environment Variables
Copy `.env.example` to `.env` (which is ignored by Git) and set the following variables:

```
VITE_SUPABASE_URL=<your project url>
VITE_SUPABASE_KEY=<your anon key>
VITE_HCAPTCHA_SITEKEY=<your hCaptcha site key>
```

Add your **hCaptcha secret key** in the Supabase Dashboard under **Settings → Authentication → Bot and Abuse Protection** when enabling CAPTCHA protection.

## Project Structure

```
item-tracker-app/
├── public/
│   ├── Uglyico.ico
│   ├── manifest.webmanifest
│   └── index.html
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ItemCard.vue
│   │   ├── ItemForm.vue
│   │   └── ItemGrid.vue
│   ├── types/
│   │   └── item.ts
│   ├── App.vue
│   └── main.ts
├── .gitignore
├── index.html
├── package.json
├── README.md
├── tsconfig.json
└── vite.config.ts
```

## Landing Page
When the application loads, an animation briefly appears on top of the main page. After about five seconds the animation disappears, revealing the app at the root path `/` without changing the URL.

## Technology Stack

- Vue 3 with Composition API
- TypeScript
- Vite
- Tailwind CSS for styling

## Login with Supabase

The application now includes basic email/password authentication powered by
Supabase. On first load, a login form appears after the startup animation. Users
can sign up or sign in, and the item tracker only loads once a session is
active.

To create an account, enter your email address and a password of your choice in the form and click **Sign Up**. Use the **Login** button if you already have an account.
 Items are saved with the authenticated user's UID (stored in a
`user_id` column) so each account only sees its own records. See
[docs/SUPABASE_AUTH_SETUP.md](docs/SUPABASE_AUTH_SETUP.md) for details on how
the auth integration works, how to restrict data per user, and how to update an
existing Supabase project for per-user items. A ready-to-run SQL script is
available at [docs/SUPABASE_SETUP.sql](docs/SUPABASE_SETUP.sql) to create the
required table, policies, and storage buckets.
If you've already created the `items` table, run
[docs/MIGRATION_ADD_QUANTITY_AND_SKU.sql](docs/MIGRATION_ADD_QUANTITY_AND_SKU.sql)
to add the `quantity` and `sku_codes` columns.

## Service Worker Caching

Images fetched from Supabase storage are cached using a service worker located at `public/sw.js`. The worker is automatically registered in `src/main.ts` and serves cached images on subsequent visits.

## License

MIT
