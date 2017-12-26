import ClassDeclaration from './visitor/classDeclaration'
import FunctionDeclaration from './visitor/functionDeclaration'
import FunctionExpression from './visitor/functionExpression'
import ArrowFunctionExpression from './visitor/arrowFunctionExpression'

const transform = babel => {
  return {
    visitor: {
      ClassDeclaration: ClassDeclaration.bind(null, babel)
      // FunctionDeclaration: FunctionDeclaration.bind(null, babel),
      // FunctionExpression: FunctionExpression.bind(null, babel),
      // ArrowFunctionExpression: ArrowFunctionExpression.bind(null, babel)
    }
  }
}

export default transform
