/**
 * 面板基类模块
 * 提供编辑面板的通用功能
 */
(function() {
    'use strict';

    // 防止重复初始化
    if (window.SMPanel) return;

    // 面板基础样式
    const PANEL_BASE_STYLE = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 250px;
        background: white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-radius: 8px;
        padding: 15px;
        z-index: 2147483647;
        font-family: sans-serif;
        display: none;
        color: #333;
    `;

    // 颜色主题
    const THEMES = {
        primary: { border: '#007bff', color: '#007bff' },
        danger: { border: '#dc3545', color: '#dc3545' },
        success: { border: '#28a745', color: '#28a745' },
        warning: { border: '#fd7e14', color: '#fd7e14' }
    };

    class BasePanel {
        /**
         * @param {string} id - 面板ID
         * @param {string} theme - 主题：primary, danger, success, warning
         */
        constructor(id, theme = 'primary') {
            this.id = id;
            this.theme = THEMES[theme] || THEMES.primary;
            this.panel = null;
            this.selectedElement = null;
            this.onClose = null;
            
            this._createPanel();
        }

        /**
         * 创建面板DOM
         */
        _createPanel() {
            this.panel = document.createElement('div');
            this.panel.id = this.id;
            this.panel.style.cssText = PANEL_BASE_STYLE + `border: 1px solid ${this.theme.border};`;
            document.body.appendChild(this.panel);
        }

        /**
         * 生成面板头部HTML
         * @param {string} title - 标题
         * @returns {string} HTML字符串
         */
        createHeader(title) {
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                    <h3 style="margin: 0; font-size: 16px; color: ${this.theme.color};">${title}</h3>
                    <button class="sm-panel-close-btn" style="border: none; background: none; cursor: pointer; font-size: 18px;">&times;</button>
                </div>
            `;
        }

        /**
         * 生成表单项HTML
         * @param {string} label - 标签
         * @param {string} inputHtml - 输入控件HTML
         * @returns {string} HTML字符串
         */
        createFormItem(label, inputHtml) {
            return `
                <div style="margin-bottom: 10px;">
                    <label style="display: block; font-size: 12px; margin-bottom: 4px;">${label}</label>
                    ${inputHtml}
                </div>
            `;
        }

        /**
         * 生成复选框HTML
         * @param {string} id - 复选框ID
         * @param {string} label - 标签
         * @param {string} hint - 提示文字
         * @returns {string} HTML字符串
         */
        createCheckbox(id, label, hint = '') {
            return `
                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee;">
                    <label style="display: flex; align-items: center; font-size: 12px; cursor: pointer;">
                        <input type="checkbox" id="${id}" style="margin-right: 6px;">
                        ${label}
                    </label>
                    ${hint ? `<div style="font-size: 10px; color: #666; margin-top: 4px; margin-left: 20px;">${hint}</div>` : ''}
                </div>
            `;
        }

        /**
         * 生成按钮组HTML
         * @param {Array} buttons - 按钮配置数组 [{id, text, type}]
         * @returns {string} HTML字符串
         */
        createButtonGroup(buttons) {
            const buttonStyles = {
                primary: 'background-color: #007bff; color: white;',
                danger: 'background-color: #dc3545; color: white;',
                secondary: 'background-color: #6c757d; color: white;'
            };
            
            return `
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    ${buttons.map(btn => `
                        <button id="${btn.id}" style="flex: 1; padding: 8px; border: none; border-radius: 4px; cursor: pointer; ${buttonStyles[btn.type] || buttonStyles.primary}">${btn.text}</button>
                    `).join('')}
                </div>
            `;
        }

        /**
         * 绑定关闭按钮事件
         */
        bindCloseButton() {
            const closeBtn = this.panel.querySelector('.sm-panel-close-btn');
            if (closeBtn) {
                closeBtn.onclick = () => this.close();
            }
        }

        /**
         * 显示面板
         * @param {HTMLElement} element - 选中的元素
         */
        show(element) {
            this.selectedElement = element;
            this.panel.style.display = 'block';
            this.onShow(element);
        }

        /**
         * 关闭面板
         */
        close() {
            this.panel.style.display = 'none';
            this.selectedElement = null;
            
            if (this.onClose) {
                this.onClose();
            }
        }

        /**
         * 显示时的钩子方法（子类重写）
         * @param {HTMLElement} element
         */
        onShow(element) {
            // 子类实现
        }

        /**
         * 获取面板DOM元素
         * @returns {HTMLElement}
         */
        getElement() {
            return this.panel;
        }

        /**
         * 检查面板是否包含某元素
         * @param {HTMLElement} target
         * @returns {boolean}
         */
        contains(target) {
            return this.panel && this.panel.contains(target);
        }

        /**
         * 销毁面板
         */
        destroy() {
            if (this.panel && this.panel.parentNode) {
                this.panel.parentNode.removeChild(this.panel);
            }
            this.panel = null;
        }
    }

    // 导出到全局
    window.SMPanel = BasePanel;
})();
