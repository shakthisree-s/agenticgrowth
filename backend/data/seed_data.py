import json
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from backend import models

PRODUCTS_SEED = [
    # -------------------------------------------------------------------------
    # Sports & Athletics (merchant_sports)
    # -------------------------------------------------------------------------
    {
        "id": "prod_vel_01",
        "merchant_id": "merchant_sports",
        "name": "Velocity Runner X",
        "price": 6999.0,
        "original_price": 8499.0,
        "currency": "INR",
        "availability": True,
        "stock_count": 42,
        "category": "Running Shoes",
        "subcategory": "Road Running",
        "description": "High-performance road running shoes engineered with responsive kinetic foam midsole for long-distance endurance.",
        "margin": 45.0,
        "status": "Active",
        "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
        "ai_summary": "Responsive kinetic midsole road running shoe built for high-mileage training with breathable engineered mesh.",
        "features": json.dumps(["Kinetic foam midsole", "Breathable matrix upper", "High-abrasion rubber outsole", "Reflective safety accents"]),
        "ai_buyer_tags": json.dumps(["Running", "Marathon", "Road Running", "Endurance", "Footwear", "Shoes", "Athletic"]),
        "suitable_for": json.dumps(["daily-training", "marathon-prep", "long-distance", "road-running"]),
        "cross_sell_affinity": json.dumps([
            {"productId": "prod_socks_01", "productName": "Pro Dynamic Running Socks (3-Pack)", "affinityScore": 0.94, "price": 799.0, "reason": "78% of Velocity Runner buyers add anti-blister compression socks."},
            {"productId": "prod_cleaner_01", "productName": "EcoActive Sneaker & Shoe Cleaner Kit", "affinityScore": 0.88, "price": 599.0, "reason": "Keep your running shoes pristine with plant-based deep foam cleaner."},
            {"productId": "prod_flask_01", "productName": "Hydration Flask 750ml", "affinityScore": 0.85, "price": 499.0, "reason": "Essential on-the-run hydration bottle for distance sessions."},
            {"productId": "prod_foam_01", "productName": "Deep Recovery Foam Roller", "affinityScore": 0.82, "price": 1299.0, "reason": "Post-run fascial release and calf recovery gear."}
        ]),
        "price_elasticity_score": 0.76,
        "purchase_eligibility": "Instant checkout ready in Razorpay Test Mode."
    },
    {
        "id": "prod_swift_02",
        "merchant_id": "merchant_sports",
        "name": "SwiftRun Pro Max",
        "price": 5999.0,
        "original_price": 6999.0,
        "currency": "INR",
        "availability": True,
        "stock_count": 18,
        "category": "Running Shoes",
        "subcategory": "Cushioned Running",
        "description": "Ultra-cushioned stability shoe ideal for daily jogging, recovery runs, and joint impact protection.",
        "margin": 40.0,
        "status": "Active",
        "image": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80",
        "ai_summary": "Ultra-cushioned stability shoe ideal for daily jogging and joint protection.",
        "features": json.dumps(["Extra-wide ergonomic toe box", "High-rebound EVA sole", "Reflective accents"]),
        "ai_buyer_tags": json.dumps(["Running", "Cushioned", "Stability", "Shoes", "Footwear", "Jogging"]),
        "suitable_for": json.dumps(["recovery-runs", "daily-jogging", "walking", "beginner-running"]),
        "cross_sell_affinity": json.dumps([
            {"productId": "prod_socks_01", "productName": "Pro Dynamic Running Socks (3-Pack)", "affinityScore": 0.91, "price": 799.0, "reason": "Recommended for arch blister prevention."}
        ]),
        "price_elasticity_score": 0.81,
        "purchase_eligibility": "Ready for cross-sell recommendation."
    },
    {
        "id": "prod_aero_03",
        "merchant_id": "merchant_sports",
        "name": "AeroFlex Marathon Ultra",
        "price": 8499.0,
        "original_price": 9999.0,
        "currency": "INR",
        "availability": True,
        "stock_count": 12,
        "category": "Running Shoes",
        "subcategory": "Competition Racing",
        "description": "Elite race-day shoe with full-length carbon propulsion rocker designed for sub-3 marathon attempts.",
        "margin": 48.0,
        "status": "Active",
        "image": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&auto=format&fit=crop&q=80",
        "ai_summary": "Elite race-day shoe with full-length carbon propulsion rocker designed for marathon attempts.",
        "features": json.dumps(["Full curved rigid carbon plate", "PEBA ultralight foam", "178g featherweight"]),
        "ai_buyer_tags": json.dumps(["Racing", "Marathon", "Carbon-Plate", "Elite", "Shoes", "Running"]),
        "suitable_for": json.dumps(["race-day", "marathon-pace", "track-intervals"]),
        "cross_sell_affinity": json.dumps([
            {"productId": "prod_foam_01", "productName": "Deep Recovery Foam Roller", "affinityScore": 0.91, "price": 1299.0, "reason": "Essential post-race fascial release bundle."}
        ]),
        "price_elasticity_score": 0.65,
        "purchase_eligibility": "Ready for 1-click Razorpay Test Mode checkout."
    },
    {
        "id": "prod_socks_01",
        "merchant_id": "merchant_sports",
        "name": "Pro Dynamic Running Socks (3-Pack)",
        "price": 799.0,
        "original_price": 999.0,
        "currency": "INR",
        "availability": True,
        "stock_count": 150,
        "category": "Accessories & Apparel",
        "subcategory": "Socks",
        "description": "Anti-blister seamless compression socks engineered specifically for endurance and trail runners.",
        "margin": 55.0,
        "status": "Active",
        "image": "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&auto=format&fit=crop&q=80",
        "ai_summary": "Anti-blister seamless compression socks engineered specifically for endurance runners.",
        "features": json.dumps(["Arch compression band", "CoolMax moisture fiber", "Seamless toe box"]),
        "ai_buyer_tags": json.dumps(["Accessories", "Socks", "Anti-Blister", "Compression", "Running Gear"]),
        "suitable_for": json.dumps(["daily-training", "long-distance", "blister-prevention"]),
        "cross_sell_affinity": json.dumps([
            {"productId": "prod_cleaner_01", "productName": "EcoActive Sneaker & Shoe Cleaner Kit", "affinityScore": 0.75, "price": 599.0, "reason": "Shoe care bundle with fresh socks."}
        ]),
        "price_elasticity_score": 0.92,
        "purchase_eligibility": "High-affinity bundle add-on."
    },
    {
        "id": "prod_cleaner_01",
        "merchant_id": "merchant_sports",
        "name": "EcoActive Sneaker & Shoe Cleaner Kit",
        "price": 599.0,
        "original_price": 799.0,
        "currency": "INR",
        "availability": True,
        "stock_count": 80,
        "category": "Shoe Care",
        "subcategory": "Cleaners",
        "description": "Eco-friendly foaming sneaker cleaner with premium hog bristle brush and microfiber towel.",
        "margin": 62.0,
        "status": "Active",
        "image": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80",
        "ai_summary": "Natural foaming sneaker cleaner with wooden brush and microfiber cloth for mesh and knit running shoes.",
        "features": json.dumps(["Biodegradable foam solution", "Natural bristle brush", "Safe on knit, mesh, leather", "Microfiber towel included"]),
        "ai_buyer_tags": json.dumps(["Shoe Care", "Sneaker Cleaner", "Accessories", "Shoe Maintenance", "Running Gear"]),
        "suitable_for": json.dumps(["shoe-cleaning", "mesh-maintenance", "sneaker-care"]),
        "cross_sell_affinity": json.dumps([
            {"productId": "prod_socks_01", "productName": "Pro Dynamic Running Socks (3-Pack)", "affinityScore": 0.80, "price": 799.0, "reason": "Complete shoe care with fresh compression socks."}
        ]),
        "price_elasticity_score": 0.90,
        "purchase_eligibility": "Complementary accessory."
    },
    {
        "id": "prod_flask_01",
        "merchant_id": "merchant_sports",
        "name": "Hydration Flask 750ml",
        "price": 499.0,
        "original_price": 699.0,
        "currency": "INR",
        "availability": True,
        "stock_count": 95,
        "category": "Accessories & Apparel",
        "subcategory": "Hydration",
        "description": "BPA-free squeezable ergonomic sports water bottle with leak-proof high-flow jet valve.",
        "margin": 60.0,
        "status": "Active",
        "image": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80",
        "ai_summary": "BPA-free squeezable ergonomic sports water bottle with leak-proof jet valve.",
        "features": json.dumps(["BPA-free poly", "High-flow jet valve", "Ergonomic grip indents"]),
        "ai_buyer_tags": json.dumps(["Hydration", "Bottle", "Accessories", "Water Bottle", "Sports Gear"]),
        "suitable_for": json.dumps(["running", "gym", "cycling", "endurance"]),
        "cross_sell_affinity": json.dumps([
            {"productId": "prod_powder_01", "productName": "ProElectrolyte Hydration Powder", "affinityScore": 0.92, "price": 549.0, "reason": "Fill your flask with essential electrolyte hydration powder."},
            {"productId": "prod_towel_01", "productName": "QuickDry Microfiber Sports Towel", "affinityScore": 0.85, "price": 399.0, "reason": "Gym and workout sweat towel bundle."}
        ]),
        "price_elasticity_score": 0.95,
        "purchase_eligibility": "Ready for checkout cross-sell."
    },
    {
        "id": "prod_powder_01",
        "merchant_id": "merchant_sports",
        "name": "ProElectrolyte Hydration Powder",
        "price": 549.0,
        "original_price": 699.0,
        "currency": "INR",
        "availability": True,
        "stock_count": 65,
        "category": "Nutrition",
        "subcategory": "Hydration & Energy",
        "description": "Fast-absorbing electrolyte powder mix containing sodium, potassium, and magnesium for endurance cramp prevention.",
        "margin": 58.0,
        "status": "Active",
        "image": "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&auto=format&fit=crop&q=80",
        "ai_summary": "Instant dissolution endurance electrolyte mix with zero added sugar.",
        "features": json.dumps(["Zero sugar", "4 key electrolytes", "Citrus orange flavor", "30 single-serve sticks"]),
        "ai_buyer_tags": json.dumps(["Nutrition", "Electrolytes", "Hydration Powder", "Supplements", "Running"]),
        "suitable_for": json.dumps(["marathon-running", "sweat-recovery", "cycling", "gym-workout"]),
        "cross_sell_affinity": json.dumps([
            {"productId": "prod_flask_01", "productName": "Hydration Flask 750ml", "affinityScore": 0.95, "price": 499.0, "reason": "Pairs with your hydration bottle."}
        ]),
        "price_elasticity_score": 0.88,
        "purchase_eligibility": "Ready for cross-sell."
    },
    {
        "id": "prod_towel_01",
        "merchant_id": "merchant_sports",
        "name": "QuickDry Microfiber Sports Towel",
        "price": 399.0,
        "original_price": 599.0,
        "currency": "INR",
        "availability": True,
        "stock_count": 110,
        "category": "Accessories & Apparel",
        "subcategory": "Fitness Accessories",
        "description": "Ultra-absorbent antibacterial microfiber towel with corner zipper pocket for gym keys.",
        "margin": 55.0,
        "status": "Active",
        "image": "https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=600&auto=format&fit=crop&q=80",
        "ai_summary": "Compact quick-drying antibacterial microfiber towel with zippered locker key pouch.",
        "features": json.dumps(["Antibacterial silver-ion coating", "Absorbs 4x weight", "Zipper pocket"]),
        "ai_buyer_tags": json.dumps(["Towel", "Gym Towel", "Fitness Accessories", "Workout Gear"]),
        "suitable_for": json.dumps(["gym-workout", "running-sweat", "yoga"]),
        "cross_sell_affinity": json.dumps([
            {"productId": "prod_flask_01", "productName": "Hydration Flask 750ml", "affinityScore": 0.89, "price": 499.0, "reason": "Complete gym hydration and towel kit."}
        ]),
        "price_elasticity_score": 0.93,
        "purchase_eligibility": "Complementary fitness gear."
    },
    {
        "id": "prod_foam_01",
        "merchant_id": "merchant_sports",
        "name": "Deep Recovery Foam Roller",
        "price": 1299.0,
        "original_price": 1699.0,
        "currency": "INR",
        "availability": True,
        "stock_count": 60,
        "category": "Recovery Gear",
        "subcategory": "Mobility",
        "description": "Grid-textured trigger point muscle massager for IT band, quads, and calf tightness relief.",
        "margin": 50.0,
        "status": "Active",
        "image": "https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=600&auto=format&fit=crop&q=80",
        "ai_summary": "Grid-textured trigger point muscle massager for IT band and calf tightness relief.",
        "features": json.dumps(["Multi-density grid matrix", "Hollow core construction", "Sweat-resistant EVA"]),
        "ai_buyer_tags": json.dumps(["Recovery", "Mobility", "Muscle-Relief", "Foam Roller", "Fitness"]),
        "suitable_for": json.dumps(["post-workout", "muscle-relief", "mobility-work"]),
        "cross_sell_affinity": json.dumps([
            {"productId": "prod_flask_01", "productName": "Hydration Flask 750ml", "affinityScore": 0.80, "price": 499.0, "reason": "Hydrate during post-workout recovery rolling."}
        ]),
        "price_elasticity_score": 0.85,
        "purchase_eligibility": "Ready for cross-sell."
    },
    {
        "id": "prod_cap_01",
        "merchant_id": "merchant_sports",
        "name": "Breathable Running Cap",
        "price": 699.0,
        "original_price": 899.0,
        "currency": "INR",
        "availability": True,
        "stock_count": 70,
        "category": "Accessories & Apparel",
        "subcategory": "Headwear",
        "description": "UPF 50+ sun protection ultra-light running hat with laser-perforated airflow and moisture-wicking sweatband.",
        "margin": 52.0,
        "status": "Active",
        "image": "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=80",
        "ai_summary": "UPF 50+ sun protection ultra-light running hat with moisture-wicking sweatband.",
        "features": json.dumps(["Laser cut ventilation", "Dark underbill to reduce glare", "Adjustable clasp"]),
        "ai_buyer_tags": json.dumps(["Cap", "Hat", "Headwear", "Running Gear", "Sun Protection"]),
        "suitable_for": json.dumps(["outdoor-running", "trail-running", "sun-protection"]),
        "cross_sell_affinity": json.dumps([
            {"productId": "prod_flask_01", "productName": "Hydration Flask 750ml", "affinityScore": 0.86, "price": 499.0, "reason": "Outdoor sun protection and hydration pair."}
        ]),
        "price_elasticity_score": 0.88,
        "purchase_eligibility": "Ready for cross-sell recommendation."
    },
    {
        "id": "prod_tee_01",
        "merchant_id": "merchant_sports",
        "name": "AeroDry Running T-Shirt",
        "price": 1199.0,
        "original_price": 1499.0,
        "currency": "INR",
        "availability": True,
        "stock_count": 85,
        "category": "Apparel",
        "subcategory": "T-Shirts",
        "description": "Featherweight anti-chafing technical running t-shirt with zonal mesh ventilation across the back.",
        "margin": 50.0,
        "status": "Active",
        "image": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
        "ai_summary": "Zonal mesh moisture-wicking running tee with flatlock seams.",
        "features": json.dumps(["AeroDry moisture management", "Flatlock seams", "Reflective shoulder graphics"]),
        "ai_buyer_tags": json.dumps(["Apparel", "T-Shirt", "Running Tee", "Athletic Wear"]),
        "suitable_for": json.dumps(["daily-running", "gym-workout", "outdoor-training"]),
        "cross_sell_affinity": json.dumps([
            {"productId": "prod_shorts_01", "productName": "AeroDry Split Running Shorts", "affinityScore": 0.93, "price": 999.0, "reason": "Complete matching technical running apparel kit."},
            {"productId": "prod_cap_01", "productName": "Breathable Running Cap", "affinityScore": 0.87, "price": 699.0, "reason": "Sun protection cap for your running shirt."}
        ]),
        "price_elasticity_score": 0.86,
        "purchase_eligibility": "Ready for cross-sell."
    },
    {
        "id": "prod_shorts_01",
        "merchant_id": "merchant_sports",
        "name": "AeroDry Split Running Shorts",
        "price": 999.0,
        "original_price": 1299.0,
        "currency": "INR",
        "availability": True,
        "stock_count": 90,
        "category": "Apparel",
        "subcategory": "Shorts",
        "description": "5-inch lightweight split running shorts with built-in liner and moisture-resistant zippered phone pocket.",
        "margin": 52.0,
        "status": "Active",
        "image": "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop&q=80",
        "ai_summary": "5-inch technical split running shorts with anti-bounce zippered pocket.",
        "features": json.dumps(["4-way stretch fabric", "Built-in breathable liner", "Zippered sweat-proof pocket"]),
        "ai_buyer_tags": json.dumps(["Apparel", "Shorts", "Running Shorts", "Athletic Wear"]),
        "suitable_for": json.dumps(["marathon-running", "track-sprints", "daily-jogging"]),
        "cross_sell_affinity": json.dumps([
            {"productId": "prod_tee_01", "productName": "AeroDry Running T-Shirt", "affinityScore": 0.94, "price": 1199.0, "reason": "Matching technical running top."}
        ]),
        "price_elasticity_score": 0.89,
        "purchase_eligibility": "Ready for cross-sell."
    },

    # -------------------------------------------------------------------------
    # Fashion & Apparel (merchant_fashion)
    # -------------------------------------------------------------------------
    {
        "id": "prod_fash_01",
        "merchant_id": "merchant_fashion",
        "name": "Urban Performance Kurti",
        "price": 899.0,
        "original_price": 1299.0,
        "currency": "INR",
        "availability": True,
        "stock_count": 48,
        "category": "Ethnic Wear",
        "subcategory": "Kurtis",
        "description": "Pure breathable cotton straight-fit kurti with delicate threadwork, ideal for daily office & casual wear.",
        "margin": 42.0,
        "status": "Active",
        "image": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80",
        "ai_summary": "Pure breathable cotton straight-fit kurti with delicate threadwork, ideal for daily office & casual wear.",
        "features": json.dumps(["100% Breathable cotton", "Straight silhouette with side slits", "Round neck with embroidery"]),
        "ai_buyer_tags": json.dumps(["Kurti", "Kurtis", "Ethnic Wear", "Women", "Cotton", "Casual"]),
        "suitable_for": json.dumps(["daily-wear", "office-ethnic", "casual-outings", "college"]),
        "cross_sell_affinity": json.dumps([
            {"productId": "prod_fash_04", "productName": "Chiffon Matching Dupatta", "affinityScore": 0.95, "price": 499.0, "reason": "84% of kurti buyers bundle a coordinated lightweight chiffon dupatta."},
            {"productId": "prod_fash_03", "productName": "Cotton Comfort Palazzo Pants", "affinityScore": 0.89, "price": 699.0, "reason": "Complete the ethnic look with matching wide-leg palazzo pants."}
        ]),
        "price_elasticity_score": 0.88,
        "purchase_eligibility": "Instant checkout ready in Razorpay Test Mode."
    },
    {
        "id": "prod_fash_02",
        "merchant_id": "merchant_fashion",
        "name": "Embroidered Anarkali Kurta Set",
        "price": 1899.0,
        "original_price": 2499.0,
        "currency": "INR",
        "availability": True,
        "stock_count": 22,
        "category": "Ethnic Wear",
        "subcategory": "Festive Sets",
        "description": "Heavy embroidered flared Anarkali kurta set with golden foil borders and matching pants.",
        "margin": 45.0,
        "status": "Active",
        "image": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80",
        "ai_summary": "Premium flared festive Anarkali with golden border embroidery and matching trousers.",
        "features": json.dumps(["Flared kalidar silhouette", "Intricate gold threadwork", "Set with kurta and pants"]),
        "ai_buyer_tags": json.dumps(["Anarkali", "Ethnic Wear", "Festive", "Party Wear", "Premium Kurta"]),
        "suitable_for": json.dumps(["festive-celebrations", "weddings", "evening-parties"]),
        "cross_sell_affinity": json.dumps([
            {"productId": "prod_fash_04", "productName": "Chiffon Matching Dupatta", "affinityScore": 0.91, "price": 499.0, "reason": "Coordinated festive dupatta pair."}
        ]),
        "price_elasticity_score": 0.72,
        "purchase_eligibility": "Premium ethnic upsell."
    },
    {
        "id": "prod_fash_03",
        "merchant_id": "merchant_fashion",
        "name": "Cotton Comfort Palazzo Pants",
        "price": 699.0,
        "original_price": 999.0,
        "currency": "INR",
        "availability": True,
        "stock_count": 60,
        "category": "Ethnic Wear",
        "subcategory": "Bottom Wear",
        "description": "Relaxed-fit pure cotton palazzo pants with elasticated drawstring waist and side pocket.",
        "margin": 50.0,
        "status": "Active",
        "image": "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format&fit=crop&q=80",
        "ai_summary": "Comfortable breathable wide-leg cotton palazzo pants.",
        "features": json.dumps(["Drawstring elastic waist", "Side deep pocket", "Flowy wide hem"]),
        "ai_buyer_tags": json.dumps(["Palazzo", "Bottom Wear", "Ethnic Pants", "Cotton"]),
        "suitable_for": json.dumps(["daily-comfort", "kurti-pairing", "office-wear"]),
        "cross_sell_affinity": json.dumps([
            {"productId": "prod_fash_01", "productName": "Urban Performance Kurti", "affinityScore": 0.90, "price": 899.0, "reason": "Pairs with daily cotton kurtis."}
        ]),
        "price_elasticity_score": 0.90,
        "purchase_eligibility": "Ready for cross-sell."
    },
    {
        "id": "prod_fash_04",
        "merchant_id": "merchant_fashion",
        "name": "Chiffon Matching Dupatta",
        "price": 499.0,
        "original_price": 699.0,
        "currency": "INR",
        "availability": True,
        "stock_count": 85,
        "category": "Ethnic Wear",
        "subcategory": "Dupattas",
        "description": "Lightweight feather-soft chiffon dupatta with delicate scalloped lace border.",
        "margin": 55.0,
        "status": "Active",
        "image": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80",
        "ai_summary": "Feather-light chiffon dupatta with lace trim.",
        "features": json.dumps(["Lightweight flowy chiffon", "Scalloped lace hem", "2.25m length"]),
        "ai_buyer_tags": json.dumps(["Dupatta", "Scarf", "Ethnic Accessories", "Chiffon"]),
        "suitable_for": json.dumps(["kurti-styling", "festive-layering"]),
        "cross_sell_affinity": json.dumps([
            {"productId": "prod_fash_01", "productName": "Urban Performance Kurti", "affinityScore": 0.92, "price": 899.0, "reason": "Matching ethnic top bundle."}
        ]),
        "price_elasticity_score": 0.94,
        "purchase_eligibility": "Complementary ethnic accessory."
    },

    # -------------------------------------------------------------------------
    # Consumer Electronics & Workstation (merchant_tech)
    # -------------------------------------------------------------------------
    {
        "id": "prod_stand_01",
        "merchant_id": "merchant_tech",
        "name": "UltraSlim Ergonomic Aluminum Laptop Stand",
        "price": 3499.0,
        "original_price": 4499.0,
        "currency": "INR",
        "availability": True,
        "stock_count": 35,
        "category": "Workstation Accessories",
        "subcategory": "Laptop Stands",
        "description": "CNC-machined aerospace-grade aluminum adjustable height laptop stand with passive heat dissipation.",
        "margin": 45.0,
        "status": "Active",
        "image": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80",
        "ai_summary": "CNC-machined aluminum adjustable laptop elevator with anti-slip silicone cushions.",
        "features": json.dumps(["Aerospace aluminum alloy", "Height adjustable 6-levels", "Passive cooling vents"]),
        "ai_buyer_tags": json.dumps(["Laptop Stand", "Workstation", "Desk Accessories", "Ergonomics"]),
        "suitable_for": json.dumps(["work-from-home", "clean-desk", "ergonomics"]),
        "cross_sell_affinity": json.dumps([
            {"productId": "prod_mouse_01", "productName": "SilentClick Dual-Mode Wireless Mouse", "affinityScore": 0.92, "price": 1299.0, "reason": "86% of laptop stand buyers pair an external ergonomic wireless mouse."},
            {"productId": "prod_hub_01", "productName": "ProDesk Multi-Port USB-C Hub", "affinityScore": 0.88, "price": 2199.0, "reason": "Connect multiple monitors and peripherals to your elevated laptop."}
        ]),
        "price_elasticity_score": 0.82,
        "purchase_eligibility": "Ready for 1-click Razorpay Test Mode checkout."
    },
    {
        "id": "prod_case_01",
        "merchant_id": "merchant_tech",
        "name": "MagShield Kevlar Phone Case (iPhone 15 Pro)",
        "price": 1499.0,
        "original_price": 1999.0,
        "currency": "INR",
        "availability": True,
        "stock_count": 75,
        "category": "Tech Accessories",
        "subcategory": "Phone Cases",
        "description": "Aerospace-grade 600D Aramid fiber case with embedded high-strength MagSafe magnetic ring array.",
        "margin": 48.0,
        "status": "Active",
        "image": "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&auto=format&fit=crop&q=80",
        "ai_summary": "Aerospace-grade 600D Aramid fiber case with embedded MagSafe magnetic ring array.",
        "features": json.dumps(["Genuine 600D Kevlar weave", "0.85mm ultra-thin profile", "N52 MagSafe array"]),
        "ai_buyer_tags": json.dumps(["Electronics", "iPhone 15 Pro", "Phone Case", "MagSafe", "Kevlar"]),
        "suitable_for": json.dumps(["daily-protection", "wireless-charging"]),
        "cross_sell_affinity": json.dumps([
            {"productId": "prod_screen_01", "productName": "9H DiamondEdge Screen Protector", "affinityScore": 0.95, "price": 799.0, "reason": "92% of Kevlar case buyers add 9H tempered screen protection."}
        ]),
        "price_elasticity_score": 0.88,
        "purchase_eligibility": "Ready for cross-sell."
    },
    {
        "id": "prod_screen_01",
        "merchant_id": "merchant_tech",
        "name": "9H DiamondEdge Screen Protector",
        "price": 799.0,
        "original_price": 999.0,
        "currency": "INR",
        "availability": True,
        "stock_count": 120,
        "category": "Tech Accessories",
        "subcategory": "Screen Protectors",
        "description": "Edge-to-edge shatterproof tempered glass with oleophobic anti-fingerprint coating and easy alignment tray.",
        "margin": 60.0,
        "status": "Active",
        "image": "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80",
        "ai_summary": "Edge-to-edge shatterproof tempered glass with oleophobic coating.",
        "features": json.dumps(["9H hardness scratch-resistant", "Oleophobic nano-coating", "Alignment tray included"]),
        "ai_buyer_tags": json.dumps(["Electronics", "Screen Protector", "Tempered Glass", "iPhone 15 Pro"]),
        "suitable_for": json.dumps(["screen-protection", "scratch-resistance"]),
        "cross_sell_affinity": json.dumps([]),
        "price_elasticity_score": 0.94,
        "purchase_eligibility": "Instant checkout cross-sell item."
    },
    {
        "id": "prod_mouse_01",
        "merchant_id": "merchant_tech",
        "name": "SilentClick Dual-Mode Wireless Mouse",
        "price": 1299.0,
        "original_price": 1799.0,
        "currency": "INR",
        "availability": True,
        "stock_count": 55,
        "category": "Workstation Accessories",
        "subcategory": "Peripherals",
        "description": "Ergonomic 2.4GHz + Bluetooth dual-connectivity silent mouse with USB-C fast recharging.",
        "margin": 38.0,
        "status": "Active",
        "image": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80",
        "ai_summary": "Ergonomic dual-mode Bluetooth 5.2 + 2.4GHz silent mouse.",
        "features": json.dumps(["90% noise-reduced silent clicks", "Bluetooth + 2.4GHz USB", "90 days battery life"]),
        "ai_buyer_tags": json.dumps(["Mouse", "Wireless Mouse", "Workstation", "Peripherals"]),
        "suitable_for": json.dumps(["office-work", "laptop-peripherals"]),
        "cross_sell_affinity": json.dumps([
            {"productId": "prod_hub_01", "productName": "ProDesk Multi-Port USB-C Hub", "affinityScore": 0.85, "price": 2199.0, "reason": "Multi-port connectivity bundle."}
        ]),
        "price_elasticity_score": 0.85,
        "purchase_eligibility": "Ready for cross-sell."
    },
    {
        "id": "prod_hub_01",
        "merchant_id": "merchant_tech",
        "name": "ProDesk Multi-Port USB-C Hub",
        "price": 2199.0,
        "original_price": 2999.0,
        "currency": "INR",
        "availability": True,
        "stock_count": 40,
        "category": "Workstation Accessories",
        "subcategory": "Docking & Hubs",
        "description": "7-in-1 aluminum USB-C hub with 4K@60Hz HDMI, 100W Power Delivery, SD/TF card reader, and 3x USB 3.0 ports.",
        "margin": 45.0,
        "status": "Active",
        "image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
        "ai_summary": "7-in-1 aluminum USB-C multiport hub with 4K HDMI and 100W PD pass-through.",
        "features": json.dumps(["4K 60Hz HDMI output", "100W USB-C Power Delivery", "3x USB 3.0 5Gbps ports"]),
        "ai_buyer_tags": json.dumps(["USB-C Hub", "Docking Station", "Workstation", "Accessories"]),
        "suitable_for": json.dumps(["dual-monitor-setup", "laptop-docking"]),
        "cross_sell_affinity": json.dumps([
            {"productId": "prod_stand_01", "productName": "UltraSlim Ergonomic Aluminum Laptop Stand", "affinityScore": 0.89, "price": 3499.0, "reason": "Elevate your laptop with docking capability."}
        ]),
        "price_elasticity_score": 0.82,
        "purchase_eligibility": "Ready for cross-sell."
    }
]

