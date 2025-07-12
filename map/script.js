class DraggableMap {
    constructor() {
        this.mapContainer = document.querySelector('.map-container');
        this.mapWrapper = document.querySelector('.map-wrapper');
        this.mapImage = document.querySelector('.map-image');
        this.markersContainer = document.querySelector('.markers-container');
        
        // 拖曳狀態
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        
        // 慣性滾動相關
        this.velocityX = 0;
        this.velocityY = 0;
        this.lastMoveTime = 0;
        this.lastMoveX = 0;
        this.lastMoveY = 0;
        this.isInertiaScrolling = false;
        
        // 地圖尺寸 (scale 0.5 後的實際佔用空間)
        this.mapWidth = 2800;  // 5600 * 0.5
        this.mapHeight = 1200; // 2400 * 0.5
        
        // 拖曳性能優化
        this.rafId = null;
        
        // 標記資料
        this.markersData = [];
        
        this.init();
    }
    
    init() {
        // 設定初始位置（居中顯示）
        this.centerMap();
        
        // 綁定事件
        this.bindEvents();
        
        // 載入標記資料
        this.loadMarkersData();
        
        // 圖片載入完成後移除載入提示
        this.mapImage.addEventListener('load', () => {
            this.mapImage.classList.add('loaded');
        });
    }
    
    // 載入標記資料
    async loadMarkersData() {
        try {
            const response = await fetch('https://hhospitality.group/map/data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.markersData = await response.json();
            this.createMarkers();
        } catch (error) {
            console.error('載入標記資料失敗:', error);
        }
    }
    
    // 創建標記
    createMarkers() {
        this.markersContainer.innerHTML = '';
        
        this.markersData.forEach(marker => {
            const markerElement = document.createElement('div');
            markerElement.className = 'marker';
            markerElement.style.left = `${marker.image_x_position}px`;
            markerElement.style.top = `${marker.image_y_position}px`;
            markerElement.style.width = `${marker.image.file_width * marker.image_scale}px`;
            markerElement.style.height = `${marker.image.file_height * marker.image_scale}px`;
            
            const img = document.createElement('img');
            img.src = `images/${marker.image.file_name}`;
            img.alt = marker.name;
            img.draggable = false;
            
            markerElement.appendChild(img);
            
            // 添加點擊事件
            markerElement.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showTooltip(marker);
            });
            
            this.markersContainer.appendChild(markerElement);
        });
    }
    
    // 顯示tooltip
    showTooltip(marker) {
        const tooltip = document.getElementById('tooltip');
        const overlay = this.createOverlay();
        
        // 填充tooltip內容
        tooltip.querySelector('.tooltip-title').textContent = marker.name;
        tooltip.querySelector('.tooltip-image').src = `images/${marker.image.file_name}`;
        tooltip.querySelector('.tooltip-image').alt = marker.name;
        tooltip.querySelector('.tooltip-address').textContent = marker.address || '地址未提供';
        
        // 創建按鈕
        const buttonsContainer = tooltip.querySelector('.tooltip-buttons');
        buttonsContainer.innerHTML = '';
        
        marker.custom_button_links.forEach(button => {
            if (button.is_enabled) {
                const buttonElement = document.createElement('a');
                buttonElement.href = button.link.trim();
                buttonElement.className = 'tooltip-button';
                buttonElement.textContent = button.name;
                buttonElement.target = '_blank';
                buttonsContainer.appendChild(buttonElement);
            }
        });
        
        // 顯示tooltip和遮罩
        document.body.appendChild(overlay);
        overlay.classList.add('show');
        tooltip.classList.add('show');
        
        // 綁定關閉事件
        const closeTooltip = () => {
            tooltip.classList.remove('show');
            overlay.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
            }, 300);
        };
        
        tooltip.querySelector('.tooltip-close').onclick = closeTooltip;
        overlay.onclick = closeTooltip;
        
        // ESC鍵關閉
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeTooltip();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    }
    
    // 創建遮罩層
    createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'tooltip-overlay';
        return overlay;
    }
    
    centerMap() {
        const containerRect = this.mapContainer.getBoundingClientRect();
        const centerX = (containerRect.width - this.mapWidth) / 2;
        const centerY = (containerRect.height - this.mapHeight) / 2;
        
        this.currentX = Math.max(Math.min(centerX, 0), containerRect.width - this.mapWidth);
        this.currentY = Math.max(Math.min(centerY, 0), containerRect.height - this.mapHeight);
        
        this.updateMapPosition();
    }
    
    bindEvents() {
        // 滑鼠事件
        this.mapContainer.addEventListener('mousedown', this.handleStart.bind(this));
        document.addEventListener('mousemove', this.handleMove.bind(this));
        document.addEventListener('mouseup', this.handleEnd.bind(this));
        
        // 觸控事件
        this.mapContainer.addEventListener('touchstart', this.handleStart.bind(this));
        document.addEventListener('touchmove', this.handleMove.bind(this));
        document.addEventListener('touchend', this.handleEnd.bind(this));
        
        // 防止右鍵選單
        this.mapContainer.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // 視窗大小改變時重新居中
        window.addEventListener('resize', () => {
            this.centerMap();
        });
    }
    
    handleStart(e) {
        // 停止慣性滾動
        if (this.isInertiaScrolling) {
            this.stopInertiaScroll();
        }
        
        this.isDragging = true;
        this.mapContainer.style.cursor = 'grabbing';
        
        const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
        
        this.startX = clientX - this.currentX;
        this.startY = clientY - this.currentY;
        
        // 重置速度追蹤變數
        this.velocityX = 0;
        this.velocityY = 0;
        this.lastMoveTime = Date.now();
        this.lastMoveX = clientX;
        this.lastMoveY = clientY;
        
        e.preventDefault();
    }
    
    handleMove(e) {
        if (!this.isDragging) return;
        
        const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
        
        // 計算速度 (用於慣性滾動)
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastMoveTime;
        
        if (deltaTime > 0) {
            this.velocityX = (clientX - this.lastMoveX) / deltaTime;
            this.velocityY = (clientY - this.lastMoveY) / deltaTime;
        }
        
        this.lastMoveTime = currentTime;
        this.lastMoveX = clientX;
        this.lastMoveY = clientY;
        
        const newX = clientX - this.startX;
        const newY = clientY - this.startY;
        
        this.currentX = this.constrainX(newX);
        this.currentY = this.constrainY(newY);
        
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        
        this.rafId = requestAnimationFrame(() => {
            this.updateMapPosition();
        });
        
        e.preventDefault();
    }
    
    handleEnd(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.mapContainer.style.cursor = 'grab';
        
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        
        // 檢查是否需要開始慣性滾動
        const minVelocity = 0.1;
        if (Math.abs(this.velocityX) > minVelocity || Math.abs(this.velocityY) > minVelocity) {
            this.startInertiaScroll();
        }
        
        e.preventDefault();
    }
    
    // 開始慣性滾動
    startInertiaScroll() {
        this.isInertiaScrolling = true;
        this.inertiaScroll();
    }
    
    // 慣性滾動動畫
    inertiaScroll() {
        if (!this.isInertiaScrolling) return;
        
        // 應用摩擦力
        this.velocityX *= 0.95;
        this.velocityY *= 0.95;
        
        // 更新位置
        this.currentX = this.constrainX(this.currentX + this.velocityX * 16);
        this.currentY = this.constrainY(this.currentY + this.velocityY * 16);
        
        this.updateMapPosition();
        
        // 檢查是否繼續滾動
        if (Math.abs(this.velocityX) > 0.01 || Math.abs(this.velocityY) > 0.01) {
            requestAnimationFrame(() => this.inertiaScroll());
        } else {
            this.stopInertiaScroll();
        }
    }
    
    // 停止慣性滾動
    stopInertiaScroll() {
        this.isInertiaScrolling = false;
        this.velocityX = 0;
        this.velocityY = 0;
    }
    
    constrainX(x) {
        const containerWidth = this.mapContainer.clientWidth;
        return Math.max(Math.min(x, 0), containerWidth - this.mapWidth);
    }
    
    constrainY(y) {
        const containerHeight = this.mapContainer.clientHeight;
        return Math.max(Math.min(y, 0), containerHeight - this.mapHeight);
    }
    
    updateMapPosition() {
        this.mapWrapper.style.transform = `translate(${this.currentX}px, ${this.currentY}px)`;
    }
    

}

// 初始化地圖
document.addEventListener('DOMContentLoaded', () => {
    new DraggableMap();
});