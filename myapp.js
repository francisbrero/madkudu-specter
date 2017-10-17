InboxSDK.load(1, 'sdk_test12_4ff1a33e18').then(function(sdk){

  // have the app load whenever a new composer is created
  sdk.Compose.registerComposeViewHandler(function(composeView){
    
    composeView.on('destroy', function(event) {
      console.log('compose view going away, time to clean up');
    });

    // automagically add my salesforce bcc
    composeView.on('recipientsChanged', function(event) {
      composeView.setBccRecipients(['emailtosalesforce@dafh7g1kahuydcglgiq101kghlzp534dmi3bpmhoi878j3d13.41-mohleao.na35.le.salesforce.com']);      
    });

    // add a link to your awesome calendar
    composeView.addButton({
      title: "Add Calendar!",
      iconUrl: 'http://www.madkudu.com/static/images/madkudu_square.svg',
      onClick: function(event) {
        event.composeView.insertLinkIntoBodyAtCursor('here', 'https://calendly.com/francis-madkudu/30min');
      },
      orderHint: 1,
    });    

    // add a link to your awesome calendar
    composeView.addButton({
      title: "Add Custom link!",
      iconUrl: 'https://images-na.ssl-images-amazon.com/images/I/51zLH89jnxL._AC_UL320_SR244,320_.jpg',
      onClick: function(event) {
        var contacts = composeView.getToRecipients();
        var email;
        var email_encoded;
        if(contacts.length == 1) {
          email = contacts[0].emailAddress;
          email_encoded = btoa(email);
        };
        event.composeView.insertLinkIntoBodyAtCursor(email, 'https://www.madkudu.com/?f'+email_encoded);
      },
      orderHint: 2,
    });
  });
});
