/**
 * Le controller principale de l'application, appelé dans vue.php
 */
(function() {

  "use strict";

  angular.module('validationDocumentaire').controller("validationDocumentaireCommentsController", ['$http', '$location', '$rootScope', '$scope', 'userService', 'validationDocumentaireSettings', 'validationDocumentaireService', function($http, $location, $rootScope, $scope, userService, validationDocumentaireSettings, validationDocumentaireService) {

    // passera à true quand un commentaire sera en cours d'enregistrement
    // pour qu'on ne puisse pas cliquer sur le bouton de soumission à ce
    // moment là.
    $scope.insertingComment = false;


    // object commentaire qui sera envoyé aux webservices
    $scope.comment = {};
    $scope.comment.message = '';
    $scope.comment.validationDocumentaireEtat = '';
    $scope.comment.poste_le = '';
    $scope.comment.id_validation_documentaire = $scope.validationDocumentaireId = $rootScope.getQueryParam('id');

    // POUR CHARLIE ! :)
    $http.get('/ws/approvals.webservices.php?service=getInfosAfterComment&id=' + $rootScope.getQueryParam('id'))
      .then(function(response) {

        $scope.statut 			= response.data.result.statut;
		$scope.nbValidations 	= response.data.result.nbValidations;
		$scope.tauxValidation 	= response.data.result.tauxValidation;
        console.log(response);

      });

    userService.getCurrentUser().then(function(user) {
      $scope.comment.id_utilisateur = user.id;
      $scope.comment.utilisateur_nom = user.nom;
      $scope.comment.utilisateur_prenom = user.prenom;
      $scope.comment.avatar = user.avatar;
    });

    // charger les commentaires pour la premire fois
    validationDocumentaireService.getComments($scope.validationDocumentaireId).then(function(comments) {
      $scope.comments = comments;
    });

    $scope.commentDelete = function(comment) {
      validationDocumentaireService.deleteComment(comment).then(function() {
        // rafraichir les commentaires
        validationDocumentaireService.getComments($scope.validationDocumentaireId).then(function(comments) {
          $scope.comments = comments;
        });
      });
    };

    $scope.commentInsert = function(validationDocumentaireEtat) {
      $scope.insertingComment = true;
      $scope.comment.validationDocumentaireEtat = validationDocumentaireEtat;
      $scope.comment.poste_le = Date.now();
      validationDocumentaireService.insertComment($scope.comment)

      .then(function() {
        $scope.comment.message = '';
        // rafraichir les commentaires
        return validationDocumentaireService.getComments($scope.validationDocumentaireId)
      })

      // mettre à jour la liste des commentaires affichés
      .then(function(comments) {



        $scope.comments = comments;
        // on indique que l'insertion du nouveau commentaire est terminée
        $scope.insertingComment = false;

        // pour Charlie : on met à nouveau à jour le status 
        $http.get('/ws/approvals.webservices.php?service=getInfosAfterComment&id=' + $rootScope.getQueryParam('id'))
          .then(function(response) {
            console.log(response);
            $scope.statut 			= response.data.result.statut;
			$scope.nbValidations 	= response.data.result.nbValidations;
			$scope.tauxValidation 	= response.data.result.tauxValidation;

          });

      });

    };

  }]);

})();