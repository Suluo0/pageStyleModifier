/**
 * Amazon网格列数调整模块
 * 功能：调整Amazon搜索结果的显示列数（2-8列）
 */
(function() {
    'use strict';

    // 防止重复初始化
    if (window.SMAmazonGridAdjuster) return;

    // ========== 日志配置 ==========
    // 在模块最前面配置日志级别（可选：OFF/ERROR/WARN/INFO/DEBUG）
    const log = window.SMLogger ? window.SMLogger.getLogger('AmazonGrid', 'DEBUG') : console;

    const AmazonGridAdjuster = {
        /**
         * 调整Amazon搜索结果的网格列数
         * @param {number} columns - 列数（2-8）
         */
        adjustGrid(columns) {
            log.info('Adjusting grid to', columns, 'columns');
            
            // 验证列数范围
            if (!columns || columns < 2 || columns > 8) {
                log.warn('Invalid column count:', columns);
                return;
            }

            // 查找Amazon搜索结果容器
            const mainSlot = document.querySelector('.s-main-slot');
            if (!mainSlot) {
                log.warn('Amazon search results container not found');
                this._showMessage('noAmazonFound');
                return;
            }

            log.debug('Found main slot container');

            // 移除之前的样式
            this._removeExistingStyles();

            // 创建并应用新的网格样式
            this._applyGridStyles(columns);

            log.info('Grid styles applied successfully');

            // 显示成功消息
            this._showMessage('gridAdjusted', { n: columns });
        },

        /**
         * 移除之前应用的样式
         */
        _removeExistingStyles() {
            const existingStyle = document.getElementById('sm-amazon-grid-style');
            if (existingStyle) {
                existingStyle.remove();
            }
        },

        /**
         * 应用网格样式
         * @param {number} columns - 列数
         */
        _applyGridStyles(columns) {
            const style = document.createElement('style');
            style.id = 'sm-amazon-grid-style';
            style.setAttribute('data-sm-ignore', 'true');
            
            style.textContent = `
                /* 1. 定义容器为指定列数的网格 */
                .s-main-slot {
                    display: grid !important;
                    grid-template-columns: repeat(${columns}, minmax(0, 1fr)) !important;
                    gap: 12px !important;
                    margin-right: 0 !important;
                }

                /* 2. 安全策略：默认所有子元素强制占满整行 */
                /* 这能确保标题、横幅广告、分页条等全部恢复正常宽度 */
                .s-main-slot > * {
                    grid-column: 1 / -1 !important;
                    width: 100% !important;
                    margin-left: 0 !important;
                    margin-right: 0 !important;
                }

                /* 3. 例外规则：只有真正的商品才按照设定列数显示 */
                .s-main-slot > .s-result-item.s-asin {
                    grid-column: span 1 !important;
                    width: auto !important;
                    max-width: none !important;
                }

                /* 4. 优化商品卡片内部布局 */
                .s-main-slot > .s-result-item.s-asin > div {
                    display: flex !important;
                    flex-direction: column !important;
                    height: 100% !important;
                }

                /* 5. 确保图片容器合适 */
                .s-main-slot > .s-result-item.s-asin img {
                    max-width: 100% !important;
                    height: auto !important;
                }
            `;

            document.head.appendChild(style);
        },

        /**
         * 显示消息提示
         * @param {string} key - 消息键
         * @param {Object} params - 替换参数
         */
        _showMessage(key, params = {}) {
            const i18n = window.SMI18n;
            if (!i18n) return;

            let message;
            switch (key) {
                case 'gridAdjusted':
                    message = i18n.isZh() 
                        ? `已调整为 ${params.n} 列显示`
                        : `Adjusted to ${params.n} columns`;
                    break;
                case 'noAmazonFound':
                    message = i18n.isZh() 
                        ? '未找到 Amazon 搜索结果'
                        : 'Amazon search results not found';
                    break;
                default:
                    return;
            }

            // 创建提示框
            const toast = document.createElement('div');
            toast.setAttribute('data-sm-ignore', 'true');
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #28a745;
                color: white;
                padding: 12px 20px;
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 2147483647;
                font-family: sans-serif;
                font-size: 14px;
                animation: slideIn 0.3s ease-out;
            `;

            // 添加动画
            const keyframes = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;

            if (!document.getElementById('sm-toast-animation')) {
                const styleElement = document.createElement('style');
                styleElement.id = 'sm-toast-animation';
                styleElement.textContent = keyframes;
                document.head.appendChild(styleElement);
            }

            toast.textContent = message;
            document.body.appendChild(toast);

            // 3秒后自动移除
            setTimeout(() => {
                toast.style.animation = 'slideIn 0.3s ease-out reverse';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    };

    // 导出到全局
    window.SMAmazonGridAdjuster = AmazonGridAdjuster;
})();
