var bccSalesforceEmail;
var calendlyLink;
// allow to store the parameters that were input by the user
// Saves options to chrome.storage
function save_options() {
  bccSalesforceEmail = document.getElementById('bccSalesforceEmail').value;
  calendlyLink = document.getElementById('calendlyLink').value;
  chrome.storage.sync.set({
    bccSalesforceEmail: bccSalesforceEmail,
    calendlyLink: calendlyLink
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores state using the preferences
// stored in chrome.storage.
function restore_options() {
  var status = document.getElementById('status');
  status.textContent = 'Please set your preferences.';
  // Use default value 
  chrome.storage.sync.get({
    bccSalesforceEmail: 'francis@madkudu.com',
    calendlyLink: 'https://www.madkudu.com'
  }, function(items) {
    document.getElementById('bccSalesforceEmail').value = items.bccSalesforceEmail;
    document.getElementById('calendlyLink').value = items.calendlyLink;
  });
}


document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', 
  save_options);