# netrc-reader

[![NPM Version](https://img.shields.io/npm/v/netrc-reader.svg)](https://www.npmjs.com/package/netrc-reader)
[![License](https://img.shields.io/github/license/jimjenkins5/netrc-reader.svg)](./LICENSE)
[![Build Status](https://travis-ci.org/jimjenkins5/netrc-reader.svg?branch=master)](https://travis-ci.org/jimjenkins5/netrc-reader)
[![Dependency Status](https://david-dm.org/jimjenkins5/netrc-reader.svg)](https://david-dm.org/jimjenkins5/netrc-reader)
[![Dev Dependency Status](https://david-dm.org/jimjenkins5/netrc-reader/dev-status.svg)](https://david-dm.org/jimjenkins5/netrc-reader#info=devDependencies&view=table)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)


## What?

This is a small utility to read and parse credentials from the .netrc file.

## Why?

Because using passwords on the commandline is bad. Baking passwords into scripts is worse.
And all the other utilities had bugs.

## How do you use it?

```javascript
import { NetRC } from 'netrc-reader';


async function getNetRCCredentials() {
   const netrc = new NetRC();

   await netrc.load();

   const machine = netrc.getConfig('example.com');

   if (!(machine && machine.login && machine.password)) {
      throw new Error(`No matching credentials found in .netrc for machine name: example.com`);
   }

   return {
      login: machine.login,
      password: machine.password,
   };
}
```

## License

This software is released under the MIT license. See [the license
file](LICENSE) for more details.
