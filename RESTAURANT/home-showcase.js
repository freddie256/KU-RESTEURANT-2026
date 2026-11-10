document.addEventListener("DOMContentLoaded", function () {
    /* Compact GOOD FOOD / GOOD MOMENTS / GREAT MEMORIES sequence */
    var heroLines = document.querySelectorAll(".ku-message-line");
    var heroIndex = 0;

    if (heroLines.length > 1) {
        setInterval(function () {
            heroLines[heroIndex].classList.remove("is-active");
            heroIndex = (heroIndex + 1) % heroLines.length;
            heroLines[heroIndex].classList.add("is-active");
        }, 2800);
    }

    /* Image-only food showcase: 2 meals, 2 drinks, 2 snacks, 1 breakfast. */
    var showcase = document.getElementById("kuFoodShowcase");
    if (!showcase) return;

    var slides = [
        {
            category: "MEALS",
            title: "Fresh, filling meals",
            description: "Warm plates prepared for busy campus days — satisfying food that keeps you going from one class to the next.",
            image: "images/rich-beef.jpg",
            alt: "Rich beef meal served at KU Restaurant",
            link: "menu.html#meals"
        },
        {
            category: "MEALS",
            title: "Comfort on every plate",
            description: "Rice, pilau and hearty favourites made for students who want a proper meal without slowing down their day.",
            image: "images/pilau.jpg",
            alt: "Pilau meal at KU Restaurant",
            link: "menu.html#meals"
        },
        {
            category: "DRINKS",
            title: "Freshness in every sip",
            description: "Refreshing drinks for a quick cool-down between lectures, meetings and campus activities.",
            image: "images/juice.jpg",
            alt: "Fresh juice at KU Restaurant",
            link: "menu.html#drinks"
        },
        {
            category: "DRINKS",
            title: "Cool, simple and refreshing",
            description: "Chilled drinks that pair easily with your meal or give you a refreshing break during a busy campus day.",
            image: "images/soda.jpg",
            alt: "Refreshing chilled drink at KU Restaurant",
            link: "menu.html#drinks"
        },
        {
            category: "SNACKS",
            title: "Quick bites between classes",
            description: "Samosas and other easy campus favourites when you need something tasty without a full meal.",
            image: "images/samo.jpg",
            alt: "Samosa snack at KU Restaurant",
            link: "menu.html#snacks"
        },
        {
            category: "SNACKS",
            title: "A little something sweet",
            description: "Donuts and sweet bites for those moments when you want a quick treat with your drink or after a meal.",
            image: "images/donuts.jpg",
            alt: "Sweet donuts at KU Restaurant",
            link: "menu.html#snacks"
        },
        {
            category: "BREAKFAST",
            title: "Start your day well",
            description: "A simple, satisfying breakfast to help you begin lectures, work and campus life with energy.",
            image: "images/millet.jpg",
            alt: "Breakfast at KU Restaurant",
            link: "menu.html#breakfast"
        }
    ];

    var image = document.getElementById("kuShowcaseImage");
    var category = document.getElementById("kuShowcaseCategory");
    var title = document.getElementById("kuShowcaseTitle");
    var description = document.getElementById("kuShowcaseDescription");
    var link = document.getElementById("kuShowcaseLink");
    var progress = document.getElementById("kuShowcaseProgress");
    var index = 0;
    var changing = false;

    slides.forEach(function (slide) {
        var preload = new Image();
        preload.src = slide.image;
    });

    slides.forEach(function (_, i) {
        var dot = document.createElement("span");
        dot.className = "ku-showcase-dot" + (i === 0 ? " active" : "");
        progress.appendChild(dot);
    });

    var dots = progress.querySelectorAll(".ku-showcase-dot");

    function changeSlide(nextIndex) {
        if (changing) return;
        changing = true;
        showcase.classList.add("is-changing");

        setTimeout(function () {
            var slide = slides[nextIndex];
            image.src = slide.image;
            image.alt = slide.alt;
            category.textContent = slide.category;
            title.textContent = slide.title;
            description.textContent = slide.description;
            link.href = slide.link;

            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === nextIndex);
            });

            showcase.classList.remove("is-changing");
            index = nextIndex;
            changing = false;
        }, 420);
    }

    setInterval(function () {
        changeSlide((index + 1) % slides.length);
    }, 4200);
});
