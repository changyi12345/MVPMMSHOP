# G2Bulk API Analysis for MVPMMSHOP

## Overview
The G2Bulk API provides two main product categories:
1. **Game Top-Up** (Direct Top-Up) - Credits directly to player account
2. **Voucher / Gift Cards** (Voucher/Gift Code) - Digital codes delivered instantly or via polling

---

## 1. Product Types & Categories

| Category | Type | Description |
|----------|------|-------------|
| Direct Top-Up | Game Credits | Adds in-game currency/items directly to player account (requires player ID, sometimes server/charname) |
| Voucher/Gift Code | Digital Gift Cards | Delivers voucher codes (e.g., PUBG UC Vouchers, PSN, Razer Gold) |

---

## 2. Ordering Flows

### A. Direct Top-Up Order Flow
1. **List Games** - GET /v1/games to get available games
2. **Get Game Fields** - POST /v1/games/fields with game code to get required inputs
3. **Get Servers (if needed)** - POST /v1/games/servers
4. **Validate Player** - POST /v1/games/checkPlayerId (optional but HIGHLY recommended!)
5. **Get Catalogue & ETA** - GET /v1/games/:code/catalogue
6. **Place Order** - POST /v1/games/:code/order (includes callback URL)
7. **Track Status** - Either:
   - Poll POST /v1/games/order/status
   - Or receive webhook updates

### B. Voucher/Gift Code Order Flow
1. **List Categories** - GET /v1/category
2. **List Products** - GET /v1/products (or GET /v1/products/:id for single product)
3. **Purchase Product** - POST /v1/products/:id/purchase
   - Include quantity, X-Idempotency-Key (optional but recommended)
4. **Handle Response**:
   - If `status: COMPLETED` → `delivery_items` contains codes immediately
   - If `status: PENDING` → poll `poll_url` every 2-5s until COMPLETED or REFUNDED

---

## 3. Game-Specific Input Fields

### How to Determine Fields
Call `POST /v1/games/fields` with the game code to get exact required fields!

| Field Name | Description |
|------------|-------------|
| userid/player_id | Player's in-game ID |
| serverid/server_id | Server identifier (if required) |
| charname | Game-specific character/account name (if required) |

### Example Games
- **Mobile Legends: Bang Bang (mlbb)** - Requires user_id + server_id
- **PUBG Mobile (pubgm/pubg_mobile)** - Requires user_id/player_id
- **Free Fire (free_fire)** - Requires UID (user_id)
- **Honor of Kings** - Check fields endpoint for exact requirements

---

## 4. Frontend Form Fields & Validation

### Direct Top-Up Form
- **Game Dropdown** - Select game first
- **Dynamic Fields** - Render based on game's required fields (from /games/fields)
  - Player ID - Text input, numeric
  - Server ID - Text input/dropdown (if required)
  - Charname - Text input (if required)
- **Denomination Selector** - From game catalogue
- **Validate Player Button** - Call /games/checkPlayerId and show player name
- **Submit Order Button**

### Validation Rules
1. Player ID is required, numeric (depending on game)
2. Server ID/Charname required only if game specifies
3. Validate player before allowing order placement

### Voucher Form
- **Quantity Input** - Number of vouchers to purchase
- **Submit Button**

---

## 5. API Parameters

### Direct Top-Up
- `game` - Game code (required)
- `catalogue_name` - Denomination (required)
- `player_id` - Player ID (required)
- `server_id` - Server ID (conditional)
- `charname` - Character name (conditional)
- `remark` - Optional note
- `callback_url` - Optional webhook URL

### Voucher Purchase
- `quantity` - Number of vouchers (required)
- `X-Idempotency-Key` - UUID header for idempotency (optional but recommended)

---

## 6. Voucher Code Details

### How Codes Are Returned
- In purchase response if `status: COMPLETED`
- In poll_url response if initially `PENDING`

### API Response Field
`delivery_items` (array of strings) - Contains the voucher codes

### Display to User
- Show in clear, readable format
- Maybe copy-to-clipboard button
- Show expiration (if available in product description)

### Database Storage
- **YES, store voucher codes in your database immediately!**
- Delivery items are only available for 30 days

---

## 7. Direct Top-Up Confirmation

### Success Confirmation
- Order status reaches `COMPLETED`
- Either via:
  - Webhook notification
  - Polling status endpoint

### Fields to Save
- `order_id`
- `game_code`
- `player_id`
- `player_name`
- `denom_id` (catalogue name)
- `price`
- `status`
- `created_at`
- `completed_at`

---

## 8. Detailed Product Table

| Product Name | Type | Required Inputs | API Parameters | Response Structure | Order Flow |
|--------------|------|-----------------|----------------|--------------------|------------|
| Game Top-Up (any) | Direct Top-Up | Player ID (maybe Server ID/Charname) | game, catalogue_name, player_id, [server_id], [charname], [remark], [callback_url] | order object with order_id, game, player_name, price, status | Games → Fields → Validate → Catalogue → Order → Track |
| PUBG Mobile UC Voucher | Voucher | Quantity | quantity | order_id, transaction_id, product_id, product_title, status, [delivery_items], [poll_url] | Categories → Products → Purchase → (Poll if needed) |
| PSN Gift Card | Voucher | Quantity | quantity | Same as above | Same as above |
| Razer Gold Account | Voucher | Quantity | quantity | Same as above | Same as above |

