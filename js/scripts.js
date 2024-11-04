/*!
* Start Bootstrap - Grayscale v7.0.6 (https://startbootstrap.com/theme/grayscale)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-grayscale/blob/master/LICENSE)
*/
//
// Scripts
// 

document.addEventListener('DOMContentLoaded', function () {
    const langSelect = document.getElementById('langSelect');
    const langSelectDesktop = document.getElementById('langSelectDesktop');

    function detectLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('zh')) {
            return browserLang.toLowerCase() === 'zh-tw' ? 'zh' : 'zh-cn';
        }
        return 'en';
    }

    function setLanguage(lang) {
        localStorage.setItem('userLanguage', lang.toLowerCase());
        i18next.changeLanguage(lang, (err, t) => {
            if (err) return console.log('something went wrong loading', err);
            updateContent();
            updateSelects(lang);
        });
    }

    function handleLanguageChange(event) {
        const selectedLang = event.target.value;
        setLanguage(selectedLang);
    }

    function updateSelects(lang) {
        langSelect.value = lang;
        langSelectDesktop.value = lang;
    }

    langSelect.addEventListener('change', handleLanguageChange);
    langSelectDesktop.addEventListener('change', handleLanguageChange);

    const userLang = localStorage.getItem('userLanguage');

    i18next
        .use(i18nextXHRBackend)
        .use(i18nextBrowserLanguageDetector)
        .init({
            fallbackLng: 'en',
            lng: userLang || detectLanguage(), // 預設載入 userLang（如果有值）
            debug: true,
            backend: {
                loadPath: 'locales/{{lng}}/translation.json'
            }
        }, function(err, t) {
            if (err) return console.log('something went wrong loading', err);
            const savedLang = userLang || detectLanguage();
            setLanguage(savedLang);
        });

    function updateContent() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.innerHTML = i18next.t(key);
        });
    }
});


document.addEventListener('DOMContentLoaded', function() {
    let lastScrollTop = 0;
    const navbar = document.getElementById('mainNav');
    const scrollThreshold = 100;

    function handleScroll() {
        if (window.innerWidth > 991) {
            let currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (currentScrollTop > lastScrollTop && currentScrollTop > scrollThreshold) {
                // Scrolling down
                navbar.style.transform = 'translateY(-100%)';
                navbar.style.transition = 'transform 0.3s ease-out';
            } else {
                // Scrolling up or at the top
                navbar.style.transform = 'translateY(0)';
                navbar.style.transition = 'transform 0.3s ease-out';
            }

            // Set background color based on scroll position
            if (currentScrollTop <= 0) {
                navbar.style.backgroundColor = 'transparent';
            } else {
                navbar.style.backgroundColor = 'black';
            }

            lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
        }
    }

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    // Initial call to set correct state on page load
    handleScroll();
});
