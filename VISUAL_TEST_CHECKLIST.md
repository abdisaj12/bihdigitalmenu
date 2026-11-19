# 🎨 Visual Testing Checklist - Bulcha Digital Menu

Complete visual inspection guide to ensure all meals and drinks are displayed professionally.

---

## 📱 Test URLs

- **Guest Menu**: http://localhost:8081/menu
- **Admin Console**: http://localhost:8081/admin/meals
- **Admin Drinks**: http://localhost:8081/admin/drinks

---

## ✅ Guest Menu Testing (http://localhost:8081/menu)

### **Hero Section**
- [ ] 6 rotating images visible (changes every 6 seconds)
- [ ] Floating dish info card (bottom-right) shows dish name
- [ ] Ken Burns zoom effect on images
- [ ] Progress dots at bottom (clickable)
- [ ] No black screens or broken images

### **Search & Filters**
- [ ] Search bar works (try "chicken", "coffee", "juice")
- [ ] Dietary filters button visible (vegetarian, vegan, halal, etc.)
- [ ] Category pills (All Menu, Breakfast, Lunch, Dinner, Drinks)
- [ ] Category pills highlight on click
- [ ] Dish count updates when filtering

### **Dish Cards - Layout**
- [ ] Cards display in responsive grid:
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3-4 columns
- [ ] All cards same height and width
- [ ] Rounded corners (rounded-3xl)
- [ ] Subtle shadow and border

### **Dish Cards - Images**
- [ ] Images fill card completely (no white space)
- [ ] Images are centered (faces/subjects visible)
- [ ] 4:3 aspect ratio maintained
- [ ] No stretched or squashed images
- [ ] Hover zoom effect works (110%)
- [ ] Gradient overlay on hover

### **Dish Cards - Missing Images**
- [ ] Cards without images show chef hat icon
- [ ] Chef hat is centered and sized properly
- [ ] Background has gradient (muted colors)
- [ ] No broken image icons

### **Dish Cards - Badges**
- [ ] Featured dishes show red corner badge with chef hat
- [ ] Popular dishes show gold corner badge
- [ ] Vegetarian badge (green) displays correctly
- [ ] Rating stars (gold) with score visible
- [ ] Badges don't overlap with images

