A (somewhat) prioritized list of ideas for additional features 

# Plugins

* Diagramming? 
* Page ToC from h1-6
* JSON to table
* CSV to table
* sitemap.xml
* Improve Syntax Highlighting
  * Line Numbers
  * From source file (map language from file extension), maybe slice by line numbers?
  * More languages (esp. typescript)
  * Evaluate alternatives to prism.js
* Pagination in ToC + feed
* Related pages?
* More fine grained control for RSS feed
  * rules or markup for abstract/excerpt
* Stats (Posts per Year, Avarage Post Length, Longest, Shortest, First, Last)
* Prerendered QR-Code plugin
* Topic/Tag Cloud
* https://github.com/skanaar/nomnoml
* https://www.fusejs.io/getting-started/installation.html#direct-script-include
* https://github.com/cloudcannon/pagefind
* Backlinks: Extract article preview as Hover Card (in <template>), ideally the title and <p> which includes the backlink -> candidate for custom element
* Partial TiddlyWiki format support
* CommonMark support

# CLI

* Commands
  * Structure CLI
  * Improve watch mode (incremental rebuilds, clean-up)
  * Build
  * Help
  * Init / Wizard for new projects
  * Create From Blueprint
  * Support states like draft / preview / published / revised / updated
  * Version
* More comfortable packaging
  * Single executable applications (with node 20)?
  * Publish on npm?
  * Dockerize?

# Documentation
* Improve Readme
* DocComments
* Eat your own dogfood: create doc as website with intertwingle

# Preprocessing
* Parser for TiddlyWiki WikiText subset to HTML

# Post Processing
* Sanity-Checks
  * HTML Validation
  * CSS Validation 
  * No broken internal links
  * a11y checks
* Check status code external links
* Archive external links (to replace broken links)
* Send Webmentions to external links
* Minification

# Technical
* Consider introducing typescript
* "bring your own conventions"
* Awareness for evolution in model (versioning via flat files)