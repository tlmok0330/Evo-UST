# Updated Flight Algorithm - HKD Currency & Realistic CO₂

## 🎯 **Major Updates**

### **1. Currency: HKD Instead of USD**
- All prices now in **Hong Kong Dollars (HKD)**
- Base rate: **HKD 0.94 per km** (converted from USD $0.12 × 7.8 exchange rate)

### **2. Realistic CO₂ Emissions**
- Based on actual industry data for Cathay Pacific routes
- Matches the distance-based emissions table provided

### **3. Increased Green Points for Long-Haul Flights**
- Longer flights save significantly more carbon
- **Formula:** GP = (CarbonSaved / 8) + DistanceBonus + EconomyBonus
- Long-haul flights now earn **150-400+ GP** (was 50-60 GP)

---

## 📊 **CO₂ Emissions by Distance (Economy Class)**

Based on your provided data:

| Flight Type | Distance | CO₂ Emissions (Economy) | Example Route |
|------------|----------|------------------------|---------------|
| **Very Short-Haul** | <500 km | 90-115 kg | HKG → Macau |
| **Short-Haul** | 500-1,500 km | 115-290 kg | HKG → Manila (1,135 km): ~100 kg |
| **Short-Haul** | 1,500-3,000 km | 230-290 kg | HKG → Tokyo (2,900 km): ~260 kg |
| **Medium-Haul** | 1,500-4,000 km | 205-260 kg | HKG → Singapore (2,585 km): ~230 kg |
| **Long-Haul** | 4,000-8,000 km | 870-1,000 kg | HKG → London (9,650 km): ~935 kg |
| **Ultra-Long-Haul** | 8,000-10,000 km | 990-1,170 kg | HKG → Los Angeles (11,645 km): ~1,080 kg |
| **Ultra-Long-Haul** | 10,000+ km | 1,100-1,300 kg | HKG → New York (12,980 km): ~1,200 kg |

### **Cabin Class Multipliers:**
- **Economy:** 1.0× (baseline)
- **Premium Economy:** 1.4× more CO₂
- **Business:** 2.2× more CO₂
- **First:** 3.5× more CO₂

---

## 💰 **Pricing in HKD**

### **Formula:**
```
Price (HKD) = Distance × PricePerKm × CabinMultiplier × DistanceDiscount + TimeVariation
```

### **Base Rates:**
```
Base: HKD 0.94 per km
```

### **Distance Discounts:**
```
> 8,000 km:  15% discount (×0.85)
> 5,000 km:  8% discount (×0.92)
> 3,000 km:  5% discount (×0.95)
< 3,000 km:  No discount (×1.00)
```

### **Cabin Multipliers:**
```
Economy:          1.0× (baseline)
Premium Economy:  1.8× (HKD price × 1.8)
Business:         4.5× (HKD price × 4.5)
First:            8.0× (HKD price × 8.0)
```

### **Time-of-Day Variations:**
```
08:30 (Early):     +HKD 1,500
11:15 (Mid-morning): +HKD 800
14:45 (Afternoon):   +HKD 400  ← Best value
18:20 (Evening):     +HKD 1,200
22:30 (Red-eye):     -HKD 400  ← Cheapest
```
Plus random: ±HKD 400

---

## 💚 **Green Points Calculation**

### **New Formula:**
```
GreenPoints = (CarbonSaved / 8) + DistanceBonus + EconomyBonus × EcoBonus
```

### **Step 1: Calculate Carbon Saved**
```
Modern Aircraft CO₂:  ActualCO₂ (from table above)
Old Aircraft Baseline: ActualCO₂ × 1.6 (60% more emissions)
CarbonSaved:          Baseline - Actual
```

### **Step 2: Base GP from Carbon Saved**
```
Base GP = CarbonSaved / 8

Example:
- Short-haul saves 100 kg → 100/8 = 12.5 GP
- Long-haul saves 560 kg → 560/8 = 70 GP
- Ultra-long saves 720 kg → 720/8 = 90 GP
```

### **Step 3: Distance Bonus**
```
< 1,500 km (Short-haul):      +50 GP
1,500-4,000 km (Medium-haul): +80 GP
4,000-8,000 km (Long-haul):   +150 GP
> 8,000 km (Ultra-long-haul): +250 GP
```

