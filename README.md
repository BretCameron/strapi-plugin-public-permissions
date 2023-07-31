# Strapi Plugin: Public Permissions

A plugin to automate the creation of public permissions for your chosen content types.

## Installation

```bash
npm i strapi-plugin-public-permissions
```

```bash
yarn add strapi-plugin-public-permissions
```

## Usage

In your Strapi project, add the following in `./config/plugins.js`:

```js
module.exports = {
  "public-permissions": {
    enabled: true,
    resolve: "./src/plugins/public-permissions",
    config: {
      actions: {
        "*": ["find", "findOne"],
      },
    },
  },
};
```

### Configuration

You can choose which permissions to apply to which content types by editing the `actions` object in the plugin config.

Set rules for _all_ your custom content types (anything in `./src/api/`) by using the wildcard `*`:

```json
  {
    "actions": {
      "*": ["find", "findOne"],
    }
  }
```

You can also specify permissions for specific content types, which will override the wildcard rules:

```json
  {
    "actions": {
      "article": ["find", "findOne", "create", "update", "delete"],
      "category": ["find", "findOne"],
    }
  }
```

## License

MIT License

## Links

- [Strapi website](https://strapi.io/)
- [Strapi community on Slack](https://slack.strapi.io/)
- [Strapi news on Twitter](https://twitter.com/strapijs)
- [Strapi news on Facebook](https://www.facebook.com/Strapi-616063331867161/)
- [Strapi news on LinkedIn](https://www.linkedin.com/company/strapijs/)
