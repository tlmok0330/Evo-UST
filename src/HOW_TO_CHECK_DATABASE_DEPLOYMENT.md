# 🔍 How to Check if Your Database is Deployed

## Quick Answer

Your **flights table is NOT automatically deployed yet**. The migration file exists, but you need to **run it manually** in Supabase to create the table and populate it with data.

---

## 3 Ways to Check Database Deployment Status

### ✅ Method 1: Use the Testing Tab (Easiest - In-App)

1. **Open your app** in Figma preview
2. **Go to Testing tab** (bottom navigation)
3. **Click "Test Database Connection"** button
4. **Check the result:**

   **✅ If Database is Deployed:**
   ```
   Connection Status: Connected ✓
   Found 40+ flights in database
   Sample Flights: [Shows 3 flight cards]
   
   ✅ Database Ready!
   Your database is connected and ready for your presentation.
   ```

   **❌ If Database is NOT Deployed:**
   ```
   Connection Status: Failed ✗
   
   ⚠️ Database Not Ready
   Your database migration needs to be run.
   ```

---

### ✅ Method 2: Check Supabase Dashboard (Most Reliable)

#### Step 1: Open Supabase Dashboard
1. Go to: **https://supabase.com/dashboard**
2. Sign in to your account
3. Open your project: **hcrazvlneraiamzgqizf**

#### Step 2: Check Table Editor
1. In the **left sidebar**, click **"Table Editor"**
2. **Look for a table named "flights"**

   **✅ If Deployed:**
   - You see **"flights"** table in the list
   - Click on it → See **40+ rows** of flight data
   - See columns: flight_number, airline, departure_code, arrival_code, etc.

   **❌ If NOT Deployed:**
   - **No "flights" table** appears in the list
   - Or table exists but has **0 rows**

#### Step 3: Verify Data
If the flights table exists, click on it and verify:
- **Row count:** Should be **40+** rows
- **Sample data:** Should see flight numbers like "CX 500", "CX 715", etc.
- **Destinations:** Tokyo (NRT), Singapore (SIN), London (LHR), etc.

---

### ✅ Method 3: Run SQL Query (Advanced)

#### In Supabase SQL Editor:

1. Go to **SQL Editor** in Supabase dashboard
2. Click **"New query"**
3. **Copy and paste this SQL:**

```sql
-- Check if flights table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'flights'
);

-- If table exists, check row count
SELECT COUNT(*) as total_flights FROM flights;

-- Show first 5 flights
SELECT * FROM flights LIMIT 5;
```

4. **Click "Run"**

   **✅ If Deployed:**
   ```
   Query 1: exists = true
   Query 2: total_flights = 40 (or more)
   Query 3: Shows 5 rows of flight data
   ```

   **❌ If NOT Deployed:**
   ```
   Query 1: exists = false
   Query 2: ERROR: relation "flights" does not exist
   Query 3: ERROR: relation "flights" does not exist
   ```

---

## 🚨 Current Status Check

Based on your setup, here's the likely status:

### What You HAVE:
- ✅ Supabase project created: `hcrazvlneraiamzgqizf`
- ✅ Supabase credentials configured in `/lib/supabase.ts`
- ✅ Migration file ready: `/supabase/migrations/20251115000000_create_flights_table.sql`
- ✅ Frontend code ready to fetch from database
- ✅ Fallback system working (generates flights if DB unavailable)

### What You NEED to Do:
- ⏭️ **Run the migration** to create the flights table
- ⏭️ **Populate the table** with 40+ flights
- ⏭️ **Test the connection** using Testing tab

### Most Likely Status:
**❌ NOT DEPLOYED YET** - because:
- Migration files don't auto-run
- You need to manually execute the SQL in Supabase
- Takes only 2 minutes!

---

## 📋 How to Deploy (If Not Already Deployed)

If your database is **NOT deployed** yet, follow these steps:

### Quick Deployment (2 minutes):

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard
   - Open project: hcrazvlneraiamzgqizf

2. **Open SQL Editor**
   - Left sidebar → "SQL Editor"
   - Click "New query"

3. **Copy Migration SQL**
   - Open: `/supabase/migrations/20251115000000_create_flights_table.sql`
   - Copy **ALL 85 lines**

4. **Paste and Run**
   - Paste into SQL Editor
   - Click "Run" button (bottom right)
   - Wait 3-5 seconds

5. **Verify Success**
   - Go to "Table Editor"
   - See "flights" table with 40+ rows
   - ✅ DONE!

---

## 🧪 Testing After Deployment

