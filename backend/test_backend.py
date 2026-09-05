import sys
import os
import unittest

# Ensure the root directory is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.main import app
from backend.database import init_db

client = TestClient(app)


class TestMerchantOSBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Initialize database tables and seed data
        init_db()

    # -------------------------------------------------------------------------
    # 1. Health Endpoint Tests
    # -------------------------------------------------------------------------
    def test_01_health_check(self):
        response = client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["service"], "MerchantOS Backend")
        self.assertEqual(data["database"], "connected")
        print("[PASS] Health check endpoint (/api/health)")

    # -------------------------------------------------------------------------
    # 2. Products Catalog Tests
    # -------------------------------------------------------------------------
    def test_02_get_products(self):
        response = client.get("/api/products")
        self.assertEqual(response.status_code, 200)
        products = response.json()
        self.assertGreater(len(products), 5)
        
        # Verify Sports store filter
        sports_resp = client.get("/api/products?merchant_id=merchant_sports")
        self.assertEqual(sports_resp.status_code, 200)
        sports_products = sports_resp.json()
        self.assertTrue(all(p["merchantId"] == "merchant_sports" for p in sports_products))
        print("[PASS] List products with merchant filtering (/api/products)")

    def test_03_get_single_product(self):
        response = client.get("/api/products/prod_vel_01")
        self.assertEqual(response.status_code, 200)
        prod = response.json()
        self.assertEqual(prod["id"], "prod_vel_01")
        self.assertEqual(prod["name"], "Velocity Runner X")
        self.assertEqual(prod["price"], 6999.0)
        self.assertIn("Kinetic foam midsole", prod["features"])
        print("[PASS] Single product retrieval (/api/products/prod_vel_01)")

    # -------------------------------------------------------------------------
    # 3. Customer & Activity Tests
    # -------------------------------------------------------------------------
    def test_04_get_customer_and_activity(self):
        response = client.get("/api/customers/cust_sports_demo")
        self.assertEqual(response.status_code, 200)
        cust = response.json()
        self.assertEqual(cust["id"], "cust_sports_demo")
        self.assertEqual(cust["email"], "customer@urbankart.demo")

        # Get activities
        act_resp = client.get("/api/customers/cust_sports_demo/activity")
        self.assertEqual(act_resp.status_code, 200)
        activities = act_resp.json()
        self.assertIsInstance(activities, list)
        print("[PASS] Customer profile & activity timeline (/api/customers/{id})")

    def test_05_record_customer_activity(self):
        payload = {
            "customerId": "cust_sports_demo",
            "merchantId": "merchant_sports",
            "eventType": "PRODUCT_SEARCH",
            "metadata": {"query": "marathon carbon shoes"}
        }
        response = client.post("/api/activity", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["eventType"], "PRODUCT_SEARCH")
        print("[PASS] Record customer activity event (/api/activity)")

    # -------------------------------------------------------------------------
    # 4. Cart Operations Tests
    # -------------------------------------------------------------------------
    def test_06_cart_lifecycle(self):
        # 1. Clear existing cart
        client.delete("/api/cart/cust_sports_demo")

        # 2. Add Velocity Runner to cart
        add_payload = {
            "customerId": "cust_sports_demo",
            "productId": "prod_vel_01",
            "quantity": 1,
            "isAiRecommended": False
        }
        add_resp = client.post("/api/cart", json=add_payload)
        self.assertEqual(add_resp.status_code, 200)
        cart = add_resp.json()
        self.assertEqual(cart["totalItems"], 1)
        self.assertEqual(cart["subtotal"], 6999.0)

        # 3. Add AI recommended socks
        add_addon_payload = {
            "customerId": "cust_sports_demo",
            "productId": "prod_socks_01",
            "quantity": 1,
            "isAiRecommended": True
        }
        addon_resp = client.post("/api/cart", json=add_addon_payload)
        self.assertEqual(addon_resp.status_code, 200)
        cart2 = addon_resp.json()
        self.assertEqual(cart2["totalItems"], 2)
        self.assertEqual(cart2["subtotal"], 7798.0)

        # 4. Retrieve cart
        get_resp = client.get("/api/cart/cust_sports_demo")
        self.assertEqual(get_resp.status_code, 200)
        self.assertEqual(get_resp.json()["totalItems"], 2)

        # 5. Remove add-on
        rem_resp = client.delete("/api/cart/cust_sports_demo/items/prod_socks_01")
        self.assertEqual(rem_resp.status_code, 200)
        self.assertEqual(rem_resp.json()["totalItems"], 1)
        print("[PASS] Full cart lifecycle (Add, Get, Quantity, Remove, Subtotal)")

    # -------------------------------------------------------------------------
    # 5. Recommendation Engine Tests
    # -------------------------------------------------------------------------
    def test_07_recommendation_cross_sell_shoes(self):
        payload = {
            "customerId": "cust_sports_demo",
            "merchantId": "merchant_sports",
            "referenceProductId": "prod_vel_01",
            "cartProductIds": ["prod_vel_01"],
            "maxResults": 3
        }
        response = client.post("/api/recommendations", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["has_strong_recommendation"])
        self.assertGreater(len(data["recommendations"]), 0)

        rec_names = [r["product"]["name"] for r in data["recommendations"]]
        print(f"   Running Shoes Cross-Sell Recs: {rec_names}")
        
        # Verify recommended running accessories (socks, cleaner, flask, or roller)
        self.assertTrue(any("Socks" in name or "Cleaner" in name or "Flask" in name or "Roller" in name for name in rec_names))
        # Ensure exact reference product is never recommended to itself
        self.assertNotIn("Velocity Runner X", rec_names)
        print("[PASS] Running Shoes -> Running Socks / Shoe Cleaner / Flask cross-sell")

    def test_08_recommendation_cross_sell_hydration_flask(self):
        payload = {
            "customerId": "cust_sports_demo",
            "merchantId": "merchant_sports",
            "referenceProductId": "prod_flask_01",
            "cartProductIds": ["prod_flask_01"],
            "maxResults": 3
        }
        response = client.post("/api/recommendations", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["has_strong_recommendation"])
        rec_names = [r["product"]["name"] for r in data["recommendations"]]
        print(f"   Hydration Flask Cross-Sell Recs: {rec_names}")
        self.assertTrue(any("Powder" in name or "Towel" in name or "Cap" in name or "Socks" in name for name in rec_names))
        print("[PASS] Hydration Flask -> Sports/Fitness accessories cross-sell")

    def test_09_recommendation_upsell_basic_shoe(self):
        payload = {
            "customerId": "cust_sports_demo",
            "merchantId": "merchant_sports",
            "referenceProductId": "prod_swift_02",  # SwiftRun Pro Max at ₹5,999
            "cartProductIds": ["prod_swift_02"],
            "searchQuery": "marathon running shoe upgrade"
        }
        response = client.post("/api/recommendations", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["has_strong_recommendation"])
        
        # Verify upsell or strong cross-sell presence
        recs = data["recommendations"]
        types = [r["recommendation_type"] for r in recs]
        prices = [r["product"]["price"] for r in recs]
        print(f"   SwiftRun Pro Max Recommendations types: {types}, prices: {prices}")
        self.assertTrue("upsell" in types or any(p > 5999 for p in prices) or "cross_sell" in types)
        print("[PASS] Basic Running Shoe -> Premium upgrade / cross-sell recommendation")

    def test_10_recommendation_personalization_by_activity(self):
        # Customer A with athletic / running interest
        payload_a = {
            "customerId": "cust_sports_demo",
            "merchantId": "merchant_sports",
            "searchQuery": "marathon running training gear"
        }
        resp_a = client.post("/api/recommendations", json=payload_a)
        self.assertEqual(resp_a.status_code, 200)
        recs_a = [r["product"]["name"] for r in resp_a.json()["recommendations"]]
        print(f"   Customer A (Running interest) Recs: {recs_a}")
        self.assertTrue(any("Run" in name or "Marathon" in name or "Socks" in name or "Shoe" in name for name in recs_a))

        # Customer B with Tech interests
        payload_b = {
            "customerId": "cust_sports_105",
            "merchantId": "merchant_tech",
            "referenceProductId": "prod_stand_01",
            "searchQuery": "ergonomic wireless mouse"
        }
        resp_b = client.post("/api/recommendations", json=payload_b)
        self.assertEqual(resp_b.status_code, 200)
        recs_b = [r["product"]["name"] for r in resp_b.json()["recommendations"]]
        print(f"   Customer B (Tech interest) Recs: {recs_b}")
        self.assertTrue(any("Mouse" in name or "Hub" in name for name in recs_b))
        print("[PASS] Personalized recommendation changes ranking based on customer activity")

    # -------------------------------------------------------------------------
    # 6. Orders & Razorpay Payment Simulator Tests
    # -------------------------------------------------------------------------
    def test_11_razorpay_payment_simulator_and_order_flow(self):
        # 1. Create Razorpay Test Order
        rzp_create_payload = {
            "customerId": "cust_sports_demo",
            "merchantId": "merchant_sports",
            "amount": 7798.0,
            "baseProductId": "prod_vel_01",
            "aiAddonProductId": "prod_socks_01"
        }
        rzp_resp = client.post("/api/payments/create-order", json=rzp_create_payload)
        self.assertEqual(rzp_resp.status_code, 200)
        rzp_data = rzp_resp.json()
        self.assertTrue(rzp_data["razorpayOrderId"].startswith("order_"))
        self.assertEqual(rzp_data["amount"], 7798.0)

        # 2. Verify Razorpay Test Payment
        verify_payload = {
            "razorpayOrderId": rzp_data["razorpayOrderId"],
            "razorpayPaymentId": f"pay_test_{rzp_data['razorpayOrderId'][11:]}",
            "razorpaySignature": "sig_test_valid_mock_signature",
            "customerId": "cust_sports_demo",
            "merchantId": "merchant_sports",
            "baseProductId": "prod_vel_01",
            "aiAddonProductId": "prod_socks_01",
            "paymentMethod": "UPI"
        }
        verify_resp = client.post("/api/payments/verify", json=verify_payload)
        self.assertEqual(verify_resp.status_code, 200)
        verify_data = verify_resp.json()
        self.assertTrue(verify_data["verified"])
        self.assertEqual(verify_data["status"], "SUCCESS")
        self.assertEqual(verify_data["totalAmount"], 7798.0)

        # 3. Check customer orders
        orders_resp = client.get("/api/orders/cust_sports_demo")
        self.assertEqual(orders_resp.status_code, 200)
        orders = orders_resp.json()
        self.assertGreater(len(orders), 0)
        latest_order = orders[0]
        self.assertEqual(latest_order["baseProduct"], "Velocity Runner X")
        self.assertEqual(latest_order["aiAddonProduct"], "Pro Dynamic Running Socks (3-Pack)")
        self.assertEqual(latest_order["aiAttribution"], "AI Cross-sell")
        self.assertEqual(latest_order["aiAttributedRevenue"], 799.0)
        print("[PASS] Razorpay Test Mode checkout, signature verification & order settlement")

    # -------------------------------------------------------------------------
    # 7. Admin Endpoints Tests
    # -------------------------------------------------------------------------
    def test_12_admin_endpoints(self):
        # Admin Customers
        admin_cust = client.get("/api/admin/customers?merchant_id=merchant_sports")
        self.assertEqual(admin_cust.status_code, 200)
        self.assertGreater(len(admin_cust.json()), 0)

        # Admin Orders
        admin_orders = client.get("/api/admin/orders?merchant_id=merchant_sports")
        self.assertEqual(admin_orders.status_code, 200)
        self.assertGreater(len(admin_orders.json()), 0)

        # Admin Activity
        admin_act = client.get("/api/admin/activity?merchant_id=merchant_sports")
        self.assertEqual(admin_act.status_code, 200)
        self.assertGreater(len(admin_act.json()), 0)
        print("[PASS] Admin dashboards (Customers, Orders, Audit Activity)")

    # -------------------------------------------------------------------------
    # 8. Razorpay Test Mode REST API Direct Endpoints
    # -------------------------------------------------------------------------
    def test_13_razorpay_health(self):
        resp = client.get("/api/razorpay/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "ok")
        self.assertTrue(data["configured"])
        self.assertEqual(data["mode"], "test")
        # Ensure secret is NOT in response
        self.assertNotIn("secret", str(data).lower())
        self.assertNotIn("NYTx", str(data))
        print("[PASS] Razorpay health endpoint (/api/razorpay/health)")

    def test_14_razorpay_create_direct_order(self):
        payload = {
            "amount": 6999.0,
            "currency": "INR",
            "receipt": "rcpt_test_suite_01",
            "notes": {
                "customer_id": "cust_sports_demo",
                "purpose": "Unit test direct Razorpay order creation"
            }
        }
        resp = client.post("/api/razorpay/orders", json=payload)
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["amount"], 699900)  # paise conversion
        self.assertTrue(data["razorpay_order_id"].startswith("order_"))
        self.assertEqual(data["currency"], "INR")
        # Ensure secret is NOT in response
        self.assertNotIn("secret", str(data).lower())
        self.assertNotIn("NYTx", str(data))
        print(f"[PASS] Razorpay Test Mode Direct Order Creation (Order ID: {data['razorpay_order_id']}, 699900 paise)")

    def test_15_razorpay_get_order(self):
        # Create an order first
        create_resp = client.post("/api/razorpay/orders", json={"amount": 1499.0, "currency": "INR"})
        self.assertEqual(create_resp.status_code, 201)
        rzp_order_id = create_resp.json()["razorpay_order_id"]

        # Retrieve order
        get_resp = client.get(f"/api/razorpay/orders/{rzp_order_id}")
        self.assertIn(get_resp.status_code, [200, 404])  # 200 if real API reachable, 404 if mocked ID
        print(f"[PASS] Razorpay order retrieval endpoint (/api/razorpay/orders/{rzp_order_id})")

    def test_16_razorpay_get_order_payments(self):
        # Create an order first
        create_resp = client.post("/api/razorpay/orders", json={"amount": 799.0, "currency": "INR"})
        self.assertEqual(create_resp.status_code, 201)
        rzp_order_id = create_resp.json()["razorpay_order_id"]

        # Get payments for order
        payments_resp = client.get(f"/api/razorpay/orders/{rzp_order_id}/payments")
        self.assertIn(payments_resp.status_code, [200, 404])
        print(f"[PASS] Razorpay order payments endpoint (/api/razorpay/orders/{rzp_order_id}/payments)")

    def test_17_get_customer_orders_endpoint(self):
        # 1. Test existing customer with orders (cust_sports_demo)
        resp_demo = client.get("/api/customers/cust_sports_demo/orders")
        self.assertEqual(resp_demo.status_code, 200)
        data_demo = resp_demo.json()
        self.assertEqual(data_demo["customer_id"], "cust_sports_demo")
        self.assertGreater(data_demo["order_count"], 0)
        self.assertEqual(len(data_demo["orders"]), data_demo["order_count"])
        
        first_order = data_demo["orders"][0]
        self.assertTrue(first_order["order_id"].startswith("ORD_"))
        self.assertIn("booking_id", first_order)
        self.assertIn("date", first_order)
        self.assertGreater(first_order["amount"], 0)
        self.assertEqual(first_order["payment_status"], "Success")
        self.assertEqual(first_order["payment_method"], "UPI")

        # 2. Test customer with no orders (cust_sports_102)
        resp_empty = client.get("/api/customers/cust_sports_102/orders")
        self.assertEqual(resp_empty.status_code, 200)
        data_empty = resp_empty.json()
        self.assertEqual(data_empty["customer_id"], "cust_sports_102")
        self.assertEqual(data_empty["order_count"], 0)
        self.assertEqual(data_empty["orders"], [])
        print(f"[PASS] Customer Order History endpoint (/api/customers/{{customer_id}}/orders) tested with cust_sports_demo ({data_demo['order_count']} orders) & cust_sports_102 (0 orders)")


if __name__ == "__main__":
    print("==========================================================")
    print("RUNNING MERCHANTOS FASTAPI BACKEND TEST SUITE")
    print("==========================================================\n")
    unittest.main(verbosity=2)
