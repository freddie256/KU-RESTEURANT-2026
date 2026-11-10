document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       MOBILE NAVIGATION
    ===================================================== */

    const menuToggle =
        document.getElementById("menuToggle");

    const mainNav =
        document.getElementById("mainNav");


    if (menuToggle && mainNav) {

        menuToggle.addEventListener("click", function () {

            const opened =
                mainNav.classList.toggle("show");


            menuToggle.setAttribute(
                "aria-expanded",
                opened
            );


            const icon =
                menuToggle.querySelector("i");


            if (opened) {

                icon.classList.remove("fa-bars");

                icon.classList.add("fa-xmark");

            } else {

                icon.classList.remove("fa-xmark");

                icon.classList.add("fa-bars");

            }

        });


        /* Close menu after clicking a link */

        mainNav.querySelectorAll("a").forEach(function (link) {

            link.addEventListener("click", function () {

                mainNav.classList.remove("show");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );


                const icon =
                    menuToggle.querySelector("i");


                icon.classList.remove("fa-xmark");

                icon.classList.add("fa-bars");

            });

        });

    }



    /* =====================================================
       GET SELECTED EVENT
    ===================================================== */

    const selectedEvent =
        document.getElementById("selectedEvent");


    const eventType =
        document.getElementById("eventType");


    if (selectedEvent) {

        const urlParams =
            new URLSearchParams(
                window.location.search
            );


        const event =
            urlParams.get("event");


        if (event) {

            selectedEvent.textContent =
                event;


            if (eventType) {

                eventType.value =
                    event;

            }

        }

    }



    /* =====================================================
       EVENT TYPE CHANGE
    ===================================================== */

    if (eventType) {

        eventType.addEventListener(
            "change",
            function () {

                if (selectedEvent) {

                    selectedEvent.textContent =
                        this.value ||
                        "Social Event";

                }

            }
        );

    }



    /* =====================================================
       BOOKING FORM
    ===================================================== */

    const form =
        document.getElementById(
            "eventBookingForm"
        );


    const success =
        document.getElementById(
            "successMessage"
        );


    if (form) {

        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                if (!form.checkValidity()) {

                    form.reportValidity();

                    return;

                }


                form.style.display =
                    "none";


                if (success) {

                    success.style.display =
                        "block";


                    success.scrollIntoView({
                        behavior: "smooth"
                    });

                }

            }
        );

    }



    /* =====================================================
       NAV - SOCIAL EVENTS DROPDOWN
    ===================================================== */

    const navDropdowns =
        document.querySelectorAll(".nav-dropdown");

    navDropdowns.forEach(function (dropdown) {

        const caret =
            dropdown.querySelector(".dropdown-caret");

        if (!caret) {
            return;
        }

        caret.addEventListener("click", function (event) {

            event.preventDefault();
            event.stopPropagation();

            const isOpen =
                dropdown.classList.toggle("open");

            caret.setAttribute(
                "aria-expanded",
                isOpen
            );

        });

    });


    document.addEventListener("click", function (event) {

        navDropdowns.forEach(function (dropdown) {

            if (!dropdown.contains(event.target)) {

                dropdown.classList.remove("open");

                const caret =
                    dropdown.querySelector(".dropdown-caret");

                if (caret) {
                    caret.setAttribute("aria-expanded", "false");
                }

            }

        });

    });



    /* =====================================================
       MENU CATEGORY TABS
    ===================================================== */

    const menuTabs =
        document.querySelectorAll(".menu-tab");

    const foodCards =
        document.querySelectorAll(".food-card[data-category]");

    if (menuTabs.length) {

        menuTabs.forEach(function (tab) {

            tab.addEventListener("click", function () {

                menuTabs.forEach(function (t) {
                    t.classList.remove("active");
                });

                tab.classList.add("active");

                const filter =
                    tab.dataset.filter;

                foodCards.forEach(function (card) {

                    const show =
                        filter === "all" ||
                        card.dataset.category === filter;

                    card.style.display =
                        show ? "" : "none";

                });

            });

        });

    }



    /* =====================================================
       SOCIAL EVENTS - HIDDEN EVENT PANELS
    ===================================================== */

    const seGridWrap =
        document.getElementById("seGridWrap");

    const sePanels =
        document.getElementById("sePanels");

    const seCards =
        document.querySelectorAll(".se-card");

    const allSePanels =
        document.querySelectorAll(".se-panel");

    const backToEvents =
        document.getElementById("backToEvents");


    function showEventPanel(key) {

        if (!sePanels || !seGridWrap) {
            return;
        }

        let found = false;

        allSePanels.forEach(function (panel) {

            if (panel.dataset.panel === key) {

                panel.classList.add("active");
                found = true;

            } else {

                panel.classList.remove("active");

            }

        });

        if (!found) {
            return;
        }

        seGridWrap.style.display = "none";
        sePanels.classList.add("active");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        if (history.replaceState) {
            history.replaceState(null, "", "#" + key);
        }

    }


    function showEventGrid() {

        if (!sePanels || !seGridWrap) {
            return;
        }

        sePanels.classList.remove("active");
        seGridWrap.style.display = "";

        if (history.replaceState) {
            history.replaceState(
                null,
                "",
                window.location.pathname
            );
        }

        seGridWrap.scrollIntoView({
            behavior: "smooth"
        });

    }


    if (seCards.length) {

        seCards.forEach(function (card) {

            card.addEventListener("click", function () {
                showEventPanel(card.dataset.event);
            });

        });

    }



    /* =====================================================
       SOCIAL EVENTS - INTERACTIVE HIGHLIGHT PILLS
    ===================================================== */

    const sePillButtons =
        document.querySelectorAll(".se-pill");

    if (sePillButtons.length) {

        sePillButtons.forEach(function (pill) {

            pill.addEventListener("click", function () {

                const panel =
                    pill.closest(".se-panel");

                if (!panel) {
                    return;
                }

                const infoBox =
                    panel.querySelector(".se-pill-info");

                const panelPills =
                    panel.querySelectorAll(".se-pill");

                panelPills.forEach(function (p) {
                    p.classList.remove("active");
                });

                pill.classList.add("active");

                if (infoBox) {

                    infoBox.textContent =
                        pill.dataset.info ||
                        "Tap a highlight above to see what it includes.";

                    infoBox.classList.remove("just-updated");

                    // restart the animation
                    void infoBox.offsetWidth;

                    infoBox.classList.add("just-updated");

                }

            });

        });

    }



    /* =====================================================
       SOCIAL EVENTS - QUICK-SELECT DROPDOWN
    ===================================================== */

    const seQuickSelect =
        document.getElementById("seQuickSelect");

    const seSelectToggle =
        document.getElementById("seSelectToggle");

    const seSelectItems =
        document.querySelectorAll(".se-select-item");


    if (seQuickSelect && seSelectToggle) {

        seSelectToggle.addEventListener("click", function (event) {

            event.stopPropagation();

            const isOpen =
                seQuickSelect.classList.toggle("open");

            seSelectToggle.setAttribute(
                "aria-expanded",
                isOpen
            );

        });


        document.addEventListener("click", function (event) {

            if (!seQuickSelect.contains(event.target)) {

                seQuickSelect.classList.remove("open");

                seSelectToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        });

    }


    if (seSelectItems.length) {

        seSelectItems.forEach(function (item) {

            item.addEventListener("click", function () {

                showEventPanel(item.dataset.event);

                if (seQuickSelect) {
                    seQuickSelect.classList.remove("open");
                }

                if (seSelectToggle) {
                    seSelectToggle.setAttribute("aria-expanded", "false");
                }

            });

        });

    }


    if (backToEvents) {

        backToEvents.addEventListener(
            "click",
            showEventGrid
        );

    }


    if (sePanels) {

        const requestedEvent =
            window.location.hash.replace("#", "");

        if (requestedEvent) {
            showEventPanel(requestedEvent);
        }


        window.addEventListener("hashchange", function () {

            const key =
                window.location.hash.replace("#", "");

            if (key) {
                showEventPanel(key);
            } else {
                showEventGrid();
            }

        });

    }

});
