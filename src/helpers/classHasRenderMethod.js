const classHasRenderMethod = path => {
  if (!path.node.body) {
    return false
  }

  const members = path.node.body.body

  for (let i = 0; i < members.length; i++) {
    if (members[i].type == 'ClassMethod' && members[i].key.name == 'render') {
      return true
    }
  }

  return false
}

export default classHasRenderMethod
