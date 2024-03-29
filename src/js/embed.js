// Get webview element
var webview = document.getElementById('webview');

// Get find box elements
var findBox = document.getElementById('find-box');
var findInput = document.getElementById('find-text');

// Get dialog box elements
var dialogBox = document.getElementById("dialog-box");
var dialogOk = document.getElementById("dialog-box-ok");
var dialogText = document.getElementById("dialog-box-text");
var dialogInput = document.getElementById("dialog-box-input");
var dialogCancel = document.getElementById("dialog-box-cancel");

// Initial page zoom factor
var zoomFactor = 1.0;

// CSS injected into a webview via `insertCSS` is assigned low priority; add `!important` to
// each attribute to get it to apply. There's a more readable copy of this styling in `../css/compact.css`
var compactStyle = `
.channel-anchor {
    margin-left: 20px !important;
    padding-left: 20px !important;
}

.ts-channel-list, .app-left-rail-width, .ts-left-rail, .ts-left-rail-wrapper, .active-rail, [data-tid="left-rail"] {
    max-width: 250px !important;
}

.message-pane[aria-label$="channel content"] .ts-message {
    padding-bottom: 0px !important;
    padding-right: 0px !important;
    padding-top: 0px !important;
}

.message-pane[aria-label$="chat content"] .ts-message {
    padding-right: 0px !important;
    padding-top: 5px !important;
}

.message-body {
    padding-top: 0px !important;
}

.media-left {
    padding-top: 0px !important;
    padding-bottom: 0px !important;
}

.media-left .ts-skype-status {
    top: 2.8rem !important;
}

.ts-new-message {
    margin-left: 0px !important;
    margin-right: 0px !important;
    max-width: none !important;
}

.ts-message-list-container {
    margin-left: 0px !important;
    margin-right: 0px !important;
    max-width: none !important;
}

.ts-message-list-item {
    max-width: none !important;
    padding-left: 6px !important;
    padding-right: 20px !important;
}
`;

// Listen to keydown event
window.onkeydown = function (e) {
    // Check whether CTRL on Windows or CMD on Mac is pressed
    var modifierActive = (navigator.platform.startsWith('Win')) ? e.ctrlKey : e.metaKey;
    var altModifierActive = (navigator.platform.startsWith('Win')) ? e.altKey : e.ctrlKey;

    // Enter full screen mode (CMD/ALT + CTRL + F)
    if (modifierActive && altModifierActive && e.keyCode == 'F'.charCodeAt(0)) {
        // Get current focused window
        var window = chrome.app.window.current();

        // Check if currently full screen
        if (!window.isFullscreen()) {
            // Enter full screen mode
            window.fullscreen();
        }
        else {
            // Exit full screen mode
            window.restore();
        }

        // Prevent other shortcut checks
        return;
    }

    // Refresh the page (CTRL/CMD + R)
    if (modifierActive && e.keyCode == 'R'.charCodeAt(0)) {
        webview.reload();
    }

    // Find in page (CTRL/CMD + F)
    if (modifierActive && e.keyCode == 'F'.charCodeAt(0)) {
        // Show the find box
        findBox.style.display = 'block';

        // Focus the find input
        findInput.focus();

        // Select all existing text (if any)
        findInput.select();
    }

    // Copy URL (CTRL/CMD + L)
    if (modifierActive && e.keyCode == 'L'.charCodeAt(0)) {
        // Copy webview source to clipboard
        copyToClipboard(webview.src, 'text/plain');
    }

    // Zoom in (CTRL/CMD +)
    if (modifierActive && e.keyCode == 187) {
        zoomFactor += 0.1;
        webview.setZoom(zoomFactor);
    }

    // Zoom out (CTRL/CMD -)
    if (modifierActive && e.keyCode == 189) {
        zoomFactor -= 0.1;

        // Don't let zoom drop below 0.2
        if (zoomFactor <= 0.2) {
            zoomFactor = 0.2;
        }

        webview.setZoom(zoomFactor);
    }

    // Reset zoom (CTRL/CMD + 0)
    if (modifierActive && e.keyCode == '0'.charCodeAt(0)) {
        zoomFactor = 1.0;
        webview.setZoom(zoomFactor);
    }
};

// Listen for webview load event
webview.addEventListener('contentload', function () {
    webview.insertCSS({
        code: compactStyle
    });
    // Execute JS script within webview
    webview.executeScript({
        // Send a Chrome runtime message every time the keydown event is fired within webview
        code: `window.addEventListener('keydown', function (e) {
            chrome.runtime.sendMessage({ event: 'keydown', params: { ctrlKey: e.ctrlKey, metaKey: e.metaKey, altKey: e.altKey, keyCode: e.keyCode } });
        });`});
});

// Listen for Chrome runtime messages
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        // Check for keydown event
        if (request.event === 'keydown') {
            // Invoke the local window's keydown event handler
            window.onkeydown(request.params);
        }
    }
);

// Find input: listen to keydown event
findInput.addEventListener('keyup', function (e) {
    // Search for current input text
    webview.find(findInput.value, { matchCase: false });

    // Escape key
    if (e.keyCode === 27) {
        webview.stopFinding();
        findBox.style.display = 'none';
    }
});

function copyToClipboard(str, mimetype) {
    // Listen for 'oncopy' event
    document.oncopy = function (event) {
        event.clipboardData.setData(mimetype, str);
        event.preventDefault();
    };

    // Execute browser command 'Copy'
    document.execCommand("Copy", false, null);
}

// Custom alert dialog popup
var dialogController;

// Listen for dialog cancellation button click
dialogCancel.addEventListener('click', function () {
    // Send cancellation
    dialogController.cancel();

    // Hide dialog box
    dialogBox.style.display = 'none';
});

// Listen for dialog OK button click
dialogOk.addEventListener('click', function () {
    // Send OK value
    dialogController.ok(dialogInput.value);

    // Hide dialog box
    dialogBox.style.display = 'none';
});

// Listen for dialog event on webview for new alert dialogs
webview.addEventListener('dialog', function (e) {
    // Prevent default logic
    e.preventDefault();

    // Extract dialog type and text
    var text = e.messageText;
    var dialogType = e.messageType;

    // Keep a reference to dialog object
    dialogController = e.dialog;

    // Set dialog text
    dialogText.innerHTML = text;

    // Reset dialog input
    dialogInput.value = '';

    // Hide it by default
    dialogInput.style.display = 'none';

    // Alert?
    if (dialogType == 'alert') {
        // Hide cancel button
        dialogCancel.style.display = 'none';
    }
    else {
        // Another type of dialog, show cancel button
        dialogCancel.style.display = 'block';

        // Prompt?
        if (dialogType == 'prompt') {
            // Show text input field
            dialogInput.style.display = 'block';
        }
    }

    // Show dialog box
    dialogBox.style.display = 'block';
});
