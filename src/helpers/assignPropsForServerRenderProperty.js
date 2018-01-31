const assignPropsForServerRenderProperty = (path, nameNodeId, t, propsForServerRenderValue) => {
  if (!propsForServerRenderValue) return

  if (propsForServerRenderValue && propsForServerRenderValue.length) {
    const node = t.classProperty(
      t.identifier('propsForServerRender'),
      t.arrayExpression(propsForServerRenderValue),
      null,
      null,
      false
    )

    path.unshiftContainer('body', node)
    path.get('body.0').node.static = true
  }
}

export default assignPropsForServerRenderProperty