### **Dish Cards - Content**
- [ ] Dish name is readable (not cut off)
- [ ] Description shows 2 lines (line-clamp-2)
- [ ] Price is bold and in Bulcha red (#D84315)
- [ ] "Add" button is visible and styled
- [ ] Favorite heart icon (top-right) clickable

### **Dish Cards - Hover Effects**
- [ ] Card lifts up slightly (y: -8px)
- [ ] Shadow increases
- [ ] Border changes to red
- [ ] Image zooms in
- [ ] Overlay appears
- [ ] All animations smooth (300-700ms)

### **Dish Detail Dialog**
- [ ] Opens when clicking card or "Add" button
- [ ] Large image at top (16:9 aspect)
- [ ] Image fills width completely
- [ ] Dish name, description, rating visible
- [ ] Ingredients section displays
- [ ] Allergens section displays
- [ ] Quantity stepper works (+/-)
- [ ] Note textarea functional
- [ ] Price updates with quantity
- [ ] "Add to order" button prominent

### **Categories to Test**

#### **Breakfast** (10-15 items)
- [ ] Breakfast Package
- [ ] Egg dishes (Scrambled, Fried, Omelette)
- [ ] Pancakes
- [ ] Check images fit properly
- [ ] Check prices display

#### **Ethiopian Dishes** (20-30 items)
- [ ] Kitfo
- [ ] Tibs varieties
- [ ] Firfir dishes
- [ ] Quanta
- [ ] Check traditional images
- [ ] Verify Amharic names

#### **International** (20-30 items)
- [ ] Pasta dishes
- [ ] Burgers
- [ ] Steaks
- [ ] Fish dishes
- [ ] Check variety of cuisines

#### **Drinks** (30-40 items)
- [ ] Coffee (Cappuccino, Espresso, etc.)
- [ ] Tea varieties
- [ ] Juices (Fresh, Seasonal)
- [ ] Soft drinks
- [ ] Beers (Dashen, Harar, etc.)
- [ ] Wine
- [ ] Spirits
- [ ] Check bottle images
- [ ] Verify drink sizes

#### **Desserts** (5-10 items)
- [ ] Cakes
- [ ] Pastries
- [ ] Sweet items
- [ ] Check colorful images

### **Performance**
- [ ] Page loads in under 3 seconds
- [ ] Images lazy load (don't block page)
- [ ] Smooth scrolling
- [ ] No layout shifts
- [ ] Cards render progressively

### **Responsive Design**
- [ ] Test on mobile (375px)
- [ ] Test on tablet (768px)
- [ ] Test on desktop (1920px)
- [ ] No horizontal scroll
- [ ] Touch targets are large enough

---

## 🎯 Admin Console Testing

### **Admin Meals Page** (http://localhost:8081/admin/meals)

- [ ] Table shows all meals with images
- [ ] Thumbnail images visible in table
- [ ] Edit button works
- [ ] Can add new meal
- [ ] Image picker shows uploaded images
- [ ] Can assign image to meal
- [ ] Changes save successfully

### **Admin Drinks Page** (http://localhost:8081/admin/drinks)

- [ ] Table shows all drinks with images
- [ ] Beer bottles display correctly
- [ ] Wine glasses visible
- [ ] Juice photos clear
- [ ] Can edit drink details
- [ ] Images update in real-time

### **Admin Media Library** (http://localhost:8081/admin/media)

- [ ] Grid shows all uploaded images
- [ ] Can upload new images
- [ ] Upload shows progress bar
- [ ] Images are optimized to WebP
- [ ] File size is reasonable (<500KB)
- [ ] Can select multiple images

---

## 🐛 Common Issues to Check

### **Image Issues**
- ❌ **Broken images**: Red X or "alt text" showing
  - **Fix**: Check image URL in database
  - **Fix**: Verify storage bucket is public
  
- ❌ **Stretched images**: People/food look distorted
  - **Fix**: Use `object-fit: cover` with `object-position: center`
  
- ❌ **Black/white space**: Images don't fill card
  - **Fix**: Ensure `aspect-[4/3]` and `overflow-hidden`
  
- ❌ **Slow loading**: Images take >5 seconds
  - **Fix**: Check WebP optimization
  - **Fix**: Use CDN or image service

### **Layout Issues**
- ❌ **Cards different sizes**: Misaligned grid
  - **Fix**: Ensure all cards use same container classes
  
- ❌ **Text overflow**: Names cut off or overlapping
  - **Fix**: Use `line-clamp-2` and `truncate`
  
- ❌ **Buttons not clickable**: Overlapping elements
  - **Fix**: Check z-index and pointer-events

### **Performance Issues**
- ❌ **Laggy hover**: Animations stutter
  - **Fix**: Use GPU-accelerated properties (transform, opacity)
  - **Fix**: Reduce animation duration
  
- ❌ **Layout shift**: Content jumps when loading
  - **Fix**: Use `aspect-ratio` to reserve space
  - **Fix**: Add skeleton loaders

---

## 📊 Test Results Template

### Environment
- **Browser**: Chrome/Firefox/Safari
- **Device**: Desktop/Tablet/Mobile
- **Screen Size**: 1920x1080 / 768x1024 / 375x667
- **Date**: YYYY-MM-DD

### Results

| Category | Total Items | Images OK | Issues Found | Status |
|----------|-------------|-----------|--------------|--------|
| Breakfast | 15 | 12 | 3 missing | ⚠️ |
| Ethiopian | 25 | 25 | 0 | ✅ |
| International | 30 | 28 | 2 stretched | ⚠️ |
| Drinks - Coffee/Tea | 15 | 15 | 0 | ✅ |
| Drinks - Beer | 10 | 10 | 0 | ✅ |
| Drinks - Wine | 8 | 8 | 0 | ✅ |
| Drinks - Juice | 12 | 10 | 2 missing | ⚠️ |
| Desserts | 8 | 8 | 0 | ✅ |
| **TOTAL** | **123** | **116** | **7** | **94%** |

### Issues Found

1. **Issue**: Description
   - **Severity**: High/Medium/Low
   - **Location**: Card/Dialog/Admin
   - **Fix**: What needs to be done

---

## 🎨 Professional Quality Checklist

### Visual Polish
- [ ] Consistent spacing between elements
- [ ] Proper typography hierarchy
- [ ] Smooth animations (no jank)
- [ ] Beautiful color palette
- [ ] High-quality images
- [ ] No pixelation or blur

### User Experience
- [ ] Intuitive navigation
- [ ] Clear call-to-action buttons
- [ ] Fast interaction feedback
- [ ] Helpful error messages
- [ ] Loading states visible
- [ ] Success confirmations

### Brand Consistency
- [ ] Bulcha red (#D84315) used correctly
- [ ] Gold accents for premium feel
- [ ] Dark theme polished
- [ ] Light theme works well
- [ ] Logo placement appropriate
- [ ] Ethiopian flag colors respected

### Accessibility
- [ ] Images have alt text
- [ ] Buttons have labels
- [ ] Color contrast sufficient
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Touch targets ≥44px

---

## 🚀 Pro Tips for Best Display

### For Best Image Display:
1. **Upload high-quality images** (1200px+ width)
2. **Use well-lit photos** (no dark or blurry shots)
3. **Center the subject** (food in middle of frame)
4. **Consistent styling** (similar angles and lighting)
5. **Remove backgrounds** (white/neutral backgrounds best)

### For Best Performance:
1. **Optimize images** (WebP, <500KB)
2. **Use lazy loading** (images load as you scroll)
3. **Enable caching** (faster on repeat visits)
4. **Compress without quality loss** (80-90% quality)
5. **Use CDN** (faster global delivery)

### For Best User Experience:
1. **Group items logically** (by meal type, cuisine)
2. **Show prices clearly** (large, bold, easy to read)
3. **Highlight specials** (badges, colors, position)
4. **Add descriptions** (helpful, appetizing words)
5. **Update regularly** (seasonal items, prices, availability)

---

## ✅ Final Approval

- [ ] All dishes display correctly
- [ ] All drinks display correctly
- [ ] No broken images
- [ ] Professional appearance
- [ ] Fast loading times
- [ ] Responsive on all devices
- [ ] Ready for production

**Tested by**: _______________  
**Date**: _______________  
**Approved**: ☐ Yes ☐ No ☐ Needs fixes  
**Notes**: _______________

---

**Need help with any issues? Check the console logs or run:**
```bash
# See dev server logs
npm run dev

# Check database
# Run SQL queries in Supabase Dashboard

# Test specific URL
curl -I https://piqgdjbupsmtegtijgfz.supabase.co/storage/v1/object/public/menu-images/[filename]
```

---

**Pro tip**: Take screenshots of any issues and compare before/after!