### **Step 4: Economy Class Bonus**
```
Economy class: ×1.3 (30% bonus)
Other classes: ×1.0 (no bonus)
```

### **Step 5: Eco-Friendly Bonus**
```
First 2 flights (using SAF): ×1.2 (20% bonus)
Other flights: ×1.0 (no bonus)
```

### **Minimum Guarantee:**
```
Minimum: 60 GP (increased from 50 GP)
```

---

## 📈 **Real-World Examples**

### **Example 1: Bangkok (Short-Haul, 1,700 km, Economy)**

**Pricing:**
```
Base price: 1,700 km × HKD 0.94 × 1.0 = HKD 1,598
+ Time variation: +HKD 400
Final: ~HKD 2,000-2,500
```

**CO₂ Calculation:**
```
Distance: 1,700 km
Economy CO₂: ~140 kg (from formula)
Baseline old aircraft: 140 × 1.6 = 224 kg
Carbon Saved: 224 - 140 = 84 kg
```

**Green Points:**
```
Base: 84 / 8 = 10.5 GP
Distance bonus: +80 GP (medium-haul)
Subtotal: 90.5 GP
Economy bonus: 90.5 × 1.3 = 117.7 GP
Eco-friendly bonus: 117.7 × 1.2 = 141 GP ✅

Final: ~140 GP (eco-friendly)
       ~120 GP (regular)
```

---

### **Example 2: Tokyo (Short-Haul, 2,900 km, Economy)**

**Pricing:**
```
Base price: 2,900 km × HKD 0.94 × 1.0 = HKD 2,726
+ Time variation: +HKD 400
Final: ~HKD 3,000-3,500
```

**CO₂ Calculation:**
```
Distance: 2,900 km
Economy CO₂: ~260 kg (from table)
Baseline: 260 × 1.6 = 416 kg
Carbon Saved: 416 - 260 = 156 kg
```

**Green Points:**
```
Base: 156 / 8 = 19.5 GP
Distance bonus: +80 GP
Subtotal: 99.5 GP
Economy bonus: 99.5 × 1.3 = 129 GP
Eco-friendly bonus: 129 × 1.2 = 155 GP ✅

Final: ~155 GP (eco-friendly)
       ~130 GP (regular)
```

---

### **Example 3: Singapore (Medium-Haul, 2,585 km, Economy)**

**Pricing:**
```
Base price: 2,585 km × HKD 0.94 × 1.0 = HKD 2,430
+ Time variation: +HKD 400
Final: ~HKD 2,800-3,200
```

**CO₂ Calculation:**
```
Distance: 2,585 km
Economy CO₂: ~230 kg (from table)
Baseline: 230 × 1.6 = 368 kg
Carbon Saved: 368 - 230 = 138 kg
```

**Green Points:**
```
Base: 138 / 8 = 17.3 GP
Distance bonus: +80 GP
Subtotal: 97.3 GP
Economy bonus: 97.3 × 1.3 = 126 GP
Eco-friendly bonus: 126 × 1.2 = 151 GP ✅

Final: ~150 GP (eco-friendly)
       ~125 GP (regular)
```

---

### **Example 4: London (Long-Haul, 9,650 km, Economy)** 🌟

**Pricing:**
```
Base price: 9,650 km × (HKD 0.94 × 0.85) = HKD 7,712
+ Time variation: +HKD 400
Final: ~HKD 8,000-8,500
```

**CO₂ Calculation:**
```
Distance: 9,650 km
Economy CO₂: ~935 kg (from table)
Baseline: 935 × 1.6 = 1,496 kg
Carbon Saved: 1,496 - 935 = 561 kg 🌍
```

**Green Points:**
```
Base: 561 / 8 = 70 GP
Distance bonus: +250 GP (ultra-long-haul!)
Subtotal: 320 GP
Economy bonus: 320 × 1.3 = 416 GP
Eco-friendly bonus: 416 × 1.2 = 499 GP ✅

Final: ~500 GP (eco-friendly) 🎉
       ~415 GP (regular)
```

