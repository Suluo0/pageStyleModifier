/**
 * 工具函数模块
 * 提供颜色转换、Toast提示等通用功能
 */
(function() {
    'use strict';

    // 防止重复初始化
    if (window.SMUtils) return;

    const Utils = {
        /**
         * RGB颜色转HEX
         * @param {string} rgb - RGB颜色字符串，如 "rgb(255, 255, 255)"
         * @returns {string} HEX颜色字符串，如 "#ffffff"
         */
        rgbToHex(rgb) {
            if (!rgb) return '#000000';
            if (rgb.startsWith('#')) return rgb;
            
            const rgbValues = rgb.match(/\d+/g);
            if (!rgbValues || rgbValues.length < 3) return '#000000';
            
            return '#' + 
                ('0' + parseInt(rgbValues[0], 10).toString(16)).slice(-2) +
                ('0' + parseInt(rgbValues[1], 10).toString(16)).slice(-2) +
                ('0' + parseInt(rgbValues[2], 10).toString(16)).slice(-2);
        },

        /**
         * 显示Toast提示
         * @param {string} message - 提示消息
         * @param {number} duration - 显示时长（毫秒），默认3000
         */
        showToast(message, duration = 3000) {
            const toast = document.createElement('div');
            toast.className = 'sm-toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px 20px;
                border-radius: 4px;
                z-index: 2147483647;
                font-family: sans-serif;
                font-size: 14px;
                transition: opacity 0.5s ease;
            `;
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 500);
            }, duration);
        },

        /**
         * 查找相似元素
         * @param {HTMLElement} element - 目标元素
         * @param {Array<HTMLElement>} excludeElements - 需要排除的元素列表
         * @returns {Array<HTMLElement>} 相似元素数组
         */
        findSimilarElements(element, excludeElements = []) {
            let selector = '';

            if (element.classList && element.classList.length > 0) {
                const classes = Array.from(element.classList).filter(c => c.trim() !== '');
                if (classes.length > 0) {
                    selector = element.tagName.toLowerCase() + '.' + classes.join('.');
                }
            }

            if (!selector) {
                selector = element.tagName.toLowerCase();
            }

            try {
                const allMatches = document.querySelectorAll(selector);
                let candidates = Array.from(allMatches).filter(el => {
                    // 排除指定元素
                    for (const exclude of excludeElements) {
                        if (exclude && exclude.contains(el)) return false;
                    }
                    return true;
                });

                if (candidates.length <= 1) return candidates;

                // 基于父元素签名进一步筛选
                const parentSignature = this.getElementSignature(element.parentElement);
                return candidates.filter(el => {
                    if (el === element) return true;
                    const elParentSignature = this.getElementSignature(el.parentElement);
                    return elParentSignature === parentSignature;
                });

            } catch (e) {
                console.error('SMUtils: Invalid selector:', selector);
                return [element];
            }
        },

        /**
         * 获取元素签名（用于相似元素匹配）
         * @param {HTMLElement} el - 目标元素
         * @returns {string} 元素签名
         */
        getElementSignature(el) {
            if (!el) return 'null';
            let sig = el.tagName.toLowerCase();
            if (el.classList && el.classList.length > 0) {
                const classes = Array.from(el.classList).sort().join('.');
                if (classes) {
                    sig += '.' + classes;
                }
            }
            return sig;
        },

        /**
         * 应用样式到元素
         * @param {HTMLElement} element - 目标元素
         * @param {string} property - CSS属性名（驼峰式）
         * @param {string} value - CSS属性值
         */
        applyStyle(element, property, value) {
            const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
            element.style.setProperty(cssProperty, value, 'important');
        },

        /**
         * 批量应用样式
         * @param {Array<HTMLElement>} elements - 元素数组
         * @param {string} property - CSS属性名
         * @param {string} value - CSS属性值
         */
        applyStyleToAll(elements, property, value) {
            elements.forEach(el => this.applyStyle(el, property, value));
        },

        /**
         * 解析数值（去除单位）
         * @param {string} value - 带单位的值，如 "16px"
         * @returns {number} 数值
         */
        parseNumericValue(value) {
            return parseFloat(value) || 0;
        }
    };

    // 导出到全局
    window.SMUtils = Utils;
})();
