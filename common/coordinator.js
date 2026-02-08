/**
 * 内容脚本协调器
 * 负责接收消息并协调各功能模块
 */
(function() {
    'use strict';

    // 防止重复初始化
    if (window.SMCoordinator) return;

    // ========== 日志配置 ==========
    // 在模块最前面配置日志级别（可选：OFF/ERROR/WARN/INFO/DEBUG）
    const log = window.SMLogger ? window.SMLogger.getLogger('Coordinator', 'DEBUG') : console;

    // 编辑器实例缓存
    const editors = {
        style: null,
        background: null,
        remove: null
    };

    // 当前模式
    let currentMode = null;

    /**
     * 获取或创建编辑器实例
     * @param {string} mode
     */
    function getEditor(mode) {
        if (editors[mode]) return editors[mode];

        switch (mode) {
            case 'style':
                if (window.SMStyleEditor) {
                    editors[mode] = new window.SMStyleEditor();
                }
                break;
            case 'background':
                if (window.SMBgEditor) {
                    editors[mode] = new window.SMBgEditor();
                }
                break;
            case 'remove':
                if (window.SMRemover) {
                    editors[mode] = new window.SMRemover();
                }
                break;
        }

        return editors[mode];
    }

    /**
     * 获取所有编辑器面板元素（用于排除）
     */
    function getAllPanelElements() {
        const panels = [];
        for (const key in editors) {
            if (editors[key] && editors[key].getElement) {
                panels.push(editors[key].getElement());
            }
        }
        return panels;
    }

    /**
     * 隐藏所有编辑器面板
     */
    function hideAllPanels() {
        for (const key in editors) {
            if (editors[key] && editors[key].close) {
                editors[key].panel.style.display = 'none';
            }
        }
    }

    /**
     * 开始元素选择
     * @param {string} mode
     */
    function startSelection(mode) {
        log.info('Starting selection mode:', mode);
        currentMode = mode;
        hideAllPanels();

        const editor = getEditor(mode);
        if (!editor) {
            log.warn('Editor not available for mode:', mode);
            return;
        }

        // 配置选择器排除元素
        const selector = window.SMSelector;
        if (selector) {
            selector.setExcludeElements(getAllPanelElements());
            
            // 设置关闭回调
            editor.onClose = () => {
                selector.start(mode, onElementSelected);
            };

            // 开始选择
            selector.start(mode, onElementSelected);
        }
    }

    /**
     * 停止元素选择
     */
    function stopSelection() {
        log.info('Stopping selection mode');
        if (window.SMSelector) {
            window.SMSelector.stop();
        }
        hideAllPanels();
        currentMode = null;
    }

    /**
     * 元素选中回调
     * @param {HTMLElement} element
     */
    function onElementSelected(element) {
        if (!currentMode) return;

        const editor = getEditor(currentMode);
        if (editor && editor.show) {
            editor.show(element);
        }
    }

    /**
     * 执行 Amazon 清理
     */
    function removeAmazonSponsored() {
        log.info('Executing Amazon sponsored removal');
        if (window.SMAmazonCleaner) {
            window.SMAmazonCleaner.removeSponsored();
        }
    }

    /**
     * 执行 Amazon 网格调整
     */
    function adjustAmazonGrid(columns) {
        log.info('Adjusting Amazon grid to', columns, 'columns');
        if (window.SMAmazonGridAdjuster) {
            window.SMAmazonGridAdjuster.adjustGrid(columns);
        }
    }

    // ========== 消息监听 ==========
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        log.debug('Received message:', request.action);
        switch (request.action) {
            case 'startSelection':
                startSelection(request.mode);
                break;
            case 'stopSelection':
                stopSelection();
                break;
            case 'removeAmazonSponsored':
                removeAmazonSponsored();
                break;
            case 'adjustAmazonGrid':
                adjustAmazonGrid(request.columns);
                break;
        }
    });

    // 导出到全局
    window.SMCoordinator = {
        startSelection,
        stopSelection,
        getEditor
    };
})();
