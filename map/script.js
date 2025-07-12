class DraggableMap {
    constructor() {
        this.mapContainer = document.querySelector('.map-container');
        this.mapWrapper = document.querySelector('.map-wrapper');
        this.mapImage = document.querySelector('.map-image');
        
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
        this.mapHeight = 2100; // 2400 * 0.5
        
        // 拖曳性能優化
        this.rafId = null;
        
        this.init();
    }
    
    init() {
        // 設定初始位置（居中顯示）
        this.centerMap();
        
        // 綁定事件
        this.bindEvents();
        
        // 圖片載入完成後移除載入提示
        this.mapImage.addEventListener('load', () => {
            this.mapImage.classList.add('loaded');
        });
    }
    
    centerMap() {
        const containerWidth = this.mapContainer.clientWidth;
        const containerHeight = this.mapContainer.clientHeight;
        
        // 計算居中位置
        this.currentX = (containerWidth - this.mapWidth) / 2;
        this.currentY = (containerHeight - this.mapHeight) / 2;
        
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
        this.isDragging = true;
        this.isInertiaScrolling = false; // 停止慣性滾動
        this.mapContainer.classList.add('dragging');
        
        const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
        
        this.startX = clientX - this.currentX;
        this.startY = clientY - this.currentY;
        
        // 重置速度追蹤
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
        const currentTime = Date.now();
        
        // 計算速度
        const deltaTime = currentTime - this.lastMoveTime;
        if (deltaTime > 0) {
            this.velocityX = (clientX - this.lastMoveX) / deltaTime;
            this.velocityY = (clientY - this.lastMoveY) / deltaTime;
        }
        
        this.currentX = clientX - this.startX;
        this.currentY = clientY - this.startY;
        
        // 限制拖曳範圍
        this.constrainPosition();
        
        // 使用 requestAnimationFrame 優化性能
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        
        this.rafId = requestAnimationFrame(() => {
            this.updateMapPosition();
        });
        
        // 更新追蹤變數
        this.lastMoveTime = currentTime;
        this.lastMoveX = clientX;
        this.lastMoveY = clientY;
        
        e.preventDefault();
    }
    
    handleEnd(e) {
        this.isDragging = false;
        this.mapContainer.classList.remove('dragging');
        
        // 清理 requestAnimationFrame
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        
        // 啟動慣性滾動（如果速度足夠）
        const minVelocity = 0.1; // 最小速度閾值
        if (Math.abs(this.velocityX) > minVelocity || Math.abs(this.velocityY) > minVelocity) {
            this.startInertiaScroll();
        }
        
        e.preventDefault();
    }
    
    constrainPosition() {
        const containerWidth = this.mapContainer.clientWidth;
        const containerHeight = this.mapContainer.clientHeight;
        
        // 限制X軸移動範圍
        const maxX = 0;
        const minX = containerWidth - this.mapWidth;
        this.currentX = Math.max(minX, Math.min(maxX, this.currentX));
        
        // 限制Y軸移動範圍
        const maxY = 0;
        const minY = containerHeight - this.mapHeight;
        this.currentY = Math.max(minY, Math.min(maxY, this.currentY));
    }
    
    updateMapPosition() {
        this.mapWrapper.style.transform = `translate(${this.currentX}px, ${this.currentY}px)`;
    }
    
    startInertiaScroll() {
        this.isInertiaScrolling = true;
        this.inertiaScroll();
    }
    
    inertiaScroll() {
        if (!this.isInertiaScrolling) return;
        
        // 摩擦係數（越小滑動越久）
        const friction = 0.95;
        const minVelocity = 0.01;
        
        // 應用摩擦力
        this.velocityX *= friction;
        this.velocityY *= friction;
        
        // 更新位置
        this.currentX += this.velocityX * 16; // 假設60fps，約16ms一幀
        this.currentY += this.velocityY * 16;
        
        // 限制拖曳範圍
        this.constrainPosition();
        
        // 更新顯示
        this.updateMapPosition();
        
        // 檢查是否需要繼續滾動
        if (Math.abs(this.velocityX) > minVelocity || Math.abs(this.velocityY) > minVelocity) {
            requestAnimationFrame(() => this.inertiaScroll());
        } else {
            this.isInertiaScrolling = false;
        }
    }
}

// 當DOM載入完成後初始化地圖
document.addEventListener('DOMContentLoaded', () => {
    new DraggableMap();
});