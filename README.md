# Milky Taste Eatery backend

This Express server adds a small API to the existing Milky Taste Eatery site.

## What it does
- `GET /api/health` — confirms the server is running.
- `GET /api/menu` — returns the website's current placeholder menu.
- `POST /api/orders` — validates and stores orders in `data/orders.json`.
- `GET /api/admin/orders` — optional protected endpoint for viewing orders.

Orders are stored in a local JSON file. This is suitable for learning/local testing, not a high-traffic production store or a multi-instance host. Use a managed database for production. This backend does not process payments and does not automatically confirm an order.

## Setup in VS Code
1. Install Node.js 18 or newer.
2. Extract this folder.
3. Put your existing HTML file in `public/index.html` (create the `public` folder).
4. Open the backend folder in VS Code.
5. Open Terminal and run:

   ```bash
   npm install
   cp .env.example .env
   npm run dev
   ```

   On Windows PowerShell, if `cp` does not work, use `Copy-Item .env.example .env`.

6. Visit `http://localhost:3000` and `http://localhost:3000/api/health`.

## Connect the existing order form

The current page builds a WhatsApp message in its `sendOrder()` function. To also save the order to this backend, replace the final `window.open(...)` line with an async request, while retaining the WhatsApp action if desired:

```js
const items = Array.from(cart.entries()).map(([name, quantity]) => ({ name, quantity }));

const response = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerName: $('#oName').value.trim(),
    mode,
    address: $('#oAddr').value.trim(),
    notes: $('#oNotes').value.trim(),
    items
  })
});

const result = await response.json();
if (!response.ok) {
  msg.textContent = result.error || 'Could not save order.';
  return;
}

// Continue opening WhatsApp using the message you already build above.
msg.textContent = `Order saved (${result.orderId}). Opening WhatsApp…`;
```

Because `sendOrder()` is currently a normal function, change its declaration to `async function sendOrder()` before adding the `await` code.

## Admin endpoint
1. Add a strong, private `ADMIN_API_KEY` value in `.env`.
2. Restart the server.
3. Request `GET /api/admin/orders` with header `x-admin-api-key: YOUR_SECRET`.

Never put the admin key in browser JavaScript or commit `.env` to GitHub. Add `.env` to `.gitignore`.

## Important production notes
- JSON-file storage is not a substitute for a database in production.
- Deploy only over HTTPS; use a managed database, authentication, backups, and a proper admin dashboard before handling real customer data.
- The sample menu contains placeholder items and has no prices because the uploaded page says its menu/prices are placeholders.


## Admin dashboard
- Dashboard page: `http://localhost:3000/admin.html`
- Copy `.env.example` to `.env` if you have not already done so.
- Set `ADMIN_API_KEY` in `.env` to a private random secret, for example a long mix of letters, numbers, and symbols. Do not use the example placeholder.
- Restart the server after editing `.env` (`Ctrl+C`, then `npm run dev`).
- Open `/admin.html`, enter the same key, and click **Open dashboard**.
- Use **Refresh orders**, search, and filters to review orders. Click **View details** to see the customer's order information.

The dashboard is read-only: it does not change order status or calculate totals. The current backend does not store prices or payment data. The key is kept in the page's memory while you are signed in and is not written to local storage. Do not deploy this starter publicly until you add proper admin authentication, HTTPS, and production database storage.
