![](logo.jpg?raw=true)

This is frontend repository for cloud.biqasoft.com

## Architecture overview
 - AngularJS

### Logging 
In index.html there is a method `processError()` which is called in global js error and in angular config decorator error `app.js`  as $exceptionHandler

You should send javascript errors to server with server [logentries.com](https://logentries.com)
See more at [detect errors in js](http://blog.gospodarets.com/track_javascript_angularjs_and_jquery_errors_with_google_analytics/)
And for [logentries API](https://logentries.com/doc/javascript/) and [lib](https://github.com/logentries/le_js/tree/master/product)

```javascript
<script src="/js/le.min.js"></script>
<script>
// You need to replace User-Log-Token with the token from logentries to identify these log events.
LE.init('46f199b1-2ede-4f6d-9811-d5a634bc13e2');
</script>

<script>
// log something
LE.log("Hello, logger!");
</script>
```

## Used libs

 - [ng-sweet-alert -  notifications, ask user for confirmation ](http://tushariscoolster.github.io/ng-sweet-alert/)
 - [angular-loading-bar - show ajax requests](https://chieffancypants.github.io/angular-loading-bar/#) 
 - [angular-hotkeys](https://github.com/chieffancypants/angular-hotkeys)
 - [textAngular](https://github.com/fraywing/textAngular)
 - [ngclipboard](https://sachinchoolur.github.io/ngclipboard/)
 
### Material Design
 - [design.google.com/icons](https://design.google.com/icons/)
 - [angular-material](https://material.angularjs.org/latest/)
 - [material-design-icons](http://google.github.io/material-design-icons/)
 
### CSS

### Icons
 * http://fortawesome.github.io/Font-Awesome/icon/calendar/
 * http://fortawesome.github.io/Font-Awesome/icon/clock-o/
 * http://fortawesome.github.io/Font-Awesome/icon/pencil-square-o/
 * http://fortawesome.github.io/Font-Awesome/icon/check-circle-o/

### Build
 - [Gulp 4](https://demisx.github.io/gulp4/2015/01/15/install-gulp4.html) `gulp` - result in `build`folder

### i18n
Translate text. 

[angular-translate](https://angular-translate.github.io/docs/#/guide) is used
Lang pack files in `assets/i18n` folder

#### Usage

##### In html
```html
<span translate="NAV.CRM"></span>
```
##### In JS

Inject service `$translate` to controller/service and use

Async way
```js
$translate('APP.SET_NEW_LANGUAGE').then(function (translation) {
   logger.logSuccess(translation + key)
});
```

Sync way
`$translate.instant('APP.UNSAVED_CHANGES')`
          
### UI

## Angular tips

Delete button

```html
<md-button class="" data-ng-click="deleteConfirmation(currentCompany)">
	<md-icon md-font-icon="delete">delete</md-icon>
  	<span translate="APP.COMMON.DELETE.BUTTON"></span>
</md-button>
```

Dynamic change HTML page title
You can dynamically change page title in browser in every angularjs controller with `$rootScope.title='Some Title'`

 `data-ng-disabled="editMode"` disabled button
 `ng-if="!editMode"`

This is tooltip directive usage

```html
<span class="" tooltip-placement="right" tooltip="_текст_" tooltip-append-to-body="true">
     some text
</span>
```

Add button
```html
<md-button data-ng-click="showNewProjectFlag = !showNewProjectFlag " style="opacity: 0.7;">
    <md-icon md-font-icon="add">add</md-icon>
</md-button>
```
       
This is label

`<span ng-if="project.active" class="label label-success">Активен</span>`

When we want to print some in debug (developer) mode
```javascript
<div ng-if="::debugMode">
    {{webCounter | json}}
</div>
```

Use class for background color for search elements, filters etc...
```css
background-input-color
```

If we want to print time ago (such as "one minute ago")
`{{someDate | timeAgo}}`

if we want editable on click field

`<a href="#" editable-text="detailedCustomerInfo.firstName">{{ detailedCustomerInfo.firstName || 'enter' }}</a>`

Show text when field is empty (print translated message that fields is empty)
`{{ object.name || printEmptyField() }}`

## Directives

#### Custom fields

Custom field creator
`<custom-fields-selector ng-model="currentCompany.customFields"></custom-fields-selector>`

Custom field editor in objects
`<custom-fields-shower ng-model="detailedCustomerInfo.customFields"></custom-fields-shower>`

To show delete button on near every field
`<custom-fields-shower ng-model="detailedCustomerInfo.customFields" show-delete-button="true"></custom-fields-shower>`

#### Other 
 - Choose date (relative, such as `%DAY_START%` and absolute, as JS date)
`<date-selector ng-model="domeModel" ></date-selector>`

 - UserAccount roles (server-side Spring Security roles)
`<span role-security-selector data-ng-model="account.roles"></span>`

## Project structure
[inspired by](https://scotch.io/tutorials/angularjs-best-practices-directory-structure)

    app/
    ----- templates/   // AngularJS html templates
    ----- shared/   // acts as reusable components or partials of our site
    ---------- sidebar/
    --------------- sidebarDirective.js
    --------------- sidebarView.html
    ---------- article/
    --------------- articleDirective.js
    --------------- articleView.html
    ----- components/   // each component is treated as a mini Angular app
    ---------- ui-framework/ - components for development UI (forms, tables, charts...)
    ---------- home/
    --------------- homeController.js
    --------------- homeService.js
    --------------- homeView.html
    ---------- blog/
    --------------- blogController.js
    --------------- blogService.js
    --------------- blogView.html
    ---------- main.js   // main angularjs controller, some $rootScope ...
    ---------- service.api.js   // API calls to back-end (REST)
    ---------- service.draw.js      // Draw, charts, highcharts...
    ---------- service.js   some main services (internal) partly, including network
    ---------- service.widgets.js   // dashboard widgets components
    ----- app.js        // angular init (providers, configs, modules declare)
    ----- app.routes.js         // all routes in AngularJS
    assets/
    ----- img/      // Images and icons for your app
    ----- css/      // All styles and style related files (SCSS or LESS files)
    ----- js/       // JavaScript files written for your app that are not for angular
    ----- libs/     // Third-party libraries such as jQuery, Moment, Underscore, etc.
    index.html
    README.md       // some documentation and notes
    
    
