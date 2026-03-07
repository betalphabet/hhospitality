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
    const videoSection = document.getElementById('videoSection');

    function detectLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('zh')) {
            return browserLang.toLowerCase() === 'zh-tw' ? 'zh' : 'zh-cn';
        }
        return 'en';
    }

    function updateSelects(lang) {
        if (langSelect) langSelect.value = lang;
        if (langSelectDesktop) langSelectDesktop.value = lang;
    }

    function updateContent() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (typeof i18next !== 'undefined') {
                element.innerHTML = i18next.t(key);
            }
        });

        if (videoSection) {
            if (i18next.language === 'zh') {
                videoSection.style.display = 'block';
            } else {
                videoSection.style.display = 'none';
            }
        }
    }

    function setLanguage(lang) {
        localStorage.setItem('userLanguage', lang.toLowerCase());
        updateSelects(lang);

        if (typeof i18next !== 'undefined') {
            i18next.changeLanguage(lang, (err, t) => {
                if (err) return console.log('something went wrong loading', err);
                updateContent();
            });
        }
    }

    function handleLanguageChange(event) {
        const selectedLang = event.target.value;
        setLanguage(selectedLang);
    }

    if (langSelect) langSelect.addEventListener('change', handleLanguageChange);
    if (langSelectDesktop) langSelectDesktop.addEventListener('change', handleLanguageChange);

    // Determine initial language
    const userLang = localStorage.getItem('userLanguage') || detectLanguage();

    // Update selects immediately to reflect current language
    updateSelects(userLang);

    if (typeof i18next !== 'undefined') {
        i18next
            .use(i18nextXHRBackend)
            .use(i18nextBrowserLanguageDetector)
            .init({
                fallbackLng: 'en',
                lng: userLang,
                debug: true,
                backend: {
                    loadPath: 'locales/{{lng}}/translation.json'
                }
            }, function (err, t) {
                if (err) return console.log('something went wrong loading', err);
                // Ensure content is updated after init
                updateContent();
                // Also ensure selects are in sync (redundant but safe)
                updateSelects(userLang);
            });
    }
});


document.addEventListener('DOMContentLoaded', function () {
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
