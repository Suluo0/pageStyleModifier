/**
 * Style Modifier - Popup Controller
 * 负责侧边栏UI交互和脚本按需加载
 */
document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ========== 状态管理 ==========
    const state = {
        fontMode: false,
        removeMode: false,
        bgMode: false,
        layoutMode: false
    };

    // ========== 公共模块路径（初始化时加载） ==========
    const COMMON_SCRIPTS = [
        'common/logger.js',
        'common/i18n.js',
        'common/utils.js',
        'common/selector.js',
        'common/coordinator.js'
    ];

    // ========== 功能模块配置（按需加载） ==========
    const FEATURE_SCRIPTS = {
        style: ['features/style-editor.js'],
        background: ['features/bg-editor.js'],
        layout: ['features/layout-editor.js'],
        remove: ['features/remover.js'],
        amazon: ['features/amazon-cleaner.js'],
        amazonGrid: ['features/amazon-grid-adjuster.js']
    };

    // ========== 国际化 ==========
    function setLanguage() {
        const i18n = window.SMI18n;
        if (!i18n) return;

        // App Title
        setText('app-title', i18n.get('title'));

        // Section Titles
        setText('section-appearance', i18n.get('interfaceStyle'));
        setText('section-text', i18n.get('changeFont'));
        setText('section-hide', i18n.get('removeElement'));
        setText('section-layout', i18n.get('layoutTools'));
        setText('section-amazon', i18n.get('amazonTools'));

        // Appearance
        setText('label-page-bg', i18n.get('pageBackground'));
        setText('btn-set-body-bg', i18n.get('setBodyBg'));
        setText('btn-set-global-bg', i18n.get('setGlobalBg'));
        setText('label-element-bg', i18n.get('elementBg'));
        setText('desc-element-bg', i18n.get('descElementBg'));

        // Text Style
        setText('desc-font', i18n.get('descFont'));

        // Hide Elements
        setText('desc-remove', i18n.get('descRemove'));

        // Layout
        setText('label-spacing', i18n.get('adjustSpacing'));
        setText('desc-spacing', i18n.get('descSpacing'));
        setText('label-columns', i18n.get('adjustGridColumns'));
        setText('grid-columns-label', i18n.get('columns'));
        setText('desc-grid-columns', i18n.get('descGridColumns'));

        // Amazon
        setText('btn-remove-sponsored', i18n.get('removeSponsored'));
        setText('desc-amazon', i18n.get('descAmazon'));

        updateButtonText();
    }

    function setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function updateButtonText() {
        const i18n = window.SMI18n;
        if (!i18n) return;

        setText('btn-toggle-font', state.fontMode ? i18n.get('stopModify') : i18n.get('startModify'));
        setText('btn-toggle-remove', state.removeMode ? i18n.get('stopRemove') : i18n.get('startRemove'));
        setText('btn-toggle-element-bg', state.bgMode ? i18n.get('stopModifyBg') : i18n.get('startModifyBg'));
        setText('btn-toggle-spacing', state.layoutMode ? i18n.get('stopSpacing') : i18n.get('startSpacing'));
    }

    function updateButtonStates() {
        const buttons = {
            'btn-toggle-font': state.fontMode,
            'btn-toggle-remove': state.removeMode,
            'btn-toggle-element-bg': state.bgMode,
            'btn-toggle-spacing': state.layoutMode
        };

        Object.entries(buttons).forEach(([id, isActive]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.classList.toggle('active', isActive);
            }
        });
    }

    // ========== 脚本注入 ==========
    
    async function injectCommonScripts(tabId) {
        await chrome.scripting.executeScript({
            target: { tabId },
            files: COMMON_SCRIPTS
        });
    }

    async function injectFeatureScripts(tabId, feature) {
        const scripts = FEATURE_SCRIPTS[feature];
        if (!scripts || scripts.length === 0) return;

        await chrome.scripting.executeScript({
            target: { tabId },
            files: scripts
        });
    }

    function sendMessage(tabId, message) {
        chrome.tabs.sendMessage(tabId, message);
    }

    // ========== 页面背景色功能 ==========
    const pageBgColorInput = document.getElementById('page-bg-color-input');
    const pageBgColorText = document.getElementById('page-bg-color-text');

    if (pageBgColorInput) {
        pageBgColorInput.addEventListener('input', function() {
            pageBgColorText.value = pageBgColorInput.value;
        });
    }

    if (pageBgColorText) {
        pageBgColorText.addEventListener('input', function() {
            if (/^#[0-9A-F]{6}$/i.test(pageBgColorText.value)) {
                pageBgColorInput.value = pageBgColorText.value;
            }
        });
    }

    // 设置 Body 背景
    document.getElementById('btn-set-body-bg')?.addEventListener('click', async function() {
        const color = pageBgColorText.value;
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (color) => {
                    document.body.style.backgroundColor = color;
                },
                args: [color]
            });
        }
    });

    // 强制全页背景
    document.getElementById('btn-set-global-bg')?.addEventListener('click', async function() {
        const color = pageBgColorText.value;
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (newColor) => {
                    function rgbToHex(rgb) {
                        if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return null;
                        const match = rgb.match(/\d+/g);
                        if (!match || match.length < 3) return null;
                        const r = parseInt(match[0]);
                        const g = parseInt(match[1]);
                        const b = parseInt(match[2]);
                        if (match.length >= 4 && parseInt(match[3]) === 0) return null;
                        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
                    }

                    function isSimilarColor(hex1, hex2, threshold = 30) {
                        if (!hex1 || !hex2) return false;
                        const r1 = parseInt(hex1.slice(1, 3), 16);
                        const g1 = parseInt(hex1.slice(3, 5), 16);
                        const b1 = parseInt(hex1.slice(5, 7), 16);
                        const r2 = parseInt(hex2.slice(1, 3), 16);
                        const g2 = parseInt(hex2.slice(3, 5), 16);
                        const b2 = parseInt(hex2.slice(5, 7), 16);
                        const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
                        return diff <= threshold;
                    }

                    const bodyStyle = window.getComputedStyle(document.body);
                    const bodyBgColor = rgbToHex(bodyStyle.backgroundColor) || '#ffffff';

                    const selectors = 'body, div, section, article, main, aside, span, p, ul, ol, li, table, tr, td, th';
                    const elements = document.querySelectorAll(selectors);

                    let count = 0;
                    elements.forEach(el => {
                        if (el.hasAttribute('data-sm-ignore') || 
                            (el.id && el.id.startsWith('sm-'))) {
                            return;
                        }

                        const style = window.getComputedStyle(el);
                        const bgColor = rgbToHex(style.backgroundColor);

                        if (bgColor && isSimilarColor(bgColor, bodyBgColor)) {
                            el.style.setProperty('background-color', newColor, 'important');
                            count++;
                        }
                    });

                    document.body.style.setProperty('background-color', newColor, 'important');
                    console.log(`[Style Modifier] Modified ${count} elements`);
                },
                args: [color]
            });
        }
    });

    // ========== 交互式功能 ==========

    function createToggleHandler(stateKey, feature, mode) {
        return async function() {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab) return;

            resetAllModes(stateKey);
            state[stateKey] = !state[stateKey];
            updateButtonText();
            updateButtonStates();
            updateStatusIndicators();

            await injectCommonScripts(tab.id);

            if (state[stateKey]) {
                await injectFeatureScripts(tab.id, feature);
                sendMessage(tab.id, { action: 'startSelection', mode });
            } else {
                sendMessage(tab.id, { action: 'stopSelection' });
            }
        };
    }

    // 元素背景色修改
    document.getElementById('btn-toggle-element-bg')?.addEventListener('click', 
        createToggleHandler('bgMode', 'background', 'background'));

    // 字体样式修改
    document.getElementById('btn-toggle-font')?.addEventListener('click',
        createToggleHandler('fontMode', 'style', 'style'));

    // 隐藏元素
    document.getElementById('btn-toggle-remove')?.addEventListener('click',
        createToggleHandler('removeMode', 'remove', 'remove'));

    // 调整间距
    document.getElementById('btn-toggle-spacing')?.addEventListener('click',
        createToggleHandler('layoutMode', 'layout', 'layout'));

    // ========== 列数调整功能 ==========
    const gridColumnsInput = document.getElementById('grid-columns-input');
    const gridColumnsValue = document.getElementById('grid-columns-value');

    async function applyGridColumns() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) return;

        const columns = gridColumnsInput ? parseInt(gridColumnsInput.value) : 4;
        console.log('[Popup] Applying grid columns:', columns);

        await injectCommonScripts(tab.id);
        await injectFeatureScripts(tab.id, 'amazonGrid');
        sendMessage(tab.id, { action: 'adjustAmazonGrid', columns });
    }

    if (gridColumnsInput && gridColumnsValue) {
        // 拖动过程中实时应用
        gridColumnsInput.addEventListener('input', function() {
            gridColumnsValue.textContent = gridColumnsInput.value;
            applyGridColumns();
        });
    }

    document.getElementById('btn-apply-columns')?.addEventListener('click', function() {
        applyGridColumns();
    });

    // ========== Amazon 功能 ==========
    document.getElementById('btn-remove-sponsored')?.addEventListener('click', async function() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) return;

        await injectCommonScripts(tab.id);
        await injectFeatureScripts(tab.id, 'amazon');
        sendMessage(tab.id, { action: 'removeAmazonSponsored' });
    });

    // ========== 辅助函数 ==========
    function resetAllModes(currentModeKey) {
        for (let key in state) {
            if (key !== currentModeKey) {
                state[key] = false;
            }
        }
    }

    function updateStatusIndicators() {
        document.getElementById('status-bg')?.classList.toggle('active', state.bgMode);
        document.getElementById('status-font')?.classList.toggle('active', state.fontMode);
        document.getElementById('status-remove')?.classList.toggle('active', state.removeMode);
        document.getElementById('status-layout')?.classList.toggle('active', state.layoutMode);
    }

    // ========== 初始化 ==========
    setLanguage();
});
