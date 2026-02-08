/**
 * 国际化模块
 * 支持中英文自动切换
 */
(function() {
    'use strict';

    // 防止重复初始化
    if (window.SMI18n) return;

    // 语言字典
    const dictionary = {
        // 应用标题
        'title': { zh: '样式修改器', en: 'Style Modifier' },
        'apply': { zh: '确定', en: 'Apply' },

        // 功能组标题
        'interfaceStyle': { zh: '修改界面样式', en: 'Appearance' },
        'changeFont': { zh: '修改字体样式', en: 'Text Style' },
        'removeElement': { zh: '隐藏元素', en: 'Hide Elements' },
        'amazonTools': { zh: 'Amazon 工具', en: 'Amazon Tools' },

        // 界面样式子功能
        'pageBackground': { zh: '页面背景色', en: 'Page Background' },
        'setBodyBg': { zh: '设置背景色', en: 'Set Background' },
        'setGlobalBg': { zh: '统一背景色', en: 'Unify Background' },
        'elementBg': { zh: '单独修改背景', en: 'Edit Element Background' },
        'startModifyBg': { zh: '开始修改', en: 'Start Editing' },
        'stopModifyBg': { zh: '停止修改', en: 'Stop Editing' },
        'descElementBg': { zh: '点击页面上的元素来修改其背景色', en: 'Click on any element to change its background color' },
        'startModify': { zh: '开始修改', en: 'Start Editing' },
        'stopModify': { zh: '停止修改', en: 'Stop Editing' },
        'descFont': { zh: '点击页面上的文字来修改其样式', en: 'Click on any text to change its style' },


        'startRemove': { zh: '开始隐藏', en: 'Start Hiding' },
        'stopRemove': { zh: '停止隐藏', en: 'Stop Hiding' },
        'descRemove': { zh: '点击页面上的元素来隐藏它', en: 'Click on any element to hide it' },

        // Amazon
        'removeSponsored': { zh: '清除广告内容', en: 'Remove Ads' },
        'descAmazon': { zh: '自动隐藏 Amazon 搜索结果中的广告', en: 'Automatically hide sponsored products in search results' },
        'adjustGridColumns': { zh: '调整单行列数', en: 'Adjust Columns' },
        'columns': { zh: '列数', en: 'Columns' },
        'descGridColumns': { zh: '调整 Amazon 搜索结果的显示列数（2-8列）', en: 'Adjust the number of columns for Amazon search results (2-8 columns)' },

        // 编辑器面板
        'styleEdit': { zh: '文字样式', en: 'Text Style' },
        'bgEdit': { zh: '背景色', en: 'Background Color' },
        'fontSize': { zh: '字体大小', en: 'Font Size' },
        'fontWeight': { zh: '字体粗细', en: 'Font Weight' },
        'fontFamily': { zh: '字体', en: 'Font' },
        'color': { zh: '文字颜色', en: 'Text Color' },
        'backgroundColor': { zh: '背景颜色', en: 'Background Color' },
        'applySimilar': { zh: '应用到相似元素', en: 'Apply to similar items' },
        'similarHint': { zh: '会同时修改页面上相似的内容', en: 'Will also change similar items on the page' },

        // 移除确认
        'removeConfirm': { zh: '确定要隐藏这个元素吗？', en: 'Hide this element?' },
        'removeHint': { zh: '刷新页面后会恢复显示', en: 'Refresh the page to show it again' },
        'removeSimilar': { zh: '同时隐藏相似元素', en: 'Also hide similar items' },
        'remove': { zh: '隐藏', en: 'Hide' },
        'cancel': { zh: '取消', en: 'Cancel' },
        'sponsoredRemoved': { zh: '已隐藏 {n} 个广告', en: 'Hidden {n} ads' },
        'noSponsoredFound': { zh: '未发现广告内容', en: 'No ads found' }
    };

    const I18n = {
        _lang: null,

        /**
         * 初始化语言设置
         */
        init() {
            if (this._lang) return;
            
            try {
                // Chrome Extension 环境
                if (typeof chrome !== 'undefined' && chrome.i18n) {
                    this._lang = chrome.i18n.getUILanguage();
                }
            } catch (e) {
                // 忽略错误
            }
            
            // 回退到浏览器语言
            if (!this._lang) {
                this._lang = navigator.language || navigator.userLanguage || 'en';
            }
        },

        /**
         * 判断是否为中文环境
         * @returns {boolean}
         */
        isZh() {
            if (!this._lang) this.init();
            return this._lang && this._lang.startsWith('zh');
        },

        /**
         * 获取翻译文本
         * @param {string} key - 翻译键
         * @param {Object} params - 替换参数，如 {n: 5}
         * @returns {string} 翻译后的文本
         */
        get(key, params = {}) {
            const isZh = this.isZh();
            const entry = dictionary[key];
            
            if (!entry) return key;
            
            let text = isZh ? entry.zh : entry.en;
            
            // 替换参数
            Object.keys(params).forEach(param => {
                text = text.replace(`{${param}}`, params[param]);
            });
            
            return text;
        },

        /**
         * 获取当前语言
         * @returns {string}
         */
        getLang() {
            if (!this._lang) this.init();
            return this._lang;
        }
    };

    // 初始化
    I18n.init();

    // 导出到全局
    window.SMI18n = I18n;
})();
