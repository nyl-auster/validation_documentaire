/**
 * Définit des routes pour  notre application Angular
 * On associe une url à un template / controleur
 * Voir ici https://github.com/angular-ui/ui-router
 */
(function() {

  "use strict";

  // récupération du module crée dans app.js
  var module = angular.module('validationDocumentaire');

  module.config(['$stateProvider', '$urlRouterProvider', 'validationDocumentaireSettings', function ($stateProvider, $urlRouterProvider, validationDocumentaireSettings) {

    // redirection sur la page d'accueil de l'application angular si aucune
    // route trouvée. Cela correspond dans notre cas à l'url "fr/views/approvals.html#/" puisque nous
    // avons branché notre application angular à cet endroit.
    $urlRouterProvider.otherwise('/');

    // liste des demandes. Page d'accueil par défaut pour le moment
    // accessible via http://new.picdomeo.fr/fr/views/approvals.html#/
    $stateProvider.state('validationDocumentaireListe', {
      url: '/?page&description&state_id&id_utilisateur&date_cloture&limit&destinataire&emetteur&archived',
      templateUrl: validationDocumentaireSettings.appPath + "/views/validationDocumentaireListe.html",
      params:{
        page:'1'
      }
    });

    // route pour afficher le formulaire demandé en dehors de la popup, au cas où
    // accessible via /fr/views/approvals.html#/form
    $stateProvider.state('validationDocumentaireForm', {
      url: '/form',
      templateUrl: validationDocumentaireSettings.appPath + "/views/validationDocumentaireForm.html"
    });


  }]);

})();
