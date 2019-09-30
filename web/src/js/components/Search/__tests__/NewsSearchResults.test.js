/* eslint-env jest */

import React from 'react'
import { shallow } from 'enzyme'
import moment from 'moment'
import MockDate from 'mockdate'
import { getMockBingNewsArticleResult } from 'js/utils/test-utils-search'
import Typography from '@material-ui/core/Typography'

const getMockProps = () => ({
  newsItems: [getMockBingNewsArticleResult(), getMockBingNewsArticleResult()],
})

const getMockNewsStoryProps = () => ({
  classes: {},
  item: getMockBingNewsArticleResult(),
})

const mockNow = '2017-05-19T13:59:58.000Z'

beforeEach(() => {
  jest.clearAllMocks()
  MockDate.set(moment(mockNow))
})

afterEach(() => {
  MockDate.reset()
})

describe('NewsSearchResults', () => {
  it('renders without error', () => {
    const NewsSearchResults = require('js/components/Search/NewsSearchResults')
      .default
    const mockProps = getMockProps()
    shallow(<NewsSearchResults {...mockProps} />).dive()
  })

  it('shows the "Top stories" label', () => {
    const NewsSearchResults = require('js/components/Search/NewsSearchResults')
      .default
    const mockProps = getMockProps()
    const wrapper = shallow(<NewsSearchResults {...mockProps} />).dive()
    expect(
      wrapper
        .find(Typography)
        .first()
        .render()
        .text()
    ).toEqual('Top stories')
  })

  it('only renders one news story if only one is provided', () => {
    const NewsSearchResults = require('js/components/Search/NewsSearchResults')
      .default
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockProps()
    mockProps.newsItems = [getMockBingNewsArticleResult()]
    const wrapper = shallow(<NewsSearchResults {...mockProps} />).dive()
    expect(wrapper.find(NewsSearchItem).length).toEqual(1)
  })

  it('renders three news story if three are provided', () => {
    const NewsSearchResults = require('js/components/Search/NewsSearchResults')
      .default
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockProps()
    mockProps.newsItems = [
      getMockBingNewsArticleResult(),
      getMockBingNewsArticleResult(),
      getMockBingNewsArticleResult(),
    ]
    const wrapper = shallow(<NewsSearchResults {...mockProps} />).dive()
    expect(wrapper.find(NewsSearchItem).length).toEqual(3)
  })

  it('renders only three news story even if  more are provided', () => {
    const NewsSearchResults = require('js/components/Search/NewsSearchResults')
      .default
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockProps()
    mockProps.newsItems = [
      getMockBingNewsArticleResult(),
      getMockBingNewsArticleResult(),
      getMockBingNewsArticleResult(),
      getMockBingNewsArticleResult(),
      getMockBingNewsArticleResult(),
    ]
    const wrapper = shallow(<NewsSearchResults {...mockProps} />).dive()
    expect(wrapper.find(NewsSearchItem).length).toEqual(3)
  })

  it('passes the expected props to the news story components', () => {
    const NewsSearchResults = require('js/components/Search/NewsSearchResults')
      .default
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockProps()
    mockProps.newsItems = [
      getMockBingNewsArticleResult({
        url: 'https://example.com/just-a-fake-url/',
      }),
      getMockBingNewsArticleResult({
        url: 'https://example.com/another-url/',
      }),
    ]
    const wrapper = shallow(<NewsSearchResults {...mockProps} />).dive()

    const firstNewsStory = wrapper.find(NewsSearchItem).first()
    expect(firstNewsStory.key()).toEqual('https://example.com/just-a-fake-url/')
    expect(firstNewsStory.prop('classes')).toEqual(expect.any(Object))
    expect(firstNewsStory.prop('item')).toEqual(mockProps.newsItems[0])

    const secondNewsStory = wrapper.find(NewsSearchItem).at(1)
    expect(secondNewsStory.key()).toEqual('https://example.com/another-url/')
    expect(secondNewsStory.prop('classes')).toEqual(expect.any(Object))
    expect(secondNewsStory.prop('item')).toEqual(mockProps.newsItems[1])
  })
})

