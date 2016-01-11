/**
 * Controller pour la liste des validations documentaires
 */
 (function() {

  "use strict";

  angular.module('validationDocumentaire').controller("validationDocumentaireListeController", ['$state', '$stateParams', '$q', '$timeout', 'validationDocumentaireService', '$scope', '$rootScope', 'validationDocumentaireSettings', function($state, $stateParams, $q, $timeout, validationDocumentaireService, $scope, $rootScope, validationDocumentaireSettings) {

    // initialisation des variables utilisés dans le template.
    $scope.validationDocumentaires = [];
    $scope.filtres = {};

    // options pour le nombre de résultats par page:
    $scope.resultsPerPageOptions = [{
      value: 10,
      label: 10
    }, {
      value: 25,
      label: 25
    }, {
      value: 50,
      label: 50
    }];
    
    // par défaut, on choisit la première option pour le nombre de résultats par page.
    $scope.resultsPerPageOptionsSelected = $scope.resultsPerPageOptions[0];

    // on va chercher la liste des validation documentaires pour le premier affichage
    loadResults();

    // On s'incrit à l'évènement d'insertion d'une nouvelle validation documentaire en base de données.
    // Quand un nouvelle validation documentaire sera entrée, le code suivant sera exécuté :
    $rootScope.$on('validationDocumentaireAfterInsert', function(event, data) {
      loadResults();
    });

    function loadResults(){

      var queryParams = $stateParams;
      queryParams.from = ($stateParams.page * $scope.resultsPerPageOptionsSelected.value) - $scope.resultsPerPageOptionsSelected.value;
      queryParams.limit = $scope.resultsPerPageOptionsSelected.value;

      // on demande au webservice de nous renvoyer le résultat correspondant à ces filtres.
      validationDocumentaireService.getAll(queryParams).then(function(validationDocumentaires) {
        // mise à jour de la liste avec les résulats.
        $scope.validationDocumentaires = validationDocumentaires;

        // on va chercher la liste des destinataires. 
        $q.all(validationDocumentaires.map(function(validationDocumentaire){
          return validationDocumentaireService.getDestinataires(validationDocumentaire.id);
        }))
        .then(function(destinataires) {
          angular.forEach(validationDocumentaires, function(validationDocumentaire, key) {
            validationDocumentaires[key].destinataires = destinataires[key];
          });
          $scope.validationDocumentaires = validationDocumentaires;
        });

      });

      // compter le nombre de résultat pour a requête demandée.
      validationDocumentaireService.countResults($scope.filtres).then(function(number) {
        console.log(number);
        $scope.numberOfResults = number;
        $scope.numberOfPages = Math.ceil($scope.numberOfResults / $scope.resultsPerPageOptionsSelected.value);
        $scope.pages = new Array($scope.numberOfPages);
      });

    }


    // changer le nombre de résultats par page.
    $scope.changeResultsPerPage = function() {
      var queryParams = $scope.filtres;
      queryParams.limit = $scope.resultsPerPageOptionsSelected.value;
      loadResults(queryParams);
    };

    // on appelle le webservice pour avoir la liste de tous les états de validation documentaires.
    validationDocumentaireService.getStates().then(function(datas) {
      $scope.etats = datas;
    });

    $scope.submitSearch = function() {
      var queryParams = $scope.filtres;
      // on ramène à la première page des résultats par défaut.
      queryParams.page = 1;
      // on reload notre controlleur avec les nouveaux paramètres de l'url.
      // location permet de mettre à jour l'url et pas seulement la variable $stateParams.
      $state.go('validationDocumentaireListe', queryParams, {location: true});
    };

  }]);

})();
