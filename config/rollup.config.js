// import uglify from 'rollup-plugin-uglify'
import babel from 'rollup-plugin-babel'

export default {
  name: 'babel-plugin-react-cohere',
  input: 'src/index.js',
  output: {
    file: 'lib/index.js',
    format: 'umd'
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
    // resolve({
    //   jsnext: true,
    //   main: true,
    //   preferBuiltins: false,
    //   browser: true
    // }),
    // uglify()
  ]
}