---

## 9. Database Structure Design

### Products Table
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  g2bulk_product_id INTEGER, -- for vouchers
  g2bulk_game_code VARCHAR(50), -- for top-ups
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'direct_topup' or 'voucher'
  category_id INTEGER,
  category_title VARCHAR(255),
  description TEXT,
  image_url VARCHAR(500),
  unit_price DECIMAL(10, 2),
  face_value DECIMAL(10, 2), -- for vouchers
  stock INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  g2bulk_order_id INTEGER,
  g2bulk_transaction_id INTEGER, -- for vouchers
  type VARCHAR(50) NOT NULL, -- 'direct_topup' or 'voucher'
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  quantity INTEGER DEFAULT 1,
  total_price DECIMAL(10, 2) NOT NULL,
  remark TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

### User Inputs Table (for top-ups)
```sql
CREATE TABLE order_topup_inputs (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  game_code VARCHAR(50) NOT NULL,
  player_id VARCHAR(255) NOT NULL,
  server_id VARCHAR(255),
  charname VARCHAR(255),
  catalogue_name VARCHAR(255) NOT NULL,
  player_name VARCHAR(255)
);
```

### Voucher Codes Table
```sql
CREATE TABLE order_voucher_codes (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  voucher_code TEXT NOT NULL,
  delivered_at TIMESTAMP DEFAULT NOW(),
  is_redeemed BOOLEAN DEFAULT false
);
```

### Transaction Logs Table
```sql
CREATE TABLE transaction_logs (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  g2bulk_transaction_id INTEGER,
  transaction_type VARCHAR(50) NOT NULL, -- 'add_balance', 'charge_balance'
  amount DECIMAL(10, 2) NOT NULL,
  balance_before DECIMAL(10, 2),
  balance_after DECIMAL(10, 2),
  status VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 10. Examples

### Example 1: Mobile Legends: Bang Bang (mlbb) Direct Top-Up
1. **Get Games**: `GET /v1/games` → game code `mlbb`
2. **Get Fields**: `POST /v1/games/fields` → fields: ["userid", "serverid"]
3. **Validate Player**:
   ```json
   POST /v1/games/checkPlayerId
   {
     "game": "mlbb",
     "user_id": "123456789",
     "server_id": "2001"
   }
   ```
   Response:
   ```json
   { "valid": "valid", "name": "ProPlayer123", "openid": "..." }
   ```
4. **Get Catalogue**: `GET /v1/games/mlbb/catalogue`
5. **Place Order**:
   ```json
   POST /v1/games/mlbb/order
   {
     "catalogue_name": "50 Diamonds",
     "player_id": "123456789",
     "server_id": "2001"
   }
   ```

### Example 2: PUBG Mobile (pubgm) Direct Top-Up
1. **Get Games**: game code `pubgm`
2. **Get Fields**: ["userid"]
3. **Validate Player**: only `user_id` needed
4. **Get Catalogue**: shows UC denominations
5. **Place Order**: only `player_id` required

### Example 3: Free Fire (free_fire) Direct Top-Up
1. **Game code**: `free_fire`
2. **Fields**: ["userid"]
3. **Validate Player**: UID only
4. **Place Order**: UID only

### Example 4: Honor of Kings Direct Top-Up
1. **Game code**: Check `/v1/games` endpoint
2. **Get Fields**: Call `/v1/games/fields` for exact requirements
3. **Proceed with same flow as other games**

### Example 5: Voucher Product Purchase (PUBG Mobile 60 UC)
1. **Get Categories**: `GET /v1/category` → find PUBG Mobile UC Vouchers
2. **Get Products**: `GET /v1/products` → find product ID 1
3. **Purchase**:
   ```json
   POST /v1/products/1/purchase
   { "quantity": 1 }
   ```
   Response (COMPLETED):
   ```json
   {
     "success": true,
     "order_id": 123,
     "transaction_id": 456,
     "product_id": 1,
     "product_title": "60 UC Voucher",
     "status": "COMPLETED",
     "delivery_items": ["ABCD-EFGH-IJKL-MNOP"]
   }
   ```

---

## 11. Webhook Setup (for Direct Top-Up)
Include `callback_url` in your order to receive status updates!

Webhook POST body:
```json
{
  "order_id": 42,
  "game_code": "pubgm",
  "game_name": "PUBG Mobile",
  "player_id": "12345678",
  "player_name": "PlayerName",
  "server_id": "2001",
  "denom_id": "60 UC",
  "price": 0.88,
  "status": "COMPLETED",
  "message": "Order completed successfully",
  "remark": "your order remark",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

- Respond with **2xx within 10s**
- Make your handler **idempotent** (single retry on failure)
