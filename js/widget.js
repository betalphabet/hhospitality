(function () {
    // Prevent duplicate initialization
    if (document.getElementById('hh-widget-container')) return;

    // Create container
    const container = document.createElement('div');
    container.id = 'hh-widget-container';
    document.body.appendChild(container);

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = `
        .hh-widget-fab {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background-color: #c2b49a; /* Primary Color */
            color: white;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 9999;
            transition: transform 0.3s ease, background-color 0.3s;
            font-size: 24px;
        }
        .hh-widget-fab:hover {
            transform: scale(1.1);
            background-color: #a39680;
        }
        .hh-widget-popup {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 300px;
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
            padding: 20px;
            z-index: 9998;
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px);
            transition: all 0.3s ease;
            font-family: 'Varela Round', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        .hh-widget-popup.active {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        .hh-widget-header {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }
        .hh-widget-btn {
            display: block;
            width: 100%;
            padding: 12px;
            margin-bottom: 10px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.2s;
            text-align: center;
            text-decoration: none;
            box-sizing: border-box;
        }
        .hh-widget-btn-primary {
            background-color: #7464a1; /* Secondary Color */
            color: white;
        }
        .hh-widget-btn-primary:hover {
            background-color: #5d5081;
            color: white;
        }
        .hh-widget-btn-secondary {
            background-color: #f8f9fa;
            color: #333;
            border: 1px solid #ddd;
        }
        .hh-widget-btn-secondary:hover {
            background-color: #e2e6ea;
            color: #333;
        }
        .hh-discount-display {
            background-color: #f0f8ff;
            border: 1px dashed #7464a1;
            padding: 10px;
            border-radius: 6px;
            text-align: center;
            margin-top: 10px;
            display: none;
        }
        .hh-discount-code {
            font-weight: bold;
            color: #7464a1;
            font-size: 14px;
            word-break: break-all;
            margin-bottom: 5px;
            display: block;
        }
        .hh-copy-hint {
            font-size: 12px;
            color: #666;
            display: block;
        }
        /* Mobile adjustment */
        @media (max-width: 576px) {
            .hh-widget-popup {
                width: calc(100% - 40px);
                right: 20px;
                left: 20px;
            }
        }
    `;
    document.head.appendChild(style);

    // Create FAB
    const fab = document.createElement('div');
    fab.className = 'hh-widget-fab';
    fab.innerHTML = '<i class="fas fa-gift"></i>'; // Using FontAwesome gift icon
    fab.title = "Special Offers";
    container.appendChild(fab);

    // Create Popup
    const popup = document.createElement('div');
    popup.className = 'hh-widget-popup';
    popup.innerHTML = `
        <div class="hh-widget-header">
            Special Offers
            <span style="float: right; cursor: pointer; color: #999;" id="hh-close-popup">&times;</span>
        </div>
        <a href="hotel.html" class="hh-widget-btn hh-widget-btn-primary">
            <i class="fas fa-calendar-check" style="margin-right: 8px;"></i>Book Now
        </a>
        <button class="hh-widget-btn hh-widget-btn-secondary" id="hh-discount-btn">
            <i class="fas fa-tag" style="margin-right: 8px;"></i>Get Discount
        </button>
        <div class="hh-discount-display" id="hh-discount-content">
            <span class="hh-discount-code">hhospitalitygroup2026</span>
            <span class="hh-copy-hint">Click to copy</span>
        </div>
    `;
    container.appendChild(popup);

    // Event Listeners
    const closeBtn = popup.querySelector('#hh-close-popup');
    const discountBtn = popup.querySelector('#hh-discount-btn');
    const discountContent = popup.querySelector('#hh-discount-content');
    const discountCode = popup.querySelector('.hh-discount-code');

    // Toggle Popup
    fab.addEventListener('click', (e) => {
        e.stopPropagation();
        popup.classList.toggle('active');
        // Reset discount view when reopening
        if (!popup.classList.contains('active')) {
            // Optional: reset state? No, keep it if user wants to see it again.
        }
    });

    // Close Popup
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        popup.classList.remove('active');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!popup.contains(e.target) && !fab.contains(e.target)) {
            popup.classList.remove('active');
        }
    });

    // Handle Discount Button
    discountBtn.addEventListener('click', () => {
        discountBtn.style.display = 'none';
        discountContent.style.display = 'block';
    });

    // Copy to Clipboard
    discountContent.addEventListener('click', () => {
        const code = discountCode.textContent;
        navigator.clipboard.writeText(code).then(() => {
            const originalText = discountCode.nextElementSibling.textContent;
            discountCode.nextElementSibling.textContent = "Copied!";
            setTimeout(() => {
                discountCode.nextElementSibling.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    });

})();
