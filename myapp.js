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
        bccSalesforce(composeView);
        event.composeView.send();
      },
      orderHint: 2,
      type: "SEND_ACTION",
    });
  });   

});