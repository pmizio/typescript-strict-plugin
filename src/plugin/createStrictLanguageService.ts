import ts, { LanguageService, LanguageServiceHost } from 'typescript/lib/tsserverlibrary';
import { statSync } from 'fs';
import { dirname, join } from 'path';
import { log, PluginInfo } from './utils';
export type TsLib = typeof ts;

const checkFileExists = (path: string) => {
  try {
    statSync(path);

    return true;
  } catch {
    return false;
  }
};

export const createStrictLanguageService = (info: PluginInfo): LanguageService | null => {
  // INFO: in here we get path to typescript service library associate with running tsserver
  const tsLibLocation = join(dirname(info.serverHost.getExecutingFilePath()), 'tsserverlibrary.js');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const tsLib: TsLib = require(tsLibLocation);

  if (checkFileExists(tsLibLocation)) {
    try {
      // INFO: we need service host to spawn new instance of tsserver so we reuse parent one
      const clonedLanguageServiceHost: LanguageServiceHost = Object.assign(
        Object.create(Object.getPrototypeOf(info.languageServiceHost)),
        info.languageServiceHost,
      );

      const complilationSettings = clonedLanguageServiceHost.getCompilationSettings();

      clonedLanguageServiceHost.getCompilationSettings = () => ({
        ...complilationSettings,
        strict: true,
      });

      log(info, 'Strict Instance of tsserver spawned successfully!');

      return tsLib.createLanguageService(clonedLanguageServiceHost);
    } catch {
      return null;
    }
  }

  return null;
};
