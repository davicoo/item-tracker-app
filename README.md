# Item Tracker App

A single-page application built with Vue 3 and TypeScript for tracking items with images and sales status.

## Features

- Add items with images, names, prices, locations, and detailed descriptions
- Track item sales status (Not Sold / Sold / Sold & Paid)
- Simple statistics for Sold and Sold & Paid counts stored in Supabase
- Record when each item was added and display this date
- View all items in a responsive grid layout
- Persistent data storage using localStorage
- Fully responsive design
- Landing page that briefly displays an animation before navigating to the main application

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
│   ├── favicon.ico
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
The application starts with a simple landing page that shows an animated image for a few seconds. After the animation finishes, the router automatically navigates to the main app at `/app`.

## Technology Stack

- Vue 3 with Composition API
- TypeScript
- Vite
- Tailwind CSS for styling

## License

MIT