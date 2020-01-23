import fs from 'fs';
import os from 'os';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

export class NetRC {
   public machines: MachineCollection = {};

   private _fileContents: string = '';
   private _filePath: string;

   public constructor(filePath?: string) {
      this._filePath = filePath || this._defaultFile();
   }

   public async load(filePath?: string): Promise<void> {
      if (!filePath) {
         filePath = this._filePath;
      }

      this._fileContents = await readFile(filePath, 'utf8');
      this._parse();
   }

   public getConfigForMachine(machineName: string): MachineConfig | null {
      if (this.machines[machineName]) {
         return this.machines[machineName];
      }

      return null;
   }

   public getConfig(machineName?: string): MachineConfig | null {
      let config = null;

      if (machineName) {
         config = this.getConfigForMachine(machineName);
      }

      if (!config) {
         config = this.getConfigForMachine('default');
      }

      return config;
   }

   private _lineIsMachine(line: string): boolean {
      return /^machine/.test(line);
   }

   private _lineIsDefault(line: string): boolean {
      return /^default/.test(line);
   }

   private _lineIsComment(line: string): boolean {
      return /^#/.test(line);
   }

   private _parseKeyLine(line: string): ParsedLine | null {
      // 1st group = key, 2nd group = value 3rd group = comment
      const matches = line.match(/^(password|login|account|macdef)\s+(.+?(?=\s+#|$))(\s+#)?(.*)?/),
            parsed = { key: '', value: '', comment: '' };

      if (!matches || matches.length < 2) {
         return null;
      }

      parsed.key = matches[1];

      if (matches.length > 2) {
         parsed.value = matches[2];
      }

      if (matches.length > 3) {
         parsed.comment = matches[3];
      }

      return parsed;
   }

   private _defaultFile(): string {
      const home = os.homedir();

      return path.join(home, '.netrc');
   }

   private _parse(): void {
      const lines = this._fileContents.split('\n');

      let currentMachine: string = '';

      lines.forEach((line) => {
         line = line.trim();

         if (!line.length || this._lineIsComment(line)) {
            return;
         }

         if (this._lineIsMachine(line)) {
            // match[1] = machine name match[2] = config matterial if any
            const machineLineMatch = line.match(/^machine\s+(.+?(?=\s+#|$))(\s+#)?(.*)?/);

            if (machineLineMatch && machineLineMatch.length > 1) {
               const matchedWords = machineLineMatch[1].split(' '),
                     machineName = matchedWords[0];

               this.machines[machineName] = {};
               currentMachine = machineName;

               if (matchedWords.length > 1) {
                  matchedWords.shift();
                  this._addOneLineConfigToMachine(matchedWords, currentMachine);
               }
            }

            return;
         }

         if (this._lineIsDefault(line)) {
            this.machines.default = {};
            currentMachine = 'default';
            return;
         }

         // If we've gotten to this point and we still don't have a machine to put the
         // settings in, go to the next line
         if (!currentMachine || !this.machines[currentMachine]) {
            return;
         }

         this._addLineToMachine(line, currentMachine);
      });
   }

   private _addOneLineConfigToMachine(words: string[], machineName: string): void {
      for (let a = 0; a < words.length; a += 2) {
         const key = words[a];

         if (!isPropKey(key) || !words[a + 1]) {
            continue;
         }

         this.machines[machineName][key] = words[a + 1];
      }
   }

   private _addLineToMachine(line: string, machineName: string): void {
      const parsedLine = this._parseKeyLine(line);

      if (!parsedLine || !this.machines[machineName]) {
         return;
      }

      // eslint-disable-next-line default-case
      switch (parsedLine.key) {
         case 'login': {
            this.machines[machineName].login = parsedLine.value;
            break;
         }
         case 'password': {
            this.machines[machineName].password = parsedLine.value;
            break;
         }
         case 'account': {
            this.machines[machineName].account = parsedLine.value;
            break;
         }
         case 'macdef': {
            this.machines[machineName].macdef = parsedLine.value;
            break;
         }
      }
   }
}

export type PropKey = 'login' | 'password' | 'account' | 'macdef';

export function isPropKey(key: string): key is PropKey {
   return key === 'login' || key === 'password' || key === 'account' || key === 'macdef';
}

export type MachineConfig = { [K in PropKey]?: string };

export interface MachineCollection {
   [key: string]: MachineConfig;
}

export interface ParsedLine {
   key: string;
   value: string;
   comment: string;
}
