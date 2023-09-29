# intertwingle

intertwingle is a static website generator. 

I wrote it primarily to create my <a href="https://holzer.online/">personal website</a> with it. It encodes my personal conventions, but aims to generalize beyond them.

## Features

* Create RSS feeds
* Create Table Of Contents
* Syntax highlighting (powered by Prism)
* Backlinks
* Pre-build search index for lunr.js
* Extendable by custom plugins

## Philosophy

> Everything is deeply intertwingled.
>
> In an important sense there are no "subjects" at all; there is only all knowledge since the cross-connections among the myriad topics of this world simply cannot be divided up neatly.
>
> Hypertext at last offers the possibility of representing and exploring it all without carving it up destructively.
>
> &mdash; Ted Nelson (in <cite>Computer Lib/Dream Machines</cite>)

* HTML is a pretty decent markup language, when you manage to keep it DRY.
* The declarative markup should mixed as little as possible with imperative programming concepts

## Requirements

Node >= v18.13.0

## Usage:

To build the website use
```bash
./path/to/intertwingle/index.js path/to/input/directory path/to/output/directory
```

It is assumed that the input directory contains a file named intertwingle.json which contains global properties, for example:

```json
{
    "url": "https://a-very-fantastic-personal-website.com/",
    "title": "My humble abode on the interwebs",
    "author": "Guy Incognito"
}
```

intertwingle will traverse the input directory and build a model of the whole website.
It classifies each file either as content file, template or static asset.
For every content file an appropriate template will be found and it will apply all plugins.
The file structure of the input directory will be recreated in the output directory.

### Content files

All html files, which are no templates, are content files. For every content file a category will be derived, either from an explicit meta tag or from the directory structure. When no meta tag with name="category" and content="name-of-the-category" is found, the name of the first directory in the path of the file will be used.

Consider the following directory structure.

```
 |__index.html
 |__blog
    |__index.html
    |__2023
       |__06-24.html
       |__07-01.html
       |__09-20.html
```
Unless specified explicitly different using a meta tag, the file /blog/2023/06-24.html would be in put in the category "blog"

### Templates

Consider the following minimalistic example:

```html
<html>
 <head>
  <meta name="template" content="default">
 </head>
 <body>
  <intertwingle plugin="main-content"></intertwingle>
 </body>
</html>
```
The meta tag is used to declare this file as a template. The content attribute declares the name of the template. 

When a content page is created and a template with the name of category the page belongs to exists, that will will be selected as template, otherwise intertwingle will look for a template named "default", as last fallback it will use the first template it found (which might be sufficient if there is only a single template)

### Plugins

Plugins manipulate the output of a content file. Their implementation is where all imperative logic is encapsulated. Think of a plugin as a procedure call, invoked by a non-standard html tags: 

```html
<intertwingle plugin="main-content"></intertwingle>
```

Every plugin may have parameters in form of attributes. 

The following plugins are currently built-in. Not all are yet as well generalized as I'd like them to be.

#### backlinks

Creates a list of all contante pages that link to the given page 

#### build-lunr-index

Builds an index that can be used in combination with <a href="https://lunrjs.com">lunr.js</a> to add a client-side fulltext search. Also builds a lookup table from id to title.

#### compose 

#### create-feed

```html
<meta name="no-template">
<intertwingle plugin="create-feed"
              categories="posts"
              description="My feed description"
              filename="feed.xml">
</intertwingle>
```

#### estimated-reading-time

Adds a span with the estimated reading time in minutes. Based on the number of words in the content page.

#### include

Is used to separate reusable snippets of html into external files. For example for common header and footers when there are more than one template.

#### last-update

Adds a link to the newest content page that was added.

#### main-content

Is used to mark in a template the place where the actual content page should be inserted.  

#### publication-date

Adds a time element with the publication date.

#### rewrite-dates

Reformats all time elements on a given page. 
Currently only one hard-coded format: Formats a Date as "Week/Year"

#### syntax-highlighting
```html
<code><pre><intertwingle plugin="syntax-highlighting">
function greet(name = "World") {
    console.log(`Hello ${name}`)
}</intertwingle></pre></code>
```

#### table-of-contents

Adds all elements of one or multiple given categories or topics to an table element.

#### word-count

Adds a span with the number of words in the content page.

### Examples

Feel free to peruse the <a href="https://github.com/fnh/holzer.online/">source of my personal website</a> as a living example of a site built with this generator. 
