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
    // route trouvée. Cela correspond dans notre cas à l'url fr/Validation/ puisque nous
    // avons branché notre application angular à cet endroit.
    $urlRouterProvider.otherwise('/');

    // liste des demandes. Page d'accueil par défaut pour le moment
    $stateProvider.state('validationDocumentaireListe', {
      url: '/?page&keywords&state_id&id_utilisateur&date',
      templateUrl: validationDocumentaireSettings.appPath + "/views/validationDocumentaireListe.html",
      params:{
        page:'1',
        state_id: '',
        destinataire: '',
        id_utilisateur: '',
        date: ''
      }
    });

    // route pour afficher le formulaire demande en dehors de la opup
    $stateProvider.state('validationDocumentaireForm', {
      url: '/form',
      templateUrl: validationDocumentaireSettings.appPath + "/views/validationDocumentaireForm.html"
    });

    /**
     * Route d'exemple, serait accessible via fr/Validation/#/hello-world
     */
    /*
       $stateProvider.state('helloWorld', {
       url: '/hello-world',
       templateUrl: validationDocumentaireSettings.appPath + "/views/helloWorld.html"
       });
       */

  }]);

})();
