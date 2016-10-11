# travix-logger

[![Build Status](https://img.shields.io/travis/Travix-International/travix-logger/master.svg)](http://travis-ci.org/Travix-International/travix-logger) [![npm](https://img.shields.io/npm/v/travix-logger.svg)](https://www.npmjs.com/package/travix-logger)

> Logger library for the browser and node.js

## Installation

Install it via [npm](https://npmjs.com):

```
$ npm install --save travix-logger
```

## Usage

Example usage in ES6 (in node.js and webpack/browserify bundles):

```js
import { Logger, configureConsoleTransport } from 'travix-logger';

const logger = new Logger({
  transports: [
    configureConsoleTransport()
  ]
});

logger.log('error', 'Some error occurred', { meta: 'values' });

// same as
logger.error('Some error occurred', { meta: 'values' });
```

In the browser:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.15.0/lodash.min.js"></script>
<script src="https://unpkg.com/async@1.5.2/dist/async.min.js"></script>

<script src="https://unpkg.com/travix-logger@latest/dist/travix-logger.min.js"></script>

<script>
  // now available as `window.TravixLogger`
</script>
```

---

# Guide

## Levels

Levels are type of logs that you can capture with `travix-logger`. If you have a `warn` level, it will be made accessible to you from the `Logger` instance as `logger.warn(message, meta)`.

By default, these levels are used, which follows npm:

* `error`
* `warn`
* `info`
* `verbose`
* `debug`
* `silly`

You can override the levels data, at `Logger` instance level as follows:

### Custom levels

```js
import { Logger } from 'travix-logger';

const logger = new Logger({
  levels: {
    error: {
      methodName: 'error'
    },
    warn: {
      // if `methodName` is not present, it will default to the key `warn`
    }
  }
});
```

## Transports

Transports are responsible for storing the logs. Each instance of `Logger` can have multiple transports. For example, one Transport can be responsible for printing out the logs in console, while the other can sent it to a remote server.

This library already ships with a `ConsoleTransport` by default, which can be used right away:

```js
import { Logger, configureConsoleTransport } from 'travix-logger';

const logger = new Logger({
  transports: [
    configureConsoleTransport()
  ]
});
```

Whenever you call `logger.log()` for example, the `ConsoleTransport` would take up the responsibility of printing out the log to console every time.

### Custom transport

Creating custom transports is very easy, and the library already comes with the necesasry utilities for you:

```js
// ./transports/MyCustomTransport.js

import { createTransport } from 'travix-logger';

export default createTransport({
  initialize() {
    // you have access to Logger instance as `this.logger`.
  },

  log(level, message, meta, cb) {
    // do something with the data
    console.log(level, message, meta);

    // trigger the callback, when successful
    cb(null);

    // if any error while processing the log
    cb(new Error('Something went wrong while processing the log'));
  }
});
```

Now you can pass it as a Transport while instantiating a new Logger instance:

```js
import { Logger } from 'travix-logger';
import MyCustomTransport from './transports/MyCustomTransport';

const logger = new Logger({
  transports: [
    MyCustomTransport
  ]
});
```

## Formatters

Formatters can intercept your log data, and modify them before they are sent to Transports.

### Custom formatter

They are just plain synchronous functions, which accept the same arguments as `Logger.log()`, and returns the modified values.

```js
import { Logger } from 'travix-logger';

function myCustomFormatter(level, message, meta) {
  meta.addedNewKey = 'some value';

  if (meta.creditCardNumber) {
    meta.creditCardNumber = mask(meta.creditCardNumber);
  }

  message += ' [appended message]';

  return {
    level,
    message,
    meta
  };
}

const logger = new Logger({
  formatters: [
    myCustomFormatter
  ]
});
```

---

# API

## Logger

### Constructor options

#### `levels`

(optional) Levels object, where level name is the `key`.

#### `transports`

Array of Transport classes.

#### `formatters`

Array of Formatter functions.

#### `defaultMeta`

(optional) Default `meta` object that logs' meta will extend from.

### Attributes

#### `options`

Options passed during construction.

### Methods

In addition to the methods listed below, `Logger` instances will also have methods according to the `levels`.

#### `log`

> `log(level, message, meta = {}, logCallback = null)`

## createTransport

> createTransport(options = {})

### Attributes

#### logger

Reference to the parent `Logger` instance.

### Methods

#### initialize

> initialize()

Called when the Tranport class is constructed.

#### log

> log(level, message, meta, cb)

This method must be implemented when creating a new Transport.

---

# Built-in transports

## Console

A configureable `ConsoleTransport` is shipped with the package:

```js
import { Logger, configureConsoleTransport } from 'travix-logger';

const logger = new Logger({
  transports: [
    configureConsoleTransport({
      // you can optionally override the `console` function
      console: myAwesomeConsoleObject
    })
  ]
});
```

### Options

#### `console`

Unless any function is provided here, it will default to the global scope's `console` object. Like `window.console` in the browser.

---

## Release

To release a new version:

```
$ make release VERSION=patch
```

`VERSION` value can be `patch`, `minor`, or `major` following [semver](http://semver.org/).

## License

MIT © [Travix International](http://travix.com)
