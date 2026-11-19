# 🪣 Storage Buckets Setup - Bulcha International Hotel

## Issue: "Bucket not found" when uploading images

Your application uses **2 storage buckets** that need to be created in Supabase:

1. **`menu-images`** - For menu item photos (public)
2. **`payment-receipts`** - For payment screenshots (private)

---

## 🚀 Quick Fix (3 Options)

### Option 1: Using Supabase SQL Editor (RECOMMENDED)

1. **Go to Supabase Dashboard**:
   - Visit: https://supabase.com/dashboard/project/piqgdjbupsmtegtijgfz
   - Click on **SQL Editor** in the left sidebar

2. **Run the Migration**:
   - Click **"New Query"**
   - Copy the contents of: `supabase/migrations/0007_create_storage_buckets.sql`
   - Paste into the SQL editor
   - Click **"Run"** or press `Ctrl+Enter`

3. **Verify**:
   - Go to **Storage** in the left sidebar
   - You should see two buckets:
     - ✅ `menu-images` (public)
     - ✅ `payment-receipts` (private)

---

### Option 2: Using Supabase CLI

```bash
# 1. Install Supabase CLI (if not installed)
npm install -g supabase

# 2. Link to your project
supabase link --project-ref piqgdjbupsmtegtijgfz

# 3. Run the migration
supabase db push

# 4. Verify
supabase storage ls
```

---

### Option 3: Manual Setup via Dashboard

#### Create menu-images bucket:

1. Go to **Storage** → **Create a new bucket**
2. Settings:
   - **Name**: `menu-images`
   - **Public bucket**: ✅ **ON**
   - **File size limit**: `15 MB`
   - **Allowed MIME types**: 
     - `image/jpeg`
     - `image/jpg`
     - `image/png`
     - `image/webp`
3. Click **Save**

4. Go to **Policies** tab:
   - Click **New Policy**
   - Select **"For full customization"**
   - Create 4 policies:

**Policy 1: Public Read**
```sql
Name: Public can view menu images
Operation: SELECT
Target roles: public
USING expression: bucket_id = 'menu-images'
```

**Policy 2: Authenticated Upload**
```sql
Name: Authenticated users can upload menu images
Operation: INSERT
Target roles: authenticated
WITH CHECK expression: bucket_id = 'menu-images'
```

**Policy 3: Authenticated Update**
```sql
Name: Authenticated users can update menu images
Operation: UPDATE
Target roles: authenticated
USING expression: bucket_id = 'menu-images'
WITH CHECK expression: bucket_id = 'menu-images'
```

**Policy 4: Authenticated Delete**
```sql
Name: Authenticated users can delete menu images
Operation: DELETE
Target roles: authenticated
USING expression: bucket_id = 'menu-images'
```

#### Create payment-receipts bucket:

1. Go to **Storage** → **Create a new bucket**
2. Settings:
   - **Name**: `payment-receipts`
   - **Public bucket**: ❌ **OFF** (private)
   - **File size limit**: `10 MB`
   - **Allowed MIME types**: 
     - `image/jpeg`
     - `image/jpg`
     - `image/png`
     - `image/webp`
3. Click **Save**

4. Create the same 4 policies (SELECT, INSERT, UPDATE, DELETE) for authenticated users

---

## ✅ Verification

After creating the buckets, test the upload:

### Test Menu Images Upload:
1. Go to: http://localhost:8081/admin/media
2. Click **"Upload images"**
3. Select an image file
4. Upload should succeed ✅

### Test Payment Receipt Upload:
1. Go to: http://localhost:8081/payments
2. Try to upload a receipt
3. Upload should succeed ✅

---

## 🔧 Bucket Configuration Details

### menu-images (Public)
- **Purpose**: Store menu item photos for guest-facing menu
- **Access**: Public read, authenticated write
- **Size Limit**: 15 MB
- **Formats**: JPEG, PNG, WebP
- **Auto-optimization**: Images are compressed to WebP on upload

