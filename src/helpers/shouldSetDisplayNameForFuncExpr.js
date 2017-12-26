import doesReturnJSX from './doesReturnJSX'
import isKnownComponent from './isKnownComponent'

const shouldSetDisplayNameForFuncExpr = (path, knownComponents) => {
  // Parent must be either 'AssignmentExpression' or 'VariableDeclarator' or 'CallExpression' with a parent of 'VariableDeclarator'
  var id
  if (path.parentPath.node.type === 'AssignmentExpression' &&
      path.parentPath.node.left.type !== 'MemberExpression' && // skip static members 
      path.parentPath.parentPath.node.type == 'ExpressionStatement' &&
      path.parentPath.parentPath.parentPath.node.type == 'Program') {
    id = path.parentPath.node.left
  } else {
    // if parent is a call expression, we have something like (function () { .. })()
    // move up, past the call expression and run the rest of the checks as usual
    if(path.parentPath.node.type === 'CallExpression') {
      path = path.parentPath
    }

    if (path.parentPath.node.type === 'VariableDeclarator') {
      if (path.parentPath.parentPath.parentPath.node.type === 'ExportNamedDeclaration' ||
          path.parentPath.parentPath.parentPath.node.type === 'Program') {
        id = path.parentPath.node.id
      }
    }
  }

  if (id) {
    if (id.name && isKnownComponent(id.name, knownComponents)) {
      return true
    }

    return doesReturnJSX(path.node.body)
  }

  return false
}

export default shouldSetDisplayNameForFuncExpr
