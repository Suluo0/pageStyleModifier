/**
 * 元素移除模块
 * 功能：隐藏选中的页面元素
 */
(function() {
    'use strict';

    // 防止重复初始化
    if (window.SMRemover) return;

    class ElementRemover {
        constructor() {
            this.panel = null;
            this.selectedElement = null;
            this.onClose = null;

            this._init();
        }

        _init() {
            this._createPanel();
            this._bindEvents();
        }

        _createPanel() {
            const i18n = window.SMI18n;

            this.panel = document.createElement('div');
            this.panel.id = 'sm-remover-panel';
            this.panel.setAttribute('data-sm-ignore', 'true');
            this.panel.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                width: 250px;
                background: white;
                border: 1px solid #dc3545;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                border-radius: 8px;
                padding: 15px;
                z-index: 2147483647;
                font-family: sans-serif;
                display: none;
                color: #333;
            `;

            this.panel.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                    <h3 style="margin: 0; font-size: 16px; color: #dc3545;">${i18n.get('removeElement')}</h3>
                    <button id="sm-remover-close-btn" style="border: none; background: none; cursor: pointer; font-size: 18px;">&times;</button>
                </div>
                <div style="margin-bottom: 15px; font-size: 13px; color: #666;">
                    ${i18n.get('removeConfirm')}
                    <div style="margin-top: 5px; font-size: 12px; color: #999;">${i18n.get('removeHint')}</div>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: flex; align-items: center; font-size: 12px; cursor: pointer;">
                        <input type="checkbox" id="sm-remove-similar" style="margin-right: 6px;">
                        ${i18n.get('removeSimilar')}
                    </label>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button id="sm-confirm-remove" style="flex: 1; padding: 8px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">${i18n.get('remove')}</button>
                    <button id="sm-cancel-remove" style="flex: 1; padding: 8px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">${i18n.get('cancel')}</button>
                </div>
            `;

            document.body.appendChild(this.panel);
        }

        _bindEvents() {
            const closeBtn = this.panel.querySelector('#sm-remover-close-btn');
            const confirmBtn = this.panel.querySelector('#sm-confirm-remove');
            const cancelBtn = this.panel.querySelector('#sm-cancel-remove');

            closeBtn.onclick = () => this.close();
            cancelBtn.onclick = () => this.close();
            
            confirmBtn.onclick = () => {
                this._removeElement();
                this.close();
            };
        }

        _removeElement() {
            if (!this.selectedElement) return;

            const applySimilar = this.panel.querySelector('#sm-remove-similar').checked;
            const elements = applySimilar 
                ? window.SMUtils.findSimilarElements(this.selectedElement, [this.panel])
                : [this.selectedElement];

            elements.forEach(el => {
                window.SMUtils.applyStyle(el, 'display', 'none');
            });
        }

        show(element) {
            this.selectedElement = element;
            this.panel.querySelector('#sm-remove-similar').checked = false;
            this.panel.style.display = 'block';
        }

        close() {
            this.panel.style.display = 'none';
            this.selectedElement = null;
            if (this.onClose) this.onClose();
        }

        getElement() {
            return this.panel;
        }

        contains(target) {
            return this.panel && this.panel.contains(target);
        }
    }

    // 导出到全局
    window.SMRemover = ElementRemover;
})();
