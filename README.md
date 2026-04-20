# Demo CRM Application

A comprehensive, enterprise-ready CRM application built with Next.js and Supabase. This is a demo application designed to showcase typical CRM functionality with a clean, modern UI.

## Features

### Core Modules

- **Dashboard** - Overview cards with pipeline value, leads, opportunities, and cases
- **Accounts** - Company records with health status, ARR tracking, and relationships
- **Contacts** - Person records linked to accounts with communication preferences
- **Opportunities** - Sales pipeline management with Kanban and list views
- **Leads & Campaigns** - Lead tracking and marketing campaign management
- **Tasks** - Action items organized by due date (Today, Overdue, Upcoming, Completed)
- **Activities** - Timeline of all customer interactions (emails, calls, meetings, notes)
- **Cases** - Customer support request tracking
- **Products** - Product catalog with SKUs and pricing
- **Settings** - Demo controls and persona switching
- **Help** - Guided tours and FAQ

### Key Features

- Auto-login (no authentication needed for demo)
- Pre-seeded demo data
- Interactive Kanban boards
- Real-time data from Supabase
- Responsive design with Tailwind CSS
- Toast notifications for user feedback
- Modal and drawer components
- Tabbed detail views
- Search and filtering

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Backend**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works fine)

### 1. Clone and Install

```bash
cd /Users/galvered/Dev/demo-apps/crm
npm install
```

### 2. Set Up Supabase

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish setting up
3. Go to the SQL Editor in your Supabase project
4. Copy the contents of `supabase/schema.sql` and run it to create all tables
5. Copy the contents of `supabase/seed.sql` and run it to populate demo data
6. Disable Row Level Security (for demo purposes):

```sql
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_products DISABLE ROW LEVEL SECURITY;
```

**Note**: In a production app, you would want proper RLS policies instead of disabling it!

### 3. Configure Environment Variables

1. In your Supabase project, go to Settings → API
2. Copy your project URL and anon/public key
3. Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
crm/
├── app/                      # Next.js app directory
│   ├── accounts/            # Accounts module
│   ├── contacts/            # Contacts module
│   ├── opportunities/       # Opportunities module
│   ├── leads/               # Leads & Campaigns module
│   ├── tasks/               # Tasks module
│   ├── activities/          # Activities module
│   ├── cases/               # Cases module
│   ├── products/            # Products module
│   ├── settings/            # Settings page
│   ├── help/                # Help page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Dashboard
│   └── globals.css          # Global styles
├── components/              # Reusable components
│   ├── ui/                  # UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Drawer.tsx
│   │   ├── Toast.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   └── Table.tsx
│   └── layout/              # Layout components
│       └── AppLayout.tsx
├── lib/                     # Utilities
│   └── supabase.ts          # Supabase client
├── types/                   # TypeScript types
│   └── index.ts             # All data types
├── supabase/                # Database files
│   ├── schema.sql           # Database schema
│   ├── seed.sql             # Demo data
│   └── README.md            # Supabase setup guide
└── README.md                # This file
```

## Database Schema

The application uses the following main entities:

- **Accounts** - Companies/organizations
- **Contacts** - People associated with accounts
- **Opportunities** - Sales deals linked to accounts
- **Leads** - Prospects that can be converted to accounts/contacts/opportunities
- **Campaigns** - Marketing campaigns that source leads
- **Activities** - Logged interactions (emails, calls, meetings, notes)
- **Tasks** - Action items with due dates and priorities
- **Cases** - Support requests from customers
- **Products** - Product catalog
- **Opportunity Products** - Junction table linking products to opportunities

See `supabase/schema.sql` for the complete schema definition.

## Demo Data

The application comes with pre-seeded demo data including:

- 5 accounts across different industries
- 6 contacts
- 5 opportunities at various stages
- 4 leads with different statuses
- 3 campaigns
- 5 products
- Multiple activities, tasks, and cases

### Resetting Demo Data

To reset the data to its original state:

1. Go to Supabase SQL Editor
2. Run: `TRUNCATE accounts, contacts, opportunities, leads, campaigns, activities, tasks, cases, products, opportunity_products CASCADE;`
3. Re-run the `supabase/seed.sql` script

## Key Workflows

### Lead Conversion

1. Go to Leads & Campaigns
2. Find a lead with high score
3. Click "Convert Lead"
4. System creates Account + Contact + Opportunity
5. Redirects to new Opportunity

### Account Management

1. Go to Accounts
2. Click on an account name
3. View tabs: Overview, Contacts, Opportunities, Activities
4. Use quick action buttons to create related records

### Opportunity Pipeline

1. Go to Opportunities
2. Toggle between Kanban and List views
3. Drag cards between stages (in Kanban view)
4. Click opportunity to view details and products

### Task Management

1. Go to Tasks
2. View organized by Today, Overdue, Upcoming, Completed
3. Check off tasks to mark complete
4. Create new tasks linked to accounts or opportunities

## Customization

### Adding Custom Fields

See `types/index.ts` for all TypeScript interfaces. To add a custom field:

1. Add column to Supabase table
2. Update TypeScript interface
3. Update UI components to display/edit the field

### Changing Themes

Modify CSS variables in `app/globals.css` to change colors and styling.

### Adding New Modules

1. Create new page in `app/your-module/page.tsx`
2. Add navigation item in `components/layout/AppLayout.tsx`
3. Create database table in Supabase
4. Add TypeScript types

## Production Considerations

This is a demo application. For production use, consider:

- **Authentication** - Implement proper user authentication (Supabase Auth)
- **Row Level Security** - Enable RLS policies for data security
- **Authorization** - Add role-based access control
- **API Routes** - Use Next.js API routes for sensitive operations
- **Error Handling** - Add comprehensive error handling
- **Validation** - Add form validation
- **Testing** - Add unit and integration tests
- **Monitoring** - Set up error tracking and analytics
- **Performance** - Implement pagination, caching, and optimization

## License

MIT

## Support

For questions or issues, please refer to the Help page in the application or check the documentation in `supabase/README.md`.
