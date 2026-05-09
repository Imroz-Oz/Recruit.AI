chrome.runtime.onInstalled.addListener(() => {
  console.log("Recruit IQ AI Bridge extension installed/updated.");
});

// A background listener to catch messages from contentScript and relay to your Recruit IQ backend
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'save_candidate') {
    console.log("Received candidate data from content script:", request.data);
    // Real implementation would securely POST `request.data` to Firebase or the Next.js API route.
    sendResponse({ status: "processed" });
  }
});
