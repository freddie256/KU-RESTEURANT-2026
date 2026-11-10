document.addEventListener("DOMContentLoaded", function () {
    const search = document.getElementById("menuSearch");
    const count = document.getElementById("menuResultCount");
    const cards = Array.from(document.querySelectorAll(".food-card[data-category]"));
    const tabs = Array.from(document.querySelectorAll(".menu-tab"));
    let activeFilter = "all";

    function applyMenuFilter() {
        const term = (search ? search.value : "").trim().toLowerCase();
        let visible = 0;

        cards.forEach(function (card) {
            const category = card.dataset.category || "";
            const text = card.textContent.toLowerCase();
            const matchesCategory = activeFilter === "all" || category === activeFilter;
            const matchesSearch = !term || text.includes(term);
            const show = matchesCategory && matchesSearch;

            card.style.display = show ? "" : "none";
            if (show) visible++;
        });

        if (count) {
            count.textContent = visible + (visible === 1 ? " item" : " items") + " available";
        }
    }

    tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            activeFilter = tab.dataset.filter || "all";
            applyMenuFilter();
        });
    });

    if (search) search.addEventListener("input", applyMenuFilter);

    // If we arrived from a link like menu.html?category=snacks,
    // open straight to that tab instead of "All".
    var requestedCategory = new URLSearchParams(window.location.search).get("category");
    var matchingTab = requestedCategory
        ? tabs.find(function (t) { return t.dataset.filter === requestedCategory; })
        : null;

    if (matchingTab) {
        matchingTab.click();
    } else {
        applyMenuFilter();
    }
});
