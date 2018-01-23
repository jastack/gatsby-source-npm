const algoliasearch = require(`algoliasearch`)
const crypto = require(`crypto`)

var client = algoliasearch(`OFCNCOG2CU`, `f54e21fa3a2a0160595bb058179bfb1e`)
var index = client.initIndex(`npm-search`)

const createContentDigest = obj =>
  crypto
    .createHash(`md5`)
    .update(JSON.stringify(obj))
    .digest(`hex`)

exports.sourceNodes = async ({ boundActionCreators }) => {
  const { createNode } = boundActionCreators

  console.log(`Grabbing NPM packages...`)

  const data = await index.search({
    query: ``,
    filters: `(keywords:gatsby-plugin OR keywords:gatsby-component)`,
    hitsPerPage: 1000,
  })

  data.hits.forEach(hit => {
    if (hit.readme.includes("![")){
      return
    }


    const parentId = `plugin ${hit.objectID}`
    const readmeNode = {
      id: `readme ${hit.objectID}`,
      parent: parentId,
      slug: `/packages/en/${hit.objectID}`,
      children: [],
      internal: {
        type: `NPMPackageReadme`,
        mediaType: `text/markdown`,
        content: hit.readme,
      }
    }
    readmeNode.internal.contentDigest = createContentDigest(readmeNode)
    // Remove unneeded data
    delete hit.readme
    delete hit._highlightResult
    delete hit.versions

    const node = {
      ...hit,
      deprecated: `${hit.deprecated}`,
      id: parentId,
      parent: null,
      children: [],
      readme___NODE: readmeNode.id,
      title: `${hit.objectID}`,
      internal: {
        type: `NPMPackage`,
        content: hit.readme,
      },
    }
    node.internal.contentDigest = createContentDigest(node)
    createNode(readmeNode)
    createNode(node)

  })

  return
}