CUSTOMERS_SEED = [
    {
        "id": "cust_sports_demo",
        "merchant_id": "merchant_sports",
        "name": "UrbanKart Shopper",
        "email": "customer@urbankart.demo",
        "phone": "+91 98765 43210",
        "location": "Mumbai, MH",
        "status": "high_intent",
        "lifetime_value": 18900.0,
        "avatar_color": "#111111",
        "current_intent": "HIGH_PURCHASE_INTENT",
        "next_best_action": "Explore store catalog with AI Shopping Agent"
    },
    {
        "id": "cust_sports_102",
        "merchant_id": "merchant_sports",
        "name": "Aarav Mehta",
        "email": "aarav.m@example.com",
        "phone": "+91 98201 44819",
        "location": "Bengaluru, KA",
        "status": "high_intent",
        "lifetime_value": 14500.0,
        "avatar_color": "#111111",
        "current_intent": "HIGH_PURCHASE_INTENT",
        "next_best_action": "Recommend Pro Dynamic Running Socks as a complementary product"
    },
    {
        "id": "cust_sports_103",
        "merchant_id": "merchant_sports",
        "name": "Ananya Iyer",
        "email": "ananya.i@example.com",
        "phone": "+91 99002 88310",
        "location": "Hyderabad, TS",
        "status": "high_intent",
        "lifetime_value": 34000.0,
        "avatar_color": "#111111",
        "current_intent": "HIGH_PURCHASE_INTENT",
        "next_best_action": "Offer festive cross-sell styling accessories"
    },
    {
        "id": "cust_sports_104",
        "merchant_id": "merchant_sports",
        "name": "Vikram Sengupta",
        "email": "vikram.s@example.com",
        "phone": "+91 97312 00192",
        "location": "Kolkata, WB",
        "status": "active",
        "lifetime_value": 26800.0,
        "avatar_color": "#111111",
        "current_intent": "REPEAT_BUYER",
        "next_best_action": "Suggest carbon plate elite marathon upgrade"
    },
    {
        "id": "cust_sports_105",
        "merchant_id": "merchant_sports",
        "name": "Rohan Deshmukh",
        "email": "rohan.d@example.com",
        "phone": "+91 91672 55901",
        "location": "Pune, MH",
        "status": "high_intent",
        "lifetime_value": 21000.0,
        "avatar_color": "#111111",
        "current_intent": "HIGH_PURCHASE_INTENT",
        "next_best_action": "Propose workstation bundle with laptop stand and mouse"
    },
    {
        "id": "cust_sports_101",
        "merchant_id": "merchant_sports",
        "name": "Priya Sharma",
        "email": "priya.s@example.com",
        "phone": "+91 98450 12345",
        "location": "Delhi, DL",
        "status": "active",
        "lifetime_value": 12400.0,
        "avatar_color": "#111111",
        "current_intent": "HIGH_PURCHASE_INTENT",
        "next_best_action": "Follow up with athletic gear recommendations"
    }
]


