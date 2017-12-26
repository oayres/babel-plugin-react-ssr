
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-react-display-name/src/index.js#L62-L77
// crawl up the ancestry looking for possible candidates for displayName inference

/**
 * This method needs to look into the file contents
 * and find what components are being consumed. It should
 * return an array of these component references, i.e. the id (which
 * was originally the displayName)
 * @param {*} path 
 */
const findCandidateNameForExpression = path => {
  var id

  path.find(path => {
    if (path.isAssignmentExpression()) {
      id = path.node.left
    } else if (path.isVariableDeclarator()) {
      id = path.node.id
    } else if (path.isStatement()) {
      // we've hit a statement, we should stop crawling up
      return true
    }

    // we've got an id! no need to continue
    if (id) return true
  })

  return id
}

export default findCandidateNameForExpression