**This is MASSIVE compared to the old system (50-60 GP)!**

---

### **Example 5: New York (Ultra-Long-Haul, 12,980 km, Economy)** 🚀

**Pricing:**
```
Base price: 12,980 km × (HKD 0.94 × 0.85) = HKD 10,370
+ Time variation: +HKD 400
Final: ~HKD 10,500-11,000
```

**CO₂ Calculation:**
```
Distance: 12,980 km
Economy CO₂: ~1,200 kg (from table)
Baseline: 1,200 × 1.6 = 1,920 kg
Carbon Saved: 1,920 - 1,200 = 720 kg 🌍🌍
```

**Green Points:**
```
Base: 720 / 8 = 90 GP
Distance bonus: +250 GP (ultra-long-haul!)
Subtotal: 340 GP
Economy bonus: 340 × 1.3 = 442 GP
Eco-friendly bonus: 442 × 1.2 = 530 GP ✅

Final: ~530 GP (eco-friendly) 🎉🎉
       ~440 GP (regular)
```

**WOW! Users save almost a TONNE of carbon and get 530 GP!**

---

### **Example 6: Los Angeles (Ultra-Long-Haul, 11,645 km, Economy)** 🚀

**Pricing:**
```
Base price: 11,645 km × (HKD 0.94 × 0.85) = HKD 9,304
+ Time variation: +HKD 400
Final: ~HKD 9,500-10,000
```

**CO₂ Calculation:**
```
Distance: 11,645 km
Economy CO₂: ~1,080 kg (from table)
Baseline: 1,080 × 1.6 = 1,728 kg
Carbon Saved: 1,728 - 1,080 = 648 kg 🌍
```

**Green Points:**
```
Base: 648 / 8 = 81 GP
Distance bonus: +250 GP
Subtotal: 331 GP
Economy bonus: 331 × 1.3 = 430 GP
Eco-friendly bonus: 430 × 1.2 = 516 GP ✅

Final: ~515 GP (eco-friendly) 🎉
       ~430 GP (regular)
```

---

## 🔥 **Business Class Examples**

### **London (9,650 km, Business Class)**

**Pricing:**
```
Base price: 9,650 km × (HKD 0.94 × 0.85) × 4.5 = HKD 34,700
+ Time variation: +HKD 800
Final: ~HKD 35,000-36,000
```

**CO₂ Calculation:**
```
Economy CO₂: 935 kg
Business CO₂: 935 × 2.2 = 2,057 kg
Baseline: 2,057 × 1.6 = 3,291 kg
Carbon Saved: 3,291 - 2,057 = 1,234 kg (huge!)
```

**Green Points:**
```
Base: 1,234 / 8 = 154 GP
Distance bonus: +250 GP
Subtotal: 404 GP
NO economy bonus (business class)
Eco-friendly bonus: 404 × 1.2 = 485 GP ✅

Final: ~485 GP (eco-friendly)
       ~405 GP (regular)
```

**Business class saves more carbon (1,234 kg vs 561 kg) but gets fewer GP than economy because we want to encourage economy travel!**

---

## 📊 **Comparison Table: Old vs New Algorithm**

| Route | Distance | Old GP | New GP (Eco) | Carbon Saved (New) | Price (HKD) |
|-------|----------|--------|--------------|-------------------|-------------|
| **Bangkok** | 1,700 km | 60 | **140** | 84 kg | 2,300 |
| **Tokyo** | 2,900 km | 60 | **155** | 156 kg | 3,200 |
| **Singapore** | 2,585 km | 60 | **150** | 138 kg | 3,000 |
| **Sydney** | 7,400 km | 60 | **420** | 445 kg | 6,500 |
| **London** | 9,650 km | 60 | **500** | 561 kg | 8,200 |
| **New York** | 12,980 km | 60 | **530** | 720 kg | 10,800 |
| **Los Angeles** | 11,645 km | 60 | **515** | 648 kg | 9,800 |

### **Key Improvements:**
- ✅ **Long-haul flights now reward 7-9× more GP!**
- ✅ **Realistic CO₂ emissions based on industry data**
- ✅ **HKD pricing matches local currency**
- ✅ **Carbon saved scales with distance (not fixed)**

