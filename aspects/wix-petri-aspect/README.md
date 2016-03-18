# wix-petri-aspect

Aspect containing petri-specific properties (cookies).

## install

```bash
npm install --save wix-petri-aspect
```

## usage

Intended to use within request scope via framework adapter, ex. [wix-express-aspects](../wix-express-aspects).

## Api

### builder(): requestData => new WixPetriAspect(requestData)
Returns an function that, providing `requestData`(as defined by [Aspect](../wix-aspects)) returns a new instance of `WixPetriAspect`.

### WixPetriAspect extends [Aspect](../wix-aspects)

Exposed properties:
 - cookies - map of petri cookies, ex.:
 
```js
{
  "_wixAB3": "1#1"
}
```

### WixPetriAspect.export()
Returns data with petri cookies;

### WixPetriAspect.import(data)
Imports petri cookies.