# intertwingle

intertwingle is a static website generator. 

I wrote it primarily to create my <a href="https://holzer.online/">personal website</a> with it. It encodes my personal conventions, but aims to generalize beyond them.

## Features

* Create RSS feeds
* Create Table Of Contents
* Syntax highlighting (powered by Prism)
* Backlinks
* Extendable by custom plugins

## Philosophy

> Everything is deeply intertwingled.
> In an important sense there are no "subjects" at all; there is only all knowledge since the cross-connections among the myriad topics of this world simply cannot be divided up neatly.
> Hypertext at last offers the possibility of representing and exploring it all without carving it up destructively.
> -- Ted Nelson (in <cite>Computer Lib/Dream Machines</cite>)

* HTML is a pretty decent markup language, when you manage to keep it DRY.
* The declarative markup should mixed as little as possible with imperative programming concepts

## Requirements

Node >= v18.13.0

## Usage:

Go to the directory of intertwingle 

```bash
node . path/to/input/directory path/to/output/directory
```

It is assumed that the input directory contains a file named intertwingle.json which contains global properties, for example:

```json
{
    "url": "https://a-very-fantastic-personal-website.com/",
    "title": "A great persons' humble abode on the interwebs",
    "author": "Some Fellow"
}
```

intertwingle will traverse the input directory and build a model of the whole website.
It classifies each file either as content file, template or static asset.
For every content file an appropriate template will be found and it will apply all plugins.
The file structure of the input directory will be recreated in the output directory.

### Content files

All html files, which are no templates, will be considered as content files. For every content file a category will be derived, either from an explicit meta tag or from the directory structure. When no meta tag with name="category" and content="name-of-the-category" is found, the name of the first directory in the path of the file will be used.

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
Without meta tag, the file /blog/2023/06-24.html would be in the category "blog"

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
The meta tag is used to declare this file as a template. The content attribute declares the name of the template. If a template with the name of a category exists, it will be selected, otherwise intertwingle will look for a template named "default", otherwise it will use the first template it found (which might be sufficient if there is only a single template)

### Plugins

Plugins manipulate the output of a content file. There implementation is where all imperative logic is encapsulated. Think of a plugin as a procedure call in form of a non-standard html tags: 

```html
<intertwingle plugin="main-content"></intertwingle>
```

Most plugins have parameters in form of attributes. 

TODO: document usage of built-in plugins. In the meantime, feel free to peruse the <a href="https://github.com/fnh/holzer.online/">source of my personal website</a> as a living example of a site built with this generator. 
