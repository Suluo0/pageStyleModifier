/**
 * 日志管理系统
 * 支持模块级日志级别控制
 * 
 * 使用方式：
 * 1. 在模块最前面获取logger实例：
 *    const log = window.SMLogger.getLogger('ModuleName', 'DEBUG');
 * 
 * 2. 使用日志方法：
 *    log.debug('调试信息');
 *    log.info('一般信息');
 *    log.warn('警告信息');
 *    log.error('错误信息');
 */
(function() {
    'use strict';

    // 防止重复初始化
    if (window.SMLogger) return;

    // ========== 日志级别定义 ==========
    const LogLevel = {
        OFF: 0,
        ERROR: 1,
        WARN: 2,
        INFO: 3,
        DEBUG: 4
    };

    // 日志级别名称映射
    const LEVEL_NAMES = {
        0: 'OFF',
        1: 'ERROR',
        2: 'WARN',
        3: 'INFO',
        4: 'DEBUG'
    };

    // 日志级别颜色配置（用于控制台输出）
    const LEVEL_STYLES = {
        ERROR: 'color: #ff4444; font-weight: bold;',
        WARN: 'color: #ffaa00; font-weight: bold;',
        INFO: 'color: #4488ff;',
        DEBUG: 'color: #888888;'
    };

    // ========== 全局配置 ==========
    const globalConfig = {
        // 全局默认日志级别
        defaultLevel: LogLevel.DEBUG,
        // 是否启用时间戳
        showTimestamp: true,
        // 是否启用模块名称
        showModuleName: true,
        // 日志前缀
        prefix: '[SM]'
    };

    // 模块日志级别配置存储
    const moduleConfigs = new Map();

    // Logger实例缓存
    const loggerInstances = new Map();

    /**
     * 解析日志级别
     * @param {string|number} level - 日志级别（字符串或数字）
     * @returns {number} 日志级别数值
     */
    function parseLevel(level) {
        if (typeof level === 'number') {
            return level >= 0 && level <= 4 ? level : LogLevel.DEBUG;
        }
        if (typeof level === 'string') {
            const upperLevel = level.toUpperCase();
            return LogLevel[upperLevel] !== undefined ? LogLevel[upperLevel] : LogLevel.DEBUG;
        }
        return LogLevel.DEBUG;
    }

    /**
     * 格式化时间戳
     * @returns {string} 格式化的时间字符串 HH:mm:ss.mmm
     */
    function formatTimestamp() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const ms = String(now.getMilliseconds()).padStart(3, '0');
        return `${hours}:${minutes}:${seconds}.${ms}`;
    }

    /**
     * 格式化日志消息
     * @param {string} moduleName - 模块名称
     * @param {string} levelName - 日志级别名称
     * @param {Array} args - 日志参数
     * @returns {Array} 格式化后的参数数组
     */
    function formatMessage(moduleName, levelName, args) {
        const parts = [];
        
        // 前缀
        parts.push(globalConfig.prefix);
        
        // 时间戳
        if (globalConfig.showTimestamp) {
            parts.push(`[${formatTimestamp()}]`);
        }
        
        // 模块名称
        if (globalConfig.showModuleName && moduleName) {
            parts.push(`[${moduleName}]`);
        }
        
        // 日志级别
        parts.push(`[${levelName}]`);
        
        return [parts.join(' '), ...args];
    }

    /**
     * Logger 类 - 模块日志记录器
     */
    class Logger {
        /**
         * @param {string} moduleName - 模块名称
         * @param {string|number} level - 日志级别
         */
        constructor(moduleName, level) {
            this.moduleName = moduleName || 'Unknown';
            this.level = parseLevel(level);
            
            // 保存模块配置
            moduleConfigs.set(this.moduleName, this.level);
        }

        /**
         * 设置日志级别
         * @param {string|number} level - 新的日志级别
         */
        setLevel(level) {
            this.level = parseLevel(level);
            moduleConfigs.set(this.moduleName, this.level);
        }

        /**
         * 获取当前日志级别
         * @returns {string} 日志级别名称
         */
        getLevel() {
            return LEVEL_NAMES[this.level];
        }

        /**
         * 检查是否应该输出指定级别的日志
         * @param {number} level - 日志级别
         * @returns {boolean}
         */
        _shouldLog(level) {
            return this.level >= level && level > LogLevel.OFF;
        }

        /**
         * 输出日志
         * @param {number} level - 日志级别
         * @param {string} method - console方法名
         * @param {Array} args - 日志参数
         */
        _log(level, method, args) {
            if (!this._shouldLog(level)) return;

            const levelName = LEVEL_NAMES[level];
            const formattedArgs = formatMessage(this.moduleName, levelName, args);
            const style = LEVEL_STYLES[levelName];

            // 使用带样式的输出（仅第一个参数）
            if (style && typeof formattedArgs[0] === 'string') {
                console[method](`%c${formattedArgs[0]}`, style, ...formattedArgs.slice(1));
            } else {
                console[method](...formattedArgs);
            }
        }

        /**
         * DEBUG级别日志
         */
        debug(...args) {
            this._log(LogLevel.DEBUG, 'log', args);
        }

        /**
         * INFO级别日志
         */
        info(...args) {
            this._log(LogLevel.INFO, 'info', args);
        }

        /**
         * WARN级别日志
         */
        warn(...args) {
            this._log(LogLevel.WARN, 'warn', args);
        }

        /**
         * ERROR级别日志
         */
        error(...args) {
            this._log(LogLevel.ERROR, 'error', args);
        }

        /**
         * 分组日志开始
         * @param {string} label - 分组标签
         */
        group(label) {
            if (this._shouldLog(LogLevel.DEBUG)) {
                console.group(`${globalConfig.prefix} [${this.moduleName}] ${label}`);
            }
        }

        /**
         * 折叠分组日志开始
         * @param {string} label - 分组标签
         */
        groupCollapsed(label) {
            if (this._shouldLog(LogLevel.DEBUG)) {
                console.groupCollapsed(`${globalConfig.prefix} [${this.moduleName}] ${label}`);
            }
        }

        /**
         * 分组日志结束
         */
        groupEnd() {
            if (this._shouldLog(LogLevel.DEBUG)) {
                console.groupEnd();
            }
        }

        /**
         * 输出表格数据
         * @param {Array|Object} data - 表格数据
         */
        table(data) {
            if (this._shouldLog(LogLevel.DEBUG)) {
                this.debug('Table data:');
                console.table(data);
            }
        }

        /**
         * 计时开始
         * @param {string} label - 计时器标签
         */
        time(label) {
            if (this._shouldLog(LogLevel.DEBUG)) {
                console.time(`${globalConfig.prefix} [${this.moduleName}] ${label}`);
            }
        }

        /**
         * 计时结束
         * @param {string} label - 计时器标签
         */
        timeEnd(label) {
            if (this._shouldLog(LogLevel.DEBUG)) {
                console.timeEnd(`${globalConfig.prefix} [${this.moduleName}] ${label}`);
            }
        }
    }

    // ========== 日志管理器 ==========
    const SMLogger = {
        // 暴露日志级别常量
        Level: LogLevel,

        /**
         * 获取或创建Logger实例
         * @param {string} moduleName - 模块名称
         * @param {string|number} level - 日志级别（默认为DEBUG）
         * @returns {Logger} Logger实例
         */
        getLogger(moduleName, level = globalConfig.defaultLevel) {
            // 如果已存在该模块的logger，返回缓存的实例
            if (loggerInstances.has(moduleName)) {
                const logger = loggerInstances.get(moduleName);
                // 如果指定了新的级别，更新它
                if (level !== undefined) {
                    logger.setLevel(level);
                }
                return logger;
            }

            // 创建新的logger实例
            const logger = new Logger(moduleName, level);
            loggerInstances.set(moduleName, logger);
            return logger;
        },

        /**
         * 设置全局默认日志级别
         * @param {string|number} level - 日志级别
         */
        setDefaultLevel(level) {
            globalConfig.defaultLevel = parseLevel(level);
        },

        /**
         * 设置指定模块的日志级别
         * @param {string} moduleName - 模块名称
         * @param {string|number} level - 日志级别
         */
        setModuleLevel(moduleName, level) {
            const logger = loggerInstances.get(moduleName);
            if (logger) {
                logger.setLevel(level);
            }
            moduleConfigs.set(moduleName, parseLevel(level));
        },

        /**
         * 批量设置模块日志级别
         * @param {Object} configs - 模块配置对象 { moduleName: level }
         */
        configure(configs) {
            Object.entries(configs).forEach(([moduleName, level]) => {
                this.setModuleLevel(moduleName, level);
            });
        },

        /**
         * 获取所有模块的日志级别配置
         * @returns {Object} 配置对象
         */
        getConfigs() {
            const configs = {};
            moduleConfigs.forEach((level, moduleName) => {
                configs[moduleName] = LEVEL_NAMES[level];
            });
            return configs;
        },

        /**
         * 设置全局配置
         * @param {Object} config - 配置对象
         */
        setGlobalConfig(config) {
            if (config.showTimestamp !== undefined) {
                globalConfig.showTimestamp = config.showTimestamp;
            }
            if (config.showModuleName !== undefined) {
                globalConfig.showModuleName = config.showModuleName;
            }
            if (config.prefix !== undefined) {
                globalConfig.prefix = config.prefix;
            }
            if (config.defaultLevel !== undefined) {
                globalConfig.defaultLevel = parseLevel(config.defaultLevel);
            }
        },

        /**
         * 禁用所有日志输出
         */
        disableAll() {
            loggerInstances.forEach(logger => {
                logger.setLevel(LogLevel.OFF);
            });
            globalConfig.defaultLevel = LogLevel.OFF;
        },

        /**
         * 启用所有日志输出（设为DEBUG级别）
         */
        enableAll() {
            loggerInstances.forEach(logger => {
                logger.setLevel(LogLevel.DEBUG);
            });
            globalConfig.defaultLevel = LogLevel.DEBUG;
        },

        /**
         * 创建快捷日志方法（用于简单场景）
         * @param {string} moduleName - 模块名称
         * @param {string|number} level - 日志级别
         * @returns {Object} 包含 debug/info/warn/error 方法的对象
         */
        create(moduleName, level) {
            const logger = this.getLogger(moduleName, level);
            return {
                debug: (...args) => logger.debug(...args),
                info: (...args) => logger.info(...args),
                warn: (...args) => logger.warn(...args),
                error: (...args) => logger.error(...args),
                setLevel: (l) => logger.setLevel(l)
            };
        }
    };

    // 导出到全局
    window.SMLogger = SMLogger;

    // 便捷方法：直接在window上提供创建logger的快捷方式
    window.createLogger = SMLogger.create.bind(SMLogger);
})();
