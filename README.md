# ImageIntent - AI-Powered Image Transformation Tool

Transform your images using natural language prompts. Powered by ImageKit for image processing, Google Gemini AI for intelligent prompt parsing, Supabase for data storage, and NextAuth for authentication.

## Features

- 🤖 **AI-Powered Transformations**: Describe edits in natural language, powered by Google Gemini 1.5 Flash
- 🖼️ **Bulk Processing**: Upload and transform up to 10 images at once
- 🔄 **Real-time Preview**: Side-by-side comparison of original and transformed images
- 📥 **Download Options**: Download individual images or bulk ZIP
- 📚 **Edit History**: Save and review your past transformations
- 🔐 **Secure Authentication**: Email/password and Google OAuth via NextAuth
- ☁️ **Cloud-Based**: All processing via ImageKit - no server-side image manipulation

## Supported Transformations

- Resize & Crop (any dimensions, multiple modes)
- Format Conversion (PNG, JPG, WebP, AVIF)
- Image Effects (Blur, Sharpen, Grayscale)
- Adjustments (Brightness, Contrast, Quality)
- Rotation (any angle)
- Smart Focus (Face detection, custom focus points)

## Tech Stack

- **Framework**: Next.js 16+ with App Router
- **Frontend**: React 19, TypeScript, Tailwind CSS v4
- **Image Processing**: ImageKit SDK + URL transformations
- **AI**: Google Gemini 1.5 Flash API
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **Authentication**: NextAuth.js (Email/Password + Google OAuth)
- **UI Components**: Custom components with Lucide icons
- **Notifications**: Sonner toasts

## Prerequisites

Before you begin, you need to set up accounts and get API keys for:

1. **Supabase** (free tier): https://supabase.com
2. **ImageKit** (free tier): https://imagekit.io
3. **Google Cloud** (for Gemini AI & OAuth): https://console.cloud.google.com
4. **Vercel** (for deployment): https://vercel.com

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd image-intent
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project
2. Run this SQL in the SQL Editor to create the edit_history table:

```sql
create table edit_history (
  id uuid default uuid_generate_v4() primary key,
  user_id text not null,
  original_url text not null,
  transformed_url text not null,
  prompt text not null,
  operations text not null,
  file_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table edit_history enable row level security;

-- Create policy to allow users to see only their own history
create policy "Users can view their own history"
  on edit_history for select
  using (auth.uid()::text = user_id);

create policy "Users can insert their own history"
  on edit_history for insert
  with check (auth.uid()::text = user_id);

create policy "Users can delete their own history"
  on edit_history for delete
  using (auth.uid()::text = user_id);
```

3. Go to Settings > API and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Set Up ImageKit

1. Sign up at https://imagekit.io
2. Go to Developer options and copy:
   - Public Key → `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`
   - Private Key → `IMAGEKIT_PRIVATE_KEY`
   - URL Endpoint → `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`

### 4. Set Up Google Cloud

#### For Gemini AI:
1. Go to https://makersuite.google.com/app/apikey
2. Create an API key → `GOOGLE_GEMINI_API_KEY`

#### For Google OAuth:
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (and your production URL)
4. Copy:
   - Client ID → `GOOGLE_CLIENT_ID`
   - Client Secret → `GOOGLE_CLIENT_SECRET`

### 5. Set Up NextAuth

Generate a secret key:
```bash
openssl rand -base64 32
```
Use this value for `NEXTAUTH_SECRET`

### 6. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Copy from .env.example and fill in your values
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id

GOOGLE_GEMINI_API_KEY=your-gemini-api-key
```

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Deployment to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add all environment variables from your `.env.local`
4. Update `NEXTAUTH_URL` to your production URL
5. Add your production URL to Google OAuth authorized redirect URIs
6. Deploy!

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/         # NextAuth & signup
│   │   ├── upload/       # Image upload to ImageKit
│   │   ├── transform/    # AI parsing & transformations
│   │   └── history/      # Edit history CRUD
│   ├── auth/signin/      # Sign in page
│   ├── history/          # History page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Editor page (home)
│   └── providers.tsx     # Client-side providers
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── Header.tsx        # Navigation header
│   ├── ImageUploader.tsx # Drag & drop uploader
│   ├── ImagePreview.tsx  # Preview with comparison
│   └── PromptInput.tsx   # AI prompt input
├── hooks/                 # Custom React hooks
│   ├── useImageTransform.tsx  # Main transformation logic
│   ├── use-mobile.tsx    # Mobile detection
│   └── use-toast.tsx     # Toast notifications
├── lib/                   # Utilities & configs
│   ├── auth.ts           # NextAuth configuration
│   ├── supabase.ts       # Supabase client & functions
│   ├── imagekit-client.ts # ImageKit URL builder
│   ├── imagekit-server.ts # ImageKit server instance
│   ├── gemini.ts         # Gemini AI prompt parser
│   └── utils.ts          # Helper functions
└── types/                 # TypeScript type definitions
```

## Usage

1. **Sign In**: Create an account or sign in with Google
2. **Upload Images**: Drag & drop or click to upload (max 10 images, 10MB each)
3. **Describe Transformations**: Use natural language like:
   - "Resize to 800x600 and blur it"
   - "Convert to WebP, sharpen, and reduce quality to 70%"
   - "Make it grayscale and rotate 90 degrees"
4. **Preview**: View side-by-side comparison
5. **Download**: Download transformed images
6. **History**: View and manage your past transformations

## Example Prompts

- "Resize to 1200x800, convert to WebP, quality 85%"
- "Crop to square, apply grayscale, sharpen edges"
- "Blur with sigma 15, rotate 45 degrees"
- "Resize width to 1000, maintain aspect ratio, convert to PNG"
- "Brighten by 20, increase contrast by 30, sharpen"

## Limitations (Free Tier)

- ImageKit: 20GB bandwidth/month, 20GB storage
- Supabase: 500MB database, 1GB file storage
- Gemini API: Rate limits apply
- Image size: Max 10MB per image
- Bulk processing: Max 10 images at once

## Troubleshooting

### Images not uploading
- Check ImageKit credentials in environment variables
- Verify file size is under 10MB
- Check browser console for errors

### Transformations not working
- Verify Gemini API key is valid
- Check API rate limits
- Ensure ImageKit URL endpoint is correct

### Authentication issues
- Verify all NextAuth environment variables
- Check Google OAuth redirect URIs
- Ensure Supabase is properly configured

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
