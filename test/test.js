import path from 'path'
import test from 'ava'
import dedent from 'dedent'
import format from '../src'

async function formatTester(t, {input, expected, options}) {
  expected += '\n'
  // async
  const actual = format(input, options)
  const actualSync = format.sync(input, options)
  t.truthy(actual.then)
  t.falsy(actualSync.then)
  t.is(await actual, expected)
  t.is(actualSync, expected)
}

test('main', async t => {
  await formatTester(t, {
    input: dedent`
      var bar = function fooBarFooBarFooBarFooBarFooBarFooBarFooBarFooBarFooBar
      (fooBarFooBarFooBarFooBarFooBarFooBarFooBarFooBarFooBarFooBarFooBarFooBar
      , anotherParam)
      {
                var foo
                            =
                'bar'; // comment
      }
    `,
    expected: dedent`
      var bar = function fooBarFooBarFooBarFooBarFooBarFooBarFooBarFooBarFooBar(
        fooBarFooBarFooBarFooBarFooBarFooBarFooBarFooBarFooBarFooBarFooBarFooBar,
        anotherParam
      ) {
        var foo = "bar"; // comment
      };
    `,
  })
})

test('options.filePath', async t => {
  await formatTester(t, {
    input: dedent`
      // this should be single quoted and without semi
      var foo = "bar"
    `,
    expected: dedent`
      // this should be single quoted and without semi
      var foo = 'bar'
    `,
    options: {
      filePath: path.join(__dirname, '../foo.js'),
    },
  })
})

test('options.resolveConfig', async t => {
  await formatTester(t, {
    input: dedent`
      // this should be double quoted and with semi
      var foo = "bar"
    `,
    expected: dedent`
      // this should be double quoted and with semi
      var foo = "bar";
    `,
    options: {
      filePath: path.join(__dirname, '../foo.js'),
      resolveConfig: false,
    },
  })
})

test('options.parser[prettier.format options]', async t => {
  await formatTester(t, {
    input: dedent`
      lodash ( )
    `,
    expected: dedent`
      _();
    `,
    options: {
      parser(text, {babel}) {
        const ast = babel(text)
        ast.program.body[0].expression.callee.name = '_'
        return ast
      },
    },
  })
})
