const assignWaitsForProperty = (path, nameNodeId, t, waitsForValue) => {
  if (!waitsForValue) return

  let blockLevelStmnt

  path.find(path => {
    if (path.parentPath.isBlock()) {
      blockLevelStmnt = path
      return true
    }
  })

  if (blockLevelStmnt && waitsForValue && waitsForValue.length) {
    const trailingComments = blockLevelStmnt.node.trailingComments
    delete blockLevelStmnt.node.trailingComments

    const expression = t.assignmentExpression('=', t.memberExpression(nameNodeId, t.identifier('waitsFor')), t.arrayExpression(waitsForValue))
    const waitsForStatementToAdd = t.expressionStatement(expression)
    blockLevelStmnt.insertAfter(waitsForStatementToAdd)
  }
}

export default assignWaitsForProperty
