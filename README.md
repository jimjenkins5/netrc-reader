# netrc-reader

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
