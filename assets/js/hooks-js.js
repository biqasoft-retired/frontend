///////////////////////////////////////////
/////////// SOME HELPERS FUNCTIONS ////////
///////////////////////////////////////////
String.prototype.replaceAll = function (search, replace) {
    return this.split(search).join(replace);
};

String.prototype.generateRandomString = function (len) {
    return Math.random().toString(36).substr(2, len);
};

String.prototype.hashCode = function () {
    var hash = 0, i, chr, len;
    if (this.length == 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }

    return hash;
};

String.prototype.getBytes = function () {
    var bytes = [];
    for (var i = 0; i < this.length; ++i) {
        bytes.push(this.charCodeAt(i));
    }

    return bytes;
};

if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (searchString, position) {
            position = position || 0;
            return this.lastIndexOf(searchString, position) === position;
        }
    });
}

function isUndefinedOrNull(obj) {
    if (obj === null || typeof obj === "undefined") return true;
    return false;
}

function isUndefinedOrNullOrEmpty(obj) {
    if (obj === null || typeof obj === "undefined" || obj === "") return true;
    return false;
}

///////////////////////////////////////////////
/////////// END SOME HELPERS FUNCTIONS ////////
///////////////////////////////////////////////
var GLOBAL_CONSTANTS = {};
window.GLOBAL_CONSTANTS = GLOBAL_CONSTANTS;

// 2147483647 - max int in java :(
GLOBAL_CONSTANTS.MAX_INTEGER_TO_SERVER = 2147483647 - 1;
GLOBAL_CONSTANTS.LANGUAGE = navigator.language;
if (GLOBAL_CONSTANTS.LANGUAGE === 'en-US'){
    GLOBAL_CONSTANTS.LANGUAGE = "en";
}

// is this running cordova mobile app
GLOBAL_CONSTANTS.MOBILE_CORDOVA = false;
GLOBAL_CONSTANTS.GIT_REVISION = null;
GLOBAL_CONSTANTS.LE_KEY = '914f5e87-61f4-4997-ad5d-ccbed13192e1';


// show large message to console that if you are not developer - do not execute and paste code
window.console.log("%c%s", "color: red; background: yellow; font-size: 24px;", "ВНИМАНИЕ!");
window.console.log("%c%s", "color: black; font-size: 18px;", "Используя эту консоль, вы можете подвергнуться атаке Self-XSS, что позволит злоумышленникам совершать действия от вашего имени и получать доступ к вашим личным данным. Не вводите и не вставляйте программный код, который не понимаете.");