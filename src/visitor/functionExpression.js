import shouldSetDisplayNameForFuncExpr from '../helpers/shouldSetDisplayNameForFuncExpr'
import findCandidateNameForExpression from '../helpers/findCandidateNameForExpression'
import assignWaitsForProperty from '../helpers/assignWaitsForProperty'

const functionExpression = (babel, path, state) => {
  if (shouldSetDisplayNameForFuncExpr(path, state.opts.knownComponents)) {
    var id = findCandidateNameForExpression(path)
    if (id) {
      assignWaitsForProperty(path, id, babel.types)
    }
  }
}

export default functionExpression
