## EPI_USE Backend API

TypeScript + Express + Mongoose API with Zod validation.

### Prerequisites
- Node.js >= 18
- A MongoDB connection string

### Setup
1. Copy `.env.example` to `.env` and fill in values.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run in development mode:
   ```bash
   npm run dev
   ```
4. Build and start:
   ```bash
   npm run build && npm start
   ```

### Environment Variables
- `PORT` (default: 5001)
- `MONGODB_URI` (required)
- `CLIENT_ORIGIN` (default: http://localhost:5173)

### Health Check
```bash
curl http://localhost:5001/api/health
```

### Items API

Create an item:
```bash
curl -X POST http://localhost:5001/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","price":99.99}'
```

List items with pagination and search:
```bash
curl "http://localhost:5001/api/items?page=1&limit=10&q=test"
```

Get by id:
```bash
curl http://localhost:5001/api/items/<id>
```

Update by id:
```bash
curl -X PATCH http://localhost:5001/api/items/<id> \
  -H "Content-Type: application/json" \
  -d '{"price": 42.5, "tags":["sale"]}'
```

Delete by id:
```bash
curl -X DELETE http://localhost:5001/api/items/<id>
```

### Notes
- CORS is restricted to `CLIENT_ORIGIN` and `http://localhost:5173`.
- Security headers via Helmet and request logging via Morgan.

