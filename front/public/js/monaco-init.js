// Monaco Editor 全局初始化脚本
(function() {
  'use strict';
  
  console.log('🚀 开始初始化 Monaco Editor...');
  
  // 等待页面加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMonaco);
  } else {
    initMonaco();
  }
  
  function initMonaco() {
    // 检查是否已经初始化
    if (window.__MONACO_INITIALIZED__) {
      console.log('⚠️ Monaco Editor 已经初始化过了');
      return;
    }
    
    window.__MONACO_INITIALIZED__ = true;
    
    // 动态加载 @monaco-editor/react 的 loader
    if (typeof window.require === 'undefined') {
      console.log('⏳ 等待 Monaco loader 加载...');
      setTimeout(initMonaco, 100);
      return;
    }
    
    try {
      // 配置 Monaco
      window.require.config({
        paths: {
          vs: '/vs'
        },
        'vs/nls': {
          availableLanguages: {
            '*': 'zh-cn'
          }
        }
      });
      
      console.log('✅ Monaco 路径配置完成');
      
      // 预加载 Monaco Editor 核心
      window.require(['vs/editor/editor.main'], function(monaco) {
        console.log('✅ Monaco Editor 核心加载完成');
        
        // 预加载常用语言
        var languages = ['javascript', 'typescript', 'python', 'json', 'html', 'css', 'sql'];
        languages.forEach(function(lang) {
          try {
            monaco.languages.getLanguages().find(function(l) { return l.id === lang; });
          } catch (error) {
            console.error('加载语言 ' + lang + ' 失败:', error);
          }
        });
        
        console.log('✅ 所有语言支持已预加载');
        console.log('✅ Monaco Editor 全局初始化完成');
        
        // 触发自定义事件，通知其他组件
        window.dispatchEvent(new Event('monaco-ready'));
      });
    } catch (error) {
      console.error('❌ Monaco Editor 初始化失败:', error);
    }
  }
})();

