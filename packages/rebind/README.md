# Package Name

[![npm version](https://img.shields.io/npm/v/@webly/rebind.svg)](https://www.npmjs.com/package/@webly/rebind)
[![gzip](https://deno.bundlejs.com/badge?q=@webly/rebind)](https://bundlejs.com/?q=@webly/rebind)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

#

## 📦 Installation

```bash
npm install @webly/rebind
```

---

## 🚀 Quick Start

Briefly show the most common use case.

```html
<head>
  <title @text="{title}"></title>
  
  <script type="module" defer>
    import {Rebind} from '@webly/rebind';
    // import {Rebind} from "https://cdn.jsdelivr.net/npm/@webly/rebind@0.3.0/dist/min/index.js"
    
    new Rebind(document).state({
      title: "hello",
      say: function(arg) {
        alert(this.title + arg)
      }
    }).run()
  </script>
</head>

<body>
  <h1 @text="hello world"></h1>
  <button @on:click="say('world')">click</button>
</body>
```

---

## 🛠 API Reference

### Implicit Variables

Implicit variables are automatically provided.
They can be accessed inside directive expressions without being explicitly defined in state.

| Variable | Description |
|----------|-------------|
| $element | current element node |
| $select()  | currentElement.querySelector |
| $selectAll() | currentElement.querySelectorAll |

---

### 🔧Directives

---

#### @text

##### 「`@text="text content"`」

**Description**

Sets the text content of an element. Supports string interpolation using {propertyName} to access properties from the current scope.

**Accepted Values / Type**

- `string` – Plain text or text with placeholders:
Example: `"Hello {fullName}"`

**Usage Example**

```html
<p @text="Hello {fullName}"></p>

```

**Notes / Behavior**

- Multiple placeholders are supported: `"Hi {firstName} {lastName}"`
- Safe for plain text (does not render HTML).
- Works with deeply nested properties (e.g., `{user.profile.name}`).

---

#### @data

##### 「`@data='{ "name": "linus"}'`」

**Description**

Binds JSON data to the element. Supports direct JSON objects or dynamic properties from the scope, including nested properties.

**Accepted Values / Type**

- JSON object:
```html
<div @data='{ "name": "linus" }'></div>
```
- Scope property (dynamic):
```html
<div @data="user"></div>
```
- Nested property:
```html
<div @data="user.profile"></div>
```

**Usage Example**

```html
<div @data='{ "name": "linus" }'>
  <p @text="Hello {name}"></p>
</div>

```

**Notes / Behavior**

- Property names must not contain spaces.
- Supports deeply nested properties.

---

#### @skip

##### 「`@skip=""`」

**Description**

Skips the element and all its children. None of its directives or content will run.

**Usage Example**

```html
<div @skip>
  <p @text="skiped"></p>
</div>
<p @text="not skiped"></p>

```

---

#### @html

##### 「`@html="html"`」

**Description**

Set innerHTML to the element

**Usage Example**
```html
<div @html="<p>Hello World</p>"></div>
<div @html="{html}"></div>
```

---

#### @:attribute

##### 「`@:attributeName="value"`」

**Description**

Sets or creates an HTML attribute on the element. Supports string interpolation using `{property}` or nested `{object.property}` from the current scope. Property names cannot contain spaces.

**Usage Example**

```html
<button @:class="btn {color}"></button>

```

---

#### @on:event

##### 「`@on:eventType="functionName(arg)"`」

**Description**

Add event listener to the element.

**Usage Example**

```html

<button @on:click="increment()" @text="{count}">0</button>
<script>
const rootData = observe({
  count: 0,
  increment() {
    console.log(this.$event)
    this.$event.preventDefault()

    this.count += 1
  }
})
new Rebind(document.body.state(rootData).run())
</script>  
```

---

#### @init

##### 「`@init="functionName(arg)"`」

**Description**

Runs a function from the scope after `@data` has been initialized on the element.

**Accepted Values / Type**
- Scope function call with optional arguments:
```html
<div @init="setup(user)"></div>
```

---

#### @for

##### 「`@for=""`」

**Description**

Iterates over an array or iterable and renders the contents of the `<template>` for each element.
During iteration, the directive implicitly creates local variables that are available inside the template scope.

The `<template>` element itself is not rendered; its content is cloned and inserted into the DOM for each item in the collection.

**Implicit Variables**

The directive automatically exposes the following variable inside the template:

| variable | Description |
|----------|-------------|
| $key     | index or key of the iteration |

**Usage Example**
```html
<ul @data="data">
  <template @for="animal in animals">
    <li @text="{animal.name}">item</li>
  </template>
</ul>

<script>
new Rebind(document.body)
  .state({
    data: {
      animals: [
        { name: "cat", tail: true },
        { name: "husky", tail: true }
      ]
    }
  })
  .run()
</script>
```

---

#### @if

##### 「`@if="Foo ConditionalOperator Bar; functionName()"`」

**Description**

Run function when condition is true.

**Usage Example**
```html
<div @data='{"count": 10}'>
  <div @if="{count} > 5"; show()">
    <p hidden>Hello World</p>
  </div>  
</div>

<script>
new Rebind(document.body).state({
  show() {
    const p = this.$element.querySelector("p")
    if (p) p.hidden = !p.hidden
  }
}).run()
</script>
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

