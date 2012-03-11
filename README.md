# Introduction

  This is an experimental project to support runtime file merge for asynchronous Module Definition (AMD) such as RequireJS.
  It extends syntax to load a group of dependencies, for example:

```js
  require([['a.js', 'b.js']], function(){
    ...
  });
```

  So here 'a.js' and 'b.js' will be sent by one request like 'merge?a.js&b.js'

# How to Run

  * Install Node
  * Run 'node server.js'
  * Visit 'localhost:8080/index.html'
  * Watch results in console 

# Tips
    
  * You can setup configuration in the simple server 'server.js', which implemented file merge protocal.
  * Try different combination in 'index.html'  