# node-platform-police

Police module that verifies wix-node-platform projects.

### Current checks:
* wix-bootstrap-* modules version in production dependencies should always be latest

# install

```bash
npm install --save node-platform-police
```

#usage 

```bash
node_modules/.bin/node-platform-police
```

# Opting out checks

Just create **node-platform-police.ignore** file at the root of your project. (This is highly NOT recommended)