### Test 1: In App (Testing Tab)
```
1. Open Testing tab
2. Click "Test Database Connection"
3. Should show: ✅ Connected • Found 40+ flights
4. Should display 3 sample flight cards
```

### Test 2: In App (Holiday Tab)
```
1. Go to Holiday tab
2. Search for "Tokyo"
3. Click "Search Flights"
4. Should show 5 flights from database
   - CX 500, CX 502, CX 504, CX 506, CX 508
5. Prices should be HKD 3,750 - 4,200
```

### Test 3: In Supabase Dashboard
```
1. Table Editor → flights table
2. Should see 40+ rows
3. Filter by arrival_code = 'NRT' → 5 Tokyo flights
4. Filter by arrival_code = 'SIN' → 4 Singapore flights
```

---

## 🔧 Troubleshooting

### Issue: Testing Tab Shows "Failed"

**Possible Causes:**
1. ❌ Migration not run yet
2. ❌ Table exists but has no data
3. ❌ Internet connection issues
4. ❌ Wrong Supabase credentials

**Solutions:**
1. Check Supabase dashboard → Run migration if needed
2. Re-run the migration SQL (it will skip if table exists)
3. Check your internet connection
4. Verify credentials in `/lib/supabase.ts`

### Issue: "relation 'flights' does not exist"

**This means:** Migration has **NOT been run** yet

**Solution:** Follow deployment steps above

### Issue: Table exists but 0 rows

**This means:** Table created but data not inserted

**Solution:** 
1. Go to Supabase SQL Editor
2. Copy lines 26-69 from the migration file (the INSERT statements)
3. Run them separately

---

## 📊 Expected Database Structure

When properly deployed, your `flights` table should have:

### Table Schema:
```sql
flights (
  id UUID PRIMARY KEY,
  flight_number TEXT,
  airline TEXT,
  departure_code TEXT,
  departure_city TEXT,
  departure_country TEXT,
  arrival_code TEXT,
  arrival_city TEXT,
  arrival_country TEXT,
  departure_time TEXT,
  arrival_time TEXT,
  duration TEXT,
  carbon_saved INTEGER,
  green_points INTEGER,
  base_price INTEGER,
  is_eco_friendly BOOLEAN,
  created_at TIMESTAMP
)
```

### Data Distribution:
| Destination | Airport Code | Flight Count |
|------------|--------------|--------------|
| Tokyo | NRT | 5 flights |
| Singapore | SIN | 4 flights |
| London | LHR | 3 flights |
| Sydney | SYD | 3 flights |
| San Francisco | SFO | 3 flights |
| Bangkok | BKK | 3 flights |
| Seoul | ICN | 3 flights |
| **TOTAL** | - | **40+ flights** |

---

## 🎯 Quick Checklist

Use this checklist to verify deployment:

- [ ] Can access Supabase dashboard
- [ ] Logged into project: hcrazvlneraiamzgqizf
- [ ] See "flights" table in Table Editor
- [ ] Table has 40+ rows
- [ ] Can see flight data (CX 500, CX 715, etc.)
- [ ] Testing tab shows ✅ Connected
- [ ] Holiday tab can search and display flights
- [ ] Sample flights show realistic data

---

## 💡 Pro Tips

### Before Presentation:

1. **Test 24 hours before**
   - Deploy database
   - Test all 3 methods above
   - Fix any issues

2. **Have Supabase Dashboard Open**
   - Show live table during presentation
   - Demonstrates real database integration

3. **Test on Presentation WiFi**
   - Some networks block external databases
   - Have mobile hotspot as backup

4. **Don't Panic if Database Fails**
   - Your app has fallback system
   - Generated flights look identical
   - Still impressive demo!

---

## 📞 Next Steps

### If Database is NOT Deployed:
1. ✅ Follow deployment steps above (2 minutes)
2. ✅ Test using Testing tab
3. ✅ Verify in Supabase dashboard
4. ✅ Test Holiday tab search

### If Database IS Deployed:
1. ✅ You're ready for presentation!
2. ✅ Test all features once more
3. ✅ Prepare your demo script
4. ✅ Have Supabase dashboard open

---

## 📚 Related Files

- **Check Deployment:** Use Testing tab in app
- **Migration File:** `/supabase/migrations/20251115000000_create_flights_table.sql`
- **Supabase Config:** `/lib/supabase.ts`
- **Quick Deploy Guide:** `/QUICK_START.md`
- **Full Guide:** `/DATABASE_DEPLOYMENT_GUIDE.md`

---

**Need Help?** Just run Method 1 (Testing Tab) - it will tell you exactly what's needed! 🚀
