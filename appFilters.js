(function() {

  "use strict";

  angular.module('validationDocumentaire').filter('fileExtension', function($filter) {
    return function(filename) {
      return filename.split(".").pop().toLowerCase();
    }
  });


})();