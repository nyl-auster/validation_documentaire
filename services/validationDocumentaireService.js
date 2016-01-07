/**
 * Service pour obtenir des informations à propos des validations
 * documentaires depuis la base de données. Communication avec les webservices php.
 */
(function() {

  "use strict";

  /**
   * The main app module
   * @name app
   * @type {angular.Module}
   *
   * récupération de notre module validationDocumentaire.
   */
  var module = angular.module('validationDocumentaire');

  module.factory('validationDocumentaireService', ['validationDocumentaireSettings', '$http', function(validationDocumentaireSettings, $http) {

    var factory = {};

    /**
     * Insérer une nouvelle validation documentaire en base de données
     * Renvoie le dernier id inséré en base de données
     */
    factory.insert = function(datas) {
      //console.log(datas);
      var url = validationDocumentaireSettings.webservicesBaseUrl + 'validationDocumentaireInsert';
      return $http.post(url, datas).then(function(response) {
        return response.data.result;
      });
    };

    /**
     * Insérer une nouvelle validation documentaire en base de données
     * Renvoie le dernier id inséré en base de donnée
     */
    factory.insertDestinataire = function(datas) {
      var url = validationDocumentaireSettings.webservicesBaseUrl + 'validationDocumentaireDestinataireInsert';
      return $http.post(url, datas).then(function(response) {
        return response.data.result;
      });
    };

    /**
     * Notification mail
     */
    factory.sendEmailToDestinaires = function(datas) {
      var url = validationDocumentaireSettings.webservicesBaseUrl + 'validationDocumentaireSendEmailToDestinaires';
      return $http.post(url, datas).then(function(response) {
        return response.data.result;
      });
    }

    // aller chercher la liste des fichiers pour chaque demande puis l'injecter
    // dans nos résultat de validation documentaire
    // @return promise
    factory.getFiles = function(validationDocumentaires) {

      // trouver les ids des validationDocumentaires passées en paramètre
      var ids = [];
      angular.forEach(validationDocumentaires, function(value, key) {
        ids.push(value.id);
      });

      return $http.get(validationDocumentaireSettings.webservicesBaseUrl + 'validationDocumentaireListFiles&ids=' + ids.join())
        .then(function(response) {

          angular.forEach(validationDocumentaires, function(value, key) {
            if (typeof response.data.result[value.id] != "undefined") {
              validationDocumentaires[key].files = response.data.result[value.id];
            }
          });
          return validationDocumentaires;
        });

    };

    // return Promise
    factory.getAll = function(queryParams) {
      // récupérer la liste complète des entrées trouvée dans la base de données.
      var url = validationDocumentaireSettings.webservicesBaseUrl + 'validationDocumentaireGetAll';
      return $http.get(url, {
          params: {
            queryParams: queryParams
          }
        })
        .then(function(response) {
          // fetch corresponding file if we got results.
          // Else simply return result to next promise.
          if (response.data.result) {
            return factory.getFiles(response.data.result);
          }
          return response.data.result;
        })
        .then(function(validationDocumentaires) {
          return validationDocumentaires;
        });

    };

    factory.countResults = function(queryParams) {
      // récupérer la liste complète des entrées trouvée dans la base de données.
      var url = validationDocumentaireSettings.webservicesBaseUrl + 'validationDocumentaireGetAll';
      return $http.get(url, {
          params: {
            queryParams: queryParams,
            isCountQuery: 1
          }
        })
        .then(function(response) {
          return response.data.result;
        });
    };

    factory.getStates = function() {
      return $http.get(validationDocumentaireSettings.webservicesBaseUrl + 'validationDocumentaireStatesGetAll')
        .then(function(response) {
          return response.data.result;
        });
    };

    factory.getDestinataires = function(id) {
      return $http.get(validationDocumentaireSettings.webservicesBaseUrl + 'validationDocumentaireGetDestinataires&id=' + parseInt(id))
        .then(function(response) {
          return response.data.result;
        });
    };

    factory.insertComment = function(comment) {
      var url = validationDocumentaireSettings.webservicesBaseUrl + 'validationDocumentaireCommentInsert';
      return $http.post(url, comment).then(function(response) {
        return response.data.result;
      });
    }

    factory.deleteComment = function(comment) {
      var url = validationDocumentaireSettings.webservicesBaseUrl + 'validationDocumentaireCommentDelete';
      return $http.post(url, comment).then(function(response) {
        return response.data.result;
      });
    }

    factory.getComments = function(validationDocumentaireId) {
      // récupérer la liste complète des entrées trouvée dans la base de données.
      var url = validationDocumentaireSettings.webservicesBaseUrl + 'validationDocumentaireCommentGetAll';
      return $http.get(url, {
          params: {
            id: validationDocumentaireId
          }
        })
        .then(function(response) {
          return response.data.result;
        });
    }

    return factory;

  }]);


})();