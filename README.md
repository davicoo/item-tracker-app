# Item Tracker App

A single-page application built with Vue 3 and TypeScript for tracking items with images and sales status.

## Features

- Add items with images, names, prices, locations, and detailed descriptions
- Track item sales status (Not Sold / Sold / Sold & Paid)
- Simple statistics for Sold and Sold & Paid counts stored in Supabase, updated automatically when items change
- Sold & Paid totals subtract a 20% shop fee from each sale
- Bar chart showing how many items were sold in the last 30 days, 6 months, and year
- Record when each item was added and display this date
- View all items in a responsive grid layout
- Persistent data storage using localStorage
- Fully responsive design
- Animation overlay that displays for a few seconds on initial load before revealing the main application

## Project Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/item-tracker-app.git
cd item-tracker-app

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables
Create a `.env` file based on `.env.example` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` with your Supabase credentials.

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
When the application loads, an animation briefly appears on top of the main page. After a few seconds the animation disappears, revealing the app at the root path `/` without changing the URL.

## Technology Stack

- Vue 3 with Composition API
- TypeScript
- Vite
- Tailwind CSS for styling

## License

MIT