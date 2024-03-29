/* eslint-disable no-var */
'use strict'

var test = require('tape')
var assert = require('assert')
var parse = require('acorn').parse
var getAssignedIdentifiers = require('../')

function getName (node) {
  assert.strictEqual(node.type, 'Identifier', 'Returned node must be an Identifier')
  return node.name
}

test('example', function (t) {
  t.plan(1)

  var ast = parse(`
    var { a, b: [ c,, ...x ], d } = whatever()
  `, { ecmaVersion: 2022 })
  var node = ast.body[0].declarations[0].id
  t.deepEqual(getAssignedIdentifiers(node).map(getName), [
    'a',
    'c',
    'x',
    'd'
  ])
})

test('simple identifiers', function (t) {
  t.plan(1)
  var ast = parse(`
    var xyz = whatever()
  `, { ecmaVersion: 2022 })
  var node = ast.body[0].declarations[0].id
  t.deepEqual(getAssignedIdentifiers(node).map(getName), ['xyz'])
})

test('array destructuring', function (t) {
  t.plan(1)
  var ast = parse(`
    var [a, b, c] = whatever()
  `, { ecmaVersion: 2022 })
  var node = ast.body[0].declarations[0].id
  t.deepEqual(getAssignedIdentifiers(node).map(getName), ['a', 'b', 'c'])
})

test('array destructuring with rest element', function (t) {
  t.plan(1)
  var ast = parse(`
    var [a, b, ...rest] = whatever()
  `, { ecmaVersion: 2022 })
  var node = ast.body[0].declarations[0].id
  t.deepEqual(getAssignedIdentifiers(node).map(getName), ['a', 'b', 'rest'])
})

test('array destructuring with holes', function (t) {
  t.plan(1)
  var ast = parse(`
    var [a, b,,,,,, boop] = whatever()
  `, { ecmaVersion: 2022 })
  var node = ast.body[0].declarations[0].id
  t.deepEqual(getAssignedIdentifiers(node).map(getName), ['a', 'b', 'boop'])
})

test('nested array destructuring', function (t) {
  t.plan(1)
  var ast = parse(`
    var [a, [[[b]], ...c], boop] = whatever()
  `, { ecmaVersion: 2022 })
  var node = ast.body[0].declarations[0].id
  t.deepEqual(getAssignedIdentifiers(node).map(getName), ['a', 'b', 'c', 'boop'])
})

test('object destructuring', function (t) {
  t.plan(1)
  var ast = parse(`
    var {a, b} = whatever()
  `, { ecmaVersion: 2022 })
  var node = ast.body[0].declarations[0].id
  t.deepEqual(getAssignedIdentifiers(node).map(getName), ['a', 'b'])
})

test('object destructuring with different names', function (t) {
  t.plan(1)
  var ast = parse(`
    var {a: b, b: lol} = whatever()
  `, { ecmaVersion: 2022 })
  var node = ast.body[0].declarations[0].id
  t.deepEqual(getAssignedIdentifiers(node).map(getName), ['b', 'lol'])
})

test('nested object destructuring', function (t) {
  t.plan(1)
  var ast = parse(`
    var {a: {b}, b: lol, c: {
      d, e: { f: g }
    }} = whatever()
  `, { ecmaVersion: 2022 })
  var node = ast.body[0].declarations[0].id
  t.deepEqual(getAssignedIdentifiers(node).map(getName), ['b', 'lol', 'd', 'g'])
})

test('object rest destructuring', function (t) {
  t.plan(1)
  var ast = parse(`
    var {a, ...b} = whatever()
  `, { ecmaVersion: 2022 })
  var node = ast.body[0].declarations[0].id
  t.deepEqual(getAssignedIdentifiers(node).map(getName), ['a', 'b'])
})

test('import declarations', function (t) {
  t.plan(2)
  var ast = parse(`
    import x, { y, z as a } from 'module'
  `, { sourceType: 'module', ecmaVersion: 2022 })
  var node = ast.body[0]
  t.deepEqual(getAssignedIdentifiers(node).map(getName), ['x', 'y', 'a'])

  ast = parse(`
    import * as ns from 'module'
  `, { sourceType: 'module', ecmaVersion: 2022 })
  node = ast.body[0]
  t.deepEqual(getAssignedIdentifiers(node).map(getName), ['ns'])
})
