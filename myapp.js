var path;
var bccSalesforceEmail;
var calendlyLink;


InboxSDK.load(1, 'sdk_test12_4ff1a33e18').then(function(sdk){

  // have the app load whenever a new composer is created
  sdk.Compose.registerComposeViewHandler(function(composeView){    
  
  chrome.storage.sync.get({
    bccSalesforceEmail: 'francis@madkudu.com',
    calendlyLink: 'https://www.madkudu.com'
  }, function(items) {
    bccSalesforceEmail = items.bccSalesforceEmail;
    calendlyLink = items.calendlyLink;
    // console.log('bccSalesforceEmail currently is ' + items.bccSalesforceEmail);
  });

    composeView.on('destroy', function(event) {
      console.log('compose view going away, time to clean up');
    });    

    // automagically add my salesforce bcc to the current bcc addresses at the time of sending
    function bccSalesforce(composeView) {
      var bccContacts = composeView.getBccRecipients();
      var bccEmails = [];
      for (var i = 0; i < bccContacts.length; i++) {
          bccEmails.push(bccContacts[i].emailAddress);
      };
      bccEmails.push(bccSalesforceEmail);
      composeView.setBccRecipients(bccEmails);
      return
    };

    // add a link to your awesome calendar
    composeView.addButton({
      title: "Add Calendly!",
      iconUrl: 'https://financesonline.com/uploads/2017/08/calel.png',
      onClick: function(event) {
        event.composeView.insertLinkIntoBodyAtCursor('here', calendlyLink);
      },
      orderHint: 1,
    });

    // add a link to your awesome calendar
    composeView.addButton({
      title: "Send with MadKudu!",
      iconClass: 'madkuduSend',
      onClick: function(event) {
        // created an encoded version of the email of the recipient
        var contacts = composeView.getToRecipients();
        var email;
        var emailEncoded;
        var suffix;
        if(contacts.length == 1) {
          email = contacts[0].emailAddress;
          emailEncoded = btoa(email);
          suffix = '?f=' + emailEncoded;
        };
        if (!suffix) {return};

        // add our suffix to all links in the email
        var emailContent = composeView.getHTMLContent();
        var newEmailContent = urlify(emailContent, suffix);
        event.composeView.setBodyHTML(newEmailContent);
        bccSalesforce(composeView);
        event.composeView.send();
      },
      orderHint: 2,
      type: "SEND_ACTION",
    });
  });   

  // a function that parses text looking for URLs that contain madkudu.com and ends with / and adds a suffix
  // the trickery here is, if we have no / then we add one and then apply the transformation
  function urlify(text, suffix) {
    var urlRegex = /(\bhttps?:\/\/(\S+|\S?)madkudu\.com(\S+|\S?)\/\")/gi;
    var urlRegexNo = /(\bhttps?:\/\/(\S+|\S?)madkudu\.com(\S+|\S?)\")/gi;
    return text.replace(urlRegex, function(url) {
        return url.substring(0, url.length-2) + '"'; // remove /" from the url
      }).replace(urlRegexNo, function(url) {
        return url.substring(0, url.length-1) + '/' + suffix + '"'; 
    });
  }

});