[![Build Status](https://travis-ci.org/WycliffeAssociates/m2m-ctl.svg?branch=master)](https://travis-ci.org/WycliffeAssociates/m2m-ctl) [![codecov](https://codecov.io/gh/WycliffeAssociates/m2m-ctl/branch/master/graph/badge.svg)](https://codecov.io/gh/WycliffeAssociates/m2m-ctl)

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

## Prerequisites

- [Node and NPM](https://nodejs.org/en/)
- [Fiddler](http://www.telerik.com/fiddler) (optional - development)
- [Watchman](https://facebook.github.io/watchman/docs/install.html) (optional - testing)

## Getting Started

This React app is meant to be embedded inside a Microsoft Dynamics CRM entity form. Due to non-trivial dependencies that are associated with being an embedded app, it is currently unable to run as a stand-alone. What that means is when Webpack serves it on localhost, the app itself will run fine, but you'll see an error message in the notification area and will be unable to proceed any further, which is not very exciting.

The current development method relies on Fiddler, a program that can intercept outgoing requests and responds with local files that are on your machine. Using Fiddler, we can respond to Dynamics CRM requests for web resource by providing the files in this project's `build` folder. This assumes that you have initially uploaded a web resource and embedded it in an entity form, thus making Dynamics CRM to try and fetch that web resource.

1. Clone this repo - `git clone <ssh_or_https_url>`
2. Install packages - `npm i`
3. Make changes and build the project - `npm run build`
4. Download and install [Fiddler](https://www.telerik.com/download/fiddler)
5. Set Fiddler's AutoResponder to respond to requests for `/WebResources/wa_m2m_ctl/index.html` (assuming that's where you initially uploaded the web resource) with `/path/to/build/folder/index.html`.
6. Do the same thing for `main.css` and `main.js`.

Your Fiddler's AutoResponder should look something like this:

![Image of AutoResponder's setting](./img/fiddler_autoresponder_setting.JPG)

## Deployment

1. Build the project - `npm run build`
2. Upload the generated HTML, CSS, and JS in build folder to CRM (via UI or Web Resource Manager).

### Using the Web Resource

1. In a record/entity form, insert a web resource.
2. Choose the uploaded `index.html` as the web resource.
3. Uncheck "Restrict cross-frame scripting, where supported."
4. Check "Pass record object-type and unique indentifier as paramenters.
5. For Custom Paramenter(data), insert the JSON configuration.

### Configuration

The configuration looks like this:

``` json
{
  "schemaName": "wa_wa_project_wa_book",
  "displayField": "wa_name",
  "groupByField": "wa_testament"
}
```

- `schemaName` - The name of the M2M relationshi. _required_
- `displayField` - The field/column name of the related entity to be used as a label. _required_
- `groupByField` - The field/column name of the related entity to be used to group records.

You can either hand-type the config object (it's not that hard), or use the configuration generator.

### Configuration Generator

- Open `public/config.html` in a browser.
- Fill out the form.
- Click "Generate".
- Copy the generated code.
- Paste the config into the Custom Parameter(data) in the Web Resource Properties popup window.

## Fiddler Tips

* *For Mac* - There's a Fiddler for mac, but people seem to recommend running it in a virtual machine (VirtualBox or Parallels) for stability. [Here](http://docs.telerik.com/fiddler/configure-fiddler/tasks/configureformac)'s a way to configure it if you want to use the host browser and make Fiddler catches the traffic in VM. Personally, I just use the browser in VM itself.
* *HTTPS* - Your Fiddler may not work correctly with HTTPS connections. [Here](http://docs.telerik.com/fiddler/Configure-Fiddler/Tasks/DecryptHTTPS)'s a way to make it work.
* *Capturing* - To avoid too many noise and to save storage/memory, limit logging to as little sessions as possible and only capture browser traffic.
* *Disable cache* - If it seems like your changes are not being served by Fiddler, make sure your browser has its caching disabled.

## Original `create-react-app` Template

Read it [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md)

## Contributing

Besides making sure that unit tests are written for your changes, run the test (`npm test`) to make sure that your changes don't break anything.

## Troubleshooting

*Q: After deploying the built files with XrmToolBox Web Resource Manager, I got "HTTP 500 - Internal Server Error" when the form tries to load the web resource.*
A: The cause is unknown at this point, but try to upload the files (html, css, and js) using the built-in web resource upload UI provided by Dynamics CRM.
