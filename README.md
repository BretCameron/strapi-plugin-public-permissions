# Strapi Plugin: Public Permissions

A plugin to automate the creation of public permissions for your chosen API content types and plugins.

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
      plugins: {
        "users-permissions.auth": ["callback", "connect", "register"],
        "users-permissions.permissions": [],
        "users-permissions.role": [],
        "users-permissions.user": ["me"],
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

### `plugins`

Plugins work similarly to actions, except there is no wildcard option.

To add a plugin permission, in the configuration you must specify the full model path, such as `email.email`, `i18n.locales`, `users-permissions.auth`, `users-permissions.role`, and so on. 

Then, as for actions, you can specify an array of permissions to apply to that plugin.

For example:

```json
  {
    "plugins": {
      "email.email": ["send"],
      "i18n.locales": ["listLocales"],
    }
  }
```

Note that any permissions not specified in the array for a particular model will be removed. So, in the above example, the `email.email` plugin will only have the `send` permission, and the `i18n.locales` plugin will only have the `listLocales` permission.

To remove all public permissions for a plugin, set the value to an empty array:

```json
  {
    "plugins": {
      "email.email": [],
    }
  }
```


If you set one plugin's model to be an empty array, it will remove all permissions for that specific model, but the plugin’s other permissions will be unaffected. For example, if you set the `users-permissions.permissions` plugin to be an empty array, `users-permissions.role` will not be affected as that is a different model.

### `verbose`

To see `info` logs from the plugin in your terminal, set `verbose` to `true` in the plugin config:

```json
  {
    "verbose": true,
  }
```

The default value is `false`.

## License

MIT License

## Links

- [Strapi website](https://strapi.io/)
- [Strapi news on Twitter](https://twitter.com/strapijs)
- [Strapi news on Facebook](https://www.facebook.com/Strapi-616063331867161/)
