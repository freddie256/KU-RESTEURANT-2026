document.addEventListener("DOMContentLoaded", function () {
    const filters = document.querySelectorAll(".gallery-filter");
    const items = document.querySelectorAll(".gallery-item");
    const modal = document.getElementById("lightbox");
    const modalImage = document.getElementById("lightboxImage");
    const modalTitle = document.getElementById("lightboxTitle");
    const close = document.getElementById("lightboxClose");

    filters.forEach(function (filter) {
        filter.addEventListener("click", function () {
            filters.forEach(f => f.classList.remove("active"));
            filter.classList.add("active");
            const value = filter.dataset.filter || "all";

            items.forEach(function (item) {
                const show = value === "all" || item.dataset.category === value;
                item.style.display = show ? "" : "none";
            });
        });
    });

    function openLightbox(item) {
        if (!modal || !modalImage) return;
        const img = item.querySelector("img");
        const title = item.querySelector("h3");
        if (!img) return;

        modalImage.src = img.src;
        modalImage.alt = img.alt || "Gallery image";
        if (modalTitle) modalTitle.textContent = title ? title.textContent : img.alt;
        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("lightbox-open");
    }

    items.forEach(function (item) {
        const button = item.querySelector(".gallery-view");
        if (button) button.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            openLightbox(item);
        });

        item.addEventListener("dblclick", function () {
            openLightbox(item);
        });
    });

    function closeLightbox() {
        if (!modal) return;
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("lightbox-open");
    }

    if (close) close.addEventListener("click", closeLightbox);
    if (modal) modal.addEventListener("click", function (e) {
        if (e.target === modal) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeLightbox();
    });
});
