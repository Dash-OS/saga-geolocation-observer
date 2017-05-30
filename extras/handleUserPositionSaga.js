/*
  Handle the User Position Coordinates and return a value.  This expects the 
  caller to bind `this` to the function before calling it so that it can 
  get and save the coords object for the next evaluation.
*/
export default function* handleUserPosition(value, uid) {
  console.log(value)
  if ( value.code === 2 ) {
    return console.error('Received Error While Requesting User Location: ', value.message)
  } else if ( ! value.coords ) {
    return console.error('Coordinates Not Found in Position Response: ', value)
  }

  const { latitude, longitude, accuracy } = value.coords

  if ( ! latitude || ! longitude || ! accuracy ) {
    return console.error('Received Invalid Coordinates for User Location: ', value)
  }

  if ( this.state.coords ) {
    // We want to check how much we have moved before triggering
    if (
        (    Math.abs(this.state.coords.latitude  - latitude)  < 0.0005
          && Math.abs(this.state.coords.longitude - longitude) < 0.0005
        ) &&
        accuracy >= this.state.coords.accuracy
    ) { return }
  }

  this.state.coords = value.coords

  return {
    latitude,
    longitude,
    accuracy,
    lastUpdated: value.timestamp
  }

}