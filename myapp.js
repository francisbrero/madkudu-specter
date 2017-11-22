var path;
var api_key = 'xx';
var api_secret = 'xx';

InboxSDK.load(1, 'sdk_test12_4ff1a33e18').then(function(sdk){

  // have the app load whenever a new composer is created
  sdk.Compose.registerComposeViewHandler(function(composeView){    

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
      bccEmails.push('emailtosalesforce@dafh7g1kahuydcglgiq101kghlzp534dmi3bpmhoi878j3d13.41-mohleao.na35.le.salesforce.com');
      composeView.setBccRecipients(bccEmails);
      return
    };

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

  // ======================================================================
  // Now let's start showing some behavioral information in the UI
  sdk.Conversations.registerMessageViewHandler(function(messageView) {
    
    messageView.on('destroy', function(event) {
      console.log('message view going away, time to clean up');
    });

    var threadView = messageView.getThreadView();

    // generate the dynamic element to add to the side bar
    const el = document.createElement("div");
    var info = '';
    var newInfo = 'I am watching you!';  

    // Get all contacts in the thread including the sender if the person has answered
    var contacts = messageView.getRecipients();
    contacts.push(messageView.getSender());    

    // for all contacts, get the information from Mixpanel
    for (var i = 0; i < contacts.length; i++) {
      var contact = contacts[i];
      var email = contact.emailAddress;
      var emailWasAlreadySeen = wasAlreadySeen(email, contacts, i);
      if(email.indexOf('@madkudu.com') == -1 && email.indexOf('emailtosalesforce@') == -1 && !emailWasAlreadySeen){
        newInfo = email;
        
        // Mixpanel variables        
        var where = 'properties["$email"] == "' + email + '"';
        var expire = new Date('2018', '12', '24').getTime() / 1000 + 3600;
        var sig = calcMD5("api_key=" + api_key + "expire=" + expire + "where=" + where + api_secret);
        path = 'https://mixpanel.com/api/2.0/engage?api_key=' + api_key + "&expire=" + expire + "&where=" + where;
        path = path + "&sig=" + sig;
        var mixpanelData = getMixpanel();
        var mixpanelInfo = 'we have no tracking :-(';
        // Check if we got results back from the API call
        if(mixpanelData.results.length >= 1){
          var mk_customer_fit = JSON.stringify(mixpanelData.results[0].$properties.mk_customer_fit) || 'unknown';
          var curTime = new Date().getTime();
          var lastSeen = JSON.stringify(mixpanelData.results[0].$properties.$last_seen).replace(/['"]+/g, '');
          var lastSeenDate = new Date(lastSeen).getTime();
          var days_since_last_seen = Number((curTime - lastSeenDate)/(24*60*60*1000)).toFixed(0);
          // Number(((curTime - new Date(lastSeen).getTime())/(24*60*60*1000)).toFixed(0));
          mixpanelInfo = '<div> MadKudu Customer fit is: <strong>' + mk_customer_fit + '</strong></div>' +
                        '<div> They were last seen: <strong>' + days_since_last_seen + '</strong> days ago.</div>';  
        }        
        info = info + mixpanelInfo;
      }       
    }

    // Push the content to the HTML
    el.innerHTML = info

    // Now add the side bar content
    threadView.addSidebarContentPanel({
      title: newInfo,
      iconUrl: chrome.runtime.getURL('static/madkudu_square_256.png'),
      el
    });
  });


  // HTTP request to mixpanel URL
  function getMixpanel() {
    var xhr = new XMLHttpRequest();
    // Note that any URL fetched here must be matched by a permission in
    // the manifest.json file!
    var url = path;
    xhr.open('GET', url, false);
    xhr.send();
    return JSON.parse(xhr.responseText);
  };

  // Check if an element has been seen before the index of the array
  function wasAlreadySeen(element, array, index){
    if(index==0){
      return false;
    }
    var res = false;
    // expectation is that index <= array.length
    for (var i = 0; i < index; i++) {
      // check if the array already contained the element
      if(array[i]==element){
        res = true;
      }
    }
    return res;
  };

});
