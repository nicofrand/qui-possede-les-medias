import test from 'ava'
import * as utils from '../source/libs/utils'

test('isEmpty', t => {
  t.true(utils.isEmpty(''))
  t.true(utils.isEmpty(null))
  t.true(utils.isEmpty({}))
  t.true(utils.isEmpty([]))
  t.false(utils.isEmpty('f'))
  t.false(utils.isEmpty(['f']))
  t.false(utils.isEmpty({f: false}))
});

test('renderData', t => {
  const renderedData = utils.renderData([
    {
      type: 'test',
      name: 'no name',
      link: 'link'
    },
    {
      type: 'holder',
      name: 'name',
      link: 'link'
    },
    {
      type: 'holder',
      name: 'no link',
      link: null
    },
  ])
  t.true(renderedData.includes('<a href="link" rel="noopener noreferrer" target="_blank">name</a>'))
  t.true(renderedData.includes('no link'))
  t.false(renderedData.includes('rel="noopener noreferrer" target="_blank">no link</a>'))
});

test('removeAccents', t => {
  t.deepEqual(utils.removeAccents('Équipé àvec des fôtes'), 'Equipe avec des fotes');
})

test('removeTLD', t => {
  t.deepEqual(utils.removeTLD('mydomain.fr'), 'mydomain');
  t.deepEqual(utils.removeTLD('my.domain.fr'), 'my.domain');
})
