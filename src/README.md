# Website source

The site is a single page app. `index.html` holds the page shell and styles, and `app.js` is built from `src/app.jsx`.

After editing `src/app.jsx`, rebuild `app.js` from the repository root:

```
npx esbuild@0.24.0 src/app.jsx --bundle=false --jsx-factory=React.createElement --jsx-fragment=React.Fragment --target=es2019 --minify --outfile=app.js
```

Then change the `?v=` number on the `app.js` script tag in `index.html` so browsers pick up the new file.

Video clips are stock footage streamed from Pexels and credited in the footer.
