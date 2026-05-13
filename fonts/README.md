# Fonts

Drop `.woff2` font files into this directory. The page looks for:

- `EB-Garamond-Regular.woff2`
- `EB-Garamond-Italic.woff2`

Or alternatively:

- `Cormorant-Garamond-Regular.woff2`
- `Cormorant-Garamond-Italic.woff2`

Both fonts are available for free:

- **EB Garamond**: https://fonts.google.com/specimen/EB+Garamond — download, extract, rename the regular and italic `.ttf` files and convert to `.woff2` with any online converter, or just drop the `.woff2` files directly if you have them.
- **Cormorant Garamond**: https://fonts.google.com/specimen/Cormorant+Garamond — same process.

If no `.woff2` files are present here, the page falls back to Georgia, which is fine.

Update the `@font-face` declarations in `styles.css` to match whatever filenames you use.