describe('NewsSearchItem', () => {
  it('displays the title text', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    mockProps.item.name = 'This is A Nice Title'
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    const titleElem = wrapper.find('[data-test-id="search-result-news-title"]')
    expect(titleElem.text()).toEqual('This is A Nice Title')
    expect(titleElem.type()).toEqual('h3')
  })

  it('puts the title text in an anchor tag', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    mockProps.item.name = 'This is A Nice Title'
    mockProps.item.url = 'https://example.com/foobar/'
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    const titleElem = wrapper.find('[data-test-id="search-result-news-title"]')
    expect(titleElem.parent().type()).toEqual('a')
    expect(titleElem.parent().prop('href')).toEqual(
      'https://example.com/foobar/'
    )
  })

  it('crops the title text if it is too long', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    mockProps.item.name =
      'This is A Nice Title, But It is a Bit Wordy, Would You Not Agree? Especially This Last Part.'
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    const titleElem = wrapper.find('[data-test-id="search-result-news-title"]')
    expect(titleElem.text()).toEqual(
      'This is A Nice Title, But It is a Bit Wordy, Would You Not Agree? Especially ...'
    )
    expect(titleElem.type()).toEqual('h3')
  })

  it('displays the image content when an image exists', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    mockProps.item.image = {
      contentUrl: 'https://media.example.com/foo.png',
      thumbnail: {
        contentUrl: 'https://www.bing.com/some-url/',
        width: 700,
        height: 466,
      },
    }
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    const elem = wrapper.find(
      '[data-test-id="search-result-news-img-container"]'
    )
    expect(elem.exists()).toBe(true)
  })

  it('does not display the image content when an image does not exist', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    mockProps.item.image = undefined
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    const elem = wrapper.find(
      '[data-test-id="search-result-news-img-container"]'
    )
    expect(elem.exists()).toBe(false)
  })

  it('does not display the image (or throw an error) when the image URL is undefined', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    mockProps.item.image.thumbnail.contentUrl = undefined
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    const elem = wrapper.find(
      '[data-test-id="search-result-news-img-container"]'
    )
    expect(elem.exists()).toBe(false)
  })

  it('displays the image in an anchor tag', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    mockProps.item.image = {
      contentUrl: 'https://media.example.com/foo.png',
      thumbnail: {
        contentUrl: 'https://www.bing.com/some-url/',
        width: 700,
        height: 466,
      },
    }
    mockProps.item.url = 'https://example.com/foobar/'
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    const elem = wrapper.find(
      '[data-test-id="search-result-news-img-container"]'
    )
    expect(elem.type()).toEqual('a')
    expect(elem.prop('href')).toEqual('https://example.com/foobar/')
  })

  it('displays the expected img element', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    mockProps.item.image = {
      contentUrl: 'https://media.example.com/foo.png',
      thumbnail: {
        contentUrl: 'https://www.bing.com/some-url/',
        width: 700,
        height: 466,
      },
    }
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    const elem = wrapper.find(
      '[data-test-id="search-result-news-img-container"]'
    )
    const imgElem = elem.find('img').first()
    expect(imgElem.prop('src')).toEqual(
      'https://www.bing.com/some-url/?w=200&h=100&c=7'
    )
    expect(imgElem.prop('alt')).toEqual('')
  })

  it('displays the description text if there is no image', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    mockProps.item.image = undefined
    mockProps.item.description =
      'Wafer tiramisu chupa chups cupcake tart cupcake lemon drops sesame snaps.'
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    const elem = wrapper.find('[data-test-id="search-result-news-description"]')
    expect(elem.exists()).toBe(true)
    expect(elem.text()).toEqual(
      'Wafer tiramisu chupa chups cupcake tart cupcake lemon drops sesame snaps.'
    )
  })

  it('does not display the description text if there is no image', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    mockProps.item.image = {
      contentUrl: 'https://media.example.com/foo.png',
      thumbnail: {
        contentUrl: 'https://www.bing.com/some-url/',
        width: 700,
        height: 466,
      },
    }
    mockProps.item.description = 'Sugar plum halvah chocolate oat cake biscuit.'
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    const elem = wrapper.find('[data-test-id="search-result-news-description"]')
    expect(elem.exists()).toBe(false)
  })

  it('crops the description text if it is too long', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    mockProps.item.image = undefined
    mockProps.item.description =
      'Gummi bears biscuit bonbon jujubes cheesecake gummies cotton candy ice cream chocolate cake. Macaroon jelly beans gummies gummi bears dragée. Liquorice oat cake candy canes lollipop.'
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    const elem = wrapper.find('[data-test-id="search-result-news-description"]')
    expect(elem.exists()).toBe(true)
    expect(elem.text()).toEqual(
      'Gummi bears biscuit bonbon jujubes cheesecake gummies cotton candy ice cream chocolate cake. Macaroon jelly beans gummies ...'
    )
  })

  it('displays contractual rules text if one rule exists', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    mockProps.item.contractualRules = [
      {
        _type: 'ContractualRules/TextAttribution',
        text: 'A Good News Site',
      },
    ]
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    const attributionElems = wrapper.find(
      '[data-test-id="search-result-news-attribution"]'
    )
    expect(attributionElems.length).toEqual(1)
    expect(attributionElems.first().text()).toEqual('A Good News Site')
  })

  it('displays contractual rules text if more than one rule exists', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    mockProps.item.contractualRules = [
      {
        _type: 'ContractualRules/TextAttribution',
        text: 'A Good News Site',
      },
      {
        _type: 'ContractualRules/TextAttribution',
        text: 'Newsy News Daily',
      },
    ]
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    const attributionElems = wrapper.find(
      '[data-test-id="search-result-news-attribution"]'
    )
    expect(attributionElems.length).toEqual(2)
    expect(attributionElems.first().text()).toEqual('A Good News Site')
    expect(attributionElems.at(1).text()).toEqual('Newsy News Daily')
  })

  it('does not display contractual rules text if not provided a rules item', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    delete mockProps.item.contractualRules
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    const attributionElems = wrapper.find(
      '[data-test-id="search-result-news-attribution"]'
    )
    expect(attributionElems.exists()).toBe(false)
  })

  it('does not display contractual rules text if provided undefined rules', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    mockProps.item.contractualRules = undefined
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    const attributionElems = wrapper.find(
      '[data-test-id="search-result-news-attribution"]'
    )
    expect(attributionElems.exists()).toBe(false)
  })

  it('does not display contractual rules text if provided empty array of rules', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    mockProps.item.contractualRules = []
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    const attributionElems = wrapper.find(
      '[data-test-id="search-result-news-attribution"]'
    )
    expect(attributionElems.exists()).toBe(false)
  })

  it('does not display the provider name if a contractual rule exists', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    mockProps.item.contractualRules = [
      {
        _type: 'ContractualRules/TextAttribution',
        text: 'A Good News Site',
      },
    ]
    mockProps.item.provider = [
      {
        _type: 'Organization',
        name: 'The Pretty Good News Site',
      },
    ]
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    expect(
      wrapper.find('[data-test-id="search-result-news-attribution"]').exists()
    ).toBe(true)
    expect(
      wrapper.find('[data-test-id="search-result-news-provider"]').exists()
    ).toBe(false)
  })

  it('displays the provider name if no contractual rules exist', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    mockProps.item.contractualRules = undefined
    mockProps.item.provider = [
      {
        _type: 'Organization',
        name: 'The Pretty Good News Site',
      },
    ]
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    expect(
      wrapper.find('[data-test-id="search-result-news-attribution"]').exists()
    ).toBe(false)
    const providerTextElem = wrapper.find(
      '[data-test-id="search-result-news-provider"]'
    )
    expect(providerTextElem.exists()).toBe(true)
    expect(providerTextElem.text()).toEqual('The Pretty Good News Site')
  })

  it('displays the "time since published" text if a date is provided', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    mockProps.item.datePublished = moment(
      '2017-05-19T11:30:00.000Z'
    ).toISOString()
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    const elem = wrapper.find('[data-test-id="search-result-news-time-since"]')
    expect(elem.exists()).toBe(true)
  })

  it('does not display the "time since published" text if no date is provided', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    mockProps.item.datePublished = undefined
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    const elem = wrapper.find('[data-test-id="search-result-news-time-since"]')
    expect(elem.exists()).toBe(false)
  })

  it('shows a seconds abbreviation in the "time since published" text if published a few seconds ago', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    mockProps.item.datePublished = moment(
      '2017-05-19T13:59:56.412Z'
    ).toISOString()
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    const elem = wrapper.find('[data-test-id="search-result-news-time-since"]')
    expect(elem.text()).toEqual(' · 2s')
  })

  it('shows a seconds abbreviation in the "time since published" text if published 40 seconds ago', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    mockProps.item.datePublished = moment(
      '2017-05-19T13:59:18.412Z'
    ).toISOString()
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    const elem = wrapper.find('[data-test-id="search-result-news-time-since"]')
    expect(elem.text()).toEqual(' · 40s')
  })

  it('shows a minute abbreviation in the "time since published" text if published almost 1 minute ago', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    mockProps.item.datePublished = moment(
      '2017-05-19T13:59:02.412Z'
    ).toISOString()
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    const elem = wrapper.find('[data-test-id="search-result-news-time-since"]')
    expect(elem.text()).toEqual(' · 1m')
  })

  it('shows a minute abbreviation in the "time since published" text if published ~30 minutes ago', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    mockProps.item.datePublished = moment(
      '2017-05-19T13:29:30.000Z'
    ).toISOString()
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    const elem = wrapper.find('[data-test-id="search-result-news-time-since"]')
    expect(elem.text()).toEqual(' · 30m')
  })

  it('shows an hour abbreviation in the "time since published" text if published ~50 minutes ago', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    mockProps.item.datePublished = moment(
      '2017-05-19T13:08:30.000Z'
    ).toISOString()
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    const elem = wrapper.find('[data-test-id="search-result-news-time-since"]')
    expect(elem.text()).toEqual(' · 1h')
  })

  it('shows an hour abbreviation in the "time since published" text if published ~18 hours ago', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    mockProps.item.datePublished = moment(
      '2017-05-18T19:59:41.000Z'
    ).toISOString()
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    const elem = wrapper.find('[data-test-id="search-result-news-time-since"]')
    expect(elem.text()).toEqual(' · 18h')
  })

  it('shows a days abbreviation in the "time since published" text if published ~2 days ago', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    mockProps.item.datePublished = moment(
      '2017-05-17T19:59:41.000Z'
    ).toISOString()
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    const elem = wrapper.find('[data-test-id="search-result-news-time-since"]')
    expect(elem.text()).toEqual(' · 2d')
  })

  it('shows a months abbreviation in the "time since published" text if published ~40 days ago', () => {
    const { NewsSearchItem } = require('js/components/Search/NewsSearchResults')
    const mockProps = getMockNewsStoryProps()
    mockProps.item.datePublished = moment(
      '2017-04-11T19:59:41.000Z'
    ).toISOString()
    const wrapper = shallow(<NewsSearchItem {...mockProps} />).dive()
    const elem = wrapper.find('[data-test-id="search-result-news-time-since"]')
    expect(elem.text()).toEqual(' · 1M')
  })
})