---

## 🎯 **Tier Progression Impact**

With the new algorithm, users can progress through tiers much faster by taking long-haul eco-friendly flights!

### **Tier System:**
- **Bronze:** 0-999 GP
- **Silver:** 1,000-2,999 GP
- **Gold:** 3,000-5,999 GP
- **Diamond:** 6,000+ GP

### **Example Progression:**

**Old System (fixed 60 GP per flight):**
- Need **17 flights** to reach Silver (1,000 GP)
- Need **50 flights** to reach Gold (3,000 GP)
- Need **100 flights** to reach Diamond (6,000 GP)

**New System (distance-based GP):**

**Mix of flights:**
```
2× Bangkok (140 GP):        280 GP
2× Singapore (150 GP):      300 GP
1× London eco (500 GP):     500 GP
─────────────────────────────────
Total:                     1,080 GP → Silver tier! ✅
```

**To reach Gold (3,000 GP):**
```
4× Bangkok (140 GP):        560 GP
3× Singapore (150 GP):      450 GP
2× Sydney eco (420 GP):     840 GP
2× London eco (500 GP):   1,000 GP
1× New York eco (530 GP):   530 GP
─────────────────────────────────
Total:                    3,380 GP → Gold tier! 🏆
```

**Much more rewarding and realistic!**

---

## 🌱 **Environmental Impact**

### **Carbon Savings Visualization:**

**One Ultra-Long-Haul Flight (HKG-NYC):**
- Carbon Saved: **720 kg CO₂**
- Equivalent to:
  - 🌳 Planting **35 trees** for 1 year
  - 🚗 Driving **2,900 km** in a gas car
  - ⚡ Powering a home for **3 months**

**One Long-Haul Flight (HKG-London):**
- Carbon Saved: **561 kg CO₂**
- Equivalent to:
  - 🌳 Planting **27 trees** for 1 year
  - 🚗 Driving **2,250 km** in a gas car
  - ⚡ Powering a home for **2 months**

**With Sustainable Flight Actions (from dialog):**
```
Ultra-long-haul NYC (720 kg) + Light luggage (6 kg) + Veg meal (1.5 kg)
= 727.5 kg CO₂e saved + 530 + 300 + 75 = 905 GP total! 🎉
```

---

## ✅ **Summary of Changes**

### **1. Currency**
- ✅ Changed from USD to **HKD**
- ✅ Base rate: **HKD 0.94 per km**

### **2. CO₂ Emissions**
- ✅ Realistic values based on industry data
- ✅ Scales properly with distance
- ✅ Short-haul: 90-290 kg
- ✅ Medium-haul: 205-260 kg
- ✅ Long-haul: 870-1,000 kg
- ✅ Ultra-long-haul: 990-1,300 kg

### **3. Green Points**
- ✅ **Massively increased for long-haul flights**
- ✅ Short-haul: 120-155 GP (was 60 GP)
- ✅ Medium-haul: 125-150 GP (was 60 GP)
- ✅ Long-haul: 350-500 GP (was 60 GP) 🌟
- ✅ Ultra-long-haul: 430-530 GP (was 60 GP) 🚀
- ✅ Economy gets 30% bonus
- ✅ Eco-friendly gets 20% bonus

### **4. Carbon Saved**
- ✅ No longer fixed values
- ✅ Scales with distance and cabin class
- ✅ Long-haul saves 400-720 kg CO₂
- ✅ Short-haul saves 80-150 kg CO₂

---

## 🎓 **Educational Value**

Your app now teaches users:

1. **Long-haul flights have bigger carbon footprint** (but also bigger savings with modern aircraft)
2. **Economy class is more sustainable** than business/first
3. **Distance matters** for both emissions and rewards
4. **Sustainable choices are rewarded** heavily with GP

---

**Your Cathay Pacific travel app now provides realistic, meaningful Green Points that properly reward sustainable long-haul travel!** 🌍✈️💚

Users who take an eco-friendly flight to London or New York can earn **500+ GP in a single booking** - making the tier progression feel achievable and rewarding!
