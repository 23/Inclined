# Inclined

Inclined is a tour, help or guide mode for the browsers. It takes any web page and makes it easy to create a guided tour of elements and features within it.

The library supports modern browsers from IE9 and upwards.

To create a tour from a page, add descriptions to `<head>`:

    <meta name="inclined_title" content="Analytics" />
    <meta name="inclined_description" content="Analytics give you all the insight you need about how your videos are performing. Everything from plays and drop-off rates to embeds, social interaction and traffic usage." />
    <meta name="inclined_next_url" content="/settings" />
    <meta name="inclined_previous_url" content="/manage/videos" />

Then mark up every element in the page that you want explained as a part of the tour:

    
And finally start the tour:
    
    var tour = new Inclined().href().show();
    
You can test if Inclined is supported and adjust the user experience accordingly:

    var tour = new Inclined().href();
    if(tour.supported) tour.show();
    
You can load any page in to tour mode, the only requirement is that it is on the same domain as the Inclined script and that jQuery is loaded in the page:

    var tour = new Inclined().href('/manage/video/1234').show();