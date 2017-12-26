import shouldSetDisplayNameForFuncExpr from '../helpers/shouldSetDisplayNameForFuncExpr'
import findCandidateNameForExpression from '../helpers/findCandidateNameForExpression'
import assignWaitsForProperty from '../helpers/assignWaitsForProperty'

const arrowFunctionExpression = (babel, path, state) => {
  // if (shouldSetDisplayNameForFuncExpr(path, state.opts.knownComponents)) {
  //   const id = findCandidateNameForExpression(path)
  //   console.info('Got an ID: ', id)

  //   if (id) {
  //     assignWaitsForProperty(path, id, babel.types)
  //   }
  // }
}

export default arrowFunctionExpression
