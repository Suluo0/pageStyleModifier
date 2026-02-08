/**
 * 布局编辑器模块
 * 功能：修改元素的 margin 和 padding
 */
(function() {
    'use strict';

    // 防止重复初始化
    if (window.SMLayoutEditor) return;

    const SIDES = ['top', 'right', 'bottom', 'left'];
    const TYPES = ['margin', 'padding'];

    class LayoutEditor {
        constructor() {
            this.panel = null;
            this.selectedElement = null;
            this.reflowEnabled = false;
            this.onClose = null;

            this._init();
        }

        _init() {
            this._createPanel();
            this._bindEvents();
        }

        _createQuadInputs(label, prefix) {
            const i18n = window.SMI18n;
            return `
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; margin-bottom: 5px; font-weight: bold;">${label}</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <div>
                            <span style="font-size: 10px; color: #666;">${i18n.get('top')}</span>
                            <input type="number" id="${prefix}-top" style="width: 100%; padding: 4px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
                        </div>
                        <div>
                            <span style="font-size: 10px; color: #666;">${i18n.get('right')}</span>
                            <input type="number" id="${prefix}-right" style="width: 100%; padding: 4px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
                        </div>
                        <div>
                            <span style="font-size: 10px; color: #666;">${i18n.get('bottom')}</span>
                            <input type="number" id="${prefix}-bottom" style="width: 100%; padding: 4px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
                        </div>
                        <div>
                            <span style="font-size: 10px; color: #666;">${i18n.get('left')}</span>
                            <input type="number" id="${prefix}-left" style="width: 100%; padding: 4px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
                        </div>
                    </div>
                </div>
            `;
        }

        _createPanel() {
            const i18n = window.SMI18n;

            this.panel = document.createElement('div');
            this.panel.id = 'sm-layout-editor-panel';
            this.panel.setAttribute('data-sm-ignore', 'true');
            this.panel.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                width: 280px;
                background: white;
                border: 1px solid #fd7e14;
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
                    <h3 style="margin: 0; font-size: 16px; color: #fd7e14;">${i18n.get('layoutEdit')}</h3>
                    <button id="sm-layout-close-btn" style="border: none; background: none; cursor: pointer; font-size: 18px;">&times;</button>
                </div>
                
                ${this._createQuadInputs(i18n.get('margin'), 'sm-margin')}
                ${this._createQuadInputs(i18n.get('padding'), 'sm-padding')}

                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee;">
                    <label style="display: flex; align-items: center; font-size: 12px; cursor: pointer;">
                        <input type="checkbox" id="sm-layout-apply-similar" style="margin-right: 6px;">
                        ${i18n.get('applySimilar')}
                    </label>
                    <div style="font-size: 10px; color: #666; margin-top: 4px; margin-left: 20px;">
                        ${i18n.get('similarHint')}
                    </div>
                </div>
                <div style="margin-top: 12px;">
                    <label style="display: flex; align-items: center; font-size: 12px; cursor: pointer;">
                        <input type="checkbox" id="sm-layout-reflow" style="margin-right: 6px;">
                        ${i18n.get('enableReflow')}
                    </label>
                    <div style="font-size: 10px; color: #666; margin-top: 4px; margin-left: 20px;">
                        ${i18n.get('reflowHint')}
                    </div>
                </div>
            `;

            document.body.appendChild(this.panel);
        }

        _bindEvents() {
            const closeBtn = this.panel.querySelector('#sm-layout-close-btn');
            const applySimilarCheckbox = this.panel.querySelector('#sm-layout-apply-similar');
            const reflowCheckbox = this.panel.querySelector('#sm-layout-reflow');

            closeBtn.onclick = () => this.close();

            // 绑定所有输入框事件
            TYPES.forEach(type => {
                SIDES.forEach(side => {
                    const input = this.panel.querySelector(`#sm-${type}-${side}`);
                    input.addEventListener('input', (e) => {
                        let val = e.target.value;
                        if (val && !isNaN(val)) {
                            val += 'px';
                        }
                        const prop = type + side.charAt(0).toUpperCase() + side.slice(1);
                        this._updateStyle(prop, val);
                    });
                });
            });

            applySimilarCheckbox.addEventListener('change', () => {
                if (this.selectedElement) {
                    this._applyAllStyles();
                }
            });

            reflowCheckbox.addEventListener('change', () => {
                this.reflowEnabled = reflowCheckbox.checked;
                if (this.reflowEnabled && this.selectedElement) {
                    this._applyReflow(this.selectedElement);
                }
            });
        }

        _updateStyle(property, value) {
            if (!this.selectedElement) return;

            const applySimilar = this.panel.querySelector('#sm-layout-apply-similar').checked;
            const elements = applySimilar 
                ? window.SMUtils.findSimilarElements(this.selectedElement, [this.panel])
                : [this.selectedElement];

            window.SMUtils.applyStyleToAll(elements, property, value);

            if (this.reflowEnabled) {
                this._applyReflow(this.selectedElement);
            }
        }

        _applyAllStyles() {
            TYPES.forEach(type => {
                SIDES.forEach(side => {
                    const input = this.panel.querySelector(`#sm-${type}-${side}`);
                    let val = input.value;
                    if (val && !isNaN(val)) {
                        val += 'px';
                    }
                    const prop = type + side.charAt(0).toUpperCase() + side.slice(1);
                    this._updateStyle(prop, val);
                });
            });
        }

        _applyReflow(element) {
            if (!element || !element.parentElement) return;
            
            const parent = element.parentElement;
            const parentStyle = window.getComputedStyle(parent);
            const display = parentStyle.display;
            
            window.SMUtils.applyStyle(parent, 'boxSizing', 'border-box');

            if (display === 'grid' || display === 'inline-grid') {
                const rect = element.getBoundingClientRect();
                const elStyle = window.getComputedStyle(element);
                const marginLeft = parseFloat(elStyle.marginLeft) || 0;
                const marginRight = parseFloat(elStyle.marginRight) || 0;
                const minWidth = Math.max(1, Math.round(rect.width + marginLeft + marginRight));
                
                window.SMUtils.applyStyle(parent, 'gridAutoFlow', 'row');
                window.SMUtils.applyStyle(parent, 'gridTemplateColumns', `repeat(auto-fill, minmax(${minWidth}px, 1fr))`);
                window.SMUtils.applyStyle(parent, 'alignContent', 'start');
            } else {
                window.SMUtils.applyStyle(parent, 'display', 'flex');
                window.SMUtils.applyStyle(parent, 'flexWrap', 'wrap');
                window.SMUtils.applyStyle(parent, 'alignContent', 'flex-start');
            }
        }

        show(element) {
            this.selectedElement = element;
            const computedStyle = window.getComputedStyle(element);

            // 填充当前值
            SIDES.forEach(side => {
                // Margin
                const mProp = 'margin' + side.charAt(0).toUpperCase() + side.slice(1);
                const mVal = parseFloat(computedStyle[mProp]);
                this.panel.querySelector(`#sm-margin-${side}`).value = isNaN(mVal) ? '' : mVal;

                // Padding
                const pProp = 'padding' + side.charAt(0).toUpperCase() + side.slice(1);
                const pVal = parseFloat(computedStyle[pProp]);
                this.panel.querySelector(`#sm-padding-${side}`).value = isNaN(pVal) ? '' : pVal;
            });

            this.panel.querySelector('#sm-layout-apply-similar').checked = false;
            this.panel.querySelector('#sm-layout-reflow').checked = this.reflowEnabled;

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
    window.SMLayoutEditor = LayoutEditor;
})();
