import babel from 'rollup-plugin-babel'

export default {
  name: 'babel-plugin-react-ssr',
  input: 'src/index.js',
  output: {
    file: 'lib/index.js',
    format: 'umd'
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ]
}
