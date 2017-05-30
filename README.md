# saga-geolocation-observer

Uses [saga-observable](https://www.npmjs.com/package/saga-observable) to provide a
simple way to user the [watchPosition](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/watchPosition) 
API.

### Installation

```
yarn add saga-geolocation-observer
```

**or**

```
npm install --save saga-geolocation-observer
```

### Simple Example

```js
import { put, fork } = 'redux-saga/effects'
import startLocationObserver from 'saga-geolocation-observer'

function* mySaga(foo, bar, ctx) {

  const task = yield fork(
    startLocationObserver,
    'watch-position-observer', // uid
    { enableHighAccuracy: true }, // PositionOptions (@ https://developer.mozilla.org/en-US/docs/Web/API/PositionOptions )
    {
      onEvent:  handleEvent,
      onError:  handleError,
      // optionally use [ context, fn ] for binding context.
      onCancel: [ ctx, handleCancellation ] ,
      // called when finally is reached (catch or cancel)
      onFinally: handleComplete,
    }, // optional lifecycle events, called as saga if possible.
    /* pass through args are sent to the handlers */
    foo, bar
  )
  
}

function* handleEvent(event, value, uid, ...passThroughArgs) {
  yield put({
    type: 'LOCATION_EVENT',
    event, // 'watchPosition'
    value, // Position (@ https://developer.mozilla.org/en-US/docs/Web/API/Position)
    uid, // 'watch-position-observer'
    passThroughArgs, // [ foo, bar ]
  })
}

function* handleError(event, error, uid, ...passThroughArgs) {
  /* ... handle error ... */
}

function* handleCancellation(event, uid, ...passThroughArgs) {
  /* ... handle cancellation ... */
}

function* handleComplete(event, uid, ...passThroughArgs) {
  /* ... handle finished ... */
}
```