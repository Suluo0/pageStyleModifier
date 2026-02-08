/**
 * 元素选择器模块
 * 提供页面元素高亮选择功能
 */
(function() {
    'use strict';

    // 防止重复初始化
    if (window.SMSelector) return;

    // 模式对应的颜色配置
    const MODE_COLORS = {
        style: { border: '#007bff', bg: 'rgba(0, 123, 255, 0.1)' },
        remove: { border: '#dc3545', bg: 'rgba(220, 53, 69, 0.1)' },
        background: { border: '#28a745', bg: 'rgba(40, 167, 69, 0.1)' },
        layout: { border: '#fd7e14', bg: 'rgba(253, 126, 20, 0.1)' }
    };

    class ElementSelector {
        constructor() {
            this.overlay = null;
            this.isSelecting = false;
            this.mode = 'style';
            this.excludeElements = [];
            this.onSelect = null;  // 选中元素的回调

            this._boundMouseOver = this._handleMouseOver.bind(this);
            this._boundClick = this._handleClick.bind(this);

            this._initOverlay();
        }

        /**
         * 初始化高亮遮罩层
         */
        _initOverlay() {
            this.overlay = document.createElement('div');
            this.overlay.id = 'sm-selector-overlay';
            this.overlay.setAttribute('data-sm-ignore', 'true');  // 标记为插件元素，避免被全局样式影响
            this.overlay.style.cssText = `
                position: absolute;
                border: 2px solid #007bff;
                background-color: rgba(0, 123, 255, 0.1) !important;
                pointer-events: none;
                z-index: 2147483646;
                display: none;
                transition: all 0.1s ease;
            `;
            document.body.appendChild(this.overlay);
        }

        /**
         * 设置需要排除的元素（如编辑面板）
         * @param {Array<HTMLElement>} elements
         */
        setExcludeElements(elements) {
            this.excludeElements = elements || [];
        }

        /**
         * 开始元素选择
         * @param {string} mode - 选择模式：style, remove, background, layout
         * @param {Function} onSelect - 选中元素时的回调 (element) => void
         */
        start(mode = 'style', onSelect = null) {
            this.mode = mode;
            this.onSelect = onSelect;

            // 设置遮罩颜色
            const colors = MODE_COLORS[mode] || MODE_COLORS.style;
            this.overlay.style.borderColor = colors.border;
            this.overlay.style.backgroundColor = colors.bg;

            if (this.isSelecting) return;
            this.isSelecting = true;

            document.addEventListener('mouseover', this._boundMouseOver);
            document.addEventListener('click', this._boundClick, true);
            document.body.style.cursor = 'crosshair';
        }

        /**
         * 停止元素选择
         */
        stop() {
            this.isSelecting = false;
            document.removeEventListener('mouseover', this._boundMouseOver);
            document.removeEventListener('click', this._boundClick, true);
            this.overlay.style.display = 'none';
            document.body.style.cursor = 'default';
        }

        /**
         * 检查元素是否应该被排除
         * @param {HTMLElement} target
         * @returns {boolean}
         */
        _shouldExclude(target) {
            if (target === this.overlay) return true;
            
            for (const el of this.excludeElements) {
                if (el && el.contains(target)) return true;
            }
            return false;
        }

        /**
         * 鼠标悬停处理
         * @param {MouseEvent} e
         */
        _handleMouseOver(e) {
            if (this._shouldExclude(e.target)) return;

            const rect = e.target.getBoundingClientRect();
            this.overlay.style.top = (rect.top + window.scrollY) + 'px';
            this.overlay.style.left = (rect.left + window.scrollX) + 'px';
            this.overlay.style.width = rect.width + 'px';
            this.overlay.style.height = rect.height + 'px';
            this.overlay.style.display = 'block';
        }

        /**
         * 点击选中处理
         * @param {MouseEvent} e
         */
        _handleClick(e) {
            if (this._shouldExclude(e.target)) return;

            e.preventDefault();
            e.stopPropagation();

            const selectedElement = e.target;
            
            // 暂停选择，等待编辑
            this.stop();
            
            // 触发回调
            if (this.onSelect) {
                this.onSelect(selectedElement);
            }
        }

        /**
         * 获取遮罩元素
         * @returns {HTMLElement}
         */
        getOverlay() {
            return this.overlay;
        }

        /**
         * 销毁选择器
         */
        destroy() {
            this.stop();
            if (this.overlay && this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
            this.overlay = null;
        }
    }

    // 创建单例实例
    const selector = new ElementSelector();

    // 导出到全局
    window.SMSelector = selector;
})();
