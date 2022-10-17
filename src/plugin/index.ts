import { PluginStrictFileChecker } from './PluginStrictFileChecker';
import { createStrictLanguageService } from './createStrictLanguageService';
import { log, PluginInfo, setupProxy, turnOffStrictMode, turnOnStrictMode } from './utils';

const init: ts.server.PluginModuleFactory = () => {
  function create(info: PluginInfo) {
    const proxy = setupProxy(info);
    const strictLanguageService = createStrictLanguageService(info);
    log(info, 'Plugin initialized');

    proxy.getSemanticDiagnostics = function (filePath) {
      const strictFile = new PluginStrictFileChecker(info).isFileStrict(filePath);

      if (strictLanguageService) {
        if (strictFile) {
          return strictLanguageService.getSemanticDiagnostics(filePath);
        }
      } else {
        // INFO: fallback if plugin cannot construct additional language service
        if (strictFile) {
          turnOnStrictMode(info, info.project.getCompilerOptions());
        } else {
          turnOffStrictMode(info, info.project.getCompilerOptions());
        }
      }

      return info.languageService.getSemanticDiagnostics(filePath);
    };

    return proxy;
  }

  return { create };
};

module.exports = init;
