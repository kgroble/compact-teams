# Compact Teams

Compact Teams is a Chrome app which applies a layer of compact styling to Microsoft Teams.

## Installation

- Download or clone this repository.
- Navigate to `chrome://extensions` and enable "Developer mode" in the top-right corner.

**To use the pre-packed app,**
- Drag and drop `compact-teams.crx` onto the extensions page.

**To build the app from source,**
- Select "Load unpacked" in the top-left, then navigate to and select the `src/` directory.
- If you build from source, you can make your own styling tweaks in `src/js/embed.js` and apply them with the "refresh" button on the app card.

## How it works

Most of the code for this app was generated by [applicationize.me](https://applicationize.me/), a tool specifically for
making Chrome app wrappers around webpages. The app is a single page which loads the Teams website in a `webview`.
The `webview` has its own DOM - styling must be injected. The injected style is in a string literal at the top of
`src/js/embed.js`, and there's a more readable copy in `src/css/compact.css`. (You can use the CSS and an extension such
as [Stylebot](https://chrome.google.com/webstore/detail/stylebot/oiaejidbmkiecgbjeifoejpgmdaleoha?hl=en) to apply the compact theme
to the standard Teams webpage.)

The "native" Teams app is an electron app, so this Chrome app looks and functions very similarly, and uses about the same
amount of memory.

_Disclaimer: The style rules are currently very inflexible (i.e., they use `px` over `%`, `em`, or `rem`). They produce
sensible results for my font size, display resolution, etc. Feel free to tweak the values to fit your configuration (or contribute
by making them properly flexible)._

## Known Issues
- Status indicator bubbles (green for available, red for busy, etc.) are not properly aligned with profile pictures in nested replies.
- App does not persist settings (e.g., theme selection) across restarts.