### payment-receipts (Private)
- **Purpose**: Store payment confirmation screenshots
- **Access**: Authenticated users only
- **Size Limit**: 10 MB
- **Formats**: JPEG, PNG, WebP
- **Security**: Only authenticated users can view/upload

---

## 🎯 What the Migration Does

```sql
✅ Creates menu-images bucket (public)
✅ Creates payment-receipts bucket (private)
✅ Sets file size limits (15MB and 10MB)
✅ Restricts to image formats only
✅ Creates 4 policies for menu-images:
   - Public can read
   - Authenticated can upload
   - Authenticated can update
   - Authenticated can delete
✅ Creates 4 policies for payment-receipts:
   - Authenticated can read
   - Authenticated can upload
   - Authenticated can update
   - Authenticated can delete
✅ Grants necessary permissions
```

---

## 🐛 Troubleshooting

### Error: "Bucket already exists"
- The migration uses `ON CONFLICT DO UPDATE` - safe to run multiple times

### Error: "Policy already exists"  
- The migration uses `IF NOT EXISTS` - safe to run multiple times

### Error: "Permission denied"
- Make sure you're logged in as the project owner or have admin access

### Images still not uploading?
1. Check browser console for errors
2. Verify bucket names match exactly:
   - `menu-images` (not `menu_images` or `menuImages`)
   - `payment-receipts` (not `payment_receipts`)
3. Check that policies are enabled (toggle should be green)
4. Verify your Supabase URL and keys in `.env` file

### Need to reset everything?
```sql
-- Delete buckets and start over
DELETE FROM storage.objects WHERE bucket_id IN ('menu-images', 'payment-receipts');
DELETE FROM storage.buckets WHERE id IN ('menu-images', 'payment-receipts');
-- Then run the migration again
```

---

## 📊 Storage Quotas

**Supabase Free Tier**:
- 1 GB storage
- Bandwidth: 2 GB/month

**What you're using**:
- Each menu image: ~50-200 KB (after WebP compression)
- ~5,000-20,000 images before hitting limit
- More than enough for a hotel menu!

---

## 🔐 Security Notes

1. **menu-images** is public because:
   - Guest menu needs to display images without authentication
   - Images are optimized and safe to expose
   - No sensitive information in food photos

2. **payment-receipts** is private because:
   - Contains sensitive payment information
   - Should only be accessible to staff
   - Requires authentication to view

3. **File size limits** prevent:
   - Storage abuse
   - Large file uploads
   - Performance issues

4. **MIME type restrictions** prevent:
   - Malicious file uploads
   - Non-image files
   - Executable files

---

## ✨ Features After Setup

Once buckets are created:

✅ **Admin can upload menu photos**
- Drag & drop multiple images
- Auto-conversion to WebP
- Image optimization (smaller files)
- Preview before assigning to dishes

✅ **Guests can see menu photos**
- Fast loading (optimized images)
- Beautiful circular plate design
- High-quality display

✅ **Staff can upload payment receipts**
- Attach to payment records
- Secure private storage
- View in payment dashboard

---

## 🚀 Next Steps

1. **Run the migration** (Option 1 recommended)
2. **Test upload** at http://localhost:8081/admin/media
3. **Upload menu photos** for your 165 dishes
4. **Enjoy** your fully functional image system! 🎉

---

## 📞 Need Help?

If you encounter issues:
1. Check the Supabase dashboard logs
2. Verify your project ID: `piqgdjbupsmtegtijgfz`
3. Ensure you're on the correct project
4. Check that Storage is enabled for your project

**Your setup**:
- Project: `piqgdjbupsmtegtijgfz`
- URL: `https://piqgdjbupsmtegtijgfz.supabase.co`
- Dashboard: https://supabase.com/dashboard/project/piqgdjbupsmtegtijgfz

---

**Ready to fix? Run the migration using Option 1 above!** ✨
