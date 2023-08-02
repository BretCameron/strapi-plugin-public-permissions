# Strapi Plugin: Public Permissions

A plugin to automate the creation of public permissions for your chosen content types.

<img style="margin-block-start:8px;margin-block-end:12px;" width="120px" src="public/logo.png" alt="" />

## Installation

```bash
npm i strapi-plugin-public-permissions
```

```bash
yarn add strapi-plugin-public-permissions
```

Now, in your Strapi project, add the following in `./config/plugins.js`:

```js
module.exports = {
  "public-permissions": {
    enabled: true,
    config: {
      verbose: true,
      actions: {
        "*": ["find", "findOne"],
      },
    },
  },
};
```

### Configuration

### `actions`

You can choose which permissions to apply to which content types by editing the `actions` object in the plugin config.

Set rules for _all_ your custom content types (anything in `./src/api/`) by using the wildcard `*`:

```json
  {
    "actions": {
      "*": ["find", "findOne"],
    }
  }
```

You can also specify permissions for specific content types, which will override the wildcard rules. Use the `singularName` name for your content type, which is the name of its folder in `./src/api/`, and is usually lower-kebab-case: 

```json
  {
    "actions": {
      "article": ["find", "findOne", "create", "update", "delete"],
      "category": ["find", "findOne"],
    }
  }
```

To remove public permissions for a content type, set the value to an empty array:

```json
  {
    "actions": {
      "*": ["find", "findOne"],
      "private-content-type": [],
    }
  }
```

### `verbose`

To see `info` logs from the plugin in your terminal, set `verbose` to `true` in the plugin config:

```json
  {
    "verbose": true,
  }
```

The default value is `false`.

### `maxParallelOperations`

To keep the plugin from overloading your database, you can set a limit on the number of parallel operations it will perform. The default value is `8`.


```json
  {
    "maxParallelOperations": 8,
  }
```

Alternatively, if you have a large project and want to speed up the bootstrap process, you could try increasing the limit. You should consider the resources available to your server and database when setting this value.

## License

MIT License

## Links

- [Strapi website](https://strapi.io/)
- [Strapi news on Twitter](https://twitter.com/strapijs)
- [Strapi news on Facebook](https://www.facebook.com/Strapi-616063331867161/)
