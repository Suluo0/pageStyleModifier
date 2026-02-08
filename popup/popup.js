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
        bgMode: false
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

        // Interface Style Group
        setText('title-interface', i18n.get('interfaceStyle'));
        setText('subtitle-page-bg', i18n.get('pageBackground'));
        setText('btn-set-body-bg', i18n.get('setBodyBg'));
        setText('btn-set-global-bg', i18n.get('setGlobalBg'));
        setText('subtitle-element-bg', i18n.get('elementBg'));
        setText('desc-element-bg', i18n.get('descElementBg'));

        // Font Group
        setText('title-font', i18n.get('changeFont'));
        setText('desc-font', i18n.get('descFont'));

        // Remove Group
        setText('title-remove', i18n.get('removeElement'));
        setText('desc-remove', i18n.get('descRemove'));

        // Amazon Group
        setText('title-amazon', i18n.get('amazonTools'));
        setText('btn-remove-sponsored', i18n.get('removeSponsored'));
        setText('desc-amazon', i18n.get('descAmazon'));
        setText('btn-adjust-grid', i18n.get('adjustGridColumns'));
        setText('grid-columns-label', i18n.get('columns'));
        setText('desc-grid-columns', i18n.get('descGridColumns'));

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
    }

    // ========== 脚本注入 ==========
    
    /**
     * 注入公共模块到页面
     * @param {number} tabId
     */
    async function injectCommonScripts(tabId) {
        await chrome.scripting.executeScript({
            target: { tabId },
            files: COMMON_SCRIPTS
        });
    }

    /**
     * 注入功能模块到页面
     * @param {number} tabId
     * @param {string} feature - 功能名称
     */
    async function injectFeatureScripts(tabId, feature) {
        const scripts = FEATURE_SCRIPTS[feature];
        if (!scripts || scripts.length === 0) return;

        await chrome.scripting.executeScript({
            target: { tabId },
            files: scripts
        });
    }

    /**
     * 发送消息到内容脚本
     * @param {number} tabId
     * @param {Object} message
     */
    function sendMessage(tabId, message) {
        chrome.tabs.sendMessage(tabId, message);
    }

    // ========== 折叠面板逻辑 ==========
    const headers = document.querySelectorAll('.control-header');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const isOpen = content.classList.contains('open');

            // 关闭所有面板
            document.querySelectorAll('.control-content').forEach(c => {
                c.classList.remove('open');
                c.previousElementSibling.classList.remove('active');
            });

            if (!isOpen) {
                content.classList.add('open');
                header.classList.add('active');
            }
        });
    });

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
                    /**
                     * RGB 转 HEX
                     */
                    function rgbToHex(rgb) {
                        if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return null;
                        const match = rgb.match(/\d+/g);
                        if (!match || match.length < 3) return null;
                        const r = parseInt(match[0]);
                        const g = parseInt(match[1]);
                        const b = parseInt(match[2]);
                        // 如果是 rgba 且 alpha 为 0，视为透明
                        if (match.length >= 4 && parseInt(match[3]) === 0) return null;
                        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
                    }

                    /**
                     * 检查两个颜色是否相似（允许小差异）
                     */
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

                    // 获取页面当前背景色
                    const bodyStyle = window.getComputedStyle(document.body);
                    const bodyBgColor = rgbToHex(bodyStyle.backgroundColor) || '#ffffff';

                    // 要检查的元素选择器
                    const selectors = 'body, div, section, article, main, aside, span, p, ul, ol, li, table, tr, td, th';
                    const elements = document.querySelectorAll(selectors);

                    let count = 0;
                    elements.forEach(el => {
                        // 跳过插件元素
                        if (el.hasAttribute('data-sm-ignore') || 
                            (el.id && el.id.startsWith('sm-'))) {
                            return;
                        }

                        const style = window.getComputedStyle(el);
                        const bgColor = rgbToHex(style.backgroundColor);

                        // 只修改与页面背景同色的元素
                        if (bgColor && isSimilarColor(bgColor, bodyBgColor)) {
                            el.style.setProperty('background-color', newColor, 'important');
                            count++;
                        }
                    });

                    // 也修改 body 本身
                    document.body.style.setProperty('background-color', newColor, 'important');

                    console.log(`[Style Modifier] Modified ${count} elements with similar background color`);
                },
                args: [color]
            });
        }
    });

    // ========== 交互式功能 ==========

    /**
     * 创建功能切换处理器
     * @param {string} stateKey - 状态键
     * @param {string} feature - 功能名称
     * @param {string} mode - 选择器模式
     */
    function createToggleHandler(stateKey, feature, mode) {
        return async function() {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab) return;

            resetAllModes(stateKey);
            state[stateKey] = !state[stateKey];
            updateButtonText();
            updateStatusIndicators();

            // 注入公共模块
            await injectCommonScripts(tab.id);

            if (state[stateKey]) {
                // 注入功能模块并启动选择
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

    // 消除元素
    document.getElementById('btn-toggle-remove')?.addEventListener('click',
        createToggleHandler('removeMode', 'remove', 'remove'));

    // ========== Amazon 功能 ==========
    document.getElementById('btn-remove-sponsored')?.addEventListener('click', async function() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) return;

        await injectCommonScripts(tab.id);
        await injectFeatureScripts(tab.id, 'amazon');
        sendMessage(tab.id, { action: 'removeAmazonSponsored' });
    });

    // Amazon 网格列数调整
    const gridColumnsInput = document.getElementById('grid-columns-input');
    const gridColumnsValue = document.getElementById('grid-columns-value');

    /**
     * 应用网格列数调整
     */
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
        // 滑块拖动时更新数字显示并实时应用
        gridColumnsInput.addEventListener('input', function() {
            gridColumnsValue.textContent = gridColumnsInput.value;
            console.log('[Popup] Grid slider value changed to:', gridColumnsInput.value);
        });

        // 滑块释放时应用网格调整
        gridColumnsInput.addEventListener('change', function() {
            console.log('[Popup] Grid slider released, applying columns:', gridColumnsInput.value);
            applyGridColumns();
        });
    }

    // 点击标题也可以应用（保持兼容）
    document.getElementById('btn-adjust-grid')?.addEventListener('click', function() {
        console.log('[Popup] Grid adjust button clicked');
        applyGridColumns();
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
        const statusFont = document.getElementById('status-font');
        const statusRemove = document.getElementById('status-remove');
        const statusBg = document.getElementById('status-bg');

        if (statusFont) {
            statusFont.classList.toggle('active', state.fontMode);
        }

        if (statusRemove) {
            statusRemove.classList.toggle('active', state.removeMode);
        }

        if (statusBg) {
            statusBg.classList.toggle('active', state.bgMode);
        }
    }

    // ========== 初始化 ==========
    setLanguage();
});