def seed_database(db: Session):
    """Populates the database with initial products, customers, carts, and telemetry."""
    # 1. Seed Products if empty
    existing_products_count = db.query(models.Product).count()
    if existing_products_count == 0:
        for p_data in PRODUCTS_SEED:
            prod = models.Product(**p_data)
            db.add(prod)
        db.commit()

    # 2. Seed Customers if empty
    existing_customers_count = db.query(models.Customer).count()
    if existing_customers_count == 0:
        for c_data in CUSTOMERS_SEED:
            cust = models.Customer(**c_data)
            db.add(cust)
        db.commit()

    # 3. Seed Initial Activity for demo customers if empty
    existing_activity_count = db.query(models.CustomerActivity).count()
    if existing_activity_count == 0:
        now = datetime.now(timezone.utc)
        initial_activities = [
            # Customer Demo: running enthusiast
            models.CustomerActivity(
                customer_id="cust_sports_demo",
                merchant_id="merchant_sports",
                event_type="PRODUCT_SEARCH",
                activity_metadata=json.dumps({"query": "running shoes"}),
                timestamp=now - timedelta(hours=2)
            ),
            models.CustomerActivity(
                customer_id="cust_sports_demo",
                merchant_id="merchant_sports",
                event_type="PRODUCT_VIEW",
                product_id="prod_vel_01",
                product_name="Velocity Runner X",
                amount=6999.0,
                timestamp=now - timedelta(hours=1, minutes=45)
            ),
            models.CustomerActivity(
                customer_id="cust_sports_demo",
                merchant_id="merchant_sports",
                event_type="ADD_TO_CART",
                product_id="prod_vel_01",
                product_name="Velocity Runner X",
                amount=6999.0,
                timestamp=now - timedelta(hours=1, minutes=30)
            ),
            # Customer Aarav Mehta
            models.CustomerActivity(
                customer_id="cust_sports_102",
                merchant_id="merchant_sports",
                event_type="PRODUCT_SEARCH",
                activity_metadata=json.dumps({"query": "running shoes under 7000"}),
                timestamp=now - timedelta(hours=3)
            ),
            models.CustomerActivity(
                customer_id="cust_sports_102",
                merchant_id="merchant_sports",
                event_type="PRODUCT_VIEW",
                product_id="prod_vel_01",
                product_name="Velocity Runner X",
                amount=6999.0,
                timestamp=now - timedelta(hours=2, minutes=30)
            ),
            models.CustomerActivity(
                customer_id="cust_sports_102",
                merchant_id="merchant_sports",
                event_type="ADD_TO_CART",
                product_id="prod_vel_01",
                product_name="Velocity Runner X",
                amount=6999.0,
                timestamp=now - timedelta(hours=2)
            ),
            # Customer Rohan Deshmukh: Tech & Workstation
            models.CustomerActivity(
                customer_id="cust_sports_105",
                merchant_id="merchant_tech",
                event_type="PRODUCT_SEARCH",
                activity_metadata=json.dumps({"query": "laptop stand workstation"}),
                timestamp=now - timedelta(hours=4)
            ),
            models.CustomerActivity(
                customer_id="cust_sports_105",
                merchant_id="merchant_tech",
                event_type="PRODUCT_VIEW",
                product_id="prod_stand_01",
                product_name="UltraSlim Ergonomic Aluminum Laptop Stand",
                amount=3499.0,
                timestamp=now - timedelta(hours=3, minutes=30)
            ),
            models.CustomerActivity(
                customer_id="cust_sports_105",
                merchant_id="merchant_tech",
                event_type="PURCHASE_COMPLETED",
                product_id="prod_stand_01",
                product_name="UltraSlim Ergonomic Aluminum Laptop Stand",
                amount=3499.0,
                timestamp=now - timedelta(hours=1)
            )
        ]
        for act in initial_activities:
            db.add(act)
        db.commit()

    # 4. Seed Audit Events if empty
    existing_audit_count = db.query(models.AuditEvent).count()
    if existing_audit_count == 0:
        now = datetime.now(timezone.utc)
        audit_events = [
            models.AuditEvent(
                id="aud_sports_001",
                merchant_id="merchant_sports",
                agent="INTENT",
                stage="OBSERVE",
                title="Customer Search Telemetry",
                description="Recorded natural language search for running shoes from UrbanKart Shopper.",
                tool_used="StorefrontTelemetry",
                customer_id="cust_sports_demo",
                customer_name="UrbanKart Shopper",
                status="info",
                timestamp=now - timedelta(hours=2)
            ),
            models.AuditEvent(
                id="aud_sports_002",
                merchant_id="merchant_sports",
                agent="MERCHANDISING",
                stage="RECOMMEND",
                title="AI Cross-sell Scored",
                description="Scored Pro Dynamic Running Socks (+₹799) with 94% affinity for Velocity Runner X.",
                tool_used="RecommendationEngine",
                customer_id="cust_sports_demo",
                customer_name="UrbanKart Shopper",
                status="success",
                timestamp=now - timedelta(hours=1, minutes=30)
            )
        ]
        for aud in audit_events:
            db.add(aud)
        db.commit()
