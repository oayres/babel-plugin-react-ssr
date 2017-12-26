const isKnownComponent = (name, knownComponents) => {
  return (name && knownComponents && knownComponents.indexOf(name) > -1)
}

export default isKnownComponent
