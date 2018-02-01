const assignStaticProperty = (path, types, propertyName, propertyValue) => {
  if (propertyValue && propertyValue.length) {
    const node = types.classProperty(
      types.identifier(propertyName),
      types.arrayExpression(propertyValue),
      null,
      null,
      false
    )

    path.unshiftContainer('body', node)
    path.get('body.0').node.static = true
  }
}

export default assignStaticProperty
