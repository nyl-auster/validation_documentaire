/**
 * Controller pour la liste des validations documentaires
 */
(function() {

  "use strict";

  angular.module('validationDocumentaire').controller("validationDocumentaireListeController", ['$filter', '$state', '$stateParams', '$q', '$timeout', 'validationDocumentaireService', '$scope', '$rootScope', 'validationDocumentaireSettings', function($filter, $state, $stateParams, $q, $timeout, validationDocumentaireService, $scope, $rootScope, validationDocumentaireSettings) {

    // contiendra la liste des validation Documentaires
    $scope.validationDocumentaires = [];

    // options pour choisir le nombre de résultats par page:
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

    // si l'utilisateur a déjà choisi le nombre de résultat par pages qu'il préfère,
    // on le récupère de le localStorage du navigateur.
    var item = localStorage.getItem('validationDocumentaireListeNumberItemsPerPage');
    if (item) {
      $scope.resultsPerPageOptionsSelected = JSON.parse(item);
    } else {
      // sinon on prend la première option parmi notre liste d'options ci-dessus
      $scope.resultsPerPageOptionsSelected = $scope.resultsPerPageOptions[0];
    }


    // on va chercher la liste des validation documentaires pour le premier affichage
    // en utilisant les arguments en provenant de l'url / de l'état 
    // @see appRouter.js
    loadResults($stateParams);

    // On souhaite rafraichir la liste des résultats une fois une nouvelle demande créee.
    // 
    // On s'incrit à l'évènement d'insertion d'une nouvelle validation documentaire en base de données.
    // Quand un nouvelle validation documentaire sera entrée, la function sera exécutée.
    $rootScope.$on('validationDocumentaireAfterInsert', function(event, data) {
      loadResults($stateParams);
    });

    // met à jour la liste de résultats
    function loadResults(queryParams) {

      var queryParams = typeof queryParams !== 'undefined' ? queryParams : {};

      var queryCountParams = queryParams;

      if (typeof queryParams.limit === 'undefined') {
        queryParams.limit = $scope.resultsPerPageOptionsSelected.value;
      }
      // on créer les paramètres from et limit pour la requete sql du webservice
      queryParams.from = (queryParams.page * queryParams.limit) - queryParams.limit;

      // on demande au webservice de nous renvoyer le résultat correspondant au filtres mais sans le from et le limit
      validationDocumentaireService.getAll(queryParams).then(function(validationDocumentaires) {
        // mise à jour de la liste avec les résulats.
        $scope.validationDocumentaires = validationDocumentaires;

        // par défault les filtres de recherche ont la valeur de la recherche précédente.
        $scope.filtres = queryParams;
        console.log(queryParams);

        if (typeof queryParams.date_cloture !== "undefined") {
          $scope.filtres.date_cloture = new Date(queryParams.date_cloture);
        }

        var selectedOption = $filter('filter')($scope.resultsPerPageOptions, {
          value: queryParams.limit
        })[0];

        $scope.resultsPerPageOptionsSelected = selectedOption;

        // sauvegarder le nombre de résultats par page choisi par l'utilisateur
        localStorage.setItem('validationDocumentaireListeNumberItemsPerPage', JSON.stringify(selectedOption, null, 2));

      });

      // compter le nombre de résultat pour a requête demandée.
      validationDocumentaireService.countResults(queryCountParams).then(function(number) {
        $scope.numberOfResults = number;
        $scope.numberOfPages = Math.ceil($scope.numberOfResults / queryParams.limit);
        $scope.pages = new Array($scope.numberOfPages);
      });

    }

    // on appelle le webservice pour avoir la liste de tous les états de validation documentaires,
    // pour construire la liste déroulante des choix d'états.
    validationDocumentaireService.getStates().then(function(datas) {
      $scope.etats = datas;
    });

    // appelée lorsqu'on clique sur le bouton submit du moteur de recherche 
    // recharge ce controlleur en mettant à jour les paramètres de l'url.
    $scope.submitSearch = function() {

      var queryParams = $scope.filtres;

      // set date_cloture as a string for sql query
      // le datePicker nus envoie pour sa part un objet date.
      console.log(queryParams.date_cloture);
      if (typeof queryParams.date_cloture !== "undefined" && queryParams.date_cloture !== null) {
        queryParams.date_cloture = $filter('date')(new Date(queryParams.date_cloture), "yyyy-MM-dd");
      }
      queryParams.page = 1;
      console.log(queryParams.date_cloture);

      // on actualise notre état et les paramètres de l'url pour mettre à jour la liste.
      $state.go('validationDocumentaireListe', queryParams, {location: "replace"});

    };

    // fonction pour changer le nombre de résultats par page.
    $scope.changeResultsPerPage = function() {
      var queryParams = $scope.filtres;
      queryParams.page = 1; // on ramene à la premiere page.
      queryParams.limit = $scope.resultsPerPageOptionsSelected.value;
      $state.go('validationDocumentaireListe', queryParams, {
        location: true
      });
    };

  }]);

})();