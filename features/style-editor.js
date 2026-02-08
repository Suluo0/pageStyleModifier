/**
 * 字体样式编辑器模块
 * 功能：修改元素字体大小、粗细、字体族、颜色
 */
(function() {
    'use strict';

    // 防止重复初始化
    if (window.SMStyleEditor) return;

    // 常用字体列表
    const COMMON_FONTS = [
        { name: 'System Default', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' },
        { name: 'Arial', value: 'Arial, "Helvetica Neue", Helvetica, sans-serif' },
        { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
        { name: 'Times New Roman', value: '"Times New Roman", Times, serif' },
        { name: 'Courier New', value: '"Courier New", Courier, monospace' },
        { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
        { name: 'Georgia', value: 'Georgia, serif' },
        { name: 'Palatino', value: '"Palatino Linotype", "Book Antiqua", Palatino, serif' },
        { name: 'Garamond', value: 'Garamond, serif' },
        { name: 'Bookman', value: '"Bookman Old Style", serif' },
        { name: 'Comic Sans MS', value: '"Comic Sans MS", cursive, sans-serif' },
        { name: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
        { name: 'Arial Black', value: '"Arial Black", Gadget, sans-serif' },
        { name: 'Impact', value: 'Impact, Charcoal, sans-serif' },
        { name: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' }
    ];

    class StyleEditor {
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
            const fontOptions = COMMON_FONTS.map(f => 
                `<option value='${f.value}'>${f.name}</option>`
            ).join('');

            this.panel = document.createElement('div');
            this.panel.id = 'sm-style-editor-panel';
            this.panel.setAttribute('data-sm-ignore', 'true');
            this.panel.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                width: 250px;
                background: white;
                border: 1px solid #007bff;
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
                    <h3 style="margin: 0; font-size: 16px;">${i18n.get('styleEdit')}</h3>
                    <button id="sm-style-close-btn" style="border: none; background: none; cursor: pointer; font-size: 18px;">&times;</button>
                </div>
                <div style="margin-bottom: 10px;">
                    <label style="display: block; font-size: 12px; margin-bottom: 4px;">${i18n.get('fontSize')}</label>
                    <input type="number" id="sm-font-size" style="width: 100%; padding: 4px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
                </div>
                <div style="margin-bottom: 10px;">
                    <label style="display: block; font-size: 12px; margin-bottom: 4px;">${i18n.get('fontWeight')}</label>
                    <select id="sm-font-weight" style="width: 100%; padding: 4px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
                        <option value="normal">Normal</option>
                        <option value="bold">Bold</option>
                        <option value="100">100</option>
                        <option value="200">200</option>
                        <option value="300">300</option>
                        <option value="400">400</option>
                        <option value="500">500</option>
                        <option value="600">600</option>
                        <option value="700">700</option>
                        <option value="800">800</option>
                        <option value="900">900</option>
                    </select>
                </div>
                <div style="margin-bottom: 10px;">
                    <label style="display: block; font-size: 12px; margin-bottom: 4px;">${i18n.get('fontFamily')}</label>
                    <select id="sm-font-family" style="width: 100%; padding: 4px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
                        ${fontOptions}
                    </select>
                </div>
                <div style="margin-bottom: 10px;">
                    <label style="display: block; font-size: 12px; margin-bottom: 4px;">${i18n.get('color')}</label>
                    <input type="color" id="sm-color" style="width: 100%; height: 30px; padding: 0; border: none;">
                </div>
                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee;">
                    <label style="display: flex; align-items: center; font-size: 12px; cursor: pointer;">
                        <input type="checkbox" id="sm-apply-similar" style="margin-right: 6px;">
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
            const closeBtn = this.panel.querySelector('#sm-style-close-btn');
            const fontSizeInput = this.panel.querySelector('#sm-font-size');
            const fontWeightInput = this.panel.querySelector('#sm-font-weight');
            const fontFamilyInput = this.panel.querySelector('#sm-font-family');
            const colorInput = this.panel.querySelector('#sm-color');
            const applySimilarCheckbox = this.panel.querySelector('#sm-apply-similar');

            closeBtn.onclick = () => this.close();

            fontSizeInput.addEventListener('input', (e) => this._updateStyle('fontSize', e.target.value + 'px'));
            fontWeightInput.addEventListener('change', (e) => this._updateStyle('fontWeight', e.target.value));
            fontFamilyInput.addEventListener('change', (e) => this._updateStyle('fontFamily', e.target.value));
            colorInput.addEventListener('input', (e) => this._updateStyle('color', e.target.value));

            applySimilarCheckbox.addEventListener('change', () => {
                if (this.selectedElement) {
                    this._applyAllStyles();
                }
            });
        }

        _updateStyle(property, value) {
            if (!this.selectedElement) return;

            const applySimilar = this.panel.querySelector('#sm-apply-similar').checked;
            const elements = applySimilar 
                ? window.SMUtils.findSimilarElements(this.selectedElement, [this.panel])
                : [this.selectedElement];

            elements.forEach(el => {
                window.SMUtils.applyStyle(el, property, value);
                if (property === 'fontSize') {
                    window.SMUtils.applyStyle(el, 'lineHeight', '1.36');
                }
            });
        }

        _applyAllStyles() {
            const fontSizeInput = this.panel.querySelector('#sm-font-size');
            const fontWeightInput = this.panel.querySelector('#sm-font-weight');
            const fontFamilyInput = this.panel.querySelector('#sm-font-family');
            const colorInput = this.panel.querySelector('#sm-color');

            if (fontSizeInput.value) this._updateStyle('fontSize', fontSizeInput.value + 'px');
            this._updateStyle('fontWeight', fontWeightInput.value);
            this._updateStyle('fontFamily', fontFamilyInput.value);
            this._updateStyle('color', colorInput.value);
        }

        show(element) {
            this.selectedElement = element;
            const computedStyle = window.getComputedStyle(element);

            // 填充当前值
            const fontSize = parseFloat(computedStyle.fontSize);
            this.panel.querySelector('#sm-font-size').value = isNaN(fontSize) ? '' : fontSize;

            const fontWeight = computedStyle.fontWeight;
            const fwSelect = this.panel.querySelector('#sm-font-weight');
            fwSelect.value = fontWeight;
            if (fwSelect.value !== fontWeight) fwSelect.value = 'normal';

            const currentFont = computedStyle.fontFamily;
            const ffSelect = this.panel.querySelector('#sm-font-family');
            
            let matched = false;
            for (let i = 0; i < ffSelect.options.length; i++) {
                if (currentFont === ffSelect.options[i].value || 
                    ffSelect.options[i].value.includes(currentFont.replace(/['"]/g, ''))) {
                    ffSelect.selectedIndex = i;
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                const oldTemp = ffSelect.querySelector('option[data-temp="true"]');
                if (oldTemp) oldTemp.remove();

                const option = document.createElement('option');
                option.text = `Current (${currentFont.split(',')[0].replace(/['"]/g, '')})`;
                option.value = currentFont;
                option.dataset.temp = 'true';
                ffSelect.add(option, 0);
                ffSelect.selectedIndex = 0;
            }

            this.panel.querySelector('#sm-color').value = window.SMUtils.rgbToHex(computedStyle.color);
            this.panel.querySelector('#sm-apply-similar').checked = false;

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
    window.SMStyleEditor = StyleEditor;
})();
