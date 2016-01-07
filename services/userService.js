/**
 * Récupérer des informations à propos des utilisateurs du framework php.
 * Communications avec les webservices php.
 */
(function() {

  "use strict";

  var module = angular.module('validationDocumentaire');

  // récupérer des informations à partir de l'utilisateur.
  module.factory('userService', ['validationDocumentaireSettings', '$http', function(validationDocumentaireSettings, $http) {

    var factory = {};

    // Retourner l'utilisateur courant
    factory.getCurrentUser = function() {
      return $http.get(validationDocumentaireSettings.webservicesBaseUrl + 'getCurrentUser').then(function(response) {
        return response.data.result;
      });
    };

    // Retourner l'id de l'utilisateur courant du framework.
    factory.getCurrentUserId = function() {
      return $http.get(validationDocumentaireSettings.webservicesBaseUrl + 'obtenirUtilisateurenSession').then(function(response) {
        return response.data.result.id;
      });
    };

    factory.getAllUsersByGroup = function() {
      return $http.get(validationDocumentaireSettings.webservicesBaseUrl + 'validationDocumentaireGetUsers').then(function(response) {
        return response.data.result;
      });
    };

    return factory;

  }]);


})();