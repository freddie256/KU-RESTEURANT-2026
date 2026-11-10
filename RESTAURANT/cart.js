/**
 * KU Restaurant - Order Cart
 *
 * A small, self-contained shopping cart that powers the "Order Now"
 * button across every page. Cart contents are saved in the browser
 * (localStorage) so they survive a page reload or moving between pages.
 *
 * Checkout is WhatsApp-only: the order is written into a WhatsApp message to
 * the restaurant (number set in site-config.js). No server or PHP needed.
 */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       CONFIG
    ===================================================== */

    const CART_STORAGE_KEY = "ku_restaurant_cart";

    

    /* =====================================================
       STATE
    ===================================================== */

    let cart = loadCart();

    function loadCart() {
        try {
            const raw = window.localStorage.getItem(CART_STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    function saveCart() {
        try {
            window.localStorage.setItem(
                CART_STORAGE_KEY,
                JSON.stringify(cart)
            );
        } catch (e) {
            // localStorage unavailable (private mode etc.) - cart still
            // works for the current page view, just won't persist.
        }
    }

    function money(amount) {
        const rounded = Math.round(Number(amount) || 0);
        return "UGX " + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function cartCount() {
        return cart.reduce(function (sum, item) {
            return sum + item.qty;
        }, 0);
    }

    function cartTotal() {
        return cart.reduce(function (sum, item) {
            return sum + (item.qty * item.price);
        }, 0);
    }

    function addItem(id, name, price) {
        const existing = cart.find(function (item) {
            return item.id === id;
        });

        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ id: id, name: name, price: price, qty: 1 });
        }

        saveCart();
        updateBadges();
    }


    /* =====================================================
       DRAWER MARKUP (injected once, shared across pages)
    ===================================================== */

    document.body.insertAdjacentHTML("beforeend",
        '<div class="cart-toast" id="cartToast">' +
        '    <i class="fa-solid fa-circle-check"></i>' +
        '    <span id="cartToastText">Added to cart</span>' +
        '</div>'
    );

    const toastEl = document.getElementById("cartToast");
    const toastTextEl = document.getElementById("cartToastText");
    let toastTimer = null;

    function showAddedToast(itemName) {
        toastTextEl.textContent = "Added: " + itemName;
        toastEl.classList.add("show");

        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(function () {
            toastEl.classList.remove("show");
        }, 1800);
    }


    toastEl.addEventListener("click", function () {
        toastEl.classList.remove("show");
        renderCartView();
        openCart();
    });


    document.body.insertAdjacentHTML("beforeend",
        '<div class="cart-overlay" id="cartOverlay"></div>' +
        '<aside class="cart-drawer" id="cartDrawer" aria-hidden="true">' +
        '    <div class="cart-drawer-header">' +
        '        <h3><i class="fa-solid fa-bag-shopping"></i> Your Order</h3>' +
        '        <button type="button" class="cart-close" id="cartClose" aria-label="Close cart">' +
        '            <i class="fa-solid fa-xmark"></i>' +
        '        </button>' +
        '    </div>' +
        '    <div class="cart-body" id="cartBody"></div>' +
        '    <div class="cart-footer" id="cartFooter">' +
        '        <div class="cart-subtotal-row">' +
        '            <span>Subtotal</span>' +
        '            <strong id="cartSubtotal">UGX 0</strong>' +
        '        </div>' +
        '        <button type="button" class="btn btn-primary cart-checkout-btn" id="cartCheckoutBtn">' +
        '            Checkout' +
        '            <i class="fa-solid fa-arrow-right"></i>' +
        '        </button>' +
        '    </div>' +
        '</aside>'
    );

    const overlay      = document.getElementById("cartOverlay");
    const drawer       = document.getElementById("cartDrawer");
    const closeBtn      = document.getElementById("cartClose");
    const cartBody      = document.getElementById("cartBody");
    const cartFooter    = document.getElementById("cartFooter");
    const subtotalEl    = document.getElementById("cartSubtotal");
    const checkoutBtn   = document.getElementById("cartCheckoutBtn");


    /* =====================================================
       OPEN / CLOSE
    ===================================================== */

    function openCart() {
        drawer.classList.add("open");
        overlay.classList.add("open");
        drawer.setAttribute("aria-hidden", "false");
        document.documentElement.classList.add("cart-open-lock");
    }

    function closeCart() {
        drawer.classList.remove("open");
        overlay.classList.remove("open");
        drawer.setAttribute("aria-hidden", "true");
        document.documentElement.classList.remove("cart-open-lock");
    }

    closeBtn.addEventListener("click", closeCart);
    overlay.addEventListener("click", closeCart);

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeCart();
        }
    });


    /* =====================================================
       RENDER: CART VIEW
    ===================================================== */

    function renderCartView() {

        cartFooter.style.display = cart.length ? "block" : "none";

        if (cart.length === 0) {
            cartBody.innerHTML =
                '<div class="cart-empty">' +
                '    <i class="fa-solid fa-bag-shopping"></i>' +
                '    <p>Your cart is empty.</p>' +
                '    <a href="menu.html" class="btn btn-light">Browse the Menu</a>' +
                '</div>';
            return;
        }

        let rows = "";

        cart.forEach(function (item) {
            rows +=
                '<div class="cart-item">' +
                '    <div class="cart-item-info">' +
                '        <h4>' + item.name + '</h4>' +
                '        <span>' + money(item.price) + ' each</span>' +
                '    </div>' +
                '    <div class="cart-item-controls">' +
                '        <button type="button" class="cart-qty-btn" data-action="decrease" data-id="' + item.id + '" aria-label="Decrease quantity">−</button>' +
                '        <span class="cart-qty">' + item.qty + '</span>' +
                '        <button type="button" class="cart-qty-btn" data-action="increase" data-id="' + item.id + '" aria-label="Increase quantity">+</button>' +
                '        <button type="button" class="cart-remove-btn" data-action="remove" data-id="' + item.id + '" aria-label="Remove item">' +
                '            <i class="fa-solid fa-trash"></i>' +
                '        </button>' +
                '    </div>' +
                '</div>';
        });

        cartBody.innerHTML = '<div class="cart-items">' + rows + '</div>';
        subtotalEl.textContent = money(cartTotal());
    }

    cartBody.addEventListener("click", function (event) {

        const actionBtn = event.target.closest("[data-action]");

        if (!actionBtn) {
            return;
        }

        const id = actionBtn.dataset.id;
        const action = actionBtn.dataset.action;
        const item = cart.find(function (i) { return i.id === id; });

        if (!item) {
            return;
        }

        if (action === "increase") {
            item.qty += 1;
        } else if (action === "decrease") {
            item.qty -= 1;
            if (item.qty <= 0) {
                cart = cart.filter(function (i) { return i.id !== id; });
            }
        } else if (action === "remove") {
            cart = cart.filter(function (i) { return i.id !== id; });
        }

        saveCart();
        updateBadges();
        renderCartView();
    });

    checkoutBtn.addEventListener("click", function () {
        if (cart.length > 0) {
            renderCheckoutView();
        }
    });


    /* =====================================================
       RENDER: CHECKOUT VIEW
    ===================================================== */

    function renderCheckoutView() {

        cartFooter.style.display = "none";

        let summaryRows = "";

        cart.forEach(function (item) {
            summaryRows +=
                '<div class="checkout-summary-row">' +
                '    <span>' + item.qty + ' &times; ' + item.name + '</span>' +
                '    <span>' + money(item.qty * item.price) + '</span>' +
                '</div>';
        });

        cartBody.innerHTML =
            '<button type="button" class="cart-back-btn" id="cartBackBtn">' +
            '    <i class="fa-solid fa-arrow-left"></i> Back to cart' +
            '</button>' +
            '<form id="checkoutForm" class="checkout-form" novalidate>' +
            '    <div class="checkout-summary">' +
                     summaryRows +
            '        <div class="checkout-summary-row checkout-total-row">' +
            '            <span>Total</span>' +
            '            <span>' + money(cartTotal()) + '</span>' +
            '        </div>' +
            '    </div>' +
            '    <div class="form-group">' +
            '        <label>Full Name</label>' +
            '        <input type="text" name="customer_name" placeholder="Your name" required>' +
            '    </div>' +
            '    <div class="checkout-grid">' +
            '        <div class="form-group">' +
            '            <label>Phone Number</label>' +
            '            <input type="tel" name="phone" placeholder="+256 ..." required>' +
            '        </div>' +
            '        <div class="form-group">' +
            '            <label>Email (optional)</label>' +
            '            <input type="email" name="email" placeholder="you@example.com">' +
            '        </div>' +
            '    </div>' +
            '    <div class="checkout-grid">' +
            '        <div class="form-group">' +
            '            <label>Order Type</label>' +
            '            <select name="order_type" id="orderType" required>' +
            '                <option value="Dine-in">Dine-in</option>' +
            '                <option value="Takeaway">Takeaway</option>' +
            '                <option value="Delivery">Delivery</option>' +
            '            </select>' +
            '        </div>' +
            '        <div class="form-group">' +
            '            <label>Package</label>' +
            '            <select name="package_name">' +
            '                <option value="Individual Meal">Individual Meal</option>' +
            '                <option value="Student Combo">Student Combo</option>' +
            '                <option value="Breakfast Package">Breakfast Package</option>' +
            '                <option value="Lunch Package">Lunch Package</option>' +
            '                <option value="Custom Package">Custom Package</option>' +
            '            </select>' +
            '        </div>' +
            '    </div>' +
            '    <div class="form-group">' +
            '        <label>Location</label>' +
            '        <input type="text" name="location" placeholder="e.g. Main Campus / Hostel / Block A" required>' +
            '        <small class="checkout-help">For Dine-in, your table is assigned automatically by the restaurant.</small>' +
            '    </div>' +
            '    <div class="form-group">' +
            '        <label>Pickup / Delivery Time</label>' +
            '        <select name="pickup_time">' +
            '            <option value="As soon as possible">As soon as possible</option>' +
            '            <option value="In 15 minutes">In 15 minutes</option>' +
            '            <option value="In 30 minutes">In 30 minutes</option>' +
            '            <option value="In 1 hour">In 1 hour</option>' +
            '        </select>' +
            '    </div>' +
            '    <div class="form-group">' +
            '        <label>Notes (optional)</label>' +
            '        <textarea name="notes" rows="2" placeholder="Anything we should know?"></textarea>' +
            '    </div>' +
            '    <p class="checkout-msg" id="checkoutMsg"></p>' +
            '    <button type="submit" class="btn btn-primary checkout-submit-btn" id="checkoutSubmitBtn">' +
            '        <i class="fa-brands fa-whatsapp"></i> Send Order on WhatsApp' +
            '    </button>' +
            '    <p class="checkout-help checkout-notification-note"><i class="fa-brands fa-whatsapp"></i> Your order opens in WhatsApp, ready to send to the restaurant.</p>' +
            '</form>';

        document.getElementById("cartBackBtn").addEventListener("click", function () {
            renderCartView();
            cartFooter.style.display = cart.length ? "block" : "none";
        });

        document.getElementById("checkoutForm").addEventListener("submit", handleCheckoutSubmit);
    }


    /* =====================================================
       CHECKOUT SUBMIT (fetch -> backend)
    ===================================================== */

    function handleCheckoutSubmit(event) {

        event.preventDefault();

        const form = event.target;
        const msgEl = document.getElementById("checkoutMsg");
        const submitBtn = document.getElementById("checkoutSubmitBtn");

        const customerName = form.customer_name.value.trim();
        const phone = form.phone.value.trim();

        if (!customerName || !phone) {
            msgEl.textContent = "Please fill in your name and phone number.";
            msgEl.className = "checkout-msg error";
            return;
        }

        const payload = {
            customer_name: customerName,
            phone: phone,
            email: form.email.value.trim(),
            order_type: form.order_type.value,
            location: form.location.value.trim(),
            package_name: form.package_name.value,
            pickup_time: form.pickup_time.value,
            notes: form.notes.value.trim(),
            items: cart.map(function (item) {
                return {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    qty: item.qty
                };
            })
        };

        msgEl.textContent = "";
        msgEl.className = "checkout-msg";
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Opening WhatsApp...';

        const order = buildOrder(payload);
        const waLink = whatsappOrderLink(order);

        // Remember the order for the confirmation page, then open WhatsApp
        // with the full order already typed in. The customer taps Send.
        saveLastOrder(order, customerName);

        const win = window.open(waLink, "_blank", "noopener");

        renderSuccessView(order.token_number, lastOrderData(order, customerName), waLink, !win);
    }


    /* =====================================================
       ORDER HELPERS (token + WhatsApp message)
    ===================================================== */

    function buildOrder(payload) {

        const now = new Date();
        const pad = function (n) { return String(n).padStart(2, "0"); };
        const day = String(now.getFullYear()).slice(2) + pad(now.getMonth() + 1) + pad(now.getDate());

        // Daily running number kept in this browser, e.g. KU-261110-004
        let seq = 1;
        try {
            const saved = JSON.parse(localStorage.getItem("ku_order_seq") || "{}");
            seq = (saved.day === day ? saved.n : 0) + 1;
            localStorage.setItem("ku_order_seq", JSON.stringify({ day: day, n: seq }));
        } catch (e) {
            seq = Math.floor(Math.random() * 900) + 100;
        }

        const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
        payload.token_number = "KU-" + day + "-" + String(seq).padStart(3, "0") + rand;
        payload.total = payload.items.reduce(function (sum, i) { return sum + i.qty * i.price; }, 0);
        payload.table_number = payload.order_type === "Dine-in" ? "Assigned by restaurant" : null;
        return payload;
    }

    function orderText(order) {
        let t = "NEW ORDER - KU Restaurant\n\n";
        t += "Token: " + order.token_number + "\n";
        t += "Customer: " + order.customer_name + "\nPhone: " + order.phone + "\n";
        if (order.email) { t += "Email: " + order.email + "\n"; }
        t += "Order Type: " + order.order_type + "\nLocation: " + order.location + "\n";
        t += "Package: " + order.package_name + "\nTime: " + order.pickup_time + "\n\nItems:\n";
        order.items.forEach(function (i) {
            t += "- " + i.qty + " x " + i.name + " = " + money(i.qty * i.price) + "\n";
        });
        t += "\nTOTAL: " + money(order.total) + "\n";
        if (order.notes) { t += "Notes: " + order.notes + "\n"; }
        return t;
    }

    function whatsappOrderLink(order) {
        const text = orderText(order);
        if (window.KU_CONFIG && window.KU_CONFIG.whatsappLink) {
            return window.KU_CONFIG.whatsappLink(text);
        }
        return "https://wa.me/256758388351?text=" + encodeURIComponent(text);
    }

    function lastOrderData(order, customerName) {
        return {
            order_ref: order.token_number,
            token_number: order.token_number,
            total: order.total,
            order_type: order.order_type,
            location: order.location,
            table_number: order.table_number,
            email: order.email,
            package_name: order.package_name,
            customer_name: customerName
        };
    }

    function saveLastOrder(order, customerName) {
        try {
            localStorage.setItem("ku_last_order", JSON.stringify(lastOrderData(order, customerName)));
        } catch (e) {}
    }


    /* =====================================================
       RENDER: SUCCESS VIEW
    ===================================================== */

    function renderSuccessView(tokenNumber, orderData, waLink, popupBlocked) {

        cartFooter.style.display = "none";

        const data = orderData || {};

        cartBody.innerHTML =
            '<div class="cart-success">' +
            '    <i class="fa-brands fa-whatsapp"></i>' +
            '    <h4>One last step!</h4>' +
            '    <p>' + (popupBlocked
                ? 'Tap the green button below to open WhatsApp.'
                : 'WhatsApp should have opened with your order ready. If it did not, tap the green button.') +
            ' Press <strong>Send</strong> in WhatsApp to place your order.</p>' +
            '    <a href="' + waLink + '" target="_blank" rel="noopener" class="btn btn-primary checkout-wa-btn"><i class="fa-brands fa-whatsapp"></i> Send Order on WhatsApp</a>' +
            '    <div class="order-token-card">' +
            '        <span>ORDER TOKEN</span>' +
            '        <strong>' + (tokenNumber || "Pending") + '</strong>' +
            '    </div>' +
            '    <div class="order-success-details">' +
            '        <div><span>Package</span><strong>' + (data.package_name || "Individual Meal") + '</strong></div>' +
            '        <div><span>Order type</span><strong>' + (data.order_type || "Dine-in") + '</strong></div>' +
            '        <div><span>Location</span><strong>' + (data.location || "-") + '</strong></div>' +
            '        <div><span>Table</span><strong>' + (data.table_number || "Not required") + '</strong></div>' +
            '    </div>' +
            '    <a href="order-confirmation.html" class="btn btn-light">View Order Summary <i class="fa-solid fa-receipt"></i></a>' +
            '    <button type="button" class="btn btn-light" id="cartDoneBtn">Done</button>' +
            '</div>';

        document.getElementById("cartDoneBtn").addEventListener("click", function () {
            cart = [];
            saveCart();
            updateBadges();
            closeCart();
        });
    }

    /* =====================================================
       ADD-TO-CART BUTTONS (event delegation, works on any page)
    ===================================================== */

    document.addEventListener("click", function (event) {

        const addBtn = event.target.closest(".add-food");

        if (!addBtn) {
            return;
        }

        const id = addBtn.dataset.id;
        const name = addBtn.dataset.name;
        const price = parseFloat(addBtn.dataset.price);

        if (!id || !name || isNaN(price)) {
            return;
        }

        addItem(id, name, price);

        addBtn.classList.add("added");
        window.setTimeout(function () {
            addBtn.classList.remove("added");
        }, 600);

        renderCartView();
        showAddedToast(name);

    });


    /* =====================================================
       "ORDER NOW" NAV BUTTON + BADGES
    ===================================================== */

    function updateBadges() {

        const count = cartCount();

        document.querySelectorAll(".cart-badge").forEach(function (badge) {
            badge.textContent = count;
            badge.classList.toggle("show", count > 0);
        });
    }

    document.querySelectorAll(".nav-order").forEach(function (btn) {

        btn.insertAdjacentHTML(
            "beforeend",
            '<span class="cart-badge">0</span>'
        );

        btn.addEventListener("click", function (event) {
            event.preventDefault();
            renderCartView();
            openCart();
        });

    });

    const startOrderBtn = document.getElementById("startOrderBtn");

    if (startOrderBtn) {
        startOrderBtn.addEventListener("click", function () {
            renderCartView();
            openCart();
        });
    }


    /* =====================================================
       INIT
    ===================================================== */

    renderCartView();
    updateBadges();

});
