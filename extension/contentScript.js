console.log("Recruit IQ AI Bridge: Injected into external ATS/Network platform.");

function scrapeLinkedInProfile() {
  const nameElement = document.querySelector('h1.text-heading-xlarge');
  const titleElement = document.querySelector('div.text-body-medium.break-words');
  const locationElement = document.querySelector('span.text-body-small.inline.t-black--light.break-words');

  const profileData = {
    source: 'LinkedIn',
    name: nameElement ? nameElement.textContent.trim() : 'Unknown Name',
    title: titleElement ? titleElement.textContent.trim() : 'Unknown Title',
    location: locationElement ? locationElement.textContent.trim() : 'Unknown Location',
    timestamp: new Date().toISOString()
  };

  console.log("Recruit IQ AI Bridge: Scraped Profile Data", profileData);
  
  // Example of sending it back to the AI Studio App (Running on localhost 3000 or production server)
  // In a real scenario, this would use a secure authenticated API endpoint.
  // chrome.runtime.sendMessage({ action: "save_candidate", data: profileData });
  
  return profileData;
}

// Intercept specific UI actions or listen for extension click
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extract_profile") {
    const data = scrapeLinkedInProfile();
    sendResponse({ success: true, data });
  }
});
