# Yorukaze POS System

## Project Info

**Developer**: Yorukaze Production  
**Copyright**: © Yorukaze Production 2020  
**Repository**: https://github.com/Milize21/YKZ-POS

## About

Yorukaze POS System is a professional Point of Sale application designed for managing merchandise sales, inventory tracking, and generating comprehensive sales reports. Built specifically for VTuber merchandise management (Afterrain and Yorukaze groups).

## Features

### 🎯 Core Features
- **Inventory Management** - Track products, quantities, prices, and stock levels
- **Sales System** - Process sales with customer ID tracking and transaction grouping
- **Group Management** - Manage multiple product groups (Afterrain, Yorukaze, Collab Product)
- **Reports & Analytics** - Comprehensive sales reports with Excel export
- **User Authentication** - Admin and Cashier role management

### 📊 Product Categories
- Kartu Gacha
- Standee 15CM & 1:1
- Ganchi (Keychains)
- Can Badge
- Keychain Winter
- Stickers
- Lightstick 15 Colors
- Dakimakura

### 💾 Data Management
- LocalStorage-based persistence (no backend required)
- Excel export for reports (Summary, Sales by Group, Sales by Category, Detailed Transactions)
- Transaction tracking with unique IDs
- Customer ID tracking for all sales

### 🎨 Design
- Yorukaze Production branding
- Navy blue and purple color scheme (#2D3561, #5D6BA3)
- Wave pattern background design
- Responsive layout for desktop and mobile

## Technologies Used

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Hooks
- **Icons**: Lucide React
- **Excel Export**: XLSX library
- **Data Storage**: Browser LocalStorage

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

```sh
# Step 1: Clone the repository
git clone https://github.com/Milize21/YKZ-POS.git

# Step 2: Navigate to the project directory
cd YKZ-POS

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

The application will be available at `http://localhost:8080`

### Build for Production

```sh
npm run build
```

The production-ready files will be in the `dist` folder.

## Default Login Credentials

- **Admin**: username: `admin` / password: `12345`
- **Cashier**: username: `cashier` / password: `12345`

## Project Structure

```
YKZ-POS/
├── public/
│   ├── yorukaze-logo.png      # Main logo
│   └── wave-pattern.svg        # Background pattern
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── Layout.tsx         # Main layout with header/footer
│   │   └── ui/                # shadcn/ui components
│   ├── lib/
│   │   ├── auth.ts            # Authentication logic
│   │   ├── inventory.ts       # Inventory management
│   │   └── sales.ts           # Sales tracking
│   ├── pages/
│   │   ├── Dashboard.tsx      # Dashboard overview
│   │   ├── Inventory.tsx      # Product management
│   │   ├── Sales.tsx          # Sales processing
│   │   ├── Groups.tsx         # Group management
│   │   ├── Reports.tsx        # Sales reports & Excel export
│   │   └── Login.tsx          # Authentication page
│   └── App.tsx                # Main application
├── package.json
└── README.md
```

## Usage

### For Administrators
- Manage inventory (add, edit, delete products)
- Create and manage product groups
- View comprehensive sales reports
- Export reports to Excel
- Delete transactions if needed

### For Cashiers
- Process sales transactions
- Select products and quantities
- Enter customer IDs
- Complete checkout

## Data Persistence

⚠️ **Important**: This application uses browser LocalStorage for data persistence.

**Data is saved:**
- ✅ Automatically after every change
- ✅ Persists after browser restart

**Data will be lost if:**
- ❌ Browser cache is cleared
- ❌ Using different browsers or devices
- ❌ Using incognito/private mode

**Recommendation**: Regularly export reports to Excel for backup.

## Deployment

This project can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

Simply build the project and deploy the `dist` folder.

## License

Copyright © Yorukaze Production 2020. All rights reserved.

## Support

For issues or questions, please contact Yorukaze Production or open an issue on the GitHub repository.

---

**Made with ❤️ by Yorukaze Production**
