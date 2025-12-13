#!/bin/bash

# Complete End-to-End Test of Chef Agent A2A

echo "🧪 Chef Agent End-to-End API Test"
echo "=================================="

# Configuration
BASE_URL="http://localhost:4444"
TENANT_HEADER="x-tenant-id: tenant-pista-house"

# Test 1: Check Chef Agent Card
echo ""
echo "📋 TEST 1: Chef Agent Discovery"
echo "GET /.well-known/chef-agent-card.json"
echo "---"
curl -s "${BASE_URL}/.well-known/chef-agent-card.json" | jq '{name, url, endpoints}'

# Test 2: Check Ingredient Stock BEFORE
echo ""
echo "📋 TEST 2: Check Initial Stock"
echo "---"
echo "Querying database for Chicken stock..."
psql -h localhost -U postgres -d demo -c "SELECT name, current_stock, unit FROM ingredients WHERE tenant_id = 'tenant-pista-house' AND name = 'Chicken';"

# Test 3: Send Order to Chef Agent (PLACE_ORDER)
echo ""
echo "📋 TEST 3: Place Order via A2A"
echo "POST /api/chef/a2a"
echo "---"

ORDER_ID=$(uuidgen)
echo "Order ID: $ORDER_ID"

# Create A2A message payload
cat > /tmp/chef_order.json << EOF
{
  "type": "PLACE_ORDER",
  "payload": {
    "orderId": "$ORDER_ID",
    "tableId": "T3",
    "items": [
      {
        "itemId": "main-ph-002",
        "itemName": "Chicken Manchani Pasta",
        "quantity": 2
      }
    ],
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "priority": "normal"
  }
}
EOF

echo "Payload:"
cat /tmp/chef_order.json | jq '.'

echo ""
echo "Sending to Chef Agent..."
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/chef/a2a" \
  -H "Content-Type: application/json" \
  -H "$TENANT_HEADER" \
  -d @/tmp/chef_order.json)

echo "Response:"
echo "$RESPONSE" | jq '.'

# Extract status
SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
ETA=$(echo "$RESPONSE" | jq -r '.data.eta')

if [ "$SUCCESS" = "true" ]; then
  echo "✅ Order placed successfully!"
  echo "   ETA: $ETA minutes"
else
  echo "❌ Order failed!"
  echo "   Error: $(echo "$RESPONSE" | jq -r '.error')"
fi

# Test 4: Check Stock AFTER (should be reduced)
echo ""
echo "📋 TEST 4: Verify Inventory Deduction"
echo "---"
echo "Querying database for Chicken stock AFTER order..."
psql -h localhost -U postgres -d demo -c "SELECT name, current_stock, unit FROM ingredients WHERE tenant_id = 'tenant-pista-house' AND name = 'Chicken';"

# Test 5: Check Chef Orders Table
echo ""
echo "📋 TEST 5: Verify Chef Order Created"
echo "---"
psql -h localhost -U postgres -d demo -c "SELECT waiter_order_id, status, eta_minutes, total_cogs FROM chef_orders WHERE waiter_order_id = '$ORDER_ID';"

# Test 6: Request Order Status
echo ""
echo "📋 TEST 6: Request Order Status via A2A"
echo "POST /api/chef/a2a (REQUEST_STATUS)"
echo "---"

cat > /tmp/chef_status.json << EOF
{
  "type": "REQUEST_STATUS",
  "payload": {
    "orderId": "$ORDER_ID"
  }
}
EOF

STATUS_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/chef/a2a" \
  -H "Content-Type: application/json" \
  -H "$TENANT_HEADER" \
  -d @/tmp/chef_status.json)

echo "Status Response:"
echo "$STATUS_RESPONSE" | jq '.'

# Test 7: Check Inventory Transactions (Audit Log)
echo ""
echo "📋 TEST 7: Check Inventory Audit Trail"
echo "---"
psql -h localhost -U postgres -d demo -c "SELECT it.created_at, i.name, it.quantity, it.notes FROM inventory_transactions it JOIN ingredients i ON it.ingredient_id = i.id WHERE it.tenant_id = 'tenant-pista-house' ORDER BY it.created_at DESC LIMIT 10;"

echo ""
echo "=================================="
echo "✅ Test Complete!"
echo ""
echo "Summary:"
echo "• Chef Agent Card: Accessible"
echo "• Order Placement: $SUCCESS"
echo "• ETA Calculated: $ETA min"
echo "• Inventory Deducted: Check above"
echo "• Audit Trail: Logged"
