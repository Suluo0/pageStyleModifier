/**
 * 背景色编辑器模块
 * 功能：修改元素背景色
 */
(function() {
    'use strict';

    // 防止重复初始化
    if (window.SMBgEditor) return;

    class BgEditor {
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
            this.panel.id = 'sm-bg-editor-panel';
            this.panel.setAttribute('data-sm-ignore', 'true');
            this.panel.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                width: 250px;
                background: white;
                border: 1px solid #28a745;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                border-radius: 8px;
                padding: 15px;
                z-index: 2147483647;
                font-family: sans-serif;
                display: none;
                color: #333;
            `;

            this.panel.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                    <h3 style="margin: 0; font-size: 16px; color: #28a745;">${i18n.get('bgEdit')}</h3>
                    <button id="sm-bg-close-btn" style="border: none; background: none; cursor: pointer; font-size: 18px;">&times;</button>
                </div>
                <div style="margin-bottom: 10px;">
                    <label style="display: block; font-size: 12px; margin-bottom: 4px;">${i18n.get('backgroundColor')}</label>
                    <input type="color" id="sm-bg-color" style="width: 100%; height: 30px; padding: 0; border: none;">
                </div>
                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee;">
                    <label style="display: flex; align-items: center; font-size: 12px; cursor: pointer;">
                        <input type="checkbox" id="sm-bg-apply-similar" style="margin-right: 6px;">
                        ${i18n.get('applySimilar')}
                    </label>
                    <div style="font-size: 10px; color: #666; margin-top: 4px; margin-left: 20px;">
                        ${i18n.get('similarHint')}
                    </div>
                </div>
            `;

            document.body.appendChild(this.panel);
        }

        _bindEvents() {
            const closeBtn = this.panel.querySelector('#sm-bg-close-btn');
            const bgColorInput = this.panel.querySelector('#sm-bg-color');
            const applySimilarCheckbox = this.panel.querySelector('#sm-bg-apply-similar');

            closeBtn.onclick = () => this.close();

            bgColorInput.addEventListener('input', (e) => this._updateStyle('backgroundColor', e.target.value));

            applySimilarCheckbox.addEventListener('change', () => {
                if (this.selectedElement) {
                    this._updateStyle('backgroundColor', bgColorInput.value);
                }
            });
        }

        _updateStyle(property, value) {
            if (!this.selectedElement) return;

            const applySimilar = this.panel.querySelector('#sm-bg-apply-similar').checked;
            const elements = applySimilar 
                ? window.SMUtils.findSimilarElements(this.selectedElement, [this.panel])
                : [this.selectedElement];

            window.SMUtils.applyStyleToAll(elements, property, value);
        }

        show(element) {
            this.selectedElement = element;
            const computedStyle = window.getComputedStyle(element);

            this.panel.querySelector('#sm-bg-color').value = window.SMUtils.rgbToHex(computedStyle.backgroundColor);
            this.panel.querySelector('#sm-bg-apply-similar').checked = false;

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
    window.SMBgEditor = BgEditor;
})();
