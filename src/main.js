import { fork, call } from 'redux-saga/effects'

import SagaObservable from 'saga-observable'

/*
  Our Observer will be called and create the observable.  An observable
  is create a cancellable promise then creating a queue of responses when
  the callback is received.  This allows us to stay within the saga pattern
  while handling "push" style events as well as allows us to cancel the
  promises if we need to (in the situation that our task or process are cancelled).
*/

const build_options = options => ({
  enableHighAccuracy: true,
  timeout: Infinity,
  maximumAge: Infinity,
  ...options,
})

const EVENT = 'watchPosition'

export default function* watchPositionObserverSaga(
  uid,
  options,
  {
    onEvent,
    onError,
    onCancel,
    onFinally,
  },
  ...passThroughArgs
) {
  // this should be checked before we get here and logged to the user if needed.
  if ( ! window || ! window.navigator || ! window.navigator.geolocation ) { 
    return null
  }

  options = build_options(options)
  
  let observer, listener, watcherID 
  
  try {
    observer = new SagaObservable({ name: uid || EVENT })
  
    listener = [  observer.publish, observer.publish, options ]
  
    watcherID = window.navigator.geolocation.watchPosition(
      ...listener
    )
    while (true) {
      const args = yield call([ observer, observer.next ]) || []
      if ( Array.isArray(onEvent) ) {
        yield fork(onEvent, EVENT, args[0], uid, ...passThroughArgs)
      } else if ( typeof onEvent === 'function' ) {
        yield fork([ this, onEvent ], EVENT, args[0], uid, ...passThroughArgs)
      } else {
        throw new Error('[saga-geolocation-observer] onEvent handler is invalid')
      }
    }
  } catch(error) {
    if (onError) {
      if ( Array.isArray(onError) ) {
        yield call(onError, EVENT, error, uid, ...passThroughArgs)
      } else if ( typeof onError === 'function' ) {
        yield call([ this, onError ], EVENT, error, uid, ...passThroughArgs)
      }
    } else {
      console.error(`[saga-geolocation-observer] ${error.message}`)
    }
  } finally {
    window.navigator.geolocation.clearWatch(watcherID)
    if ( yield observer.cancelled() && onCancel ) {
      if ( Array.isArray(onCancel) ) {
        yield call(onCancel, EVENT, uid, ...passThroughArgs)
      } else if ( typeof onCancel === 'function' ) {
        yield call([ this, onCancel ], EVENT, uid, ...passThroughArgs)
      }
    }
    if ( onFinally ) {
      if ( Array.isArray(onFinally) ) {
        yield call(onFinally, EVENT, uid, ...passThroughArgs)
      } else if ( typeof onFinally === 'function' ) {
        yield call([this, onFinally], EVENT, uid, ...passThroughArgs)
      }
    }
  }
}