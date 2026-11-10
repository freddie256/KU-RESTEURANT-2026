# KU Restaurant — Backend

A small PHP + MySQL backend that receives:

- **Food orders** placed from the cart on the Menu page (`submit_order.php`)
- **Event booking requests** from the Social Events booking form (`submit_booking.php`)
- **Contact messages** from the Contact page (`submit_contact.php`)

The front-end pages talk to these files using `fetch()` and get a JSON
response back — no page reloads.

## 1. Requirements

- PHP 7.4 or newer (PHP 8 recommended)
- MySQL or MariaDB
- Any local server stack works: **XAMPP**, **WAMP**, **MAMP**, or `php -S`

## 2. Set up the database

1. Create the database and tables by importing `schema.sql`:
   - **phpMyAdmin**: open phpMyAdmin → *Import* → choose `schema.sql` → Go
   - **Command line**:
     ```
     mysql -u root -p < schema.sql
     ```
2. Open `config.php` and update the database credentials to match your
   setup (`DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`).

## 3. Put the whole project on your server

Copy the entire `KU RESTAUSANT` folder (the HTML pages **and** this
`backend` folder together) into your server's web root, e.g.:

- XAMPP: `C:\xampp\htdocs\KU RESTAUSANT`
- WAMP: `C:\wamp64\www\KU RESTAUSANT`

Then open the site through the server, for example:

```
http://localhost/KU RESTAUSANT/index.html
```

> **Important:** the cart, booking form and contact form will only work
> when the site is opened through a PHP server (`http://localhost/...`).
> They will **not** work if you just double-click the HTML file and open
> it as `file:///...`, because there is no PHP running in that case. If
> the backend can't be reached, the Order Now cart automatically offers a
> "Send order via WhatsApp" button instead, so customers can still order.

## 4. Quick test without XAMPP (optional)

If you have PHP installed on your computer, you can start a quick local
server from inside the `KU RESTAUSANT` folder:

```
php -S localhost:8000
```

Then visit `http://localhost:8000/index.html`. This uses PHP's built-in
server and does not need Apache — but you still need MySQL running and
`config.php` pointed at it.

## 5. Where the data goes

| Form                          | Table            |
|--------------------------------|------------------|
| Menu page cart checkout        | `orders`, `order_items` |
| Social Events booking form     | `event_bookings` |
| Contact page form               | `contact_messages` |

Open phpMyAdmin (or any MySQL client) any time to see the orders, event
requests and messages that have come in.

## 6. Going live

When you deploy to a real web host:

1. Set `DEBUG_MODE` to `false` in `config.php` so PHP errors are hidden
   from visitors.
2. Set `ALLOWED_ORIGIN` in `config.php` to your real site URL instead of
   `*`, once the front-end and backend are on the same domain.
3. Use a strong, unique database password.


## Order checkout upgrade

The new checkout captures:
- Customer name, phone and optional email
- Order type: Dine-in, Takeaway or Delivery
- Customer location
- Table number for Dine-in orders
- Package selection
- Pickup/delivery time
- Notes
- Server-generated order token

If you already imported the old database, run `migrate_order_fields.sql` once in phpMyAdmin.

For a new database, import `../ku_restaurant_complete.sql`.

WhatsApp and email use the same order details. After a successful database submission, the customer can open `order-confirmation.html` to view the token and send it again.


## Automatic order notifications

Customers now use only one **Submit Order** button. The server saves the order, assigns the table (for Dine-in) and daily token, then sends the order notification by email and WhatsApp.

- Email: configure `RESTAURANT_EMAIL` in `backend/config.php`. PHP `mail()` must be enabled by your hosting provider.
- WhatsApp: direct server-to-WhatsApp sending requires WhatsApp Business/Cloud API credentials. Configure `WHATSAPP_API_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, and `WHATSAPP_RECIPIENT` in `backend/config.php`.
- Do not put API tokens in JavaScript or HTML.
