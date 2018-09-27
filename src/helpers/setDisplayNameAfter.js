const setDisplayNameAfter = (path, nameNodeId, t, displayName) => {
  if (!displayName) {
    displayName = nameNodeId.name
  }

  var blockLevelStmnt
  path.find(function (path) {
    if (path.parentPath.isBlock()) {
      blockLevelStmnt = path
      return true
    }
  })

  if (blockLevelStmnt) {
    var trailingComments = blockLevelStmnt.node.trailingComments
    delete blockLevelStmnt.node.trailingComments

    var setDisplayNameStmn = t.expressionStatement(t.assignmentExpression(
      '=',
      t.memberExpression(nameNodeId, t.identifier('displayName')),
      t.stringLiteral(displayName)
    ))

    blockLevelStmnt.insertAfter(setDisplayNameStmn)    
  }
}

export default setDisplayNameAfter
