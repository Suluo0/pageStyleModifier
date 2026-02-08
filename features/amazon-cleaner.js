/**
 * Amazon 广告清理模块
 * 功能：移除 Amazon 搜索结果中的赞助商广告
 */
(function() {
    'use strict';

    // 防止重复初始化
    if (window.SMAmazonCleaner) return;

    const AmazonCleaner = {
        /**
         * 移除赞助商内容
         */
        removeSponsored() {
            const i18n = window.SMI18n;
            let count = 0;

            // 通过文本查找赞助商标记
            const xpath = "//*[contains(text(), 'Sponsored') or contains(text(), '赞助')]";
            const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            
            for (let i = 0; i < result.snapshotLength; i++) {
                let node = result.snapshotItem(i);
                let container = node.parentElement;
                let foundContainer = false;
                
                // 向上查找容器元素
                for (let j = 0; j < 10; j++) {
                    if (!container) break;
                    
                    if (container.getAttribute('data-component-type') === 's-search-result' || 
                        (container.classList && container.classList.contains('s-result-item')) ||
                        (container.classList && container.classList.contains('a-carousel-card')) ||
                        (container.id && container.id.startsWith('ad-'))) {
                        
                        if (container.style.display !== 'none') {
                            container.style.setProperty('display', 'none', 'important');
                            count++;
                        }
                        foundContainer = true;
                        break;
                    }
                    container = container.parentElement;
                }
            }

            // 移除 AdHolder 元素
            const adHolders = document.querySelectorAll('.AdHolder, .ad-holder');
            adHolders.forEach(el => {
                if (el.style.display !== 'none') {
                    el.style.setProperty('display', 'none', 'important');
                    count++;
                }
            });

            // 移除视频广告
            const videoAds = document.querySelectorAll('[data-component-type="sbv-video-single-product"]');
            videoAds.forEach(el => {
                let container = el;
                for (let j = 0; j < 5; j++) {
                    if (!container) break;
                    if (container.classList && container.classList.contains('s-result-item')) {
                        if (container.style.display !== 'none') {
                            container.style.setProperty('display', 'none', 'important');
                            count++;
                        }
                        break;
                    }
                    container = container.parentElement;
                }
            });

            // 显示结果
            if (count > 0) {
                const msg = i18n.get('sponsoredRemoved', { n: count });
                window.SMUtils.showToast(msg);
            } else {
                window.SMUtils.showToast(i18n.get('noSponsoredFound'));
            }

            return count;
        }
    };

    // 导出到全局
    window.SMAmazonCleaner = AmazonCleaner;
})();
