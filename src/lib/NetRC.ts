import fs from 'fs';
import os from 'os';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

export class NetRC {

   /**
    * Parsed machine configurations.
    */
   public machines: MachineCollection = {};

   /**
    * Raw contents of netrc file.
    */
   private _fileContents: string = '';

   /**
    * Path to netrc file.
    */
   private _filePath: string;

   /**
    * Constructs new NetRC class.
    *
    * @param filePath path to netrc file. Defaults to $HOME/.netrc
    */
   public constructor(filePath?: string) {
      this._filePath = filePath || this._defaultFile();
   }

   /**
    * Load and parse the .netrc file. This must be done before using any other functions.
    *
    * @param filePath path to netrc file defaults to this._filePath set in constructor.
    */
   public async load(filePath?: string): Promise<void> {
      if (!filePath) {
         filePath = this._filePath;
      }

      this._fileContents = await readFile(filePath, 'utf8');
      this._parse();
   }

   /**
    * Retrieve configuration for a specific machine.
    *
    * @param machineName name of machine to get configuration for
    * @returns configuration for the requested machine or null if no machine was found
    */
   public getConfigForMachine(machineName: string): MachineConfig | null {
      if (this.machines[machineName]) {
         return this.machines[machineName];
      }

      return null;
   }

   /**
    * Retrieves the configuration for a specific machine falling back to the default
    * config if available.
    *
    * @param machineName name of machine to get configuration for. Empty for default
    * config
    * @returns configuration for the requested machine or null if no machine was found
    */
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

   /**
    * Checks if supplied line starts a machine machine.
    *
    * @param line line to check
    */
   private _lineIsMachine(line: string): boolean {
      return /^machine/.test(line);
   }

   /**
    * Checks if supplied line starts a default config.
    *
    * @param line line to check
    */
   private _lineIsDefault(line: string): boolean {
      return /^default/.test(line);
   }

   /**
    * Checks if supplied line is a full line comment.
    *
    * @param line line to check
    */
   private _lineIsComment(line: string): boolean {
      return /^#/.test(line);
   }

   /**
    * Parses a key property line.
    *
    * @param line line to parse
    * @returns parsed value or null if unable to parse the line.
    */
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

   /**
    * Gets the default netrc file location for this os.
    */
   private _defaultFile(): string {
      const home = os.homedir();

      return path.join(home, '.netrc');
   }

   /**
    * Parse the loaded netrc file contents and populate the machines property.
    */
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

   /**
    * Parse a oneline machine config and add values to the specified machine.
    *
    * @param words each individual word from the line
    * @param machineName name of machine to add the parsed properties to.
    */
   private _addOneLineConfigToMachine(words: string[], machineName: string): void {
      for (let a = 0; a < words.length; a += 2) {
         const key = words[a];

         if (!isPropKey(key) || !words[a + 1]) {
            continue;
         }

         this.machines[machineName][key] = words[a + 1];
      }
   }

   /**
    * Parse and add a lines properities to a specified machine.
    *
    * @param line line to add
    * @param machineName machine to add properties to
    */
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
