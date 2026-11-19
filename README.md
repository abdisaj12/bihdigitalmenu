# Bulcha Digital Menu

A premium digital menu system for **Bulcha International Hotel** featuring a modern guest menu, comprehensive admin dashboard, and real-time order management.

## 🌟 Features

### Guest Menu
- **165+ Premium Dishes** - Ethiopian heritage meets international cuisine
- **Modern Card Layout** - Beautiful dish cards with real images
- **Advanced Filtering** - Dietary preferences, categories, and search
- **Real-time Updates** - Live menu availability and pricing
- **Multi-language Support** - English and Amharic (አማርኛ)
- **Dark/Light Theme** - Elegant theme switching
- **Loyalty System** - Points and rewards for guests
- **Interactive Cart** - Smooth ordering with animations

### Admin Dashboard
- **Order Management** - Real-time order tracking and updates
- **Menu Editor** - Full CRUD operations for dishes and categories
- **Media Library** - Image upload and management
- **Reservations** - Table and room booking management
- **Reports & Analytics** - Sales, popular dishes, and insights
- **Settings** - VAT, pricing, and hotel configuration
- **Modern UI** - Professional burgundy and gold theme

### Premium Components
- **Stunning Hero Section** - Rotating real meal images with cards
- **Dietary Filters** - Vegetarian, vegan, halal, gluten-free, spice levels
- **Dish Ratings** - 5-star rating system with reviews
- **Call Waiter** - In-app waiter assistance
- **Order Tracker** - Real-time order status updates
- **Beautiful Animations** - Framer Motion powered interactions

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, TanStack Router
- **Styling**: Tailwind CSS 4, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **UI Components**: Radix UI, shadcn/ui
- **Build Tool**: Vite
- **Package Manager**: npm/bun

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/abdisaj12/bihdigitalmenu.git
cd bihdigitalmenu

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run database migrations
# See SETUP.md for detailed instructions

# Start development server
npm run dev
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Storage Buckets

Run the storage bucket migration:

```sql
-- See supabase/migrations/0007_create_storage_buckets.sql
-- Or follow instructions in STORAGE_SETUP.md
```

## 📱 Usage

### Guest Menu
- Visit: `http://localhost:8081/menu`
- Browse dishes, filter by category/dietary preferences
- Add items to cart and place orders
- View real-time order status

### Admin Dashboard
- Visit: `http://localhost:8081/admin/login`
- Login with admin credentials
- Manage menu, orders, reservations, and settings

### QR Code Access
- Generate QR codes for tables/rooms
- Scan to access menu with pre-filled location

## 📚 Documentation

- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [STORAGE_SETUP.md](./STORAGE_SETUP.md) - Storage bucket configuration
- [PREMIUM_FEATURES.md](./PREMIUM_FEATURES.md) - Premium feature guide
- [TEST_ALL_FEATURES.md](./TEST_ALL_FEATURES.md) - Testing guide

## 🎨 Design Features

### Color Palette
- **Bulcha Red**: `#D84315` - Primary brand color
- **Burgundy**: `#8B1538` - Accent color
- **Gold**: `#FFD700` - Premium highlights

### Typography
- **Display Font**: Georgia (elegant serif)
- **Body Font**: System fonts (optimal performance)

### Theme Support
- Dark mode (default)
- Light mode
- Automatic theme detection
- Manual toggle

## 🔐 Security

- Row Level Security (RLS) on all tables
- Authenticated admin access
- Private storage buckets for receipts
- Public storage for menu images
- Input validation and sanitization

## 📊 Database Schema

- **menu_items** - Dishes with pricing and details
- **categories** - Menu organization
- **orders** - Customer orders
- **reservations** - Table/room bookings
- **profiles** - User accounts and loyalty
- **guest_favorites** - Saved favorite dishes
- **menu_reviews** - Dish ratings and reviews

## 🚢 Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Deploy to your preferred platform:
- Vercel
- Netlify
- Railway
- Your own server

## 📄 License

Private - Bulcha International Hotel

## 👥 Credits

Built with ❤️ for **Bulcha International Hotel**, Hawassa, Ethiopia

## 🆘 Support

For issues or questions:
- Check documentation files
- Review error logs in browser console
- Verify Supabase configuration
- Ensure storage buckets are created

---

**Bulcha International Hotel** - Where exceptional cuisine meets digital innovation ✨
