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
      title: "Add Calendly!",
      iconUrl: 'https://financesonline.com/uploads/2017/08/calel.png',
      onClick: function(event) {
        event.composeView.insertLinkIntoBodyAtCursor('here', 'https://calendly.com/francis-madkudu/30min');
      },
      orderHint: 1,
    });    

    // add a link to your awesome calendar
    composeView.addButton({
      title: "Add Magic links!",
      iconUrl: 'http://www.madkudu.com/static/images/madkudu_square.svg',
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
      },
      orderHint: 2,
    });
  });

  // a function that parses text looking for URLs that contain madkudu.com and end  and adds a suffix
  function urlify(text, suffix) {
    var urlRegex = /(\bhttps?:\/\/(\S+|\S?)madkudu\.com(\S+|\S?)\/)/gi;
    return text.replace(urlRegex, function(url) {
        return url + suffix;
    })
  }
});
