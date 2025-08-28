# SSLCommerz Payment Integration

This document outlines the SSLCommerz payment gateway integration for the Blood Connect donation system.

## Configuration

### Backend Configuration (.env)
```
SSLCOMMERZ_STORE_ID=codec6877f70ea1b0a
SSLCOMMERZ_STORE_PASSWORD=codec6877f70ea1b0a@ssl
FRONTEND_URL=http://localhost:8080
BACKEND_URL=http://localhost:3001
```

### Store Details
- **Store ID**: codec6877f70ea1b0a
- **Store Password**: codec6877f70ea1b0a@ssl
- **Store Name**: testcodec21ip
- **Registered URL**: https://codecampus.mhrrony.com
- **Environment**: Sandbox (Development)

## API Endpoints

### Payment Initiation
```
POST /api/payment/initiate
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1000,
  "purpose": "general",
  "donorName": "John Doe",
  "donorEmail": "john@example.com",
  "donorPhone": "01700000000",
  "message": "Optional message",
  "isAnonymous": false
}
```

### Payment Status
```
GET /api/payment/status/:transactionId
Authorization: Bearer <token>
```

### Payment History
```
GET /api/payment/history?page=1&limit=10&status=SUCCESS
Authorization: Bearer <token>
```

## Callback URLs

### Success URL
- Frontend: `http://localhost:8080/payment/success`
- Route: `/payment/success`
- Component: `PaymentSuccess.tsx`

### Failure URL
- Frontend: `http://localhost:8080/payment/failed`
- Route: `/payment/failed`
- Component: `PaymentFailed.tsx`

### Cancel URL
- Frontend: `http://localhost:8080/payment/cancelled`
- Route: `/payment/cancelled`
- Component: `PaymentCancelled.tsx`

### IPN URL
- Backend: `http://localhost:3001/api/payment/ipn`
- Used for server-to-server payment confirmation

## Flow Diagram

1. User fills donation form on `/donation` page
2. Frontend calls `/api/payment/initiate` with payment details
3. Backend creates payment record and calls SSLCommerz Session API
4. User is redirected to SSLCommerz payment gateway
5. After payment, user is redirected to success/failure/cancel URL
6. SSLCommerz sends IPN notification to backend
7. Backend validates payment and updates status

## Database Schema

### Payment Model
```javascript
{
  transactionId: String (unique),
  userId: ObjectId,
  amount: Number,
  purpose: String,
  donorName: String,
  donorEmail: String,
  donorPhone: String,
  message: String,
  isAnonymous: Boolean,
  status: String, // PENDING, SUCCESS, FAILED, CANCELLED
  sessionkey: String,
  validationId: String,
  bankTransactionId: String,
  cardType: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Testing

### Test the Integration
1. Start backend: `cd backend && npm start`
2. Start frontend: `npm run dev`
3. Navigate to `http://localhost:8081/donation`
4. Login with a test account
5. Fill donation form and submit
6. You'll be redirected to SSLCommerz sandbox payment page
7. Use test card numbers provided by SSLCommerz

### Test Card Numbers (Sandbox)
- **Success**: 4111111111111111
- **Failure**: 4000000000000002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

## Security Notes

1. Never expose store password in frontend code
2. Always validate payments server-side
3. Use HTTPS in production
4. Implement proper error handling
5. Log all payment transactions for audit

## Production Deployment

1. Change `is_live: true` in SSLCommerz config
2. Update URLs to production domains
3. Get production store credentials from SSLCommerz
4. Update environment variables
5. Test thoroughly in production environment

## Support

- SSLCommerz Documentation: https://developer.sslcommerz.com/
- GitHub Repository: https://github.com/sslcommerz
- Merchant Panel: https://sandbox.sslcommerz.com/manage/
