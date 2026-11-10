/**
 * KU Restaurant - Contact settings
 *
 * Change your WhatsApp number or email HERE and every WhatsApp button,
 * the "Order Now" checkout, and the contact page all update together.
 */

window.KU_CONFIG = {

    // Your WhatsApp number, exactly as you'd write it locally.
    // (Leading 0 is converted to Uganda's +256 automatically.)
    whatsappLocal: "0758388351",

    // The email that receives orders sent by email.
    orderEmail: "sizoomuderick59@gmail.com",

    // Uganda country code (used to turn 07... into 2567...)
    countryCode: "256"
};

(function () {

    var cfg = window.KU_CONFIG;

    // Digits only, international format, e.g. 0758... -> 256758...
    var digits = String(cfg.whatsappLocal).replace(/\D/g, "");

    if (digits.indexOf("0") === 0) {
        digits = cfg.countryCode + digits.slice(1);
    }

    cfg.whatsappInternational = digits;

    // Builds a direct chat link to your WhatsApp, with an optional
    // pre-filled message.
    cfg.whatsappLink = function (message) {
        var url = "https://wa.me/" + cfg.whatsappInternational;
        return message ? url + "?text=" + encodeURIComponent(message) : url;
    };

    // Any element marked data-whatsapp opens a chat with you directly.
    document.addEventListener("DOMContentLoaded", function () {

        document.querySelectorAll("[data-whatsapp]").forEach(function (el) {
            var msg = el.getAttribute("data-whatsapp-msg") ||
                "Hello KU Restaurant! I'd like to make an enquiry.";
            el.setAttribute("href", cfg.whatsappLink(msg));
            el.setAttribute("target", "_blank");
            el.setAttribute("rel", "noopener");
        });

        // Any element marked data-whatsapp-text shows your number.
        document.querySelectorAll("[data-whatsapp-text]").forEach(function (el) {
            el.textContent = cfg.whatsappLocal;
        });

        // Any element marked data-order-email links to your email.
        document.querySelectorAll("[data-order-email]").forEach(function (el) {
            el.setAttribute("href", "mailto:" + cfg.orderEmail);
        });
    });

})();
